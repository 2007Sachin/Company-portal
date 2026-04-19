import os
import json
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from groq import Groq
import time
import hashlib
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '..', '..', '..', '.env'))

app = FastAPI(title="Pulse Copilot Service", description="AI backend for Pulse candidates")

# Configure Groq client with a 30s timeout
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
client = Groq(api_key=GROQ_API_KEY, timeout=30.0)

# Supabase for caching/rate limiting
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")
db: Optional[Client] = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    db = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# ==========================================
# Pydantic Schemas
# ==========================================

class OptimizeProfileRequest(BaseModel):
    headline: str
    skills: List[str]
    experience_years: int
    github_verified: bool
    leetcode_verified: bool
    has_video_pitch: bool

class OptimizeProfileResponse(BaseModel):
    suggested_headline: str
    suggested_skills_to_add: List[str]
    suggested_skills_to_remove: List[str]
    reasoning: str

class CandidateData(BaseModel):
    id: str
    headline: str
    pulse_score: int
    experience_years: int
    notice_period_days: int
    skills: List[str]
    github_verified: bool
    leetcode_verified: bool
    has_video_pitch: bool
    location: str

class CoachAction(BaseModel):
    action: str
    impact: str
    difficulty: str

class ScoreCoachResponse(BaseModel):
    current_score: int
    target_score: int
    actions: List[CoachAction]

class ParsedJD(BaseModel):
    role_title: str
    skills: List[str]
    experience_years: int
    location: str

class MatchScoreRequest(BaseModel):
    candidate: CandidateData
    parsed_jd: ParsedJD
    is_bulk: Optional[bool] = False

class MatchScoreResponse(BaseModel):
    match_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    explanation: str

class MockInterviewRequest(BaseModel):
    skills: List[str]
    role_title: Optional[str] = "Software Engineer"
    difficulty: str  # 'easy', 'medium', 'hard'

class MockQuestion(BaseModel):
    question: str
    category: str
    hints: List[str]
    ideal_answer_points: List[str]

class MockInterviewResponse(BaseModel):
    questions: List[MockQuestion]


# ==========================================
# Helper Functions
# ==========================================
def ask_groq(prompt: str, json_mode: bool = True) -> Any:
    # A generic helper to call Groq llama3-8b-8192
    if not GROQ_API_KEY:
        print("Warning: GROQ_API_KEY not set. Using mocked response.")
        return None

    try:
        response = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert technical recruiter and AI career coach." + 
                               (" Please return valid JSON." if json_mode else "")
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama3-8b-8192",
            response_format={"type": "json_object"} if json_mode else None,
            temperature=0.7,
        )
        content = response.choices[0].message.content
        if json_mode:
            return json.loads(content)
        return content
    except Exception as e:
        print(f"Groq API Error: {e}")
        raise HTTPException(status_code=500, detail=f"LLM API Error: {str(e)}")


# ==========================================
# Endpoints
# ==========================================

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "copilot-service"}
# ==========================================
# New Endpoints for Opportunity Agent
# ==========================================

class CandidateGoals(BaseModel):
    target_roles: List[str]
    target_locations: List[str]
    comp_min: Optional[int]
    comp_max: Optional[int]
    comp_currency: str
    notice_period_days: int

class GithubRepo(BaseModel):
    repo_name: str
    stars: int
    inferred_skills: List[str]

class RankOpportunitiesRequest(BaseModel):
    candidates: Optional[List[CandidateData]] = None
    candidate: Optional[CandidateData] = None # For 1-vs-many
    parsed_jds: Optional[List[ParsedJD]] = None # For many-vs-1 (recompute)
    parsed_jd: Optional[ParsedJD] = None # For 1-vs-many (background)

class RankResult(BaseModel):
    candidate_id: str
    jd_id: str
    match_score: int
    matched_skills: List[str]
    missing_skills: List[str]
    why_you: str
    growth_opportunity: str

class RankOpportunitiesResponse(BaseModel):
    ranked: List[RankResult]

class DraftIntroRequest(BaseModel):
    candidate_id: str
    parsed_jd: ParsedJD
    candidate_full_profile: Dict[str, Any]
    match_context: Dict[str, Any] = {}

@app.post("/copilot/rank-opportunities", response_model=RankOpportunitiesResponse)
def rank_opportunities(req: RankOpportunitiesRequest):
    results = []
    
    # Normalize inputs
    candidates = req.candidates or ([req.candidate] if req.candidate else [])
    jds = req.parsed_jds or ([req.parsed_jd] if req.parsed_jd else [])

    if not candidates or not jds:
        return RankOpportunitiesResponse(ranked=[])

    # 1. Deterministic Scoring Loop
    for cand in candidates:
        for jd in jds:
            req_skills = set(s.lower() for s in jd.skills)
            cand_skills = set(s.lower() for s in cand.skills)
            
            matched_skills = list(req_skills.intersection(cand_skills))
            missing_skills = list(req_skills.difference(cand_skills))
            
            score = 0
            if len(req_skills) > 0:
                score += int((len(matched_skills) / len(req_skills)) * 60)
                
            if cand.experience_years >= jd.experience_years:
                score += 30
            elif cand.experience_years >= jd.experience_years - 1:
                score += 15
                
            if cand.notice_period_days <= jd.notice_period_days:
                score += 10
                
            results.append(RankResult(
                candidate_id=cand.id,
                jd_id=jd.id or "",
                match_score=min(score, 100),
                matched_skills=matched_skills,
                missing_skills=missing_skills,
                why_you="",
                growth_opportunity=""
            ))

    # 2. Qualitative Generation (LLM)
    if GROQ_API_KEY and results:
        # Prompt varies slightly based on many-vs-1 or 1-vs-many
        if len(candidates) == 1:
            # 1 candidate vs N JDs
            items = [f"JD {i}: {jds[i].role_title}" for i in range(len(jds))]
            summary = f"Candidate {candidates[0].headline} matching against: {', '.join(items)}"
        else:
            # N candidates vs 1 JD
            items = [f"Cand {i}: {candidates[i].headline}" for i in range(len(candidates))]
            summary = f"Job {jds[0].role_title} matching against: {', '.join(items)}"

        prompt = f"""
        Analyze these matches: {summary}
        For each match, explain why you and the growth opportunity.
        Return JSON with key 'qualitatives' as a list of {{why_you, growth_opportunity}} matching the input order.
        """
        
        try:
            llm_res = ask_groq(prompt)
            if llm_res and "qualitatives" in llm_res:
                for i, q in enumerate(llm_res["qualitatives"]):
                    if i < len(results):
                        results[i].why_you = q.get("why_you", "")
                        results[i].growth_opportunity = q.get("growth_opportunity", "")
        except Exception:
            pass

    # Fallback
    for r in results:
        if not r.why_you: r.why_you = "Your background matches the technical requirements."
        if not r.growth_opportunity: r.growth_opportunity = "Deepen your expertise in this stack."

    return RankOpportunitiesResponse(ranked=results)

@app.post("/copilot/draft-intro")
def draft_intro(req: DraftIntroRequest):
    if not db:
        raise HTTPException(status_code=500, detail="Supabase not configured in Copilot")
        
    jd = req.parsed_jd
    cache_key = hashlib.sha256(f"{req.candidate_id}:{jd.id}".encode()).hexdigest()
    
    # 1. Cache Check
    cached = db.table("candidate_intro_drafts").select("*").eq("cache_key", cache_key).gte("created_at", "now() - interval '24 hours'").order("created_at", desc=True).limit(1).execute()
    if cached.data:
        return {"draft_text": cached.data[0]["draft_text"], "cached": True}

    # 2. Rate Limit Check
    today_res = db.table("candidate_intro_drafts").select("id").eq("candidate_id", req.candidate_id).gte("created_at", "now() - interval '24 hours'").execute()
    if len(today_res.data) >= 5:
        raise HTTPException(status_code=429, detail="You've reached your limit of 5 agent-drafted intros per day. You can still write your own intro manually!")

    # 3. Prompt Generation
    prompt = f"""
    Draft a personalized recruiter intro for this candidate:
    Candidate: {json.dumps(req.candidate_full_profile)}
    Role: {jd.role_title} at {jd.location}
    Matched Skills: {', '.join(req.match_context.get('matched_skills', []))}
    Why You: {req.match_context.get('why_you', '')}
    
    Style: Professional, concise, high impact. 120-180 words.
    Structure:
    - Open with strongest matched skill backed by verified signal (GitHub/Pulse score).
    - Acknowledge one gap honestly (e.g. {req.match_context.get('missing_skills', ['a new framework'])[0]}).
    - End with a specific technical question about the role.
    
    Return JSON with key 'draft_text'.
    """
    
    if not GROQ_API_KEY:
        draft_text = f"Hi, I'm interested in the {jd.role_title} role. I've worked extensively with {', '.join(jd.skills[:2])}. Let's chat!"
    else:
        llm_res = ask_groq(prompt)
        draft_text = llm_res.get("draft_text", "Failed to generate draft.")

    # 4. Store in Cache
    db.table("candidate_intro_drafts").insert({
        "candidate_id": req.candidate_id,
        "jd_id": jd.id,
        "draft_text": draft_text,
        "cache_key": cache_key
    }).execute()
    
    return {"draft_text": draft_text, "cached": False}


@app.post("/copilot/optimize-profile", response_model=OptimizeProfileResponse)
def optimize_profile(req: OptimizeProfileRequest):
    prompt = f"""
    Analyze this software engineer candidate profile:
    Headline: {req.headline}
    Skills: {', '.join(req.skills)}
    Experience: {req.experience_years} years
    
    Return a JSON response with exactly these keys:
    - suggested_headline: <string, a stronger, punchier headline>
    - suggested_skills_to_add: <list of strings, 2-3 modern skills relevant to their stack>
    - suggested_skills_to_remove: <list of strings, outdated or redundant skills>
    - reasoning: <string, brief explanation of your choices>
    """
    
    if not GROQ_API_KEY:
        return OptimizeProfileResponse(
            suggested_headline="Senior Software Engineer | Expert in Node.js & React",
            suggested_skills_to_add=["Docker", "AWS"],
            suggested_skills_to_remove=[],
            reasoning="Mocked reasoning because no API key is provided."
        )

    res = ask_groq(prompt)
    if not res:
        raise HTTPException(status_code=500, detail="Failed to get parsed response.")
        
    return OptimizeProfileResponse(**res)


@app.post("/copilot/score-coach", response_model=ScoreCoachResponse)
def score_coach(candidate: CandidateData):
    # Deterministic logic calculating the targets and actions
    current_score = 50
    actions = []
    
    # Check verifications
    if candidate.github_verified:
        current_score += 20
    else:
        actions.append(CoachAction(action="Connect your GitHub account", impact="+20 pts", difficulty="Easy"))
        
    if candidate.leetcode_verified:
        current_score += 15
    else:
        actions.append(CoachAction(action="Connect your LeetCode account", impact="+15 pts", difficulty="Medium"))

    if candidate.has_video_pitch:
        current_score += 10
    else:
        actions.append(CoachAction(action="Record a 60-second video pitch", impact="+10 pts", difficulty="Hard"))

    skill_score = min(len(candidate.skills) * 5, 25)
    current_score += skill_score
    if skill_score < 25:
        actions.append(CoachAction(action=f"Add {5 - len(candidate.skills)} more relevant skills", impact="+5 pts each", difficulty="Easy"))

    target_score = current_score
    for a in actions:
        if "+20" in a.impact: target_score += 20
        elif "+15" in a.impact: target_score += 15
        elif "+10" in a.impact: target_score += 10
        elif "+5" in a.impact: target_score += (5 * (5 - len(candidate.skills)))

    target_score = min(target_score, 100)
    current_score = min(current_score, 100)

    # Sort actions by impact (Easy > Medium > Hard for quick wins)
    priority = {"Easy": 1, "Medium": 2, "Hard": 3}
    actions.sort(key=lambda x: priority.get(x.difficulty, 4))

    return ScoreCoachResponse(
        current_score=current_score,
        target_score=target_score,
        actions=actions
    )


@app.post("/copilot/match-score", response_model=MatchScoreResponse)
def match_score(req: MatchScoreRequest):
    candidate = req.candidate
    jd = req.parsed_jd

    # Deterministic overlap scoring
    req_skills = set(s.lower() for s in jd.skills)
    cand_skills = set(s.lower() for s in candidate.skills)
    
    matched_skills = list(req_skills.intersection(cand_skills))
    missing_skills = list(req_skills.difference(cand_skills))
    
    score = 0
    if len(req_skills) > 0:
        score += int((len(matched_skills) / len(req_skills)) * 60) # 60% weight on skills
        
    if candidate.experience_years >= jd.experience_years:
        score += 30 # 30% weight on experience
    elif candidate.experience_years >= jd.experience_years - 1:
        score += 15 
        
    if candidate.notice_period_days <= 30:
        score += 10 # 10% weight on notice period
        
    score = min(score, 100)

    explain_prompt = f"""
    As a recruiter, explain in exactly one short, professional sentence why a candidate is a {score}% match for the {jd.role_title} role.
    Candidate has {candidate.experience_years} years exp, {candidate.notice_period_days} notice period, and matches these skills: {', '.join(matched_skills)}.
    Missing skills: {', '.join(missing_skills)}.
    Provide the response in JSON format: {{"explanation": "<your sentence here>"}}
    """
    
    explanation = "They possess solid foundational experience but lack several specific requirement overlaps."
    if GROQ_API_KEY and not req.is_bulk:
        res = ask_groq(explain_prompt)
        if res and "explanation" in res:
            explanation = res["explanation"]

    return MatchScoreResponse(
        match_score=score,
        matched_skills=matched_skills,
        missing_skills=missing_skills,
        explanation=explanation
    )


@app.post("/copilot/mock-interview", response_model=MockInterviewResponse)
def mock_interview(req: MockInterviewRequest):
    prompt = f"""
    Generate exactly 5 mock interview questions for a {req.role_title} with difficulty '{req.difficulty}'.
    The candidate has expertise in these skills: {', '.join(req.skills)}.
    
    Return a JSON response matching this schema:
    {{
      "questions": [
        {{
          "question": "<string, the technical question>",
          "category": "<string, e.g., System Design, Language Internals>",
          "hints": ["<string>", "<string>"],
          "ideal_answer_points": ["<string>", "<string>"]
        }}
      ]
    }}
    """
    
    if not GROQ_API_KEY:
        return MockInterviewResponse(
            questions=[
                MockQuestion(
                    question="How does Python's GIL actually work?",
                    category="Language Internals",
                    hints=["Think about threading versus multiprocessing."],
                    ideal_answer_points=["Explains Global Interpreter Lock", "Mentions thread safety"]
                )
            ]
        )

    res = ask_groq(prompt)
    if not res or "questions" not in res:
        raise HTTPException(status_code=500, detail="Failed to fetch interview questions.")
        
    # Validation loop
    questions = []
    for q in res["questions"]:
        questions.append(MockQuestion(**q))
        
# ==========================================
# New Endpoints for Proof Builder
# ==========================================

class GenerateReadmeRequest(BaseModel):
    repo_url: str

class StructureCaseStudyRequest(BaseModel):
    title: str
    description: str
    file_text_extract: Optional[str] = ""

class AssessmentStartRequest(BaseModel):
    skill: str

class AssessmentGradeRequest(BaseModel):
    skill: str
    answers: Dict[str, str]

class TranscribeRequest(BaseModel):
    video_url: str

@app.post("/copilot/generate-readme")
def generate_readme(req: GenerateReadmeRequest):
    prompt = f"""
    Generate a professional Markdown README for this repository: {req.repo_url}
    Focus on code quality, architecture, and developer impact.
    Return JSON with key 'markdown'.
    """
    if not GROQ_API_KEY:
        return {"markdown": "# Project Overview\nThis is a mocked professional README for demonstration."}
    
    return ask_groq(prompt)

@app.post("/copilot/structure-case-study")
def structure_case_study(req: StructureCaseStudyRequest):
    prompt = f"""
    Structure this case study:
    Title: {req.title}
    Description: {req.description}
    Text Extract: {req.file_text_extract}
    
    Return JSON with exactly these keys:
    - problem: <string>
    - approach: <string>
    - stack: <list of strings>
    - outcome: <string>
    - metrics: <list of strings>
    """
    if not GROQ_API_KEY:
        return {
            "problem": "Manual data entry was slow.",
            "approach": "Automated with Python scripts.",
            "stack": ["Python", "FastAPI"],
            "outcome": "Reduced processing time by 80%.",
            "metrics": ["80% faster", "Zero errors"]
        }
    
    return ask_groq(prompt)

@app.post("/copilot/assessment/start")
def assessment_start(req: AssessmentStartRequest):
    prompt = f"""
    Generate 10 technical multiple-choice questions for the skill: {req.skill}
    Each question should have 4 options and a unique ID.
    Return JSON with key 'questions' containing list of {{id, question, options, category}}.
    """
    if not GROQ_API_KEY:
        return {
            "questions": [
                {"id": str(i), "question": f"Sample question {i} about {req.skill}?", "options": ["A", "B", "C", "D"], "category": "General"}
                for i in range(1, 11)
            ]
        }
    
    return ask_groq(prompt)

@app.post("/copilot/assessment/grade")
def assessment_grade(req: AssessmentGradeRequest):
    prompt = f"""
    Grade these answers for a {req.skill} assessment:
    Answers: {json.dumps(req.answers)}
    
    Return JSON with:
    - score: <int 0-100>
    - feedback: <string>
    - transcript: <object detailing correct vs incorrect>
    """
    if not GROQ_API_KEY:
        return {
            "score": 85,
            "feedback": f"Great job on {req.skill}!",
            "transcript": {"q1": "correct", "q2": "incorrect", "metadata": "mocked"}
        }
    
    return ask_groq(prompt)

@app.post("/copilot/transcribe")
def transcribe(req: TranscribeRequest):
    # Stub implementation as per requirements
    return {"transcript": "Transcription coming soon (requires Whisper integration)."}

