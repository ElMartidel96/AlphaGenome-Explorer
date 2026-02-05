#!/usr/bin/env python3
"""
Ejemplo 3: Scoring de variantes con AlphaGenome
===============================================
Este script muestra cómo calcular scores de efecto de variantes
usando los scorers recomendados.

Uso:
    python examples/03_variant_scoring.py
"""

import sys
sys.path.insert(0, '.')

from alphagenome_helper import create_client, load_api_key
from alphagenome.data import genome
from alphagenome.models import dna_client, variant_scorers


def main():
    print("=" * 60)
    print("EJEMPLO 3: Scoring de Variantes")
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

    # Paso 2: Definir variante
    print("\n2. Definiendo variante...")
    variant = genome.Variant(
        chromosome='chr22',
        position=36201698,
        reference_bases='A',
        alternate_bases='C',
    )
    print(f"   Variante: {variant}")

    # Paso 3: Crear intervalo
    print("\n3. Creando intervalo de análisis...")
    interval = variant.reference_interval.resize(dna_client.SEQUENCE_LENGTH_1MB)
    print(f"   Intervalo: {interval}")

    # Paso 4: Obtener scorer recomendado
    print("\n4. Scorers recomendados disponibles:")
    for name in variant_scorers.RECOMMENDED_VARIANT_SCORERS.keys():
        print(f"   - {name}")

    # Usar scorer de RNA-seq
    scorer = variant_scorers.RECOMMENDED_VARIANT_SCORERS['RNA_SEQ']
    print(f"\n   Usando scorer: {type(scorer).__name__}")

    # Paso 5: Calcular scores
    print("\n5. Calculando scores...")
    scores_list = client.score_variant(
        interval=interval,
        variant=variant,
        variant_scorers=[scorer]
    )

    scores = scores_list[0]
    print(f"   ✓ Scores calculados")
    print(f"   Shape: {scores.X.shape}")
    print(f"   Genes analizados: {scores.n_obs}")
    print(f"   Tracks de RNA-seq: {scores.n_vars}")

    # Paso 6: Convertir a formato tabular
    print("\n6. Convirtiendo a formato tabular...")
    scores_df = variant_scorers.tidy_scores([scores], match_gene_strand=True)
    print(f"   Total de scores: {len(scores_df)}")

    # Paso 7: Encontrar genes más afectados
    print("\n7. Top 10 genes más afectados (por raw_score):")
    print("-" * 50)

    # Agrupar por gen y tomar el score máximo
    gene_scores = scores_df.groupby('gene_name').agg({
        'raw_score': 'max',
        'quantile_score': 'max'
    }).reset_index()

    gene_scores = gene_scores.nlargest(10, 'raw_score')

    for idx, row in gene_scores.iterrows():
        print(f"   {row['gene_name']:15} raw: {row['raw_score']:+.6f}  quantile: {row['quantile_score']:.4f}")

    # Paso 8: Interpretación
    print("\n8. Interpretación de scores:")
    print("   - raw_score: Log fold change entre ALT y REF")
    print("   - quantile_score: Percentil vs variantes comunes")
    print("   - Valores altos → mayor efecto de la variante")

    print("\n" + "=" * 60)
    print("¡Scoring completado!")
    print("=" * 60)


if __name__ == '__main__':
    main()
