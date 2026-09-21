import type { ReactNode } from "react";
import type { Listing } from "../data/listings";
import { perSqm, TYPE_LABELS } from "../data/listings";
import { SOURCES } from "../data/sources";
import { fmtPeso, fmtPsqm, freshnessLabel } from "../lib/stats";

export default function Panel({
  listing,
  cityMedian,
  onClose,
}: {
  listing: Listing;
  cityMedian?: number;
  onClose: () => void;
}) {
  const src = SOURCES[listing.source];
  const psqm = perSqm(listing);
  const monthly = listing.tenure === "rent";
  let medianChip: ReactNode | null = null;
  if (cityMedian && cityMedian > 0) {
    const pct = Math.round(((psqm - cityMedian) / cityMedian) * 100);
    const below = pct <= 0;
    medianChip = (
      <span className={`median-chip ${below ? "below" : "above"}`}>
        {below ? `${pct}%` : `+${pct}%`} vs {listing.city} median
      </span>
    );
  }

  const q = `${listing.city}, Philippines`;
  return (
    <aside className="panel glass">
      <button className="panel-close" onClick={onClose} aria-label="Close">
        ✕
      </button>

      <div className="panel-kicker">
        <span className="src-badge" style={{ background: src.color }}>
          {src.name}
        </span>
        <span>{TYPE_LABELS[listing.type]}</span>
      </div>

      <h2>{listing.name}</h2>
      <p className="panel-city">
        {listing.city}, {listing.region}
      </p>

      <div className="panel-price">
        {fmtPeso(listing.price, monthly)} <small>{monthly ? "/ month" : "total"}</small>
      </div>

      <div className="panel-psqm">
        <span className="psqm-val">{fmtPsqm(psqm)}</span>
        {medianChip}
      </div>

      <div className="spec-grid">
        <div className="spec">
          <b>{listing.beds === 0 ? "—" : listing.beds}</b>
          <span>Beds</span>
        </div>
        <div className="spec">
          <b>{listing.baths === 0 ? "—" : listing.baths}</b>
          <span>Baths</span>
        </div>
        <div className="spec">
          <b>{listing.sqm.toLocaleString("en-PH")}</b>
          <span>sqm</span>
        </div>
      </div>

      <div className="trust-row">
        {listing.verified && <span className="trust-pill ok">✓ Verified source</span>}
        <span className="trust-pill">{freshnessLabel(listing.freshDays)}</span>
        <span className="trust-pill">{listing.lat.toFixed(3)}°, {listing.lng.toFixed(3)}°</span>
      </div>

      <a className="cta" href={src.link(q)} target="_blank" rel="noopener noreferrer">
        View on {src.name} ↗
      </a>
      <p className="cta-note">
        Lasello links you to the original portal — we never copy listings or hide the source. Seed demo uses search
        templates until live ingestion lands.
      </p>
    </aside>
  );
}