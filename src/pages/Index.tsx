import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import { lazy, Suspense } from "react";
import { LazySection } from "@/components/LazySection";

const MissionSection = lazy(() => import("@/components/MissionSection"));
const ProductSection = lazy(() => import("@/components/ProductSection"));

const ConceptSection = lazy(() => import("@/components/ConceptSection"));
const CTASection = lazy(() => import("@/components/CTASection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const Footer = lazy(() => import("@/components/Footer"));
const DiscountModal = lazy(() => import("@/components/DiscountModal"));

import { SEO } from "@/components/SEO";

import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

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
        
        <LazySection id="mise" minHeight="600px">
          <Suspense fallback={<div className="h-[600px] bg-secondary/5 animate-pulse rounded-3xl" />}>
            <MissionSection />
          </Suspense>
        </LazySection>

        <LazySection id="produkty" minHeight="1200px">
          <Suspense fallback={<div className="h-[1200px] bg-secondary/5 animate-pulse rounded-3xl" />}>
            <ProductSection />
          </Suspense>
        </LazySection>
        
        <LazySection id="3b" minHeight="800px">
          <Suspense fallback={<div className="h-[800px] bg-secondary/5 animate-pulse rounded-3xl" />}>
            <ConceptSection />
          </Suspense>
        </LazySection>

        <LazySection minHeight="300px">
          <Suspense fallback={<div className="h-[300px] bg-secondary/5 animate-pulse rounded-3xl" />}>
            <CTASection />
          </Suspense>
        </LazySection>

        <LazySection id="kontakt" minHeight="500px">
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
