from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import chat
from app.middleware.rate_limiter import limiter
from slowapi.middleware import SlowAPIMiddleware
from slowapi.errors import RateLimitExceeded
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

# ✅ CORS FIX (VERY IMPORTANT for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # for development
    allow_credentials=True,
    allow_methods=["*"],   # MUST include OPTIONS
    allow_headers=["*"],
)

# ✅ Rate limiter setup
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

# (Optional) handle rate limit error nicely
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return {"error": "Too many requests. Please try again later."}

# ✅ Router with prefix (IMPORTANT)
app.include_router(chat.router, prefix="/chat")

# ✅ Test route
@app.get("/")
def home():
    return {"message": "Gemini Chatbot Running 🚀"}