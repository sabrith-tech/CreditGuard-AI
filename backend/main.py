from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.evaluate import router as evaluate_router
import os
from dotenv import load_dotenv 

load_dotenv()
FRONTEND_URL = os.getenv("FRONTEND_URL")

app = FastAPI(
    title="CreditGuard API",
    description="AI-powered financial intelligence API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "CreditGuard API",
    }

app.include_router(evaluate_router)
