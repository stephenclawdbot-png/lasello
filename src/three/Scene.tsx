import { useMemo, useRef, useEffect, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Html, OrbitControls, Stars, Grid } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import type { Listing } from "../data/listings";
import { perSqm } from "../data/listings";
import { SOURCES } from "../data/sources";
import { percentileRank, tierOfRank, TIER_COLORS, fmtPeso, fmtPsqm } from "../lib/stats";
import { toWorld, type Island } from "../lib/geo";

const ISLAND_MATERIAL = new THREE.MeshStandardMaterial({
  color: new THREE.Color("#e8d5ac"),
  roughness: 0.92,
  metalness: 0.05,
  flatShading: true,
});
const ISLAND_EDGE = new THREE.LineBasicMaterial({ color: new THREE.Color("#4a3c28"), transparent: true, opacity: 0.35 });

function Islands({ islands }: { islands: Island[] }) {
  const geometries = useMemo(() => {
    return islands.map((island) => {
      const shape = new THREE.Shape(island.shape[0].points.map(([lng, lat]) => new THREE.Vector2(lng, lat)));
      const geom = new THREE.ExtrudeGeometry(shape, { depth: 0.055, bevelEnabled: false });
      geom.rotateX(-Math.PI / 2);
      return geom;
    });
  }, [islands]);

  useEffect(() => () => geometries.forEach((g) => g.dispose()), [geometries]);

  return (
    <group position={[-122.5, 0, 12.5]}>
      {geometries.map((geom, i) => (
        <group key={i}>
          <mesh geometry={geom} material={ISLAND_MATERIAL} />
          <lineSegments>
            <edgesGeometry args={[geom, 15]} attach="geometry" />
            <primitive object={ISLAND_EDGE} attach="material" />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

function Pin({
  listing,
  color,
  rank,
  hovered,
  selected,
  onHover,
  onSelect,
}: {
  listing: Listing;
  color: string;
  rank: number;
  hovered: boolean;
  selected: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const ringRef = useRef<THREE.Mesh>(null);
  const [x, z] = toWorld(listing.lat, listing.lng);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ringRef.current && selected) {
      const s = 1 + Math.sin(t * 3.2) * 0.45;
      ringRef.current.scale.set(s, s, s);
      (ringRef.current.material as THREE.MeshBasicMaterial).opacity = 0.85 - (s - 1) * 0.55;
    }
    const target = hovered || selected ? 1.55 : 1;
    if (groupRef.current) {
      groupRef.current.scale.lerp(new THREE.Vector3(target, target, target), 0.18);
    }
  });

  return (
    <group position={[x, 0, z]}>
      <group
        ref={groupRef}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          onHover(listing.id);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation();
          onSelect(listing.id);
        }}
      >
        {/* stem */}
        <mesh position={[0, 0.05 + 0.14, 0]}>
          <cylinderGeometry args={[0.011, 0.011, 0.28, 6]} />
          <meshBasicMaterial color={color} transparent opacity={0.75} />
        </mesh>
        {/* head */}
        <mesh position={[0, 0.05 + 0.31, 0]}>
          <sphereGeometry args={[0.062 + rank * 0.02, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.55} roughness={0.35} />
        </mesh>
      </group>

      {selected && (
        <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.062, 0]}>
          <ringGeometry args={[0.09, 0.13, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}

      {(hovered || selected) && (
        <Html position={[0, 0.55, 0]} center zIndexRange={[40, 10]}>
          <div className="pin-label">
            <div className="pl-box">
              <div className="pl-name">{listing.name}</div>
              <div className="pl-price">
                {fmtPeso(listing.price, listing.tenure === "rent")} · {fmtPsqm(perSqm(listing))}
              </div>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

function Scene({
  islands,
  listings,
  colorBy,
  selectedId,
  onSelect,
  focus,
  onArrived,
}: {
  islands: Island[];
  listings: Listing[];
  colorBy: "price" | "source";
  selectedId: string | null;
  onSelect: (id: string) => void;
  focus: [number, number, number] | null;
  onArrived: () => void;
}) {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const sqmByTenure = useMemo(() => {
    const sale = listings.filter((l) => l.tenure === "sale").map(perSqm);
    const rent = listings.filter((l) => l.tenure === "rent").map(perSqm);
    return { sale, rent };
  }, [listings]);

  useFrame(() => {
    const controls = controlsRef.current;
    if (!focus || !controls) return;
    const cam = controls.object;
    const tx = focus[0] + 0.4;
    const ty = focus[1] + 3.4;
    const tz = focus[2] + 4.6;
    cam.position.lerp(new THREE.Vector3(tx, ty, tz), 0.07);
    controls.target.lerp(new THREE.Vector3(focus[0], focus[1], focus[2]), 0.07);
    controls.update();
    if (cam.position.distanceTo(new THREE.Vector3(tx, ty, tz)) < 0.12) onArrived();
  });

  return (
    <>
      <color attach="background" args={["#071019"]} />
      <fog attach="fog" args={["#071019", 15, 42]} />
      <ambientLight intensity={0.62} />
      <directionalLight position={[6, 10, 5]} intensity={1.1} color="#ffe9cd" />
      <directionalLight position={[-8, 6, -6]} intensity={0.4} color="#7fd6c9" />
      <Stars radius={70} depth={26} count={2200} factor={3} saturation={0} fade speed={0.5} />
      <Grid
        infiniteGrid
        cellSize={1}
        sectionSize={5}
        cellColor="#123049"
        sectionColor="#1b4f63"
        fadeDistance={38}
        fadeStrength={2.2}
        position={[0, -0.02, 0]}
      />

      <Islands islands={islands} />

      {listings.map((l) => {
        const color =
          colorBy === "source"
            ? SOURCES[l.source].color
            : TIER_COLORS[tierOfRank(percentileRank(sqmByTenure[l.tenure], perSqm(l)))];
        return (
          <Pin
            key={l.id}
            listing={l}
            color={color}
            rank={percentileRank(sqmByTenure[l.tenure], perSqm(l))}
            hovered={hoverId === l.id}
            selected={selectedId === l.id}
            onHover={setHoverId}
            onSelect={onSelect}
          />
        );
      })}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={2.6}
        maxDistance={22}
        maxPolarAngle={Math.PI / 2.08}
        autoRotate={!focus && !selectedId}
        autoRotateSpeed={0.4}
        target={[0, 0, 0.6]}
      />
    </>
  );
}

export default function MapCanvas(props: {
  islands: Island[];
  listings: Listing[];
  colorBy: "price" | "source";
  selectedId: string | null;
  onSelect: (id: string) => void;
  focus: [number, number, number] | null;
  onArrived: () => void;
}) {
  return (
    <div className="map-canvas">
      <Canvas
        camera={{ position: [0, 7.6, 10.4], fov: 42 }}
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <Scene {...props} />
      </Canvas>
    </div>
  );
}