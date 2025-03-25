import { useFrame, useThree } from "@react-three/fiber";
import { useFocus } from "../../libs/focus";
import { useGesture } from "@use-gesture/react";
import { useSpring } from "@react-spring/three";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import { speedInDaysPerSecond } from "./data";
import { usePrevious } from "ahooks";

const sunCameraPosition = [0, 20, 140];

export default function Controls() {
  const focus = useFocus();
  const { camera } = useThree();

  const canvasElement = document.querySelector("canvas");

  const animationDuration = 1000;
  const [springs, api] = useSpring(() => ({
    focusPosition: [0, 0, 0],
    cameraPosition: sunCameraPosition,
    config: {
      precision: 0.0001,
      duration: animationDuration,
    },
  }));

  const focusRef = useRef();
  const previousFocus = usePrevious(focus);

  useEffect(() => {
    // set internal focusRef to the current objectRef
    focusRef.current = focus.data?.objectRef?.current;
    if (!focusRef.current) return;
    if (previousFocus?.data?.objectRef?.current === focusRef.current) return;

    let futurePlanetPosition;
    let lookAtPosition;
    let cameraPosition;
    switch (focus.type) {
      case "planet":
        futurePlanetPosition = getFuturePosition(
          focus.data.xRadius,
          focus.data.zRadius,
          focus.data.daysPerRotation,
          focus.data.objectRef.current?.angle || 0,
          animationDuration,
        );
        lookAtPosition = futurePlanetPosition;
        cameraPosition = calculatePlanetCameraPosition(
          futurePlanetPosition,
          focus.data.size,
          [0, 0, 0],
          focus.data.xRadius,
        );
        break;
      default:
        lookAtPosition = [0, 0, 0];
        cameraPosition = sunCameraPosition;
    }

    // set the focus position to the current objectRef's position
    api.start({
      focusPosition: lookAtPosition,
      cameraPosition: cameraPosition,
      from: {
        focusPosition: [
          previousFocus?.data?.objectRef.current.position.x || 0,
          previousFocus?.data?.objectRef.current.position.y || 0,
          previousFocus?.data?.objectRef.current.position.z || 0,
        ],
        cameraPosition: [
          camera.position.x,
          camera.position.y,
          camera.position.z,
        ],
      },
    });
  }, [focus]);

  useFrame(() => {
    const planetCameraPosition = getCameraPosition(focus);

    if (focusRef.current) {
      if (springs.focusPosition.isAnimating) {
        const cameraPos = springs.cameraPosition.get();
        camera.position.set(cameraPos[0], cameraPos[1], cameraPos[2]);

        const pos = springs.focusPosition.get();
        camera.lookAt(pos[0], pos[1], pos[2]);
      } else {
        camera.position.set(
          planetCameraPosition[0],
          planetCameraPosition[1],
          planetCameraPosition[2],
        );

        camera.lookAt(
          focusRef.current.position.x,
          focusRef.current.position.y,
          focusRef.current.position.z,
        );
      }
    }
  });

  return;
}

const getCameraPosition = (focus) => {
  if (focus.type === "planet") {
    return calculatePlanetCameraPosition(
      [
        focus.data.objectRef.current.position.x,
        focus.data.objectRef.current.position.y,
        focus.data.objectRef.current.position.z,
      ],
      focus.data.size,
      [0, 0, 0],
      focus.data.xRadius,
    );
  }
  return sunCameraPosition;
};

function calculatePlanetCameraPosition(
  planetPosition,
  planetSize,
  sunPosition,
  orbitRadius,
  orbitAngleOffset = -0.2, // Default angle offset in radians
) {
  const distanceFromPlanet = planetSize * 5;

  // Calculate the direction vector from the sun to the planet
  const direction = [
    planetPosition[0] - sunPosition[0],
    planetPosition[1] - sunPosition[1],
    planetPosition[2] - sunPosition[2],
  ];

  // Normalize the direction vector
  const magnitude = Math.sqrt(
    direction[0] ** 2 + direction[1] ** 2 + direction[2] ** 2,
  );
  const normalizedDirection = direction.map(
    (component) => component / magnitude,
  );

  // Calculate the perpendicular direction for the orbit shift
  const perpendicularDirection = [
    -normalizedDirection[2], // Swap and negate components for perpendicular vector
    0,
    normalizedDirection[0],
  ];

  // Normalize the perpendicular direction
  const perpendicularMagnitude = Math.sqrt(
    perpendicularDirection[0] ** 2 + perpendicularDirection[2] ** 2,
  );
  const normalizedPerpendicular = perpendicularDirection.map(
    (component) => component / perpendicularMagnitude,
  );

  // Apply the orbit angle offset to shift the camera position
  const shiftedPosition = [
    planetPosition[0] +
      normalizedDirection[0] * distanceFromPlanet +
      normalizedPerpendicular[0] * orbitRadius * Math.sin(orbitAngleOffset),
    planetPosition[1] +
      normalizedDirection[1] * distanceFromPlanet +
      2 * planetSize,
    planetPosition[2] +
      normalizedDirection[2] * distanceFromPlanet +
      normalizedPerpendicular[2] * orbitRadius * Math.sin(orbitAngleOffset),
  ];

  return shiftedPosition;
}

/**
 * Calculates the future position of a celestial body after a given time.
 * @param {number} xRadius - The x-radius of the celestial body's orbit.
 * @param {number} zRadius - The z-radius of the celestial body's orbit.
 * @param {number} daysPerRotation - The number of days it takes for the celestial body to complete one rotation.
 * @param {number} currentAngle - The current angle of the celestial body in radians.
 * @param {number} timeMs - The time in milliseconds to calculate the future position for.
 * @returns {Array<number>} - The future position as a tuple [x, y, z].
 */
function getFuturePosition(
  xRadius,
  zRadius,
  daysPerRotation,
  currentAngle,
  timeMs,
) {
  // Convert time from milliseconds to seconds
  const timeSeconds = timeMs / 1000;

  // Calculate the angular velocity in radians per second
  const angularVelocity = (2 * Math.PI) / (daysPerRotation * 60);

  // Calculate the angle increment based on the time and speed
  const angleIncrement = angularVelocity * timeSeconds * speedInDaysPerSecond;

  // Calculate the new angle
  const newAngle = currentAngle + angleIncrement;

  // Calculate the new position
  const x = xRadius * Math.cos(newAngle);
  const z = zRadius * Math.sin(newAngle);

  return [x, 0, z];
}
