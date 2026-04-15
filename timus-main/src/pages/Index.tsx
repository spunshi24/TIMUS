import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import AboutSection from "@/components/AboutSection";
import HowItWorks from "@/components/HowItWorks";
import ForProfessors from "@/components/ForProfessors";
import EducationSection from "@/components/EducationSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Hero />
      <AboutSection />
      <HowItWorks />
      <ForProfessors />
      <EducationSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Index;
