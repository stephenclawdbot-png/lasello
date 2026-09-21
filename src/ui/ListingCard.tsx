import type { Listing } from "../data/listings";
import { perSqm } from "../data/listings";
import { SOURCES } from "../data/sources";
import { fmtPeso, fmtPsqm } from "../lib/stats";
import { validatePrice } from "../lib/price";
import { AreaIcon, BathIcon, BedIcon, TypeArt } from "./icons";

export default function ListingCard({
  listing,
  cityMedian,
  selected,
  onSelect,
}: {
  listing: Listing;
  cityMedian?: number;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const src = SOURCES[listing.source];
  const monthly = listing.tenure === "rent";
  const psqm = perSqm(listing);
  const outlier = listing.outlier || validatePrice(listing) === "outlier";

  let medianChip = null;
  const pct = cityMedian && cityMedian > 0 ? Math.round(((psqm - cityMedian) / cityMedian) * 100) : 0;
  if (Math.abs(pct) >= 5) {
    const below = pct <= 0;
    medianChip = (
      <span className={`median-chip ${below ? "below" : "above"}`} title={`vs ${listing.city} median ₱/m²`}>
        {below ? "" : "+"}
        {pct}% vs median
      </span>
    );
  }

  return (
    <button className={`card ${selected ? "selected" : ""}`} onClick={() => onSelect(listing.id)}>
      <TypeArt type={listing.type}>
        <span className="src-badge">
          <span className="dot" style={{ background: src.color }} />
          {src.name}
        </span>
        <span className="tenure-tag">{monthly ? "For rent" : "For sale"}</span>
      </TypeArt>
      <div className="card-body">
        <div className="card-price-row">
          <span className="card-price">
            {fmtPeso(listing.price, monthly)}
            {listing.priceMin != null && listing.priceMax != null && <small className="range-mark"> range</small>}
          </span>
          {outlier && (
            <span className="outlier-chip" title="Price is plausible but far from this city's norm">
              ⚠ outlier
            </span>
          )}
          {medianChip}
        </div>
        <p className="card-name">{listing.name}</p>
        <p className="card-loc">
          {listing.city}, {listing.region} · {fmtPsqm(psqm)}
          {listing.geoPrecision === "city" ? " · ~pin" : ""}
        </p>
        <div className="card-specs">
          {listing.beds > 0 && (
            <span>
              <BedIcon /> {listing.beds}
            </span>
          )}
          {listing.baths > 0 && (
            <span>
              <BathIcon /> {listing.baths}
            </span>
          )}
          <span>
            <AreaIcon /> {listing.sqm.toLocaleString("en-PH")} m²
          </span>
          {listing.verified && <span style={{ marginLeft: "auto", color: "var(--brand-dark)", fontWeight: 600 }}>✓ Verified</span>}
        </div>
      </div>
    </button>
  );
}
