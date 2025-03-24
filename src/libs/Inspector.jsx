import { useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import { createInspector } from 'three-inspect/vanilla';

export default function Inspector({ object }) {
    const { scene, camera, gl: renderer } = useThree();
    const inspectorRef = useRef(null); // Track if the inspector has been created

    useEffect(() => {
        if (!inspectorRef.current) {
            // Get the body element
            const body = document.querySelector('body');

            // Create the inspector
            inspectorRef.current = createInspector(body, {
                scene,
                camera,
                renderer,
            });
        }

        // Cleanup when the component is unmounted
        return () => {
        };
    }, []);

    return <></>;
}