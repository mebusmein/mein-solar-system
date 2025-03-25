import { useFrame, useThree } from "@react-three/fiber";
import { useFocus } from "../../libs/focus";
import { useGesture } from "@use-gesture/react";
import { useSpring } from "@react-spring/three";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";
import { speedInDaysPerSecond } from "./data";
import { usePrevious } from "ahooks";

const sunCameraPosition = new Vector3(0, 100, 150);
const sunFocusPosition = new Vector3(0, 0, 20);

export default function Controls() {
  const focus = useFocus();
  const { camera } = useThree();

  const canvasElement = document.querySelector("canvas");

  const animationDuration = 1000;
  const [springs, api] = useSpring(() => ({
    focusPosition: [0, 0, 0],
    cameraPosition: camera.position.toArray(),
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

    // get the focus object's position
    let focusObjectPosition = getObjectsPosition(focus);

    // calculate the camera position based on the focus object
    let lookAtPosition = focusObjectPosition;
    let cameraPosition = sunCameraPosition;
    switch (focus.type) {
      case "planet":
        lookAtPosition = getFuturePosition(
          focus.data.xRadius,
          focus.data.zRadius,
          focus.data.daysPerRotation,
          focus.data.objectRef.current?.angle || 0,
          animationDuration,
        );
        cameraPosition = calculatePlanetCameraPosition(
          lookAtPosition,
          focus.data.size,
          new Vector3(0, 0, 0),
          focus.data.xRadius,
        );
        break;
      case "moon":
        cameraPosition = calculatePlanetCameraPosition(
          lookAtPosition,
          focus.parent.data.size,
          focus.parent.data.objectRef.current.position,
          focus.parent.data.xRadius,
        );
        break;
      case "sun":
      default:
    }

    // start the camera animation
    const previousFocusPosition = getObjectsPosition(previousFocus);
    api.start({
      focusPosition: lookAtPosition.toArray(),
      cameraPosition: cameraPosition.toArray(),
      from: {
        focusPosition: previousFocusPosition.toArray(),
        cameraPosition: camera.position.toArray(),
      },
    });
  }, [focus]);

  useFrame(() => {
    if (focusRef.current) {
      if (springs.focusPosition.isAnimating) {
        const cameraPos = springs.cameraPosition.get();
        camera.position.set(cameraPos[0], cameraPos[1], cameraPos[2]);

        const pos = springs.focusPosition.get();
        camera.lookAt(pos[0], pos[1], pos[2]);
      } else {
        const cameraPosition = getCameraPosition(focus);
        camera.position.copy(cameraPosition);

        const focusObjectPosition = getObjectsPosition(focus);
        camera.lookAt(
          focusObjectPosition.x,
          focusObjectPosition.y,
          focusObjectPosition.z,
        );
      }
    }
  });

  return;
}

/**
 * Retrieves the position of a celestial object (planet or moon) in the solar system.
 *
 * @param {Object} focus - The object to retrieve the position for.
 * @param {string} focus.type - The type of the object, either "planet" or "moon".
 * @param {Object} focus.data - The data associated with the object.
 * @param {Object} focus.data.objectRef - A reference to the object's 3D representation.
 * @param {Object} focus.data.objectRef.current - The current 3D object instance.
 * @returns {Vector3} The position of the object. Returns (0, 0, 0) if the type is unrecognized.
 */
function getObjectsPosition(focus) {
  if (focus.type === "sun") {
    return sunFocusPosition;
  }
  if (focus.type === "planet") {
    return focus.data.objectRef.current.position;
  }
  if (focus.type === "moon") {
    const position = new Vector3();
    focus.data.objectRef.current.getWorldPosition(position);
    return position;
  }
  return new Vector3(0, 0, 0);
}

/**
 * Calculates the camera position based on the given focus object.
 *
 * @param {Object} focus - The object to focus on.
 * @param {string} focus.type - The type of the focus object (e.g., "planet").
 * @param {Object} focus.data - Additional data related to the focus object.
 * @param {Object} focus.data.objectRef - A reference to the 3D object.
 * @param {Object} focus.data.objectRef.current - The current state of the object reference.
 * @param {Object} focus.data.objectRef.current.position - The position of the object in 3D space.
 * @param {number} focus.data.objectRef.current.position.x - The x-coordinate of the object's position.
 * @param {number} focus.data.objectRef.current.position.y - The y-coordinate of the object's position.
 * @param {number} focus.data.objectRef.current.position.z - The z-coordinate of the object's position.
 * @param {number} focus.data.size - The size of the focus object.
 * @param {number} focus.data.xRadius - The x-radius of the focus object.
 * @returns {Vector3} The calculated camera position as a Vector3 object or a predefined position for the sun.
 */
function getCameraPosition(focus) {
  if (focus.type === "planet") {
    return calculatePlanetCameraPosition(
      new Vector3(
        focus.data.objectRef.current.position.x,
        focus.data.objectRef.current.position.y,
        focus.data.objectRef.current.position.z,
      ),
      focus.data.size,
      new Vector3(0, 0, 0),
      focus.data.xRadius,
    );
  }
  if (focus.type === "moon") {
    const moonPosition = getObjectsPosition(focus);
    return calculatePlanetCameraPosition(
      moonPosition,
      focus.parent.data.size,
      focus.parent.data.objectRef.current.position,
      focus.parent.data.xRadius,
    );
  }

  return new Vector3(...sunCameraPosition);
}

/**
 * Calculates the camera position relative to a planet in a solar system simulation.
 *
 * @param {Vector3} planetPosition - The position of the planet in 3D space.
 * @param {number} planetSize - The size (radius) of the planet.
 * @param {Vector3} sunPosition - The position of the sun in 3D space.
 * @param {number} orbitRadius - The radius of the planet's orbit.
 * @param {number} [orbitAngleOffset=-0.2] - The angle offset (in radians) to shift the camera's position along the orbit.
 * @returns {Vector3} The calculated camera position in 3D space.
 */
function calculatePlanetCameraPosition(
  planetPosition,
  planetSize,
  sunPosition,
  orbitRadius,
  orbitAngleOffset = -0.2, // Default angle offset in radians
) {
  const distanceFromPlanet = planetSize * 5;

  // Calculate the direction vector from the sun to the planet
  const direction = new Vector3()
    .subVectors(planetPosition, sunPosition)
    .normalize();

  // Calculate the perpendicular direction for the orbit shift
  const perpendicularDirection = new Vector3(
    -direction.z, // Swap and negate components for perpendicular vector
    0,
    direction.x,
  ).normalize();

  // Apply the orbit angle offset to shift the camera position
  const shiftedPosition = new Vector3()
    .copy(planetPosition)
    .addScaledVector(direction, distanceFromPlanet)
    .addScaledVector(
      perpendicularDirection,
      orbitRadius * Math.sin(orbitAngleOffset),
    )
    .add(new Vector3(0, 2 * planetSize, 0)); // Adjust for vertical offset

  return shiftedPosition;
}

/**
 * Calculates the future position of a celestial body after a given time.
 * @param {number} xRadius - The x-radius of the celestial body's orbit.
 * @param {number} zRadius - The z-radius of the celestial body's orbit.
 * @param {number} daysPerRotation - The number of days it takes for the celestial body to complete one rotation.
 * @param {number} currentAngle - The current angle of the celestial body in radians.
 * @param {number} timeMs - The time in milliseconds to calculate the future position for.
 * @returns {Vector3} - The future position as a Vector3 object.
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

  return new Vector3(x, 0, z);
}
