import React from 'react';
import { Target } from 'lucide-react';

const CAMPAIGN_TYPES = ['Digital Only', 'BTL', 'ATL', '360-Degree'];

export default function StrategyForm({ data, onChange, onNext }) {
  const update = (field) => (e) => onChange({ ...data, [field]: e.target.value });
  const isValid = data.objective && data.audience && data.kpis;

  return (
    <div className="card animate-in">
      <div className="card-header">
        <div className="card-icon"><Target size={14} /></div>
        <h2>Campaign Strategy</h2>
        <span className="step-badge">STEP 01</span>
      </div>
      <div className="form-grid">
        <div className="form-group full-width">
          <label className="form-label">Campaign Objective</label>
          <input className="form-input" type="text" placeholder="e.g. Drive 2M app installs in Q4" value={data.objective || ''} onChange={update('objective')} />
        </div>
        <div className="form-group full-width">
          <label className="form-label">Target Audience</label>
          <textarea className="form-textarea" placeholder="e.g. Urban millennials, 22-35, SEC A/B, metro cities" value={data.audience || ''} onChange={update('audience')} />
        </div>
        <div className="form-group full-width">
          <label className="form-label">Core KPIs</label>
          <input className="form-input" type="text" placeholder="e.g. CPM, CTR, CPI, Reach, Frequency" value={data.kpis || ''} onChange={update('kpis')} />
        </div>
        <div className="form-group">
          <label className="form-label">Flight Dates</label>
          <input className="form-input" type="text" placeholder="e.g. Oct 1 – Dec 31, 2025" value={data.flightDates || ''} onChange={update('flightDates')} />
        </div>
        <div className="form-group">
          <label className="form-label">Total Budget</label>
          <input className="form-input" type="text" placeholder="e.g. ₹2.5 Cr" value={data.budget || ''} onChange={update('budget')} />
        </div>
        <div className="form-group full-width">
          <label className="form-label">Campaign Type</label>
          <select className="form-select" value={data.campaignType || ''} onChange={update('campaignType')}>
            <option value="">Select type...</option>
            {CAMPAIGN_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="nav-buttons">
        <button className="btn btn-primary btn-block" disabled={!isValid} onClick={onNext}>
          Continue to File Upload →
        </button>
      </div>
    </div>
  );
}
