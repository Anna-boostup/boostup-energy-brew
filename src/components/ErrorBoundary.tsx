import React, { Component, ErrorInfo, ReactNode } from "react";
import * as Sentry from "@sentry/react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Automatically report to Sentry
    Sentry.captureException(error, { extra: { ...errorInfo } });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4F1E6] p-8 flex flex-col items-center justify-center text-center font-sans animate-in fade-in duration-700">
            {/* Minimalistic Brand Icon */}
            <div className="w-20 h-20 bg-[#3D5A2F]/5 rounded-full flex items-center justify-center mb-10">
                <svg className="w-10 h-10 text-[#3D5A2F]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-[#1C2C0B] mb-6 font-display uppercase italic tracking-[0.02em]">
                Něco se pokazilo
            </h1>
            
            <p className="text-lg text-[#3d5a2f]/70 mb-12 max-w-md font-medium leading-relaxed">
                Omlouváme se, ale při načítání stránky došlo k chybě. Naši technici už byli automaticky informováni a pracují na nápravě.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 items-center">
                <button 
                    onClick={() => window.location.href = '/'}
                    className="px-10 py-5 bg-[#3D5A2F] text-[#F4F1E6] rounded-2xl font-black uppercase text-xs tracking-[0.25em] hover:bg-black transition-all shadow-2xl shadow-olive/20 active:scale-95 duration-300"
                >
                    Zpět na hlavní stránku
                </button>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-10 py-5 bg-transparent text-[#3D5A2F] border-2 border-[#3D5A2F]/10 rounded-2xl font-black uppercase text-xs tracking-[0.25em] hover:bg-white/50 transition-all active:scale-95 duration-300"
                >
                    Zkusit znovu
                </button>
            </div>

            {/* Subtle footer info */}
            <div className="mt-24">
                <p className="text-[10px] font-black text-[#3D5A2F]/20 uppercase tracking-[0.4em]">
                    BoostUp Engineering • Stable Production
                </p>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
