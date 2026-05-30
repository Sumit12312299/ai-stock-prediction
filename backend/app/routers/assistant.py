from fastapi import APIRouter, Depends, status
from backend.app.models.schemas import ChatbotRequest, ChatbotResponse, VoiceAssistantRequest, VoiceAssistantResponse
from backend.app.services.chatbot_service import chatbot_service
from backend.app.services.voice_service import voice_service
from backend.app.routers.deps import get_current_user
from typing import Dict, Any

router = APIRouter(prefix="/assistant", tags=["AI Conversational Assistant"])

@router.post("/chatbot", response_model=ChatbotResponse)
async def chat_with_advisor(
    request: ChatbotRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Any:
    """Submit a query to the AI Investment Chatbot for structured finance and ML guidance."""
    response_data = chatbot_service.generate_response(request.message)
    return response_data

@router.post("/voice", response_model=VoiceAssistantResponse)
async def voice_query_processor(
    request: VoiceAssistantRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> Any:
    """Submit text transcription of a voice query to perform automated actions on the dashboard."""
    response_data = voice_service.process_voice_query(request.voice_query)
    return response_data
