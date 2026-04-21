import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import PullQuote from "@/components/PullQuote";
import EducationSection from "@/components/EducationSection";
import AboutSection from "@/components/AboutSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-paper">
      <Navigation />
      <Hero />
      <HowItWorks />
      <PullQuote />
      <EducationSection />
      <AboutSection />
      <Footer />
    </div>
  );
};

export default Index;
