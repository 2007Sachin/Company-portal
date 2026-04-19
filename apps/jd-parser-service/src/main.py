import os
import json
import httpx
from typing import List, Optional, Any, Dict
from fastapi import FastAPI, HTTPException, BackgroundTasks
from pydantic import BaseModel
from groq import Groq
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '.env'))

app = FastAPI(title="JD Parser Service")

# 1. Groq Client
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
groq_client = Groq(api_key=GROQ_API_KEY, timeout=30.0)

# 2. Supabase Client
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

supabase: Client | None = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# 3. Environment configuration for internal services
COPILOT_SERVICE_URL = os.environ.get("COPILOT_SERVICE_URL", "http://copilot-service:3005")


# ==========================================
# Schema Definitions
# ==========================================
class ParseRequest(BaseModel):
    text: str

class ParsedJD(BaseModel):
    id: Optional[str] = None
    role_title: str
    skills: List[str]
    experience_years: int
    location: str
    notice_period_days: int

class InternalMatchRequest(BaseModel):
    parsed_jd: ParsedJD

# ==========================================
# Helper background trigger
# ==========================================
async def trigger_parse_and_match(payload: dict):
    # This background task runs the internal endpoint async
    try:
        async with httpx.AsyncClient() as client:
            await client.post(
                "http://localhost:8000/jd/parse-and-match",
                json=payload,
                timeout=60.0
            )
    except Exception as e:
        print(f"Failed to trigger parse-and-match internally: {e}")


# ==========================================
# Endpoints
# ==========================================

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "jd-parser"}

@app.post("/jd/parse", response_model=ParsedJD)
async def parse_jd(req: ParseRequest, background_tasks: BackgroundTasks):
    text = req.text
    if not text:
        raise HTTPException(status_code=400, detail="Text is required")

    prompt = f"""
    Extract key job requirements from this text:
    "{text}"
    
    Return EXACTLY a JSON format with:
    - role_title (string)
    - skills (number array of specific hard skills)
    - experience_years (integer)
    - location (string)
    - notice_period_days (integer - default to 30 if not mentioned)
    """

    parsed_obj = {
        "role_title": "Software Engineer",
        "skills": ["JavaScript", "React", "Node.js"],
        "experience_years": 3,
        "location": "Remote",
        "notice_period_days": 30
    }

    if GROQ_API_KEY:
        try:
            res = groq_client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a specialized HR extraction API. Output strict JSON only."},
                    {"role": "user", "content": prompt}
                ],
                model="llama3-8b-8192",
                response_format={"type": "json_object"},
                temperature=0.3,
            )
            parsed_obj = json.loads(res.choices[0].message.content)
            # Normalize default fields if the LLM hallucinated
            if "notice_period_days" not in parsed_obj:
                parsed_obj["notice_period_days"] = 30
            if "experience_years" not in parsed_obj:
                parsed_obj["experience_years"] = 0
        except Exception as e:
            print(f"Error calling Groq API: {e}")

    # Write to database parsed_jds
    inserted_jd = None
    if supabase:
        try:
            db_res = supabase.table("parsed_jds").insert({
                "role_title": parsed_obj.get("role_title", "Unknown"),
                "skills": parsed_obj.get("skills", []),
                "experience_years": parsed_obj.get("experience_years", 0),
                "location": parsed_obj.get("location", "Unknown"),
                "notice_period_days": parsed_obj.get("notice_period_days", 30),
                "raw_text": text
            }).execute()
            
            if db_res.data and len(db_res.data) > 0:
                inserted_jd = db_res.data[0]
                parsed_obj["id"] = inserted_jd["id"]
        except Exception as e:
            print(f"Error inserting into DB: {e}")

    final_model = ParsedJD(**parsed_obj)

    # Fire background task for opportunity radar
    if inserted_jd:
        background_tasks.add_task(
            trigger_parse_and_match, 
            {"parsed_jd": final_model.model_dump()}
        )

    return final_model


@app.post("/jd/parse-and-match", status_code=202)
async def parse_and_match(req: InternalMatchRequest):
    """
    Internal endpoint called via background task to fan out JD matches against candidates.
    Frontend does not call this route directly.
    """
    if not supabase:
         return {"warning": "No supabase client configured, aborting."}
         
    jd = req.parsed_jd
    try:
        # 1. Fetch Candidates (limit to 1000, onboarding_step >= 5)
        cands_res = supabase.table("candidates").select("*").gte("onboarding_step", 5).limit(1000).execute()
        fetched_candidates = cands_res.data or []
        
        matches_to_insert = []
        
        # 2. Batch Processing (groups of 20)
        batch_size = 20
        async with httpx.AsyncClient() as http:
            for i in range(0, len(fetched_candidates), batch_size):
                batch = fetched_candidates[i : i + batch_size]
                
                candidates_data = []
                for cand in batch:
                    candidates_data.append({
                        "id": cand["id"],
                        "headline": cand.get("headline", ""),
                        "pulse_score": cand.get("pulse_score", 0),
                        "experience_years": cand.get("experience_years", 0),
                        "notice_period_days": cand.get("notice_period_days", 30),
                        "skills": cand.get("skills", []),
                        "github_verified": cand.get("github_verified", False),
                        "leetcode_verified": cand.get("leetcode_verified", False),
                        "has_video_pitch": cand.get("has_video_pitch", False),
                        "location": cand.get("location", "")
                    })
                
                payload = {
                    "candidates": candidates_data,
                    "parsed_jd": jd.model_dump()
                }
                
                # Call copilot rank-opportunities
                copres = await http.post(
                    f"{COPILOT_SERVICE_URL}/copilot/rank-opportunities", 
                    json=payload,
                    timeout=30.0
                )
                
                if copres.status_code == 200:
                    ranked_data = copres.json().get("ranked", [])
                    for r in ranked_data:
                        if r["match_score"] >= 60:
                            matches_to_insert.append({
                                "candidate_id": r["candidate_id"],
                                "jd_id": jd.id,
                                "match_score": r["match_score"],
                                "matched_skills": r["matched_skills"],
                                "missing_skills": r["missing_skills"],
                                "why_you": r["why_you"],
                                "growth_opportunity": r["growth_opportunity"]
                            })
                        
        # 3. Batch DB Insertion (Upsert to handle recomputes)
        if len(matches_to_insert) > 0:
             # UPSERT on (candidate_id, jd_id)
             supabase.table("candidate_matches").upsert(matches_to_insert, on_conflict="candidate_id,jd_id").execute()
             
        return {"status": "success", "matches_evaluated": len(fetched_candidates), "matches_inserted": len(matches_to_insert)}
    except Exception as e:
        print(f"Internal match worker failed: {e}")
        raise HTTPException(status_code=500, detail="Match background task error")
