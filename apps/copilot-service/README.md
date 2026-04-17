# Pulse Copilot Service

AI backend for Pulse candidates, built with Python, FastAPI, and Groq (`llama3-8b-8192`).

## Tech Stack
- **Framework**: FastAPI
- **LLM API**: Groq

## Local Development Setup

1. Enable your virtual environment:
```bash
cd apps/copilot-service
python -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables in `.env` inside `infrastructure/` directory:
```
GROQ_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
uvicorn src.main:app --reload --port 3005
```

The service will be available at `http://localhost:3005`. You can test endpoints via Swagger UI at `http://localhost:3005/docs`.
