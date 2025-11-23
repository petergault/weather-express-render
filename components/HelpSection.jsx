const HelpSection = () => (
  <section className="card help-section" aria-labelledby="help-section-heading">
    <h2 id="help-section-heading">Need a hand?</h2>
    <ul>
      <li>
        <strong>Daily forecast:</strong> We compare up to three trusted weather providers to help you
        plan with confidence.
      </li>
      <li>
        <strong>Color cues:</strong> Reds indicate hotter highs while blues highlight cooler lows.
      </li>
      <li>
        <strong>Rain focus:</strong> Watch for higher percentages to spot likely precipitation.
      </li>
    </ul>
    <p>
      If something does not look right, use the refresh button or try another ZIP code to request a
      new forecast from each provider.
    </p>
  </section>
);

HelpSection.displayName = 'HelpSection';
window.HelpSection = HelpSection;
