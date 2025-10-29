const { useState, useEffect, useCallback, memo } = React;

const ComparisonView = window.ComparisonView;
const AppSettings = window.AppSettings;
const HelpSection = window.HelpSection;
const UserOnboarding = window.UserOnboarding;

const validateZipCode = (zipCode) => {
  if (!zipCode || zipCode.trim() === '') {
    return { isValid: false, error: 'ZIP code is required' };
  }

  const zipRegex = /^\d{5}$/;
  if (!zipRegex.test(zipCode)) {
    return { isValid: false, error: 'ZIP code must be 5 digits' };
  }

  return { isValid: true, error: null };
};

const ZipCodeInput = memo(({ onSubmit, recentZipCodes = [] }) => {
  const [zipCode, setZipCode] = useState('');
  const [validation, setValidation] = useState({ isValid: true, error: null });
  const [showRecent, setShowRecent] = useState(false);

  const handleInputChange = (event) => {
    setZipCode(event.target.value);

    if (validation.error) {
      setValidation({ isValid: true, error: null });
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmed = zipCode.trim();
    const result = validateZipCode(trimmed);
    setValidation(result);

    if (result.isValid) {
      onSubmit(trimmed);
      setShowRecent(false);
    }
  };

  const handleRecentZipCodeClick = (zip) => {
    onSubmit(zip);
    setZipCode(zip);
    setShowRecent(false);
  };

  const toggleRecentZipCodes = () => {
    setShowRecent((show) => !show);
  };

  return (
    <div className="card" role="region" aria-label="ZIP code input">
      <form onSubmit={handleSubmit} className="header-form">
        <div className="form-group">
          <label htmlFor="zipCode" className="form-label">Enter ZIP Code</label>
          <div className="input-with-dropdown">
            <input
              id="zipCode"
              type="text"
              className="form-input"
              value={zipCode}
              onChange={handleInputChange}
              placeholder="e.g., 10001"
              maxLength={5}
              aria-required="true"
              aria-invalid={validation.error ? 'true' : 'false'}
              aria-describedby={validation.error ? 'zipcode-error' : undefined}
            />
            {recentZipCodes.length > 0 && (
              <button
                type="button"
                className="recent-toggle"
                onClick={toggleRecentZipCodes}
                aria-label="Show recent ZIP codes"
              >
                ▼
              </button>
            )}
          </div>
          {validation.error && (
            <div className="form-error" id="zipcode-error" role="alert">{validation.error}</div>
          )}
          {showRecent && recentZipCodes.length > 0 && (
            <div className="recent-zip-codes">
              <h4>Recent ZIP Codes</h4>
              <ul>
                {recentZipCodes.map((zip, index) => (
                  <li key={index}>
                    <button type="button" onClick={() => handleRecentZipCodeClick(zip)}>
                      {zip}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <button type="submit" className="btn">Get Weather</button>
      </form>
    </div>
  );
});

ZipCodeInput.displayName = 'ZipCodeInput';
window.ZipCodeInput = ZipCodeInput;

const App = () => {
  const {
    zipCode,
    data: weatherData,
    isLoading,
    error,
    recentZipCodes,
    setZipCodeAndFetchTriple,
    refreshData,
  } = window.useWeather();

  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    fetch('/api/status')
      .then((response) => response.json())
      .then((data) => {
        setIsDemoMode(Boolean(data.demoMode));
      })
      .catch(() => {
        setIsDemoMode(true);
      });
  }, []);

  const handleZipCodeSubmit = useCallback((submittedZip) => {
    if (!submittedZip) return;

    setZipCodeAndFetchTriple(submittedZip);
  }, [setZipCodeAndFetchTriple]);

  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);

  useEffect(() => {
    if (zipCode && (!Array.isArray(weatherData) || weatherData.length === 0)) {
      setZipCodeAndFetchTriple(zipCode);
    }
  }, [zipCode, weatherData, setZipCodeAndFetchTriple]);

  const handleOnboardingComplete = useCallback(() => {
    setOnboardingComplete(true);
    localStorage.setItem('onboardingComplete', 'true');
  }, []);

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
                      aria-busy={isLoading ? 'true' : 'false'}
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

              <div className="settings-help-container">
                <div id="app-settings">
                  <AppSettings zipCode={zipCode} />
                </div>

                <HelpSection />
              </div>

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

App.displayName = 'App';
window.App = App;
