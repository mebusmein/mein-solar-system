import * as React from "react";
import { useFrame } from "@react-three/fiber";
import {
  Points,
  Vector3,
  Spherical,
  Color,
  AdditiveBlending,
  ShaderMaterial,
} from "three";
import { useSpring } from "@react-spring/three";
import { useLogListener } from "../prompt/commandCenter";

/**
 * Props for the Stars component.
 * @typedef {Object} StarsProps
 * @property {number} [radius=100] - Radius of the starfield.
 * @property {number} [depth=50] - Depth of the starfield.
 * @property {number} [count=5000] - Number of stars.
 * @property {number} [factor=4] - Size factor for the stars.
 * @property {number} [saturation=0] - Saturation of star colors.
 * @property {boolean} [fade=false] - Whether the stars fade at the edges.
 * @property {number} [speed=1] - Speed of the starfield animation.
 * @property {number} [opacity=1] - Opacity of the starfield material.
 */

class StarfieldMaterial extends ShaderMaterial {
  constructor() {
    super({
      uniforms: {
        time: { value: 0.0 },
        fade: { value: 1.0 },
        globalOpacity: { value: 1.0 }, // Add global opacity uniform
      },
      vertexShader: /* glsl */ `
            uniform float time;
            attribute float size;
            varying vec3 vColor;
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 0.5);
                gl_PointSize = size * (30.0 / -mvPosition.z) * (3.0 + sin(time + 100.0));
                gl_Position = projectionMatrix * mvPosition;
            }`,
      fragmentShader: /* glsl */ `
            uniform sampler2D pointTexture;
            uniform float fade;
            uniform float globalOpacity; // Use global opacity uniform
            varying vec3 vColor;
            void main() {
                float opacity = 1.0;
                if (fade == 1.0) {
                    float d = distance(gl_PointCoord, vec2(0.5, 0.5));
                    opacity = 1.0 / (1.0 + exp(16.0 * (d - 0.25)));
                }
                gl_FragColor = vec4(vColor, opacity * globalOpacity); // Apply global opacity

                #include <tonemapping_fragment>
                #include <colorspace_fragment>
            }`,
    });
  }
}

/**
 * Generates a random star position within a spherical volume.
 * @param {number} r - Radius of the sphere.
 * @returns {Vector3} - A Vector3 representing the star's position.
 */
const genStar = (r) => {
  return new Vector3().setFromSpherical(
    new Spherical(
      r,
      Math.acos(1 - Math.random() * 2),
      Math.random() * 2 * Math.PI,
    ),
  );
};

/**
 * A React component that renders a starfield using Three.js.
 * @param {StarsProps} props - The properties for the Stars component.
 * @param {React.Ref} ref - A ref to the points object.
 * @returns {JSX.Element} - The rendered starfield.
 */
export const Stars = React.forwardRef(
  (
    {
      radius = 100,
      depth = 50,
      count = 5000,
      saturation = 0,
      factor = 4,
      fade = false,
      speed = 1,
    },
    ref,
  ) => {
    const material = React.useRef(null);
    const [position, color, size] = React.useMemo(() => {
      const positions = [];
      const colors = [];
      const sizes = Array.from(
        { length: count },
        () => (0.5 + 0.5 * Math.random()) * factor,
      );
      const color = new Color();
      let r = radius + depth;
      const increment = depth / count;
      for (let i = 0; i < count; i++) {
        r -= increment * Math.random();
        positions.push(...genStar(r).toArray());
        color.setHSL(i / count, saturation, 0.9);
        colors.push(color.r, color.g, color.b);
      }
      return [
        new Float32Array(positions),
        new Float32Array(colors),
        new Float32Array(sizes),
      ];
    }, [count, depth, factor, radius, saturation]);
    useFrame((state) => {
      if (material.current) {
        material.current.uniforms.time.value = state.clock.elapsedTime * speed;
        material.current.uniforms.globalOpacity.value = springs.opacity.get();
      }
    });

    const [springs, api] = useSpring(() => ({
      opacity: 0,
    }));

    useLogListener("bootSystem", async (payload) => {
      console.log("bootSystem");
      return new Promise((resolve) => {
        api.start({
          opacity: 1,
          from: { opacity: 0 },
          config: { duration: 1000 },
          onRest: () => {
            resolve();
          },
        });
      });
    });

    const [starfieldMaterial] = React.useState(() => new StarfieldMaterial());

    return (
      <points ref={ref}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[position, 3]} />
          <bufferAttribute attach="attributes-color" args={[color, 3]} />
          <bufferAttribute attach="attributes-size" args={[size, 1]} />
        </bufferGeometry>
        <primitive
          ref={material}
          object={starfieldMaterial}
          attach="material"
          blending={AdditiveBlending}
          uniforms-fade-value={fade}
          depthWrite={false}
          transparent
          vertexColors
        />
      </points>
    );
  },
);
