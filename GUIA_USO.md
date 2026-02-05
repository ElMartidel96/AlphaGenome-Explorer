# Guía de Uso de AlphaGenome

## Qué es AlphaGenome

AlphaGenome es la herramienta de IA de Google DeepMind especializada en genómica que predice cómo variantes o mutaciones en secuencias de ADN humano impactan procesos biológicos. Puede analizar secuencias de hasta **1 millón de pares de bases** con resolución de un solo par de bases.

### Capacidades principales:
- **Expresión génica (RNA-seq, CAGE)**: Predice niveles de expresión de genes
- **Accesibilidad de cromatina (ATAC-seq, DNase-seq)**: Regiones abiertas del ADN
- **Modificaciones de histonas (ChIP-seq)**: Marcas epigenéticas
- **Splicing**: Sitios y junciones de splicing
- **Mapas de contacto 3D**: Estructura tridimensional del genoma

---

## Configuración Inicial

### Paso 1: Obtener API Key (OBLIGATORIO)

1. Visita: https://deepmind.google.com/science/alphagenome
2. Inicia sesión con tu cuenta de Google
3. Obtén tu API key gratuita (uso no comercial)
4. Guarda la key de forma segura

### Paso 2: Configurar API Key

```bash
# Copia el archivo de ejemplo
cp .env.example .env

# Edita .env con tu editor favorito
nano .env  # o: code .env, vim .env, etc.

# Reemplaza YOUR_API_KEY_HERE con tu API key real
```

### Paso 3: Activar Entorno

```bash
# Desde el directorio AlphaGenome
source activate.sh

# Verificar instalación
python test_installation.py
```

---

## Uso Básico

### Iniciar Python con AlphaGenome

```bash
source activate.sh
python
```

### Ejemplo 1: Crear cliente y hacer predicción simple

```python
from alphagenome_helper import create_client, list_output_types

# Crear cliente (lee API key de .env automáticamente)
client = create_client()

# Ver tipos de salida disponibles
print(list_output_types())
# ['ATAC', 'CAGE', 'DNASE', 'RNA_SEQ', 'CHIP_HISTONE', ...]
```

### Ejemplo 2: Predecir efecto de una variante

```python
from alphagenome_helper import create_client, quick_predict_variant, list_common_ontologies

client = create_client()

# Ver tejidos disponibles
print(list_common_ontologies())

# Predecir efecto de variante en colon
result = quick_predict_variant(
    client,
    chromosome='chr22',
    position=36201698,
    ref='A',
    alt='C',
    ontology_terms=['UBERON:0001157'],  # Colon
    output_type='RNA_SEQ'
)

# Acceder a predicciones
print("REF shape:", result.reference.rna_seq.values.shape)
print("ALT shape:", result.alternate.rna_seq.values.shape)
```

### Ejemplo 3: Uso directo de la API

```python
from alphagenome.data import genome
from alphagenome.models import dna_client
from alphagenome_helper import load_api_key

# Crear cliente
model = dna_client.create(load_api_key())

# Definir intervalo genómico de 1MB
interval = genome.Interval(
    chromosome='chr19',
    start=40500000,
    end=41548576
)

# Hacer predicción de DNase-seq en pulmón
output = model.predict_interval(
    interval=interval,
    requested_outputs=[dna_client.OutputType.DNASE],
    ontology_terms=['UBERON:0002048'],  # Lung
)

print("Predicción shape:", output.dnase.values.shape)
print("Metadata:", output.dnase.metadata)
```

---

## Visualización

### Ejemplo 4: Visualizar predicciones

```python
from alphagenome.visualization import plot_components
from alphagenome.data import gene_annotation, transcript as transcript_utils
import matplotlib.pyplot as plt
import pandas as pd

# Cargar anotaciones de genes (GENCODE)
gtf = pd.read_feather(
    'https://storage.googleapis.com/alphagenome/reference/gencode/'
    'hg38/gencode.v46.annotation.gtf.gz.feather'
)

# Filtrar a transcripts MANE select
gtf_transcripts = gene_annotation.filter_protein_coding(gtf)
gtf_transcripts = gene_annotation.filter_to_mane_select_transcript(gtf_transcripts)
transcript_extractor = transcript_utils.TranscriptExtractor(gtf_transcripts)

# Extraer transcripts en el intervalo
transcripts = transcript_extractor.extract(interval)

# Crear visualización
plot_components.plot(
    components=[
        plot_components.TranscriptAnnotation(transcripts),
        plot_components.Tracks(output.dnase),
    ],
    interval=output.dnase.interval,
)

plt.savefig('output/prediccion_dnase.png', dpi=150, bbox_inches='tight')
plt.show()
```

### Ejemplo 5: Comparar REF vs ALT

```python
from alphagenome_helper import create_client
from alphagenome.data import genome
from alphagenome.models import dna_client
from alphagenome.visualization import plot_components
import matplotlib.pyplot as plt

client = create_client()

# Definir variante
variant = genome.Variant(
    chromosome='chr22',
    position=36201698,
    reference_bases='A',
    alternate_bases='C',
)

interval = variant.reference_interval.resize(dna_client.SEQUENCE_LENGTH_1MB)

# Predecir
result = client.predict_variant(
    interval=interval,
    variant=variant,
    requested_outputs=[dna_client.OutputType.RNA_SEQ],
    ontology_terms=['UBERON:0001157'],  # Colon
)

# Visualizar comparación
plot_components.plot(
    [
        plot_components.OverlaidTracks(
            tdata={
                'REF': result.reference.rna_seq,
                'ALT': result.alternate.rna_seq,
            },
            colors={'REF': 'dimgrey', 'ALT': 'red'},
        ),
    ],
    interval=result.reference.rna_seq.interval.resize(2**15),
    annotations=[plot_components.VariantAnnotation([variant], alpha=0.8)],
)

plt.savefig('output/comparacion_ref_alt.png', dpi=150, bbox_inches='tight')
plt.show()
```

---

## Variant Scoring

### Ejemplo 6: Puntuar efecto de variante

```python
from alphagenome_helper import create_client
from alphagenome.data import genome
from alphagenome.models import dna_client, variant_scorers

client = create_client()

# Variante a evaluar
variant = genome.Variant(
    chromosome='chr22',
    position=36201698,
    reference_bases='A',
    alternate_bases='C',
)

interval = variant.reference_interval.resize(dna_client.SEQUENCE_LENGTH_1MB)

# Usar scorer recomendado para RNA-seq
scorer = variant_scorers.RECOMMENDED_VARIANT_SCORERS['RNA_SEQ']

# Calcular scores
scores = client.score_variant(
    interval=interval,
    variant=variant,
    variant_scorers=[scorer]
)

# Ver scores
scores_df = variant_scorers.tidy_scores(scores, match_gene_strand=True)
print(scores_df.head(20))

# Filtrar genes más afectados
top_affected = scores_df.nlargest(10, 'raw_score')
print("Genes más afectados:")
print(top_affected[['gene_name', 'raw_score', 'quantile_score']])
```

---

## In Silico Mutagenesis (ISM)

### Ejemplo 7: Análisis ISM

```python
from alphagenome_helper import create_client
from alphagenome.data import genome
from alphagenome.models import dna_client, variant_scorers
from alphagenome.interpretation import ism
from alphagenome.visualization import plot_components
import matplotlib.pyplot as plt

client = create_client()

# Intervalo de contexto (16KB)
sequence_interval = genome.Interval('chr20', 3_753_000, 3_753_400)
sequence_interval = sequence_interval.resize(dna_client.SEQUENCE_LENGTH_16KB)

# Región a mutar (256 bases)
ism_interval = sequence_interval.resize(256)

# Scorer para DNase
dnase_scorer = variant_scorers.CenterMaskScorer(
    requested_output=dna_client.OutputType.DNASE,
    width=501,
    aggregation_type=variant_scorers.AggregationType.DIFF_MEAN,
)

# Ejecutar ISM
variant_scores = client.score_ism_variants(
    interval=sequence_interval,
    ism_interval=ism_interval,
    variant_scorers=[dnase_scorer],
)

# Extraer scores para K562
def extract_k562(adata):
    values = adata.X[:, adata.var['ontology_curie'] == 'EFO:0002067']
    return values.flatten()[0] if values.size == 1 else 0

ism_result = ism.ism_matrix(
    [extract_k562(x[0]) for x in variant_scores],
    variants=[v[0].uns['variant'] for v in variant_scores],
)

# Visualizar como sequence logo
plot_components.plot(
    [
        plot_components.SeqLogo(
            scores=ism_result,
            scores_interval=ism_interval,
            ylabel='ISM K562 DNase',
        )
    ],
    interval=ism_interval,
    fig_width=35,
)

plt.savefig('output/ism_analysis.png', dpi=150, bbox_inches='tight')
plt.show()
```

---

## Predicciones para Ratón

```python
from alphagenome_helper import create_client
from alphagenome.data import genome
from alphagenome.models import dna_client

client = create_client()

# Intervalo en genoma de ratón
interval = genome.Interval('chr1', 3_000_000, 3_000_001)
interval = interval.resize(dna_client.SEQUENCE_LENGTH_1MB)

# Especificar organismo como ratón
output = client.predict_interval(
    interval=interval,
    organism=dna_client.Organism.MUS_MUSCULUS,
    requested_outputs=[dna_client.OutputType.RNA_SEQ],
    ontology_terms=['UBERON:0002048'],  # Lung
)

print("Shape:", output.rna_seq.values.shape)
```

---

## Longitudes de Secuencia Soportadas

| Constante | Longitud | Uso típico |
|-----------|----------|------------|
| `SEQUENCE_LENGTH_16KB` | 16,384 bp | ISM, análisis rápidos |
| `SEQUENCE_LENGTH_100KB` | 100,000 bp | Análisis de genes |
| `SEQUENCE_LENGTH_500KB` | 500,000 bp | Análisis de regiones |
| `SEQUENCE_LENGTH_1MB` | 1,048,576 bp | Análisis completos |

---

## Términos de Ontología Comunes

### Tejidos (UBERON)
| Nombre | Código |
|--------|--------|
| Brain | UBERON:0000955 |
| Heart | UBERON:0000948 |
| Liver | UBERON:0002107 |
| Lung | UBERON:0002048 |
| Kidney | UBERON:0002113 |
| Colon (Transverse) | UBERON:0001157 |
| Skin | UBERON:0002097 |
| Muscle | UBERON:0001134 |

### Líneas celulares (EFO)
| Nombre | Código |
|--------|--------|
| K562 (Leukemia) | EFO:0002067 |
| HepG2 (Liver cancer) | EFO:0001187 |
| GM12878 (Lymphoblastoid) | EFO:0002784 |

---

## Recursos

- **Documentación oficial**: https://www.alphagenomedocs.com/
- **GitHub**: https://github.com/google-deepmind/alphagenome
- **Paper**: Avsec et al. Nature 2026 (doi:10.1038/s41586-025-10014-0)
- **Comunidad**: https://www.alphagenomecommunity.com
- **Contacto**: alphagenome@google.com

---

## Solución de Problemas

### Error: "API key no configurada"
1. Obtén tu API key de https://deepmind.google.com/science/alphagenome
2. Copia `.env.example` a `.env`
3. Edita `.env` y agrega tu API key

### Error: "Rate limit exceeded"
- La API gratuita tiene límites de uso
- Reduce la frecuencia de llamadas
- Considera usar batch predictions para múltiples variantes

### Memoria insuficiente
- Usa secuencias más cortas (16KB o 100KB en lugar de 1MB)
- Reduce el número de ontology_terms simultáneos
- Procesa variantes en lotes más pequeños

### Error de conexión gRPC
- Verifica tu conexión a internet
- Algunos firewalls corporativos pueden bloquear gRPC
- Intenta más tarde (el servicio puede estar en mantenimiento)
