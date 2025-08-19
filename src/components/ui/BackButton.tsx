// src/components/ui/BackButton.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  to: string;
  children: React.ReactNode;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ 
  to, 
  children, 
  className = "" 
}) => {
  return (
    <Link
      to={to}
      className={`inline-flex items-center text-hemp-600 hover:text-hemp-800 transition-colors duration-200 ${className}`}
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      {children}
    </Link>
  );
};