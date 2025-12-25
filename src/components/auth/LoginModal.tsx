// src/components/auth/LoginModal.tsx
import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { signIn, signUp, user } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user && isOpen && !loading) {
      console.log('User logged in, closing modal:', user.id);
      setTimeout(() => {
        onClose();
      }, 100);
    }
  }, [user, isOpen, loading, onClose]);

  if (!isOpen) return null;

  const getFirebaseErrorMessage = (errorCode: string) => {
    switch (errorCode) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Felaktiga inloggningsuppgifter. Kontrollera email och lösenord.';
      case 'auth/user-disabled':
        return 'Detta konto har inaktiverats.';
      case 'auth/too-many-requests':
        return 'För många inloggningsförsök. Försök igen senare.';
      case 'auth/email-already-in-use':
        return 'En användare med denna e-postadress finns redan.';
      case 'auth/weak-password':
        return 'Lösenordet är för svagt. Använd minst 6 tecken.';
      case 'auth/invalid-email':
        return 'Ogiltig e-postadress.';
      case 'auth/operation-not-allowed':
        return 'E-post/lösenord-inloggning är inte aktiverat.';
      case 'auth/network-request-failed':
        return 'Nätverksfel. Kontrollera din internetanslutning.';
      default:
        return 'Ett fel uppstod. Försök igen.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (formData.password !== formData.confirmPassword) {
          setError('Lösenorden matchar inte');
          return;
        }

        const { error } = await signUp(formData.email, formData.password, formData.fullName);
        
        if (error) {
          console.error('Signup error:', error);
          // Extract error code from Firebase error message
          const errorCode = error.message.includes('auth/') 
            ? error.message.match(/auth\/[a-z-]+/)?.[0] 
            : null;
          setError(errorCode ? getFirebaseErrorMessage(errorCode) : error.message);
        } else {
          setSuccess('Konto skapat! Väntar på godkännande från admin.');
          setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
        }
      } else {
        console.log('Attempting login...');
        const { data, error } = await signIn(formData.email, formData.password);
        
        console.log('Login response:', { data, error });
        
        if (error) {
          console.error('Login error:', error);
          
          // Extract error code from Firebase error message
          const errorCode = error.message.includes('auth/') 
            ? error.message.match(/auth\/[a-z-]+/)?.[0] 
            : null;
          setError(errorCode ? getFirebaseErrorMessage(errorCode) : error.message);
        } else {
          // The useEffect above will close the modal when user state updates
          console.log('Login API call successful, waiting for auth state change...');
        }
      }
    } catch (err) {
      console.error('Unexpected error during auth:', err);
      setError('Ett fel uppstod. Försök igen.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-hemp-100">
          <h2 className="text-xl font-semibold text-hemp-900">
            {isSignUp ? 'Skapa konto' : 'Logga in'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-hemp-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5 text-hemp-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start space-x-2">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
            {isSignUp && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-hemp-900 mb-2">
                  Fullständigt namn *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-hemp-400" />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    autoComplete="name"
                    required
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent transition-all duration-200"
                    placeholder="Ditt fullständiga namn"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-hemp-900 mb-2">
                E-post *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-hemp-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent transition-all duration-200"
                  placeholder="din@email.se"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-hemp-900 mb-2">
                Lösenord *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-hemp-400" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent transition-all duration-200"
                  placeholder="Ditt lösenord"
                  minLength={6}
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-hemp-900 mb-2">
                  Bekräfta lösenord *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-hemp-400" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    autoComplete="new-password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-hemp-200 rounded-lg focus:ring-2 focus:ring-hemp-500 focus:border-transparent transition-all duration-200"
                    placeholder="Bekräfta ditt lösenord"
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Laddar...' : (isSignUp ? 'Skapa konto' : 'Logga in')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
                setFormData({ email: '', password: '', fullName: '', confirmPassword: '' });
              }}
              className="text-hemp-600 hover:text-hemp-800 text-sm font-medium"
            >
              {isSignUp ? 'Har du redan ett konto? Logga in' : 'Behöver du ett konto? Registrera dig'}
            </button>
          </div>

          {isSignUp && (
            <div className="mt-4 p-3 bg-hemp-50 border border-hemp-200 rounded-lg">
              <p className="text-hemp-700 text-xs">
                <strong>OBS:</strong> Nya konton behöver godkännas av en admin innan du kan skriva nyheter.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};