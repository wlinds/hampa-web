import React from 'react';
import { Leaf, Mail, MapPin, Heart } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const services = [
    'Etablering av hampaareal',
    'Etablering av äng',
    'Biologisk mångfald',
    'Grönyteskötsel'
  ];

  const quickLinks = [
    { name: 'Hem', href: '#hero' },
    { name: 'Tjänster', href: '#services' },
    { name: 'Om Hampa', href: '#about-hemp' },
    { name: 'Kontakt', href: '#contact' }
  ];

  return (
    <footer className="bg-gradient-to-b from-hemp-800 to-hemp-900 text-white">
      <div className="container-max section-padding py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-hemp-600 rounded-full flex items-center justify-center">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Hampaoasen</h3>
                <p className="text-hemp-300 text-sm">Hampa & Biologisk Mångfald</p>
              </div>
            </div>
            <p className="text-hemp-200 leading-relaxed mb-6 max-w-md">
              Vi specialiserar oss på hampakultivering och biologisk mångfald för en hållbar framtid. 
              Vi erbjuder kompletta lösningar från juridisk hantering till skörd.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-hemp-200">
                <Mail className="w-4 h-4 text-hemp-400" />
                <a 
                  href="mailto:hampaoasen@gmail.com"
                  className="hover:text-white transition-colors duration-200"
                >
                  hampaoasen@gmail.com
                </a>
              </div>
              <div className="flex items-center space-x-2 text-hemp-200">
                <MapPin className="w-4 h-4 text-hemp-400" />
                <span>Sverige</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Våra Tjänster</h4>
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index}>
                  <a
                    href="#services"
                    className="text-hemp-200 hover:text-white transition-colors duration-200 text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector('#services')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Snabblänkar</h4>
            <ul className="space-y-2">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-hemp-200 hover:text-white transition-colors duration-200 text-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-hemp-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-hemp-300 text-sm mb-4 md:mb-0">
              © {currentYear} Hampaoasen. Alla rättigheter förbehållna.
            </div>
            <div className="flex items-center space-x-1 text-hemp-300 text-sm">
              <span>Gjord med</span>
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <span>för en hållbar framtid</span>
            </div>
          </div>
          
          {/* Disclaimer */}
          <div className="mt-6 p-4 bg-hemp-700 rounded-lg">
            <p className="text-hemp-200 text-xs leading-relaxed">
              <strong>Viktig information:</strong> Hampan vi odlar är industrihampa (Cannabis Sativa) med låg THC-halt (&lt;0.2%) 
              och är godkänd för laglig odling inom EU. Hampan ger inget rus och klassas inte som en drog. 
              All odling sker enligt gällande SAM-ansökningar och regelverk.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;