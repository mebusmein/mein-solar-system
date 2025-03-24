import { planetposition, julian } from 'astronomia';
import vsop87 from 'astronomia/data';

// Function to get planet angles
export function getPlanetAngles() {

    const planets = ['mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];
    const planetAngles = {};

     // Get Julian day
     const jd = julian.DateToJDE(new Date()); 

    planets.forEach((planet) => {
        const planetData = new planetposition.Planet(vsop87[planet]); // Get planet data
        const heliocentricPosition = planetData.position(jd); // Get heliocentric position
        const heliocentricLongitude = heliocentricPosition.lon; // Longitude in radians
        planetAngles[planet] = heliocentricLongitude; // Store angle in radians
    });

    return planetAngles;
}