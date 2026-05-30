from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from backend.app.core.config import settings
from backend.app.core.security import decode_access_token
from backend.app.core.db import db_adapter
from typing import Dict, Any

# OAuth2 scheme that pulls Bearer token from headers
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login-form" # Supports standard swagger OAuth2 logins
)

async def get_current_user(token: str = Depends(oauth2_scheme)) -> Dict[str, Any]:
    """
    Dependency that decodes the JWT access token from request headers
    and returns the current active user document from MongoDB/Mock DB.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate session. Please login again.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    # Decode token
    user_id = decode_access_token(token)
    if not user_id:
        raise credentials_exception
        
    # Retrieve user from database
    # Works seamlessly on both MongoDB and Fallback JSON DB modes
    user = await db_adapter.find_one("users", {"_id": user_id})
    if not user:
        raise credentials_exception
        
    return user
