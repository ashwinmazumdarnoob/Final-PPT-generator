import React, { useState } from 'react';
import { Download, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { generatePPT } from '../utils/generatePPT';

export default function GeneratePanel({
  strategy, mediaData, brand, heatmapImage, chartData, onBack,
}) {
  const [generating, setGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [fileName, setFileName] = useState('');

  const checks = [
    { label: 'Strategy questionnaire', ok: !!strategy.objective },
    { label: 'Media plan uploaded & parsed', ok: !!mediaData },
    { label: 'Brand colors extracted', ok: !!brand },
    { label: 'Heatmap captured', ok: !!heatmapImage },
    { label: 'Budget charts ready', ok: chartData && chartData.length > 0 },
  ];

  const canGenerate = !!strategy.objective && !!mediaData;

  const handleGenerate = async () => {
    setGenerating(true);
    setDone(false);
    try {
      const useBrand = brand || {
        colors: ['#E04A2F', '#1A1A2E', '#5A7DFF', '#34C759', '#F5A623'],
        fonts: ['Calibri', 'Courier New'],
      };
      const name = await generatePPT({
        strategy,
        mediaData,
        brand: useBrand,
        heatmapImage,
        chartData,
      });
      setFileName(name);
      setDone(true);
    } catch (err) {
      console.error('PPT generation failed:', err);
      alert('Error generating presentation: ' + err.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="card animate-in">
      <div className="card-header">
        <div className="card-icon"><Download size={14} /></div>
        <h2>Export Presentation</h2>
        <span className="step-badge">STEP 04</span>
      </div>

      <div className="generate-section" style={{ background: 'transparent', border: 'none', padding: 0 }}>
        <div className="checklist">
          {checks.map((c) => (
            <div key={c.label} className={`checklist-item ${c.ok ? 'done' : 'pending'}`}>
              {c.ok
                ? <CheckCircle2 size={16} />
                : <Circle size={16} />
              }
              <span>{c.label}</span>
            </div>
          ))}
        </div>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <CheckCircle2 size={40} style={{ color: 'var(--success)', marginBottom: 12 }} />
            <h3 style={{ color: 'var(--success)', marginBottom: 4 }}>Deck Generated!</h3>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {fileName}
            </p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 8 }}>
              File has been downloaded to your device.
            </p>
            <button
              className="btn btn-primary btn-lg btn-block"
              style={{ marginTop: 'var(--space-lg)' }}
              onClick={() => { setDone(false); handleGenerate(); }}
            >
              Regenerate
            </button>
          </div>
        ) : (
          <button
            className="btn btn-primary btn-lg btn-block"
            disabled={!canGenerate || generating}
            onClick={handleGenerate}
          >
            {generating ? (
              <>
                <Loader2 size={18} className="loading-pulse" />
                Building your deck...
              </>
            ) : (
              <>
                <Download size={18} />
                Generate &amp; Download .pptx
              </>
            )}
          </button>
        )}
      </div>

      <div className="nav-buttons">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back to Preview
        </button>
      </div>
    </div>
  );
}
