// src/contexts/LoginModalContext.tsx
import React, { createContext, useContext, useState } from 'react';
import { LoginModal } from '../components/auth/LoginModal';

interface LoginModalContextType {
  showLoginModal: () => void;
  hideLoginModal: () => void;
  isLoginModalOpen: boolean;
}

const LoginModalContext = createContext<LoginModalContextType | undefined>(undefined);

export const useLoginModal = () => {
  const context = useContext(LoginModalContext);
  if (context === undefined) {
    throw new Error('useLoginModal must be used within a LoginModalProvider');
  }
  return context;
};

interface LoginModalProviderProps {
  children: React.ReactNode;
}

export const LoginModalProvider: React.FC<LoginModalProviderProps> = ({ children }) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const showLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  const hideLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const value = {
    showLoginModal,
    hideLoginModal,
    isLoginModalOpen
  };

  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={hideLoginModal} 
      />
    </LoginModalContext.Provider>
  );
};