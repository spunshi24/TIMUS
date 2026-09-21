import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import DemoVideoSection from "@/components/DemoVideoSection";
import HowItWorks from "@/components/HowItWorks";
import ForEducators from "@/components/ForEducators";
import EducationSection from "@/components/EducationSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <DemoVideoSection />
      <HowItWorks />
      <ForEducators />
      <EducationSection />
      <AboutSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
