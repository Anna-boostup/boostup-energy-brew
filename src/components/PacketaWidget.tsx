
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

declare global {
    interface Window {
        Packeta: any;
    }
}

interface PacketaWidgetProps {
    onPointSelected: (point: any) => void;
    apiKey?: string;
}

const PacketaWidget = ({ onPointSelected, apiKey }: PacketaWidgetProps) => {
    const packetaApiKey = apiKey || import.meta.env.VITE_PACKETA_API_KEY;

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://widget.packeta.com/v6/www/js/library.js";
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const openWidget = () => {
        if (!packetaApiKey) {
            console.error("Packeta API Key missing!");
            alert("Chybí API klíč pro Zásilkovnu (VITE_PACKETA_API_KEY).");
            return;
        }

        if (window.Packeta) {
            window.Packeta.Widget.pick(packetaApiKey, (point: any) => {
                if (point) {
                    onPointSelected(point);
                }
            }, {
                country: "cz",
                language: "cs"
            });
        } else {
            console.error("Packeta library not loaded yet");
        }
    };

    return (
        <Button
            type="button"
            variant="outline"
            onClick={openWidget}
            className="w-full gap-2 border-primary/20 hover:bg-primary/5"
        >
            <Package className="w-4 h-4" />
            Vybrat výdejní místo
        </Button>
    );
};

export default PacketaWidget;
