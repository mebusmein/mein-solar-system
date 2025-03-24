import { getPlanetAngles } from './astrodata';

export const solYear = 365; // Earth days
const angleData = getPlanetAngles();

export const solPlanets = [
    { id: 1, name: "Mercury", xRadius: 10, zRadius: 10, size: 1, speed: solYear / 88, startAngle: angleData.mercury },
    { id: 2, name: "Venus", xRadius: 15, zRadius: 15, size: 1.5, speed: solYear / 225, startAngle: angleData.venus },
    { id: 3, name: "Earth", xRadius: 20, zRadius: 20, size: 1.8, speed: solYear / 365, startAngle: angleData.earth },
    { id: 4, name: "Mars", xRadius: 30, zRadius: 30, size: 1.2, speed: solYear / 687, startAngle: angleData.mars },
    { id: 5, name: "Jupiter", xRadius: 50, zRadius: 50, size: 4.5, speed: solYear / 4333, startAngle: angleData.jupiter },
    { id: 6, name: "Saturn", xRadius: 70, zRadius: 70, size: 4, speed: solYear / 10759, startAngle: angleData.saturn },
    { id: 7, name: "Uranus", xRadius: 90, zRadius: 90, size: 3, speed: solYear / 30687, startAngle: angleData.uranus },
    { id: 8, name: "Neptune", xRadius: 110, zRadius: 110, size: 3, speed: solYear / 60190, startAngle: angleData.neptune },
];
