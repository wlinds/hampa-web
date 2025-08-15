import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './pages/LandingPage';
import BlogListPage from './pages/BlogListPage';
import BlogPostPage from './pages/BlogPostPage';
import BlogEditorPage from './pages/BlogEditorPage';
import AdminPage from './pages/AdminPage';
import Footer from './components/Footer';
import { AuthProvider } from './contexts/AuthContext';
import AdminNotification from './components/admin/AdminNotification';
import './index.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gradient-to-b from-hemp-50 to-white">
          <Header />
          <main>
            <Routes>
              
              <Route path="/" element={<LandingPage />} />
              <Route path="/blog" element={<BlogListPage />} />
              <Route path="/blog/new" element={<BlogEditorPage />} />
              <Route path="/blog/:slug" element={<BlogPostPage />} />
              <Route path="/blog/:slug/edit" element={<BlogEditorPage />} />
              <Route path="/admin" element={<AdminPage />} />
            </Routes>
          </main>
          <AdminNotification />
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;