from pydantic import BaseModel, Field
from typing import List, Optional, Union

class JobExperience(BaseModel):
    title: str = Field(description="The job title or role of the candidate (e.g. Senior Software Engineer)")
    company: str = Field(description="The name of the company or organization")
    duration: str = Field(description="The date range of employment (e.g. Jan 2021 - Present or Oct 2019 - Dec 2022)")
    years: Optional[Union[float, str]] = Field(default=0.0, description="Calculated duration in years (e.g. 2.5 or 4.0). If not specified, default to 0.0.")
    bullets: List[str] = Field(description="Key responsibilities and achievements in this job")


class ProjectDetails(BaseModel):
    title: str = Field(description="The name of the project")
    bullets: List[str] = Field(description="Key highlights, descriptions and details of the project")
    technologies: List[str] = Field(description="List of technologies, frameworks, and libraries used in this project")

class CandidateContact(BaseModel):
    name: str = Field(description="Full name of the candidate. Look at the very top header of the resume.")
    email: str = Field(description="Email address of the candidate")
    phone: str = Field(description="Phone number of the candidate")
    github: Optional[str] = Field(None, description="GitHub profile URL if present")
    linkedin: Optional[str] = Field(None, description="LinkedIn profile URL if present")

class CandidateProfile(BaseModel):
    contact: CandidateContact
    experience: List[JobExperience] = Field(description="List of professional job experiences")
    projects: List[ProjectDetails] = Field(description="List of projects completed by the candidate")
    skills: List[str] = Field(description="Unique list of all technical skills, frameworks, databases, tools, and languages detected in the text")

class DomainScore(BaseModel):
    score: int = Field(description="Competency score from 0 to 100")
    keywords: List[str] = Field(description="Sub-list of matching tools, languages, or skills detected for this domain")

class ScoringProfile(BaseModel):
    frontend: DomainScore = Field(description="Frontend competency evaluation")
    backend: DomainScore = Field(description="Backend competency evaluation")
    devops: DomainScore = Field(description="DevOps & Cloud competency evaluation")
    dataAi: DomainScore = Field(description="Data Science, Machine Learning & AI competency evaluation")
    overallScore: int = Field(description="Overall scoring index calculated as weighted average (range 0 to 100)")
    rank: str = Field(description="Hiring rank: 'Junior Developer' (0-44), 'Mid-Level Developer' (45-67), 'Senior Developer' (68-84), or 'Principal / Lead Developer' (85-100)")
    summary: str = Field(description="A professional 2-3 sentence recruiter screening summary summarizing candidate strengths, target roles, and alignment.")
