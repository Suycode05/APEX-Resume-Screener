import os
import re
from typing import TypedDict, List, Dict, Any, Optional
from langgraph.graph import StateGraph, END
from dotenv import load_dotenv

# Load environment variables from backend/.env file
load_dotenv()

# Import schemas for LangChain structured outputs
from schemas import CandidateProfile, ScoringProfile, DomainScore

# Define the state dictionary
class ScreenerState(TypedDict):
    raw_text: str
    contact: Dict[str, Any]
    experience: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    skills: List[str]
    scoring: Dict[str, Any]
    summary: str

# Helper tech stack mappings (mirroring JS parser for fallback consistency)
TECH_DOMAINS = {
    'frontend': {
        'name': 'Frontend Development',
        'keywords': ['react', 'vue', 'angular', 'next.js', 'svelte', 'typescript', 'javascript', 'html', 'css', 'tailwind', 'sass', 'redux', 'graphql', 'webpack', 'vite'],
        'weights': {'react': 10, 'next.js': 10, 'typescript': 8, 'javascript': 7, 'tailwind': 6, 'graphql': 6, 'vue': 8, 'angular': 8}
    },
    'backend': {
        'name': 'Backend Development',
        'keywords': ['node.js', 'express', 'python', 'django', 'flask', 'fastapi', 'golang', 'go', 'java', 'spring boot', 'c#', 'dotnet', 'ruby', 'rails', 'php', 'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'graphql', 'grpc', 'microservices'],
        'weights': {'node.js': 10, 'golang': 10, 'go': 10, 'python': 8, 'postgresql': 8, 'mongodb': 7, 'microservices': 9, 'sql': 6}
    },
    'devops': {
        'name': 'DevOps & Cloud',
        'keywords': ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'ci/cd', 'jenkins', 'github actions', 'linux', 'nginx', 'prometheus', 'grafana', 'serverless'],
        'weights': {'aws': 10, 'kubernetes': 10, 'k8s': 10, 'docker': 8, 'terraform': 9, 'ci/cd': 8, 'gcp': 9, 'azure': 9}
    },
    'dataAi': {
        'name': 'Data Science & AI',
        'keywords': ['pytorch', 'tensorflow', 'keras', 'pandas', 'numpy', 'scikit-learn', 'machine learning', 'deep learning', 'nlp', 'llm', 'langchain', 'openai', 'spark', 'hadoop', 'r', 'data science', 'rxt'],
        'weights': {'pytorch': 10, 'tensorflow': 10, 'llm': 10, 'langchain': 9, 'machine learning': 8, 'pandas': 6, 'spark': 8}
    }
}

COMPLEXITY_KEYWORDS = [
    'architect', 'design', 'scale', 'optimize', 'bottleneck', 'performance', 
    'lead', 'manage', 'spearhead', 'microservices', 'distributed', 'pipeline',
    'refactored', 'infrastructure', 'secure', 'cloud-native', 'highly available'
]

# Initialize LLM client if API keys are available
def get_llm():
    # 1. Prioritize Groq
    if os.environ.get("GROQ_API_KEY") and os.environ.get("GROQ_API_KEY") != "YOUR_GROQ_API_KEY_HERE":
        try:
            from langchain_groq import ChatGroq
            return ChatGroq(model="llama-3.3-70b-versatile", temperature=0.1)
        except ImportError:
            pass

    # 2. Fallback to Gemini
    if os.environ.get("GEMINI_API_KEY"):
        try:
            from langchain_google_genai import ChatGoogleGenerativeAI
            return ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0.1)
        except ImportError:
            pass
            
    # 3. Fallback to OpenAI
    if os.environ.get("OPENAI_API_KEY"):
        try:
            from langchain_openai import ChatOpenAI
            return ChatOpenAI(model="gpt-4o-mini", temperature=0.1)
        except ImportError:
            pass
            
    return None



# DETERMINISTIC FALLBACK PARSING SYSTEM (Python Regex Engine)
def fallback_extract_contact(text: str) -> Dict[str, Any]:
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    
    # Email
    email_match = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', text)
    email = email_match.group(0) if email_match else 'not-found@example.com'
    
    # Phone
    phone_match = re.search(r'(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b', text)
    phone = phone_match.group(0) if phone_match else 'Not provided'
    
    # Links
    github = None
    linkedin = None
    gh_match = re.search(r'github\.com\/[A-Za-z0-9_-]+', text, re.IGNORECASE)
    li_match = re.search(r'linkedin\.com\/in\/[A-Za-z0-9_-]+', text, re.IGNORECASE)
    if gh_match: github = f"https://{gh_match.group(0)}"
    if li_match: linkedin = f"https://{li_match.group(0)}"
    
    # Extract Name Heuristics
    name = 'Candidate Name'
    for i in range(min(8, len(lines))):
        line = lines[i]
        
        # Strip contact details
        if email_match and email_match.group(0) in line:
            line = line.replace(email_match.group(0), '')
        if phone_match and phone_match.group(0) in line:
            line = line.replace(phone_match.group(0), '')
        if gh_match and 'github.com' in line.lower():
            line = re.sub(r'https?:\/\/github\.com\/[A-Za-z0-9_-]+', '', line, flags=re.IGNORECASE)
            line = re.sub(r'github\.com\/[A-Za-z0-9_-]+', '', line, flags=re.IGNORECASE)
        if li_match and 'linkedin.com' in line.lower():
            line = re.sub(r'https?:\/\/linkedin\.com\/in\/[A-Za-z0-9_-]+', '', line, flags=re.IGNORECASE)
            line = re.sub(r'linkedin\.com\/in\/[A-Za-z0-9_-]+', '', line, flags=re.IGNORECASE)
            
        line = re.sub(r'(email|phone|github|linkedin|mobile|tel|contact|resume|cv|curriculum vitae|portfolio)', '', line, flags=re.IGNORECASE)
        line = re.sub(r'[|:;•,\-\/*]', ' ', line)
        line = ' '.join(line.split()).strip()
        
        if len(line) > 2 and len(line) < 35 and re.match(r'^[a-zA-Z\s.]+$', line):
            words = [w for w in line.split() if len(w) > 1]
            if len(words) >= 2:
                name = ' '.join([w.capitalize() for w in words])
                break
            elif len(words) == 1 and len(line.split()) == 1:
                name = words[0].capitalize()
                break
                
    return {
        'name': name,
        'email': email,
        'phone': phone,
        'github': github,
        'linkedin': linkedin
    }

def fallback_parse_sections(text: str) -> Dict[str, Any]:
    lines = text.split('\n')
    experience = []
    projects = []
    skills = []
    
    current_section = ''
    current_block = None
    
    section_headers = {
        'experience': ['experience', 'work history', 'employment', 'professional history', 'professional background'],
        'projects': ['projects', 'personal projects', 'key projects', 'academic projects'],
        'skills': ['skills', 'technical skills', 'core competencies', 'expertise']
    }
    
    for line in lines:
        clean_line = line.strip()
        if not clean_line: continue
        
        lower_line = clean_line.lower()
        found_section = False
        
        for sec_key, headers in section_headers.items():
            if any(lower_line == h or lower_line.startswith(h + ':') or lower_line.startswith(h + ' ') for h in headers):
                current_section = sec_key
                found_section = True
                break
                
        if found_section: continue
        
        if current_section == 'skills':
            parts = [p.strip() for p in re.split(r'[,;|•]', clean_line) if p.strip()]
            skills.extend(parts)
        elif current_section in ['experience', 'projects']:
            is_new = ('|' in clean_line or '—' in clean_line or ' - ' in clean_line or 
                      bool(re.search(r'\b(19\d{2}|20\d{2})\b', clean_line)) or
                      (len(clean_line) < 60 and any(kw in clean_line.lower() for kw in ['engineer', 'developer', 'lead', 'manager', 'analyst'])))
                      
            if is_new:
                if current_block:
                    if current_section == 'experience': experience.append(current_block)
                    else: projects.append(current_block)
                    
                current_block = {
                    'title': clean_line,
                    'company': 'General Organization',
                    'duration': '2023 - Present',
                    'years': 3.0,
                    'bullets': [],
                    'technologies': []
                }
                
                parts = [p.strip() for p in re.split(r'[|—•]', clean_line)]
                if len(parts) >= 2:
                    current_block['title'] = parts[0]
                    current_block['company'] = parts[1]
                    if len(parts) >= 3: current_block['duration'] = parts[2]
                
                date_match = re.search(r'\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*20\d{2}\s*[-–—to]+\s*(present|current|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*20\d{2})\b', clean_line, re.IGNORECASE)
                if date_match:
                    current_block['duration'] = date_match.group(0)
                    # Simple numerical duration parser
                    current_block['years'] = 3.0 # Fallback default
            else:
                if current_block:
                    bullet = re.sub(r'^[•\-\*\s]+', '', clean_line).strip()
                    current_block['bullets'].append(bullet)
                    
    if current_block and current_section:
        if current_section == 'experience': experience.append(current_block)
        else: projects.append(current_block)
        
    # Fallback default records
    if not experience:
        experience.append({
            'title': 'Software Engineer',
            'company': 'General Industry',
            'duration': '2022 - Present',
            'years': 4.0,
            'bullets': ['Developed scalable application systems', 'Collaborated on cloud integrations']
        })
    if not projects:
        projects.append({
            'title': 'Full-Stack Application Development',
            'duration': 'Recent Project',
            'bullets': ['Engineered backend and frontend components'],
            'technologies': ['React', 'Node.js', 'Postgres']
        })
        
    return {
        'experience': experience,
        'projects': projects,
        'skills': list(set(skills))
    }

def fallback_calculate_scores(text: str, parsed: Dict[str, Any]) -> Dict[str, Any]:
    text_lower = text.lower()
    scores = {}
    
    for domain_key, domain in TECH_DOMAINS.items():
        detected = []
        raw_score = 0
        
        for kw in domain['keywords']:
            if re.search(r'\b' + re.escape(kw) + r'\b', text_lower):
                weight = domain['weights'].get(kw, 5)
                raw_score += weight
                detected.append(kw)
                
        kw_score = min(50, raw_score)
        
        # Experience weight
        exp_bonus = 0
        for job in parsed['experience']:
            job_text = f"{job['title']} {job['company']} {' '.join(job['bullets'])}".lower()
            if any(kw in job_text for kw in detected):
                exp_bonus += job['years'] * 3
        exp_bonus = min(30, exp_bonus)
        
        # Project complexity
        proj_bonus = 0
        for proj in parsed['projects']:
            proj_text = f"{proj['title']} {' '.join(proj['bullets'])}".lower()
            if any(kw in proj_text for kw in detected):
                proj_bonus += 5
                for ck in COMPLEXITY_KEYWORDS:
                    if ck in proj_text:
                        proj_bonus += 2.5
        proj_bonus = min(20, proj_bonus)
        
        scores[domain_key] = {
            'score': min(100, max(5, int(kw_score + exp_bonus + proj_bonus))),
            'keywords': detected
        }
        
    scores_array = [d['score'] for d in scores.values()]
    max_score = max(scores_array)
    avg_score = sum(scores_array) / len(scores_array)
    overall = int((max_score * 0.6) + (avg_score * 0.4))
    
    rank = 'Junior Developer'
    if overall >= 85: rank = 'Principal / Lead Developer'
    elif overall >= 68: rank = 'Senior Developer'
    elif overall >= 45: rank = 'Mid-Level Developer'
    
    return {
        'domains': scores,
        'overallScore': overall,
        'rank': rank
    }


# GRAPH NODE 1: EXTRACTION NODE
def extraction_node(state: ScreenerState) -> Dict[str, Any]:
    text = state['raw_text']
    llm = get_llm()
    
    if llm:
        try:
            # Bind Pydantic model for structured output
            structured_llm = llm.with_structured_output(CandidateProfile)
            
            prompt = f"""
            Analyze the following resume text and extract candidate profile details:
            
            RESUME TEXT:
            ---
            {text}
            ---
            
            Extract the candidate name, contact, list of experience, list of projects, and unique list of skills.
            """
            
            profile: CandidateProfile = structured_llm.invoke(prompt)
            
            # Format experiences and projects into standard dicts
            experience = []
            for job in profile.experience:
                years_val = 0.0
                if job.years is not None:
                    if isinstance(job.years, (int, float)):
                        years_val = float(job.years)
                    elif isinstance(job.years, str):
                        match = re.search(r'\d+(\.\d+)?', job.years)
                        if match:
                            years_val = float(match.group(0))
                
                experience.append({
                    'title': job.title,
                    'company': job.company,
                    'duration': job.duration,
                    'years': years_val,
                    'bullets': job.bullets
                })

                
            projects = []
            for proj in profile.projects:
                projects.append({
                    'title': proj.title,
                    'bullets': proj.bullets,
                    'technologies': proj.technologies
                })
                
            return {
                'contact': {
                    'name': profile.contact.name,
                    'email': profile.contact.email,
                    'phone': profile.contact.phone,
                    'github': profile.contact.github,
                    'linkedin': profile.contact.linkedin
                },
                'experience': experience,
                'projects': projects,
                'skills': profile.skills
            }
        except Exception as e:
            print(f"[LLM Node Error] Failed LLM extraction: {e}. Falling back to regex.")
            
    # Deterministic Local Fallback
    contact = fallback_extract_contact(text)
    sections = fallback_parse_sections(text)
    return {
        'contact': contact,
        'experience': sections['experience'],
        'projects': sections['projects'],
        'skills': sections['skills']
    }


# GRAPH NODE 2: GRADER NODE
def grader_node(state: ScreenerState) -> Dict[str, Any]:
    text = state['raw_text']
    llm = get_llm()
    
    # We pass the extracted experience & projects to the grader
    profile_data = {
        'contact': state['contact'],
        'experience': state['experience'],
        'projects': state['projects'],
        'skills': state['skills']
    }
    
    if llm:
        try:
            structured_llm = llm.with_structured_output(ScoringProfile)
            
            prompt = f"""
            You are a technical recruiter screening a candidate profile.
            Review the candidate details and score their technical proficiency from 0 to 100 on the following 4 domains:
            
            1. Frontend Development: Experience with UI frameworks, state, styling (React, Vue, JS, Tailwind, etc.)
            2. Backend Development: Experience with APIs, servers, databases, microservices (Node, Python, Go, SQL, etc.)
            3. DevOps & Cloud: Infrastructure, containerization, hosting, automation pipelines (AWS, Docker, K8s, CI/CD, etc.)
            4. Data Science & AI: Data structures, modeling, NLP, deep learning, LangChain, vector searches (Python, PyTorch, LLMs, Spark, etc.)
            
            Determine:
            - A score (0-100) and detected keywords for each domain.
            - An overallScore (0-100) combining these values.
            - A hiring rank tier.
            - A professional summary of 2-3 sentences outlining the screening.
            
            CANDIDATE PROFILE DATA:
            {profile_data}
            """
            
            grading: ScoringProfile = structured_llm.invoke(prompt)
            
            scoring = {
                'domains': {
                    'frontend': {'score': grading.frontend.score, 'keywords': grading.frontend.keywords},
                    'backend': {'score': grading.backend.score, 'keywords': grading.backend.keywords},
                    'devops': {'score': grading.devops.score, 'keywords': grading.devops.keywords},
                    'dataAi': {'score': grading.dataAi.score, 'keywords': grading.dataAi.keywords}
                },
                'overallScore': grading.overallScore,
                'rank': grading.rank
            }
            
            return {
                'scoring': scoring,
                'summary': grading.summary
            }
        except Exception as e:
            print(f"[LLM Node Error] Failed LLM grading: {e}. Falling back to rule-based calculator.")
            
    # Deterministic Scoring Fallback
    scoring_data = fallback_calculate_scores(text, profile_data)
    
    # Construct generic summary report based on rank/scores
    name = state['contact']['name']
    rank = scoring_data['rank']
    overall = scoring_data['overallScore']
    summary = f"Candidate {name} shows an overall proficiency index of {overall} ({rank}). "
    
    # Highlight highest domain
    domains = scoring_data['domains']
    highest_domain = max(domains.keys(), key=lambda k: domains[k]['score'])
    highest_score = domains[highest_domain]['score']
    summary += f"Demonstrates peak technical competencies in {highest_domain.capitalize()} (score: {highest_score}). "
    
    if overall >= 68:
        summary += "Highly recommended for active developer interview loops."
    else:
        summary += "Suitable for foundational development support."
        
    return {
        'scoring': scoring_data,
        'summary': summary
    }


# COMPILE LANGGRAPH STATE MACHINE
def build_screener_graph():
    workflow = StateGraph(ScreenerState)
    
    # Define nodes
    workflow.add_node("extraction", extraction_node)
    workflow.add_node("grader", grader_node)
    
    # Set execution order
    workflow.set_entry_point("extraction")
    workflow.add_edge("extraction", "grader")
    workflow.add_edge("grader", END)
    
    # Compile
    app = workflow.compile()
    return app

# Main runner entry point
screener_agent = build_screener_graph()

def execute_screener(raw_text: str) -> Dict[str, Any]:
    initial_state = {
        'raw_text': raw_text,
        'contact': {},
        'experience': [],
        'projects': [],
        'skills': [],
        'scoring': {},
        'summary': ''
    }
    
    # Run through LangGraph
    final_output = screener_agent.invoke(initial_state)
    return {
        'contact': final_output['contact'],
        'experience': final_output['experience'],
        'projects': final_output['projects'],
        'skills': final_output['skills'],
        'scoring': {
            'domains': final_output['scoring']['domains'],
            'overallScore': final_output['scoring']['overallScore'],
            'rank': final_output['scoring']['rank'],
            'summary': final_output['summary']
        }
    }
