"""
Metadata API Routes

These endpoints provide reference data like available tissues,
output types, and gene information.
"""

from fastapi import APIRouter, Query
from typing import Annotated

from ..models import (
    MetadataResponse,
    OntologyTerm,
    GeneSearchRequest,
    GeneSearchResponse,
    GeneInfo,
)

router = APIRouter(prefix="/api/metadata", tags=["Metadata"])


# Common ontology terms (pre-defined for quick access)
COMMON_TISSUES = [
    OntologyTerm(code="UBERON:0000955", name="Brain", category="tissue"),
    OntologyTerm(code="UBERON:0000948", name="Heart", category="tissue"),
    OntologyTerm(code="UBERON:0002107", name="Liver", category="tissue"),
    OntologyTerm(code="UBERON:0002048", name="Lung", category="tissue"),
    OntologyTerm(code="UBERON:0002113", name="Kidney", category="tissue"),
    OntologyTerm(code="UBERON:0001157", name="Colon (Transverse)", category="tissue"),
    OntologyTerm(code="UBERON:0000178", name="Blood", category="tissue"),
    OntologyTerm(code="UBERON:0002097", name="Skin", category="tissue"),
    OntologyTerm(code="UBERON:0001134", name="Skeletal Muscle", category="tissue"),
    OntologyTerm(code="UBERON:0000945", name="Stomach", category="tissue"),
    OntologyTerm(code="UBERON:0001264", name="Pancreas", category="tissue"),
    OntologyTerm(code="UBERON:0002106", name="Spleen", category="tissue"),
    OntologyTerm(code="UBERON:0002046", name="Thyroid Gland", category="tissue"),
    OntologyTerm(code="UBERON:0002369", name="Adrenal Gland", category="tissue"),
    OntologyTerm(code="UBERON:0002367", name="Prostate", category="tissue"),
    OntologyTerm(code="UBERON:0000992", name="Ovary", category="tissue"),
    OntologyTerm(code="UBERON:0000473", name="Testis", category="tissue"),
    OntologyTerm(code="UBERON:0000310", name="Breast", category="tissue"),
    OntologyTerm(code="UBERON:0001114", name="Right Liver Lobe", category="tissue"),
    OntologyTerm(code="UBERON:0001155", name="Colon (Sigmoid)", category="tissue"),
]

COMMON_CELL_LINES = [
    OntologyTerm(code="EFO:0002067", name="K562 (Leukemia)", category="cell_line"),
    OntologyTerm(code="EFO:0001187", name="HepG2 (Liver Cancer)", category="cell_line"),
    OntologyTerm(code="EFO:0002784", name="GM12878 (Lymphoblastoid)", category="cell_line"),
    OntologyTerm(code="EFO:0001185", name="HeLa (Cervical Cancer)", category="cell_line"),
    OntologyTerm(code="EFO:0001086", name="A549 (Lung Cancer)", category="cell_line"),
    OntologyTerm(code="EFO:0002106", name="MCF-7 (Breast Cancer)", category="cell_line"),
]

OUTPUT_TYPES = [
    {
        "id": "RNA_SEQ",
        "name": "RNA Sequencing",
        "description": "Gene expression levels from RNA-seq data",
        "tracks": 667,
        "resolution": "1 bp",
    },
    {
        "id": "DNASE",
        "name": "DNase-seq",
        "description": "Chromatin accessibility from DNase I hypersensitivity",
        "tracks": 305,
        "resolution": "1 bp",
    },
    {
        "id": "ATAC",
        "name": "ATAC-seq",
        "description": "Chromatin accessibility from ATAC-seq",
        "tracks": 150,
        "resolution": "1 bp",
    },
    {
        "id": "CAGE",
        "name": "CAGE",
        "description": "Transcription start site activity",
        "tracks": 200,
        "resolution": "1 bp",
    },
    {
        "id": "CHIP_HISTONE",
        "name": "Histone ChIP-seq",
        "description": "Histone modification marks (H3K4me3, H3K27ac, etc.)",
        "tracks": 500,
        "resolution": "1 bp",
    },
    {
        "id": "CHIP_TF",
        "name": "TF ChIP-seq",
        "description": "Transcription factor binding sites",
        "tracks": 800,
        "resolution": "1 bp",
    },
    {
        "id": "SPLICE_SITES",
        "name": "Splice Sites",
        "description": "Donor and acceptor splice site probabilities",
        "tracks": 2,
        "resolution": "1 bp",
    },
    {
        "id": "SPLICE_SITE_USAGE",
        "name": "Splice Site Usage",
        "description": "Relative usage of each splice site",
        "tracks": 2,
        "resolution": "1 bp",
    },
    {
        "id": "SPLICE_JUNCTIONS",
        "name": "Splice Junctions",
        "description": "RNA-seq junction read counts",
        "tracks": 667,
        "resolution": "per junction",
    },
    {
        "id": "CONTACT_MAPS",
        "name": "Contact Maps",
        "description": "3D genome DNA-DNA contact frequencies",
        "tracks": 50,
        "resolution": "2D matrix",
    },
    {
        "id": "PROCAP",
        "name": "PRO-cap",
        "description": "Nascent transcription at TSS",
        "tracks": 100,
        "resolution": "1 bp",
    },
]


@router.get(
    "/ontologies",
    response_model=MetadataResponse,
    summary="Get available tissues and cell lines",
)
async def get_ontologies():
    """
    Get the list of available tissue types and cell lines.

    These ontology terms can be used in prediction requests
    to specify which tissues to analyze.
    """
    return MetadataResponse(
        tissues=COMMON_TISSUES,
        cell_lines=COMMON_CELL_LINES,
        output_types=OUTPUT_TYPES,
    )


@router.get(
    "/outputs",
    summary="Get available output types",
)
async def get_output_types():
    """
    Get the list of available prediction output types.

    Each output type represents a different functional readout
    that AlphaGenome can predict.
    """
    return {"outputs": OUTPUT_TYPES}


@router.get(
    "/tissues",
    summary="Get available tissues",
)
async def get_tissues(
    category: Annotated[
        str | None,
        Query(description="Filter by category: 'tissue' or 'cell_line'"),
    ] = None,
):
    """
    Get the list of available tissues and cell lines.

    Optionally filter by category.
    """
    all_terms = COMMON_TISSUES + COMMON_CELL_LINES

    if category:
        all_terms = [t for t in all_terms if t.category == category]

    return {"tissues": all_terms}


@router.get(
    "/genes/search",
    response_model=GeneSearchResponse,
    summary="Search for genes by symbol",
)
async def search_genes(
    query: Annotated[str, Query(min_length=2, max_length=50)],
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
):
    """
    Search for genes by symbol or partial name.

    This is useful for finding the correct gene to analyze.

    Note: This is a simplified implementation. In production,
    you would query GENCODE or Ensembl.
    """
    # Simplified gene data (in production, query GENCODE)
    # This is just example data
    sample_genes = [
        GeneInfo(
            gene_id="ENSG00000100320",
            gene_symbol="RBFOX2",
            chromosome="chr22",
            start=35677410,
            end=35750000,
            strand="-",
            gene_type="protein_coding",
        ),
        GeneInfo(
            gene_id="ENSG00000100336",
            gene_symbol="APOL4",
            chromosome="chr22",
            start=36180000,
            end=36220000,
            strand="-",
            gene_type="protein_coding",
        ),
        GeneInfo(
            gene_id="ENSG00000134243",
            gene_symbol="CYP2B6",
            chromosome="chr19",
            start=40991281,
            end=41018398,
            strand="+",
            gene_type="protein_coding",
        ),
        GeneInfo(
            gene_id="ENSG00000141510",
            gene_symbol="TP53",
            chromosome="chr17",
            start=7661779,
            end=7687538,
            strand="-",
            gene_type="protein_coding",
        ),
        GeneInfo(
            gene_id="ENSG00000171862",
            gene_symbol="PTEN",
            chromosome="chr10",
            start=87863438,
            end=87971930,
            strand="+",
            gene_type="protein_coding",
        ),
        GeneInfo(
            gene_id="ENSG00000012048",
            gene_symbol="BRCA1",
            chromosome="chr17",
            start=43044295,
            end=43170245,
            strand="-",
            gene_type="protein_coding",
        ),
    ]

    # Simple search
    query_upper = query.upper()
    matches = [
        g for g in sample_genes
        if query_upper in g.gene_symbol.upper() or query_upper in g.gene_id.upper()
    ]

    return GeneSearchResponse(
        success=True,
        query=query,
        results=matches[:limit],
        total=len(matches),
    )


@router.get(
    "/sequence-lengths",
    summary="Get supported sequence lengths",
)
async def get_sequence_lengths():
    """
    Get the supported sequence length options.

    Longer sequences provide more genomic context but take longer to process.
    """
    return {
        "lengths": [
            {
                "id": "16KB",
                "size": 16384,
                "description": "Fast analysis, good for ISM",
                "recommended_for": ["ISM", "small regions"],
            },
            {
                "id": "100KB",
                "size": 131072,
                "description": "Good for most gene-level analyses",
                "recommended_for": ["gene analysis", "promoter studies"],
            },
            {
                "id": "500KB",
                "size": 524288,
                "description": "Captures distant regulatory elements",
                "recommended_for": ["enhancer studies", "large genes"],
            },
            {
                "id": "1MB",
                "size": 1048576,
                "description": "Maximum context, captures TADs and long-range interactions",
                "recommended_for": ["eQTL analysis", "3D genome", "comprehensive analysis"],
            },
        ]
    }


@router.get(
    "/api-key-info",
    summary="How to get an API key",
)
async def get_api_key_info():
    """
    Information about how to obtain an AlphaGenome API key.

    The API key is FREE for non-commercial research use.
    """
    return {
        "title": "How to Get Your AlphaGenome API Key",
        "description": "AlphaGenome API keys are FREE for non-commercial research use.",
        "steps": [
            {
                "step": 1,
                "action": "Visit the AlphaGenome website",
                "url": "https://deepmind.google.com/science/alphagenome",
            },
            {
                "step": 2,
                "action": "Sign in with your Google account",
                "note": "Any Google account works",
            },
            {
                "step": 3,
                "action": "Request an API key",
                "note": "Approval is typically instant for research use",
            },
            {
                "step": 4,
                "action": "Copy your API key and paste it in the app",
                "note": "Your key is stored only in your browser, never on our servers",
            },
        ],
        "terms": {
            "free_for": "Non-commercial research use",
            "rate_limit": "~1 million predictions per day",
            "terms_url": "https://deepmind.google.com/science/alphagenome/terms",
        },
        "support": {
            "documentation": "https://www.alphagenomedocs.com/",
            "community": "https://www.alphagenomecommunity.com/",
            "email": "alphagenome@google.com",
        },
    }
