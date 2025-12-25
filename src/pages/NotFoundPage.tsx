// src/pages/NotFoundPage.tsx
import React from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white flex items-center justify-center">
      <div className="container-max section-padding py-20">
        <div className="text-center max-w-lg mx-auto">
          <h1 className="text-8xl font-bold text-hemp-300 mb-4">404</h1>
          <h2 className="text-2xl md:text-3xl font-bold text-hemp-900 mb-4">
            Sidan hittades inte
          </h2>
          <p className="text-hemp-600 mb-8">
            Sidan du letar efter finns inte eller har flyttats. Kontrollera adressen eller gå tillbaka till startsidan.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              as="a"
              href="/"
              variant="primary"
            >
              <Home className="w-4 h-4 mr-2" />
              Till startsidan
            </Button>
            <Button
              as="button"
              variant="secondary"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Gå tillbaka
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
