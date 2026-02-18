# AlphaGenome Explorer

> **Source-Available Software** | [PolyForm Noncommercial License 1.0.0](../LICENSE)
> Commercial use requires a separate license. See [LICENSE-COMMERCIAL.md](../LICENSE-COMMERCIAL.md).

A professional web interface for Google DeepMind's AlphaGenome API.

## Features

- **Variant Analyzer**: Predict effects of genetic variants on gene expression, splicing, and chromatin
- **Region Explorer**: Browse any genomic region with interactive tracks
- **Batch Analysis**: Upload VCF files to analyze multiple variants
- **ISM Explorer**: In silico mutagenesis to identify critical bases
- **Multi-Tissue Comparison**: Compare predictions across tissues
- **Multiple Export Formats**: JSON, CSV, TSV, Markdown, PDF, VCF, Excel

## Requirements

- **AlphaGenome API Key** (FREE for non-commercial research)
- Node.js 18+ (for frontend)
- Python 3.12+ (for backend)
- Docker (optional, for containerized deployment)

## Getting Your API Key

1. Visit [https://deepmind.google.com/science/alphagenome](https://deepmind.google.com/science/alphagenome)
2. Sign in with your Google account
3. Request an API key (usually instant approval)
4. Copy your API key

**Note:** The API is FREE for non-commercial research use.

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Clone the repository
cd webapp

# Start all services
docker-compose up -d

# Open in browser
open http://localhost:3000
```

### Option 2: Manual Setup

**Backend:**
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Configure API Key**: Enter your AlphaGenome API key when prompted
   - Your key is stored only in your browser (localStorage)
   - It's never sent to our servers for storage

2. **Analyze a Variant**: Enter a variant like `chr22:36201698:A>C`

3. **View Results**: See impact summary, gene scores, and visualizations

4. **Export Results**: Copy to clipboard or download in various formats

## Export Formats

| Format | Best For | Copy-Paste |
|--------|----------|------------|
| JSON | API integration, programming | Yes |
| CSV | Excel, spreadsheets | Download |
| TSV | Bioinformatics tools, paste to sheets | Yes |
| Markdown | Documentation, GitHub | Yes |
| PDF | Reports, clinical use | Download |
| VCF | Bioinformatics pipelines | Download |
| Excel | Enterprise, detailed analysis | Download |

## API Documentation

Backend API documentation is available at:
- Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)

## Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    Frontend     │────▶│     Backend     │────▶│   AlphaGenome   │
│   (Next.js)     │     │    (FastAPI)    │     │      API        │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │      Redis      │
                        │    (Cache)      │
                        └─────────────────┘
```

## Security

- **API Key Storage**: Your API key is stored ONLY in your browser's localStorage
- **No Server Storage**: We never store your API key on our servers
- **Per-Request Usage**: The key is only sent when making AlphaGenome API calls

## AlphaGenome Capabilities

| Output Type | Description |
|------------|-------------|
| RNA_SEQ | Gene expression levels |
| DNASE | Chromatin accessibility |
| ATAC | Chromatin accessibility |
| CAGE | Transcription start sites |
| CHIP_HISTONE | Histone modifications |
| CHIP_TF | Transcription factor binding |
| SPLICE_SITES | Splice site probabilities |
| SPLICE_JUNCTIONS | Junction usage |
| CONTACT_MAPS | 3D genome structure |
| PROCAP | Nascent transcription |

## Citation

If you use AlphaGenome in your research, please cite:

> Avsec et al. "Advancing regulatory variant effect prediction with AlphaGenome" Nature 2026

## License

This software is **source-available** under the [PolyForm Noncommercial License 1.0.0](../LICENSE).

- **Permitted**: Personal use, research, education, evaluation, nonprofit use
- **Prohibited**: Commercial use, production deployment, SaaS hosting, resale
- **Commercial use**: Requires a separate license from mbxarts.com - The Moon in a Box. See [LICENSE-COMMERCIAL.md](../LICENSE-COMMERCIAL.md)

AlphaGenome API usage is subject to [Google DeepMind's terms of use](https://deepmind.google.com/science/alphagenome/terms).

Copyright 2024-2026 mbxarts.com - The Moon in a Box. All rights reserved.

## Support

- AlphaGenome Documentation: [https://www.alphagenomedocs.com/](https://www.alphagenomedocs.com/)
- Community Forum: [https://www.alphagenomecommunity.com/](https://www.alphagenomecommunity.com/)
- Email: alphagenome@google.com
