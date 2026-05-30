from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from backend.app.models.schemas import UserRegister, UserLogin, Token, UserResponse
from backend.app.core.db import db_adapter
from backend.app.core.security import get_password_hash, verify_password, create_access_token
from typing import Any
import datetime
import uuid

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserRegister) -> Any:
    """Register a new user account."""
    # Check if email already exists
    existing_user_email = await db_adapter.find_one("users", {"email": user_in.email})
    if existing_user_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account with this email already exists."
        )

    # Check if username already exists
    existing_user_name = await db_adapter.find_one("users", {"username": user_in.username})
    if existing_user_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken."
        )

    # Hash user password
    hashed_password = get_password_hash(user_in.password)
    
    # Generate unique ID
    user_id = str(uuid.uuid4())
    
    # Create user document
    user_doc = {
        "_id": user_id,
        "email": user_in.email,
        "username": user_in.username,
        "hashed_password": hashed_password,
        "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat()
    }
    
    # Insert in DB
    await db_adapter.insert_one("users", user_doc)
    
    # Create token
    access_token = create_access_token(subject=user_id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user_doc["username"],
        "email": user_doc["email"]
    }

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin) -> Any:
    """Authenticate existing user credentials."""
    user = await db_adapter.find_one("users", {"email": credentials.email})
    if not user or not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
        
    access_token = create_access_token(subject=user["_id"])
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user["username"],
        "email": user["email"]
    }

@router.post("/login-form", response_model=Token)
async def login_form(form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """Standard OAuth2 form-login endpoint for interactive Swagger UI authentication."""
    # Check if user passed email in username field
    user = await db_adapter.find_one("users", {"email": form_data.username})
    if not user:
        # Fallback to check if username matches
        user = await db_adapter.find_one("users", {"username": form_data.username})
        
    if not user or not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password."
        )
        
    access_token = create_access_token(subject=user["_id"])
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": user["username"],
        "email": user["email"]
    }
