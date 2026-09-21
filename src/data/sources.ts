export type SourceKey =
  | "lamudi"
  | "property24"
  | "dotproperty"
  | "rentpad"
  | "zipmatch"
  | "facebook"
  | "carousell"
  | "onepropertee"
  | "myproperty"
  | "hoppler"
  | "filipinohomes"
  | "rentph"
  | "ohmyhome";

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
  onepropertee: {
    key: "onepropertee",
    name: "OnePropertee",
    color: "#2EAB6F",
    link: (q) => `https://www.onepropertee.com/search?q=${enc(q)}`,
  },
  myproperty: {
    key: "myproperty",
    name: "MyProperty.ph",
    color: "#F08C3C",
    link: (q) => `https://www.myproperty.ph/results/?q=${enc(q)}`,
  },
  hoppler: {
    key: "hoppler",
    name: "Hoppler",
    color: "#4C6FE7",
    link: (q) => `https://www.hoppler.com.ph/search?query=${enc(q)}`,
  },
  filipinohomes: {
    key: "filipinohomes",
    name: "Filipino Homes",
    color: "#D95336",
    link: (q) => `https://filipinohomes.com/search?q=${enc(q)}`,
  },
  rentph: {
    key: "rentph",
    name: "Rent.ph",
    color: "#8FBF3F",
    link: (q) => `https://rent.ph/?s=${enc(q)}`,
  },
  ohmyhome: {
    key: "ohmyhome",
    name: "Ohmyhome",
    color: "#E86FA4",
    link: (q) => `https://ohmyhome.com/en-ph/search?q=${enc(q)}`,
  },
};

export const SOURCE_LIST: Source[] = Object.values(SOURCES);