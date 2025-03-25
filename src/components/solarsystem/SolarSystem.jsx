import React, { useCallback, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { solPlanets } from "./data.js";
import { useTheme } from "../../libs/theme";
import Controls from "./controls";
import { Planet } from "./Planets";
import { Ecliptic, Label } from "./SolarSystemUtils";
import useHoverCursor from "../../libs/hooks/useHoverCursor.js";
import { useFocusUpdate } from "../../libs/focus";

function SolarSystem() {
  const theme = useTheme();

  return (
    <Canvas camera={{ position: [0, 100, 150], fov: 45 }}>
      <Sun color={theme.sunColor} />
      {solPlanets.map((planet) => (
        <Planet key={planet.id} planet={{ ...planet }} />
      ))}
      <Lights />
      <Controls />
      <Stars radius={100} depth={50} count={5000} factor={3} saturation={0.8} />
    </Canvas>
  );
}

function Sun({ color }) {
  const sunRef = useRef();

  const { pushFocus } = useFocusUpdate();

  const onSelect = useCallback(() => {
    pushFocus({
      type: "sun",
      id: 0,
      data: {
        name: "Sun",
        xRadius: 0,
        zRadius: 0,
        size: 5,
        speed: 0,
        objectRef: sunRef,
      },
    });
  }, []);

  useEffect(() => {
    onSelect();
  }, [onSelect]);

  const [, setHovered] = useHoverCursor();

  return (
    <mesh
      ref={sunRef}
      onClick={onSelect}
      onPointerOver={(e) => setHovered(true)}
      onPointerOut={(e) => setHovered(false)}
    >
      <sphereGeometry args={[5, 32, 32]} />
      <meshStandardMaterial
        emissive={color}
        emissiveIntensity={1.5}
        color={color}
      />
    </mesh>
  );
}

function Lights() {
  return (
    <>
      <ambientLight />
      <pointLight position={[0, 0, 0]} decay={0} intensity={Math.PI} />
    </>
  );
}

export default SolarSystem;
