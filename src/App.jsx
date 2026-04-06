import React, { useState, useMemo, Component } from 'react';
import { Layers, AlertTriangle } from 'lucide-react';
import Stepper from './components/Stepper';
import StrategyForm from './components/StrategyForm';
import FileUploader from './components/FileUploader';
import HeatmapGenerator from './components/HeatmapGenerator';
import PreviewPanel from './components/PreviewPanel';
import GeneratePanel from './components/GeneratePanel';
import { extractGeoData, aggregateByField, findGroupColumn } from './utils/parseMedia';

// Error boundary to prevent blank screen crashes
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: 24, background: 'var(--bg-card)', borderRadius: 12,
          border: '1px solid var(--border-subtle)', textAlign: 'center',
        }}>
          <AlertTriangle size={32} style={{ color: 'var(--warning)', marginBottom: 8 }} />
          <h3 style={{ fontSize: '0.9rem', marginBottom: 4 }}>Something went wrong</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 16 }}>
            {this.state.error?.message || 'An unexpected error occurred.'}
          </p>
          <button
            className="btn btn-secondary"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  const [step, setStep] = useState('strategy');
  const [strategy, setStrategy] = useState({
    objective: '', audience: '', kpis: '', flightDates: '', budget: '', campaignType: '',
  });
  const [mediaData, setMediaData] = useState(null);
  const [brandData, setBrandData] = useState(null);
  const [heatmapImage, setHeatmapImage] = useState(null);

  const geoPoints = useMemo(() => {
    if (!mediaData?.headers || !mediaData?.rows) return null;
    try {
      return extractGeoData(mediaData.headers, mediaData.rows);
    } catch { return null; }
  }, [mediaData]);

  const chartData = useMemo(() => {
    if (!mediaData?.headers || !mediaData?.rows) return null;
    try {
      const groupCol = findGroupColumn(mediaData.headers);
      return aggregateByField(mediaData.rows, groupCol);
    } catch { return null; }
  }, [mediaData]);

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
      <header className="app-header">
        <div className="app-logo">
          <div className="logo-icon"><Layers size={16} /></div>
          DeckForge
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)', fontSize: '0.65rem',
          color: 'var(--text-muted)', letterSpacing: '0.5px',
        }}>
          MEDIA PLAN → PPT
        </div>
      </header>

      <div style={{ maxWidth: 600, margin: '0 auto', width: '100%', padding: '0 var(--space-xl)' }}>
        <Stepper currentStep={step} completedSteps={completedSteps} onStepClick={goTo} />
      </div>

      <div className="app-main">
        <div className="panel-left">
          <ErrorBoundary>
            {step === 'strategy' && (
              <StrategyForm data={strategy} onChange={setStrategy} onNext={() => goTo('upload')} />
            )}

            {step === 'upload' && (
              <FileUploader
                mediaData={mediaData} onMediaParsed={setMediaData}
                brandData={brandData} onBrandParsed={setBrandData}
                onNext={() => goTo('preview')} onBack={() => goTo('strategy')}
              />
            )}

            {step === 'preview' && (
              <>
                {geoPoints && (
                  <HeatmapGenerator geoPoints={geoPoints} onCaptured={setHeatmapImage} />
                )}
                {mediaData && (
                  <div className="card animate-in">
                    <div className="card-header">
                      <h2 style={{ fontSize: '0.85rem' }}>Data Summary</h2>
                      <span className="step-badge">{mediaData.rows.length} ROWS</span>
                    </div>
                    <div className="data-summary">
                      <table>
                        <thead>
                          <tr>
                            {mediaData.headers.slice(0, 6).map((h, i) => <th key={i}>{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {mediaData.rows.slice(0, 5).map((row, ri) => (
                            <tr key={ri}>
                              {mediaData.headers.slice(0, 6).map((h, ci) => (
                                <td key={ci}>{String(row[h] ?? '').slice(0, 25)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="nav-buttons">
                      <button className="btn btn-secondary" onClick={() => goTo('upload')}>← Back</button>
                      <button className="btn btn-primary" onClick={() => goTo('generate')}>Ready to Export →</button>
                    </div>
                  </div>
                )}
              </>
            )}

            {step === 'generate' && (
              <GeneratePanel
                strategy={strategy} mediaData={mediaData} brand={brandData}
                heatmapImage={heatmapImage} chartData={chartData}
                onBack={() => goTo('preview')}
              />
            )}
          </ErrorBoundary>
        </div>

        <div className="panel-right">
          <ErrorBoundary>
            <PreviewPanel
              strategy={strategy} mediaData={mediaData} chartData={chartData}
              brand={brandData} heatmapImage={heatmapImage} geoPoints={geoPoints}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}
