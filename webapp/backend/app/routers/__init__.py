"""Routers package."""

from .predict import router as predict_router
from .metadata import router as metadata_router
from .export import router as export_router
from .ai import router as ai_router
from .profile import router as profile_router

__all__ = ["predict_router", "metadata_router", "export_router", "ai_router", "profile_router"]
