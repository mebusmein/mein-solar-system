import React, { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, OrbitControls, Stars, Text } from "@react-three/drei";
import { solPlanets, speedInDaysPerSecond } from "./data.js";
import { useTheme } from "../../libs/theme";
import { BufferGeometry, Color, LineBasicMaterial, Vector3 } from "three";
import { useFocus, useFocusUpdate } from "../../libs/focus";
import { Easing, Group, Tween } from "@tweenjs/tween.js";
import Controls from "./controls";
import { velocity } from "astronomia/elliptic";
import useHoverCursor from "../../libs/hooks/useHoverCursor.js";
import { animated, useSpring } from "@react-spring/three";

function SolarSystem() {
  const theme = useTheme();

  return (
    <Canvas camera={{ position: [0, 20, 90], fov: 45 }}>
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

function Planet({
  planet: { xRadius, zRadius, size, daysPerRotation, startAngle, name, id },
}) {
  const theme = useTheme();

  const planetRef = useRef();
  const angleRef = useRef(startAngle); // Initialize with the starting angle

  const { pushFocus } = useFocusUpdate();
  const focus = useFocus();

  const isFocus = focus.type === "planet" && focus.id === id;
  const planetFocus = focus.type === "planet";

  const [, setHovered] = useHoverCursor();

  const onSelect = () => {
    pushFocus({
      type: "planet",
      id,
      data: {
        name: name,
        xRadius: xRadius,
        zRadius: zRadius,
        size: size,
        daysPerRotation: daysPerRotation,
        objectRef: planetRef,
      },
    });
  };

  // Update the planet's position on each frame
  useFrame(() => {
    if (planetRef.current) {
      angleRef.current +=
        ((2 * Math.PI) / (daysPerRotation * 60)) * speedInDaysPerSecond; // Update angle
      const x = xRadius * Math.cos(angleRef.current);
      const z = zRadius * Math.sin(angleRef.current);
      planetRef.current.position.set(x, 0, z); // Update position

      // Store the current angle in the objectRef for external use
      planetRef.current.angle = angleRef.current;
    }
  });

  const color = theme[`${name.toLowerCase()}Color`] || theme.planetColor;

  return (
    <>
      <mesh
        ref={planetRef}
        onClick={onSelect}
        onPointerOver={(e) => setHovered(true)}
        onPointerOut={(e) => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} />
        {name.toLowerCase() === "saturn" && <Ring planetSize={size} />}
        <Label x={size} y={size} z={size} text={name} hide={planetFocus} />
      </mesh>

      <Ecliptic xRadius={xRadius} zRadius={zRadius} />
    </>
  );
}

function Ring({ planetSize }) {
  const theme = useTheme();

  const ringInnerRadius = planetSize * 1.2;
  const ringOuterRadius = planetSize * 2;

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[ringInnerRadius, ringOuterRadius, 64]} />
      <meshStandardMaterial
        color={theme.ringColor || "gray"}
        side={2} // Double-sided material
        transparent={true}
        opacity={0.8}
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

function Ecliptic({ xRadius = 1, zRadius = 1 }) {
  const theme = useTheme();

  const points = [];
  for (let index = 0; index < 64; index++) {
    const angle = (index / 64) * 2 * Math.PI;
    const x = xRadius * Math.cos(angle);
    const z = zRadius * Math.sin(angle);
    points.push(new Vector3(x, 0, z));
  }
  points.push(points[0]);
  const lineGeometry = new BufferGeometry().setFromPoints(points);
  return (
    <line geometry={lineGeometry}>
      <lineBasicMaterial
        attach="material"
        color={theme.eclipticColor}
        linewidth={10}
      />
    </line>
  );
}

const AnimatedLineBasicMaterial = animated("lineBasicMaterial");
const AnimatedText = animated(Text);

function Label({ x, y, z, text, hide }) {
  const linePoints = [
    new Vector3(0, 0, 0), // Start at the planet's center
    new Vector3(x, y, z), // End at the text anchor point
    new Vector3(x + 2, y, z), // Extend slightly to create an underline
  ];

  const lineGeometry = new BufferGeometry().setFromPoints(linePoints);

  const textRef = useRef();

  useEffect(() => {
    if (textRef.current) {
      textRef.current.sync(() => {});
    }
  }, []);

  const theme = useTheme();

  const springs = useSpring({
    opacity: hide ? 0 : 1,
  });

  return (
    <>
      <Billboard follow="true">
        <line geometry={lineGeometry}>
          <AnimatedLineBasicMaterial
            opacity={springs.opacity}
            transparent={true}
            attach="material"
            color={theme.textColorBillboards}
            linewidth={1}
          />
        </line>
        <AnimatedText
          color={theme.textColorBillboards}
          anchorX="start"
          anchorY="bottom"
          position={[x, y, z]}
          fontSize={2}
          maxWidth={200}
          lineHeight={1}
          fillOpacity={springs.opacity}
          ref={textRef}
        >
          {text}
        </AnimatedText>
      </Billboard>
    </>
  );
}

export default SolarSystem;
