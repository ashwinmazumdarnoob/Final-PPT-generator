import { toPng } from 'html-to-image';

export async function captureHeatmapImage(mapElement) {
  if (!mapElement) throw new Error('Map element not found');
  await new Promise((r) => setTimeout(r, 1500));
  return toPng(mapElement, {
    quality: 0.95,
    pixelRatio: 2,
    backgroundColor: '#0a0a0f',
    filter: (node) => {
      if (node.classList && (node.classList.contains('leaflet-control-zoom') || node.classList.contains('leaflet-control-attribution'))) return false;
      return true;
    },
  });
}

export function dataUrlToBase64(dataUrl) { return dataUrl.split(',')[1]; }
