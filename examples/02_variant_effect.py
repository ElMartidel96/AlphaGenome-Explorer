#!/usr/bin/env python3
"""
Ejemplo 2: Predicción de efecto de variante
===========================================
Este script muestra cómo predecir el efecto de una variante genética
en la expresión de genes.

Uso:
    python examples/02_variant_effect.py
"""

import sys
sys.path.insert(0, '.')

from alphagenome_helper import create_client, quick_predict_variant


def main():
    print("=" * 60)
    print("EJEMPLO 2: Predicción de Efecto de Variante")
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

    # Paso 2: Definir variante a analizar
    print("\n2. Variante a analizar:")
    print("   Cromosoma: chr22")
    print("   Posición: 36201698")
    print("   Cambio: A → C")
    print("   Tejido: Colon transverso (UBERON:0001157)")

    # Esta es una variante conocida que afecta expresión génica en colon
    # relacionada con el gen APOL4

    # Paso 3: Hacer predicción
    print("\n3. Ejecutando predicción...")
    result = quick_predict_variant(
        client,
        chromosome='chr22',
        position=36201698,
        ref='A',
        alt='C',
        ontology_terms=['UBERON:0001157'],  # Colon
        output_type='RNA_SEQ'
    )

    print("   ✓ Predicción completada")

    # Paso 4: Analizar resultados
    print("\n4. Resultados:")
    ref_values = result.reference.rna_seq.values
    alt_values = result.alternate.rna_seq.values

    print(f"   Shape REF: {ref_values.shape}")
    print(f"   Shape ALT: {alt_values.shape}")

    # Calcular diferencia
    diff = alt_values - ref_values

    print(f"\n5. Análisis de diferencias (ALT - REF):")
    print(f"   Max diferencia positiva: {diff.max():.6f}")
    print(f"   Max diferencia negativa: {diff.min():.6f}")
    print(f"   Diferencia promedio: {diff.mean():.6f}")
    print(f"   Diferencia absoluta total: {abs(diff).sum():.2f}")

    # Identificar región más afectada
    import numpy as np
    max_diff_pos = np.argmax(np.abs(diff.sum(axis=1)))
    print(f"\n6. Posición más afectada:")
    print(f"   Índice: {max_diff_pos}")
    print(f"   REF en esa posición: {ref_values[max_diff_pos].mean():.6f}")
    print(f"   ALT en esa posición: {alt_values[max_diff_pos].mean():.6f}")

    print("\n" + "=" * 60)
    print("¡Análisis completado!")
    print("=" * 60)
    print("\nNota: Esta variante (chr22:36201698:A>C) está asociada con")
    print("cambios en la expresión y splicing del gen APOL4 en colon.")


if __name__ == '__main__':
    main()
