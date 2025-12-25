// src/components/auth/ProtectedRoute.tsx
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLoginModal } from '../../contexts/LoginModalContext';
import { AlertCircle } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireApproval?: boolean;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireApproval = false,
  requireAdmin = false
}) => {
  const { user, loading } = useAuth();
  const { showLoginModal } = useLoginModal();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-hemp-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-hemp-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-hemp-900 mb-2">
          Inloggning krävs
        </h3>
        <p className="text-hemp-600 mb-6">
          Du måste vara inloggad för att komma åt denna sida.
        </p>
        <button
          onClick={showLoginModal}
          className="text-hemp-600 hover:text-hemp-800 font-medium transition-colors duration-200"
        >
          Logga in
        </button>
      </div>
    );
  }

  if (requireApproval && !user.profile?.approved) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-hemp-900 mb-2">
          Väntar på godkännande
        </h3>
        <p className="text-hemp-600">
          Ditt konto väntar på godkännande från en admin.
        </p>
      </div>
    );
  }

  if (requireAdmin && user.profile?.role !== 'admin') {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-hemp-900 mb-2">
          Åtkomst nekad
        </h3>
        <p className="text-hemp-600">
          Du har inte behörighet att komma åt denna sida.
        </p>
      </div>
    );
  }

  return <>{children}</>;
};