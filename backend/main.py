from fastapi import FastAPI
from backend.routes.evaluate import router as evaluate_router

app = FastAPI(
    title="CreditGuard API",
    description="AI-powered financial intelligence API",
    version="0.1.0",
)



@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "CreditGuard API",
    }

app.include_router(evaluate_router)