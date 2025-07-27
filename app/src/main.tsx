import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "core-js/actual/structured-clone";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
