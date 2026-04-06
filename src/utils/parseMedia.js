import * as XLSX from 'xlsx';

export async function parseMediaFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        if (rawData.length < 2) { reject(new Error('File must have a header row and at least one data row.')); return; }
        const headers = rawData[0].map((h) => String(h).trim());
        const rows = rawData.slice(1)
          .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
          .map((row) => {
            const obj = {};
            headers.forEach((header, i) => { obj[header] = row[i] !== undefined ? row[i] : ''; });
            return obj;
          });
        resolve({ headers, rows, rawData });
      } catch (err) { reject(new Error('Failed to parse file: ' + err.message)); }
    };
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.readAsArrayBuffer(file);
  });
}

export function extractGeoData(headers, rows) {
  const latCol = headers.find((h) => /^lat(itude)?$/i.test(h.trim()));
  const lngCol = headers.find((h) => /^(lng|lon|long|longitude)$/i.test(h.trim()));
  if (!latCol || !lngCol) return null;
  const spendCol = headers.find((h) => /spend|budget|cost|amount/i.test(h.trim()));
  const points = rows.map((row) => {
    const lat = parseFloat(row[latCol]);
    const lng = parseFloat(row[lngCol]);
    const intensity = spendCol ? parseFloat(row[spendCol]) || 1 : 1;
    const label = row['Location'] || row['Name'] || row['Channel'] || '';
    if (isNaN(lat) || isNaN(lng)) return null;
    return { lat, lng, intensity, label };
  }).filter(Boolean);
  return points.length > 0 ? points : null;
}

export function aggregateByField(rows, field) {
  const map = {};
  rows.forEach((row) => {
    const key = String(row[field] || 'Unknown').trim();
    const spend = parseFloat(row['Spend'] || row['Budget'] || row['Cost'] || row['Amount'] || 0);
    map[key] = (map[key] || 0) + spend;
  });
  return Object.entries(map).map(([name, value]) => ({ name, value: Math.round(value) })).sort((a, b) => b.value - a.value);
}

export function findGroupColumn(headers) {
  const candidates = ['Channel', 'Medium', 'Platform', 'Category', 'Type', 'Media', 'Source'];
  for (const c of candidates) {
    const match = headers.find((h) => h.toLowerCase() === c.toLowerCase());
    if (match) return match;
  }
  return headers[0];
}
