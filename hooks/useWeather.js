/**
 * useWeather Hook
 *
 * This custom hook handles fetching and managing weather data with support for both
 * ZIP code input and automatic location detection.
 * 
 * Features:
 * - Automatic location-based weather fetching on initial load (when no ZIP code provided)
 * - Manual ZIP code input with triple-check weather data
 * - URL parameter handling for ZIP codes
 * - Recent ZIP codes management
 */

// Simulate React hooks
const { useState, useEffect, useCallback, useRef } = React;

/**
 * Custom hook for fetching and managing weather data
 * @returns {Object} - Weather data state and functions
 */
function useWeather() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [zipCode, setZipCode] = useState('');
  const [recentZipCodes, setRecentZipCodes] = useState([]);
  
  // Keep track of whether this is the first render
  const isFirstRender = useRef(true);
  
  // Keep track of the last fetch time
  const lastFetchTime = useRef(null);
  
  // Function to fetch weather data using automatic location detection
  const fetchWeatherByLocation = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      setRetryCount(0);
      
      // Record fetch start time
      const fetchStartTime = Date.now();
      lastFetchTime.current = fetchStartTime;
      
      // Use the weatherService to fetch location-based data
      const weatherData = await window.weatherService.fetchWeatherDataByLocation('azuremaps', forceRefresh);
      
      // Only update state if this is still the most recent fetch
      if (lastFetchTime.current === fetchStartTime) {
        // Check if there was an error in the weather data
        if (weatherData.isError) {
          // Enhanced error handling for back-end API errors
          const errorMsg = weatherData.errorMessage || 'Failed to fetch weather data.';
          setError(errorMsg);
          
          // Log more detailed error information if available
          if (weatherData.errorDetails) {
            console.error('Detailed error information:', weatherData.errorDetails);
          }
        }
        
        setData(weatherData);
      }
    } catch (err) {
      console.error('Error fetching weather data by location:', err);
      
      // Check if this is a 400 error (likely missing Cloudflare headers in development)
      if (err.message && err.message.includes('400')) {
        console.log('Location-based endpoint failed (likely development environment), falling back to default location');
        
        // Fall back to NYC ZIP code (10001) for development
        try {
          // Record fetch start time for fallback
          const fetchStartTime = Date.now();
          lastFetchTime.current = fetchStartTime;
          
          const fallbackWeatherData = await window.weatherService.fetchTripleCheckWeather('10001', forceRefresh);
          
          // Only update state if this is still the most recent fetch
          if (lastFetchTime.current === fetchStartTime) {
            // Add a note that this is fallback data
            if (fallbackWeatherData && fallbackWeatherData.length > 0) {
              fallbackWeatherData[0].isFallbackData = true;
              fallbackWeatherData[0].fallbackReason = 'Using NYC as default location for development';
            }
            setData(fallbackWeatherData);
          }
          return; // Exit early, don't set error
        } catch (fallbackErr) {
          console.error('Fallback to NYC also failed:', fallbackErr);
          setError('Unable to fetch weather data. Please enter a ZIP code manually.');
        }
      } else {
        setError('Failed to fetch weather data from the server. Please try again.');
      }
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Function to fetch weather data using ZIP code (triple-check)
  const fetchTripleCheck = useCallback(async (zipCodeValue, forceRefresh = false) => {
    try {
      setIsLoading(true);
      setError(null);
      setRetryCount(0);
      
      // Record fetch start time
      const fetchStartTime = Date.now();
      lastFetchTime.current = fetchStartTime;
      
      // Use the weatherService to fetch triple-check data
      const weatherData = await window.weatherService.fetchTripleCheckWeather(zipCodeValue, forceRefresh);
      
      // Only update state if this is still the most recent fetch
      if (lastFetchTime.current === fetchStartTime) {
        // Check if there was an error in the weather data
        if (weatherData && weatherData.length > 0 && weatherData[0].isError) {
          // Enhanced error handling for back-end API errors
          const errorMsg = weatherData[0].errorMessage || 'Failed to fetch weather data.';
          setError(errorMsg);
          
          // Log more detailed error information if available
          if (weatherData[0].errorDetails) {
            console.error('Detailed error information:', weatherData[0].errorDetails);
          }
        }
        
        setData(weatherData);
        
        // Update recent ZIP codes
        if (zipCodeValue && !weatherData[0]?.isError) {
          setRecentZipCodes(prev => {
            const newList = [zipCodeValue, ...prev.filter(zip => zip !== zipCodeValue)];
            return newList.slice(0, 5); // Keep only last 5
          });
        }
      }
    } catch (err) {
      console.error('Error fetching weather data by ZIP code:', err);
      setError('Failed to fetch weather data from the server. Please try again.');
      setRetryCount(prev => prev + 1);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Function to set a new ZIP code and immediately fetch triple-check data
  const setZipCodeAndFetchTriple = useCallback((zip, forceRefresh = false) => {
    if (!zip) return;

    setZipCode(zip);
    fetchTripleCheck(zip, forceRefresh);
  }, [fetchTripleCheck]);

  // Function to refresh the current data
  const refreshData = useCallback(() => {
    if (zipCode) {
      // If we have a ZIP code, refresh with ZIP code data
      fetchTripleCheck(zipCode, true);
    } else {
      // Otherwise, refresh with location-based data
      fetchWeatherByLocation(true);
    }
  }, [zipCode, fetchTripleCheck, fetchWeatherByLocation]);
  
  // Load recent ZIP codes from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('recentZipCodes');
    if (saved) {
      try {
        setRecentZipCodes(JSON.parse(saved));
      } catch (e) {
        console.warn('Failed to parse recent ZIP codes from localStorage');
      }
    }
  }, []);
  
  // Save recent ZIP codes to localStorage when they change
  useEffect(() => {
    if (recentZipCodes.length > 0) {
      localStorage.setItem('recentZipCodes', JSON.stringify(recentZipCodes));
    }
  }, [recentZipCodes]);
  
  // Get ZIP code from URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlZipCode = urlParams.get('zip');
    if (urlZipCode) {
      setZipCode(urlZipCode);
    }
  }, []);
  
  // Fetch weather data based on ZIP code or location
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      
      if (zipCode) {
        // If ZIP code is provided, fetch weather for that ZIP code
        fetchTripleCheck(zipCode);
      } else {
        // Otherwise, fetch weather using automatic location detection
        fetchWeatherByLocation();
      }
    }
  }, [zipCode, fetchTripleCheck, fetchWeatherByLocation]);
  
  // Return the state and functions
  return {
    data,
    isLoading,
    error,
    retryCount,
    zipCode,
    recentZipCodes,
    setZipCode,
    fetchTripleCheck,
    fetchWeatherByLocation,
    setZipCodeAndFetchTriple,
    refreshData
  };
}

// Export the hook
window.useWeather = useWeather;