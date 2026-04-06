import React, { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet.heat';
import { MapPin } from 'lucide-react';
import { captureHeatmapImage } from '../utils/heatmapCapture';

export default function HeatmapGenerator({ geoPoints, onCaptured }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!geoPoints || geoPoints.length === 0 || !mapContainerRef.current) return;

    // Destroy existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false,
    });

    // Dark map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 18,
    }).addTo(map);

    // Fit bounds
    const bounds = L.latLngBounds(geoPoints.map((p) => [p.lat, p.lng]));
    map.fitBounds(bounds.pad(0.2));

    // Normalize intensities
    const maxIntensity = Math.max(...geoPoints.map((p) => p.intensity));
    const heatData = geoPoints.map((p) => [
      p.lat,
      p.lng,
      (p.intensity / maxIntensity) * 0.8 + 0.2,
    ]);

    // Add heatmap layer
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

    // Add subtle markers
    geoPoints.forEach((p) => {
      L.circleMarker([p.lat, p.lng], {
        radius: 3,
        color: '#ffffff',
        fillColor: '#ffffff',
        fillOpacity: 0.6,
        weight: 1,
      }).addTo(map).bindPopup(
        `<b>${p.label || 'Location'}</b><br/>Spend intensity: ${p.intensity}`
      );
    });

    mapInstanceRef.current = map;

    // Auto-capture after tiles load
    map.whenReady(() => {
      setTimeout(async () => {
        try {
          const img = await captureHeatmapImage(mapContainerRef.current);
          onCaptured(img);
        } catch (e) {
          console.warn('Heatmap capture failed, user can retry:', e);
        }
      }, 2000);
    });

    return () => {
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
      <div className="map-container" ref={mapContainerRef} />
      <div style={{ marginTop: 'var(--space-sm)', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="btn btn-secondary" onClick={handleRecapture} style={{ fontSize: '0.75rem' }}>
          Recapture Snapshot
        </button>
      </div>
    </div>
  );
}
