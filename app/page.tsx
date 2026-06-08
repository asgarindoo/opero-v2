import Header from "@/components/marketing/Header";
import HeroSection from "@/components/marketing/HeroSection";
import BentoSection from "@/components/marketing/BentoSection";
import TestimonialsSection from "@/components/marketing/TestimonialsSection";
import PricingSection from "@/components/marketing/PricingSection";
import FAQSection from "@/components/marketing/FAQSection";
import CTASection from "@/components/marketing/CTASection";
import Footer from "@/components/marketing/Footer";
import { getCurrentUser } from "@/lib/server/auth-utils";

export default async function Home() {
  const initialUser = await getCurrentUser();

  return (
    <>
      <Header initialUser={initialUser} sessionResolvedOnServer />
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
