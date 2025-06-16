import React, { useState, useEffect } from 'react';
import { Menu, X, Leaf } from 'lucide-react';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Hem', href: '#hero' },
    { name: 'Tjänster', href: '#services' },
    { name: 'Om Hampa', href: '#about-hemp' },
    { name: 'Bildgalleri', href: '#gallery' },
    { name: 'Frågor & Svar', href: '#faq' },
    { name: 'Om Oss', href: '#about-us' },
    { name: 'Kontakt', href: '#contact' },
  ];

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      const headerHeight = 80;
      const elementPosition = (element as HTMLElement).offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false); // Always close mobile menu
  };

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg' 
        : 'bg-transparent'
    }`}>
      <nav className="container-max section-padding">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <img
              src="/logo.svg"
              alt="Hampaoasen Logo"
              className="w-12 h-12 object-contain"
              onError={(e) => {
                // Fallback to icon if logo doesn't exist
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="w-10 h-10 bg-hemp-600 rounded-full flex items-center justify-center hidden">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-hemp-800">Hampaoasen</h1>
              <p className="text-xs text-hemp-600 -mt-1">Hampa & Biologisk Mångfald</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-hemp-700 hover:text-hemp-900 font-medium transition-colors duration-200 relative group"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick(item.href);
                }}
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-hemp-600 transition-all duration-200 group-hover:w-full"></span>
              </a>
            ))}
            <a
              href="#contact"
              className="btn-primary"
              onClick={(e) => {
                e.preventDefault();
                handleNavClick('#contact');
              }}
            >
              Få Offert
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-hemp-700 hover:bg-hemp-100 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-hemp-200 bg-white/95 backdrop-blur-md rounded-b-lg shadow-lg">
            <div className="flex flex-col space-y-4">
              {navigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-hemp-700 hover:text-hemp-900 font-medium py-2 px-4 rounded-lg hover:bg-hemp-50 transition-all duration-200"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(item.href);
                  }}
                >
                  {item.name}
                </a>
              ))}
              <a
                href="#contact"
                className="btn-primary mx-4 text-center"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#contact');
                }}
              >
                Få Offert
              </a>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;