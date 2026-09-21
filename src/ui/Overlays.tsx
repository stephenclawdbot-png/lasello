import { SOURCE_LIST } from "../data/sources";
import { TIER_COLORS } from "../lib/stats";
import type { ColorBy } from "./Filters";

export function TopBar({ count, sourceCount }: { count: number; sourceCount: number }) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brand-word">
          LASELL<em>O</em>
        </span>
        <span className="brand-tag">Every Philippine listing. One map. Honest math.</span>
      </div>
      <div className="topbar-spacer" />
      <div className="chip-row">
        <span className="chip">
          <b>{count}</b> listings
        </span>
        <span className="chip">
          <b>{sourceCount}</b> portals indexed
        </span>
        <span className="chip">₱ normalized / m²</span>
      </div>
    </header>
  );
}

export function Legend({ colorBy }: { colorBy: ColorBy }) {
  return (
    <div className="legend glass">
      {colorBy === "price" ? (
        <>
          <span className="legend-title">Price / m²</span>
          <div className="legend-scale">
            <i style={{ background: TIER_COLORS.low }} />
            <span>value</span>
            <i style={{ background: TIER_COLORS.mid }} />
            <span>mid</span>
            <i style={{ background: TIER_COLORS.high }} />
            <span>premium</span>
          </div>
        </>
      ) : (
        <>
          <span className="legend-title">Sources</span>
          <div className="legend-scale">
            {SOURCE_LIST.map((s) => (
              <span key={s.key} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <i style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
                {s.name}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export function DemoPill({ count }: { count: number }) {
  return (
    <div className="demo-pill glass">
      DEMO SEED · <b>{count}</b> listings · real ingestion via /adapters
    </div>
  );
}