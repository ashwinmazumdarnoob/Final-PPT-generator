let pdfjsLib = null;

async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  return pdfjsLib;
}

function rgbToHex(r, g, b) { return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join(''); }

function colorDistance(c1, c2) { return Math.sqrt((c1[0]-c2[0])**2 + (c1[1]-c2[1])**2 + (c1[2]-c2[2])**2); }

function isNeutral(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  if (max < 30 || min > 225) return true;
  if (max - min < 25 && max > 60 && min < 200) return true;
  return false;
}

function clusterColors(samples, k = 6) {
  if (samples.length === 0) return [];
  let centroids = [];
  const step = Math.max(1, Math.floor(samples.length / k));
  for (let i = 0; i < k && i * step < samples.length; i++) centroids.push([...samples[i * step]]);

  for (let iter = 0; iter < 10; iter++) {
    const clusters = centroids.map(() => []);
    for (const s of samples) {
      let minDist = Infinity, minIdx = 0;
      centroids.forEach((c, i) => { const d = colorDistance(s, c); if (d < minDist) { minDist = d; minIdx = i; } });
      clusters[minIdx].push(s);
    }
    centroids = clusters.map((cl, i) => {
      if (cl.length === 0) return centroids[i];
      return [Math.round(cl.reduce((a, c) => a + c[0], 0) / cl.length), Math.round(cl.reduce((a, c) => a + c[1], 0) / cl.length), Math.round(cl.reduce((a, c) => a + c[2], 0) / cl.length)];
    });
  }

  const counts = centroids.map(() => 0);
  for (const s of samples) {
    let minDist = Infinity, minIdx = 0;
    centroids.forEach((c, i) => { const d = colorDistance(s, c); if (d < minDist) { minDist = d; minIdx = i; } });
    counts[minIdx]++;
  }
  return centroids.map((c, i) => ({ rgb: c, count: counts[i] }))
    .filter((c) => !isNeutral(c.rgb[0], c.rgb[1], c.rgb[2]))
    .sort((a, b) => b.count - a.count).slice(0, 5)
    .map((c) => rgbToHex(c.rgb[0], c.rgb[1], c.rgb[2]));
}

function extractHexFromText(text) {
  const matches = [];
  let m;
  const re = /#([0-9A-Fa-f]{6})\b/g;
  while ((m = re.exec(text)) !== null) matches.push('#' + m[1].toUpperCase());
  return [...new Set(matches)];
}

function extractFontsFromText(text) {
  const patterns = [
    /(?:font|typeface|typography)[:\s]+["']?([A-Z][a-zA-Z\s]+?)["']?(?:\s|,|\.|$)/gi,
    /(Helvetica|Arial|Futura|Montserrat|Roboto|Open Sans|Lato|Poppins|Raleway|Oswald|Playfair|Merriweather|Georgia|Garamond|Avenir|Gotham|Proxima Nova|Source Sans|Nunito|Inter|DM Sans|Barlow|Manrope)/gi,
  ];
  const fonts = new Set();
  patterns.forEach((p) => { let m; while ((m = p.exec(text)) !== null) { const f = m[1].trim(); if (f.length > 2 && f.length < 40) fonts.add(f); } });
  return [...fonts].slice(0, 4);
}

export async function parseBrandPdf(file) {
  const pdfjs = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
  const maxPages = Math.min(pdf.numPages, 5);
  let allText = '';
  const colorSamples = [];

  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    allText += textContent.items.map((item) => item.str).join(' ') + '\n';
    const viewport = page.getViewport({ scale: 0.5 });
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await page.render({ canvasContext: ctx, viewport }).promise;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let j = 0; j < imageData.length; j += 40 * 4) {
      const r = imageData[j], g = imageData[j+1], b = imageData[j+2];
      if (!isNeutral(r, g, b)) colorSamples.push([r, g, b]);
    }
  }

  let colors = extractHexFromText(allText);
  if (colors.length < 3) colors = [...new Set([...colors, ...clusterColors(colorSamples)])].slice(0, 6);
  const fonts = extractFontsFromText(allText);

  return {
    colors: colors.length > 0 ? colors : ['#E04A2F', '#1A1A2E', '#5A7DFF', '#34C759', '#F5A623'],
    fonts: fonts.length > 0 ? fonts : ['DM Sans', 'Space Mono'],
  };
}
