import React, { useCallback, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { solPlanets } from "./data.js";
import { useTheme } from "../../libs/theme";
import Controls from "./controls";
import { Planet } from "./Planets";
import { Ecliptic, Label } from "./SolarSystemUtils";
import useHoverCursor from "../../libs/hooks/useHoverCursor.js";
import { useFocusUpdate } from "../../libs/focus";
import { useLogListener } from "../../libs/prompt/commandCenter.jsx";
import { animated, useSpring } from "@react-spring/three";
import { Stars } from "../../libs/three/Stars.jsx";

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
      <Stars radius={100} depth={50} count={5000} factor={2} saturation={0.8} />
    </Canvas>
  );
}

const AnimatedMesh = animated("mesh");

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

  const [springs, api] = useSpring(() => ({
    opacity: 0,
    yOffset: 100,
  }));

  useLogListener("initializeSun", async (payload) => {
    return new Promise((resolve) => {
      api.start({
        opacity: 1,
        yOffset: 0,
        from: { opacity: 0, yOffset: 10 },
        config: { duration: 1000 },
        onRest: () => {
          console.log("Sun initialized", springs.yOffset.get());
          resolve();
        },
      });
    });
  });

  return (
    <animated.mesh
      ref={sunRef}
      onClick={onSelect}
      onPointerOver={(e) => setHovered(true)}
      onPointerOut={(e) => setHovered(false)}
      position-y={springs.yOffset}
    >
      <sphereGeometry args={[5, 32, 32]} />
      <animated.meshStandardMaterial
        emissive={color}
        emissiveIntensity={1.5}
        color={color}
        opacity={springs.opacity}
        transparent={true}
      />
    </animated.mesh>
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
