import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();
const SetThemeContext = createContext();

const defaultTheme = {
  background: "#05010d", // Darker and softer background
  sunColor: "#e6c200", // Softer yellow for the Sun
  mercuryColor: "#8c8c8c", // Softer gray for Mercury
  venusColor: "#c8a96b", // Softer beige for Venus
  earthColor: "#1f5ba6", // Darker and softer blue for Earth
  marsColor: "#a63a1e", // Darker and softer red for Mars
  jupiterColor: "#b8864d", // Softer brown for Jupiter
  saturnColor: "#d4b45a", // Softer yellow for Saturn
  uranusColor: "#5fa8b0", // Softer cyan for Uranus
  neptuneColor: "#2e4e9b", // Darker and softer blue for Neptune
  lightColor: "#e0e0e0", // Softer white for light
  textColorWebpage: "#e0e0e0", // Softer white for webpage text
  textColorBillboards: "#e6b800", // Softer yellow for billboard text
  ellipseColor: "#666666", // Softer gray for ellipses
};

const vintageTheme = {
  background: "#f4ecd8",
  sunColor: "#e3a857",
  mercuryColor: "#a89f91",
  venusColor: "#d9b48f",
  earthColor: "#6b8e23",
  marsColor: "#b5651d",
  jupiterColor: "#d2a679",
  saturnColor: "#e3c16f",
  uranusColor: "#7fbfbf",
  neptuneColor: "#4682b4",
  lightColor: "#fdf5e6",
  textColorWebpage: "#5c4033",
  textColorBillboards: "#8b4513",
  ellipseColor: "#a9a9a9",
};

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(defaultTheme);

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === defaultTheme ? vintageTheme : defaultTheme));
  };

  return (
    <ThemeContext.Provider value={theme}>
      <SetThemeContext.Provider value={{ setTheme, toggleTheme }}>
        {children}
      </SetThemeContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export function useSetTheme() {
  return useContext(SetThemeContext);
}

function applyThemeToDOM(theme) {
  Object.keys(theme).forEach((key) => {
    document.documentElement.style.setProperty(`--${key}`, theme[key]);
  });
}