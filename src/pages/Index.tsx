import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MissionSection from "@/components/MissionSection";
import ProductSection from "@/components/ProductSection";
import { lazy, Suspense } from "react";
import { LazySection } from "@/components/LazySection";

const ConceptSection = lazy(() => import("@/components/ConceptSection"));
const CTASection = lazy(() => import("@/components/CTASection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const Footer = lazy(() => import("@/components/Footer"));
const DiscountModal = lazy(() => import("@/components/DiscountModal"));

import { SEO } from "@/components/SEO";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="BoostUp - Přírodní energie a čisté soustředění"
        description="BoostUp je revoluční energetický shot z přírodních extraktů. Získejte 6 hodin soustředění bez nervozity a crash efektu. Pure Shot 60ml s elektrolyty."
      />
      <Header />
      <main>
        <HeroSection />
        <MissionSection />
        <ProductSection />
        
        <LazySection minHeight="800px">
          <Suspense fallback={<div className="h-[800px] bg-secondary/5 animate-pulse rounded-3xl" />}>
            <ConceptSection />
          </Suspense>
        </LazySection>

        <LazySection minHeight="300px">
          <Suspense fallback={<div className="h-[300px] bg-secondary/5 animate-pulse rounded-3xl" />}>
            <CTASection />
          </Suspense>
        </LazySection>

        <LazySection minHeight="500px">
          <Suspense fallback={<div className="h-[500px] bg-secondary/5 animate-pulse rounded-3xl" />}>
            <ContactSection />
          </Suspense>
        </LazySection>
      </main>
      
      <Suspense fallback={null}>
        <Footer />
        <DiscountModal />
      </Suspense>
    </div>
  );
};

export default Index;
