// src/components/ui/ErrorDisplay.tsx
import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { BackButton } from './BackButton';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryText?: string;
  retryLoading?: boolean;
  retryCount?: number;
  maxRetries?: number;
  backTo?: string;
  backText?: string;
  showRetryCount?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = "Ett fel uppstod",
  message,
  onRetry,
  retryText = "Försök igen",
  retryLoading = false,
  retryCount = 0,
  maxRetries = 5,
  backTo,
  backText,
  showRetryCount = true
}) => {
  return (
    <div className="min-h-screen pt-20 bg-gradient-to-b from-hemp-50 to-white">
      <div className="container-max section-padding py-20">
        {backTo && backText && (
          <BackButton to={backTo} className="mb-8">
            {backText}
          </BackButton>
        )}
        
        <div className="text-center max-w-md mx-auto">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-hemp-900 mb-2">
            {title}
          </h2>
          <p className="text-hemp-600 mb-6">
            {message}
          </p>
          
          {onRetry && retryCount < maxRetries && (
            <Button
              onClick={onRetry}
              loading={retryLoading}
              variant="primary"
              className="mb-4"
            >
              {retryLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Försöker igen...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {retryText}
                </>
              )}
            </Button>
          )}

          {showRetryCount && retryCount > 0 && retryCount < maxRetries && (
            <p className="text-xs text-hemp-500 mb-4">
              Försök {retryCount} av {maxRetries}
            </p>
          )}

          {retryCount >= maxRetries && (
            <p className="text-sm text-red-600 mb-4">
              Maximalt antal försök uppnått. Kontakta oss om problemet kvarstår.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};