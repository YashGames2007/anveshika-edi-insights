from fastapi import APIRouter, HTTPException, Request
from app.services.gemini_service import stream_chat
from app.services.memory import get_history, update_history
from app.middleware.logger import logger
from app.utils.stream import stream_response

router = APIRouter()

@router.post("/")
async def chat(request: Request):
    data = await request.json()

    user_message = data.get("message")
    session_id = data.get("session_id", "default")

    if not user_message or not isinstance(user_message, str):
        raise HTTPException(status_code=400, detail="message must be a non-empty string")

    logger.info(f"User: {user_message}")

    history = get_history(session_id)

    history.append({"role": "user", "content": user_message})

    def generate():
        full_response = ""

        for chunk in stream_chat(history):
            full_response += chunk
            yield chunk

        update_history(session_id, "user", user_message)
        update_history(session_id, "assistant", full_response)

        logger.info(f"Bot: {full_response}")

    try:
        return stream_response(generate())
    except Exception as err:
        logger.error(f"Gemini stream failed: {err}")
        raise HTTPException(status_code=502, detail=str(err))
