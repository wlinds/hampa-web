import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import NewsListPage from './pages/NewsListPage';
import NewsPostPage from './pages/NewsPostPage';
import NewsEditorPage from './pages/NewsEditorPage';
import AdminPage from './pages/AdminPage';
import HempCalculatorPage from './pages/HempCalculatorPage';
import NotFoundPage from './pages/NotFoundPage';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import { LoginModalProvider } from './contexts/LoginModalContext';
import AdminNotification from './components/admin/AdminNotification';
import './index.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <LoginModalProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="min-h-screen bg-gradient-to-b from-hemp-50 to-white">
            <Header />
            <main>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/nyheter" element={<NewsListPage />} />
                <Route path="/nyheter/new" element={<NewsEditorPage />} />
                <Route path="/nyheter/:slug" element={<NewsPostPage />} />
                <Route path="/nyheter/:slug/edit" element={<NewsEditorPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/kalkyl" element={<HempCalculatorPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <AdminNotification />
            <Footer />
          </div>
        </Router>
      </LoginModalProvider>
    </AuthProvider>
  );
};

export default App;