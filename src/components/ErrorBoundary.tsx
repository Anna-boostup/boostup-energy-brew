import React, { Component, ErrorInfo, ReactNode } from "react";

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
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-[#FDF8F6] p-8 flex flex-col items-center justify-center text-center font-sans animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-8">
                <span className="text-4xl text-red-600">⚠️</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-olive-dark mb-4 font-display uppercase italic tracking-tight">
                Něco se pokazilo
            </h1>
            
            <p className="text-lg text-brand-muted mb-10 max-w-md font-medium leading-relaxed">
                Omlouváme se, ale při načítání stránky došlo k chybě. Naši technici už na tom pracují.
            </p>

            {isDev && (
              <div className="bg-white p-6 rounded-[2rem] shadow-2xl border border-red-100 text-left w-full max-w-4xl overflow-auto max-h-[40vh] mb-10 animate-in zoom-in-95">
                  <p className="font-mono text-xs text-red-500 font-black mb-3 uppercase tracking-widest">
                      Developer Debug Info:
                  </p>
                  <p className="font-mono text-sm text-olive-dark font-bold mb-4 bg-red-50 p-3 rounded-xl border border-red-100">
                      Error: {this.state.error?.message}
                  </p>
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="text-[10px] font-black text-gray-400 mb-3 uppercase tracking-[0.2em]">Stack Trace:</p>
                    <pre className="font-mono text-[10px] text-gray-400 bg-gray-50/50 p-4 rounded-xl overflow-x-auto whitespace-pre-wrap leading-relaxed">
                        {this.state.error?.stack}
                    </pre>
                  </div>
                  <p className="mt-6 text-[10px] font-bold text-red-400 uppercase tracking-widest text-center">
                    Visible only in DEV mode
                  </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 items-center">
                <button 
                    onClick={() => window.location.href = '/'}
                    className="px-8 py-4 bg-olive-dark text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all shadow-xl shadow-olive-dark/10 active:scale-95"
                >
                    Zpět na hlavní stránku
                </button>
                <button 
                    onClick={() => window.location.reload()}
                    className="px-8 py-4 bg-white text-olive-dark border border-olive/10 rounded-2xl font-bold uppercase text-xs tracking-[0.2em] hover:bg-cream transition-all active:scale-95"
                >
                    Zkusit znovu
                </button>
            </div>

            {isDev && (
              <p className="mt-8 text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">
                DEBUG: Check VITE_SUPABASE_URL in Vercel if this persists.
              </p>
            )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
