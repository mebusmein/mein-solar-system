import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();
const SetThemeContext = createContext();

const defaultTheme = {
  background: "#0c021f",
  sunColor: "#ffdd00",
  mercuryColor: "#b0b0b0",
  venusColor: "#e3c16f",
  earthColor: "#2a7de1",
  marsColor: "#d14a28",
  jupiterColor: "#d9a066",
  saturnColor: "#f5d76e",
  uranusColor: "#6fc2d0",
  neptuneColor: "#3b6bd6",
  lightColor: "#ffffff",
  textColorWebpage: "#ffffff",
  textColorBillboards: "#ffcc00",
  ellipseColor: "#888888",
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