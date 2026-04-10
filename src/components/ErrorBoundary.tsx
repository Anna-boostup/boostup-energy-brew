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
      return (
        <div className="min-h-screen bg-red-50 p-8 flex flex-col items-center justify-center text-center font-sans">
            <h1 className="text-4xl font-bold text-red-600 mb-4">Aplikace se zhroutila ⚠️</h1>
            <p className="text-lg text-gray-700 mb-8 max-w-2xl">
                Omlouváme se, ale došlo k neočekávané chybě, která zabránila vykreslení webu. Toto je diagnostická obrazovka pro BoostUp tým.
            </p>
            <div className="bg-white p-6 rounded-lg shadow-lg border border-red-200 text-left w-full max-w-4xl overflow-auto max-h-[50vh]">
                <p className="font-mono text-sm text-red-500 font-bold mb-2">Chyba: {this.state.error?.message}</p>
                <div className="mt-4 border-t pt-4">
                  <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wide">Stack Trace:</p>
                  <pre className="font-mono text-[10px] text-gray-400 bg-gray-50 p-4 rounded overflow-x-auto whitespace-pre-wrap">
                      {this.state.error?.stack}
                  </pre>
                </div>
            </div>
            <button 
                onClick={() => window.location.reload()}
                className="mt-8 px-6 py-3 bg-red-600 text-white rounded-full font-bold hover:bg-red-700 transition-colors shadow-lg"
            >
                Zkusit znovu (Obnovit stránku)
            </button>
            <p className="mt-4 text-xs text-gray-400">
              Pokud chyba přetrvává, zkontrolujte prosím VITE_SUPABASE_URL v nastavení Vercelu.
            </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
