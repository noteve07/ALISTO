# app/core/config.py
import os
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """Applications settings and configuration."""

    # TODO: supabase configuration
    SUPABASE_URL: Optional[str] = os.environ.get("SUPABASE_URL")
    SUPABASE_KEY: Optional[str] = os.environ.get("SUPABASE_KEY")

    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "ALISTO API"
    PROJECT_DESCRIPTION: str = "Backend for ALISTO web application"
    VERSION: str = "1.0.0"

    # CORS Configuration
    ALLOWED_ORIGINS: list = ["*"]

    # PHIVOLCS Settings
    phivolcs_url: str = "https://earthquake.phivolcs.dost.gov.ph/"
    request_timeout: int = 10
    max_earthquake_limit: int = 50

    # Web Scraping Configuration
    SCRAPE_INTERVAL: float = 5
    SCRAPE_INTERVAL_MINUTES: int = 3  # Scheduler interval in minutes


# Global settings instance
settings = Settings()