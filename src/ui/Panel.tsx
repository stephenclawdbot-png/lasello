import type { ReactNode } from "react";
import type { Listing } from "../data/listings";
import { perSqm, TYPE_LABELS, FURNISHED_LABELS } from "../data/listings";
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
  const isStructure = listing.type === "condo" || listing.type === "house";
  let medianChip: ReactNode | null = null;
  const pct = cityMedian && cityMedian > 0 ? Math.round(((psqm - cityMedian) / cityMedian) * 100) : 0;
  if (Math.abs(pct) >= 5) {
    const below = pct <= 0;
    medianChip = (
      <span className={`median-chip ${below ? "below" : "above"}`}>
        {below ? `${pct}%` : `+${pct}%`} vs {listing.city} median
      </span>
    );
  }

  const q = `${listing.city}, Philippines`;
  return (
    <aside className="detail">
      <button className="detail-close" onClick={onClose} aria-label="Close">
        ✕
      </button>

      <div className="detail-kicker">
        <span className="src-badge">
          <span className="dot" style={{ background: src.color }} />
          {src.name}
        </span>
        <span className="detail-type">{TYPE_LABELS[listing.type]}</span>
        {listing.verified && <span className="verified-chip">✓ Verified</span>}
      </div>

      <h2>{listing.name}</h2>
      <p className="detail-loc">
        {listing.address ? `${listing.address} · ` : ""}
        {listing.city}, {listing.region}
      </p>

      <div className="detail-price">
        {fmtPeso(listing.price, monthly)} <small>{monthly ? "/ month" : "total"}</small>
      </div>

      <div className="detail-psqm">
        <span>{fmtPsqm(psqm)}</span>
        {medianChip}
      </div>

      {listing.description && <p className="detail-desc">{listing.description}</p>}

      <div className="spec-grid">
        {isStructure ? (
          <>
            <div className="spec">
              <b>{listing.beds}</b>
              <span>Bed{listing.beds === 1 ? "" : "s"}</span>
            </div>
            <div className="spec">
              <b>{listing.baths}</b>
              <span>Bath{listing.baths === 1 ? "" : "s"}</span>
            </div>
            <div className="spec">
              <b>{listing.sqm.toLocaleString("en-PH")}</b>
              <span>m²</span>
            </div>
            <div className="spec">
              <b>{listing.parking}</b>
              <span>Parking</span>
            </div>
            <div className="spec span-2">
              <b>{FURNISHED_LABELS[listing.furnished]}</b>
              <span>Furnishing</span>
            </div>
          </>
        ) : (
          <>
            <div className="spec">
              <b>{listing.sqm.toLocaleString("en-PH")}</b>
              <span>m² lot area</span>
            </div>
            <div className="spec span-2">
              <b>Raw land</b>
              <span>No structure</span>
            </div>
          </>
        )}
      </div>

      {listing.features.length > 0 && (
        <div className="feature-row">
          {listing.features.map((f) => (
            <span key={f} className="feature-chip">
              {f}
            </span>
          ))}
        </div>
      )}

      <div className="trust-row">
        <span className="trust-pill">Listed {freshnessLabel(listing.freshDays)}</span>
        <span className="trust-pill">{TYPE_LABELS[listing.type]}</span>
        <span className="trust-pill">Via {src.name}</span>
      </div>

      <a className="cta" href={src.link(q)} target="_blank" rel="noopener noreferrer">
        View on {src.name} ↗
      </a>
      <p className="cta-note">
        Lasello links you to the original portal — we never copy listings or hide the source.
      </p>
    </aside>
  );
}
