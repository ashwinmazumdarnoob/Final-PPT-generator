import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { captureHeatmapImage } from '../utils/heatmapCapture';

export default function HeatmapGenerator({ geoPoints, onCaptured }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!geoPoints || geoPoints.length === 0 || !mapContainerRef.current) return;

    let cancelled = false;

    async function initMap() {
      setLoading(true);
      setError(null);

      try {
        // Lazy-load leaflet and leaflet.heat to prevent build-time crashes
        const L = (await import('leaflet')).default;
        await import('leaflet.heat');

        if (cancelled) return;

        // Destroy existing map
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        const map = L.map(mapContainerRef.current, {
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
          maxZoom: 18,
        }).addTo(map);

        const bounds = L.latLngBounds(geoPoints.map((p) => [p.lat, p.lng]));
        map.fitBounds(bounds.pad(0.2));

        const maxIntensity = Math.max(...geoPoints.map((p) => p.intensity), 1);
        const heatData = geoPoints.map((p) => [
          p.lat,
          p.lng,
          (p.intensity / maxIntensity) * 0.8 + 0.2,
        ]);

        L.heatLayer(heatData, {
          radius: 30,
          blur: 25,
          maxZoom: 15,
          gradient: {
            0.2: '#2196F3',
            0.4: '#00BCD4',
            0.6: '#FFEB3B',
            0.8: '#FF9800',
            1.0: '#F44336',
          },
        }).addTo(map);

        geoPoints.forEach((p) => {
          L.circleMarker([p.lat, p.lng], {
            radius: 3,
            color: '#ffffff',
            fillColor: '#ffffff',
            fillOpacity: 0.6,
            weight: 1,
          }).addTo(map);
        });

        mapInstanceRef.current = map;
        setLoading(false);

        // Auto-capture after tiles load
        setTimeout(async () => {
          if (cancelled || !mapContainerRef.current) return;
          try {
            const img = await captureHeatmapImage(mapContainerRef.current);
            if (!cancelled) onCaptured(img);
          } catch (e) {
            console.warn('Heatmap auto-capture failed:', e);
          }
        }, 2500);
      } catch (err) {
        if (!cancelled) {
          console.error('Map init failed:', err);
          setError('Failed to load map. Please try again.');
          setLoading(false);
        }
      }
    }

    initMap();

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [geoPoints]);

  const handleRecapture = useCallback(async () => {
    if (!mapContainerRef.current) return;
    try {
      const img = await captureHeatmapImage(mapContainerRef.current);
      onCaptured(img);
    } catch (e) {
      console.error('Recapture failed:', e);
    }
  }, [onCaptured]);

  if (!geoPoints || geoPoints.length === 0) return null;

  return (
    <div className="card animate-in">
      <div className="card-header">
        <div className="card-icon"><MapPin size={14} /></div>
        <h2>Geospatial Heatmap</h2>
        <span className="step-badge">{geoPoints.length} POINTS</span>
      </div>
      <div className="map-container" ref={mapContainerRef}>
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 8 }}>
            <Loader2 size={18} className="loading-pulse" style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Loading map...</span>
          </div>
        )}
        {error && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--accent)' }}>{error}</span>
          </div>
        )}
      </div>
      {!loading && !error && (
        <div style={{ marginTop: 'var(--space-sm)', display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn btn-secondary" onClick={handleRecapture} style={{ fontSize: '0.75rem' }}>
            Recapture Snapshot
          </button>
        </div>
      )}
    </div>
  );
}
