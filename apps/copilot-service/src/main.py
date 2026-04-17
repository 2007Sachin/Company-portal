import os
import json
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from groq import Groq
import time

app = FastAPI(title="Pulse Copilot Service", description="AI backend for Pulse candidates")

# Configure Groq client with a 30s timeout
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
client = Groq(api_key=GROQ_API_KEY, timeout=30.0)

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
    return {"status": "ok", "service": "copilot"}


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
        
    return MockInterviewResponse(questions=questions)

