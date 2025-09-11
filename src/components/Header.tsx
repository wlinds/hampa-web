import React, { useState, useEffect } from 'react';
import { Menu, X, Leaf } from 'lucide-react';
// import { LogIn, LogOut, User, Settings, Edit } from 'lucide-react';
// import { useAuth } from '../contexts/AuthContext';
// import { LoginModal } from './auth/LoginModal';

// interface LoginModalContextType {
//   showLoginModal: () => void;
// }

// export const LoginModalContext = React.createContext<LoginModalContextType>({
//   showLoginModal: () => {}
// });

const Header: React.FC = () => {
  // const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  // const [showLoginModal, setShowLoginModal] = useState(false);
  // const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Hem', href: '/' },
    { name: 'Tjänster', href: '/#services' },
    { name: 'Om Hampa', href: '/#about-hemp' },
    // { name: 'Blogg', href: '/blog' },
    { name: 'Bildgalleri', href: '/#gallery' },
    { name: 'Frågor & Svar', href: '/#faq' },
    { name: 'Om Oss', href: '/#about-us' },
    { name: 'Kontakt', href: '/#contact' },
  ];

  const handleNavClick = (href: string) => {
    if (href.startsWith('/#')) {
      // Handle anchor links
      if (window.location.pathname !== '/') {
        window.location.href = href;
      } else {
        const element = document.querySelector(href.substring(1));
        if (element) {
          const headerHeight = 80;
          const elementPosition = (element as HTMLElement).offsetTop - headerHeight;
          window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
          });
        }
      }
    } else {
      // Handle regular routes
      window.location.href = href;
    }
    setIsMenuOpen(false);
  };

  // const handleSignOut = async () => {
  //   await signOut();
  //   setShowUserMenu(false);
  //   window.location.href = '/';
  // };

  // const triggerLoginModal = () => {
  //   setShowLoginModal(true);
  // };

  // // Provide login modal trigger to child components
  // const loginModalContextValue = {
  //   showLoginModal: triggerLoginModal
  // };

  return (
    // <LoginModalContext.Provider value={loginModalContextValue}>
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
                src="/logo.png"
                alt="Hampaoasen Logo"
                className="w-12 h-12 object-contain"
                onError={(e) => {
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
            <div className="hidden lg:flex items-center space-x-6">
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
            </div>

            {/* User Menu / Auth - HIDDEN ON THIS BRANCH */}
            {/* <div className="hidden lg:flex items-center space-x-4">
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 text-hemp-700 hover:text-hemp-900 transition-colors duration-200"
                  >
                    <User className="w-5 h-5" />
                    <span className="font-medium">
                      {user.profile?.full_name || user.email}
                    </span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-hemp-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-hemp-100">
                        <p className="text-sm font-medium text-hemp-900">
                          {user.profile?.full_name || user.email}
                        </p>
                        <p className="text-xs text-hemp-600">
                          {user.profile?.role === 'admin' ? 'Administrator' : 'AnvÃ¤ndare'}
                          {user.profile?.approved ? '' : ' (VÃ¤ntar pÃ¥ godkÃ¤nnande)'}
                        </p>
                      </div>

                      {user.profile?.approved && (
                        <a
                          href="/blog/new"
                          className="flex items-center space-x-2 px-4 py-2 text-hemp-700 hover:bg-hemp-50 transition-colors duration-200"
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick('/blog/new');
                            setShowUserMenu(false);
                          }}
                        >
                          <Edit className="w-4 h-4" />
                          <span>Skriv blogginlÃ¤gg</span>
                        </a>
                      )}

                      {user.profile?.role === 'admin' && (
                        <a
                          href="/admin"
                          className="flex items-center space-x-2 px-4 py-2 text-hemp-700 hover:bg-hemp-50 transition-colors duration-200"
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick('/admin');
                            setShowUserMenu(false);
                          }}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Adminpanel</span>
                        </a>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 w-full px-4 py-2 text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logga ut</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="flex items-center space-x-2 text-hemp-700 hover:text-hemp-900 font-medium transition-colors duration-200 relative group"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Logga in</span>
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-hemp-600 transition-all duration-200 group-hover:w-full"></span>
                </button>
              )}
            </div> */}

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 rounded-lg text-hemp-700 hover:bg-hemp-100 transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="lg:hidden py-4 border-t border-hemp-200 bg-white/95 backdrop-blur-md rounded-b-lg shadow-lg">
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

                {/* Mobile Auth - HIDDEN ON THIS BRANCH */}
                {/* <div className="border-t border-hemp-200 pt-4 mx-4">
                  {user ? (
                    <div className="space-y-2">
                      <div className="px-4 py-2">
                        <p className="text-sm font-medium text-hemp-900">
                          {user.profile?.full_name || user.email}
                        </p>
                        <p className="text-xs text-hemp-600">
                          {user.profile?.role === 'admin' ? 'Administrator' : 'AnvÃ¤ndare'}
                        </p>
                      </div>

                      {user.profile?.approved && (
                        <a
                          href="/blog/new"
                          className="flex items-center space-x-2 text-hemp-700 hover:text-hemp-900 py-2 px-4 rounded-lg hover:bg-hemp-50 transition-all duration-200"
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick('/blog/new');
                          }}
                        >
                          <Edit className="w-4 h-4" />
                          <span>Skriv blogginlÃ¤gg</span>
                        </a>
                      )}

                      {user.profile?.role === 'admin' && (
                        <a
                          href="/admin"
                          className="flex items-center space-x-2 text-hemp-700 hover:text-hemp-900 py-2 px-4 rounded-lg hover:bg-hemp-50 transition-all duration-200"
                          onClick={(e) => {
                            e.preventDefault();
                            handleNavClick('/admin');
                          }}
                        >
                          <Settings className="w-4 h-4" />
                          <span>Adminpanel</span>
                        </a>
                      )}

                      <button
                        onClick={handleSignOut}
                        className="flex items-center space-x-2 w-full text-red-600 hover:text-red-800 py-2 px-4 rounded-lg hover:bg-red-50 transition-all duration-200"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logga ut</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowLoginModal(true);
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-2 text-hemp-700 hover:text-hemp-900 font-medium py-2 px-4 rounded-lg hover:bg-hemp-50 transition-all duration-200 w-full"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Logga in</span>
                    </button>
                  )}
                </div> */}
              </div>
            </div>
          )}
        </nav>

        {/* Login Modal - HIDDEN ON THIS BRANCH */}
        {/* <LoginModal 
          isOpen={showLoginModal} 
          onClose={() => setShowLoginModal(false)} 
        /> */}

        {/* Click outside to close user menu - HIDDEN ON THIS BRANCH */}
        {/* {showUserMenu && (
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowUserMenu(false)}
          />
        )} */}
      </header>
    // </LoginModalContext.Provider>
  );
};

export default Header;