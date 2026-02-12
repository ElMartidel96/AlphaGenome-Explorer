"""
Profile Router - Endpoints for user profile and API key management.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from ..services.encryption import encrypt, decrypt

router = APIRouter(prefix="/api/profile", tags=["Profile"])


class SaveApiKeyRequest(BaseModel):
    api_key: str


class SaveApiKeyResponse(BaseModel):
    success: bool
    encrypted_key: str


class DecryptApiKeyRequest(BaseModel):
    encrypted_key: str


class DecryptApiKeyResponse(BaseModel):
    success: bool
    api_key: str


@router.post("/encrypt-api-key", response_model=SaveApiKeyResponse)
async def encrypt_api_key(request: SaveApiKeyRequest):
    """Encrypt an API key for secure storage."""
    try:
        encrypted = encrypt(request.api_key)
        return SaveApiKeyResponse(success=True, encrypted_key=encrypted)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Encryption failed")


@router.post("/decrypt-api-key", response_model=DecryptApiKeyResponse)
async def decrypt_api_key(request: DecryptApiKeyRequest):
    """Decrypt a stored API key."""
    try:
        decrypted = decrypt(request.encrypted_key)
        return DecryptApiKeyResponse(success=True, api_key=decrypted)
    except Exception as e:
        raise HTTPException(status_code=400, detail="Decryption failed - invalid key")
