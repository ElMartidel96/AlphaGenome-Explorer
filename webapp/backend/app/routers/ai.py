"""
AI Router - Endpoints for AI-powered genomic analysis.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import logging

from ..services.ai_service import ai_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ai", tags=["AI"])


class ChatRequest(BaseModel):
    messages: list[dict]
    provider: str = "claude"
    system_prompt: str | None = None
    max_tokens: int = 1024


class ChatResponse(BaseModel):
    success: bool
    content: str
    provider: str
    model: str
    usage: dict


class AnalyzeRequest(BaseModel):
    data: dict
    question: str
    provider: str = "claude"


@router.get("/providers")
async def get_providers():
    """Get available AI providers."""
    return {
        "success": True,
        "providers": ai_service.available_providers,
    }


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a chat message to an AI provider."""
    try:
        kwargs = {
            "messages": request.messages,
            "provider": request.provider,
            "max_tokens": request.max_tokens,
        }
        if request.system_prompt:
            kwargs["system_prompt"] = request.system_prompt

        result = await ai_service.chat(**kwargs)
        return ChatResponse(
            success=True,
            content=result["content"],
            provider=result["provider"],
            model=result["model"],
            usage=result["usage"],
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception(f"AI chat error: {e}")
        raise HTTPException(status_code=500, detail="AI service error")


@router.post("/analyze-genomic-data")
async def analyze_genomic_data(request: AnalyzeRequest):
    """Analyze genomic data with AI."""
    try:
        result = await ai_service.analyze_genomic_data(
            data=request.data,
            question=request.question,
            provider=request.provider,
        )
        return {
            "success": True,
            **result,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.exception(f"AI analysis error: {e}")
        raise HTTPException(status_code=500, detail="AI service error")
