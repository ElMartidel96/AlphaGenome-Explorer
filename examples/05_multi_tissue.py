#!/usr/bin/env python3
"""
Ejemplo 5: Análisis multi-tejido
================================
Este script muestra cómo comparar predicciones de expresión
en múltiples tejidos simultáneamente.

Uso:
    python examples/05_multi_tissue.py
"""

import sys
sys.path.insert(0, '.')

from alphagenome_helper import create_client, list_common_ontologies
from alphagenome.data import genome
from alphagenome.models import dna_client


def main():
    print("=" * 60)
    print("EJEMPLO 5: Análisis Multi-Tejido")
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

    # Paso 2: Definir tejidos a comparar
    print("\n2. Tejidos a analizar:")
    tissues = {
        'Brain': 'UBERON:0000955',
        'Heart': 'UBERON:0000948',
        'Liver': 'UBERON:0002107',
        'Lung': 'UBERON:0002048',
        'Kidney': 'UBERON:0002113',
    }

    for name, code in tissues.items():
        print(f"   - {name}: {code}")

    # Paso 3: Definir región a analizar
    print("\n3. Región a analizar:")
    # Usamos una región del cromosoma 19 que contiene genes expresados
    # diferencialmente entre tejidos
    interval = genome.Interval(
        chromosome='chr19',
        start=1_000_000,
        end=1_100_000
    ).resize(dna_client.SEQUENCE_LENGTH_100KB)

    print(f"   Intervalo: {interval}")

    # Paso 4: Hacer predicciones para todos los tejidos
    print("\n4. Ejecutando predicciones para todos los tejidos...")

    ontology_terms = list(tissues.values())

    output = client.predict_interval(
        interval=interval,
        requested_outputs=[dna_client.OutputType.DNASE, dna_client.OutputType.RNA_SEQ],
        ontology_terms=ontology_terms,
    )

    print(f"   ✓ Predicciones completadas")

    # Paso 5: Analizar DNase (accesibilidad de cromatina)
    print("\n5. Análisis de accesibilidad de cromatina (DNase):")
    print("-" * 50)

    dnase_metadata = output.dnase.metadata
    dnase_values = output.dnase.values

    results_dnase = []
    for i, row in dnase_metadata.iterrows():
        ontology = row['ontology_curie'] if 'ontology_curie' in row else row.get('name', 'Unknown')
        mean_val = dnase_values[:, i].mean()
        max_val = dnase_values[:, i].max()
        results_dnase.append({
            'tissue': ontology,
            'mean': mean_val,
            'max': max_val
        })

    # Ordenar por expresión media
    results_dnase.sort(key=lambda x: x['mean'], reverse=True)

    for r in results_dnase:
        print(f"   {r['tissue']:30} mean: {r['mean']:.6f}  max: {r['max']:.6f}")

    # Paso 6: Analizar RNA-seq
    print("\n6. Análisis de expresión génica (RNA-seq):")
    print("-" * 50)

    rnaseq_metadata = output.rna_seq.metadata
    rnaseq_values = output.rna_seq.values

    # Agrupar por ontología (puede haber múltiples tracks por tejido)
    tissue_expression = {}
    for i, row in rnaseq_metadata.iterrows():
        ontology = row.get('ontology_curie', row.get('name', 'Unknown'))
        if ontology not in tissue_expression:
            tissue_expression[ontology] = []
        tissue_expression[ontology].append(rnaseq_values[:, i].mean())

    # Promediar por tejido
    results_rnaseq = []
    for ontology, values in tissue_expression.items():
        import numpy as np
        results_rnaseq.append({
            'tissue': ontology,
            'mean': np.mean(values),
            'n_tracks': len(values)
        })

    results_rnaseq.sort(key=lambda x: x['mean'], reverse=True)

    for r in results_rnaseq[:10]:  # Top 10
        print(f"   {r['tissue']:30} mean: {r['mean']:.6f}  ({r['n_tracks']} tracks)")

    # Paso 7: Resumen
    print("\n7. Resumen:")
    print("-" * 50)
    print(f"   Total DNase tracks: {output.dnase.values.shape[1]}")
    print(f"   Total RNA-seq tracks: {output.rna_seq.values.shape[1]}")
    print(f"   Posiciones analizadas: {output.dnase.values.shape[0]:,}")

    print("\n" + "=" * 60)
    print("¡Análisis multi-tejido completado!")
    print("=" * 60)


if __name__ == '__main__':
    main()
