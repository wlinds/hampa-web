import React, { useEffect } from 'react';
import HeroSection from '../components/sections/HeroSection';
import ServicesSection from '../components/sections/ServicesSection';
import AboutHempSection from '../components/sections/AboutHempSection';
import GallerySection from '../components/sections/GallerySection';
import BenefitsSection from '../components/sections/BenefitsSection';
import FAQSection from '../components/sections/FAQSection';
import AboutUsSection from '../components/sections/AboutUsSection';
import ContactSection from '../components/sections/ContactSection';

const LandingPage: React.FC = () => {
  useEffect(() => {
    // Handle hash navigation on page load
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          const headerHeight = 80;
          const elementPosition = (element as HTMLElement).offsetTop - headerHeight;
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, []);

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