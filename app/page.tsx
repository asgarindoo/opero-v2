import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import BentoSection from "./components/BentoSection";
import TestimonialsSection from "./components/TestimonialsSection";
import PricingSection from "./components/PricingSection";
import FAQSection from "./components/FAQSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main className="pt-16 sm:pt-20 pb-[32px] sm:pb-[48px] organic-bg-pattern relative">
        <HeroSection />
        <BentoSection />
        <TestimonialsSection />
        <PricingSection />
        <FAQSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
