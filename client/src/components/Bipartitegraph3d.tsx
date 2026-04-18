/**
 * BipartiteGraph3D.tsx
 *
 * The Three.js / React-Three-Fiber canvas that renders:
 *   • Cyan spheres for Paper nodes (left hemisphere)
 *   • Green spheres for Patent nodes (right hemisphere)
 *   • Animated lines for SIMILAR_TO edges (colour = similarity strength)
 *
 * Architecture note:
 *   All Three.js sub-components (PaperSphere, PatentSphere, EdgeLine) are
 *   declared in this file because they share scene-level state and are
 *   tightly coupled to the R3F render loop.  UI panels live in their own
 *   files under /panels/.
 */

import React, {
  useRef,
  useMemo,
  useCallback,
  useState,
} from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars, Sparkles, Html } from "@react-three/drei";
import * as THREE from "three";

import {
  PaperNode,
  PatentNode,
  GraphNode,
  SimilarityEdge,
  GraphData,
  PAPER_COLOR,
  PATENT_COLOR,
  EDGE_BASE,
  SelectedEdgeState,
} from "./types/graph.types";


// ── Helpers ───────────────────────────────────────────────────────────────────

/** Pick edge colour from similarity score. */
function edgeColor(sim: number): string {
  if (sim >= 0.8) return "#f472b6";
  if (sim >= 0.6) return "#fb923c";
  if (sim >= 0.4) return "#facc15";
  return EDGE_BASE;
}

/** Scale node radius by a small amount for selected state. */
function nodeRadius(selected: boolean, isHighNeighbour: boolean): number {
  if (selected)        return 0.38;
  if (isHighNeighbour) return 0.28;
  return 0.22;
}

const SCALE = 0.42;   // world-space scale applied to backend positions


// ── Paper sphere ──────────────────────────────────────────────────────────────

interface PaperSphereProps {
  node: PaperNode;
  selected: boolean;
  isNeighbour: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}

function PaperSphere({
  node, selected, isNeighbour, onClick, onDoubleClick,
}: PaperSphereProps) {
  const meshRef  = useRef<THREE.Mesh>(null!);
  const glowRef  = useRef<THREE.Mesh>(null!);
  const ringRef  = useRef<THREE.Mesh>(null!);
  const lastTap  = useRef(0);

  const radius   = nodeRadius(selected, isNeighbour);
  const emissive = selected ? 3.0 : isNeighbour ? 1.8 : 0.9;
  const pos      = [node.x * SCALE, node.y * SCALE, node.z * SCALE] as [number, number, number];

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!meshRef.current) return;
    if (selected) {
      meshRef.current.scale.setScalar(1 + Math.sin(t * 3.5) * 0.05);
      glowRef.current?.scale.setScalar(1.2 + Math.sin(t * 2.0) * 0.08);
      if (ringRef.current) { ringRef.current.visible = true; ringRef.current.rotation.z = t * 0.7; }
    } else {
      meshRef.current.scale.setScalar(1 + Math.sin(t * 1.4 + node.x) * 0.012);
      if (ringRef.current) ringRef.current.visible = isNeighbour;
    }
  });

  function handleClick(e: THREE.Event) {
    (e as any).stopPropagation?.();
    const now = Date.now();
    if (now - lastTap.current < 300) { onDoubleClick(); }
    else                              { onClick(); }
    lastTap.current = now;
  }

  const showLabel = selected || isNeighbour;

  return (
    <group position={pos} onClick={handleClick as any}>
      {/* outer glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 2.8, 20, 20]} />
        <meshBasicMaterial
          color={PAPER_COLOR}
          transparent
          opacity={selected ? 0.14 : isNeighbour ? 0.10 : 0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* main sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          color={PAPER_COLOR}
          emissive={PAPER_COLOR}
          emissiveIntensity={emissive}
          roughness={0.15}
          metalness={0.8}
        />
      </mesh>
      {/* specular dot */}
      <mesh>
        <sphereGeometry args={[radius * 0.35, 12, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={selected ? 0.9 : 0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* orbit ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[radius * 1.9, radius * 0.08, 12, 80]} />
        <meshBasicMaterial color={PAPER_COLOR} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* label */}
      {showLabel && (
        <Html position={[0, radius * 2.8, 0]} center distanceFactor={9}>
          <div style={{
            minWidth: "130px",
            background: "rgba(4,8,18,0.90)",
            border: `1px solid ${PAPER_COLOR}44`,
            borderTop: `2px solid ${PAPER_COLOR}`,
            borderRadius: 10,
            padding: "7px 10px",
            fontFamily: "Inter, system-ui, sans-serif",
            backdropFilter: "blur(14px)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: `${PAPER_COLOR}bb`, textTransform: "uppercase", letterSpacing: "0.10em" }}>
              Paper
            </div>
            <div style={{ fontSize: 11, color: "#fff", fontWeight: 600, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
              {node.title.length > 28 ? node.title.slice(0, 28) + "…" : node.title}
            </div>
            {node.year && (
              <div style={{ fontSize: 9, color: "#7ab8d4", marginTop: 2 }}>{node.year}</div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}


// ── Patent sphere ─────────────────────────────────────────────────────────────

interface PatentSphereProps {
  node: PatentNode;
  selected: boolean;
  isNeighbour: boolean;
  onClick: () => void;
  onDoubleClick: () => void;
}

function PatentSphere({
  node, selected, isNeighbour, onClick, onDoubleClick,
}: PatentSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const glowRef = useRef<THREE.Mesh>(null!);
  const ringRef = useRef<THREE.Mesh>(null!);
  const lastTap = useRef(0);

  const radius   = nodeRadius(selected, isNeighbour);
  const emissive = selected ? 3.0 : isNeighbour ? 1.8 : 0.9;
  const pos      = [node.x * SCALE, node.y * SCALE, node.z * SCALE] as [number, number, number];

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!meshRef.current) return;
    if (selected) {
      meshRef.current.scale.setScalar(1 + Math.sin(t * 3.5) * 0.05);
      glowRef.current?.scale.setScalar(1.2 + Math.sin(t * 2.0) * 0.08);
      if (ringRef.current) { ringRef.current.visible = true; ringRef.current.rotation.z = t * 0.7; }
    } else {
      meshRef.current.scale.setScalar(1 + Math.sin(t * 1.4 + node.y) * 0.012);
      if (ringRef.current) ringRef.current.visible = isNeighbour;
    }
  });

  function handleClick(e: THREE.Event) {
    (e as any).stopPropagation?.();
    const now = Date.now();
    if (now - lastTap.current < 300) { onDoubleClick(); }
    else                              { onClick(); }
    lastTap.current = now;
  }

  const showLabel = selected || isNeighbour;

  return (
    <group position={pos} onClick={handleClick as any}>
      <mesh ref={glowRef}>
        <sphereGeometry args={[radius * 2.8, 20, 20]} />
        <meshBasicMaterial color={PATENT_COLOR} transparent opacity={selected ? 0.14 : isNeighbour ? 0.10 : 0.04} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial color={PATENT_COLOR} emissive={PATENT_COLOR} emissiveIntensity={emissive} roughness={0.15} metalness={0.8} />
      </mesh>
      <mesh>
        <sphereGeometry args={[radius * 0.35, 12, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={selected ? 0.9 : 0.35} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* box-shaped indicator (patents = more "engineered" look) */}
      <mesh ref={ringRef} rotation={[0, Math.PI / 4, Math.PI / 2]}>
        <torusGeometry args={[radius * 1.9, radius * 0.08, 4, 4]} />
        <meshBasicMaterial color={PATENT_COLOR} transparent opacity={0.7} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {showLabel && (
        <Html position={[0, radius * 2.8, 0]} center distanceFactor={9}>
          <div style={{
            minWidth: "130px",
            background: "rgba(4,8,18,0.90)",
            border: `1px solid ${PATENT_COLOR}44`,
            borderTop: `2px solid ${PATENT_COLOR}`,
            borderRadius: 10,
            padding: "7px 10px",
            fontFamily: "Inter, system-ui, sans-serif",
            backdropFilter: "blur(14px)",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: `${PATENT_COLOR}bb`, textTransform: "uppercase", letterSpacing: "0.10em" }}>
              Patent
            </div>
            <div style={{ fontSize: 11, color: "#fff", fontWeight: 600, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis" }}>
              {node.title.length > 28 ? node.title.slice(0, 28) + "…" : node.title}
            </div>
            {node.year && (
              <div style={{ fontSize: 9, color: "#86efac", marginTop: 2 }}>{node.year}</div>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}


// ── Similarity edge ───────────────────────────────────────────────────────────

interface EdgeLineProps {
  edge: SimilarityEdge;
  startPos: [number, number, number];
  endPos:   [number, number, number];
  highlighted: boolean;
  onEdgeClick: (edge: SimilarityEdge, sx: number, sy: number) => void;
}

function EdgeLine({ edge, startPos, endPos, highlighted, onEdgeClick }: EdgeLineProps) {
  const particlesRef = useRef<THREE.Mesh[]>([]);
  const tValues      = useRef([Math.random(), Math.random(), Math.random()]);
  const color        = highlighted ? "#a5f3fc" : edgeColor(edge.similarity);
  const opacity      = highlighted ? 0.9 : Math.max(0.18, edge.similarity * 0.7);
  const speed        = 0.3 + edge.similarity * 0.5;

  const points   = useMemo(() => [new THREE.Vector3(...startPos), new THREE.Vector3(...endPos)], [startPos, endPos]);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

  // Mid-point for invisible clickable cylinder
  const midPoint = useMemo(
    () => new THREE.Vector3().addVectors(points[0], points[1]).multiplyScalar(0.5),
    [points],
  );
  const edgeLen  = useMemo(() => points[0].distanceTo(points[1]), [points]);
  const edgeQuat = useMemo(() => {
    const dir = new THREE.Vector3().subVectors(points[1], points[0]).normalize();
    return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
  }, [points]);

  useFrame((_, delta) => {
    tValues.current = tValues.current.map(t => (t + delta * speed) % 1);
    particlesRef.current.forEach((p, i) => {
      if (p) p.position.lerpVectors(points[0], points[1], tValues.current[i]);
    });
  });

  function handleClick(e: any) {
    e.stopPropagation?.();
    onEdgeClick(edge, e.nativeEvent?.clientX ?? 400, e.nativeEvent?.clientY ?? 300);
  }

  return (
    <group>
      <line geometry={geometry}>
        <lineBasicMaterial color={color} transparent opacity={opacity} depthWrite={false} />
      </line>
      {/* animated particles along the edge */}
      {(highlighted || edge.similarity >= 0.4) &&
        [0, 1, 2].map(i => (
          <mesh key={i} ref={el => { if (el) particlesRef.current[i] = el; }}>
            <sphereGeometry args={[0.055, 8, 8]} />
            <meshBasicMaterial color={color} transparent opacity={0.88} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        ))
      }
      {/* invisible cylinder for easy clicking */}
      <mesh position={midPoint} quaternion={edgeQuat} onClick={handleClick}>
        <cylinderGeometry args={[0.18, 0.18, edgeLen, 6]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}


// ── The full 3-D scene ────────────────────────────────────────────────────────

interface SceneProps {
  data: GraphData;
  selectedId: string | null;
  onNodeClick: (node: GraphNode) => void;
  onNodeDoubleClick: (node: GraphNode) => void;
  onEdgeClick: (edge: SimilarityEdge, sx: number, sy: number) => void;
}

function Scene({ data, selectedId, onNodeClick, onNodeDoubleClick, onEdgeClick }: SceneProps) {
  // Map from id → position for edge endpoint lookups
  const paperPosMap  = useMemo(() => {
    const m = new Map<string, [number, number, number]>();
    data.papers.forEach(p => m.set(p.id, [p.x * SCALE, p.y * SCALE, p.z * SCALE]));
    return m;
  }, [data.papers]);

  const patentPosMap = useMemo(() => {
    const m = new Map<string, [number, number, number]>();
    data.patents.forEach(p => m.set(p.id, [p.x * SCALE, p.y * SCALE, p.z * SCALE]));
    return m;
  }, [data.patents]);

  // Which nodes are neighbours of the selected node?
  const neighbourIds = useMemo(() => {
    if (!selectedId) return new Set<string>();
    const ids = new Set<string>();
    data.edges.forEach(e => {
      if (e.source === selectedId) ids.add(e.target);
      if (e.target === selectedId) ids.add(e.source);
    });
    return ids;
  }, [selectedId, data.edges]);

  const connectedEdgeIds = useMemo(() => {
    if (!selectedId) return new Set<string>();
    const ids = new Set<string>();
    data.edges.forEach(e => {
      if (e.source === selectedId || e.target === selectedId) ids.add(e.id);
    });
    return ids;
  }, [selectedId, data.edges]);

  return (
    <>
      {/* ── Lighting ── */}
      <ambientLight intensity={0.18} />
      <pointLight position={[-18, 12, 10]}  intensity={1.4} color={PAPER_COLOR}  />
      <pointLight position={[ 18, 12, 10]}  intensity={1.4} color={PATENT_COLOR} />
      <pointLight position={[  0, -8, -8]}  intensity={0.6} color="#7c4dff"      />
      <directionalLight position={[4, 10, 8]} intensity={0.5} color="#ffffff" />
      <hemisphereLight args={["#0d2340", "#000000", 0.4]} />

      {/* ── Background ── */}
      <Stars radius={160} depth={60} count={2200} factor={2.8} saturation={0.1} fade speed={0.08} />
      <Sparkles count={40} scale={70} size={1.4} speed={0.1} color={PAPER_COLOR}  opacity={0.04} />
      <Sparkles count={40} scale={70} size={1.4} speed={0.1} color={PATENT_COLOR} opacity={0.04} />

      {/* ── Vertical separator plane (purely decorative) ── */}
      <mesh position={[0, 0, 0]} rotation={[0, 0, 0]}>
        <planeGeometry args={[0.012, 60]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.06} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Edges ── */}
      {data.edges.map(edge => {
        const start = paperPosMap.get(edge.source);
        const end   = patentPosMap.get(edge.target);
        if (!start || !end) return null;
        return (
          <EdgeLine
            key={edge.id}
            edge={edge}
            startPos={start}
            endPos={end}
            highlighted={connectedEdgeIds.has(edge.id)}
            onEdgeClick={onEdgeClick}
          />
        );
      })}

      {/* ── Paper nodes (left / cyan) ── */}
      {data.papers.map(paper => (
        <PaperSphere
          key={paper.id}
          node={paper}
          selected={paper.id === selectedId}
          isNeighbour={neighbourIds.has(paper.id)}
          onClick={() => onNodeClick(paper)}
          onDoubleClick={() => onNodeDoubleClick(paper)}
        />
      ))}

      {/* ── Patent nodes (right / green) ── */}
      {data.patents.map(patent => (
        <PatentSphere
          key={patent.id}
          node={patent}
          selected={patent.id === selectedId}
          isNeighbour={neighbourIds.has(patent.id)}
          onClick={() => onNodeClick(patent)}
          onDoubleClick={() => onNodeDoubleClick(patent)}
        />
      ))}
    </>
  );
}


// ── Exported canvas wrapper ───────────────────────────────────────────────────

interface BipartiteGraph3DProps {
  data: GraphData;
  selectedId:        string | null;
  onNodeSelect:      (node: GraphNode) => void;
  onNodeInvestigate: (node: GraphNode) => void;
  onEdgeSelect:      (state: SelectedEdgeState) => void;
  onDeselect:        () => void;
}

const BipartiteGraph3D: React.FC<BipartiteGraph3DProps> = ({
  data,
  selectedId,
  onNodeSelect,
  onNodeInvestigate,
  onEdgeSelect,
  onDeselect,
}) => {
  const handleEdgeClick = useCallback(
    (edge: SimilarityEdge, sx: number, sy: number) => {
      onEdgeSelect({ edge, screenX: sx, screenY: sy });
    },
    [onEdgeSelect],
  );

  return (
    <Canvas
      camera={{ position: [0, 8, 36], fov: 46, near: 0.1, far: 200 }}
      gl={{
        antialias:           true,
        alpha:               true,
        powerPreference:     "high-performance",
        toneMapping:         THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.12,
      }}
      dpr={[1, 2]}
      style={{
        width:      "100%",
        height:     "100%",
        background: "radial-gradient(ellipse at 30% 40%, #060e1f 0%, #020811 100%)",
      }}
      onPointerMissed={onDeselect}
    >
      <fog attach="fog" args={["#030c1a", 45, 110]} />

      <Scene
        data={data}
        selectedId={selectedId}
        onNodeClick={onNodeSelect}
        onNodeDoubleClick={onNodeInvestigate}
        onEdgeClick={handleEdgeClick}
      />

      <OrbitControls
        enablePan
        enableZoom
        enableRotate
        zoomSpeed={0.7}
        rotateSpeed={0.4}
        panSpeed={0.6}
        minDistance={12}
        maxDistance={90}
        enableDamping
        dampingFactor={0.07}
        makeDefault
      />
    </Canvas>
  );
};

export default BipartiteGraph3D;