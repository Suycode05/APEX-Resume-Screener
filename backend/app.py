import os
import json
from fastapi import FastAPI, UploadFile, File, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
from pypdf import PdfReader
import io

# Import the LangGraph screening engine
from graph import execute_screener

app = FastAPI(title="APEX Resume Screener Backend")

# Enable CORS for React frontend (standard ports 5173, 5174)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "*","https://apex-resume-screener.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_FILE = os.path.join(os.path.dirname(__file__), "db.json")

# Core Mock Sandbox profiles to pre-populate database on initialization
INITIAL_SANDBOX_CANDIDATES = [
    {
        "id": "sarah-chen",
        "contact": {
            "name": "Sarah Chen",
            "email": "sarah.chen@devmail.com",
            "phone": "(415) 555-0192",
            "github": "https://github.com/sarahchen-dev",
            "linkedin": "https://linkedin.com/in/sarahchen-fullstack"
        },
        "skills": ["JavaScript", "TypeScript", "Python", "SQL", "React", "Redux", "Node.js", "Express", "PostgreSQL", "MongoDB", "AWS", "Docker", "CI/CD"],
        "scoring": {
            "domains": {
                "frontend": {"score": 88, "keywords": ["react", "redux", "typescript", "javascript", "html", "css", "tailwind"]},
                "backend": {"score": 82, "keywords": ["node.js", "express", "python", "django", "sql", "postgresql", "mongodb"]},
                "devops": {"score": 60, "keywords": ["aws", "docker", "ci/cd", "github actions"]},
                "dataAi": {"score": 25, "keywords": ["python", "sql"]}
            },
            "overallScore": 77,
            "rank": "Senior Developer",
            "summary": "Sarah Chen is a Senior Full Stack Engineer demonstrating excellent core strength in frontend frameworks and backend databases. Shows strong capability to orchestrate scalable cloud deployments."
        },
        "experience": [
            {"title": "Lead Full-Stack Engineer", "company": "InnovateTech Solutions", "duration": "Jan 2023 - Present", "years": 3.3, "bullets": ["Spearhead SaaS analytics platform development in React", "Optimized PostgreSQL query database speeds by 45%"]},
            {"title": "Senior Software Engineer", "company": "PixelCraft Studios", "duration": "Oct 2020 - Dec 2022", "years": 2.2, "bullets": ["Led responsive front-end dashboard applications", "Configured container hosting in AWS ECS"]}
        ],
        "projects": [
            {"title": "E-Commerce Portal Migration", "bullets": ["Re-architected legacy monolith to microservices"], "technologies": ["React", "Node.js", "Docker", "Postgres"]}
        ]
    },
    {
        "id": "elena-rostova",
        "contact": {
            "name": "Elena Rostova",
            "email": "e.rostova@aisystems.org",
            "phone": "(617) 555-0812",
            "github": "https://github.com/elenarostova-ai",
            "linkedin": "https://linkedin.com/in/elena-rostova-datasci"
        },
        "skills": ["Python", "SQL", "R", "PyTorch", "TensorFlow", "Scikit-Learn", "LangChain", "OpenAI", "LLMs", "Pandas", "Spark", "Docker", "Kubernetes"],
        "scoring": {
            "domains": {
                "frontend": {"score": 15, "keywords": ["html", "css"]},
                "backend": {"score": 68, "keywords": ["python", "fastapi", "sql", "postgresql"]},
                "devops": {"score": 75, "keywords": ["docker", "kubernetes", "gcp"]},
                "dataAi": {"score": 96, "keywords": ["pytorch", "tensorflow", "llm", "langchain", "scikit-learn", "pandas", "numpy", "spark"]}
            },
            "overallScore": 83,
            "rank": "Senior Developer",
            "summary": "Elena Rostova is a highly specialized AI specialist with peak expertise in model pipelines, LLM fine-tuning, and neural network training. Excellent fit for Artificial Intelligence roles."
        },
        "experience": [
            {"title": "Principal AI Engineer", "company": "Cognitive Robotics Inc", "duration": "Mar 2023 - Present", "years": 3.1, "bullets": ["Lead custom LLM development and vector search networks", "Deployed FastAPI AI microservices on Kubernetes"]},
            {"title": "Senior Data Scientist", "company": "Cyberdyne Systems", "duration": "Jan 2021 - Feb 2023", "years": 2.1, "bullets": ["Built predictive model structures raising anomaly detection by 30%"]}
        ],
        "projects": [
            {"title": "Multi-Agent LLM Support Network", "bullets": ["Orchestrated LangChain agents for custom query streams"], "technologies": ["LangChain", "OpenAI", "PyTorch", "GCP"]}
        ]
    },
    {
        "id": "marcus-vance",
        "contact": {
            "name": "Marcus Vance",
            "email": "marcus.vance@cloudops.net",
            "phone": "(206) 555-0377",
            "github": "https://github.com/marcusvance-infra",
            "linkedin": "https://linkedin.com/in/marcusvance-devops"
        },
        "skills": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Terraform", "Nginx", "Ansible", "CI/CD", "Prometheus", "Grafana", "Linux", "Python", "Go"],
        "scoring": {
            "domains": {
                "frontend": {"score": 10, "keywords": ["html"]},
                "backend": {"score": 62, "keywords": ["python", "go", "sql"]},
                "devops": {"score": 94, "keywords": ["aws", "docker", "kubernetes", "terraform", "ci/cd", "prometheus", "grafana"]},
                "dataAi": {"score": 20, "keywords": ["python"]}
            },
            "overallScore": 76,
            "rank": "Senior Developer",
            "summary": "Marcus Vance is an expert Devops Cloud Architect with superior competency in automation clusters, self-healing containers, and Infrastructure-as-code."
        },
        "experience": [
            {"title": "Lead DevOps Engineer", "company": "Stratosphere Cloud Solutions", "duration": "Jun 2022 - Present", "years": 3.9, "bullets": ["Architect and manage multi-region AWS cloud infrastructure", "Provisioned Terraform template stacks cutting setup times by 40%"]}
        ],
        "projects": [
            {"title": "Zero-Trust AWS Cloud Migration", "bullets": ["Migrated legacy data center to secure Terraform VPCs"], "technologies": ["AWS", "Terraform", "Docker", "Linux"]}
        ]
    },
    {
        "id": "alex-rivera",
        "contact": {
            "name": "Alex Rivera",
            "email": "alex.rivera99@gmail.com",
            "phone": "(312) 555-0481",
            "github": "https://github.com/alexriveracodes",
            "linkedin": "https://linkedin.com/in/alexrivera-front"
        },
        "skills": ["HTML", "CSS", "JavaScript", "React", "Vue", "Tailwind CSS", "Sass", "Git", "Figma"],
        "scoring": {
            "domains": {
                "frontend": {"score": 64, "keywords": ["react", "javascript", "html", "css", "tailwind"]},
                "backend": {"score": 10, "keywords": []},
                "devops": {"score": 15, "keywords": ["git"]},
                "dataAi": {"score": 5, "keywords": []}
            },
            "overallScore": 38,
            "rank": "Junior Developer",
            "summary": "Alex Rivera is a Junior Frontend Developer with good layout rendering capabilities. Recommended for client-side responsive interface construction roles."
        },
        "experience": [
            {"title": "Frontend Developer", "company": "CreativeWeb Agency", "duration": "Feb 2025 - Present", "years": 1.3, "bullets": ["Build pixel-perfect UI pages with React and Tailwind", "Optimize Lighthouse scores to 90+"]}
        ],
        "projects": [
            {"title": "Recipe Explorer Web App", "bullets": ["Interactive search tool integrating local cache"], "technologies": ["React", "CSS", "JavaScript"]}
        ]
    }
]

# Database helpers
def load_db() -> List[dict]:
    if not os.path.exists(DB_FILE):
        # Create default database with sandbox candidates
        with open(DB_FILE, "w") as f:
            json.dump(INITIAL_SANDBOX_CANDIDATES, f, indent=4)
        return INITIAL_SANDBOX_CANDIDATES
    
    try:
        with open(DB_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return []

def save_db(data: List[dict]):
    with open(DB_FILE, "w") as f:
        json.dump(data, f, indent=4)


# API ENDPOINTS

@app.get("/")
@app.get("/api")
async def health_check():
    return {"status": "online", "message": "APEX Resume Screener API is running"}

@app.post("/api/screen")
async def screen_candidate(file: UploadFile = File(...)):
    filename = file.filename
    content_type = file.content_type
    
    # Check extension
    ext = filename.split(".")[-1].lower()
    if ext not in ["pdf", "txt"]:
        raise HTTPException(status_code=400, detail="Only PDF and TXT file extensions are supported.")
        
    try:
        file_bytes = await file.read()
        
        # 1. Parse File Content
        if ext == "txt":
            raw_text = file_bytes.decode("utf-8", errors="ignore")
        else: # pdf
            pdf_reader = PdfReader(io.BytesIO(file_bytes))
            text_lines = []
            for page in pdf_reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text_lines.append(page_text)
            raw_text = "\n".join(text_lines)
            
        if not raw_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from this file. Verify it is not an image.")
            
        # 2. Run LangGraph Stateful screening pipeline
        screened_profile = execute_screener(raw_text)
        
        # Add ID helper
        email = screened_profile["contact"]["email"]
        candidate_id = email.replace("@", "_").replace(".", "_")
        
        # 3. Add to Local JSON Registry (avoid duplicates by matching email)
        candidates = load_db()
        
        # Filter out existing candidate with same email
        candidates = [c for c in candidates if c["contact"]["email"].lower() != email.lower()]
        
        # Add new candidate record
        record = {
            "id": candidate_id,
            **screened_profile
        }
        candidates.append(record)
        save_db(candidates)
        
        return record
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Parsing chain failed: {str(e)}")


@app.get("/api/candidates")
async def get_candidates(
    sortBy: str = Query("overallScore", description="Field to sort by: overallScore, frontend, backend, devops, dataAi")
):
    candidates = load_db()
    
    def get_sort_key(c):
        scoring = c.get("scoring", {})
        
        # Base sort keys
        if sortBy == "overallScore":
            return scoring.get("overallScore", 0)
            
        # Domain sort keys
        domains = scoring.get("domains", {})
        domain_data = domains.get(sortBy, {})
        return domain_data.get("score", 0)
        
    # Sort descending
    sorted_list = sorted(candidates, key=get_sort_key, reverse=True)
    return sorted_list


@app.delete("/api/candidates")
async def clear_candidates():
    # Reset database back to default empty state, or empty list
    # Let's completely empty it, so the user can build a fresh leaderboard
    save_db([])
    return {"message": "Candidate leaderboard successfully cleared."}


@app.post("/api/candidates/reset")
async def reset_candidates_sandbox():
    # Reload default sandbox candidates
    save_db(INITIAL_SANDBOX_CANDIDATES)
    return {"message": "Leaderboard reset to default sandbox candidates."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
