#!/usr/bin/env python3
"""
Ejemplo 4: Análisis de un gen específico
========================================
Este script muestra cómo analizar la expresión de un gen específico
(CYP2B6) en hígado usando AlphaGenome.

CYP2B6 codifica una enzima del citocromo P450 importante en el
metabolismo de fármacos, principalmente expresada en hígado.

Uso:
    python examples/04_gene_analysis.py
"""

import sys
sys.path.insert(0, '.')

from alphagenome_helper import create_client
from alphagenome.data import gene_annotation, genome
from alphagenome.models import dna_client
import pandas as pd


def main():
    print("=" * 60)
    print("EJEMPLO 4: Análisis del Gen CYP2B6")
    print("=" * 60)
    print()

    # Paso 1: Crear cliente
    print("1. Creando cliente...")
    try:
        client = create_client()
        print("   ✓ Cliente creado")
    except ValueError as e:
        print(f"   ✗ Error: {e}")
        return

    # Paso 2: Cargar anotaciones de genes
    print("\n2. Cargando anotaciones de GENCODE...")
    gtf = pd.read_feather(
        'https://storage.googleapis.com/alphagenome/reference/gencode/'
        'hg38/gencode.v46.annotation.gtf.gz.feather'
    )
    print(f"   ✓ Cargadas {len(gtf)} anotaciones")

    # Paso 3: Buscar el gen CYP2B6
    print("\n3. Buscando gen CYP2B6...")
    interval = gene_annotation.get_gene_interval(gtf, gene_symbol='CYP2B6')
    print(f"   Localización: {interval}")
    print(f"   Cromosoma: {interval.chromosome}")
    print(f"   Inicio: {interval.start:,}")
    print(f"   Fin: {interval.end:,}")
    print(f"   Strand: {interval.strand}")
    print(f"   Longitud: {interval.width:,} bp")

    # Paso 4: Redimensionar a 1MB para predicción
    print("\n4. Preparando intervalo de 1MB...")
    interval_1mb = interval.resize(dna_client.SEQUENCE_LENGTH_1MB)
    print(f"   Intervalo extendido: {interval_1mb}")

    # Paso 5: Hacer predicción de RNA-seq en hígado
    print("\n5. Prediciendo expresión RNA-seq...")
    print("   Tejido: Right liver lobe (UBERON:0001114)")

    output = client.predict_interval(
        interval=interval_1mb,
        requested_outputs=[dna_client.OutputType.RNA_SEQ],
        ontology_terms=['UBERON:0001114'],  # Right liver lobe
    )

    print(f"   ✓ Predicción completada")
    print(f"   Shape: {output.rna_seq.values.shape}")
    print(f"   Tracks: {output.rna_seq.metadata.shape[0]}")

    # Paso 6: Analizar resultados
    print("\n6. Análisis de la predicción:")

    values = output.rna_seq.values
    metadata = output.rna_seq.metadata

    print(f"\n   Metadata de tracks:")
    print(f"   {metadata[['name', 'strand']].to_string()}")

    # Calcular expresión en la región del gen
    # El gen está entre start y end del intervalo original
    gene_start_idx = interval.start - interval_1mb.start
    gene_end_idx = interval.end - interval_1mb.start

    gene_region_values = values[gene_start_idx:gene_end_idx]

    print(f"\n   Expresión en región del gen CYP2B6:")
    print(f"   Posiciones analizadas: {gene_region_values.shape[0]:,}")

    # Separar por strand
    for i, row in metadata.iterrows():
        strand = row['strand']
        track_values = gene_region_values[:, i]
        print(f"\n   Track {i+1} ({strand} strand):")
        print(f"     Mean: {track_values.mean():.6f}")
        print(f"     Max: {track_values.max():.6f}")
        print(f"     Sum: {track_values.sum():.2f}")

    # Paso 7: Comparar con expresión en cerebro (control negativo)
    print("\n7. Comparando con expresión en cerebro (control)...")

    output_brain = client.predict_interval(
        interval=interval_1mb,
        requested_outputs=[dna_client.OutputType.RNA_SEQ],
        ontology_terms=['UBERON:0000955'],  # Brain
    )

    brain_values = output_brain.rna_seq.values[gene_start_idx:gene_end_idx]
    liver_values = gene_region_values

    print(f"\n   Expresión media en región del gen:")
    print(f"     Hígado: {liver_values.mean():.6f}")
    print(f"     Cerebro: {brain_values.mean():.6f}")
    print(f"     Ratio hígado/cerebro: {liver_values.mean() / max(brain_values.mean(), 1e-10):.2f}x")

    print("\n" + "=" * 60)
    print("¡Análisis completado!")
    print("=" * 60)
    print("\nNota: CYP2B6 es un gen que se expresa principalmente en hígado")
    print("y está involucrado en el metabolismo de muchos fármacos.")


if __name__ == '__main__':
    main()
