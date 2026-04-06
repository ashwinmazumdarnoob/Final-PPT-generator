# DeckForge — Media Plan to PPT Automation Tool

A Vite + React application that transforms media plan spreadsheets into branded PowerPoint presentations with geospatial heatmaps, budget charts, and strategic slides.

## Quick Start

```bash
cd media-plan-tool
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## Architecture

```
src/
├── App.jsx                    # Root orchestrator — manages state + step navigation
├── main.jsx                   # React entry point
├── styles/
│   └── global.css             # Full design system (CSS variables, components)
├── components/
│   ├── Stepper.jsx            # 4-step progress bar
│   ├── StrategyForm.jsx       # Campaign metadata questionnaire
│   ├── FileUploader.jsx       # CSV/Excel + Brand PDF upload with parsing
│   ├── HeatmapGenerator.jsx   # Leaflet + leaflet.heat map with auto-capture
│   ├── PreviewPanel.jsx       # Live slide preview with Recharts donut
│   └── GeneratePanel.jsx      # Export checklist + pptxgenjs trigger
├── utils/
│   ├── parseMedia.js          # SheetJS parser, geo extraction, spend aggregation
│   ├── parseBrandPdf.js       # pdf.js renderer, pixel clustering, hex/font extraction
│   ├── heatmapCapture.js      # html-to-image capture for map snapshot
│   └── generatePPT.js         # pptxgenjs deck builder (6+ slide types)
```

## Features

### 1. Strategy Questionnaire
Captures: Objective, Audience, KPIs, Flight Dates, Budget, Campaign Type (Digital / BTL / ATL / 360°).

### 2. File Ingestion
- **Media Plan** (CSV/XLSX): Parsed client-side via SheetJS into JSON. Auto-detects columns for spend, channel, and geospatial data.
- **Brand PDF**: Rendered page-by-page via pdf.js. Colors extracted by pixel sampling + k-means clustering. Hex codes and font names also extracted from text content.

### 3. Geospatial Heatmap
If `Latitude` and `Longitude` columns are detected, a Leaflet map with a heat layer is rendered using dark CartoDB tiles. The map is auto-captured as a PNG via `html-to-image` for embedding into the PPT.

### 4. PPT Generation
Built with pptxgenjs. The deck includes:
- **Title Slide** — branded with extracted colors
- **Strategic Overview** — 2×3 grid of questionnaire data
- **Budget Allocation** — doughnut chart + legend
- **Geospatial Heatmap** — embedded PNG capture
- **Data Table Slides** — paginated (12 rows/slide), alternating row fills
- **Closing Slide**

## Key Libraries

| Library | Purpose |
|---------|---------|
| `xlsx` (SheetJS) | CSV / Excel parsing |
| `pdfjs-dist` | PDF rendering + text extraction |
| `leaflet` + `leaflet.heat` | Map + heatmap visualization |
| `html-to-image` | DOM-to-PNG capture |
| `pptxgenjs` | PowerPoint file generation |
| `recharts` | Chart preview in UI |
| `lucide-react` | Icons |

## Sample Data

A `sample-media-plan.csv` is included for testing. It contains 12 rows across Digital, OOH, BTL, Radio, and Print channels with Indian city coordinates.

## Notes

- Brand PDF parsing works best with guidelines that contain explicit hex codes or large color blocks. If no strong colors are found, sensible defaults are applied.
- The heatmap requires Latitude/Longitude columns (case-insensitive). Spend/Budget/Cost column is used for intensity weighting.
- Generated PPTs use the first extracted color as primary and second as background. Override in `generatePPT.js` if needed.
