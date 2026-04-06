import PptxGenJS from 'pptxgenjs';

export async function generatePPT({ strategy, mediaData, brand, heatmapImage, chartData }) {
  const pptx = new PptxGenJS();
  const primary = brand.colors[0] || '#E04A2F';
  const secondary = brand.colors[1] || '#1A1A2E';
  const tertiary = brand.colors[2] || '#5A7DFF';
  const fontFace = brand.fonts[0] || 'Calibri';
  const fontMono = brand.fonts[1] || 'Courier New';
  const c = (hex) => hex.replace('#', '');

  pptx.author = 'DeckForge';
  pptx.title = `${strategy.objective || 'Campaign'} — Media Plan`;

  pptx.defineSlideMaster({
    title: 'BRAND_MASTER',
    background: { color: c(secondary) },
    objects: [
      { rect: { x: 0, y: 0, w: '100%', h: 0.5, fill: { color: c(primary) } } },
      { text: { text: 'DECKFORGE', options: { x: 0.4, y: 6.9, w: 3, h: 0.35, fontSize: 8, color: '888888', fontFace: fontMono } } },
    ],
  });

  // 1. TITLE SLIDE
  const s1 = pptx.addSlide({ masterName: 'BRAND_MASTER' });
  s1.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: c(secondary) } });
  s1.addShape(pptx.ShapeType.rect, { x: 0, y: 2.5, w: '100%', h: 2.8, fill: { color: c(primary), transparency: 10 } });
  s1.addText(strategy.objective || 'Campaign Media Plan', { x: 0.8, y: 2.6, w: 8.4, h: 1.2, fontSize: 32, fontFace, color: 'FFFFFF', bold: true });
  s1.addText(`${strategy.campaignType || ''} Campaign | ${strategy.flightDates || ''}`, { x: 0.8, y: 3.8, w: 8.4, h: 0.6, fontSize: 14, fontFace, color: 'DDDDDD' });
  s1.addText(`Total Budget: ${strategy.budget || 'TBD'}`, { x: 0.8, y: 4.4, w: 8.4, h: 0.5, fontSize: 13, fontFace: fontMono, color: c(primary) });

  // 2. STRATEGIC OVERVIEW
  const s2 = pptx.addSlide({ masterName: 'BRAND_MASTER' });
  s2.addText('Strategic Overview', { x: 0.5, y: 0.7, w: 9, h: 0.6, fontSize: 24, fontFace, color: 'FFFFFF', bold: true });
  const items = [
    { label: 'OBJECTIVE', value: strategy.objective || '—' },
    { label: 'TARGET AUDIENCE', value: strategy.audience || '—' },
    { label: 'CORE KPIs', value: strategy.kpis || '—' },
    { label: 'FLIGHT DATES', value: strategy.flightDates || '—' },
    { label: 'TOTAL BUDGET', value: strategy.budget || '—' },
    { label: 'CAMPAIGN TYPE', value: strategy.campaignType || '—' },
  ];
  items.forEach((item, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const x = 0.5 + col * 4.5, y = 1.6 + row * 1.5;
    s2.addText(item.label, { x, y, w: 4, h: 0.35, fontSize: 9, fontFace: fontMono, color: c(primary), bold: true });
    s2.addText(item.value, { x, y: y + 0.35, w: 4, h: 0.6, fontSize: 13, fontFace, color: 'FFFFFF' });
  });

  // 3. BUDGET CHART
  if (chartData && chartData.length > 0) {
    const s3 = pptx.addSlide({ masterName: 'BRAND_MASTER' });
    s3.addText('Budget Allocation', { x: 0.5, y: 0.7, w: 9, h: 0.6, fontSize: 24, fontFace, color: 'FFFFFF', bold: true });
    const colors = [c(primary), c(tertiary), 'F5A623', '34C759', 'FF6B8A', '8B5CF6', '06B6D4', 'EC4899'];
    s3.addChart(pptx.ChartType.doughnut, [{
      name: 'Spend',
      labels: chartData.map((d) => d.name),
      values: chartData.map((d) => d.value),
    }], {
      x: 0.5, y: 1.5, w: 4.5, h: 4.5, showLegend: false, holeSize: 55,
      chartColors: colors.slice(0, chartData.length),
      dataLabelPosition: 'outEnd', dataLabelFontSize: 8, dataLabelColor: 'CCCCCC',
    });
    chartData.forEach((d, i) => {
      const y = 1.8 + i * 0.55;
      s3.addShape(pptx.ShapeType.rect, { x: 5.5, y, w: 0.25, h: 0.25, fill: { color: colors[i % colors.length] }, rectRadius: 0.03 });
      s3.addText(d.name, { x: 5.9, y: y - 0.05, w: 2.5, h: 0.35, fontSize: 10, fontFace, color: 'FFFFFF' });
      s3.addText(d.value.toLocaleString(), { x: 8.2, y: y - 0.05, w: 1.2, h: 0.35, fontSize: 10, fontFace: fontMono, color: 'AAAAAA', align: 'right' });
    });
  }

  // 4. HEATMAP
  if (heatmapImage) {
    const s4 = pptx.addSlide({ masterName: 'BRAND_MASTER' });
    s4.addText('Geospatial Footprint', { x: 0.5, y: 0.7, w: 9, h: 0.6, fontSize: 24, fontFace, color: 'FFFFFF', bold: true });
    s4.addText('Heatmap of planned activations by geographic density and spend.', { x: 0.5, y: 1.3, w: 9, h: 0.4, fontSize: 11, fontFace, color: '999999' });
    s4.addImage({ data: heatmapImage, x: 0.5, y: 1.9, w: 9, h: 4.5, rounding: true });
  }

  // 5. DATA TABLES
  if (mediaData && mediaData.rows.length > 0) {
    const { headers, rows } = mediaData;
    const displayHeaders = headers.slice(0, 8);
    const rowsPerSlide = 12;
    const totalSlides = Math.ceil(rows.length / rowsPerSlide);
    for (let page = 0; page < totalSlides; page++) {
      const sN = pptx.addSlide({ masterName: 'BRAND_MASTER' });
      const label = totalSlides > 1 ? ` (${page + 1}/${totalSlides})` : '';
      sN.addText(`Detailed Media Plan${label}`, { x: 0.5, y: 0.7, w: 9, h: 0.5, fontSize: 20, fontFace, color: 'FFFFFF', bold: true });
      const pageRows = rows.slice(page * rowsPerSlide, (page + 1) * rowsPerSlide);
      const colW = displayHeaders.map(() => 9 / displayHeaders.length);
      const tableRows = [
        displayHeaders.map((h) => ({ text: h, options: { fontSize: 7, fontFace: fontMono, color: 'FFFFFF', bold: true, fill: { color: c(primary) }, align: 'left', valign: 'middle' } })),
        ...pageRows.map((row, ri) => displayHeaders.map((h) => ({ text: String(row[h] ?? ''), options: { fontSize: 7, fontFace, color: 'DDDDDD', fill: { color: ri % 2 === 0 ? '1C1C28' : '22222E' }, align: 'left', valign: 'middle' } }))),
      ];
      sN.addTable(tableRows, { x: 0.4, y: 1.4, w: 9.2, colW, rowH: 0.32, border: { type: 'solid', pt: 0.5, color: '333344' }, autoPage: false });
    }
  }

  // 6. CLOSING
  const sLast = pptx.addSlide({ masterName: 'BRAND_MASTER' });
  sLast.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: '100%', h: '100%', fill: { color: c(secondary) } });
  sLast.addText('Thank You', { x: 0, y: 2.5, w: '100%', h: 1.2, fontSize: 40, fontFace, color: 'FFFFFF', bold: true, align: 'center' });
  sLast.addText('Generated with DeckForge', { x: 0, y: 3.8, w: '100%', h: 0.6, fontSize: 12, fontFace: fontMono, color: '666666', align: 'center' });

  const fileName = `${(strategy.objective || 'MediaPlan').replace(/\s+/g, '_')}_Deck.pptx`;
  await pptx.writeFile({ fileName });
  return fileName;
}
