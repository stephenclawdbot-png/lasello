import type { SourceKey } from "./sources";

export type ListingType = "condo" | "house" | "lot" | "land";
export type Tenure = "sale" | "rent";

export interface Listing {
  id: string;
  name: string;
  city: string;
  region: string;
  lat: number;
  lng: number;
  type: ListingType;
  tenure: Tenure;
  /** PHP total for sale, PHP per month for rent */
  price: number;
  sqm: number;
  beds: number;
  baths: number;
  source: SourceKey;
  freshDays: number;
  verified: boolean;
}

export function perSqm(l: Listing): number {
  return l.price / l.sqm;
}

/**
 * DEMO SEED — ~63 listings hand-curated across 30+ PH cities for launch UX.
 * Prices are illustrative market-plausible values, NOT live scraped data.
 * Each row carries `source` so the UI can deep-link to the source portal's
 * search for that city (templates in sources.ts). Real ingestion replaces
 * this file via the adapters contract — see /adapters.
 */
const rows: Array<
  [string, string, string, number, number, ListingType, Tenure, number, number, number, number, SourceKey, number, boolean]
> = [
  // name, city, region, lat, lng, type, tenure, price, sqm, beds, baths, source, freshDays, verified
  ["Ayala Triangle 2BR", "Makati", "Metro Manila", 14.5629, 121.0242, "condo", "sale", 24500000, 92, 2, 2, "lamudi", 4, true],
  ["Salcedo Studio", "Makati", "Metro Manila", 14.5581, 121.0178, "condo", "sale", 8900000, 31, 0, 1, "lamudi", 11, false],
  ["Poblacion Loft", "Makati", "Metro Manila", 14.5695, 121.0294, "condo", "sale", 9800000, 38, 1, 1, "zipmatch", 26, false],
  ["Legazpi Village 2BR (for rent)", "Makati", "Metro Manila", 14.5554, 121.0211, "condo", "rent", 85000, 65, 2, 1, "rentpad", 3, false],
  ["Uptown BGC 3BR", "Taguig", "Metro Manila", 14.552, 121.052, "condo", "sale", 39500000, 128, 3, 2, "property24", 8, true],
  ["Burgos Circle 1BR", "Taguig", "Metro Manila", 14.5549, 121.0579, "condo", "sale", 14200000, 44, 1, 1, "lamudi", 17, false],
  ["BGC 1BR (for rent)", "Taguig", "Metro Manila", 14.5508, 121.0505, "condo", "rent", 60000, 40, 1, 1, "rentpad", 5, false],
  ["Katipunan 2BR", "Quezon City", "Metro Manila", 14.6345, 121.0903, "condo", "sale", 8700000, 55, 2, 1, "lamudi", 22, false],
  ["Tomas Morato Townhouse", "Quezon City", "Metro Manila", 14.633, 121.031, "house", "sale", 16800000, 120, 3, 2, "dotproperty", 41, false],
  ["Commonwealth Lot", "Quezon City", "Metro Manila", 14.674, 121.089, "lot", "sale", 6200000, 300, 0, 0, "facebook", 64, false],
  ["Katipunan Studio (for rent)", "Quezon City", "Metro Manila", 14.6392, 121.0846, "condo", "rent", 25000, 24, 0, 1, "rentpad", 9, false],
  ["Capital Commons 2BR", "Pasig", "Metro Manila", 14.584, 121.059, "condo", "sale", 15400000, 78, 2, 2, "lamudi", 13, false],
  ["Pioneer Condo", "Mandaluyong", "Metro Manila", 14.583, 121.038, "condo", "sale", 9300000, 42, 1, 1, "carousell", 33, false],
  ["Meralco Studio (for rent)", "Pasig", "Metro Manila", 14.5795, 121.0615, "condo", "rent", 55000, 27, 0, 1, "rentpad", 6, false],
  ["Bayshore Condo", "Manila", "Metro Manila", 14.582, 120.982, "condo", "sale", 8400000, 38, 1, 1, "lamudi", 29, false],
  ["Ayala Alabang House", "Muntinlupa", "Metro Manila", 14.418, 121.03, "house", "sale", 48000000, 600, 5, 4, "property24", 19, true],
  ["Festival Mall Condo", "Muntinlupa", "Metro Manila", 14.4289, 121.0397, "condo", "sale", 8800000, 40, 1, 1, "zipmatch", 37, false],
  ["Aseana 1BR", "Parañaque", "Metro Manila", 14.525, 121.005, "condo", "sale", 9600000, 36, 1, 1, "lamudi", 7, false],
  ["BF Homes House", "Parañaque", "Metro Manila", 14.47, 121.01, "house", "sale", 19500000, 350, 4, 3, "facebook", 52, false],
  ["CAA House", "Las Piñas", "Metro Manila", 14.4705, 121.0142, "house", "sale", 11500000, 200, 3, 2, "carousell", 45, false],
  ["Malinta House", "Valenzuela", "Metro Manila", 14.711, 120.982, "house", "sale", 8100000, 150, 3, 2, "carousell", 58, false],
  ["Marikina Heights House", "Marikina", "Metro Manila", 14.635, 121.105, "house", "sale", 12700000, 220, 4, 3, "carousell", 71, false],
  ["Hillside House", "Antipolo", "Rizal", 14.587, 121.176, "house", "sale", 13900000, 280, 4, 3, "lamudi", 24, false],
  ["Nuvali House", "Santa Rosa", "Laguna", 14.313, 121.109, "house", "sale", 18600000, 240, 4, 3, "property24", 12, true],
  ["Dasmariñas House", "Dasmariñas", "Cavite", 14.329, 120.936, "house", "sale", 9400000, 180, 3, 2, "lamudi", 31, false],
  ["Tagaytay Ridge House", "Tagaytay", "Cavite", 14.107, 120.96, "house", "sale", 22000000, 240, 4, 3, "dotproperty", 16, false],
  ["Crosswinds Lot", "Tagaytay", "Cavite", 14.1146, 120.9523, "lot", "sale", 9500000, 450, 0, 0, "property24", 48, false],
  ["Balete Farm Lot", "Lipa", "Batangas", 13.941, 121.163, "land", "sale", 4500000, 1500, 0, 0, "dotproperty", 83, false],
  ["Malolos Townhouse", "Malolos", "Bulacan", 14.855, 120.813, "house", "sale", 6800000, 110, 2, 2, "facebook", 66, false],
  ["Clark Freeport House", "Mabalacat", "Pampanga", 15.151, 120.586, "house", "sale", 14800000, 320, 4, 3, "dotproperty", 21, false],
  ["Angeles House", "Angeles", "Pampanga", 15.137, 120.598, "house", "sale", 10500000, 240, 3, 2, "lamudi", 35, false],
  ["Subic Bayview House", "Olongapo", "Zambales", 14.824, 120.284, "house", "sale", 12900000, 280, 3, 3, "property24", 27, false],
  ["Camp Allen Bungalow", "Baguio", "Benguet", 16.412, 120.596, "house", "sale", 18500000, 180, 4, 3, "lamudi", 14, false],
  ["Session Road Condo", "Baguio", "Benguet", 16.4133, 120.5986, "condo", "sale", 9200000, 45, 1, 1, "zipmatch", 39, false],
  ["Vigan Heritage Casa", "Vigan", "Ilocos Sur", 17.574, 120.387, "house", "sale", 12800000, 280, 4, 3, "dotproperty", 94, false],
  ["IT Park Studio", "Cebu City", "Central Visayas", 10.323, 123.901, "condo", "sale", 5800000, 26, 0, 1, "lamudi", 5, false],
  ["Banilad 3BR", "Cebu City", "Central Visayas", 10.344, 123.895, "house", "sale", 16500000, 145, 3, 3, "lamudi", 18, false],
  ["Mactan Beachfront Villa", "Lapu-Lapu", "Central Visayas", 10.316, 123.968, "house", "sale", 65000000, 420, 5, 5, "property24", 10, true],
  ["SRP Condo", "Cebu City", "Central Visayas", 10.285, 123.879, "condo", "sale", 11800000, 55, 2, 1, "zipmatch", 23, false],
  ["IT Park 1BR (for rent)", "Cebu City", "Central Visayas", 10.3264, 123.9044, "condo", "rent", 35000, 32, 1, 1, "rentpad", 4, false],
  ["Rizal Blvd Condo", "Dumaguete", "Negros Oriental", 9.307, 123.305, "condo", "sale", 6400000, 48, 1, 1, "dotproperty", 28, false],
  ["Bacong Beach Lot", "Dumaguete", "Negros Oriental", 9.283, 123.247, "land", "sale", 6900000, 800, 0, 0, "facebook", 77, false],
  ["Capitol Avenue House", "Bacolod", "Negros Occidental", 10.676, 122.951, "house", "sale", 13500000, 320, 4, 3, "property24", 34, false],
  ["BREDSCO Lot", "Bacolod", "Negros Occidental", 10.654, 122.937, "lot", "sale", 3800000, 250, 0, 0, "facebook", 88, false],
  ["Megaworld Blvd Condo", "Iloilo City", "Western Visayas", 10.716, 122.562, "condo", "sale", 7900000, 50, 1, 1, "lamudi", 9, false],
  ["Jaro Heritage House", "Iloilo City", "Western Visayas", 10.747, 122.565, "house", "sale", 17500000, 400, 5, 4, "dotproperty", 61, false],
  ["Bajada 3BR", "Davao City", "Davao", 7.085, 125.612, "house", "sale", 12500000, 140, 3, 2, "lamudi", 15, false],
  ["Matina House", "Davao City", "Davao", 7.051, 125.56, "house", "sale", 9800000, 220, 3, 2, "dotproperty", 42, false],
  ["Samal Island Lot", "Island Garden City of Samal", "Davao", 7.095, 125.71, "land", "sale", 5500000, 1000, 0, 0, "facebook", 69, false],
  ["Xavier Estates House", "Cagayan de Oro", "Northern Mindanao", 8.482, 124.647, "house", "sale", 11200000, 250, 4, 3, "property24", 25, false],
  ["Lapasan Condo", "Cagayan de Oro", "Northern Mindanao", 8.4787, 124.6533, "condo", "sale", 4900000, 40, 1, 1, "zipmatch", 36, false],
  ["Lagao House", "General Santos", "Soccsksargen", 6.116, 125.172, "house", "sale", 6500000, 200, 3, 2, "facebook", 74, false],
  ["Pasonanca House", "Zamboanga City", "Zamboanga Peninsula", 6.921, 122.079, "house", "sale", 7200000, 260, 4, 3, "property24", 57, false],
  ["El Nido Cliff Lot", "El Nido", "Palawan", 11.18, 119.39, "land", "sale", 9800000, 600, 0, 0, "dotproperty", 20, true],
  ["Puerto Princesa Villa", "Puerto Princesa", "Palawan", 9.739, 118.735, "house", "sale", 15800000, 350, 4, 4, "property24", 44, false],
  ["Panglao Pool Villa", "Panglao", "Bohol", 9.551, 123.774, "house", "sale", 42000000, 380, 4, 4, "lamudi", 6, true],
  ["Tagbilaran Condo", "Tagbilaran", "Bohol", 9.654, 123.853, "condo", "sale", 5200000, 45, 1, 1, "zipmatch", 32, false],
  ["Mayon View Farm Lot", "Legazpi", "Albay", 13.139, 123.736, "land", "sale", 2900000, 1200, 0, 0, "facebook", 91, false],
  ["Aguinaldo Lot", "Butuan", "Agusan del Norte", 8.949, 125.543, "lot", "sale", 2400000, 400, 0, 0, "facebook", 96, false],
  ["Real St House", "Tacloban", "Leyte", 11.244, 125.003, "house", "sale", 5900000, 180, 3, 2, "property24", 63, false],
  ["Magsaysay Condo", "Naga", "Camarines Sur", 13.621, 123.193, "condo", "sale", 4600000, 42, 1, 1, "zipmatch", 47, false],
];

export const LISTINGS: Listing[] = rows.map((r, i) => ({
  id: `${r[1].toLowerCase().replace(/[^a-z]+/g, "-")}-${i}`,
  name: r[0],
  city: r[1],
  region: r[2],
  lat: r[3],
  lng: r[4],
  type: r[5],
  tenure: r[6],
  price: r[7],
  sqm: r[8],
  beds: r[9],
  baths: r[10],
  source: r[11],
  freshDays: r[12],
  verified: r[13],
}));

export const TYPE_LABELS: Record<ListingType, string> = {
  condo: "Condo",
  house: "House & Lot",
  lot: "Lot",
  land: "Land / Farm",
};