import React, { useState, useMemo } from 'react';
import { Layers } from 'lucide-react';
import Stepper from './components/Stepper';
import StrategyForm from './components/StrategyForm';
import FileUploader from './components/FileUploader';
import HeatmapGenerator from './components/HeatmapGenerator';
import PreviewPanel from './components/PreviewPanel';
import GeneratePanel from './components/GeneratePanel';
import { extractGeoData, aggregateByField, findGroupColumn } from './utils/parseMedia';

export default function App() {
  const [step, setStep] = useState('strategy');
  const [strategy, setStrategy] = useState({
    objective: '',
    audience: '',
    kpis: '',
    flightDates: '',
    budget: '',
    campaignType: '',
  });
  const [mediaData, setMediaData] = useState(null);
  const [brandData, setBrandData] = useState(null);
  const [heatmapImage, setHeatmapImage] = useState(null);

  // Derived data
  const geoPoints = useMemo(() => {
    if (!mediaData) return null;
    return extractGeoData(mediaData.headers, mediaData.rows);
  }, [mediaData]);

  const chartData = useMemo(() => {
    if (!mediaData) return null;
    const groupCol = findGroupColumn(mediaData.headers);
    return aggregateByField(mediaData.rows, groupCol);
  }, [mediaData]);

  // Track completed steps
  const completedSteps = useMemo(() => {
    const done = [];
    if (strategy.objective && strategy.audience && strategy.kpis) done.push('strategy');
    if (mediaData) done.push('upload');
    if (mediaData && strategy.objective) done.push('preview');
    return done;
  }, [strategy, mediaData]);

  const goTo = (s) => setStep(s);

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="app-logo">
          <div className="logo-icon">
            <Layers size={16} />
          </div>
          DeckForge
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.65rem',
          color: 'var(--text-muted)',
          letterSpacing: '0.5px',
        }}>
          MEDIA PLAN → PPT
        </div>
      </header>

      {/* Stepper */}
      <div style={{ maxWidth: 600, margin: '0 auto', width: '100%', padding: '0 var(--space-xl)' }}>
        <Stepper currentStep={step} completedSteps={completedSteps} onStepClick={goTo} />
      </div>

      {/* Main Content */}
      <div className="app-main">
        {/* Left panel — forms/actions */}
        <div className="panel-left">
          {step === 'strategy' && (
            <StrategyForm
              data={strategy}
              onChange={setStrategy}
              onNext={() => goTo('upload')}
            />
          )}

          {step === 'upload' && (
            <FileUploader
              mediaData={mediaData}
              onMediaParsed={setMediaData}
              brandData={brandData}
              onBrandParsed={setBrandData}
              onNext={() => goTo('preview')}
              onBack={() => goTo('strategy')}
            />
          )}

          {step === 'preview' && (
            <>
              {geoPoints && (
                <HeatmapGenerator
                  geoPoints={geoPoints}
                  onCaptured={setHeatmapImage}
                />
              )}

              {/* Data Summary Card */}
              {mediaData && (
                <div className="card animate-in">
                  <div className="card-header">
                    <h2 style={{ fontSize: '0.85rem' }}>Data Summary</h2>
                    <span className="step-badge">
                      {mediaData.rows.length} ROWS
                    </span>
                  </div>
                  <div className="data-summary">
                    <table>
                      <thead>
                        <tr>
                          {mediaData.headers.slice(0, 6).map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {mediaData.rows.slice(0, 5).map((row, i) => (
                          <tr key={i}>
                            {mediaData.headers.slice(0, 6).map((h) => (
                              <td key={h}>{String(row[h] ?? '').slice(0, 25)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="nav-buttons">
                    <button className="btn btn-secondary" onClick={() => goTo('upload')}>
                      ← Back
                    </button>
                    <button className="btn btn-primary" onClick={() => goTo('generate')}>
                      Ready to Export →
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {step === 'generate' && (
            <GeneratePanel
              strategy={strategy}
              mediaData={mediaData}
              brand={brandData}
              heatmapImage={heatmapImage}
              chartData={chartData}
              onBack={() => goTo('preview')}
            />
          )}
        </div>

        {/* Right panel — live preview */}
        <div className="panel-right">
          <PreviewPanel
            strategy={strategy}
            mediaData={mediaData}
            chartData={chartData}
            brand={brandData}
            heatmapImage={heatmapImage}
            geoPoints={geoPoints}
          />
        </div>
      </div>
    </div>
  );
}
