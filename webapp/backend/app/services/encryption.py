"""
Encryption service for API keys and sensitive data.
Uses Fernet symmetric encryption (AES-128-CBC).
"""

import os
import base64
from cryptography.fernet import Fernet

_key = os.getenv("ENCRYPTION_KEY")


def get_fernet() -> Fernet:
    """Get Fernet cipher. Generates key on first use if not set."""
    global _key
    if not _key:
        _key = Fernet.generate_key().decode()
        print(f"WARNING: No ENCRYPTION_KEY set. Generated ephemeral key. Set ENCRYPTION_KEY env var for persistence.")
    key_bytes = _key.encode() if isinstance(_key, str) else _key
    return Fernet(key_bytes)


def encrypt(plaintext: str) -> str:
    """Encrypt a string and return base64-encoded ciphertext."""
    f = get_fernet()
    return f.encrypt(plaintext.encode()).decode()


def decrypt(ciphertext: str) -> str:
    """Decrypt a base64-encoded ciphertext and return plaintext."""
    f = get_fernet()
    return f.decrypt(ciphertext.encode()).decode()
