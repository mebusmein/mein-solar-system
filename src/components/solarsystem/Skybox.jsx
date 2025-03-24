import React, { useMemo } from 'react';
import { CubeTextureLoader } from 'three';
import { useTheme } from '../../libs/theme';
import { generateSkyboxTextures } from '../../libs/skybox';


import { CubeTextureLoader, CanvasTexture } from "three";

export function generateSkyboxTextures(theme) {
  const { background, lightColor } = theme;

  // Helper function to create a single texture
  function createTexture() {
    const size = 512; // Texture size
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    // Fill the background
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, size, size);

    // Draw random stars
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const radius = Math.random() * 2 + 1; // Star size
      ctx.fillStyle = lightColor;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    return new CanvasTexture(canvas);
  }

  // Generate textures for all six sides
  return [
    createTexture(), // Right
    createTexture(), // Left
    createTexture(), // Top
    createTexture(), // Bottom
    createTexture(), // Front
    createTexture(), // Back
  ];
}

function Skybox() {
    const theme = useTheme();

    const cubeTexture = useMemo(() => {
        const textures = generateSkyboxTextures(theme);
        return new CubeTextureLoader().load(textures);
    }, [theme]);

    return <primitive attach="background" object={cubeTexture} />;
}

export default Skybox;
