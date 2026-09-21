import type { Furnished, Listing, ListingType, Tenure } from "./listings";
import type { SourceKey } from "./sources";

/**
 * Deterministic DEMO listing generator. Expands the hand-curated seed into a
 * market-scale inventory (~2,400 rows) with city-calibrated ₱/m² bands,
 * realistic type/tenure mixes and complete details. Same seed → same ids
 * every build, so selections and feeds stay stable. All of it is demo data,
 * labeled as such in the UI, and is replaced by live portal feeds via
 * /adapters + scripts/ingest.ts.
 */

type CityTier = "metro" | "urban" | "resort";

interface CityDef {
  city: string;
  region: string;
  lat: number;
  lng: number;
  n: number;
  tier: CityTier;
  /** price multiplier vs tier base (1 = tier average) */
  mult: number;
  /** built-up CBD city: condos/houses only, no raw lots or farm land */
  dense?: boolean;
  areas?: string[];
}

const CITIES: CityDef[] = [
  { city: "Makati", dense: true, region: "Metro Manila", lat: 14.554, lng: 121.024, n: 150, tier: "metro", mult: 1.45, areas: ["Salcedo Village", "Legazpi Village", "Poblacion", "San Lorenzo", "Bel-Air", "Rockwell", "San Antonio", "Chino Roces"] },
  { city: "Taguig", dense: true, region: "Metro Manila", lat: 14.535, lng: 121.056, n: 140, tier: "metro", mult: 1.4, areas: ["BGC", "Uptown Bonifacio", "McKinley Hill", "Serendra", "Ususan", "Bagumbayan"] },
  { city: "Quezon City", region: "Metro Manila", lat: 14.651, lng: 121.049, n: 200, tier: "metro", mult: 0.85, areas: ["Katipunan", "Eastwood", "Tomas Morato", "Cubao", "Fairview", "Novaliches", "Vertis North", "Timog", "Project 8"] },
  { city: "Manila", dense: true, region: "Metro Manila", lat: 14.599, lng: 120.984, n: 100, tier: "metro", mult: 0.8, areas: ["Malate", "Ermita", "Binondo", "Sampaloc", "Paco", "Sta. Ana", "Intramuros"] },
  { city: "Pasig", dense: true, region: "Metro Manila", lat: 14.576, lng: 121.081, n: 90, tier: "metro", mult: 0.95, areas: ["Ortigas Center", "Capitol Commons", "Kapitolyo", "San Antonio", "Ugong", "Maybunga"] },
  { city: "Mandaluyong", dense: true, region: "Metro Manila", lat: 14.579, lng: 121.035, n: 60, tier: "metro", mult: 0.9, areas: ["Pioneer", "Boni", "Wack-Wack", "Shaw Blvd", "Plainview"] },
  { city: "Parañaque", region: "Metro Manila", lat: 14.48, lng: 121.02, n: 70, tier: "metro", mult: 0.85, areas: ["BF Homes", "Aseana", "Sucat", "Moonwalk", "Merville"] },
  { city: "Muntinlupa", region: "Metro Manila", lat: 14.41, lng: 121.04, n: 60, tier: "metro", mult: 0.9, areas: ["Alabang", "Filinvest City", "Ayala Alabang", "Putatan", "Tunasan"] },
  { city: "Las Piñas", region: "Metro Manila", lat: 14.45, lng: 120.98, n: 40, tier: "metro", mult: 0.65, areas: ["BF Resort", "Pilar Village", "Talon", "Pamplona"] },
  { city: "Pasay", dense: true, region: "Metro Manila", lat: 14.543, lng: 120.999, n: 60, tier: "metro", mult: 0.9, areas: ["MOA Complex", "Newport City", "Libertad", "Baclaran"] },
  { city: "San Juan", dense: true, region: "Metro Manila", lat: 14.602, lng: 121.03, n: 30, tier: "metro", mult: 1.1, areas: ["Greenhills", "Little Baguio", "Addition Hills"] },
  { city: "Marikina", region: "Metro Manila", lat: 14.647, lng: 121.102, n: 40, tier: "metro", mult: 0.6, areas: ["Marikina Heights", "Concepcion", "SSS Village", "Riverbanks"] },
  { city: "Caloocan", region: "Metro Manila", lat: 14.65, lng: 120.972, n: 50, tier: "metro", mult: 0.5, areas: ["Grace Park", "Camarin", "Bagumbong", "Monumento"] },
  { city: "Valenzuela", region: "Metro Manila", lat: 14.7, lng: 120.983, n: 30, tier: "metro", mult: 0.5, areas: ["Malinta", "Marulas", "Karuhatan"] },
  { city: "Antipolo", region: "Rizal", lat: 14.59, lng: 121.176, n: 40, tier: "urban", mult: 0.9, areas: ["Sumulong Highway", "Beverly Hills", "San Roque", "Mayamot"] },
  { city: "Bacoor", region: "Cavite", lat: 14.46, lng: 120.96, n: 50, tier: "urban", mult: 0.85, areas: ["Molino", "Queens Row", "Springville", "Panapaan"] },
  { city: "Imus", region: "Cavite", lat: 14.43, lng: 120.94, n: 40, tier: "urban", mult: 0.85, areas: ["Lancaster New City", "Anabu", "Bucandala"] },
  { city: "Dasmariñas", region: "Cavite", lat: 14.33, lng: 120.94, n: 50, tier: "urban", mult: 0.8, areas: ["Salitran", "Paliparan", "Sampaloc", "DBB Village"] },
  { city: "General Trias", region: "Cavite", lat: 14.39, lng: 120.88, n: 30, tier: "urban", mult: 0.8, areas: ["Lancaster", "Eagle Ridge", "Governor's Hills"] },
  { city: "Santa Rosa", region: "Laguna", lat: 14.31, lng: 121.11, n: 40, tier: "urban", mult: 1.05, areas: ["Nuvali", "Greenfield", "Balibago", "Sto. Domingo"] },
  { city: "Calamba", region: "Laguna", lat: 14.21, lng: 121.16, n: 30, tier: "urban", mult: 0.85, areas: ["Canlubang", "Real", "Pansol", "Mayapa"] },
  { city: "Biñan", region: "Laguna", lat: 14.34, lng: 121.08, n: 20, tier: "urban", mult: 0.85, areas: ["Southwoods", "San Antonio", "Sto. Tomas"] },
  { city: "Lipa", region: "Batangas", lat: 13.94, lng: 121.16, n: 30, tier: "urban", mult: 0.8, areas: ["Balete", "Mataas na Kahoy", "Sabang", "Bolbok"] },
  { city: "Batangas City", region: "Batangas", lat: 13.76, lng: 121.06, n: 20, tier: "urban", mult: 0.75, areas: ["Poblacion", "Alangilan", "Kumintang"] },
  { city: "Malolos", region: "Bulacan", lat: 14.84, lng: 120.81, n: 20, tier: "urban", mult: 0.65, areas: ["Bulihan", "Longos", "Guinhawa"] },
  { city: "San Jose del Monte", region: "Bulacan", lat: 14.81, lng: 121.05, n: 30, tier: "urban", mult: 0.6, areas: ["Tungkong Mangga", "Muzon", "Sapang Palay"] },
  { city: "Meycauayan", region: "Bulacan", lat: 14.73, lng: 120.96, n: 15, tier: "urban", mult: 0.65, areas: ["Malhacan", "Bahay Pare"] },
  { city: "Angeles", region: "Pampanga", lat: 15.14, lng: 120.59, n: 40, tier: "urban", mult: 0.9, areas: ["Balibago", "Friendship", "Anunas", "Pulung Maragul"] },
  { city: "San Fernando", region: "Pampanga", lat: 15.03, lng: 120.69, n: 25, tier: "urban", mult: 0.8, areas: ["Telabastagan", "Sindalan", "Dolores"] },
  { city: "Mabalacat", region: "Pampanga", lat: 15.22, lng: 120.57, n: 20, tier: "urban", mult: 0.85, areas: ["Dau", "Clark Freeport", "Mabiga"] },
  { city: "Olongapo", region: "Zambales", lat: 14.83, lng: 120.28, n: 20, tier: "urban", mult: 0.85, areas: ["Kalaklan", "Barretto", "East Bajac-Bajac"] },
  { city: "Baguio", region: "Benguet", lat: 16.41, lng: 120.6, n: 40, tier: "urban", mult: 1.25, areas: ["Session Road", "Camp 7", "Aurora Hill", "Camp John Hay", "Loakan"] },
  { city: "Cebu City", dense: true, region: "Central Visayas", lat: 10.32, lng: 123.9, n: 150, tier: "metro", mult: 1.0, areas: ["IT Park", "Cebu Business Park", "Banilad", "Lahug", "Guadalupe", "Talamban", "Capitol Site", "Mabolo"] },
  { city: "Mandaue", region: "Central Visayas", lat: 10.34, lng: 123.93, n: 40, tier: "urban", mult: 0.85, areas: ["Basak", "Subangdaku", "Banilad", "Tipolo"] },
  { city: "Lapu-Lapu", region: "Central Visayas", lat: 10.31, lng: 123.95, n: 60, tier: "urban", mult: 1.0, areas: ["Mactan", "Punta Engaño", "Marigondon", "Basak", "Agus"] },
  { city: "Talisay", region: "Central Visayas", lat: 10.26, lng: 123.84, n: 20, tier: "urban", mult: 0.75, areas: ["Lawaan", "Tabunok", "Dumlog"] },
  { city: "Iloilo City", region: "Western Visayas", lat: 10.72, lng: 122.56, n: 60, tier: "urban", mult: 0.9, areas: ["Iloilo Business Park", "Jaro", "Mandurriao", "Molo", "La Paz"] },
  { city: "Bacolod", region: "Negros Occidental", lat: 10.68, lng: 122.95, n: 50, tier: "urban", mult: 0.75, areas: ["Capitol Heights", "Villamonte", "Mandalagan", "Alijis"] },
  { city: "Dumaguete", region: "Negros Oriental", lat: 9.31, lng: 123.31, n: 25, tier: "urban", mult: 0.8, areas: ["Rizal Boulevard", "Bantayan", "Piapi", "Valencia Road"] },
  { city: "Tagbilaran", region: "Bohol", lat: 9.65, lng: 123.85, n: 15, tier: "urban", mult: 0.75, areas: ["CPG Avenue", "Dampas", "Booy"] },
  { city: "Davao City", region: "Davao", lat: 7.07, lng: 125.61, n: 100, tier: "metro", mult: 0.75, areas: ["Bajada", "Ecoland", "Matina", "Lanang", "Buhangin", "Toril", "Ma-a"] },
  { city: "Cagayan de Oro", region: "Northern Mindanao", lat: 8.48, lng: 124.65, n: 50, tier: "urban", mult: 0.7, areas: ["Uptown", "Lapasan", "Carmen", "Balulang", "Pueblo de Oro"] },
  { city: "General Santos", region: "Soccsksargen", lat: 6.11, lng: 125.17, n: 25, tier: "urban", mult: 0.6, areas: ["Lagao", "Calumpang", "City Heights"] },
  { city: "Zamboanga City", region: "Zamboanga Peninsula", lat: 6.92, lng: 122.08, n: 25, tier: "urban", mult: 0.6, areas: ["Pasonanca", "Tetuan", "Sta. Maria", "Putik"] },
  { city: "Butuan", region: "Agusan del Norte", lat: 8.95, lng: 125.54, n: 15, tier: "urban", mult: 0.55, areas: ["J.C. Aquino", "Libertad", "Ampayon"] },
  { city: "Iligan", region: "Lanao del Norte", lat: 8.23, lng: 124.24, n: 15, tier: "urban", mult: 0.55, areas: ["Pala-o", "Tibanga", "Hinaplanon"] },
  { city: "Tacloban", region: "Leyte", lat: 11.24, lng: 125.0, n: 20, tier: "urban", mult: 0.65, areas: ["Real Street", "Sagkahan", "Marasbaras"] },
  { city: "Legazpi", region: "Albay", lat: 13.14, lng: 123.74, n: 20, tier: "urban", mult: 0.65, areas: ["Old Albay", "Rawis", "Bogtong", "Buyuan"] },
  { city: "Naga", region: "Camarines Sur", lat: 13.62, lng: 123.19, n: 25, tier: "urban", mult: 0.65, areas: ["Magsaysay Avenue", "Concepcion Pequeña", "Triangulo"] },
  { city: "Tagaytay", region: "Cavite", lat: 14.1, lng: 120.94, n: 30, tier: "resort", mult: 1.3, areas: ["Crosswinds", "Kaybagal", "Silang Junction", "People's Park"] },
  { city: "El Nido", region: "Palawan", lat: 11.18, lng: 119.39, n: 15, tier: "resort", mult: 1.2, areas: ["Corong-Corong", "Lio", "Poblacion"] },
  { city: "Puerto Princesa", region: "Palawan", lat: 9.74, lng: 118.74, n: 25, tier: "resort", mult: 0.8, areas: ["San Pedro", "Baywalk", "San Jose", "Sta. Monica"] },
  { city: "Coron", region: "Palawan", lat: 12.0, lng: 120.2, n: 10, tier: "resort", mult: 1.0, areas: ["Poblacion", "Tagumpay"] },
  { city: "Panglao", region: "Bohol", lat: 9.58, lng: 123.75, n: 20, tier: "resort", mult: 1.2, areas: ["Alona", "Danao", "Tawala", "Dauis"] },
  { city: "Malay (Boracay)", region: "Aklan", lat: 11.96, lng: 121.92, n: 20, tier: "resort", mult: 1.4, areas: ["Station 1", "Station 3", "Bulabog", "Caticlan"] },
  { city: "Moalboal", region: "Central Visayas", lat: 9.94, lng: 123.39, n: 10, tier: "resort", mult: 0.9, areas: ["Panagsama", "Saavedra", "Basdiot"] },
  { city: "General Luna (Siargao)", region: "Surigao del Norte", lat: 9.77, lng: 126.16, n: 15, tier: "resort", mult: 1.3, areas: ["Cloud 9", "Tourism Road", "Malinao"] },
  { city: "San Juan (La Union)", region: "La Union", lat: 16.67, lng: 120.34, n: 15, tier: "resort", mult: 1.0, areas: ["Urbiztondo", "Surf Town", "Ili Norte"] },
  { city: "Vigan", region: "Ilocos Sur", lat: 17.57, lng: 120.39, n: 10, tier: "resort", mult: 0.7, areas: ["Calle Crisologo", "Pagburnayan", "Bantay"] },
];

/** Base sale ₱/m² per tier and type (multiplied by city mult and per-listing variance). */
const SALE_PSQM: Record<CityTier, Record<ListingType, number>> = {
  metro: { condo: 165000, house: 105000, lot: 42000, land: 18000 },
  urban: { condo: 95000, house: 58000, lot: 17000, land: 6500 },
  resort: { condo: 125000, house: 82000, lot: 24000, land: 10000 },
};

/** Monthly rent ₱/m² per tier (condo; houses rent at ~70%). */
const RENT_PSQM: Record<CityTier, number> = { metro: 780, urban: 430, resort: 620 };

const TYPE_MIX: Record<CityTier, [number, number, number, number]> = {
  metro: [0.62, 0.24, 0.09, 0.05],
  urban: [0.28, 0.42, 0.17, 0.13],
  resort: [0.18, 0.3, 0.22, 0.3],
};

const RENT_SHARE: Record<CityTier, number> = { metro: 0.32, urban: 0.18, resort: 0.24 };

const SALE_SOURCES: [SourceKey, number][] = [
  ["lamudi", 0.16], ["property24", 0.13], ["dotproperty", 0.11], ["onepropertee", 0.12],
  ["facebook", 0.11], ["carousell", 0.08], ["myproperty", 0.08], ["zipmatch", 0.07],
  ["filipinohomes", 0.06], ["hoppler", 0.05], ["ohmyhome", 0.03],
];
const RENT_SOURCES: [SourceKey, number][] = [
  ["rentpad", 0.28], ["rentph", 0.24], ["lamudi", 0.1], ["facebook", 0.1],
  ["hoppler", 0.1], ["carousell", 0.06], ["dotproperty", 0.06], ["myproperty", 0.06],
];

const GENERIC_AREAS = ["Poblacion", "San Isidro", "Sto. Niño", "Greenview", "Riverside", "Hillcrest", "Centro", "Maligaya", "Vista Verde", "Palm Grove"];

const FEATURES: Record<ListingType, string[]> = {
  condo: ["Pool & gym", "24/7 security", "Balcony", "Backup power", "Near mall", "Pet-friendly", "Function rooms", "Concierge", "Near transport", "High floor", "Study nook", "Sky lounge"],
  house: ["1-car garage", "2-car garage", "Gated village", "Garden", "Dirty kitchen", "Maid's room", "Water tank", "Newly repainted", "Near schools", "Corner lot", "Flood-free area", "Concrete fence"],
  lot: ["Clean title", "Flat terrain", "Utilities ready", "Concrete road access", "Inside subdivision", "Near main road", "Flood-free", "Fenced"],
  land: ["Clean title", "Farm road access", "Fruit-bearing trees", "Gentle slope", "Power nearby", "Tax declared", "Creek boundary", "Tourism zoning"],
};

const DESCS: Record<ListingType, string[]> = {
  condo: [
    "{beds} unit in {area}, {city} — well-kept building with steady rental demand in the area.",
    "{beds} in {area} with association dues up to date; short walk to shops and transport.",
    "Move-in ready {beds} in {area}, {city}; view the actual unit on the source portal.",
    "{beds} along {area} — solid mid-market pick for end-use or rental.",
  ],
  house: [
    "{beds}-bedroom home in {area}, {city} on a {sqm} m² lot; owner-listed with clean paperwork.",
    "Family {beds}-bedroom in {area} — established neighborhood, near schools and markets.",
    "{beds}-bedroom house and lot in {area}; practical layout with room to extend.",
    "Well-maintained {beds}-bedroom in {area}, {city}; viewing by appointment via the source portal.",
  ],
  lot: [
    "{sqm} m² residential lot in {area}, {city} — buildable, with utilities at the curb.",
    "Titled {sqm} m² lot in {area}; ideal for an end-user build in a growing area.",
    "{sqm} m² inner lot in {area}, {city}; clean title, ready for construction.",
  ],
  land: [
    "{sqm} m² raw land in {area}, {city} — priced for early movers in the area.",
    "{sqm} m² parcel near {area}; farm or future development potential.",
    "{sqm} m² of titled land in {area}, {city} with road access.",
  ],
};

// --- deterministic PRNG (mulberry32) ---
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(r: () => number, arr: T[]): T {
  return arr[Math.floor(r() * arr.length)];
}

function weighted<T>(r: () => number, pairs: [T, number][]): T {
  const total = pairs.reduce((s, [, w]) => s + w, 0);
  let x = r() * total;
  for (const [v, w] of pairs) {
    x -= w;
    if (x <= 0) return v;
  }
  return pairs[pairs.length - 1][0];
}

const round = (n: number, step: number) => Math.round(n / step) * step;

export function generateListings(): Listing[] {
  const r = rng(20250921);
  const out: Listing[] = [];

  for (const c of CITIES) {
    const areas = c.areas ?? GENERIC_AREAS;
    const [pc, ph, pl] = c.dense ? [0.72, 0.26, 0.02] : TYPE_MIX[c.tier];
    const jitter = c.tier === "metro" ? 0.016 : c.tier === "urban" ? 0.03 : 0.04;

    for (let i = 0; i < c.n; i++) {
      const tRoll = r();
      const type: ListingType = tRoll < pc ? "condo" : tRoll < pc + ph ? "house" : tRoll < pc + ph + pl ? "lot" : "land";
      const rentable = type === "condo" || type === "house";
      const tenure: Tenure = rentable && r() < RENT_SHARE[c.tier] ? "rent" : "sale";
      const area = pick(r, areas);

      // size
      const sqm =
        type === "condo"
          ? round(22 + r() * r() * 110, 1)
          : type === "house"
            ? round(80 + r() * r() * 380, 5)
            : type === "lot"
              ? round(120 + r() * 800, 10)
              : round(500 + r() * 4500, 50);

      // price
      const variance = 0.68 + r() * 0.85;
      let price: number;
      if (tenure === "rent") {
        const rate = RENT_PSQM[c.tier] * c.mult * (type === "house" ? 0.7 : 1) * variance;
        price = round(Math.max(8000, sqm * rate), 500);
      } else {
        price = round(sqm * SALE_PSQM[c.tier][type] * c.mult * variance, 50000);
      }

      const beds = type === "condo" ? (sqm < 32 ? 1 : sqm < 60 ? (r() < 0.6 ? 1 : 2) : sqm < 95 ? 2 : 3) : type === "house" ? Math.min(6, 2 + Math.floor(sqm / 90)) : 0;
      const baths = type === "condo" ? Math.min(beds, sqm < 60 ? 1 : 2) : type === "house" ? Math.max(1, beds - 1) : 0;
      const parking = type === "condo" ? (price > 12_000_000 && r() < 0.7 ? 1 : r() < 0.3 ? 1 : 0) : type === "house" ? 1 + (sqm > 200 && r() < 0.6 ? 1 : 0) : 0;
      const furnished: Furnished =
        type === "condo" ? (r() < 0.35 ? "fully" : r() < 0.75 ? "semi" : "bare") : type === "house" ? (r() < 0.12 ? "fully" : r() < 0.4 ? "semi" : "bare") : "bare";

      const bedsLabel = type === "condo" ? (beds === 1 && sqm < 32 ? "Studio" : `${beds}BR`) : `${beds}BR`;
      const name =
        type === "condo"
          ? `${area} ${bedsLabel}${tenure === "rent" ? " (for rent)" : ""}`
          : type === "house"
            ? `${area} ${sqm > 250 ? "Family Home" : "House"}${tenure === "rent" ? " (for rent)" : ""}`
            : type === "lot"
              ? `${area} Lot ${sqm} m²`
              : `${area} Land ${sqm} m²`;

      const nFeat = 3 + Math.floor(r() * 2);
      const pool = [...FEATURES[type]];
      const feats: string[] = [];
      for (let f = 0; f < nFeat && pool.length; f++) feats.push(pool.splice(Math.floor(r() * pool.length), 1)[0]);

      const description = pick(r, DESCS[type])
        .replace("{beds}", bedsLabel)
        .replace("{area}", area)
        .replace("{city}", c.city)
        .replaceAll("{sqm}", String(sqm));

      out.push({
        id: `gen-${c.city.toLowerCase().replace(/[^a-z]+/g, "-")}-${i}`,
        name,
        city: c.city,
        region: c.region,
        address: `${area}, ${c.city}`,
        lat: Number((c.lat + (r() + r() - 1) * jitter).toFixed(4)),
        lng: Number((c.lng + (r() + r() - 1) * jitter).toFixed(4)),
        type,
        tenure,
        price,
        sqm,
        beds,
        baths,
        parking,
        furnished,
        description,
        features: feats,
        source: weighted(r, tenure === "rent" ? RENT_SOURCES : SALE_SOURCES),
        freshDays: Math.floor(Math.pow(r(), 1.4) * 120),
        verified: r() < 0.07,
      });
    }
  }

  return out;
}
