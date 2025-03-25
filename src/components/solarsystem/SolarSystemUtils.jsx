import React, { useEffect, useRef, useState } from "react";
import { BufferGeometry, Vector3 } from "three";
import { animated, useSpring } from "@react-spring/three";
import { Billboard, Text } from "@react-three/drei";
import { useTheme } from "../../libs/theme";
import { useEventListener } from "ahooks";
import { useLogListener } from "../../libs/prompt/commandCenter";

export function Ecliptic({ xRadius = 1, zRadius = 1 }) {
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

  const [springs, api] = useSpring(() => ({
    opacity: 0,
  }));

  useLogListener("initializePlanet", async (payload) => {
    return new Promise((resolve) => {
      api.start({
        opacity: 1,
        from: { opacity: 0 },
        config: { duration: 700 },
        onRest: () => {
          resolve();
        },
      });
    });
  });

  return (
    <line geometry={lineGeometry}>
      <animated.lineBasicMaterial
        attach="material"
        color={theme.eclipticColor}
        linewidth={10}
        opacity={springs.opacity}
        transparent
      />
    </line>
  );
}

const AnimatedLineBasicMaterial = animated("lineBasicMaterial");
const AnimatedText = animated(Text);

export function Label({ x, y, z, text, fontSize, hide }) {
  const theme = useTheme();

  const textRef = useRef();

  const linePoints = [
    new Vector3(0, 0, 0), // Start at the planet's center
    new Vector3(x, y, z), // End at the text anchor point
    new Vector3(x, y, z), // Extend slightly to create an underline
  ];
  const lineGeometryRef = useRef(
    new BufferGeometry().setFromPoints(linePoints),
  );
  useEventListener(
    "synccomplete",
    () => {
      const blockBounds = textRef.current.textRenderInfo.blockBounds;
      const width = blockBounds[2] - blockBounds[0];
      // Update the last point of the line
      linePoints[2].x = x + width;
      lineGeometryRef.current.setFromPoints(linePoints);
      lineGeometryRef.current.attributes.position.needsUpdate = true; // Notify Three.js of the update
      lineGeometryRef.current.computeBoundingSphere();
    },
    {
      target: textRef,
    },
  );

  const [demount, setDemount] = useState(hide);
  const springs = useSpring({
    opacity: hide ? 0 : 1,
    onStart: () => {
      setDemount(false);
    },
    onRest: () => {
      setDemount(hide);
    },
  });

  return (
    !demount && (
      <Billboard follow="true">
        <line geometry={lineGeometryRef.current}>
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
          fontSize={fontSize || 2}
          maxWidth={200}
          lineHeight={1}
          fillOpacity={springs.opacity}
          ref={textRef}
        >
          {text}
        </AnimatedText>
      </Billboard>
    )
  );
}
