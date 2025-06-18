import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import Footer from './components/Footer';
import './index.css';

const App: React.FC = () => {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gradient-to-b from-hemp-50 to-white">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            {/* Future routes will go here */}
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;