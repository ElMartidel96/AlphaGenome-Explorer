"""
AI Service - Multi-provider AI integration for genomic analysis.

Supports Claude (Anthropic), GPT (OpenAI), and Gemini (Google).
"""

import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

GENOMIC_SYSTEM_PROMPT = """You are an expert genomics AI assistant for AlphaGenome Explorer.
You specialize in:
- Interpreting genetic variants and their effects
- Explaining epigenetic mechanisms and modifications
- Analyzing gene expression patterns
- Providing evidence-based genomic insights
- Explaining complex genomics concepts in accessible language

Always cite relevant genes, variants (rs IDs), and scientific evidence when applicable.
Be precise with scientific claims and clearly distinguish between established science and emerging research.
If unsure, say so rather than speculating."""


class AIService:
    """Multi-provider AI service for genomic analysis."""

    def __init__(self):
        self.anthropic_key = os.getenv("ANTHROPIC_API_KEY")
        self.openai_key = os.getenv("OPENAI_API_KEY")
        self.gemini_key = os.getenv("GEMINI_API_KEY")

    @property
    def available_providers(self) -> list[str]:
        providers = []
        if self.anthropic_key:
            providers.append("claude")
        if self.openai_key:
            providers.append("openai")
        if self.gemini_key:
            providers.append("gemini")
        return providers

    async def chat(
        self,
        messages: list[dict],
        provider: str = "claude",
        system_prompt: str = GENOMIC_SYSTEM_PROMPT,
        max_tokens: int = 1024,
    ) -> dict:
        """Send a chat message to the specified AI provider."""
        if provider == "claude":
            return await self._chat_claude(messages, system_prompt, max_tokens)
        elif provider == "openai":
            return await self._chat_openai(messages, system_prompt, max_tokens)
        elif provider == "gemini":
            return await self._chat_gemini(messages, system_prompt, max_tokens)
        else:
            raise ValueError(f"Unknown provider: {provider}")

    async def _chat_claude(
        self, messages: list[dict], system_prompt: str, max_tokens: int
    ) -> dict:
        if not self.anthropic_key:
            raise ValueError("ANTHROPIC_API_KEY not configured")

        import anthropic

        client = anthropic.AsyncAnthropic(api_key=self.anthropic_key)
        response = await client.messages.create(
            model="claude-sonnet-4-5-20250929",
            max_tokens=max_tokens,
            system=system_prompt,
            messages=messages,
        )
        return {
            "content": response.content[0].text,
            "provider": "claude",
            "model": "claude-sonnet-4-5-20250929",
            "usage": {
                "input_tokens": response.usage.input_tokens,
                "output_tokens": response.usage.output_tokens,
            },
        }

    async def _chat_openai(
        self, messages: list[dict], system_prompt: str, max_tokens: int
    ) -> dict:
        if not self.openai_key:
            raise ValueError("OPENAI_API_KEY not configured")

        from openai import AsyncOpenAI

        client = AsyncOpenAI(api_key=self.openai_key)
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=full_messages,
            max_tokens=max_tokens,
        )
        choice = response.choices[0]
        return {
            "content": choice.message.content,
            "provider": "openai",
            "model": "gpt-4o",
            "usage": {
                "input_tokens": response.usage.prompt_tokens if response.usage else 0,
                "output_tokens": response.usage.completion_tokens if response.usage else 0,
            },
        }

    async def _chat_gemini(
        self, messages: list[dict], system_prompt: str, max_tokens: int
    ) -> dict:
        if not self.gemini_key:
            raise ValueError("GEMINI_API_KEY not configured")

        import google.generativeai as genai

        genai.configure(api_key=self.gemini_key)
        model = genai.GenerativeModel(
            "gemini-2.0-flash",
            system_instruction=system_prompt,
        )

        # Convert messages to Gemini format
        history = []
        for msg in messages[:-1]:
            role = "user" if msg["role"] == "user" else "model"
            history.append({"role": role, "parts": [msg["content"]]})

        chat = model.start_chat(history=history)
        last_message = messages[-1]["content"] if messages else ""
        response = await chat.send_message_async(last_message)

        return {
            "content": response.text,
            "provider": "gemini",
            "model": "gemini-2.0-flash",
            "usage": {"input_tokens": 0, "output_tokens": 0},
        }

    async def analyze_genomic_data(
        self,
        data: dict,
        question: str,
        provider: str = "claude",
    ) -> dict:
        """Analyze genomic data with AI and answer a specific question."""
        context = f"""Here is the genomic analysis data to review:

{_format_genomic_data(data)}

User question: {question}"""

        return await self.chat(
            messages=[{"role": "user", "content": context}],
            provider=provider,
            max_tokens=2048,
        )


def _format_genomic_data(data: dict) -> str:
    """Format genomic data for AI context."""
    parts = []
    if "variant" in data:
        parts.append(f"Variant: {data['variant']}")
    if "gene" in data:
        parts.append(f"Gene: {data['gene']}")
    if "scores" in data:
        parts.append(f"Scores: {data['scores']}")
    if "tool_name" in data:
        parts.append(f"Analysis tool: {data['tool_name']}")
    if "result" in data:
        parts.append(f"Result summary: {data['result']}")
    return "\n".join(parts) if parts else str(data)


# Singleton
ai_service = AIService()
