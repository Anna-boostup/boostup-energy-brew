import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import MissionSection from "@/components/MissionSection";
import ProductSection from "@/components/ProductSection";
import ConceptSection from "@/components/ConceptSection";
import CTASection from "@/components/CTASection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import DiscountModal from "@/components/DiscountModal";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <MissionSection />
        <ProductSection />
        <ConceptSection />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
      <DiscountModal />
    </div>
  );
};

export default Index;
