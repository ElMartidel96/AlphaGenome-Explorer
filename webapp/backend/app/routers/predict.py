"""
Prediction API Routes

All prediction endpoints require the user to provide their own API key
in the X-API-Key header.
"""

from fastapi import APIRouter, HTTPException, Header, Depends
from typing import Annotated
import logging

from ..models import (
    VariantPredictRequest,
    IntervalPredictRequest,
    VariantScoreRequest,
    ISMRequest,
    VariantPredictResponse,
    IntervalPredictResponse,
    ScoreResponse,
    ISMResponse,
    ErrorResponse,
    format_as_markdown,
    format_as_csv,
)
from ..services.alphagenome_service import alphagenome_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/predict", tags=["Predictions"])


def get_api_key(x_api_key: Annotated[str | None, Header()] = None) -> str:
    """
    Extract API key from request header.

    The user must provide their own AlphaGenome API key.
    Get your free API key at: https://deepmind.google.com/science/alphagenome
    """
    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail={
                "error": "API key required",
                "message": "Please provide your AlphaGenome API key in the X-API-Key header",
                "how_to_get_key": "Get your free API key at: https://deepmind.google.com/science/alphagenome",
                "steps": [
                    "1. Visit https://deepmind.google.com/science/alphagenome",
                    "2. Sign in with your Google account",
                    "3. Request an API key (free for non-commercial use)",
                    "4. Add the key to your request header as X-API-Key",
                ],
            },
        )
    return x_api_key


@router.post(
    "/variant",
    response_model=VariantPredictResponse,
    responses={
        401: {"model": ErrorResponse, "description": "API key required"},
        400: {"model": ErrorResponse, "description": "Invalid request"},
        500: {"model": ErrorResponse, "description": "Prediction failed"},
    },
)
async def predict_variant(
    request: VariantPredictRequest,
    api_key: str = Depends(get_api_key),
):
    """
    Predict the effect of a genetic variant.

    This endpoint uses AlphaGenome to predict how a variant affects:
    - Gene expression (RNA-seq)
    - Chromatin accessibility (DNase, ATAC)
    - Splicing patterns
    - And more...

    **Requires your own AlphaGenome API key.**

    Example variant format: `chr22:36201698:A>C`
    """
    try:
        result = await alphagenome_service.predict_variant(
            api_key=api_key,
            variant_str=request.variant,
            outputs=request.outputs,
            tissues=request.tissues,
            sequence_length=request.sequence_length,
            organism=request.organism,
        )

        # Prepare export formats
        export_data = result.model_dump()
        export = {
            "json": export_data,
            "markdown": format_as_markdown(result),
            "csv": format_as_csv(result.scores) if result.scores else "",
        }

        return VariantPredictResponse(
            success=True,
            data=result,
            export=export,
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception(f"Prediction failed: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "error": "Prediction failed",
                "message": str(e),
                "hint": "Check your API key and variant format",
            },
        )


@router.post(
    "/interval",
    response_model=IntervalPredictResponse,
)
async def predict_interval(
    request: IntervalPredictRequest,
    api_key: str = Depends(get_api_key),
):
    """
    Predict functional outputs for a genomic interval.

    Useful for exploring a region of the genome without a specific variant.

    **Requires your own AlphaGenome API key.**
    """
    try:
        result = await alphagenome_service.predict_interval(
            api_key=api_key,
            chromosome=request.chromosome,
            start=request.start,
            end=request.end,
            outputs=request.outputs,
            tissues=request.tissues,
            organism=request.organism,
        )

        return IntervalPredictResponse(
            success=True,
            data=result,
            export={"json": result},
        )

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception(f"Interval prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/score",
    response_model=ScoreResponse,
)
async def score_variant(
    request: VariantScoreRequest,
    api_key: str = Depends(get_api_key),
):
    """
    Score a variant using recommended variant scorers.

    Returns scores per gene showing the predicted effect magnitude.

    **Requires your own AlphaGenome API key.**
    """
    try:
        scores = await alphagenome_service.score_variant(
            api_key=api_key,
            variant_str=request.variant,
            scorers=request.scorers,
            sequence_length=request.sequence_length,
            organism=request.organism,
        )

        # Convert to dict for export
        scores_dict = [s.model_dump() for s in scores]

        return ScoreResponse(
            success=True,
            variant=request.variant,
            scores=scores,
            total_genes=len(set(s.gene_name for s in scores)),
            total_tracks=len(scores),
            export={
                "json": scores_dict,
                "csv": format_as_csv(scores),
            },
        )

    except Exception as e:
        logger.exception(f"Scoring failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/ism",
    response_model=ISMResponse,
)
async def run_ism(
    request: ISMRequest,
    api_key: str = Depends(get_api_key),
):
    """
    Run In Silico Mutagenesis (ISM) analysis.

    Systematically mutates every position in a region to identify
    functionally important bases.

    **Note:** This can take several minutes depending on the region size.

    **Requires your own AlphaGenome API key.**
    """
    try:
        result = await alphagenome_service.run_ism(
            api_key=api_key,
            chromosome=request.chromosome,
            start=request.start,
            end=request.end,
            ism_width=request.ism_width,
            scorer_type=request.scorer,
            tissue=request.tissue,
            sequence_length=request.sequence_length,
            organism=request.organism,
        )

        return ISMResponse(
            success=True,
            interval=result["interval"],
            ism_matrix=result["ism_matrix"],
            export={"json": result},
        )

    except Exception as e:
        logger.exception(f"ISM failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
