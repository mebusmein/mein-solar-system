let storyHasRun = false; // Flag to ensure the story runs only once

export const runStory = async (commandCenter) => {
  if (storyHasRun) return; // Prevent multiple executions
  storyHasRun = true;

  commandCenter.clearLog();
  await commandCenter.logMessage("Booting up the Mein solar system...", {
    typing: true,
    typingSpeed: 50,
    id: "bootSystem",
  });
  await new Promise((resolve) => setTimeout(resolve, 500));
  await commandCenter.logMessage("Initializing the sun...", {
    typing: true,
    typingSpeed: 50,
    id: "initializeSun",
  });
  await new Promise((resolve) => setTimeout(resolve, 500));
  await commandCenter.logMessage("Initializing the planets...", {
    typing: true,
    typingSpeed: 50,
    id: "initializePlanet",
  });
  await new Promise((resolve) => setTimeout(resolve, 500));
  await commandCenter.logMessage("Initializing the moons...", {
    typing: true,
    typingSpeed: 50,
    id: "initializeMoon",
  });
  await new Promise((resolve) => setTimeout(resolve, 500));
  await commandCenter.logMessage("System boot complete!", {
    typing: true,
    typingSpeed: 50,
  });
  await commandCenter.logMessage("", {
    typing: true,
    typingSpeed: 50,
  });
};
