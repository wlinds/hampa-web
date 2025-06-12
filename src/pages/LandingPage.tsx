import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import ServicesSection from '../components/sections/ServicesSection';
import AboutHempSection from '../components/sections/AboutHempSection';
import BenefitsSection from '../components/sections/BenefitsSection';
import ContactSection from '../components/sections/ContactSection';

const LandingPage: React.FC = () => {
  return (
    <div className="pt-20">
      <HeroSection />
      <ServicesSection />
      <AboutHempSection />
      <BenefitsSection />
      <ContactSection />
    </div>
  );
};

export default LandingPage;