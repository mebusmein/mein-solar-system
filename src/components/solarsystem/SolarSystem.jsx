import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame } from "@react-three/fiber";
import { Billboard, OrbitControls, Text } from '@react-three/drei';
import { solPlanets, solYear } from './data.js';
import { useTheme } from '../../libs/theme';
import { BufferGeometry, Vector3 } from 'three';

function SolarSystem() {
    const theme = useTheme();

    return (
        <Canvas camera={{ position: [0, 20, 90], fov: 45 }}>
            <Sun color={theme.sunColor} />
            {solPlanets.map((planet) => (
                <Planet
                    key={planet.id}
                    planet={{ ...planet }}
                />
            ))}
            <Lights />
            <OrbitControls />
        </Canvas>
    );
}


function Sun({ color }) {
    return (
        <mesh>
            <sphereGeometry args={[5, 32, 32]} />
            <meshStandardMaterial emissive={color} emissiveIntensity={1.5} color={color} />
        </mesh>
    );
}

function Planet({ planet: { xRadius, zRadius, size, speed, startAngle, name, id } }) {
    const theme = useTheme();
    
    const planetRef = useRef();
    const angleRef = useRef(startAngle); // Initialize with the starting angle

    // Update the planet's position on each frame
    useFrame(() => {
        if (planetRef.current) {
            angleRef.current += speed / solYear; // Adjust speed based on solYear
            const x = xRadius * Math.cos(angleRef.current);
            const z = zRadius * Math.sin(angleRef.current);
            planetRef.current.position.set(x, 0, z); // Update position
        }
    });

    const color = theme[`${name.toLowerCase()}Color`] || theme.planetColor;

    return (
        <>
            <mesh ref={planetRef}>
                <sphereGeometry args={[size, 32, 32]} />
                <meshStandardMaterial color={color}
                 />
                <Label x={size} y={size} z={size} text={name} />
            </mesh>
            <Ecliptic xRadius={xRadius} zRadius={zRadius} />
        </>
    );
}

function Lights() {

    return (
        <>
            <ambientLight />
            <pointLight
                position={[0, 0, 0]}
                decay={0} intensity={Math.PI}
            />
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
            <lineBasicMaterial attach="material" color={theme.eclipticColor}
             linewidth={10} />
        </line>
    );
}

function Label({ x, y, z, text }) {
    const linePoints = [
        new Vector3(0, 0, 0), // Start at the planet's center
        new Vector3(x, y, z), // End at the text anchor point
        new Vector3(x + 2, y, z), // Extend slightly to create an underline
    ];

    const lineGeometry = new BufferGeometry().setFromPoints(linePoints);

    const textRef = useRef();


    useEffect(() => {
        if (textRef.current) {
            textRef.current.sync(() => {
                console.log(textRef.current.boundingSphere)
            })
        }
    }, [])

    const theme = useTheme();

    return (
        <>

            <Billboard follow="true">
                <line geometry={lineGeometry}>
                    <lineBasicMaterial attach="material" color={theme.textColorBillboards} linewidth={1} />
                </line>
                <Text color={theme.textColorBillboards} anchorX="start" anchorY="bottom"
                    position={[x, y, z]}
                    fontSize={2}
                    maxWidth={200}
                    lineHeight={1}
                    ref={textRef}
                >
                    {text}
                </Text>
            </Billboard>
        </>
    );
}


export default SolarSystem;
