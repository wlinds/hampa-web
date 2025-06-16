import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import ServicesSection from '../components/sections/ServicesSection';
import AboutHempSection from '../components/sections/AboutHempSection';
import GallerySection from '../components/sections/GallerySection';
import BenefitsSection from '../components/sections/BenefitsSection';
import FAQSection from '../components/sections/FAQSection';
import AboutUsSection from '../components/sections/AboutUsSection';
import ContactSection from '../components/sections/ContactSection';

const LandingPage: React.FC = () => {
  return (
    <div className="pt-20">
      <HeroSection />
      <ServicesSection />
      <AboutHempSection />
      <GallerySection />
      <BenefitsSection />
      <FAQSection />
      <AboutUsSection />
      <ContactSection />
    </div>
  );
};

export default LandingPage;