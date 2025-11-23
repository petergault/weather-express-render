const { useState } = React;

const onboardingSteps = [
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
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep((step) => step + 1);
    } else if (typeof onComplete === 'function') {
      onComplete();
    }
  };

  const step = onboardingSteps[currentStep];

  return (
    <section className="card onboarding" aria-live="polite" aria-label="Getting started guide">
      <h2>{step.title}</h2>
      <p>{step.message}</p>
      <div className="onboarding-controls">
        <button type="button" className="btn btn-primary" onClick={handleNext}>
          {currentStep < onboardingSteps.length - 1 ? 'Next' : 'Got it'}
        </button>
      </div>
    </section>
  );
};

UserOnboarding.displayName = 'UserOnboarding';
window.UserOnboarding = UserOnboarding;
