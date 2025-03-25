import { getPlanetAngles } from "./astrodata";

export const speedInDaysPerSecond = 5; // Earth days
const angleData = getPlanetAngles();

export const solPlanets = [
  {
    id: 1,
    name: "Mercury",
    xRadius: 10,
    zRadius: 10,
    size: 1,
    daysPerRotation: 88,
    startAngle: angleData.mercury,
    inclination: 7,
    moons: [],
  },
  {
    id: 2,
    name: "Venus",
    xRadius: 15,
    zRadius: 15,
    size: 1.5,
    daysPerRotation: 225,
    startAngle: angleData.venus,
    inclination: 3.4,
    moons: [],
  },
  {
    id: 3,
    name: "Earth",
    xRadius: 20,
    zRadius: 20,
    size: 1.8,
    daysPerRotation: 365,
    startAngle: angleData.earth,
    inclination: 0,
    moons: [
      {
        id: 1,
        name: "Moon",
        radius: 2,
        size: 0.5,
        daysPerRotation: 27,
        inclination: 5.1,
      },
    ],
  },
  {
    id: 4,
    name: "Mars",
    xRadius: 30,
    zRadius: 30,
    size: 1.2,
    daysPerRotation: 687,
    startAngle: angleData.mars,
    inclination: 1.85,
    moons: [
      {
        id: 1,
        name: "Phobos",
        radius: 1,
        size: 0.3,
        daysPerRotation: 14, // Adjusted
        inclination: 1.1,
      },
      {
        id: 2,
        name: "Deimos",
        radius: 1.5,
        size: 0.2,
        daysPerRotation: 15, // Adjusted
        inclination: 0.9,
      },
    ],
  },
  {
    id: 5,
    name: "Jupiter",
    xRadius: 50,
    zRadius: 50,
    size: 4.5,
    daysPerRotation: 4333,
    startAngle: angleData.jupiter,
    inclination: 1.3,
    moons: [
      {
        id: 1,
        name: "Io",
        radius: 3.6,
        size: 1,
        daysPerRotation: 14, // Adjusted
        inclination: 0.04,
      },
      {
        id: 2,
        name: "Europa",
        radius: 3.1,
        size: 0.9,
        daysPerRotation: 15, // Adjusted
        inclination: 0.47,
      },
      {
        id: 3,
        name: "Ganymede",
        radius: 5.3,
        size: 1.5,
        daysPerRotation: 16, // Adjusted
        inclination: 0.2,
      },
      {
        id: 4,
        name: "Callisto",
        radius: 4.8,
        size: 1.4,
        daysPerRotation: 17, // Adjusted
        inclination: 0.28,
      },
    ],
  },
  {
    id: 6,
    name: "Saturn",
    xRadius: 70,
    zRadius: 70,
    size: 4,
    daysPerRotation: 10759,
    startAngle: angleData.saturn,
    inclination: 2.49,
    moons: [
      {
        id: 1,
        name: "Titan",
        radius: 5.1,
        size: 1.4,
        daysPerRotation: 18, // Adjusted
        inclination: 0.33,
      },
      {
        id: 2,
        name: "Enceladus",
        radius: 1.6,
        size: 0.4,
        daysPerRotation: 14, // Adjusted
        inclination: 0.02,
      },
    ],
  },
  {
    id: 7,
    name: "Uranus",
    xRadius: 90,
    zRadius: 90,
    size: 3,
    daysPerRotation: 30687,
    startAngle: angleData.uranus,
    inclination: 0.77,
    moons: [
      {
        id: 1,
        name: "Miranda",
        radius: 2.4,
        size: 0.6,
        daysPerRotation: 15, // Adjusted
        inclination: 4.34,
      },
      {
        id: 2,
        name: "Ariel",
        radius: 3.6,
        size: 0.8,
        daysPerRotation: 16, // Adjusted
        inclination: 0.26,
      },
    ],
  },
  {
    id: 8,
    name: "Neptune",
    xRadius: 110,
    zRadius: 110,
    size: 3,
    daysPerRotation: 60190,
    startAngle: angleData.neptune,
    inclination: 1.77,
    moons: [
      {
        id: 1,
        name: "Triton",
        radius: 2.7,
        size: 0.7,
        daysPerRotation: 19, // Adjusted
        inclination: 157,
      },
    ],
  },
];
