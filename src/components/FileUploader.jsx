import React, { useRef, useState } from 'react';
import { Upload, FileSpreadsheet, FileText, X, CheckCircle2, Loader2 } from 'lucide-react';
import { parseMediaFile } from '../utils/parseMedia';
import { parseBrandPdf } from '../utils/parseBrandPdf';

export default function FileUploader({ mediaData, onMediaParsed, brandData, onBrandParsed, onNext, onBack }) {
  const mediaRef = useRef(null);
  const brandRef = useRef(null);
  const [mediaFile, setMediaFile] = useState(null);
  const [brandFile, setBrandFile] = useState(null);
  const [mediaError, setMediaError] = useState('');
  const [brandError, setBrandError] = useState('');
  const [mediaLoading, setMediaLoading] = useState(false);
  const [brandLoading, setBrandLoading] = useState(false);

  const handleMedia = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMediaError('');
    setMediaLoading(true);
    try {
      const result = await parseMediaFile(file);
      setMediaFile(file);
      onMediaParsed(result);
    } catch (err) {
      setMediaError(err.message);
    } finally {
      setMediaLoading(false);
    }
  };

  const handleBrand = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBrandError('');
    setBrandLoading(true);
    try {
      const result = await parseBrandPdf(file);
      setBrandFile(file);
      onBrandParsed(result);
    } catch (err) {
      setBrandError(err.message);
    } finally {
      setBrandLoading(false);
    }
  };

  const clearMedia = () => { setMediaFile(null); onMediaParsed(null); if (mediaRef.current) mediaRef.current.value = ''; };
  const clearBrand = () => { setBrandFile(null); onBrandParsed(null); if (brandRef.current) brandRef.current.value = ''; };

  return (
    <div className="card animate-in">
      <div className="card-header">
        <div className="card-icon"><Upload size={14} /></div>
        <h2>Upload Files</h2>
        <span className="step-badge">STEP 02</span>
      </div>

      {/* Media Plan Upload */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Media Plan (CSV / Excel)</label>
        <div className={`upload-zone ${mediaData ? 'has-file' : ''}`} onClick={() => !mediaData && mediaRef.current?.click()}>
          <input ref={mediaRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleMedia} />
          {mediaLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Loader2 size={20} className="loading-pulse" style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Parsing file...</span>
            </div>
          ) : mediaData ? (
            <div className="file-info">
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
              <span className="file-name">{mediaFile?.name}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{mediaData.rows.length} rows · {mediaData.headers.length} columns</span>
              <button className="file-remove" onClick={(e) => { e.stopPropagation(); clearMedia(); }}><X size={14} /></button>
            </div>
          ) : (
            <>
              <FileSpreadsheet size={28} className="upload-icon" />
              <p className="upload-label"><strong>Click to upload</strong> your media plan</p>
              <p className="upload-sublabel">CSV, XLSX, or XLS</p>
            </>
          )}
        </div>
        {mediaError && <p style={{ color: 'var(--accent)', fontSize: '0.75rem', marginTop: 4 }}>{mediaError}</p>}
      </div>

      {/* Brand PDF Upload */}
      <div>
        <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Brand Guidelines (PDF) — <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>Optional</span></label>
        <div className={`upload-zone ${brandData ? 'has-file' : ''}`} onClick={() => !brandData && brandRef.current?.click()}>
          <input ref={brandRef} type="file" accept=".pdf" onChange={handleBrand} />
          {brandLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Loader2 size={20} className="loading-pulse" style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Extracting brand data...</span>
            </div>
          ) : brandData ? (
            <div>
              <div className="file-info" style={{ marginBottom: 8 }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span className="file-name">{brandFile?.name}</span>
                <button className="file-remove" onClick={(e) => { e.stopPropagation(); clearBrand(); }}><X size={14} /></button>
              </div>
              <div className="brand-colors">
                {brandData.colors.map((hex) => <div key={hex} className="color-swatch" data-hex={hex} style={{ background: hex }} />)}
              </div>
              {brandData.fonts.length > 0 && (
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>
                  Fonts: {brandData.fonts.join(', ')}
                </p>
              )}
            </div>
          ) : (
            <>
              <FileText size={28} className="upload-icon" />
              <p className="upload-label"><strong>Click to upload</strong> brand guidelines</p>
              <p className="upload-sublabel">PDF — colors &amp; fonts will be extracted</p>
            </>
          )}
        </div>
        {brandError && <p style={{ color: 'var(--accent)', fontSize: '0.75rem', marginTop: 4 }}>{brandError}</p>}
      </div>

      <div className="nav-buttons">
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn btn-primary" disabled={!mediaData} onClick={onNext}>Continue to Preview →</button>
      </div>
    </div>
  );
}
