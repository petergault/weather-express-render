import React, { useMemo } from 'react';
import SkeletonLoader from './SkeletonLoader';

const formatTemperature = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  return `${Math.round(value)}°`;
};

const formatPrecipProbability = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  return `${Math.round(value)}%`;
};

const formatPrecipAmount = (value) => {
  if (typeof value !== 'number' || Number.isNaN(value)) {
    return '—';
  }

  return `${value.toFixed(2)} in`;
};

const normalizeDailyForecast = (entry) => {
  if (!entry || !Array.isArray(entry.daily)) {
    return [];
  }

  return entry.daily
    .filter(Boolean)
    .slice(0, 5)
    .map((day) => ({
      date: day.date || day.time || null,
      summary: day.summary || day.condition || 'Forecast unavailable',
      high: typeof day.high === 'number' ? day.high : day.temperatureMax,
      low: typeof day.low === 'number' ? day.low : day.temperatureMin,
      precipitation: day.precipitation || day.precip || {},
    }));
};

const ComparisonView = ({ weatherData, isLoading, error }) => {
  const sources = useMemo(() => {
    if (!Array.isArray(weatherData)) {
      return [];
    }

    return weatherData.map((entry, index) => ({
      id: entry?.source || `source-${index}`,
      displayName: entry?.displayName || entry?.source || 'Unknown source',
      isError: Boolean(entry?.isError),
      errorMessage: entry?.message || entry?.error,
      location: entry?.location,
      days: normalizeDailyForecast(entry),
    }));
  }, [weatherData]);

  const locationName = useMemo(() => {
    const withLocation = sources.find((source) => source.location?.name);
    return withLocation?.location?.name || null;
  }, [sources]);

  if (isLoading) {
    return <SkeletonLoader type="comparison" />;
  }

  if (error) {
    return (
      <div className="card error-card" role="alert">
        <h2>Unable to load forecasts</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (sources.length === 0) {
    return (
      <div className="card empty-card" role="status">
        <h2>No forecast data</h2>
        <p>Enter a ZIP code to see the latest daily predictions.</p>
      </div>
    );
  }

  return (
    <section className="card comparison-view" aria-label="Daily forecast comparison">
      <header className="comparison-header">
        <div>
          <h2>Daily forecast comparison</h2>
          {locationName && <p className="comparison-location">{locationName}</p>}
        </div>
      </header>

      <div className="comparison-grid">
        {sources.map((source) => (
          <article key={source.id} className="comparison-source" aria-label={`Forecast from ${source.displayName}`}>
            <header className="source-header">
              <h3>{source.displayName}</h3>
              {source.isError && (
                <p className="source-error" role="alert">
                  {source.errorMessage || 'This provider is unavailable right now.'}
                </p>
              )}
            </header>

            {!source.isError && source.days.length === 0 && (
              <p className="source-empty" role="status">
                Daily predictions are not available for this provider.
              </p>
            )}

            {!source.isError && source.days.length > 0 && (
              <ul className="daily-list">
                {source.days.map((day, index) => (
                  <li key={day.date || index} className="daily-item">
                    <div className="daily-date">{day.date ? new Date(day.date).toLocaleDateString() : 'Day'}</div>
                    <div className="daily-summary">{day.summary}</div>
                    <div className="daily-temperatures">
                      <span className="temp-high" aria-label="High temperature">
                        ↑ {formatTemperature(day.high)}
                      </span>
                      <span className="temp-low" aria-label="Low temperature">
                        ↓ {formatTemperature(day.low)}
                      </span>
                    </div>
                    <div className="daily-precipitation">
                      <span aria-label="Precipitation probability">
                        Chance: {formatPrecipProbability(day.precipitation?.probability)}
                      </span>
                      <span aria-label="Precipitation amount">
                        Total: {formatPrecipAmount(day.precipitation?.amount)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </section>
  );
};

export default ComparisonView;
