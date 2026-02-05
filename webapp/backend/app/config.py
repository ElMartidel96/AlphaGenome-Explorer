"""
Configuration settings for AlphaGenome Explorer Backend
"""

from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # App info
    app_name: str = "AlphaGenome Explorer API"
    app_version: str = "1.0.0"
    debug: bool = False

    # CORS - Allow all origins for development
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Redis cache (optional)
    redis_url: str | None = None
    cache_ttl_seconds: int = 86400  # 24 hours

    # Rate limiting
    rate_limit_per_minute: int = 60

    # AlphaGenome API (NOT stored here - passed by user per request)
    # The API key is provided by the user in each request header

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
