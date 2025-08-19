// src/components/ui/LoadingSkeleton.tsx
import React from 'react';

interface LoadingSkeletonProps {
  type: 'post' | 'post-list' | 'post-card' | 'header' | 'admin-list';
  count?: number;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ type, count = 1 }) => {
  if (type === 'header') {
    return (
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="h-12 bg-hemp-100 rounded-lg mb-6 animate-pulse"></div>
        <div className="h-6 bg-hemp-100 rounded-lg mb-4 animate-pulse"></div>
        <div className="h-6 bg-hemp-100 rounded-lg w-3/4 mx-auto animate-pulse"></div>
      </div>
    );
  }

  if (type === 'post') {
    return (
      <div className="container-max section-padding py-20">
        <div className="h-6 w-32 bg-hemp-100 rounded mb-8 animate-pulse"></div>
        
        <header className="max-w-4xl mx-auto mb-12">
          <div className="h-12 bg-hemp-100 rounded-lg mb-6 animate-pulse"></div>
          <div className="h-4 w-64 bg-hemp-100 rounded mb-6 animate-pulse"></div>
          <div className="h-64 md:h-96 bg-hemp-100 rounded-2xl animate-pulse"></div>
        </header>
        
        <div className="max-w-4xl mx-auto space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 bg-hemp-100 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'post-card') {
    return (
      <div className="grid lg:grid-cols-2 gap-8">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-lg border border-hemp-100 overflow-hidden">
            <div className="h-48 bg-hemp-100 animate-pulse"></div>
            <div className="p-6">
              <div className="h-4 bg-hemp-100 rounded mb-3 animate-pulse"></div>
              <div className="h-8 bg-hemp-100 rounded mb-3 animate-pulse"></div>
              <div className="h-4 bg-hemp-100 rounded mb-4 animate-pulse"></div>
              <div className="h-4 bg-hemp-100 rounded w-24 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'post-list') {
    return (
      <>
        <LoadingSkeleton type="header" />
        <LoadingSkeleton type="post-card" count={4} />
      </>
    );
  }

  if (type === 'admin-list') {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-hemp-100 overflow-hidden">
        <div className="bg-hemp-100 p-6 animate-pulse">
          <div className="h-6 bg-hemp-200 rounded w-48"></div>
        </div>
        <div className="divide-y divide-hemp-100">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-hemp-100 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <div className="h-5 bg-hemp-100 rounded mb-2 w-48 animate-pulse"></div>
                    <div className="h-4 bg-hemp-100 rounded mb-2 w-64 animate-pulse"></div>
                    <div className="h-4 bg-hemp-100 rounded w-32 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <div className="h-8 bg-hemp-100 rounded w-24 animate-pulse"></div>
                  <div className="h-8 bg-hemp-100 rounded w-20 animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};