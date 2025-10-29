import React, { useState, useEffect, useCallback } from 'react';
import { useWeather } from '../hooks/useWeather';
import ZipCodeInput from './ZipCodeInput';
import ComparisonView from './ComparisonView';
import AppSettings from './AppSettings';
import HelpSection from './HelpSection';
import UserOnboarding from './UserOnboarding';

/**
 * Main App Component
 */
const App = () => {
  // Use our custom hook to manage weather data
  const {
    zipCode,
    data: weatherData,
    isLoading,
    error,
    recentZipCodes,
    setZipCodeAndFetchTriple,
    refreshData
  } = useWeather();

  // State to track onboarding completion
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // Check if we're in demo mode
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  useEffect(() => {
    // Check if we're in demo mode by trying to fetch a test endpoint
    fetch('/api/status')
      .then(response => response.json())
      .then(data => {
        setIsDemoMode(data.demoMode || false);
      })
      .catch(() => {
        setIsDemoMode(true);
      });
  }, []);
  
  // Memoized handler for ZIP code submission
  const handleZipCodeSubmit = useCallback((zipCode) => {
    setZipCodeAndFetchTriple(zipCode);
  }, [setZipCodeAndFetchTriple]);
  
  // Memoized handler for refreshing data
  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  // Ensure we always have multi-source data for the comparison view
  useEffect(() => {
    if (zipCode && (!Array.isArray(weatherData) || weatherData.length === 0)) {
      setZipCodeAndFetchTriple(zipCode);
    }
  }, [zipCode, weatherData, setZipCodeAndFetchTriple]);
  
  // Handle onboarding completion
  const handleOnboardingComplete = useCallback(() => {
    setOnboardingComplete(true);
    localStorage.setItem('onboardingComplete', 'true');
  }, []);

  // Check if onboarding was previously completed
  useEffect(() => {
    const completed = localStorage.getItem('onboardingComplete') === 'true';
    setOnboardingComplete(completed);
  }, []);

  return (
    <div className="app-container">
      <header className="header" role="banner">
        <div className="container">
          <h1>Super Sky</h1>
          {isDemoMode && (
            <div className="demo-mode-banner" role="alert">
              <p>Running in Demo Mode - Using sample data</p>
            </div>
          )}
        </div>
      </header>
      <main className="main-content" role="main">
        <div className="container">
          <div className="row">
            <div className="col" style={{ maxWidth: '1000px', margin: '0 auto' }}>
              <div className="controls-row">
                <div id="refresh-controls">
                  <div className="refresh-controls" role="region" aria-label="Data refresh controls">
                    <button
                      className="btn btn-secondary"
                      onClick={handleRefresh}
                      disabled={isLoading}
                      aria-busy={isLoading ? "true" : "false"}
                    >
                      <span aria-hidden="true">↻</span> Refresh Data
                    </button>
                  </div>
                </div>
              </div>
              
              <div id="zip-code-input">
                <ZipCodeInput
                  onSubmit={handleZipCodeSubmit}
                  recentZipCodes={recentZipCodes}
                />
              </div>

              <ComparisonView
                weatherData={weatherData}
                isLoading={isLoading}
                error={error}
              />
              
              {/* Settings and Help Container for responsive layout */}
              <div className="settings-help-container">
                {/* App Settings Component */}
                <div id="app-settings">
                  <AppSettings zipCode={zipCode} />
                </div>
                
                {/* Help Section Component */}
                <HelpSection />
              </div>
              
              {/* User Onboarding Component */}
              {!onboardingComplete && (
                <UserOnboarding onComplete={handleOnboardingComplete} />
              )}
            </div>
          </div>
        </div>
      </main>
      
      <footer className="footer" role="contentinfo">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} Super Sky</p>
          <p>
            <small>
              Node.js Implementation
              <br />
              Server-side API, React with Webpack, Express
            </small>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;