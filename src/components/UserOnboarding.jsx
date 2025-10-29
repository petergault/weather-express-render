import React, { useState } from 'react';

const steps = [
  {
    title: 'Welcome to Super Sky',
    message: 'Enter a ZIP code to compare daily forecasts from multiple providers.',
  },
  {
    title: 'Spot the trends',
    message: 'Use the color cues and precipitation details to see how providers align.',
  },
  {
    title: 'Stay prepared',
    message: 'Refresh often when the weather shifts to keep your plan on track.',
  },
];

const UserOnboarding = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((step) => step + 1);
    } else if (onComplete) {
      onComplete();
    }
  };

  return (
    <section className="card onboarding" aria-live="polite" aria-label="Getting started guide">
      <h2>{steps[currentStep].title}</h2>
      <p>{steps[currentStep].message}</p>
      <div className="onboarding-controls">
        <button type="button" className="btn btn-primary" onClick={handleNext}>
          {currentStep < steps.length - 1 ? 'Next' : 'Got it'}
        </button>
      </div>
    </section>
  );
};

export default UserOnboarding;
