"""Models package."""

from .requests import (
    OutputType,
    SequenceLength,
    Organism,
    ScorerType,
    ExportFormat,
    VariantPredictRequest,
    IntervalPredictRequest,
    VariantScoreRequest,
    ISMRequest,
    GeneSearchRequest,
    ExportRequest,
)

from .responses import (
    TrackMetadata,
    TrackData,
    GeneScore,
    VariantSummary,
    PredictionResult,
    VariantPredictResponse,
    IntervalPredictResponse,
    ScoreResponse,
    ISMResponse,
    GeneInfo,
    GeneSearchResponse,
    OntologyTerm,
    MetadataResponse,
    HealthResponse,
    ErrorResponse,
    format_as_markdown,
    format_as_csv,
    format_as_tsv,
)

__all__ = [
    # Request enums
    "OutputType",
    "SequenceLength",
    "Organism",
    "ScorerType",
    "ExportFormat",
    # Request models
    "VariantPredictRequest",
    "IntervalPredictRequest",
    "VariantScoreRequest",
    "ISMRequest",
    "GeneSearchRequest",
    "ExportRequest",
    # Response models
    "TrackMetadata",
    "TrackData",
    "GeneScore",
    "VariantSummary",
    "PredictionResult",
    "VariantPredictResponse",
    "IntervalPredictResponse",
    "ScoreResponse",
    "ISMResponse",
    "GeneInfo",
    "GeneSearchResponse",
    "OntologyTerm",
    "MetadataResponse",
    "HealthResponse",
    "ErrorResponse",
    # Formatters
    "format_as_markdown",
    "format_as_csv",
    "format_as_tsv",
]
