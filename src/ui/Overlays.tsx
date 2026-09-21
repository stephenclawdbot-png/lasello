import type { Feed } from "../lib/live";
import { agoLabel } from "../lib/live";
import { TIER_COLORS } from "../lib/stats";
import { HomeMark, SearchIcon } from "./icons";

export function Header({
  q,
  onSearch,
  feed,
}: {
  q: string;
  onSearch: (q: string) => void;
  feed: Feed;
}) {
  return (
    <header className="header">
      <a className="logo" href="/">
        <span className="logo-mark">
          <HomeMark />
        </span>
        <span className="logo-word">Lasello</span>
        <span className="logo-tag">Philippine property, all portals in one place</span>
      </a>

      <div className="header-search">
        <SearchIcon />
        <input
          placeholder="Search city, area or listing — try “Cebu” or “BGC”"
          value={q}
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      <div className="header-meta">
        <span className="sync-badge" title={feed.demo ? "Showing curated demo data until live portal sync is enabled" : "Aggregated feed from portal connectors"}>
          <span className={`sync-dot ${feed.demo ? "demo" : ""}`} />
          {feed.demo ? "Demo preview" : agoLabel(feed.generatedAt)}
        </span>
      </div>
    </header>
  );
}

export function Legend() {
  return (
    <div className="legend">
      <span>₱/m²</span>
      <div className="legend-scale">
        <i style={{ background: TIER_COLORS.low }} />
        <span>value</span>
        <i style={{ background: TIER_COLORS.mid }} />
        <span>mid</span>
        <i style={{ background: TIER_COLORS.high }} />
        <span>premium</span>
      </div>
    </div>
  );
}

export function Disclaimer({ feed }: { feed: Feed }) {
  const live = feed.sources.filter((s) => s.status === "live");
  return (
    <p className="disclaimer">
      {feed.demo
        ? "You're viewing a curated preview with market-plausible prices. Live portal sync is rolling out — every listing will always link back to its original portal."
        : `Aggregated from ${live.length} portal${live.length === 1 ? "" : "s"}, ${agoLabel(feed.generatedAt)}. `}
      {" "}Lasello never copies listings — we show the honest ₱/m² math and send you to the source.
    </p>
  );
}
