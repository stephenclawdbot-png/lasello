import type { ReactNode } from "react";
import type { ListingType } from "../data/listings";

const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round", strokeLinejoin: "round" } as const;

export const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" {...S}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

export const BedIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" {...S}>
    <path d="M2 9v9M2 16h20M22 18v-5a3 3 0 0 0-3-3H9v6" />
    <circle cx="5.5" cy="10.5" r="1.6" />
  </svg>
);

export const BathIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" {...S}>
    <path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2ZM7 12V6a2 2 0 0 1 4 0M6 19l-1 2M18 19l1 2" />
  </svg>
);

export const AreaIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" {...S}>
    <rect x="4" y="4" width="16" height="16" rx="1.5" />
    <path d="M4 9h5V4" />
  </svg>
);

export const PinIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" {...S}>
    <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11Z" />
    <circle cx="12" cy="10" r="2.6" />
  </svg>
);

export const CheckIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" {...S} strokeWidth={2.4}>
    <path d="m4.5 12.5 5 5L19.5 7" />
  </svg>
);

export const HomeMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 11.5 12 5l8 6.5M6.5 10v9h11v-9" />
  </svg>
);

/** Soft tinted placeholder art per property type (we never hotlink portal photos). */
const MEDIA: Record<ListingType, { bg: string; ink: string; art: ReactNode }> = {
  condo: {
    bg: "linear-gradient(135deg, #e4f0f7, #d3e6f2)",
    ink: "#5b87a6",
    art: (
      <g>
        <rect x="14" y="8" width="18" height="32" rx="1.5" />
        <rect x="34" y="16" width="14" height="24" rx="1.5" />
        <path d="M18 14h3M23 14h3M18 20h3M23 20h3M18 26h3M23 26h3M18 32h3M23 32h3M38 22h3M38 28h3M38 34h3" strokeWidth="1.6" />
      </g>
    ),
  },
  house: {
    bg: "linear-gradient(135deg, #eaf3e6, #dcebd5)",
    ink: "#6f9460",
    art: (
      <g>
        <path d="M10 26 30 12l20 14" />
        <path d="M15 24v16h30V24" />
        <rect x="26" y="30" width="8" height="10" rx="1" />
        <rect x="38" y="28" width="5" height="5" rx="0.8" />
      </g>
    ),
  },
  lot: {
    bg: "linear-gradient(135deg, #f6efdf, #efe4cb)",
    ink: "#ab8d55",
    art: (
      <g>
        <path d="M12 36 24 14l10 16 6-8 8 14" />
        <path d="M10 40h40" strokeDasharray="4 4" />
      </g>
    ),
  },
  land: {
    bg: "linear-gradient(135deg, #eaf4ee, #d9ecdf)",
    ink: "#5f9377",
    art: (
      <g>
        <path d="M10 38c6-4 12-4 18 0s12 4 18 0" />
        <path d="M12 30c5-3 10-3 15 0M33 28c4-2.5 8-2.5 12 0" />
        <circle cx="42" cy="14" r="4" />
      </g>
    ),
  },
};

export function TypeArt({ type, children }: { type: ListingType; children?: ReactNode }) {
  const m = MEDIA[type];
  return (
    <div className="card-media" style={{ background: m.bg }}>
      <svg width="60" height="48" viewBox="0 0 60 48" fill="none" stroke={m.ink} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {m.art}
      </svg>
      {children}
    </div>
  );
}
