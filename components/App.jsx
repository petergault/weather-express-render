// App.jsx
const { useState, useEffect, useCallback, useMemo, memo } = React;


// Type definitions (simulating TypeScript)
/**
 * @typedef {Object} ZipCodeValidation
 * @property {boolean} isValid - Whether the ZIP code is valid
 * @property {string|null} error - Error message if invalid
 */

/**
 * Validates a US ZIP code
 * @param {string} zipCode - The ZIP code to validate
 * @returns {ZipCodeValidation} - Validation result
 */
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

// ZipCodeInput Component - Memoized for performance
const ZipCodeInput = memo(({ onSubmit, recentZipCodes = [] }) => {
  const [zipCode, setZipCode] = useState('');
  const [validation, setValidation] = useState({ isValid: true, error: null });
  const [showRecent, setShowRecent] = useState(false);
  
  // Simplified input handler
  const handleInputChange = (e) => {
    const value = e.target.value;
    setZipCode(value);
    
    // Clear validation errors when user types
    if (validation.error) {
      setValidation({ isValid: true, error: null });
    }
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Trim the zipCode to remove any whitespace
    const trimmedZipCode = zipCode.trim();
    
    const result = validateZipCode(trimmedZipCode);
    setValidation(result);
    
    if (result.isValid) {
      onSubmit(trimmedZipCode);
      setShowRecent(false);
    }
  };
  
  const handleRecentZipCodeClick = (zip) => {
    onSubmit(zip);
    setZipCode(zip);
    setShowRecent(false);
  };
  
  const toggleRecentZipCodes = () => {
    setShowRecent(!showRecent);
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
              aria-invalid={validation.error ? "true" : "false"}
              aria-describedby={validation.error ? "zipcode-error" : undefined}
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
                    <button
                      type="button"
                      onClick={() => handleRecentZipCodeClick(zip)}
                    >
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

// Set display name for debugging
ZipCodeInput.displayName = 'ZipCodeInput';

// WeatherDisplay Component - Memoized for performance
const WeatherDisplay = memo(({ zipCode, weatherData, isLoading, error }) => {
  if (isLoading) {
    return <SkeletonLoader type="weather" />;
  }
  
  if (error) {
    return (
      <div className="weather-display card" role="region" aria-label="Weather information error">
        <div className="error" role="alert">
          <h3>Error</h3>
          <p>{error}</p>
          <p>Please try again or check your internet connection.</p>
        </div>
      </div>
    );
  }
  
  if (!weatherData) {
    return (
      <div className="weather-display card" role="region" aria-label="Weather information placeholder">
        <div className="weather-placeholder">
          <p>Weather will load automatically using your location, or enter a ZIP code above</p>
        </div>
      </div>
    );
  }
  
  // Handle both single weather data (location-based) and array (ZIP code triple-check)
  const displayData = Array.isArray(weatherData) ? weatherData[0] : weatherData;
  
  if (!displayData) {
    return (
      <div className="weather-display card" role="region" aria-label="Weather information placeholder">
        <div className="weather-placeholder">
          <p>Weather will load automatically using your location, or enter a ZIP code above</p>
        </div>
      </div>
    );
  }
  
  // Display weather information
  return (
    <div className="weather-display card" role="region" aria-label={`Weather information for ${displayData.location.city}`}>
      <div>
        <h2>Weather for {displayData.location.city}, {displayData.location.state} {displayData.location.zipCode && displayData.location.zipCode !== 'Auto-detected' ? `(${displayData.location.zipCode})` : ''}</h2>
        
        <div className="weather-info">
          <div className="current-weather">
            <h3>Current Conditions</h3>
            <p className="temperature">
              {displayData.hourly && displayData.hourly[0] && displayData.hourly[0].temperature ?
                (window.helpers && typeof window.helpers.formatTemperature === 'function'
                  ? window.helpers.formatTemperature(displayData.hourly[0].temperature.value)
                  : `${displayData.hourly[0].temperature.value}°F`)
                : (displayData.current && displayData.current.temperature ?
                    (window.helpers && typeof window.helpers.formatTemperature === 'function'
                      ? window.helpers.formatTemperature(displayData.current.temperature)
                      : `${displayData.current.temperature}°F`)
                    : 'N/A')}
            </p>
            <p className="description">{displayData.current ? (displayData.current.shortPhrase || displayData.current.iconPhrase || 'N/A') : 'N/A'}</p>
            <p>Feels like: {displayData.hourly && displayData.hourly[0] && displayData.hourly[0].realFeelTemperature ?
                (window.helpers && typeof window.helpers.formatTemperature === 'function'
                  ? window.helpers.formatTemperature(displayData.hourly[0].realFeelTemperature.value)
                  : `${displayData.hourly[0].realFeelTemperature.value}°F`)
                : (displayData.current && displayData.current.feelsLike ?
                    (window.helpers && typeof window.helpers.formatTemperature === 'function'
                      ? window.helpers.formatTemperature(displayData.current.feelsLike)
                      : `${displayData.current.feelsLike}°F`)
                    : 'N/A')}</p>
            <p>Humidity: {displayData.hourly && displayData.hourly[0] && displayData.hourly[0].relativeHumidity ?
                `${displayData.hourly[0].relativeHumidity}%`
                : (displayData.current && displayData.current.humidity ?
                    `${displayData.current.humidity}%`
                    : 'N/A')}</p>
            <p>Wind: {displayData.current && displayData.current.wind && displayData.current.wind.speed ?
                (window.helpers && typeof window.helpers.formatWindSpeed === 'function'
                  ? window.helpers.formatWindSpeed(displayData.current.wind.speed.value)
                  : `${displayData.current.wind.speed.value} ${displayData.current.wind.speed.unit}`)
                : (displayData.current && displayData.current.windSpeed ?
                    (window.helpers && typeof window.helpers.formatWindSpeed === 'function'
                      ? window.helpers.formatWindSpeed(displayData.current.windSpeed)
                      : `${displayData.current.windSpeed} mph`)
                    : 'N/A')}</p>
            <p>Precipitation: {displayData.current && displayData.current.precipitationProbability !== undefined ?
                (window.helpers && typeof window.helpers.formatProbability === 'function'
                  ? window.helpers.formatProbability(displayData.current.precipitationProbability)
                  : `${displayData.current.precipitationProbability}%`)
                : (displayData.hourly && displayData.hourly[0] && displayData.hourly[0].precipitationProbability !== undefined ?
                    (window.helpers && typeof window.helpers.formatProbability === 'function'
                      ? window.helpers.formatProbability(displayData.hourly[0].precipitationProbability)
                      : `${displayData.hourly[0].precipitationProbability}%`)
                    : 'N/A')}</p>
          </div>
          <div className="source-info">
            <p>Source: {displayData.source}</p>
            <p>Last Updated: {
              window.helpers && typeof window.helpers.formatDate === 'function' && typeof window.helpers.formatTime === 'function'
                ? `${window.helpers.formatDate(displayData.lastUpdated)} ${window.helpers.formatTime(displayData.lastUpdated)}`
                : new Date(displayData.lastUpdated).toLocaleString()
            }</p>
          </div>
        </div>
      </div>
    </div>
  );
});

// Set display name for debugging
WeatherDisplay.displayName = 'WeatherDisplay';

// RefreshButton Component
const RefreshButton = memo(({ onRefresh, isLoading }) => {
  return (
    <div className="refresh-controls" role="region" aria-label="Data refresh controls">
      <button
        className="btn btn-secondary"
        onClick={onRefresh}
        disabled={isLoading}
        aria-busy={isLoading ? "true" : "false"}
      >
        <span aria-hidden="true">↻</span> Refresh Data
      </button>
    </div>
  );
});

// Set display name for debugging
RefreshButton.displayName = 'RefreshButton';

// Main App Component
const App = () => {
  // Use our custom hook to manage weather data with both ZIP code and location support
  const {
    data: weatherData,
    isLoading,
    error,
    zipCode,
    recentZipCodes,
    setZipCode,
    fetchTripleCheck,
    refreshData
  } = window.useWeather();
  
  // Memoized handler for ZIP code submission
  const handleZipCodeSubmit = useCallback((newZipCode) => {
    setZipCode(newZipCode);
    fetchTripleCheck(newZipCode);
    
    // Update URL with ZIP code parameter
    const url = new URL(window.location);
    url.searchParams.set('zip', newZipCode);
    window.history.pushState({}, '', url);
  }, [setZipCode, fetchTripleCheck]);
  
  // Memoized handler for refreshing data
  const handleRefresh = useCallback(() => {
    refreshData();
  }, [refreshData]);
  
  // Check if we're in demo mode - now handled by the server
  const [isDemoMode, setIsDemoMode] = useState(false);
  
  useEffect(() => {
    // Check if we're in demo mode based on server configuration
    // The server will now handle API keys, so we just check if we're in demo mode
    fetch('/api/status')
      .then(response => response.json())
      .catch(() => ({ demoMode: false }))
      .then(data => {
        const demoMode = data.demoMode || false;
        setIsDemoMode(demoMode);
        // Store demo mode status in localStorage for the config module
        localStorage.setItem('DEMO_MODE', demoMode.toString());
      });
  }, []);
  
  return (
    <div className="app-container">
      <header className="header" role="banner">
        <div className="container header-container">
          <div className="header-title">
            <img src="icons/logo.png" alt="Super Sky Logo" className="header-logo" />
            <h1>Super Sky</h1>
          </div>
          
          <div className="header-zip-input">
            <ZipCodeInput
              onSubmit={handleZipCodeSubmit}
              recentZipCodes={recentZipCodes}
            />
          </div>
          
          <div id="refresh-controls" className="header-refresh">
            <RefreshButton
              onRefresh={handleRefresh}
              isLoading={isLoading}
            />
          </div>
          
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
            <div className="col">
              <WeatherDisplay
                zipCode={zipCode}
                weatherData={weatherData}
                isLoading={isLoading}
                error={error}
              />
              
              <ComparisonView
                weatherData={weatherData}
                isLoading={isLoading}
                error={error}
              />
              
              {/* Settings and Help Container removed */}
              
            </div>
          </div>
        </div>
      </main>
      
      <footer className="footer" role="contentinfo">
        <div className="container">
          <div className="footer-logo">
            <img src="Super Sky Full Logo.png" alt="Super Sky Full Logo" className="footer-logo-image" />
          </div>
          <p><em>Dedicated to my dog Sky.</em></p>
        </div>
      </footer>
    </div>
  );
};

// Export the App component
window.App = App;