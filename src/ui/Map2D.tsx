import { useEffect, useMemo, useRef, useState } from "react";
import type { Listing } from "../data/listings";
import { perSqm } from "../data/listings";
import { tierOfRank, TIER_COLORS, fmtPeso } from "../lib/stats";
import type { Island } from "../lib/geo";

/** Flat equirectangular projection fitted to the PH archipelago. */
const LNG_MIN = 116.5;
const LNG_MAX = 127.2;
const LAT_MIN = 4.4;
const LAT_MAX = 21.4;
const S = 40;
const W = Math.round((LNG_MAX - LNG_MIN) * S);
const H = Math.round((LAT_MAX - LAT_MIN) * S);
const K_MIN = 1;
const K_MAX = 18;
/** Below this zoom, listings collapse into per-city cluster bubbles. */
const CLUSTER_K = 3.4;
/** From this zoom, pins render as price pills instead of dots. */
const PILL_K = 5.5;
/** Hard cap on individual pins rendered at once. */
const MAX_PINS = 400;

const px = (lng: number) => (lng - LNG_MIN) * S;
const py = (lat: number) => (LAT_MAX - lat) * S;

const CITY_LABELS: [string, number, number][] = [
  ["Manila", 14.6, 120.98],
  ["Baguio", 16.41, 120.6],
  ["Cebu", 10.32, 123.9],
  ["Iloilo", 10.72, 122.56],
  ["Bacolod", 10.68, 122.95],
  ["Tacloban", 11.24, 125.0],
  ["Puerto Princesa", 9.74, 118.74],
  ["Davao", 7.07, 125.61],
  ["Cagayan de Oro", 8.48, 124.65],
  ["Zamboanga", 6.92, 122.08],
  ["Legazpi", 13.14, 123.74],
];

interface View {
  cx: number;
  cy: number;
  k: number;
}

const HOME: View = { cx: W / 2, cy: H / 2, k: 1 };

const clampView = (v: View): View => {
  const k = Math.min(K_MAX, Math.max(K_MIN, v.k));
  return {
    k,
    cx: Math.min(W - W / (2 * k), Math.max(W / (2 * k), v.cx)),
    cy: Math.min(H - H / (2 * k), Math.max(H / (2 * k), v.cy)),
  };
};

function lowerBound(a: number[], v: number): number {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (a[m] <= v) lo = m + 1;
    else hi = m;
  }
  return lo;
}

export default function Map2D({
  islands,
  listings,
  selectedId,
  onSelect,
}: {
  islands: Island[];
  listings: Listing[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [view, setView] = useState<View>(HOME);
  const viewRef = useRef(view);
  viewRef.current = view;
  const animRef = useRef<number>(0);
  const drag = useRef<{ x: number; y: number; cx: number; cy: number; moved: boolean } | null>(null);

  const paths = useMemo(
    () =>
      islands.map((island) =>
        island.shape
          .map(
            (ring) =>
              `M${ring.points.map(([lng, lat]) => `${px(lng).toFixed(1)},${py(lat).toFixed(1)}`).join("L")}Z`
          )
          .join("")
      ),
    [islands]
  );

  // Fast percentile-tier lookup: sorted ₱/m² per tenure cohort + binary search.
  const tierColorOf = useMemo(() => {
    const sale = listings.filter((l) => l.tenure === "sale").map(perSqm).sort((a, b) => a - b);
    const rent = listings.filter((l) => l.tenure === "rent").map(perSqm).sort((a, b) => a - b);
    return (l: Listing) => {
      const arr = l.tenure === "sale" ? sale : rent;
      const rank = arr.length ? lowerBound(arr, perSqm(l)) / arr.length : 0.5;
      return TIER_COLORS[tierOfRank(rank)];
    };
  }, [listings]);

  // Zoom-dependent grid clusters: nearby cities merge at low zoom and split
  // apart as you zoom in, so bubbles never pile on top of each other.
  const kq = Math.max(1, Math.round(view.k * 2) / 2);
  const clusters = useMemo(() => {
    const cell = 64 / kq;
    const m = new Map<string, { x: number; y: number; count: number }>();
    for (const l of listings) {
      const x = px(l.lng);
      const y = py(l.lat);
      const key = `${Math.floor(x / cell)}:${Math.floor(y / cell)}`;
      const c = m.get(key);
      if (c) {
        c.x += x;
        c.y += y;
        c.count++;
      } else {
        m.set(key, { x, y, count: 1 });
      }
    }
    const arr = [...m.entries()].map(([key, c]) => ({ key, x: c.x / c.count, y: c.y / c.count, count: c.count }));
    const max = Math.max(1, ...arr.map((c) => c.count));
    return { arr, max };
  }, [listings, kq]);

  const flyTo = (target: View) => {
    cancelAnimationFrame(animRef.current);
    const from = { ...viewRef.current };
    const to = clampView(target);
    const t0 = performance.now();
    const dur = 420;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      setView({
        cx: from.cx + (to.cx - from.cx) * e,
        cy: from.cy + (to.cy - from.cy) * e,
        k: from.k + (to.k - from.k) * e,
      });
      if (p < 1) animRef.current = requestAnimationFrame(step);
    };
    animRef.current = requestAnimationFrame(step);
  };

  // Fly to the selected listing (card click or pin click).
  useEffect(() => {
    if (!selectedId) return;
    const l = listings.find((x) => x.id === selectedId);
    if (l) flyTo({ cx: px(l.lng), cy: py(l.lat), k: Math.max(viewRef.current.k, 7) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  // Non-passive wheel zoom toward the cursor.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cancelAnimationFrame(animRef.current);
      const v = viewRef.current;
      const rect = svg.getBoundingClientRect();
      const scale = Math.exp(-e.deltaY * 0.0016);
      const k = Math.min(K_MAX, Math.max(K_MIN, v.k * scale));
      const fx = (e.clientX - rect.left) / rect.width - 0.5;
      const fy = (e.clientY - rect.top) / rect.height - 0.5;
      const wx = v.cx + fx * (W / v.k);
      const wy = v.cy + fy * (H / v.k);
      setView(clampView({ k, cx: wx - fx * (W / k), cy: wy - fy * (H / k) }));
    };
    svg.addEventListener("wheel", onWheel, { passive: false });
    return () => svg.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    cancelAnimationFrame(animRef.current);
    const v = viewRef.current;
    drag.current = { x: e.clientX, y: e.clientY, cx: v.cx, cy: v.cy, moved: false };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const d = drag.current;
    const svg = svgRef.current;
    if (!d || !svg) return;
    const dx = e.clientX - d.x;
    const dy = e.clientY - d.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
    const upp = W / viewRef.current.k / svg.getBoundingClientRect().width;
    setView(clampView({ ...viewRef.current, cx: d.cx - dx * upp, cy: d.cy - dy * upp }));
  };

  // Deselect ONLY on a genuine stationary click on the sea — never when the
  // pointer merely leaves the map (that was closing the detail panel).
  const onPointerUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d && !d.moved) onSelect(null);
  };

  const onPointerLeave = () => {
    drag.current = null;
  };

  const { cx, cy, k } = view;
  const inv = 1 / k;
  const activeId = hoverId ?? selectedId;
  const clustered = k < CLUSTER_K;

  // Viewport culling: only render pins inside the current view (+margin).
  const inView = useMemo(() => {
    if (clustered) return [];
    const mx = W / (2 * k) + 30 / k;
    const my = H / (2 * k) + 30 / k;
    const rows = listings.filter((l) => Math.abs(px(l.lng) - cx) < mx && Math.abs(py(l.lat) - cy) < my);
    return rows.length > MAX_PINS ? rows.slice(0, MAX_PINS) : rows;
  }, [listings, clustered, cx, cy, k]);

  const showPills = k >= PILL_K;

  // Greedy declutter: a pin renders as a price pill only if its pill wouldn't
  // overlap one already placed; crowded neighbors fall back to dots.
  const pillIds = useMemo(() => {
    const set = new Set<string>();
    if (!showPills) return set;
    const placed: { x1: number; x2: number; y1: number; y2: number }[] = [];
    for (const l of inView) {
      const label = fmtPeso(l.price, l.tenure === "rent");
      const w = (label.length * 7.4 + 22) / k;
      const h = 32 / k;
      const x = px(l.lng);
      const y = py(l.lat);
      const box = { x1: x - w / 2, x2: x + w / 2, y1: y - h / 2, y2: y + h / 2 };
      let hit = false;
      for (const b of placed) {
        if (box.x1 < b.x2 && box.x2 > b.x1 && box.y1 < b.y2 && box.y2 > b.y1) {
          hit = true;
          break;
        }
      }
      if (!hit) {
        placed.push(box);
        set.add(l.id);
      }
    }
    return set;
  }, [inView, showPills, k]);

  return (
    <>
      <svg
        ref={svgRef}
        className="map2d"
        viewBox={`${cx - W / (2 * k)} ${cy - H / (2 * k)} ${W / k} ${H / k}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Map of Philippine property listings"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerLeave}
      >
        <defs>
          <filter id="island-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="1.4" stdDeviation="2.2" floodColor="#4a7a8c" floodOpacity="0.28" />
          </filter>
        </defs>

        <g filter="url(#island-shadow)">
          {paths.map((d, i) => (
            <path key={i} d={d} className="map2d-island" />
          ))}
        </g>

        {CITY_LABELS.map(([name, lat, lng]) => (
          <text
            key={name}
            className="map2d-city"
            transform={`translate(${px(lng)} ${py(lat)}) scale(${inv})`}
            y={-10}
          >
            {name}
          </text>
        ))}

        {clustered
          ? clusters.arr.map((c) => {
              const r = 13 + 15 * Math.sqrt(c.count / clusters.max);
              return (
                <g
                  key={c.key}
                  className="map2d-cluster"
                  transform={`translate(${c.x.toFixed(1)} ${c.y.toFixed(1)}) scale(${inv})`}
                  onPointerUp={(e) => {
                    if (drag.current?.moved) return;
                    e.stopPropagation();
                    drag.current = null;
                    flyTo({ cx: c.x, cy: c.y, k: Math.min(K_MAX, Math.max(viewRef.current.k * 2.6, 4)) });
                  }}
                >
                  <circle r={r} className="map2d-cluster-halo" />
                  <circle r={r - 3.5} className="map2d-cluster-core" />
                  <text y={4.5} className="map2d-cluster-count">
                    {c.count}
                  </text>
                </g>
              );
            })
          : [...inView]
              .sort((a, b) => {
                const rank = (l: Listing) => (l.id === activeId ? 2 : pillIds.has(l.id) ? 1 : 0);
                return rank(a) - rank(b);
              })
              .map((l) => {
              const color = tierColorOf(l);
              const isActive = l.id === activeId;
              const isSelected = l.id === selectedId;
              const pill = (showPills && pillIds.has(l.id)) || isActive;
              const label = fmtPeso(l.price, l.tenure === "rent");
              const pw = label.length * 7.4 + 18;
              return (
                <g
                  key={l.id}
                  className={`map2d-pin ${isActive ? "active" : ""}`}
                  transform={`translate(${px(l.lng).toFixed(1)} ${py(l.lat).toFixed(1)}) scale(${inv})`}
                  onMouseEnter={() => setHoverId(l.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onPointerUp={(e) => {
                    if (drag.current?.moved) return;
                    e.stopPropagation();
                    drag.current = null;
                    onSelect(l.id);
                  }}
                >
                  {isSelected && <circle r={16} className="map2d-ring" style={{ stroke: color }} />}
                  {pill ? (
                    <g>
                      <rect x={-pw / 2} y={-13} width={pw} height={26} rx={13} className={`map2d-pill ${isSelected ? "sel" : ""}`} />
                      <circle cx={-pw / 2 + 13} cy={0} r={4.5} fill={color} />
                      <text x={6} y={4.5} className={`map2d-pill-text ${isSelected ? "sel" : ""}`}>
                        {label}
                      </text>
                    </g>
                  ) : (
                    <circle r={6.5} fill={color} stroke="#fff" strokeWidth={2} />
                  )}
                </g>
              );
            })}
      </svg>

      <div className="map-controls">
        <button aria-label="Zoom in" onClick={() => flyTo({ ...viewRef.current, k: viewRef.current.k * 1.7 })}>
          +
        </button>
        <button aria-label="Zoom out" onClick={() => flyTo({ ...viewRef.current, k: viewRef.current.k / 1.7 })}>
          −
        </button>
        <button aria-label="Reset view" onClick={() => flyTo(HOME)}>
          ⌂
        </button>
      </div>
    </>
  );
}
