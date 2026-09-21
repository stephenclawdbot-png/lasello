import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { MultiPolygon, Polygon } from "geojson";
import phUrl from "world-atlas/countries-50m.json?url";

export interface Island {
  shape: { points: [number, number][] }[];
}

/** Fetch + carve the Philippines out of world-atlas 50m TopoJSON. */
export async function loadPhilippines(): Promise<Island[]> {
  const res = await fetch(phUrl);
  const topo = (await res.json()) as Topology;
  const fc = feature(topo, topo.objects.countries as GeometryCollection) as unknown as {
    features: { id?: string | number; properties: { name?: string }; geometry: Polygon | MultiPolygon | null }[];
  };
  const ph = fc.features.find((f) => f.id === "PH" || f.id === 608 || f.properties.name === "Philippines");
  if (!ph || !ph.geometry) throw new Error("Philippines not found in world-atlas");

  const polys: [number, number][][][] =
    ph.geometry.type === "MultiPolygon"
      ? (ph.geometry.coordinates as [number, number][][][])
      : [ph.geometry.coordinates as [number, number][][]];

  return polys.map((rings) => ({
    // outer ring only — 50m island outlines carry no meaningful holes
    shape: [{ points: rings[0].map(([lng, lat]) => [lng, lat] as [number, number]) }],
  }));
}