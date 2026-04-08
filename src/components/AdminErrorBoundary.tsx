import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class AdminErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        console.error('[AdminErrorBoundary] Caught error:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="text-center space-y-8 max-w-lg mx-auto p-12 bg-white rounded-[3rem] border border-olive/10 shadow-xl">
                        <div className="w-20 h-20 bg-terracotta/10 rounded-[2rem] flex items-center justify-center mx-auto">
                            <AlertTriangle className="w-10 h-10 text-terracotta" />
                        </div>
                        <div className="space-y-3">
                            <h3 className="text-2xl font-black font-display uppercase tracking-tight text-olive-dark italic">
                                Chyba načítání
                            </h3>
                            <p className="text-sm font-bold uppercase tracking-[0.2em] text-olive-dark/50">
                                Tuto stránku se nepodařilo načíst
                            </p>
                            {this.state.error && (
                                <pre className="text-xs text-left bg-olive-dark/5 p-4 rounded-2xl text-terracotta font-mono overflow-auto max-h-32">
                                    {this.state.error.message}
                                </pre>
                            )}
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="h-12 px-8 bg-olive-dark text-lime font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:bg-olive transition-all flex items-center gap-3 mx-auto"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Obnovit stránku
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
