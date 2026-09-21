export type SourceKey =
  | "broker"
  // property portals
  | "lamudi"
  | "property24"
  | "dotproperty"
  | "rentpad"
  | "zipmatch"
  | "onepropertee"
  | "myproperty"
  | "rentph"
  // developers (pre-selling / primary market)
  | "smdc"
  | "dmci"
  | "camella"
  | "megaworld"
  | "ayalaland"
  // banks & foreclosure
  | "pagibig"
  | "buenamano"
  | "bdo"
  | "metrobank"
  | "unionbank"
  | "foreclosureph"
  // brokerages
  | "hoppler"
  | "filipinohomes"
  | "ohmyhome"
  | "remax"
  | "propertyaccess"
  // marketplaces & classifieds
  | "facebook"
  | "carousell"
  | "locanto";

export type SourceCategory = "portal" | "developer" | "bank" | "brokerage" | "classifieds";

export const CATEGORY_LABELS: Record<SourceCategory, string> = {
  portal: "Property portals",
  developer: "Developers (pre-selling)",
  bank: "Banks & foreclosure",
  brokerage: "Brokerages",
  classifieds: "Marketplaces & classifieds",
};

export const CATEGORY_ORDER: SourceCategory[] = ["portal", "developer", "bank", "brokerage", "classifieds"];

export interface Source {
  key: SourceKey;
  name: string;
  color: string;
  category: SourceCategory;
  /** Deep-link SEARCH template. Seed links are templates, not scraped listings —
   *  real ingestion adapters (see /adapters) emit per-listing URLs. */
  link: (q: string) => string;
}

const enc = encodeURIComponent;

export const SOURCES: Record<SourceKey, Source> = {
  // ---- broker-direct (internal supply line) ----
  broker: {
    key: "broker",
    name: "Broker Direct",
    color: "#0F766E",
    category: "brokerage",
    link: (q) => `https://lasello-meowdotfun.vercel.app/#submit?find=${enc(q)}`,
  },
  // ---- property portals ----
  lamudi: {
    key: "lamudi",
    name: "Lamudi",
    color: "#FF6B4A",
    category: "portal",
    link: (q) => `https://www.lamudi.com.ph/results/?q=${enc(q)}`,
  },
  property24: {
    key: "property24",
    name: "Property24 PH",
    color: "#FFC15E",
    category: "portal",
    link: (q) => `https://www.property24.com.ph/properties-for-sale?pq=${enc(q)}`,
  },
  dotproperty: {
    key: "dotproperty",
    name: "DotProperty",
    color: "#35C4B5",
    category: "portal",
    link: (q) => `https://philippines.dotproperty.ph/en/search?text=${enc(q)}`,
  },
  rentpad: {
    key: "rentpad",
    name: "Rentpad",
    color: "#B69CFF",
    category: "portal",
    link: (q) => `https://rentpad.com.ph/?s=${enc(q)}`,
  },
  zipmatch: {
    key: "zipmatch",
    name: "ZipMatch",
    color: "#6EC6FF",
    category: "portal",
    link: (q) => `https://www.zipmatch.com/search?q=${enc(q)}`,
  },
  onepropertee: {
    key: "onepropertee",
    name: "OnePropertee",
    color: "#2EAB6F",
    category: "portal",
    link: (q) => `https://www.onepropertee.com/search?q=${enc(q)}`,
  },
  myproperty: {
    key: "myproperty",
    name: "MyProperty.ph",
    color: "#F08C3C",
    category: "portal",
    link: (q) => `https://www.myproperty.ph/results/?q=${enc(q)}`,
  },
  rentph: {
    key: "rentph",
    name: "Rent.ph",
    color: "#8FBF3F",
    category: "portal",
    link: (q) => `https://rent.ph/?s=${enc(q)}`,
  },
  // ---- developers (pre-selling) ----
  smdc: {
    key: "smdc",
    name: "SMDC",
    color: "#1B4FA0",
    category: "developer",
    link: (q) => `https://smdc.com/?s=${enc(q)}`,
  },
  dmci: {
    key: "dmci",
    name: "DMCI Homes",
    color: "#0E7C3A",
    category: "developer",
    link: (q) => `https://www.dmcihomes.com/search?q=${enc(q)}`,
  },
  camella: {
    key: "camella",
    name: "Camella",
    color: "#C0392B",
    category: "developer",
    link: (q) => `https://www.camella.com.ph/?s=${enc(q)}`,
  },
  megaworld: {
    key: "megaworld",
    name: "Megaworld",
    color: "#7A5C2E",
    category: "developer",
    link: (q) => `https://www.megaworldcorp.com/residences/search?q=${enc(q)}`,
  },
  ayalaland: {
    key: "ayalaland",
    name: "Ayala Land",
    color: "#00695C",
    category: "developer",
    link: (q) => `https://www.ayalaland.com.ph/?s=${enc(q)}`,
  },
  // ---- banks & foreclosure ----
  pagibig: {
    key: "pagibig",
    name: "Pag-IBIG Acquired Assets",
    color: "#0C5DA5",
    category: "bank",
    link: () => `https://www.pagibigfundservices.com/OnlinePublicAuction/`,
  },
  buenamano: {
    key: "buenamano",
    name: "BPI Buena Mano",
    color: "#A6192E",
    category: "bank",
    link: (q) => `https://www.buenamano.ph/search?q=${enc(q)}`,
  },
  bdo: {
    key: "bdo",
    name: "BDO Properties",
    color: "#00369C",
    category: "bank",
    link: () => `https://www.bdo.com.ph/personal/assets-for-sale/properties-for-sale`,
  },
  metrobank: {
    key: "metrobank",
    name: "Metrobank Properties",
    color: "#004B8D",
    category: "bank",
    link: () => `https://www.metrobank.com.ph/articles/properties-for-sale`,
  },
  unionbank: {
    key: "unionbank",
    name: "UnionBank Foreclosed",
    color: "#F26722",
    category: "bank",
    link: () => `https://www.unionbankph.com/foreclosed-properties`,
  },
  foreclosureph: {
    key: "foreclosureph",
    name: "ForeclosurePhilippines",
    color: "#5D4037",
    category: "bank",
    link: (q) => `https://www.foreclosurephilippines.com/?s=${enc(q)}`,
  },
  // ---- brokerages ----
  hoppler: {
    key: "hoppler",
    name: "Hoppler",
    color: "#4C6FE7",
    category: "brokerage",
    link: (q) => `https://www.hoppler.com.ph/search?query=${enc(q)}`,
  },
  filipinohomes: {
    key: "filipinohomes",
    name: "Filipino Homes",
    color: "#D95336",
    category: "brokerage",
    link: (q) => `https://filipinohomes.com/search?q=${enc(q)}`,
  },
  ohmyhome: {
    key: "ohmyhome",
    name: "Ohmyhome",
    color: "#E86FA4",
    category: "brokerage",
    link: (q) => `https://ohmyhome.com/en-ph/search?q=${enc(q)}`,
  },
  remax: {
    key: "remax",
    name: "RE/MAX Philippines",
    color: "#DC1C2E",
    category: "brokerage",
    link: (q) => `https://www.remax.ph/search?q=${enc(q)}`,
  },
  propertyaccess: {
    key: "propertyaccess",
    name: "PropertyAccess",
    color: "#00A0B0",
    category: "brokerage",
    link: (q) => `https://propertyaccess.ph/search?q=${enc(q)}`,
  },
  // ---- marketplaces & classifieds ----
  facebook: {
    key: "facebook",
    name: "FB Marketplace",
    color: "#7FB5FF",
    category: "classifieds",
    link: (q) => `https://www.facebook.com/marketplace/search/?query=${enc(q)}`,
  },
  carousell: {
    key: "carousell",
    name: "Carousell",
    color: "#F2A1B5",
    category: "classifieds",
    link: (q) => `https://www.carousell.com.ph/search/${enc(q)}`,
  },
  locanto: {
    key: "locanto",
    name: "Locanto PH",
    color: "#9C89B8",
    category: "classifieds",
    link: (q) => `https://www.locanto.ph/g/q/?query=${enc(q)}`,
  },
};

export const SOURCE_LIST: Source[] = Object.values(SOURCES);
