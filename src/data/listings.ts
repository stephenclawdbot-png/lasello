import type { SourceKey } from "./sources";

export type ListingType = "condo" | "house" | "lot" | "land";
export type Tenure = "sale" | "rent";
export type Furnished = "fully" | "semi" | "bare";

export interface Listing {
  id: string;
  name: string;
  city: string;
  region: string;
  /** Street / barangay-level address line. */
  address: string;
  lat: number;
  lng: number;
  type: ListingType;
  tenure: Tenure;
  /** PHP total for sale, PHP per month for rent */
  price: number;
  sqm: number;
  beds: number;
  baths: number;
  parking: number;
  furnished: Furnished;
  description: string;
  features: string[];
  source: SourceKey;
  freshDays: number;
  verified: boolean;
}

export function perSqm(l: Listing): number {
  return l.price / l.sqm;
}

interface Details {
  addr: string;
  park: number;
  furn: Furnished;
  desc: string;
  feat: string[];
}

/**
 * DEMO SEED — ~78 listings hand-curated across 30+ PH cities for launch UX.
 * Prices are illustrative market-plausible values, NOT live scraped data.
 * Each row carries `source` so the UI can deep-link to the source portal's
 * search for that city (templates in sources.ts). Real ingestion replaces
 * this file via the adapters pipeline — see /adapters and scripts/ingest.ts.
 */
const rows: Array<
  [string, string, string, number, number, ListingType, Tenure, number, number, number, number, SourceKey, number, boolean, Details]
> = [
  // name, city, region, lat, lng, type, tenure, price, sqm, beds, baths, source, freshDays, verified, details
  ["Ayala Triangle 2BR", "Makati", "Metro Manila", 14.5629, 121.0242, "condo", "sale", 24500000, 92, 2, 2, "lamudi", 4, true,
    { addr: "Ayala Ave cor Paseo de Roxas, Bel-Air", park: 1, furn: "semi", desc: "Corner 2-bedroom unit overlooking Ayala Triangle Gardens, walking distance to Ayala and Salcedo CBD offices.", feat: ["Pool & gym", "24/7 security", "Balcony", "Pet-friendly", "Near MRT Ayala"] }],
  ["Salcedo Studio", "Makati", "Metro Manila", 14.5581, 121.0178, "condo", "sale", 8900000, 31, 1, 1, "lamudi", 11, false,
    { addr: "Tordesillas St, Salcedo Village", park: 0, furn: "fully", desc: "Fully furnished studio in the heart of Salcedo Village — ideal rental investment near the Saturday market.", feat: ["Fully furnished", "Gym", "Concierge", "High rental demand"] }],
  ["Poblacion Loft", "Makati", "Metro Manila", 14.5695, 121.0294, "condo", "sale", 9800000, 38, 1, 1, "zipmatch", 26, false,
    { addr: "Don Pedro St, Poblacion", park: 0, furn: "semi", desc: "Industrial-style loft in Poblacion's café district, high ceilings and mezzanine bed area.", feat: ["High ceilings", "Mezzanine", "Rooftop deck", "Walkable nightlife"] }],
  ["Legazpi Village 2BR (for rent)", "Makati", "Metro Manila", 14.5554, 121.0211, "condo", "rent", 85000, 65, 2, 1, "rentpad", 3, false,
    { addr: "Legazpi St, Legazpi Village", park: 1, furn: "fully", desc: "Fully furnished 2-bedroom rental with parking, two blocks from Greenbelt.", feat: ["Fully furnished", "1 parking slot", "Pool", "Near Greenbelt"] }],
  ["Uptown BGC 3BR", "Taguig", "Metro Manila", 14.552, 121.052, "condo", "sale", 39500000, 128, 3, 2, "property24", 8, true,
    { addr: "36th St, Uptown Bonifacio", park: 2, furn: "semi", desc: "High-floor 3-bedroom at Uptown Bonifacio with unobstructed skyline views and two tandem parking slots.", feat: ["High floor", "2 parking slots", "Sky lounge", "Mall-connected", "Maid's room"] }],
  ["Burgos Circle 1BR", "Taguig", "Metro Manila", 14.5549, 121.0579, "condo", "sale", 14200000, 44, 1, 1, "lamudi", 17, false,
    { addr: "Forbestown Rd, Burgos Circle", park: 1, furn: "semi", desc: "1-bedroom facing Burgos Circle park, restaurant row at your doorstep.", feat: ["Park view", "1 parking slot", "Gym & pool", "Balcony"] }],
  ["BGC 1BR (for rent)", "Taguig", "Metro Manila", 14.5508, 121.0505, "condo", "rent", 60000, 40, 1, 1, "rentpad", 5, false,
    { addr: "5th Ave, Bonifacio Global City", park: 0, furn: "fully", desc: "Move-in ready 1-bedroom along 5th Avenue, steps from High Street.", feat: ["Fully furnished", "Near High Street", "Gym", "Fast elevators"] }],
  ["Katipunan 2BR", "Quezon City", "Metro Manila", 14.6345, 121.0903, "condo", "sale", 8700000, 55, 2, 1, "lamudi", 22, false,
    { addr: "Katipunan Ave, Loyola Heights", park: 1, furn: "bare", desc: "2-bedroom across Ateneo and UP Town Center — strong student rental market.", feat: ["Near Ateneo & UP", "1 parking slot", "Study lounge", "Shuttle to LRT"] }],
  ["Tomas Morato Townhouse", "Quezon City", "Metro Manila", 14.633, 121.031, "house", "sale", 16800000, 120, 3, 2, "dotproperty", 41, false,
    { addr: "Scout Rallos St, Sacred Heart", park: 2, furn: "bare", desc: "Three-storey townhouse off Tomas Morato's restaurant strip, newly repainted with a private garage.", feat: ["3 storeys", "2-car garage", "Newly repainted", "Gated compound"] }],
  ["Commonwealth Lot", "Quezon City", "Metro Manila", 14.674, 121.089, "lot", "sale", 6200000, 300, 0, 0, "facebook", 64, false,
    { addr: "Brgy. Commonwealth, near Diliman Doctors", park: 0, furn: "bare", desc: "Flat 300 m² residential lot with clean title, ready for construction, near Commonwealth Avenue.", feat: ["Clean TCT title", "Flat terrain", "Concrete road access", "Utilities on site"] }],
  ["Katipunan Studio (for rent)", "Quezon City", "Metro Manila", 14.6392, 121.0846, "condo", "rent", 25000, 24, 1, 1, "rentpad", 9, false,
    { addr: "Esteban Abada St, Loyola Heights", park: 0, furn: "fully", desc: "Compact furnished studio for students, one jeepney ride from both Ateneo and UP Diliman.", feat: ["Fully furnished", "Study desk", "Laundry area", "Near campuses"] }],
  ["Capital Commons 2BR", "Pasig", "Metro Manila", 14.584, 121.059, "condo", "sale", 15400000, 78, 2, 2, "lamudi", 13, false,
    { addr: "Meralco Ave, Capitol Commons", park: 1, furn: "semi", desc: "2-bedroom above Estancia Mall with park views and hotel-grade amenities.", feat: ["Mall below", "Park view", "1 parking slot", "Function rooms"] }],
  ["Pioneer Condo", "Mandaluyong", "Metro Manila", 14.583, 121.038, "condo", "sale", 9300000, 42, 1, 1, "carousell", 33, false,
    { addr: "Pioneer St, Brgy. Barangka Ilaya", park: 0, furn: "semi", desc: "1-bedroom near the Pioneer-EDSA corridor, quick access to BGC and Ortigas.", feat: ["Near EDSA & MRT", "Pool", "24/7 security", "Balcony"] }],
  ["Meralco Studio (for rent)", "Pasig", "Metro Manila", 14.5795, 121.0615, "condo", "rent", 55000, 27, 1, 1, "rentpad", 6, false,
    { addr: "Meralco Ave, Ortigas Center", park: 1, furn: "fully", desc: "Executive furnished studio along Meralco Avenue for Ortigas-based professionals.", feat: ["Fully furnished", "1 parking slot", "Gym", "Near Ortigas offices"] }],
  ["Bayshore Condo", "Manila", "Metro Manila", 14.582, 120.982, "condo", "sale", 8400000, 38, 1, 1, "lamudi", 29, false,
    { addr: "Roxas Blvd, Malate", park: 0, furn: "semi", desc: "Manila Bay-facing 1-bedroom with the famous sunset view from the 20th floor.", feat: ["Bay view", "Sunset-facing", "Pool", "Near US Embassy"] }],
  ["Ayala Alabang House", "Muntinlupa", "Metro Manila", 14.418, 121.03, "house", "sale", 48000000, 600, 5, 4, "property24", 19, true,
    { addr: "Acacia Ave, Ayala Alabang Village", park: 3, furn: "semi", desc: "Classic 5-bedroom family home on a 600 m² corner lot inside Ayala Alabang Village, mature garden and lanai.", feat: ["Corner lot", "3-car garage", "Garden & lanai", "Village club access", "Maid's quarters"] }],
  ["Festival Mall Condo", "Muntinlupa", "Metro Manila", 14.4289, 121.0397, "condo", "sale", 8800000, 40, 1, 1, "zipmatch", 37, false,
    { addr: "Filinvest City, Alabang", park: 1, furn: "bare", desc: "1-bedroom in Filinvest City's green CBD, connected to Festival Mall.", feat: ["1 parking slot", "Mall-connected", "Jogging paths", "Near Skyway exit"] }],
  ["Aseana 1BR", "Parañaque", "Metro Manila", 14.525, 121.005, "condo", "sale", 9600000, 36, 1, 1, "lamudi", 7, false,
    { addr: "Aseana City, Brgy. Tambo", park: 0, furn: "semi", desc: "Newly turned-over 1-bedroom in Aseana City, minutes from NAIA and Entertainment City.", feat: ["Newly turned over", "Near NAIA", "Pool & gym", "Shuttle service"] }],
  ["BF Homes House", "Parañaque", "Metro Manila", 14.47, 121.01, "house", "sale", 19500000, 350, 4, 3, "facebook", 52, false,
    { addr: "Aguirre Ave, BF Homes", park: 2, furn: "bare", desc: "Renovated 4-bedroom along the Aguirre food strip side streets, big family kitchen and dirty kitchen.", feat: ["Renovated 2023", "2-car garage", "Dirty kitchen", "Gated village"] }],
  ["CAA House", "Las Piñas", "Metro Manila", 14.4705, 121.0142, "house", "sale", 11500000, 200, 3, 2, "carousell", 45, false,
    { addr: "CAA Rd, Brgy. Pulang Lupa", park: 1, furn: "bare", desc: "Solid 3-bedroom family home on a quiet street, close to schools and Alabang-Zapote Road.", feat: ["Quiet street", "1-car garage", "Near schools", "Deep well backup"] }],
  ["Malinta House", "Valenzuela", "Metro Manila", 14.711, 120.982, "house", "sale", 8100000, 150, 3, 2, "carousell", 58, false,
    { addr: "Brgy. Malinta, near MacArthur Hwy", park: 1, furn: "bare", desc: "Practical 3-bedroom starter home near MacArthur Highway, flood-free elevation per owner.", feat: ["Flood-free area", "1-car garage", "Near market", "Concrete fence"] }],
  ["Marikina Heights House", "Marikina", "Metro Manila", 14.635, 121.105, "house", "sale", 12700000, 220, 4, 3, "carousell", 71, false,
    { addr: "Brgy. Marikina Heights", park: 2, furn: "bare", desc: "4-bedroom on elevated ground in Marikina Heights with a view deck and mature mango tree.", feat: ["Elevated lot", "View deck", "2-car garage", "Near Marikina Sports Center"] }],
  ["Hillside House", "Antipolo", "Rizal", 14.587, 121.176, "house", "sale", 13900000, 280, 4, 3, "lamudi", 24, false,
    { addr: "Sumulong Hwy, Brgy. Sta. Cruz", park: 2, furn: "bare", desc: "Overlooking 4-bedroom home off Sumulong Highway — Manila skyline view on clear evenings.", feat: ["Overlooking view", "Cool climate", "2-car garage", "Near Antipolo Cathedral"] }],
  ["Nuvali House", "Santa Rosa", "Laguna", 14.313, 121.109, "house", "sale", 18600000, 240, 4, 3, "property24", 12, true,
    { addr: "Avida Nuvali, Brgy. Don Jose", park: 2, furn: "bare", desc: "4-bedroom in a master-planned Nuvali village, bike trails and lakeside parks minutes away.", feat: ["Master-planned village", "Bike trails", "2-car garage", "Near Miriam & Xavier schools"] }],
  ["Dasmariñas House", "Dasmariñas", "Cavite", 14.329, 120.936, "house", "sale", 9400000, 180, 3, 2, "lamudi", 31, false,
    { addr: "Brgy. Salitran, near DLSU-D", park: 1, furn: "bare", desc: "3-bedroom near De La Salle Dasmariñas — solid boarding-house conversion potential.", feat: ["Near DLSU-D", "1-car garage", "Corner lot", "Water tank"] }],
  ["Tagaytay Ridge House", "Tagaytay", "Cavite", 14.107, 120.96, "house", "sale", 22000000, 240, 4, 3, "dotproperty", 16, false,
    { addr: "Calamba Rd, near Tagaytay Rotonda", park: 2, furn: "semi", desc: "Taal-view 4-bedroom near the ridge, proven Airbnb track record with cool-weather charm.", feat: ["Taal lake view", "Airbnb-ready", "Fireplace", "2-car garage"] }],
  ["Crosswinds Lot", "Tagaytay", "Cavite", 14.1146, 120.9523, "lot", "sale", 9500000, 450, 0, 0, "property24", 48, false,
    { addr: "Crosswinds, Brgy. Iruhin", park: 0, furn: "bare", desc: "450 m² sloping lot inside a pine-themed Tagaytay estate, build your rest house among the trees.", feat: ["Inside gated estate", "Pine surroundings", "Utilities ready", "Clean title"] }],
  ["Balete Farm Lot", "Lipa", "Batangas", 13.941, 121.163, "land", "sale", 4500000, 1500, 0, 0, "dotproperty", 83, false,
    { addr: "Brgy. Balete, Lipa", park: 0, furn: "bare", desc: "1,500 m² farm lot with mature coffee and banana plants, cool Lipa climate, farm-to-market road access.", feat: ["Fruit-bearing trees", "Farm road access", "Cool climate", "Tax declared"] }],
  ["Malolos Townhouse", "Malolos", "Bulacan", 14.855, 120.813, "house", "sale", 6800000, 110, 2, 2, "facebook", 66, false,
    { addr: "Brgy. Bulihan, near Malolos Cathedral", park: 1, furn: "bare", desc: "2-bedroom townhouse in the heritage capital, near the upcoming NLEX-MRT7 corridors.", feat: ["Near PNR Malolos", "1-car garage", "Heritage district", "New roof"] }],
  ["Clark Freeport House", "Mabalacat", "Pampanga", 15.151, 120.586, "house", "sale", 14800000, 320, 4, 3, "dotproperty", 21, false,
    { addr: "Brgy. Dau, near Clark Freeport gate", park: 2, furn: "semi", desc: "4-bedroom near the Clark Freeport gates — expat rental demand from Clark locators.", feat: ["Near Clark Freeport", "Expat rental demand", "2-car garage", "Landscaped garden"] }],
  ["Angeles House", "Angeles", "Pampanga", 15.137, 120.598, "house", "sale", 10500000, 240, 3, 2, "lamudi", 35, false,
    { addr: "Brgy. Balibago, Angeles", park: 2, furn: "bare", desc: "3-bedroom bungalow on a wide 240 m² lot, minutes from Marquee Mall and NLEX.", feat: ["Wide lot", "Bungalow layout", "2-car garage", "Near NLEX exit"] }],
  ["Subic Bayview House", "Olongapo", "Zambales", 14.824, 120.284, "house", "sale", 12900000, 280, 3, 3, "property24", 27, false,
    { addr: "Upper Kalaklan, Olongapo", park: 2, furn: "semi", desc: "Bay-view 3-bedroom above Subic Bay, sea breeze and sunset terrace included.", feat: ["Subic Bay view", "Sunset terrace", "2-car garage", "Near SBMA gate"] }],
  ["Camp Allen Bungalow", "Baguio", "Benguet", 16.412, 120.596, "house", "sale", 18500000, 180, 4, 3, "lamudi", 14, false,
    { addr: "Camp Allen Rd, Baguio", park: 2, furn: "semi", desc: "Pine-shaded 4-bedroom bungalow near Burnham Park, fireplace and attic storage.", feat: ["Fireplace", "Pine trees", "Near Burnham Park", "Attic storage"] }],
  ["Session Road Condo", "Baguio", "Benguet", 16.4133, 120.5986, "condo", "sale", 9200000, 45, 1, 1, "zipmatch", 39, false,
    { addr: "Session Rd, Baguio", park: 0, furn: "semi", desc: "1-bedroom right off Session Road — walk to everything, strong holiday rental rates.", feat: ["City center", "Holiday rental demand", "Elevator building", "Backup power"] }],
  ["Vigan Heritage Casa", "Vigan", "Ilocos Sur", 17.574, 120.387, "house", "sale", 12800000, 280, 4, 3, "dotproperty", 94, false,
    { addr: "Near Calle Crisologo, Vigan", park: 1, furn: "semi", desc: "Restored ancestral-style casa near Calle Crisologo — capiz windows, hardwood floors, B&B potential.", feat: ["Heritage architecture", "Hardwood floors", "B&B potential", "Courtyard"] }],
  ["IT Park Studio", "Cebu City", "Central Visayas", 10.323, 123.901, "condo", "sale", 5800000, 26, 1, 1, "lamudi", 5, false,
    { addr: "Cebu IT Park, Brgy. Apas", park: 0, furn: "fully", desc: "Furnished studio inside Cebu IT Park — BPO rental demand around the clock.", feat: ["Fully furnished", "IT Park address", "24/7 district", "High rental yield"] }],
  ["Banilad 3BR", "Cebu City", "Central Visayas", 10.344, 123.895, "house", "sale", 16500000, 145, 3, 3, "lamudi", 18, false,
    { addr: "Banilad, near Country Mall", park: 2, furn: "semi", desc: "Modern 3-bedroom in a gated Banilad enclave, near international schools and Cebu Country Club.", feat: ["Gated enclave", "Near int'l schools", "2-car garage", "Modern kitchen"] }],
  ["Mactan Beachfront Villa", "Lapu-Lapu", "Central Visayas", 10.316, 123.968, "house", "sale", 65000000, 420, 5, 5, "property24", 10, true,
    { addr: "Punta Engaño, Mactan", park: 3, furn: "fully", desc: "True beachfront 5-bedroom villa on Punta Engaño with private sea access, infinity pool and guest casita.", feat: ["Private beach access", "Infinity pool", "Guest casita", "Fully furnished", "Resort neighbors"] }],
  ["SRP Condo", "Cebu City", "Central Visayas", 10.285, 123.879, "condo", "sale", 11800000, 55, 2, 1, "zipmatch", 23, false,
    { addr: "South Road Properties, Cebu", park: 1, furn: "bare", desc: "Seafront-district 2-bedroom at SRP with sunrise sea views and mall access.", feat: ["Sea view", "1 parking slot", "Near SM Seaside", "New development"] }],
  ["IT Park 1BR (for rent)", "Cebu City", "Central Visayas", 10.3264, 123.9044, "condo", "rent", 35000, 32, 1, 1, "rentpad", 4, false,
    { addr: "Cebu IT Park, Brgy. Apas", park: 0, furn: "fully", desc: "Furnished 1-bedroom for BPO professionals, across from Ayala Central Bloc.", feat: ["Fully furnished", "Across Central Bloc", "Gym & pool", "Flexible lease"] }],
  ["Rizal Blvd Condo", "Dumaguete", "Negros Oriental", 9.307, 123.305, "condo", "sale", 6400000, 48, 1, 1, "dotproperty", 28, false,
    { addr: "Rizal Blvd, Dumaguete", park: 0, furn: "semi", desc: "1-bedroom near the famous Rizal Boulevard promenade — retiree favorite by the sea.", feat: ["Boulevard promenade", "Sea breeze", "Near Silliman U", "Retiree-friendly"] }],
  ["Bacong Beach Lot", "Dumaguete", "Negros Oriental", 9.283, 123.247, "land", "sale", 6900000, 800, 0, 0, "facebook", 77, false,
    { addr: "Coastal road, Bacong", park: 0, furn: "bare", desc: "800 m² beach-side lot south of Dumaguete, gray-sand frontage and clear title.", feat: ["Beach frontage", "Clean title", "Coastal road access", "Power nearby"] }],
  ["Capitol Avenue House", "Bacolod", "Negros Occidental", 10.676, 122.951, "house", "sale", 13500000, 320, 4, 3, "property24", 34, false,
    { addr: "Capitol Heights, Bacolod", park: 2, furn: "bare", desc: "Spacious 4-bedroom near the Capitol Lagoon, wide frontage in the City of Smiles.", feat: ["Wide frontage", "2-car garage", "Near Capitol Lagoon", "Mature neighborhood"] }],
  ["BREDSCO Lot", "Bacolod", "Negros Occidental", 10.654, 122.937, "lot", "sale", 3800000, 250, 0, 0, "facebook", 88, false,
    { addr: "BREDSCO Village, Bacolod", park: 0, furn: "bare", desc: "250 m² inner lot in an established Bacolod subdivision, all utilities at the curb.", feat: ["Established subdivision", "Utilities ready", "Clean title", "Flood-free"] }],
  ["Megaworld Blvd Condo", "Iloilo City", "Western Visayas", 10.716, 122.562, "condo", "sale", 7900000, 50, 1, 1, "lamudi", 9, false,
    { addr: "Megaworld Blvd, Iloilo Business Park", park: 1, furn: "semi", desc: "1-bedroom in Iloilo Business Park — festival walk, offices and the convention center at your door.", feat: ["Business Park address", "1 parking slot", "Near convention center", "Esplanade nearby"] }],
  ["Jaro Heritage House", "Iloilo City", "Western Visayas", 10.747, 122.565, "house", "sale", 17500000, 400, 5, 4, "dotproperty", 61, false,
    { addr: "Jaro district, Iloilo City", park: 2, furn: "semi", desc: "Grand 5-bedroom near Jaro Cathedral blending heritage bones with a modern kitchen and bathrooms.", feat: ["Heritage district", "Modern kitchen", "5 bedrooms", "Garden courtyard"] }],
  ["Bajada 3BR", "Davao City", "Davao", 7.085, 125.612, "house", "sale", 12500000, 140, 3, 2, "lamudi", 15, false,
    { addr: "J.P. Laurel Ave area, Bajada", park: 2, furn: "bare", desc: "3-bedroom in central Bajada, minutes from Abreeza Mall and Davao Doctors.", feat: ["Central location", "2-car garage", "Near Abreeza", "Concrete perimeter"] }],
  ["Matina House", "Davao City", "Davao", 7.051, 125.56, "house", "sale", 9800000, 220, 3, 2, "dotproperty", 42, false,
    { addr: "Matina Crossing, Davao City", park: 1, furn: "bare", desc: "Family 3-bedroom on a 220 m² lot in Matina, fruit trees and space to extend.", feat: ["Fruit trees", "Extendable lot", "1-car garage", "Near McArthur Hwy"] }],
  ["Samal Island Lot", "Island Garden City of Samal", "Davao", 7.095, 125.71, "land", "sale", 5500000, 1000, 0, 0, "facebook", 69, false,
    { addr: "Brgy. Babak, Samal Island", park: 0, furn: "bare", desc: "1,000 m² island lot minutes from the barge landing — beach resorts and the upcoming Samal bridge nearby.", feat: ["Island living", "Near Samal bridge site", "Gentle slope", "Tax declared"] }],
  ["Xavier Estates House", "Cagayan de Oro", "Northern Mindanao", 8.482, 124.647, "house", "sale", 11200000, 250, 4, 3, "property24", 25, false,
    { addr: "Xavier Estates, Upper Balulang", park: 2, furn: "bare", desc: "4-bedroom in Xavier Estates uptown CDO — cooler air, city views, gated security.", feat: ["Uptown location", "City view", "Gated estate", "2-car garage"] }],
  ["Lapasan Condo", "Cagayan de Oro", "Northern Mindanao", 8.4787, 124.6533, "condo", "sale", 4900000, 40, 1, 1, "zipmatch", 36, false,
    { addr: "Lapasan, near Limketkai Center", park: 0, furn: "semi", desc: "1-bedroom beside Limketkai Center — mall, groceries and offices in walking distance.", feat: ["Beside Limketkai", "Walkable", "Pool", "Backup power"] }],
  ["Lagao House", "General Santos", "Soccsksargen", 6.116, 125.172, "house", "sale", 6500000, 200, 3, 2, "facebook", 74, false,
    { addr: "Brgy. Lagao, General Santos", park: 1, furn: "bare", desc: "3-bedroom in Lagao near SM GenSan, level 200 m² lot with mango tree.", feat: ["Near SM GenSan", "Level lot", "1-car garage", "Mango tree"] }],
  ["Pasonanca House", "Zamboanga City", "Zamboanga Peninsula", 6.921, 122.079, "house", "sale", 7200000, 260, 4, 3, "property24", 57, false,
    { addr: "Pasonanca, Zamboanga City", park: 2, furn: "bare", desc: "4-bedroom near Pasonanca Park — cool, leafy district above the city.", feat: ["Near Pasonanca Park", "Leafy district", "2-car garage", "Water tank"] }],
  ["El Nido Cliff Lot", "El Nido", "Palawan", 11.18, 119.39, "land", "sale", 9800000, 600, 0, 0, "dotproperty", 20, true,
    { addr: "Corong-Corong, El Nido", park: 0, furn: "bare", desc: "600 m² cliffside lot above Corong-Corong Bay — sunset views over Bacuit's limestone islands.", feat: ["Bay sunset view", "Titled", "Boutique resort zoning", "Road access"] }],
  ["Puerto Princesa Villa", "Puerto Princesa", "Palawan", 9.739, 118.735, "house", "sale", 15800000, 350, 4, 4, "property24", 44, false,
    { addr: "Brgy. San Pedro, Puerto Princesa", park: 2, furn: "semi", desc: "Tropical 4-bedroom villa with a pool near Puerto Princesa's baywalk, cathedral and airport.", feat: ["Private pool", "Near airport", "Tropical garden", "2-car garage"] }],
  ["Panglao Pool Villa", "Panglao", "Bohol", 9.551, 123.774, "house", "sale", 42000000, 380, 4, 4, "lamudi", 6, true,
    { addr: "Near Alona Beach, Panglao", park: 2, furn: "fully", desc: "Turnkey 4-suite pool villa five minutes from Alona Beach, operating as a licensed vacation rental.", feat: ["Licensed vacation rental", "Private pool", "Fully furnished", "Near Alona Beach", "Staff quarters"] }],
  ["Tagbilaran Condo", "Tagbilaran", "Bohol", 9.654, 123.853, "condo", "sale", 5200000, 45, 1, 1, "zipmatch", 32, false,
    { addr: "CPG Ave, Tagbilaran", park: 0, furn: "semi", desc: "1-bedroom along CPG Avenue — gateway base for Panglao beaches and Chocolate Hills trips.", feat: ["City center", "Near seaport", "Elevator building", "Backup power"] }],
  ["Mayon View Farm Lot", "Legazpi", "Albay", 13.139, 123.736, "land", "sale", 2900000, 1200, 0, 0, "facebook", 91, false,
    { addr: "Brgy. Buyuan, Legazpi", park: 0, furn: "bare", desc: "1,200 m² farm lot with a postcard view of Mayon Volcano, coconut-lined boundary.", feat: ["Mayon view", "Coconut trees", "Farm road access", "Tax declared"] }],
  ["Aguinaldo Lot", "Butuan", "Agusan del Norte", 8.949, 125.543, "lot", "sale", 2400000, 400, 0, 0, "facebook", 96, false,
    { addr: "J.C. Aquino Ave area, Butuan", park: 0, furn: "bare", desc: "400 m² residential lot near Butuan's main avenue, level and ready to build.", feat: ["Level lot", "Near main avenue", "Utilities nearby", "Clean title"] }],
  ["Real St House", "Tacloban", "Leyte", 11.244, 125.003, "house", "sale", 5900000, 180, 3, 2, "property24", 63, false,
    { addr: "Real St, Tacloban", park: 1, furn: "bare", desc: "3-bedroom along Real Street, rebuilt post-Yolanda with reinforced roofing.", feat: ["Reinforced roofing", "City center", "1-car garage", "Near schools"] }],
  ["Magsaysay Condo", "Naga", "Camarines Sur", 13.621, 123.193, "condo", "sale", 4600000, 42, 1, 1, "zipmatch", 47, false,
    { addr: "Magsaysay Ave, Naga", park: 0, furn: "semi", desc: "1-bedroom on Naga's restaurant avenue, near Ateneo de Naga and CBD offices.", feat: ["Restaurant avenue", "Near Ateneo de Naga", "Elevator building", "Study nook"] }],
  ["Vertis North 2BR", "Quezon City", "Metro Manila", 14.654, 121.033, "condo", "sale", 13500000, 60, 2, 2, "onepropertee", 8, false,
    { addr: "Vertis North, Brgy. Bagong Pag-asa", park: 1, furn: "semi", desc: "2-bedroom in Vertis North above the TriNoma-Ayala corridor, beside the future MRT-7 interchange.", feat: ["Mall-connected", "1 parking slot", "Near MRT interchange", "Sky garden"] }],
  ["Lancaster New City House", "Imus", "Cavite", 14.42, 120.94, "house", "sale", 4800000, 100, 3, 2, "onepropertee", 12, false,
    { addr: "Lancaster New City, Brgy. Alapan", park: 1, furn: "bare", desc: "Affordable 3-bedroom in a master-planned Cavite township with its own church, school and shuttle to Manila.", feat: ["Township amenities", "1-car garage", "Shuttle service", "Near CAVITEX"] }],
  ["Esplanade Townhouse", "Iloilo City", "Western Visayas", 10.702, 122.545, "house", "sale", 8900000, 120, 3, 2, "onepropertee", 30, false,
    { addr: "Near Iloilo River Esplanade", park: 1, furn: "bare", desc: "3-bedroom townhouse a short walk from the Iloilo Esplanade jogging path and riverside cafés.", feat: ["Near Esplanade", "1-car garage", "Bike-friendly area", "Flood-managed zone"] }],
  ["Eastwood City 1BR", "Quezon City", "Metro Manila", 14.61, 121.08, "condo", "sale", 7800000, 40, 1, 1, "myproperty", 19, false,
    { addr: "Eastwood City, Bagumbayan", park: 0, furn: "fully", desc: "Furnished 1-bedroom in Eastwood City's 24/7 BPO hub — reliable tenant pipeline year-round.", feat: ["Fully furnished", "24/7 district", "Mall below", "High rental demand"] }],
  ["Cebu Business Park 2BR", "Cebu City", "Central Visayas", 10.318, 123.905, "condo", "sale", 14500000, 75, 2, 2, "myproperty", 7, true,
    { addr: "Mindanao Ave, Cebu Business Park", park: 1, furn: "semi", desc: "2-bedroom beside Ayala Center Cebu with garden-city views over the business park.", feat: ["Beside Ayala Center", "1 parking slot", "Park view", "Verified developer unit"] }],
  ["Ecoland House", "Davao City", "Davao", 7.052, 125.599, "house", "sale", 8400000, 180, 3, 2, "myproperty", 26, false,
    { addr: "Ecoland Subdivision, Matina", park: 2, furn: "bare", desc: "3-bedroom in established Ecoland, minutes from SM Ecoland and the airport road.", feat: ["Established subdivision", "2-car garage", "Near SM Ecoland", "Corner lot"] }],
  ["Rockwell Proscenium 2BR", "Makati", "Metro Manila", 14.565, 121.037, "condo", "sale", 32000000, 110, 2, 2, "hoppler", 9, true,
    { addr: "Estrella St, Rockwell Center", park: 2, furn: "semi", desc: "Broker-verified 2-bedroom in Rockwell Center with Power Plant Mall privileges and river-side views.", feat: ["Rockwell address", "2 parking slots", "Concierge", "Broker-verified"] }],
  ["Greenhills Townhouse", "San Juan", "Metro Manila", 14.601, 121.048, "house", "sale", 25000000, 240, 4, 4, "hoppler", 21, false,
    { addr: "Near Greenhills Shopping Center", park: 2, furn: "bare", desc: "4-bedroom townhouse in a gated Greenhills compound, walking distance to shops and schools.", feat: ["Gated compound", "2-car garage", "Near Greenhills mall", "Newly renovated baths"] }],
  ["Ortigas 1BR (for rent)", "Pasig", "Metro Manila", 14.586, 121.061, "condo", "rent", 38000, 36, 1, 1, "hoppler", 5, false,
    { addr: "ADB Ave, Ortigas Center", park: 0, furn: "fully", desc: "Furnished 1-bedroom in Ortigas Center, managed by a licensed broker with e-signing lease.", feat: ["Fully furnished", "Licensed broker", "Near Megamall", "Flexible terms"] }],
  ["Mandaue Family House", "Mandaue", "Central Visayas", 10.343, 123.933, "house", "sale", 9500000, 160, 3, 2, "filipinohomes", 17, false,
    { addr: "Brgy. Basak, Mandaue", park: 1, furn: "bare", desc: "3-bedroom between Cebu City and the airport bridge — practical base for Mactan commuters.", feat: ["Near airport bridge", "1-car garage", "Quiet street", "Water tank"] }],
  ["Moalboal Beach Lot", "Moalboal", "Central Visayas", 9.94, 123.39, "land", "sale", 4200000, 500, 0, 0, "filipinohomes", 55, false,
    { addr: "Coastal road, Moalboal", park: 0, furn: "bare", desc: "500 m² lot minutes from Panagsama Beach and the sardine run — dive-resort country.", feat: ["Near dive spots", "Clean title", "Coastal road access", "Tourism zoning"] }],
  ["Dauis Residential Lot", "Dauis", "Bohol", 9.626, 123.866, "lot", "sale", 3100000, 300, 0, 0, "filipinohomes", 44, false,
    { addr: "Brgy. Biking, Dauis, Panglao Island", park: 0, furn: "bare", desc: "300 m² lot on the Panglao side of the bridge, ten minutes from the new international airport.", feat: ["Near Panglao airport", "Level lot", "Clean title", "Power & water nearby"] }],
  ["Makati CBD Studio (for rent)", "Makati", "Metro Manila", 14.556, 121.023, "condo", "rent", 28000, 26, 1, 1, "rentph", 6, false,
    { addr: "Dela Rosa St, Legazpi Village", park: 0, furn: "fully", desc: "Compact furnished studio on the Dela Rosa walkway network — dry walk to most Makati CBD towers.", feat: ["Fully furnished", "Covered walkway access", "Gym", "Near supermarket"] }],
  ["Alabang 2BR (for rent)", "Muntinlupa", "Metro Manila", 14.425, 121.035, "condo", "rent", 55000, 58, 2, 2, "rentph", 11, false,
    { addr: "Madrigal Business Park, Alabang", park: 1, furn: "semi", desc: "2-bedroom rental in Madrigal Business Park with parking, near ATC and international schools.", feat: ["1 parking slot", "Near Alabang Town Center", "Family-friendly", "Balcony"] }],
  ["IT Park 2BR (for rent)", "Cebu City", "Central Visayas", 10.328, 123.906, "condo", "rent", 55000, 55, 2, 2, "rentph", 8, false,
    { addr: "Cebu IT Park, Brgy. Apas", park: 1, furn: "fully", desc: "Furnished 2-bedroom inside IT Park for sharers or a small family, walking distance to offices.", feat: ["Fully furnished", "1 parking slot", "Pool & gym", "24/7 district"] }],
  ["Shore Residences 1BR", "Pasay", "Metro Manila", 14.532, 120.982, "condo", "sale", 6900000, 32, 1, 1, "ohmyhome", 14, false,
    { addr: "Seaside Blvd, Mall of Asia Complex", park: 0, furn: "semi", desc: "1-bedroom in the MOA complex — resort-style amenities and bay-area events at your doorstep.", feat: ["MOA complex", "Resort amenities", "Near airport", "Rental-ready"] }],
  ["Molino Starter House", "Bacoor", "Cavite", 14.39, 120.97, "house", "sale", 5600000, 110, 3, 2, "ohmyhome", 23, false,
    { addr: "Molino Blvd, Bacoor", park: 1, furn: "bare", desc: "3-bedroom starter home off Molino Boulevard, fixed-fee brokerage with paperwork assistance.", feat: ["Fixed-fee brokerage", "1-car garage", "Near Molino Blvd", "Paperwork assistance"] }],
];

export const LISTINGS: Listing[] = rows.map((r, i) => ({
  id: `${r[1].toLowerCase().replace(/[^a-z]+/g, "-")}-${i}`,
  name: r[0],
  city: r[1],
  region: r[2],
  address: r[14].addr,
  lat: r[3],
  lng: r[4],
  type: r[5],
  tenure: r[6],
  price: r[7],
  sqm: r[8],
  beds: r[9],
  baths: r[10],
  parking: r[14].park,
  furnished: r[14].furn,
  description: r[14].desc,
  features: r[14].feat,
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

export const FURNISHED_LABELS: Record<Furnished, string> = {
  fully: "Fully furnished",
  semi: "Semi-furnished",
  bare: "Unfurnished",
};
