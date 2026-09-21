import type { ReactNode } from "react";
import type { Listing } from "../data/listings";
import { perSqm, TYPE_LABELS, FURNISHED_LABELS, TURNOVER_LABELS, BROKER_LABELS } from "../data/listings";
import { SOURCES } from "../data/sources";
import { fmtPeso, fmtPsqm, freshnessLabel } from "../lib/stats";
import { completenessOf, completenessLabel, estAmortization, validatePrice } from "../lib/price";

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
  const isRent = listing.tenure === "rent";
  const complete = completenessOf(listing);
  const outlier = listing.outlier || validatePrice(listing) === "outlier";
  const amort = !monthly && listing.price >= 500_000 ? estAmortization(listing.price) : null;

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

  const rangeLabel =
    listing.priceMin != null && listing.priceMax != null
      ? `${fmtPeso(listing.priceMin, monthly)} – ${fmtPeso(listing.priceMax, monthly)}`
      : null;

  const q = `${listing.city}, Philippines`;
  const href = listing.url ?? src.link(q);
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
        {outlier && (
          <span className="outlier-chip" title="Price is plausible but far from this city's norm">
            ⚠ Price outlier
          </span>
        )}
      </div>

      <h2>{listing.name}</h2>
      <p className="detail-loc">
        {listing.address ? `${listing.address} · ` : ""}
        {listing.city}, {listing.region}
        {listing.geoPrecision === "city" ? " · city-level pin" : ""}
      </p>

      <div className="detail-price">
        {fmtPeso(listing.price, monthly)} <small>{monthly ? "/ month" : "total"}</small>
      </div>
      {rangeLabel && <p className="range-note">Asking range: {rangeLabel} — Lasello shows the midpoint.</p>}
      {amort != null && (
        <p className="range-note">
          Est. bank amortization ≈ {fmtPeso(amort)}/mo (20 yrs @ 6.5%).{" "}
          {listing.dues != null ? `Plus ${fmtPeso(listing.dues)}/mo dues.` : ""}
        </p>
      )}

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
            {listing.floor != null && (
              <div className="spec">
                <b>{listing.floor}</b>
                <span>Floor</span>
              </div>
            )}
            {listing.yearBuilt != null && (
              <div className="spec">
                <b>{listing.yearBuilt}</b>
                <span>Built</span>
              </div>
            )}
            {listing.dues != null && (
              <div className="spec">
                <b>{fmtPeso(listing.dues)}/mo</b>
                <span>Assoc. dues</span>
              </div>
            )}
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

      {(isRent || listing.turnover || listing.agent || listing.brokerType) && (
        <div className="terms-row">
          {listing.turnover && <span className="term-chip">{TURNOVER_LABELS[listing.turnover]}</span>}
          {listing.advanceMonths != null && (
            <span className="term-chip">
              {listing.advanceMonths} mo advance{listing.depositMonths != null ? ` · ${listing.depositMonths} mo deposit` : ""}
            </span>
          )}
          {listing.brokerType && <span className="term-chip">{BROKER_LABELS[listing.brokerType]}</span>}
          {listing.agent && <span className="term-chip">{listing.agent}</span>}
        </div>
      )}

      {listing.features.length > 0 && (
        <div className="feature-row">
          {listing.features.map((f) => (
            <span key={f} className="feature-chip">
              {f}
            </span>
          ))}
        </div>
      )}

      <div className="quality-meter" title={`Missing: ${complete.fields.join(", ") || "none"}`}>
        <div className="quality-head">
          <span>Data quality — {completenessLabel(complete)}</span>
          <span>
            {complete.filled}/{complete.filled + complete.fields.length} fields
          </span>
        </div>
        <div className="quality-bar">
          <span style={{ width: `${complete.score}%` }} />
        </div>
        {complete.fields.length > 0 && <p className="quality-missing">Missing: {complete.fields.join(", ")}</p>}
      </div>

      <div className="trust-row">
        <span className="trust-pill">Listed {freshnessLabel(listing.freshDays)}</span>
        <span className="trust-pill">{TYPE_LABELS[listing.type]}</span>
        <span className="trust-pill">Via {src.name}</span>
      </div>

      <a className="cta" href={href} target="_blank" rel="noopener noreferrer">
        View on {listing.url ? src.name : `${src.name} (search)`} ↗
      </a>
      <p className="cta-note">
        Lasello links you to the original portal — we never copy listings or hide the source.
      </p>
    </aside>
  );
}