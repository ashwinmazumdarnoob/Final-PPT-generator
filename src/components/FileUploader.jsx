import React, { useRef, useState, useCallback } from 'react';
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
  const [mediaDragOver, setMediaDragOver] = useState(false);
  const [brandDragOver, setBrandDragOver] = useState(false);

  const processMediaFile = useCallback(async (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['csv', 'xlsx', 'xls'].includes(ext)) {
      setMediaError('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
      return;
    }
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
  }, [onMediaParsed]);

  const processBrandFile = useCallback(async (file) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setBrandError('Please upload a PDF file');
      return;
    }
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
  }, [onBrandParsed]);

  const handleMediaInput = (e) => processMediaFile(e.target.files?.[0]);
  const handleBrandInput = (e) => processBrandFile(e.target.files?.[0]);

  const clearMedia = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setMediaFile(null);
    onMediaParsed(null);
    setMediaError('');
    if (mediaRef.current) mediaRef.current.value = '';
  };

  const clearBrand = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setBrandFile(null);
    onBrandParsed(null);
    setBrandError('');
    if (brandRef.current) brandRef.current.value = '';
  };

  const makeDragHandlers = (setDragOver, processFile) => ({
    onDragOver: (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); },
    onDragEnter: (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(true); },
    onDragLeave: (e) => { e.preventDefault(); e.stopPropagation(); setDragOver(false); },
    onDrop: (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
  });

  const mediaDragHandlers = makeDragHandlers(setMediaDragOver, processMediaFile);
  const brandDragHandlers = makeDragHandlers(setBrandDragOver, processBrandFile);

  return (
    <div className="card animate-in">
      <div className="card-header">
        <div className="card-icon"><Upload size={14} /></div>
        <h2>Upload Files</h2>
        <span className="step-badge">STEP 02</span>
      </div>

      {/* Media Plan Upload */}
      <div style={{ marginBottom: 'var(--space-lg)' }}>
        <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
          Media Plan (CSV / Excel)
        </label>
        <div
          className={`upload-zone ${mediaData ? 'has-file' : ''} ${mediaDragOver ? 'drag-over' : ''}`}
          onClick={() => !mediaData && !mediaLoading && mediaRef.current?.click()}
          {...(!mediaData ? mediaDragHandlers : {})}
        >
          <input ref={mediaRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleMediaInput} />
          {mediaLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Loader2 size={20} className="loading-pulse" style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Parsing file...</span>
            </div>
          ) : mediaData ? (
            <div className="file-info">
              <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
              <span className="file-name">{mediaFile?.name || 'media-plan'}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                {mediaData.rows.length} rows · {mediaData.headers.length} cols
              </span>
              <button className="file-remove" onClick={clearMedia} title="Remove file">
                <X size={14} />
              </button>
            </div>
          ) : (
            <>
              <FileSpreadsheet size={28} className="upload-icon" />
              <p className="upload-label"><strong>Click or drag &amp; drop</strong> your media plan</p>
              <p className="upload-sublabel">CSV, XLSX, or XLS</p>
            </>
          )}
        </div>
        {mediaError && <p style={{ color: 'var(--accent)', fontSize: '0.75rem', marginTop: 4 }}>{mediaError}</p>}
      </div>

      {/* Brand PDF Upload */}
      <div>
        <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>
          Brand Guidelines (PDF) —{' '}
          <span style={{ color: 'var(--text-muted)', fontWeight: 400, textTransform: 'none' }}>Optional</span>
        </label>
        <div
          className={`upload-zone ${brandData ? 'has-file' : ''} ${brandDragOver ? 'drag-over' : ''}`}
          onClick={() => !brandData && !brandLoading && brandRef.current?.click()}
          {...(!brandData ? brandDragHandlers : {})}
        >
          <input ref={brandRef} type="file" accept=".pdf" onChange={handleBrandInput} />
          {brandLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <Loader2 size={20} className="loading-pulse" style={{ color: 'var(--accent)' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Extracting brand data...</span>
            </div>
          ) : brandData ? (
            <div>
              <div className="file-info" style={{ marginBottom: 8 }}>
                <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
                <span className="file-name">{brandFile?.name || 'brand-guidelines'}</span>
                <button className="file-remove" onClick={clearBrand} title="Remove file">
                  <X size={14} />
                </button>
              </div>
              <div className="brand-colors">
                {brandData.colors.map((hex, i) => (
                  <div key={hex + i} className="color-swatch" data-hex={hex} style={{ background: hex }} />
                ))}
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
              <p className="upload-label"><strong>Click or drag &amp; drop</strong> brand guidelines</p>
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
