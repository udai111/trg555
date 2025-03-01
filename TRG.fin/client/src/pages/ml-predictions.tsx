import React from 'react';
import MLPrediction from '@/components/MLPrediction';
import ErrorBoundary from '@/components/ErrorBoundary';

const MLPredictions: React.FC = () => {
  return (
    <div className="container mx-auto py-6">
      <ErrorBoundary>
        <MLPrediction />
      </ErrorBoundary>
    </div>
  );
};

export default MLPredictions; 