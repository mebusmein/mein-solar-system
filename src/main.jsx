import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./libs/theme.jsx";
import { FocusProvider } from './libs/focus.jsx';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <FocusProvider>
        <App />
      </FocusProvider>
    </ThemeProvider>
  </StrictMode>
);
