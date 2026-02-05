#!/usr/bin/env python3
"""
Ejemplo 1: Predicción básica con AlphaGenome
============================================
Este script muestra cómo hacer una predicción básica de expresión génica.

Uso:
    python examples/01_basic_prediction.py
"""

import sys
sys.path.insert(0, '.')

from alphagenome_helper import create_client, list_output_types, list_common_ontologies


def main():
    print("=" * 60)
    print("EJEMPLO 1: Predicción Básica con AlphaGenome")
    print("=" * 60)
    print()

    # Paso 1: Crear cliente
    print("1. Creando cliente...")
    try:
        client = create_client()
        print("   ✓ Cliente creado exitosamente")
    except ValueError as e:
        print(f"   ✗ Error: {e}")
        return

    # Paso 2: Mostrar tipos de salida disponibles
    print("\n2. Tipos de salida disponibles:")
    for output_type in list_output_types():
        print(f"   - {output_type}")

    # Paso 3: Mostrar ontologías comunes
    print("\n3. Tejidos/células disponibles (ejemplos):")
    ontologies = list_common_ontologies()
    for name, code in list(ontologies.items())[:10]:
        print(f"   - {name}: {code}")

    # Paso 4: Hacer una predicción simple
    print("\n4. Haciendo predicción de ejemplo...")
    print("   Tejido: Lung (UBERON:0002048)")
    print("   Tipo: DNase-seq (accesibilidad de cromatina)")

    from alphagenome.models import dna_client as dc

    # Predecir para una secuencia simple
    output = client.predict_sequence(
        sequence='GATTACA'.center(dc.SEQUENCE_LENGTH_16KB, 'N'),
        requested_outputs=[dc.OutputType.DNASE],
        ontology_terms=['UBERON:0002048'],  # Lung
    )

    print(f"\n   ✓ Predicción completada!")
    print(f"   Shape de salida: {output.dnase.values.shape}")
    print(f"   Metadata: {output.dnase.metadata.shape[0]} tracks")

    # Estadísticas básicas
    values = output.dnase.values
    print(f"\n5. Estadísticas de la predicción:")
    print(f"   Min: {values.min():.6f}")
    print(f"   Max: {values.max():.6f}")
    print(f"   Mean: {values.mean():.6f}")

    print("\n" + "=" * 60)
    print("¡Ejemplo completado exitosamente!")
    print("=" * 60)


if __name__ == '__main__':
    main()
