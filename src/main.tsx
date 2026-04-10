import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

/**
 * Ultra-Robust Entry Point
 * 
 * We wrap the entire React mount process in a try/catch to ensure that 
 * ANY failure during initialization (missing polyfills, broken context, etc.)
 * is immediately written to the DOM. This makes silent failures visible to CI.
 */
try {
    console.log("BoostUp: Initializing application mount...");
    const rootElement = document.getElementById("root");
    
    if (!rootElement) {
        throw new Error("Critical Failure: Root element #root not found in DOM.");
    }

    const root = createRoot(rootElement);
    root.render(<App />);

} catch (error: any) {
    console.error("CRITICAL MOUNT FAILURE:", error);
    
    const root = document.getElementById("root");
    if (root) {
        root.innerHTML = `
            <div style="margin:2rem; background:#fff; border:4px solid #cc0000; padding:2rem; border-radius:12px; text-align:left; font-family:monospace; color:#cc0000; box-shadow:0 20px 50px rgba(0,0,0,0.3); position:relative; z-index:99999;">
                <h1 style="margin-top:0; border-bottom:2px solid #fee; padding-bottom:1rem; font-size:24px;">KRITICKÁ CHYBA SPOUŠTĚNÍ</h1>
                <p style="font-weight:bold; font-size:16px;">React aplikace se nepodařila inicializovat.</p>
                <div style="background:#f8f9fa; padding:1.5rem; border-radius:8px; border:1px solid #ddd; color:#333; overflow-x:auto;">
                    <pre style="white-space:pre-wrap; margin:0; font-size:13px;">${error.name}: ${error.message}\n\n${error.stack || "Zásobník chyb není k dispozici."}</pre>
                </div>
                <p style="font-size:12px; color:#666; margin-top:1.5rem;">
                    Možné příčiny: Chybějící proměnné prostředí (VITE_SUPABASE_URL), nefunkční moduly nebo nekompatibilní verze Node.js.
                </p>
                <button onclick="window.location.reload()" style="margin-top:1rem; background:#cc0000; color:#white; border:none; padding:0.5rem 1rem; border-radius:4px; cursor:pointer; font-weight:bold;">Zkusit znovu načíst</button>
            </div>
        `;
    }
}
