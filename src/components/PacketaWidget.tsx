
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Package, Loader2 } from "lucide-react";

declare global {
    interface Window {
        Packeta: any;
    }
}

interface PacketaWidgetProps {
    onPointSelected: (point: any) => void;
    apiKey?: string;
}

// Load script globally once — avoid duplicates
function loadPacketaScript(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (window.Packeta) {
            resolve();
            return;
        }
        const existing = document.getElementById("packeta-widget-script");
        if (existing) {
            existing.addEventListener("load", () => resolve());
            existing.addEventListener("error", reject);
            return;
        }
        const script = document.createElement("script");
        script.id = "packeta-widget-script";
        script.src = "https://widget.packeta.com/v6/www/js/library.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

const PacketaWidget = ({ onPointSelected, apiKey }: PacketaWidgetProps) => {
    const packetaApiKey = apiKey || import.meta.env.VITE_PACKETA_API_KEY;
    const [loading, setLoading] = useState(false);
    const [scriptReady, setScriptReady] = useState(!!window.Packeta);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        loadPacketaScript()
            .then(() => { if (mounted.current) setScriptReady(true); })
            .catch((e) => console.error("Packeta script load failed:", e));
        return () => { mounted.current = false; };
    }, []);

    const openWidget = () => {
        if (!packetaApiKey) {
            console.error("Packeta API Key missing! Set VITE_PACKETA_API_KEY.");
            alert("Chybí API klíč pro Zásilkovnu.");
            return;
        }

        if (!scriptReady || !window.Packeta) {
            setLoading(true);
            loadPacketaScript().then(() => {
                setLoading(false);
                setScriptReady(true);
                triggerWidget();
            });
            return;
        }

        triggerWidget();
    };

    const triggerWidget = () => {
        window.Packeta.Widget.pick(
            packetaApiKey,
            (point: any) => {
                if (point) {
                    onPointSelected(point);
                }
            },
            {
                country: "cz,sk",
                language: "cs",
                appIdentity: "BoostUp-v1",
            }
        );
    };

    return (
        <Button
            type="button"
            variant="outline"
            onClick={openWidget}
            disabled={loading}
            className="w-full gap-2 border-primary/20 hover:bg-primary/5"
        >
            {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Package className="w-4 h-4" />
            )}
            {loading ? "Načítám…" : "Vybrat výdejní místo"}
        </Button>
    );
};

export default PacketaWidget;
