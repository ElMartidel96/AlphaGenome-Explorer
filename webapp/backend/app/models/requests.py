"""
Pydantic models for API requests
"""

from pydantic import BaseModel, Field, field_validator
from typing import Literal
from enum import Enum
import re


class OutputType(str, Enum):
    """Available AlphaGenome output types."""
    ATAC = "ATAC"
    CAGE = "CAGE"
    DNASE = "DNASE"
    RNA_SEQ = "RNA_SEQ"
    CHIP_HISTONE = "CHIP_HISTONE"
    CHIP_TF = "CHIP_TF"
    SPLICE_SITES = "SPLICE_SITES"
    SPLICE_SITE_USAGE = "SPLICE_SITE_USAGE"
    SPLICE_JUNCTIONS = "SPLICE_JUNCTIONS"
    CONTACT_MAPS = "CONTACT_MAPS"
    PROCAP = "PROCAP"


class SequenceLength(str, Enum):
    """Supported sequence lengths."""
    LENGTH_16KB = "16KB"
    LENGTH_100KB = "100KB"
    LENGTH_500KB = "500KB"
    LENGTH_1MB = "1MB"


class Organism(str, Enum):
    """Supported organisms."""
    HUMAN = "HOMO_SAPIENS"
    MOUSE = "MUS_MUSCULUS"


class ScorerType(str, Enum):
    """Available variant scorers."""
    RNA_SEQ = "RNA_SEQ"
    DNASE = "DNASE"
    ATAC = "ATAC"
    SPLICING = "SPLICING"
    CONTACT_MAP = "CONTACT_MAP"


class ExportFormat(str, Enum):
    """Available export formats."""
    JSON = "json"
    CSV = "csv"
    TSV = "tsv"
    MARKDOWN = "markdown"
    PDF = "pdf"
    VCF = "vcf"
    EXCEL = "xlsx"


# ============ Request Models ============

class VariantPredictRequest(BaseModel):
    """Request model for variant prediction."""

    variant: str = Field(
        ...,
        description="Variant in format chr:position:ref>alt (e.g., chr22:36201698:A>C)",
        examples=["chr22:36201698:A>C", "chr19:40991281:G>T"]
    )
    outputs: list[OutputType] = Field(
        default=[OutputType.RNA_SEQ],
        description="Output types to predict",
        min_length=1,
        max_length=11
    )
    tissues: list[str] = Field(
        default=["UBERON:0001157"],
        description="Ontology terms for tissues/cell types",
        max_length=20
    )
    sequence_length: SequenceLength = Field(
        default=SequenceLength.LENGTH_1MB,
        description="Context sequence length"
    )
    organism: Organism = Field(
        default=Organism.HUMAN,
        description="Target organism"
    )

    @field_validator('variant')
    @classmethod
    def validate_variant_format(cls, v: str) -> str:
        """Validate variant format."""
        # Pattern: chr[1-22,X,Y]:position:ref>alt
        pattern = r'^chr[\dXY]+:\d+:[ACGTN]+>[ACGTN]+$'
        if not re.match(pattern, v, re.IGNORECASE):
            raise ValueError(
                f"Invalid variant format: {v}. "
                "Expected format: chr22:36201698:A>C"
            )
        return v

    @field_validator('tissues')
    @classmethod
    def validate_tissues(cls, v: list[str]) -> list[str]:
        """Validate ontology terms."""
        for term in v:
            if not re.match(r'^[A-Z]+:\d+$', term):
                raise ValueError(
                    f"Invalid ontology term: {term}. "
                    "Expected format: UBERON:0001157"
                )
        return v


class IntervalPredictRequest(BaseModel):
    """Request model for interval prediction."""

    chromosome: str = Field(
        ...,
        description="Chromosome (e.g., chr19)",
        examples=["chr19", "chr22"]
    )
    start: int = Field(
        ...,
        ge=0,
        description="Start position (0-based)"
    )
    end: int = Field(
        ...,
        ge=1,
        description="End position (exclusive)"
    )
    outputs: list[OutputType] = Field(
        default=[OutputType.RNA_SEQ],
        min_length=1
    )
    tissues: list[str] = Field(
        default=["UBERON:0001157"]
    )
    organism: Organism = Field(
        default=Organism.HUMAN
    )

    @field_validator('chromosome')
    @classmethod
    def validate_chromosome(cls, v: str) -> str:
        """Validate chromosome format."""
        if not re.match(r'^chr[\dXY]+$', v, re.IGNORECASE):
            raise ValueError(f"Invalid chromosome: {v}")
        return v


class VariantScoreRequest(BaseModel):
    """Request model for variant scoring."""

    variant: str = Field(
        ...,
        description="Variant notation"
    )
    scorers: list[ScorerType] = Field(
        default=[ScorerType.RNA_SEQ],
        description="Scoring methods to use"
    )
    sequence_length: SequenceLength = Field(
        default=SequenceLength.LENGTH_1MB
    )
    organism: Organism = Field(
        default=Organism.HUMAN
    )

    @field_validator('variant')
    @classmethod
    def validate_variant_format(cls, v: str) -> str:
        pattern = r'^chr[\dXY]+:\d+:[ACGTN]+>[ACGTN]+$'
        if not re.match(pattern, v, re.IGNORECASE):
            raise ValueError(f"Invalid variant format: {v}")
        return v


class ISMRequest(BaseModel):
    """Request model for in silico mutagenesis."""

    chromosome: str
    start: int = Field(..., ge=0)
    end: int = Field(..., ge=1)
    ism_width: int = Field(
        default=256,
        ge=10,
        le=1000,
        description="Width of region to mutate (in bp)"
    )
    scorer: ScorerType = Field(
        default=ScorerType.DNASE
    )
    tissue: str = Field(
        default="EFO:0002067",
        description="Single tissue/cell line for scoring"
    )
    sequence_length: SequenceLength = Field(
        default=SequenceLength.LENGTH_16KB
    )
    organism: Organism = Field(
        default=Organism.HUMAN
    )


class GeneSearchRequest(BaseModel):
    """Request model for gene search."""

    query: str = Field(
        ...,
        min_length=2,
        max_length=50,
        description="Gene symbol or partial name"
    )
    organism: Organism = Field(
        default=Organism.HUMAN
    )
    limit: int = Field(
        default=10,
        ge=1,
        le=100
    )


class ExportRequest(BaseModel):
    """Request model for export."""

    data: dict = Field(
        ...,
        description="Data to export"
    )
    format: ExportFormat = Field(
        default=ExportFormat.JSON
    )
    filename: str = Field(
        default="alphagenome_result",
        max_length=100
    )
