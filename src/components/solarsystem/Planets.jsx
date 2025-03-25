import React, { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useTheme } from "../../libs/theme";
import { useFocus, useFocusUpdate } from "../../libs/focus";
import useHoverCursor from "../../libs/hooks/useHoverCursor.js";
import { Ecliptic, Label } from "./SolarSystemUtils";
import { speedInDaysPerSecond } from "./data.js";

export function Planet({
  planet: {
    xRadius,
    zRadius,
    size,
    daysPerRotation,
    startAngle,
    name,
    id,
    moons,
    inclination,
  },
}) {
  const theme = useTheme();

  const planetRef = useRef();
  const orbitGroupRef = useRef(); // Group to apply inclination
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
        inclination: inclination, // Include inclination in focus data
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
    <group ref={orbitGroupRef} rotation={[0, 0, (inclination * Math.PI) / 180]}>
      <mesh
        ref={planetRef}
        onClick={onSelect}
        onPointerOver={(e) => setHovered(true)}
        onPointerOut={(e) => setHovered(false)}
      >
        <sphereGeometry args={[size, 32, 32]} />
        <meshStandardMaterial color={color} />
        {name.toLowerCase() === "saturn" && <Ring planetSize={size} />}
        {moons.map((moon) => (
          <Moon
            key={moon.id}
            moon={moon}
            planetRef={planetRef}
            planetName={name}
          />
        ))}
        <Label x={size} y={size} z={size} text={name} hide={planetFocus} />
      </mesh>

      <Ecliptic xRadius={xRadius} zRadius={zRadius} />
    </group>
  );
}

function Moon({
  moon: { radius, size, daysPerRotation, inclination, name },
  planetName,
  planetRef,
}) {
  const moonRef = useRef();
  const orbitGroupRef = useRef(); // Group to apply inclination
  const moonAngleRef = useRef(0); // Initialize moon's angle

  const focus = useFocus();
  const isFocus = focus.type === "moon" && focus.data.name === name;
  const parentFocus = focus.type === "planet" && focus.data.name === planetName;

  useFrame(() => {
    if (moonRef.current && planetRef.current) {
      moonAngleRef.current +=
        ((2 * Math.PI) / (daysPerRotation * 8 * 60)) * speedInDaysPerSecond; // Update moon's angle
      const x = radius * 1.8 * Math.cos(moonAngleRef.current);
      const z = radius * 1.8 * Math.sin(moonAngleRef.current);
      moonRef.current.position.set(x, 0, z); // Update moon's position relative to the planet
    }
  });

  return (
    <group
      ref={orbitGroupRef}
      rotation={[0, 0, (inclination * 10 * Math.PI) / 180]}
    >
      <mesh ref={moonRef}>
        <sphereGeometry args={[size * 0.5, 32, 32]} />
        <meshStandardMaterial color="gray" />
        <Label
          x={size * 0.5}
          y={size * 0.5}
          z={size * 0.5}
          text={name}
          fontSize={0.2}
          hide={!parentFocus}
        />
      </mesh>
    </group>
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
