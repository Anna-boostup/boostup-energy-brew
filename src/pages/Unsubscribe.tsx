import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useContent } from "@/context/ContentContext";
import { Button } from "@/components/ui/button";
import { Zap, Mail, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";

const Unsubscribe = () => {
  const { content: SITE_CONTENT } = useContent();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const performUnsubscribe = async () => {
      if (!id) {
        setStatus("error");
        setErrorMessage("Chybějící identifikační kód odběratele.");
        return;
      }

      try {
        const response = await fetch("/api/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || "Nepodařilo se odhlásit odběr.");
        }

        setStatus("success");
      } catch (err: any) {
        console.error("Unsubscribe error:", err);
        setStatus("error");
        setErrorMessage(err.message || "Během odhlašování došlo k chybě. Zkuste to prosím znovu.");
      }
    };

    performUnsubscribe();
  }, [id]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-lime/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-terracotta/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full relative z-10">
        <div className="glass-card p-10 rounded-[3rem] border-white/40 shadow-2xl text-center space-y-8 animate-in fade-in zoom-in duration-700">
          {/* Logo/Icon */}
          <div className="w-20 h-20 bg-olive-dark rounded-[2rem] flex items-center justify-center mx-auto shadow-xl">
            <Zap className="w-10 h-10 text-lime" />
          </div>

          <div className="space-y-4">
            {status === "loading" && (
              <>
                <div className="flex justify-center">
                  <Loader2 className="w-10 h-10 animate-spin text-lime" />
                </div>
                <h1 className="text-2xl font-black uppercase italic tracking-tight text-olive-dark">
                  Zpracováváme odhlášení
                </h1>
                <p className="text-sm font-bold text-brand-muted uppercase tracking-widest">
                  Momentík, hned to bude...
                </p>
              </>
            )}

            {status === "success" && (
              <>
                <div className="flex justify-center">
                  <CheckCircle2 className="w-12 h-12 text-lime" />
                </div>
                <h1 className="text-3xl font-black uppercase italic tracking-tight text-olive-dark">
                  Odhlášeno
                </h1>
                <p className="text-sm font-bold text-brand-muted uppercase tracking-widest leading-relaxed">
                  Váš e-mail byl úspěšně odebrán z našeho newsletteru. Budete nám chybět!
                </p>
              </>
            )}

            {status === "error" && (
              <>
                <div className="flex justify-center">
                  <AlertCircle className="w-12 h-12 text-terracotta" />
                </div>
                <h1 className="text-2xl font-black uppercase italic tracking-tight text-olive-dark">
                  Něco se nepovedlo
                </h1>
                <p className="text-sm font-bold text-terracotta/60 uppercase tracking-widest leading-relaxed">
                  {errorMessage}
                </p>
              </>
            )}
          </div>

          <div className="pt-6 border-t border-olive/5">
            <Link to="/">
              <Button className="w-full h-14 bg-olive-dark hover:bg-black text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-95 gap-3">
                <ArrowLeft className="w-4 h-4" />
                Zpět na hlavní stránku
              </Button>
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center mt-10 text-[10px] font-black uppercase tracking-[0.3em] text-brand-muted opacity-40">
          BoostUp Energy &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
};

export default Unsubscribe;
