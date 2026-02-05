# Análisis Exhaustivo de Capacidades de AlphaGenome API

**Fecha:** Febrero 2026
**Versión API:** 0.5.1
**Fuente:** Google DeepMind

---

## Resumen Ejecutivo

AlphaGenome es el modelo de IA más avanzado para predicción de efectos de variantes genéticas, capaz de:
- Analizar secuencias de **hasta 1 millón de pares de bases**
- Predecir **11 modalidades diferentes** de output funcional
- Resolución de **un solo par de bases**
- Soportar genomas **humano y ratón**
- **Superar** a todos los modelos existentes en 24/26 benchmarks

---

## 1. TIPOS DE OUTPUT (11 Modalidades)

### 1.1 Expresión Génica

| Output | Descripción | Uso Clínico | Resolución |
|--------|-------------|-------------|------------|
| **RNA_SEQ** | Expresión génica (RNA-seq coverage) | Identificar genes afectados por variantes | 1 bp |
| **CAGE** | Inicio de transcripción (Cap Analysis) | Localizar promotores y TSS alternativos | 1 bp |
| **PROCAP** | Actividad de TSS (Precision Run-On) | Alta resolución de inicios de transcripción | 1 bp |

**Aplicaciones:**
- Predecir si una variante aumenta/disminuye expresión de un gen
- Identificar promotores alternativos activados
- Detectar efectos en genes distantes (eQTLs)

### 1.2 Accesibilidad de Cromatina

| Output | Descripción | Uso Clínico | Resolución |
|--------|-------------|-------------|------------|
| **DNASE** | Hipersensibilidad DNase-I | Regiones reguladoras abiertas | 1 bp |
| **ATAC** | Accesibilidad ATAC-seq | Cromatina accesible | 1 bp |

**Aplicaciones:**
- Identificar enhancers y promotores
- Detectar variantes que abren/cierran regiones reguladoras
- Mapear elementos reguladores específicos de tejido

### 1.3 Modificaciones Epigenéticas

| Output | Descripción | Uso Clínico | Resolución |
|--------|-------------|-------------|------------|
| **CHIP_HISTONE** | Marcas de histonas (H3K4me3, H3K27ac, etc.) | Estado epigenético | 1 bp |
| **CHIP_TF** | Unión de factores de transcripción | Sitios de unión de TFs | 1 bp |

**Aplicaciones:**
- Predecir efectos en enhancers (H3K27ac)
- Identificar promotores activos (H3K4me3)
- Detectar silenciamiento (H3K27me3)
- Mapear sitios de unión de TFs afectados

### 1.4 Splicing

| Output | Descripción | Uso Clínico | Resolución |
|--------|-------------|-------------|------------|
| **SPLICE_SITES** | Probabilidad de sitios donor/acceptor | Crear/destruir sitios de splicing | 1 bp |
| **SPLICE_SITE_USAGE** | Uso relativo de cada sitio | Cambios en isoformas | 1 bp |
| **SPLICE_JUNCTIONS** | Conteos de junciones exón-exón | Exon skipping, retención de intrones | Por junción |

**Aplicaciones:**
- Predecir variantes que crean sitios crípticos de splicing
- Detectar exon skipping
- Identificar retención de intrones
- Cambios en uso de isoformas

### 1.5 Estructura 3D del Genoma

| Output | Descripción | Uso Clínico | Resolución |
|--------|-------------|-------------|------------|
| **CONTACT_MAPS** | Contactos ADN-ADN (Hi-C style) | Interacciones enhancer-promoter | 2D matrix |

**Aplicaciones:**
- Predecir disrupciones de TADs (Topologically Associated Domains)
- Identificar cambios en interacciones enhancer-promoter
- Detectar variantes estructurales que afectan la arquitectura 3D

---

## 2. MÉTODOS DE PREDICCIÓN

### 2.1 Predicción de Secuencia

```python
predict_sequence(
    sequence: str,                    # Secuencia ADN (ACGTN)
    organism: Organism,               # HOMO_SAPIENS | MUS_MUSCULUS
    requested_outputs: [OutputType],  # Lista de outputs deseados
    ontology_terms: [str]             # Tejidos/células
) → Output
```

**Uso:** Secuencias artificiales, diseño de secuencias, mutagénesis sintética

### 2.2 Predicción de Intervalo Genómico

```python
predict_interval(
    interval: Interval,               # Región genómica (chr:start-end)
    organism: Organism,
    requested_outputs: [OutputType],
    ontology_terms: [str]
) → Output
```

**Uso:** Analizar regiones específicas del genoma de referencia

### 2.3 Predicción de Efecto de Variante

```python
predict_variant(
    interval: Interval,
    variant: Variant,                 # chr:pos:ref>alt
    organism: Organism,
    requested_outputs: [OutputType],
    ontology_terms: [str]
) → VariantOutput  # (reference, alternate)
```

**Uso:** Comparar predicciones REF vs ALT para una variante

### 2.4 Scoring de Variantes

```python
score_variant(
    interval: Interval,
    variant: Variant,
    variant_scorers: [VariantScorer]
) → list[AnnData]  # Scores por gen × track
```

**Uso:** Obtener scores numéricos agregados del efecto de variantes

### 2.5 Scoring de Intervalos (Genes)

```python
score_interval(
    interval: Interval,
    interval_scorers: [IntervalScorer]
) → list[AnnData]
```

**Uso:** Expresión basal de genes en una región

### 2.6 In Silico Mutagenesis (ISM)

```python
score_ism_variants(
    interval: Interval,
    ism_interval: Interval,           # Región a mutar (todas las SNVs)
    variant_scorers: [VariantScorer],
    max_workers: int = 5
) → list[list[AnnData]]
```

**Uso:** Identificar bases críticas en secuencias reguladoras

---

## 3. ESTRATEGIAS DE SCORING DE VARIANTES

### 3.1 CENTER_MASK (Agregación Espacial)

| Parámetro | Opciones |
|-----------|----------|
| **width** | None (full), 501, 2001, 10001, 100001, 200001 bp |
| **aggregation** | DIFF_MEAN, DIFF_SUM, L2_DIFF, ACTIVE_MEAN, etc. |
| **outputs** | ATAC, CAGE, DNASE, RNA_SEQ, CHIP_*, SPLICE_*, PROCAP |

**Uso:** Efecto local de variantes en señal continua

### 3.2 GENE_MASK_LFC (Log Fold Change por Gen)

```
Score = log(mean(ALT) + 0.001) - log(mean(REF) + 0.001)
```

**Uso:** Efecto de variantes en expresión de genes específicos

### 3.3 GENE_MASK_SPLICING (Efecto en Splicing)

```
Score = max(|ALT - REF|) sobre sitios de splicing
```

**Uso:** Detectar variantes que afectan splicing

### 3.4 CONTACT_MAP (Estructura 3D)

```
Score = mean(|ALT - REF|) de frecuencias de contacto
```

**Uso:** Efectos en organización 3D del genoma

### 3.5 PA_QTL (Poliadenilación)

**Uso:** Efectos en sitios de poliadenilación alternativa (solo humano)

### 3.6 SPLICE_JUNCTION (Junciones)

```
Score = max(|log(ALT/REF)|) de uso de junciones
```

**Uso:** Detectar exon skipping y uso de junciones alternativas

---

## 4. SISTEMA DE ONTOLOGÍAS

### 4.1 Tipos de Ontología Soportados

| Ontología | Descripción | Ejemplo |
|-----------|-------------|---------|
| **UBERON** | Anatomía (tejidos) | UBERON:0000955 (Brain) |
| **CL** | Tipos celulares | CL:0000540 (Neuron) |
| **EFO** | Factores experimentales | EFO:0002067 (K562) |
| **CLO** | Líneas celulares | CLO:0000001 |

### 4.2 Tejidos Principales Disponibles

| Tejido | Código | Tracks RNA-seq |
|--------|--------|----------------|
| Brain | UBERON:0000955 | ~50 |
| Heart | UBERON:0000948 | ~30 |
| Liver | UBERON:0002107 | ~40 |
| Lung | UBERON:0002048 | ~35 |
| Kidney | UBERON:0002113 | ~30 |
| Colon | UBERON:0001157 | ~25 |
| Blood | UBERON:0000178 | ~60 |
| Skin | UBERON:0002097 | ~20 |

### 4.3 Líneas Celulares Principales

| Línea | Código | Descripción |
|-------|--------|-------------|
| K562 | EFO:0002067 | Leucemia mieloide |
| HepG2 | EFO:0001187 | Hepatocarcinoma |
| GM12878 | EFO:0002784 | Linfoblastoide |
| HeLa | EFO:0001185 | Cervical cancer |

---

## 5. LONGITUDES DE SECUENCIA

| Constante | Tamaño | Uso Recomendado |
|-----------|--------|-----------------|
| SEQUENCE_LENGTH_16KB | 16,384 bp | ISM, análisis rápido |
| SEQUENCE_LENGTH_100KB | 131,072 bp | Genes pequeños |
| SEQUENCE_LENGTH_500KB | 524,288 bp | Genes grandes, enhancers distantes |
| SEQUENCE_LENGTH_1MB | 1,048,576 bp | Análisis completo, TADs, eQTLs |

---

## 6. ESTRUCTURAS DE DATOS

### 6.1 TrackData

```python
TrackData:
  - values: ndarray[positions, tracks]  # Predicciones
  - metadata: DataFrame                  # Info de cada track
  - resolution: int                      # bp por bin
  - interval: Interval                   # Ubicación genómica
```

**Operaciones:** slice, resize, filter, concat, groupby, reverse_complement

### 6.2 JunctionData

```python
JunctionData:
  - junctions: array[Junction]           # Lista de junciones
  - values: ndarray[junctions, tracks]   # Conteos
  - metadata: DataFrame                  # Info de tracks
```

### 6.3 Variant

```python
Variant:
  - chromosome: str      # 'chr22'
  - position: int        # 1-based
  - reference_bases: str # 'A'
  - alternate_bases: str # 'C'
```

**Propiedades:** is_snv, is_indel, is_deletion, is_insertion

### 6.4 Interval

```python
Interval:
  - chromosome: str
  - start: int           # 0-based
  - end: int             # exclusive
  - strand: str          # '+', '-', '.'
```

**Métodos:** resize(), shift(), pad(), overlaps(), contains()

---

## 7. CAPACIDADES DE VISUALIZACIÓN

### 7.1 Componentes Nativos

| Componente | Descripción |
|------------|-------------|
| `plot_components.Tracks()` | Visualizar TrackData |
| `plot_components.OverlaidTracks()` | Superponer REF vs ALT |
| `plot_components.TranscriptAnnotation()` | Genes y transcripts |
| `plot_components.VariantAnnotation()` | Marcar posición de variante |
| `plot_components.SeqLogo()` | Sequence logo para ISM |
| `plot_contact_map()` | Mapas de contacto 2D |

### 7.2 Integraciones Posibles

- **matplotlib**: Nativo
- **seaborn**: Nativo
- **Plotly**: Conversión manual
- **IGV.js**: Exportar tracks como BigWig/BED

---

## 8. PROCESAMIENTO BATCH

### 8.1 Métodos Paralelos

```python
predict_sequences(sequences, max_workers=5)    # Lista de secuencias
predict_intervals(intervals, max_workers=5)    # Lista de intervalos
score_ism_variants(interval, ism_interval)     # Todas las SNVs
```

### 8.2 Límites

| Parámetro | Valor |
|-----------|-------|
| Max workers | 5 (default) |
| ISM chunk size | 10 bp |
| Scorers por request | 20 |
| Rate limit (free) | ~1M calls/día |

---

## 9. SOPORTE DE ORGANISMOS

| Organismo | Código | Scorers Disponibles |
|-----------|--------|---------------------|
| Humano | HOMO_SAPIENS | Todos (7) |
| Ratón | MUS_MUSCULUS | 6 (excepto PA_QTL) |

---

## 10. CASOS DE USO CLÍNICOS

### 10.1 Interpretación de Variantes de Significado Incierto (VUS)

```
1. Score con GENE_MASK_LFC → efecto en expresión
2. Score con GENE_MASK_SPLICING → efecto en splicing
3. Comparar quantile_score con variantes benignas/patogénicas conocidas
```

### 10.2 Identificación de Enhancers Afectados

```
1. Predecir DNASE, ATAC, H3K27ac para REF y ALT
2. Identificar regiones donde ALT-REF es significativo
3. Correlacionar con genes cercanos usando CONTACT_MAPS
```

### 10.3 Análisis de Splicing

```
1. Predecir SPLICE_SITES para REF y ALT
2. Identificar sitios nuevos (ganancia) o perdidos (pérdida)
3. Predecir SPLICE_JUNCTIONS para cuantificar impacto
4. Predecir RNA_SEQ para ver cambio en isoformas
```

### 10.4 Búsqueda de Motivos Reguladores

```
1. ISM sobre región de interés
2. Identificar posiciones con alto score
3. Extraer secuencia y buscar en bases de datos de TF (JASPAR)
```

### 10.5 Análisis Multi-Tejido

```
1. Predecir para múltiples ontology_terms simultáneamente
2. Comparar expresión/accesibilidad entre tejidos
3. Identificar efectos tejido-específicos
```

---

## 11. LIMITACIONES CONOCIDAS

| Limitación | Impacto | Workaround |
|------------|---------|------------|
| Solo SNVs e indels pequeños | No SV grandes | Usar herramientas específicas de SV |
| Rate limit API | ~1M calls/día | Batch processing, caché |
| Sin GPU local | Dependencia de API | Esperar release de modelo local |
| Solo hg38/mm10 | No otros assemblies | Liftover si es necesario |
| Sin anotación funcional | Solo predicciones crudas | Integrar con VEP, ClinVar |

---

## 12. INTEGRACIONES RECOMENDADAS

| Herramienta | Propósito |
|-------------|-----------|
| **VEP (Ensembl)** | Anotación de variantes |
| **ClinVar** | Clasificación clínica |
| **JASPAR** | Motivos de TF |
| **GENCODE** | Anotación de genes |
| **GTEx** | Validación de eQTLs |
| **gnomAD** | Frecuencias poblacionales |

---

## 13. MÉTRICAS DE RENDIMIENTO

| Métrica | AlphaGenome | Mejor Competidor |
|---------|-------------|------------------|
| Variant effect (general) | 24/26 best | Variable |
| Expression QTL | SOTA | Enformer |
| Splicing | SOTA | SpliceAI |
| Chromatin | SOTA | Basenji2 |
| Contact maps | SOTA | Akita |

---

## RESUMEN DE CAPACIDADES PARA APLICACIÓN WEB

### Funcionalidades Core que DEBE tener la app:

1. **Predictor de Variantes**: Input variante → Score + visualización
2. **Explorador de Regiones**: Navegar genoma con tracks
3. **Comparador REF vs ALT**: Visualización lado a lado
4. **Análisis de Genes**: Expresión por tejido
5. **Análisis de Splicing**: Sitios y junciones
6. **ISM Explorer**: Identificar bases críticas
7. **Multi-Tissue Comparison**: Heatmaps de expresión
8. **Contact Map Viewer**: Estructura 3D
9. **Batch Upload**: VCF processing
10. **Export**: Reportes PDF, tracks BigWig

### Funcionalidades Avanzadas:

11. **eQTL Discovery**: Correlación variante-gen
12. **Enhancer Finder**: Búsqueda de elementos reguladores
13. **Motif Scanner**: Integración con JASPAR
14. **Clinical Report**: Integración VEP+ClinVar
15. **API Playground**: Explorar API interactivamente
