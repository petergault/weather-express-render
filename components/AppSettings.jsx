const AppSettings = ({ zipCode }) => (
  <section className="card app-settings" aria-labelledby="app-settings-heading">
    <h2 id="app-settings-heading">App preferences</h2>
    <p>
      Super Sky automatically refreshes your forecast throughout the day. Enter a ZIP code to
      personalise alerts and make sure notifications focus on your area.
    </p>

    <div className="settings-item">
      <h3>Notification preview</h3>
      {zipCode ? (
        <p>
          Alerts will be tailored for <strong>{zipCode}</strong>. We will highlight rain and severe
          weather so you can plan ahead.
        </p>
      ) : (
        <p>Choose a ZIP code above to preview how alerts will look for your location.</p>
      )}
    </div>

    <div className="settings-item">
      <h3>Data refresh</h3>
      <p>
        Forecasts automatically refresh every hour. Use the refresh button to fetch the latest
        comparison instantly whenever you need it.
      </p>
    </div>
  </section>
);

AppSettings.displayName = 'AppSettings';
window.AppSettings = AppSettings;
