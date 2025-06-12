import React from 'react';
import { ArrowRight, Leaf, TreePine, Users } from 'lucide-react';

const HeroSection: React.FC = () => {
  return (
    <section id="hero" className="relative min-h-screen flex items-center bg-gradient-to-br from-hemp-50 via-white to-hemp-100 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-32 h-32 bg-hemp-200 rounded-full animate-float"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-hemp-300 rounded-full animate-float animation-delay-200"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-hemp-100 rounded-full animate-float animation-delay-400"></div>
      </div>

      <div className="container-max section-padding relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-slide-up">
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-hemp-100 text-hemp-700 px-4 py-2 rounded-full text-sm font-medium">
                <Leaf className="w-4 h-4" />
                <span>Hållbar odling sedan bronsåldern</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold text-hemp-900 leading-tight">
                Hampa för en
                <span className="text-gradient block">Hållbar Framtid</span>
              </h1>
              
              <p className="text-xl text-hemp-700 leading-relaxed max-w-2xl">
                Vi hjälper fastighetsägare, kommuner och bostadsrättsföreningar att etablera hampaareal och främja biologisk mångfald. Från juridisk hantering till skörd - vi sköter allt.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6">
              <div className="text-center p-4 bg-white/60 backdrop-blur rounded-lg">
                <div className="text-2xl font-bold text-hemp-800">9-15</div>
                <div className="text-sm text-hemp-600">ton CO₂/hektar</div>
              </div>
              <div className="text-center p-4 bg-white/60 backdrop-blur rounded-lg">
                <div className="text-2xl font-bold text-hemp-800">1966</div>
                <div className="text-sm text-hemp-600">till EU-inträde</div>
              </div>
              <div className="text-center p-4 bg-white/60 backdrop-blur rounded-lg">
                <div className="text-2xl font-bold text-hemp-800">100%</div>
                <div className="text-sm text-hemp-600">ekologiskt</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="btn-primary inline-flex items-center group"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Få Kostnadsfri Offert
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </a>
              <a
                href="#services"
                className="btn-secondary"
                onClick={(e) => {
                  e.preventDefault();
                  document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Se Våra Tjänster
              </a>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-2 text-hemp-600">
                <Users className="w-5 h-5" />
                <span className="text-sm">Privata & kommunala kunder</span>
              </div>
              <div className="flex items-center space-x-2 text-hemp-600">
                <TreePine className="w-5 h-5" />
                <span className="text-sm">Laglig odling med SAM-ansökan</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-slide-up animation-delay-200">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="/api/placeholder/600/700"
                alt="Hampafält med lush grön vegetation"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-hemp-900/30 to-transparent"></div>
              
              {/* Floating Info Card */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur rounded-lg p-4 shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-hemp-100 rounded-full flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-hemp-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-hemp-900">Industrihampa</h3>
                    <p className="text-sm text-hemp-600">Cannabis Sativa - ger inget rus</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-hemp-200 rounded-full opacity-60 animate-float"></div>
            <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-hemp-300 rounded-full opacity-40 animate-float animation-delay-600"></div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-hemp-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-hemp-400 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;