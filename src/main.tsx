import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("BoostUp: Initializing application mount...");
const rootElement = document.getElementById("root");
if (rootElement) {
    createRoot(rootElement).render(<App />);
} else {
    console.error("BoostUp: Root element #root not found!");
}
