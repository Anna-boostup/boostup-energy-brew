import { ReactNode } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEO } from "@/components/SEO";

interface LegalLayoutProps {
    children: ReactNode;
    title: string;
    lastUpdated?: string;
    seoTitle?: string;
}

const LegalLayout = ({ children, title, lastUpdated, seoTitle }: LegalLayoutProps) => {
    return (
        <div className="min-h-screen bg-background flex flex-col font-sans">
            <SEO title={seoTitle || title} />
            <Header />

            <main className="flex-grow pt-32 pb-16 relative z-0">
                <div className="container mx-auto px-4 max-w-4xl">
                    {/* Header Section */}
                    <div className="mb-12 text-center pt-10">
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-foreground uppercase tracking-tight">
                            {title}
                        </h1>
                        <div className="w-24 h-1 bg-lime mx-auto rounded-full mb-6"></div>
                        {lastUpdated && (
                            <p className="text-muted-foreground text-sm uppercase tracking-wider">
                                Poslední aktualizace: {lastUpdated}
                            </p>
                        )}
                    </div>

                    {/* Content Card */}
                    <div className="bg-card/50 backdrop-blur-sm border border-border p-8 md:p-12 rounded-2xl shadow-sm relative">
                        <div className="legal-content text-foreground
              [&_h2]:text-3xl [&_h2]:md:text-4xl [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-lime [&_h2]:font-display [&_h2]:font-bold
              [&_h3]:text-xl [&_h3]:md:text-2xl [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:text-foreground [&_h3]:font-semibold
              [&_p]:text-base [&_p]:md:text-lg [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-4
              [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:my-6 [&_li]:text-base [&_li]:md:text-lg [&_li]:text-muted-foreground [&_li]:mb-2 [&_li::marker]:text-lime
              [&_strong]:text-foreground [&_strong]:font-bold
              [&_a]:text-lime [&_a]:no-underline hover:[&_a]:underline transition-colors
              [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:my-6">
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default LegalLayout;
