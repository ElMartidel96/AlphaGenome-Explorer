# Arquitectura de AlphaGenome Explorer Web App

**Fecha:** Febrero 2026
**Versión:** 1.0
**Protocolo:** PERFECTO Y ROBUSTO

---

## 1. DEFINICIÓN DE "DONE" (Criterios de Perfección)

### 1.1 Factores 360° - Checklist Obligatorio

| Factor | Criterio de Éxito | Riesgo | Mitigación |
|--------|-------------------|--------|------------|
| **UX/Micro-interacción** | Feedback visual < 100ms, loading states, tooltips | Usuarios abandonan si no hay feedback | Skeleton loaders, progress bars, toast notifications |
| **Estados** | Manejo de: loading, success, error, empty, partial | Estados inconsistentes | State machine con XState o React Query |
| **Edge Cases** | Variantes inválidas, timeouts, API limits | Crashes silenciosos | Validación robusta, error boundaries |
| **Performance** | TTFB < 1s, FCP < 2s, predicciones cacheadas | Lentitud percibida | Redis cache, optimistic UI, lazy loading |
| **Accesibilidad** | WCAG 2.1 AA, keyboard nav, screen readers | Exclusión de usuarios | Tremor (accessible), semantic HTML |
| **Seguridad** | API key server-side, no secrets en cliente | API key expuesta | Backend proxy, rate limiting |
| **Compatibilidad** | Chrome, Firefox, Safari, Edge, mobile | Funciones no soportadas | Feature detection, polyfills |
| **Observabilidad** | Logs estructurados, métricas, alertas | Problemas ocultos | Sentry, structured logging |
| **Regresiones** | Test suite, CI/CD | Bugs reintroducidos | Jest, Playwright, GitHub Actions |
| **Mantenibilidad** | Código documentado, tipos estrictos | Deuda técnica | TypeScript, JSDoc, CLAUDE.md |

---

## 2. ARQUITECTURA GENERAL

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        ALPHAGENOME EXPLORER                              │
│                     "La mejor forma de explorar el genoma"               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         FRONTEND (Next.js 15)                    │    │
│  │                                                                  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │ Dashboard│ │ Variant  │ │ Region   │ │  Batch   │           │    │
│  │  │   Home   │ │ Analyzer │ │ Explorer │ │ Analysis │           │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │    │
│  │                                                                  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │   ISM    │ │  Multi-  │ │ Contact  │ │  Reports │           │    │
│  │  │ Explorer │ │  Tissue  │ │   Maps   │ │ Generator│           │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │    │
│  │                                                                  │    │
│  │  Components: IGV.js | Tremor | Recharts | shadcn/ui             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    │ REST API + WebSocket                │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         BACKEND (FastAPI)                        │    │
│  │                                                                  │    │
│  │  ┌──────────────────────────────────────────────────────────┐   │    │
│  │  │                    API Routes                             │   │    │
│  │  │  /api/predict/variant    - Predicción de variante         │   │    │
│  │  │  /api/predict/interval   - Predicción de región           │   │    │
│  │  │  /api/predict/sequence   - Predicción de secuencia        │   │    │
│  │  │  /api/score/variant      - Scoring de variante            │   │    │
│  │  │  /api/score/ism          - In silico mutagenesis          │   │    │
│  │  │  /api/batch/upload       - Upload VCF                      │   │    │
│  │  │  /api/batch/status       - Estado de jobs                  │   │    │
│  │  │  /api/export/report      - Generar PDF                     │   │    │
│  │  │  /api/metadata           - Ontologías, genes               │   │    │
│  │  └──────────────────────────────────────────────────────────┘   │    │
│  │                                                                  │    │
│  │  Services:                                                       │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │AlphaGen  │ │  Cache   │ │  Queue   │ │ Annotate │           │    │
│  │  │ Client   │ │ (Redis)  │ │ (Celery) │ │  (VEP)   │           │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                    │                                     │
│                                    ▼                                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                         DATA LAYER                               │    │
│  │                                                                  │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │    │
│  │  │PostgreSQL│ │  Redis   │ │  MinIO   │ │Reference │           │    │
│  │  │ Users,   │ │  Cache,  │ │ Results, │ │ Genome   │           │    │
│  │  │  Jobs    │ │  Sessions│ │  Exports │ │  hg38    │           │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. MÓDULOS FUNCIONALES DETALLADOS

### 3.1 Dashboard Home

**Propósito:** Vista inicial con resumen y acceso rápido

**Componentes:**
- Quick variant search bar
- Recent analyses
- Usage statistics
- Getting started guide
- Featured use cases

**Mockup:**
```
┌────────────────────────────────────────────────────────────┐
│  🧬 AlphaGenome Explorer                    [User] [Docs]  │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌──────────────────────────────────────────────────────┐ │
│  │  🔍 Analyze a variant: [chr22:36201698:A>C    ] [GO] │ │
│  └──────────────────────────────────────────────────────┘ │
│                                                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │  Variant    │ │   Region    │ │    Batch    │         │
│  │  Analyzer   │ │  Explorer   │ │   Upload    │         │
│  │  Predict    │ │  Browse     │ │   VCF       │         │
│  │  effects    │ │  genome     │ │   analysis  │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
│                                                            │
│  Recent Analyses                                           │
│  ├─ chr22:36201698:A>C - RNA_SEQ - 2min ago              │
│  ├─ chr19:CYP2B6 region - DNASE - 1h ago                 │
│  └─ batch_001.vcf (150 variants) - completed             │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

### 3.2 Variant Analyzer (Módulo Principal)

**Propósito:** Analizar efecto de una variante individual

**Input:**
- Variant notation (HGVS, VCF-style, rsID)
- Output types (checkboxes)
- Tissues (multi-select)
- Sequence length (dropdown)

**Output:**
- Summary card (score, interpretation)
- REF vs ALT comparison tracks (IGV.js)
- Gene impact table
- Tissue-specific heatmap
- Splicing impact (if applicable)
- Export buttons

**Mockup:**
```
┌────────────────────────────────────────────────────────────┐
│  Variant Analyzer                                          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Variant: [chr22:36201698:A>C              ] [Analyze]    │
│                                                            │
│  Outputs: [x]RNA-seq [x]DNase [x]Splicing [ ]Contact      │
│  Tissues: [Brain, Colon, Liver                       ▼]   │
│  Context: [1 MB                                      ▼]   │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  RESULTS                                                   │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Summary                                              │  │
│  │ ┌─────────┐ ┌─────────┐ ┌─────────┐               │  │
│  │ │ RNA-seq │ │  DNase  │ │Splicing │               │  │
│  │ │  -0.45  │ │  +0.12  │ │  HIGH   │               │  │
│  │ │ ⬇ Down  │ │ ⬆ Open  │ │ ⚠ Risk  │               │  │
│  │ └─────────┘ └─────────┘ └─────────┘               │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Genome Browser (REF vs ALT)              [zoom][pan] │  │
│  │ ═══════════════════════════════════════════════════ │  │
│  │ Genes    ▓▓▓▓▓▓ APOL4 ▓▓▓▓▓▓                        │  │
│  │ REF      ▁▁▁▂▃▅▇█▇▅▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁               │  │
│  │ ALT      ▁▁▁▂▃▃▄▅▄▃▂▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁  (lower)      │  │
│  │ Splice   ▁▁▁▁▁▁▁▁█▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁  (new site)   │  │
│  │          |                                          │  │
│  │          36201698 (variant)                         │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Gene Impact Table                                    │  │
│  │ Gene   │ Tissue  │ Score    │ Quantile │ Effect    │  │
│  │ APOL4  │ Colon   │ -0.4523  │ 0.95     │ ⬇ Down    │  │
│  │ APOL4  │ Brain   │ -0.0123  │ 0.45     │ - None    │  │
│  │ RBFOX2 │ Colon   │ +0.0011  │ 0.52     │ - None    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  [Export PDF] [Export Tracks] [Copy Link]                  │
└────────────────────────────────────────────────────────────┘
```

---

### 3.3 Region Explorer

**Propósito:** Explorar predicciones para una región genómica

**Input:**
- Gene symbol OR coordinates
- Output types
- Tissues

**Output:**
- Genome browser con tracks
- Gene expression heatmap
- Transcript annotations

---

### 3.4 Batch Analysis

**Propósito:** Analizar múltiples variantes desde VCF

**Input:**
- VCF file upload
- Output configuration
- Email notification

**Output:**
- Progress bar
- Results table (sortable, filterable)
- Bulk export

---

### 3.5 ISM Explorer

**Propósito:** In Silico Mutagenesis interactivo

**Input:**
- Region coordinates
- Width (bases to mutate)
- Scorer type
- Tissue

**Output:**
- Sequence logo
- Heatmap position × base
- Motif annotations

---

### 3.6 Multi-Tissue Comparison

**Propósito:** Comparar predicciones entre tejidos

**Input:**
- Variant or region
- Multiple tissues

**Output:**
- Heatmap (tissue × output type)
- Radar chart
- Differential analysis table

---

### 3.7 Contact Map Viewer

**Propósito:** Visualizar interacciones 3D del genoma

**Input:**
- Region (large, ~1MB)
- Variant (optional)

**Output:**
- 2D contact heatmap
- TAD annotations
- Differential map (if variant)

---

### 3.8 Report Generator

**Propósito:** Generar reportes clínicos/científicos

**Input:**
- Analysis results
- Template selection
- Annotations (ClinVar, VEP)

**Output:**
- PDF download
- Structured data (JSON)

---

## 4. STACK TECNOLÓGICO DETALLADO

### 4.1 Frontend

```json
{
  "framework": "Next.js 15",
  "language": "TypeScript 5.x",
  "styling": "Tailwind CSS 4",
  "components": [
    "@tremor/react",
    "@shadcn/ui",
    "recharts",
    "igv"
  ],
  "state": "TanStack Query (React Query)",
  "forms": "React Hook Form + Zod",
  "testing": "Jest + Playwright"
}
```

### 4.2 Backend

```json
{
  "framework": "FastAPI",
  "language": "Python 3.12",
  "async": "asyncio + httpx",
  "queue": "Celery + Redis",
  "cache": "Redis",
  "database": "PostgreSQL + SQLAlchemy",
  "validation": "Pydantic v2"
}
```

### 4.3 Infrastructure

```json
{
  "container": "Docker + Docker Compose",
  "frontend_host": "Vercel",
  "backend_host": "Railway / Fly.io",
  "database": "Supabase / Railway PostgreSQL",
  "cache": "Upstash Redis",
  "storage": "S3 / MinIO"
}
```

---

## 5. API ENDPOINTS DETALLADOS

### 5.1 Prediction Endpoints

```yaml
POST /api/predict/variant:
  request:
    variant: "chr22:36201698:A>C"
    outputs: ["RNA_SEQ", "DNASE", "SPLICE_SITES"]
    tissues: ["UBERON:0001157", "UBERON:0000955"]
    sequence_length: "1MB"
  response:
    job_id: "uuid"
    status: "processing" | "completed"
    result:
      summary:
        rna_seq_score: -0.45
        dnase_score: +0.12
      tracks:
        reference: {...}
        alternate: {...}
      genes:
        - name: "APOL4"
          scores: {...}

POST /api/predict/interval:
  request:
    interval: "chr19:40991281-41018398"
    outputs: ["RNA_SEQ"]
    tissues: ["UBERON:0001114"]
  response:
    tracks: {...}
    genes: [...]

POST /api/predict/sequence:
  request:
    sequence: "ATCG..."
    outputs: ["DNASE"]
    tissues: ["UBERON:0002048"]
  response:
    tracks: {...}
```

### 5.2 Scoring Endpoints

```yaml
POST /api/score/variant:
  request:
    variant: "chr22:36201698:A>C"
    scorers: ["RNA_SEQ", "SPLICING"]
  response:
    scores:
      - gene: "APOL4"
        raw_score: -0.4523
        quantile_score: 0.95
        tissue: "Colon"

POST /api/score/ism:
  request:
    interval: "chr20:3753000-3753256"
    scorer: "DNASE"
    tissue: "EFO:0002067"
  response:
    job_id: "uuid"
    status: "processing"
```

### 5.3 Batch Endpoints

```yaml
POST /api/batch/upload:
  request:
    file: (VCF binary)
    config:
      outputs: ["RNA_SEQ"]
      tissues: ["UBERON:0001157"]
  response:
    batch_id: "uuid"
    total_variants: 150
    status: "queued"

GET /api/batch/{batch_id}/status:
  response:
    status: "processing"
    progress: 45
    completed: 67
    total: 150

GET /api/batch/{batch_id}/results:
  response:
    variants: [...]
    download_url: "..."
```

### 5.4 Metadata Endpoints

```yaml
GET /api/metadata/ontologies:
  response:
    tissues: [
      { code: "UBERON:0000955", name: "Brain" },
      ...
    ]
    cell_lines: [...]

GET /api/metadata/genes?query=CYP:
  response:
    genes: [
      { symbol: "CYP2B6", chromosome: "chr19", ... },
      ...
    ]

GET /api/metadata/outputs:
  response:
    outputs: [
      { id: "RNA_SEQ", name: "RNA Sequencing", tracks: 667 },
      ...
    ]
```

---

## 6. MODELO DE DATOS

### 6.1 PostgreSQL Schema

```sql
-- Users (optional, for saving analyses)
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Analysis Jobs
CREATE TABLE jobs (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    type VARCHAR(50), -- 'variant', 'interval', 'batch', 'ism'
    status VARCHAR(20), -- 'queued', 'processing', 'completed', 'failed'
    input JSONB,
    result JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Batch Variants
CREATE TABLE batch_variants (
    id UUID PRIMARY KEY,
    job_id UUID REFERENCES jobs(id),
    variant VARCHAR(100),
    status VARCHAR(20),
    result JSONB
);

-- Cache Entries (metadata)
CREATE TABLE cache_log (
    key VARCHAR(255) PRIMARY KEY,
    created_at TIMESTAMP,
    expires_at TIMESTAMP,
    hit_count INT DEFAULT 0
);
```

### 6.2 Redis Cache Keys

```
# Prediction cache (TTL: 24h)
pred:variant:{variant_hash}:{outputs}:{tissues} -> result JSON

# Metadata cache (TTL: 7d)
meta:ontologies -> ontologies JSON
meta:genes:{query} -> genes JSON

# Job status (TTL: 1h)
job:{job_id}:status -> status string
job:{job_id}:progress -> progress int
```

---

## 7. SEGURIDAD

### 7.1 Principios

| Principio | Implementación |
|-----------|----------------|
| API Key Protection | Solo en backend, nunca en cliente |
| Input Validation | Zod (frontend) + Pydantic (backend) |
| Rate Limiting | Redis-based, por IP |
| CORS | Whitelist de orígenes |
| Secrets | Variables de entorno, nunca en código |

### 7.2 Validación de Input

```python
# Backend validation
class VariantInput(BaseModel):
    variant: str = Field(
        ...,
        pattern=r'^chr[\dXY]+:\d+:[ACGTN]+>[ACGTN]+$',
        examples=["chr22:36201698:A>C"]
    )
    outputs: list[OutputType] = Field(
        ...,
        min_length=1,
        max_length=11
    )
    tissues: list[str] = Field(
        default=[],
        max_length=20
    )

    @field_validator('variant')
    def validate_variant(cls, v):
        # Additional validation logic
        return v
```

---

## 8. TESTING STRATEGY

### 8.1 Test Pyramid

```
         /\
        /  \     E2E (Playwright)
       /----\    - Critical user flows
      /      \
     /--------\  Integration (API tests)
    /          \ - Backend endpoints
   /------------\
  /              \ Unit (Jest, pytest)
 /                \- Components, functions
/------------------\
```

### 8.2 Test Cases Críticos

| Módulo | Test | Tipo |
|--------|------|------|
| Variant Input | Acepta formato válido | Unit |
| Variant Input | Rechaza formato inválido | Unit |
| Prediction API | Devuelve resultado válido | Integration |
| Prediction API | Maneja timeout | Integration |
| Genome Browser | Renderiza tracks | E2E |
| Batch Upload | Procesa VCF correctamente | Integration |
| Export | Genera PDF válido | E2E |

---

## 9. DEPLOYMENT

### 9.1 Docker Compose (Development)

```yaml
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - ALPHAGENOME_API_KEY=${ALPHAGENOME_API_KEY}
      - DATABASE_URL=postgresql://...
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis
      - postgres

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  postgres:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=alphagenome
      - POSTGRES_PASSWORD=${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### 9.2 Production Deployment

```
Frontend: Vercel (automatic from GitHub)
Backend: Railway / Fly.io
Database: Supabase PostgreSQL
Cache: Upstash Redis
Storage: Cloudflare R2 / S3
```

---

## 10. ROADMAP DE IMPLEMENTACIÓN

### Phase 1: MVP (Semana 1-2)
- [ ] Setup proyecto Next.js + FastAPI
- [ ] Variant Analyzer básico
- [ ] Integración AlphaGenome API
- [ ] Visualización con IGV.js
- [ ] Deploy inicial

### Phase 2: Core Features (Semana 3-4)
- [ ] Region Explorer
- [ ] Multi-tissue comparison
- [ ] Caching Redis
- [ ] Export PDF básico

### Phase 3: Advanced (Semana 5-6)
- [ ] Batch processing
- [ ] ISM Explorer
- [ ] Contact Map Viewer
- [ ] Job queue (Celery)

### Phase 4: Polish (Semana 7-8)
- [ ] Reportes clínicos
- [ ] Integración VEP
- [ ] Tests E2E
- [ ] Documentación

---

## 11. ARCHIVOS A CREAR

```
alphagenome-explorer/
├── frontend/
│   ├── app/
│   │   ├── page.tsx                 # Dashboard
│   │   ├── variant/page.tsx         # Variant Analyzer
│   │   ├── region/page.tsx          # Region Explorer
│   │   ├── batch/page.tsx           # Batch Upload
│   │   ├── ism/page.tsx             # ISM Explorer
│   │   └── api/                     # API routes (proxy)
│   ├── components/
│   │   ├── genome-browser/          # IGV.js wrapper
│   │   ├── variant-input/           # Input forms
│   │   ├── result-cards/            # Summary cards
│   │   ├── tracks-viewer/           # Track visualization
│   │   └── heatmaps/                # Tissue heatmaps
│   ├── lib/
│   │   ├── api.ts                   # API client
│   │   └── utils.ts                 # Utilities
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI app
│   │   ├── routers/
│   │   │   ├── predict.py           # Prediction routes
│   │   │   ├── score.py             # Scoring routes
│   │   │   ├── batch.py             # Batch routes
│   │   │   └── metadata.py          # Metadata routes
│   │   ├── services/
│   │   │   ├── alphagenome.py       # AlphaGenome client
│   │   │   ├── cache.py             # Redis cache
│   │   │   └── export.py            # PDF generation
│   │   ├── models/
│   │   │   ├── requests.py          # Pydantic models
│   │   │   └── responses.py         # Response models
│   │   └── config.py                # Settings
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## SIGUIENTE PASO

Proceder a la **implementación** comenzando por el backend (FastAPI) que es el core de la aplicación.
