"""
AlphaGenome Helper Module
=========================
Utilidades para simplificar el uso de AlphaGenome.

Uso:
    from alphagenome_helper import create_client, quick_predict_variant

    client = create_client()  # Lee API key de .env automáticamente
    result = quick_predict_variant(client, chromosome='chr22', position=36201698, ref='A', alt='C')
"""

import os
from pathlib import Path
from typing import Optional

# Intentar cargar python-dotenv si está disponible
try:
    from dotenv import load_dotenv
    _HAS_DOTENV = True
except ImportError:
    _HAS_DOTENV = False


def load_api_key(env_file: Optional[str] = None) -> str:
    """
    Carga la API key de AlphaGenome desde el archivo .env o variable de entorno.

    Args:
        env_file: Ruta al archivo .env (opcional, usa .env por defecto)

    Returns:
        La API key de AlphaGenome

    Raises:
        ValueError: Si no se encuentra la API key
    """
    # Determinar ruta del .env
    if env_file is None:
        env_file = Path(__file__).parent / '.env'
    else:
        env_file = Path(env_file)

    # Cargar .env si existe y python-dotenv está disponible
    if _HAS_DOTENV and env_file.exists():
        load_dotenv(env_file)
    elif env_file.exists():
        # Fallback: cargar .env manualmente
        with open(env_file, 'r') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, value = line.split('=', 1)
                    os.environ[key.strip()] = value.strip()

    # Obtener API key
    api_key = os.environ.get('ALPHAGENOME_API_KEY')

    if not api_key or api_key == 'YOUR_API_KEY_HERE':
        raise ValueError(
            "API key de AlphaGenome no configurada.\n\n"
            "Pasos para configurar:\n"
            "1. Obtén tu API key gratuita en: https://deepmind.google.com/science/alphagenome\n"
            "2. Copia .env.example a .env: cp .env.example .env\n"
            "3. Edita .env y reemplaza YOUR_API_KEY_HERE con tu API key"
        )

    return api_key


def create_client(api_key: Optional[str] = None):
    """
    Crea un cliente de AlphaGenome.

    Args:
        api_key: API key (opcional, se carga de .env si no se proporciona)

    Returns:
        Cliente DNA de AlphaGenome listo para usar
    """
    from alphagenome.models import dna_client

    if api_key is None:
        api_key = load_api_key()

    return dna_client.create(api_key)


def quick_predict_variant(
    client,
    chromosome: str,
    position: int,
    ref: str,
    alt: str,
    ontology_terms: Optional[list] = None,
    output_type: str = 'RNA_SEQ'
):
    """
    Predicción rápida del efecto de una variante genética.

    Args:
        client: Cliente de AlphaGenome (creado con create_client())
        chromosome: Cromosoma (ej: 'chr22')
        position: Posición en el genoma
        ref: Base de referencia
        alt: Base alternativa
        ontology_terms: Lista de términos de ontología (ej: ['UBERON:0001157'])
        output_type: Tipo de salida ('RNA_SEQ', 'DNASE', 'CAGE', etc.)

    Returns:
        Resultado de la predicción con .reference y .alternate
    """
    from alphagenome.data import genome
    from alphagenome.models import dna_client

    # Crear variante
    variant = genome.Variant(
        chromosome=chromosome,
        position=position,
        reference_bases=ref,
        alternate_bases=alt,
    )

    # Intervalo de 1MB centrado en la variante
    interval = variant.reference_interval.resize(dna_client.SEQUENCE_LENGTH_1MB)

    # Mapeo de tipos de salida
    output_types = {
        'ATAC': dna_client.OutputType.ATAC,
        'CAGE': dna_client.OutputType.CAGE,
        'DNASE': dna_client.OutputType.DNASE,
        'RNA_SEQ': dna_client.OutputType.RNA_SEQ,
        'CHIP_HISTONE': dna_client.OutputType.CHIP_HISTONE,
        'CHIP_TF': dna_client.OutputType.CHIP_TF,
        'SPLICE_SITES': dna_client.OutputType.SPLICE_SITES,
        'SPLICE_SITE_USAGE': dna_client.OutputType.SPLICE_SITE_USAGE,
        'SPLICE_JUNCTIONS': dna_client.OutputType.SPLICE_JUNCTIONS,
        'CONTACT_MAPS': dna_client.OutputType.CONTACT_MAPS,
        'PROCAP': dna_client.OutputType.PROCAP,
    }

    # Ontology terms por defecto (varios tejidos comunes)
    if ontology_terms is None:
        ontology_terms = ['UBERON:0001157']  # Colon - Transverse

    # Hacer predicción
    return client.predict_variant(
        interval=interval,
        variant=variant,
        ontology_terms=ontology_terms,
        requested_outputs=[output_types[output_type]],
    )


def list_output_types():
    """Lista todos los tipos de salida disponibles en AlphaGenome."""
    from alphagenome.models import dna_client
    return [output.name for output in dna_client.OutputType]


def list_common_ontologies():
    """
    Devuelve un diccionario con términos de ontología comunes.

    Returns:
        Dict con nombre legible -> código de ontología
    """
    return {
        # Tejidos principales
        'Brain': 'UBERON:0000955',
        'Heart': 'UBERON:0000948',
        'Liver': 'UBERON:0002107',
        'Lung': 'UBERON:0002048',
        'Kidney': 'UBERON:0002113',
        'Skin': 'UBERON:0002097',
        'Blood': 'UBERON:0000178',
        'Muscle': 'UBERON:0001134',
        'Colon Transverse': 'UBERON:0001157',
        'Stomach': 'UBERON:0000945',
        'Pancreas': 'UBERON:0001264',
        'Spleen': 'UBERON:0002106',
        'Thyroid': 'UBERON:0002046',
        'Adrenal Gland': 'UBERON:0002369',
        'Prostate': 'UBERON:0002367',
        'Ovary': 'UBERON:0000992',
        'Testis': 'UBERON:0000473',
        'Breast': 'UBERON:0000310',
        # Células
        'K562 (Leukemia cell line)': 'EFO:0002067',
        'HepG2 (Liver cancer cell line)': 'EFO:0001187',
        'GM12878 (Lymphoblastoid)': 'EFO:0002784',
    }


# Información de ayuda
HELP_TEXT = """
=== AlphaGenome Helper ===

FUNCIONES PRINCIPALES:
- create_client(): Crea cliente con API key de .env
- quick_predict_variant(): Predicción rápida de variante
- list_output_types(): Lista tipos de salida disponibles
- list_common_ontologies(): Términos de ontología comunes

EJEMPLO BÁSICO:
    from alphagenome_helper import create_client, quick_predict_variant

    client = create_client()
    result = quick_predict_variant(
        client,
        chromosome='chr22',
        position=36201698,
        ref='A',
        alt='C',
        ontology_terms=['UBERON:0001157'],  # Colon
        output_type='RNA_SEQ'
    )

    # Acceder a las predicciones
    ref_values = result.reference.rna_seq.values
    alt_values = result.alternate.rna_seq.values

TIPOS DE SALIDA DISPONIBLES:
- ATAC: Accesibilidad de cromatina (ATAC-seq)
- CAGE: Expression de genes por CAGE
- DNASE: Accesibilidad de cromatina (DNase-seq)
- RNA_SEQ: Expresión de genes por RNA-seq
- CHIP_HISTONE: Modificaciones de histonas
- CHIP_TF: Factores de transcripción
- SPLICE_SITES: Sitios de splicing
- SPLICE_SITE_USAGE: Uso de sitios de splicing
- SPLICE_JUNCTIONS: Junciones de splicing
- CONTACT_MAPS: Mapas de contacto 3D
- PROCAP: Expression por PRO-cap

DOCUMENTACIÓN COMPLETA:
https://www.alphagenomedocs.com/
"""


def help():
    """Muestra ayuda sobre el helper de AlphaGenome."""
    print(HELP_TEXT)


if __name__ == '__main__':
    help()
