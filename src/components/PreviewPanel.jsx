import React from 'react';
import { Eye } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
} from 'recharts';

const CHART_COLORS = ['#E04A2F', '#5A7DFF', '#F5A623', '#34C759', '#FF6B8A', '#8B5CF6', '#06B6D4', '#EC4899'];

export default function PreviewPanel({ strategy, mediaData, chartData, brand, heatmapImage, geoPoints }) {
  return (
    <div className="preview-container">
      <div className="preview-header">
        <h3><Eye size={12} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Live Preview</h3>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {countSlides(mediaData, heatmapImage, chartData)} slides
        </span>
      </div>

      <div className="preview-body">
        {/* Title Slide Preview */}
        <div className="preview-slide" style={{
          background: brand ? brand.colors[1] || 'var(--bg-elevated)' : 'var(--bg-elevated)',
        }}>
          <span className="slide-number">#1</span>
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '45%',
            background: brand ? brand.colors[0] + '22' : 'var(--accent-soft)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '0 var(--space-lg)',
          }}>
            <h4 style={{ fontSize: '0.95rem', color: 'white' }}>
              {strategy.objective || 'Campaign Media Plan'}
            </h4>
            <p style={{ textAlign: 'left', marginTop: 4 }}>
              {strategy.campaignType || 'Type'} | {strategy.flightDates || 'Dates'} | {strategy.budget || 'Budget'}
            </p>
          </div>
        </div>

        {/* Strategy Slide Preview */}
        {strategy.objective && (
          <div className="preview-slide">
            <span className="slide-number">#2</span>
            <h4>Strategic Overview</h4>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 6,
              width: '100%',
              padding: '0 var(--space-md)',
              marginTop: 8,
            }}>
              {['Objective', 'Audience', 'KPIs', 'Budget'].map((label) => (
                <div key={label} style={{
                  background: 'var(--bg-card)',
                  borderRadius: 4,
                  padding: '4px 8px',
                }}>
                  <span style={{
                    fontSize: '0.5rem',
                    color: 'var(--accent)',
                    fontFamily: 'var(--font-mono)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                  }}>{label}</span>
                  <p style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', marginTop: 1 }}>
                    {strategy[label.toLowerCase()] || '—'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chart Preview */}
        {chartData && chartData.length > 0 && (
          <div className="preview-slide" style={{ padding: '8px' }}>
            <span className="slide-number">#3</span>
            <h4 style={{ marginBottom: 4, fontSize: '0.75rem' }}>Budget Allocation</h4>
            <div style={{ width: '100%', height: '70%', display: 'flex', alignItems: 'center' }}>
              <ResponsiveContainer width="55%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius="45%"
                    outerRadius="80%"
                    dataKey="value"
                    stroke="none"
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 6,
                      fontSize: '0.65rem',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ flex: 1, paddingLeft: 8 }}>
                {chartData.slice(0, 5).map((d, i) => (
                  <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 3 }}>
                    <div style={{
                      width: 6, height: 6, borderRadius: 2,
                      background: CHART_COLORS[i % CHART_COLORS.length],
                      flexShrink: 0,
                    }} />
                    <span style={{ fontSize: '0.5rem', color: 'var(--text-secondary)' }}>
                      {d.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Heatmap Preview */}
        {heatmapImage && (
          <div className="preview-slide" style={{ padding: 0, overflow: 'hidden' }}>
            <span className="slide-number" style={{ zIndex: 2 }}>#4</span>
            <img
              src={heatmapImage}
              alt="Geospatial heatmap"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Data Table Preview */}
        {mediaData && (
          <div className="preview-slide" style={{ justifyContent: 'flex-start', padding: '10px 12px', alignItems: 'stretch' }}>
            <span className="slide-number">#{getDataSlideNum(heatmapImage, chartData)}</span>
            <h4 style={{ fontSize: '0.7rem', marginBottom: 6 }}>Media Plan Data</h4>
            <div className="data-summary" style={{ flex: 1, overflow: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    {mediaData.headers.slice(0, 5).map((h) => (
                      <th key={h}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mediaData.rows.slice(0, 4).map((row, i) => (
                    <tr key={i}>
                      {mediaData.headers.slice(0, 5).map((h) => (
                        <td key={h}>{String(row[h] ?? '').slice(0, 20)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {mediaData.rows.length > 4 && (
                <p style={{ textAlign: 'center', padding: '4px 0', color: 'var(--text-muted)', fontSize: '0.6rem' }}>
                  +{mediaData.rows.length - 4} more rows
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function countSlides(mediaData, heatmapImage, chartData) {
  let count = 2; // title + strategy
  if (chartData?.length) count++;
  if (heatmapImage) count++;
  if (mediaData) count += Math.ceil((mediaData.rows?.length || 0) / 12) || 1;
  count++; // closing
  return count;
}

function getDataSlideNum(heatmapImage, chartData) {
  let n = 2;
  if (chartData?.length) n++;
  if (heatmapImage) n++;
  return n + 1;
}
