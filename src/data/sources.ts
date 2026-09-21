export type SourceKey =
  | "broker"
  | "lamudi"
  | "property24"
  | "dotproperty"
  | "rentpad"
  | "zipmatch"
  | "facebook"
  | "carousell";

export interface Source {
  key: SourceKey;
  name: string;
  color: string;
  /** Deep-link SEARCH template. Seed links are templates, not scraped listings —
   *  real ingestion adapters (see /adapters) will emit per-listing URLs. */
  link: (q: string) => string;
}

const enc = encodeURIComponent;

export const SOURCES: Record<SourceKey, Source> = {
  broker: {
    key: "broker",
    name: "Broker Direct",
    color: "#0F766E",
    link: (q) => `https://lasello-meowdotfun.vercel.app/#submit?find=${enc(q)}`,
  },
  lamudi: {
    key: "lamudi",
    name: "Lamudi",
    color: "#FF6B4A",
    link: (q) => `https://www.lamudi.com.ph/results/?q=${enc(q)}`,
  },
  property24: {
    key: "property24",
    name: "Property24 PH",
    color: "#FFC15E",
    link: (q) => `https://www.property24.com.ph/properties-for-sale?pq=${enc(q)}`,
  },
  dotproperty: {
    key: "dotproperty",
    name: "DotProperty",
    color: "#35C4B5",
    link: (q) => `https://philippines.dotproperty.ph/en/search?text=${enc(q)}`,
  },
  rentpad: {
    key: "rentpad",
    name: "Rentpad",
    color: "#B69CFF",
    link: (q) => `https://rentpad.com.ph/?s=${enc(q)}`,
  },
  zipmatch: {
    key: "zipmatch",
    name: "ZipMatch",
    color: "#6EC6FF",
    link: (q) => `https://www.zipmatch.com/search?q=${enc(q)}`,
  },
  facebook: {
    key: "facebook",
    name: "FB Marketplace",
    color: "#7FB5FF",
    link: (q) => `https://www.facebook.com/marketplace/search/?query=${enc(q)}`,
  },
  carousell: {
    key: "carousell",
    name: "Carousell",
    color: "#F2A1B5",
    link: (q) => `https://www.carousell.com.ph/search/${enc(q)}`,
  },
};

export const SOURCE_LIST: Source[] = Object.values(SOURCES);