"""
AlphaGenome Explorer - Backend API

A professional web interface for Google DeepMind's AlphaGenome API.

IMPORTANT: This application requires users to provide their own AlphaGenome API key.
API keys are FREE for non-commercial research use.
Get your key at: https://deepmind.google.com/science/alphagenome
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import logging
import time

from .config import get_settings
from .routers import predict_router, metadata_router, export_router, ai_router, profile_router
from .models import HealthResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan handler."""
    logger.info("Starting AlphaGenome Explorer API...")
    yield
    logger.info("Shutting down AlphaGenome Explorer API...")


app = FastAPI(
    title="AlphaGenome Explorer API",
    description="""
# AlphaGenome Explorer API

A professional web interface for exploring genomic predictions with AlphaGenome.

## Getting Started

1. **Get your API key** (FREE for research):
   - Visit [https://deepmind.google.com/science/alphagenome](https://deepmind.google.com/science/alphagenome)
   - Sign in with your Google account
   - Request an API key

2. **Make requests** with your API key in the `X-API-Key` header

## Features

- **Variant Analysis**: Predict effects of genetic variants
- **Region Exploration**: Explore any genomic region
- **Variant Scoring**: Get quantitative impact scores
- **ISM Analysis**: In silico mutagenesis
- **Multiple Export Formats**: JSON, CSV, PDF, VCF, and more

## Security

Your API key is **never stored** on our servers. It's only used for the
duration of each request and then discarded.

## Citation

If you use AlphaGenome in your research, please cite:
> Avsec et al. "Advancing regulatory variant effect prediction with AlphaGenome" Nature 2026
    """,
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins + ["*"],  # Allow all for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request timing middleware
@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    """Add response timing header."""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(round(process_time * 1000, 2)) + "ms"
    return response


# Exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler."""
    logger.exception(f"Unhandled exception: {exc}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "message": str(exc) if settings.debug else "An unexpected error occurred",
        },
    )


# Include routers
app.include_router(predict_router)
app.include_router(metadata_router)
app.include_router(export_router)
app.include_router(ai_router)
app.include_router(profile_router)


# Root endpoints
@app.get("/", tags=["Root"])
async def root():
    """
    API root - returns basic information and links.
    """
    return {
        "name": "AlphaGenome Explorer API",
        "version": "1.0.0",
        "description": "Professional web interface for AlphaGenome",
        "documentation": "/docs",
        "health": "/health",
        "get_api_key": {
            "url": "https://deepmind.google.com/science/alphagenome",
            "note": "FREE for non-commercial research use",
        },
        "links": {
            "alphagenome_docs": "https://www.alphagenomedocs.com/",
            "alphagenome_github": "https://github.com/google-deepmind/alphagenome",
            "community": "https://www.alphagenomecommunity.com/",
        },
    }


@app.get("/health", response_model=HealthResponse, tags=["Root"])
async def health_check():
    """
    Health check endpoint.
    """
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
    )


@app.get("/api-key-required", tags=["Root"])
async def api_key_info():
    """
    Information about API key requirements.
    """
    return {
        "title": "API Key Required",
        "message": "This API requires you to provide your own AlphaGenome API key.",
        "how_to_get": {
            "step1": "Visit https://deepmind.google.com/science/alphagenome",
            "step2": "Sign in with your Google account",
            "step3": "Request an API key (FREE for non-commercial use)",
            "step4": "Add the key to your requests in the X-API-Key header",
        },
        "security_note": "Your API key is NEVER stored on our servers. "
        "It's only used for the duration of each request.",
        "rate_limits": {
            "free_tier": "~1 million predictions per day",
            "suitable_for": "Small to medium-scale analyses (1000s of predictions)",
        },
        "terms_of_use": "https://deepmind.google.com/science/alphagenome/terms",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
    )
