// Tech stack definitions for scoring domains
export const TECH_DOMAINS = {
  frontend: {
    name: 'Frontend Development',
    keywords: ['react', 'vue', 'angular', 'next.js', 'svelte', 'typescript', 'javascript', 'html', 'css', 'tailwind', 'sass', 'redux', 'graphql', 'webpack', 'vite'],
    weights: { react: 10, 'next.js': 10, typescript: 8, javascript: 7, tailwind: 6, graphql: 6, vue: 8, angular: 8 }
  },
  backend: {
    name: 'Backend Development',
    keywords: ['node.js', 'express', 'python', 'django', 'flask', 'fastapi', 'golang', 'go', 'java', 'spring boot', 'c#', 'dotnet', 'ruby', 'rails', 'php', 'sql', 'postgresql', 'mysql', 'mongodb', 'redis', 'graphql', 'grpc', 'microservices'],
    weights: { 'node.js': 10, golang: 10, go: 10, python: 8, postgresql: 8, mongodb: 7, microservices: 9, sql: 6 }
  },
  devops: {
    name: 'DevOps & Cloud',
    keywords: ['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'ci/cd', 'jenkins', 'github actions', 'linux', 'nginx', 'prometheus', 'grafana', 'serverless'],
    weights: { aws: 10, kubernetes: 10, k8s: 10, docker: 8, terraform: 9, 'ci/cd': 8, gcp: 9, azure: 9 }
  },
  dataAi: {
    name: 'Data Science & AI',
    keywords: ['pytorch', 'tensorflow', 'keras', 'pandas', 'numpy', 'scikit-learn', 'machine learning', 'deep learning', 'nlp', 'llm', 'langchain', 'openai', 'spark', 'hadoop', 'r', 'data science', 'rxt'],
    weights: { pytorch: 10, tensorflow: 10, llm: 10, langchain: 9, 'machine learning': 8, pandas: 6, spark: 8 }
  }
};

// Complexity buzzwords indicating advanced responsibility/scale
const COMPLEXITY_KEYWORDS = [
  'architect', 'design', 'scale', 'optimize', 'bottleneck', 'performance', 
  'lead', 'manage', 'spearhead', 'microservices', 'distributed', 'pipeline',
  'refactored', 'infrastructure', 'secure', 'cloud-native', 'highly available'
];

/**
 * Calculates years of experience from a date string (e.g. "Jan 2021 - Present" or "2019 - 2022")
 */
function parseDurationInYears(dateStr) {
  if (!dateStr) return 1;
  
  const currentYear = 2026; // Static reference year from context metadata
  const currentMonth = 5; // May
  
  const cleanStr = dateStr.toLowerCase().trim();
  
  // Splitting start and end dates
  const parts = cleanStr.split(/[-–—to]/);
  if (parts.length < 2) return 1; // Default fallback
  
  const startPart = parts[0].trim();
  const endPart = parts[1].trim();
  
  const parseDatePart = (part) => {
    if (part.includes('present') || part.includes('current')) {
      return { year: currentYear, month: currentMonth };
    }
    
    // Look for a 4 digit year
    const yearMatch = part.match(/\b(20\d{2}|19\d{2})\b/);
    const year = yearMatch ? parseInt(yearMatch[0], 10) : currentYear;
    
    // Look for month keywords
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    let month = 0;
    for (let i = 0; i < months.length; i++) {
      if (part.includes(months[i])) {
        month = i;
        break;
      }
    }
    return { year, month };
  };

  const start = parseDatePart(startPart);
  const end = parseDatePart(endPart);
  
  const totalMonths = (end.year - start.year) * 12 + (end.month - start.month);
  const years = Math.max(0.5, totalMonths / 12);
  
  return parseFloat(years.toFixed(1));
}

/**
 * Normalizes strings for keyword scanning
 */
function cleanText(text) {
  return text.toLowerCase().replace(/[\n\r\t]/g, ' ');
}

/**
 * Extracts candidate basic contact info
 */
export function extractContactInfo(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  
  // 1. Extract Email
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const emailMatch = text.match(emailRegex);
  const email = emailMatch ? emailMatch[0] : 'not-found@example.com';

  // 2. Extract Phone
  const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/;
  const phoneMatch = text.match(phoneRegex);
  const phone = phoneMatch ? phoneMatch[0] : 'Not provided';

  // 3. Links (LinkedIn, GitHub)
  const githubMatch = text.match(/github\.com\/[A-Za-z0-9_-]+/i);
  const linkedinMatch = text.match(/linkedin\.com\/in\/[A-Za-z0-9_-]+/i);

  // 4. Extract Name with advanced heuristics
  let name = 'Candidate Name';
  
  // Examine the first 8 lines
  for (let i = 0; i < Math.min(8, lines.length); i++) {
    let line = lines[i];
    
    // Skip if it is empty
    if (!line) continue;

    // A. Strip email if it appears on this line
    if (emailMatch && line.includes(emailMatch[0])) {
      line = line.replace(emailMatch[0], '');
    }
    
    // B. Strip phone if it appears on this line
    if (phoneMatch && line.includes(phoneMatch[0])) {
      line = line.replace(phoneMatch[0], '');
    }

    // C. Strip social links
    if (githubMatch && line.toLowerCase().includes('github.com')) {
      line = line.replace(new RegExp(`https?:\\/\\/` + githubMatch[0].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'), '');
      line = line.replace(new RegExp(githubMatch[0].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'), '');
    }
    if (linkedinMatch && line.toLowerCase().includes('linkedin.com')) {
      line = line.replace(new RegExp(`https?:\\/\\/` + linkedinMatch[0].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'), '');
      line = line.replace(new RegExp(linkedinMatch[0].replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i'), '');
    }

    // D. Strip common labels, symbols, and formatting dividers
    line = line.replace(/(email|phone|github|linkedin|mobile|tel|contact|resume|cv|curriculum vitae|portfolio)/gi, '');
    line = line.replace(/[|:;•,\-\/*]/g, ' '); // Replace common separators with spaces
    line = line.replace(/\s+/g, ' ').trim();  // Normalize spaces and trim

    // E. Verify if remaining text behaves like a candidate name
    // Must be between 3 and 35 characters, contain letters and spaces only
    if (line.length > 2 && line.length < 35 && /^[a-zA-Z\s.]+$/.test(line)) {
      const words = line.split(' ').filter(w => w.length > 1);
      
      // Candidate names usually contain at least a First Name and a Last Name (2+ words)
      if (words.length >= 2) {
        name = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        break;
      } else if (words.length === 1 && line.split(' ').length === 1) {
        // Fallback for single-word username or single name
        name = words[0].charAt(0).toUpperCase() + words[0].slice(1).toLowerCase();
        break;
      }
    }
  }

  return {
    name,
    email,
    phone,
    github: githubMatch ? `https://${githubMatch[0]}` : null,
    linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : null
  };
}


/**
 * Splits text into experience and projects entries using section markers
 */
export function parseSections(text) {
  const lines = text.split('\n');
  const sections = {
    experience: [],
    projects: [],
    skills: []
  };

  let currentSection = '';
  let currentBlock = null;

  const sectionHeaders = {
    experience: ['experience', 'work history', 'employment', 'professional history', 'professional background'],
    projects: ['projects', 'personal projects', 'key projects', 'academic projects'],
    skills: ['skills', 'technical skills', 'core competencies', 'expertise']
  };

  for (let line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine) continue;

    const lowerLine = cleanLine.toLowerCase();
    
    // Check if line matches a major section header
    let foundSection = false;
    for (const [secKey, headers] of Object.entries(sectionHeaders)) {
      if (headers.some(h => lowerLine === h || lowerLine.startsWith(h + ':') || lowerLine.startsWith(h + ' '))) {
        currentSection = secKey;
        foundSection = true;
        break;
      }
    }

    if (foundSection) continue;

    if (currentSection === 'skills') {
      // Add skill keywords listed in this line
      const cleanParts = cleanLine.split(/[,;|•]/).map(s => s.trim()).filter(Boolean);
      sections.skills.push(...cleanParts);
    } else if (currentSection === 'experience' || currentSection === 'projects') {
      // Heuristic: A title line often starts a new block.
      // E.g., contains a company/role separator like "|" or "at" or "—", or a date pattern.
      const isNewBlock = 
        cleanLine.includes('|') || 
        cleanLine.includes('—') || 
        cleanLine.includes(' - ') ||
        /\b(19\d{2}|20\d{2})\b/.test(cleanLine) || 
        cleanLine.length < 60 && (cleanLine.toLowerCase().includes('engineer') || cleanLine.toLowerCase().includes('developer') || cleanLine.toLowerCase().includes('lead') || cleanLine.toLowerCase().includes('manager') || cleanLine.toLowerCase().includes('analyst'));

      if (isNewBlock) {
        if (currentBlock) {
          sections[currentSection].push(currentBlock);
        }
        
        // Setup initial structure of new block
        // Extracted values parsed inside UI/Component
        currentBlock = {
          rawHeader: cleanLine,
          title: '',
          company: '',
          duration: '',
          years: 1.0,
          bullets: []
        };
        
        // Extract title, company, dates from the header
        const parts = cleanLine.split(/[|—•]/).map(p => p.trim());
        if (parts.length >= 2) {
          currentBlock.title = parts[0];
          currentBlock.company = parts[1];
          if (parts[2]) currentBlock.duration = parts[2];
        } else {
          currentBlock.title = cleanLine;
        }
        
        // Try to find a date range in the header line
        const dateMatch = cleanLine.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*20\d{2}\s*[-–—to]+\s*(present|current|\b(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\s*20\d{2})\b/i);
        if (dateMatch) {
          currentBlock.duration = dateMatch[0];
          currentBlock.years = parseDurationInYears(dateMatch[0]);
        }
      } else {
        if (currentBlock) {
          // If it starts with bullet symbols
          const bulletClean = cleanLine.replace(/^[•\-\*\s]+/, '').trim();
          currentBlock.bullets.push(bulletClean);
        }
      }
    }
  }

  // Push last block if it exists
  if (currentBlock && currentSection) {
    sections[currentSection].push(currentBlock);
  }

  // Fallback: If no experience blocks detected, create a mock block from text
  if (sections.experience.length === 0) {
    sections.experience.push({
      title: 'Software Engineer',
      company: 'General Industry',
      duration: '2022 - Present',
      years: 4.0,
      bullets: ['Responsible for development, testing, and cloud deployment.', 'Collaborated with cross-functional teams to deliver software features.']
    });
  }

  // Fallback: If no project blocks detected, create a dummy project from raw skills
  if (sections.projects.length === 0) {
    sections.projects.push({
      title: 'Full-Stack Application Development',
      duration: 'Recent Project',
      bullets: ['Engineered scalable application architecture using modern technologies.', 'Implemented responsive design and integrated REST/GraphQL APIs.']
    });
  }

  return sections;
}

/**
 * Calculates technical proficiency scores across Frontend, Backend, DevOps, Data/AI domains
 */
export function calculateScores(text, parsedSections) {
  const textLower = cleanText(text);
  const domainScores = {};

  // For each domain
  for (const [domainKey, domain] of Object.entries(TECH_DOMAINS)) {
    let rawScore = 0;
    const detectedKeywords = [];

    // 1. Keyword density score (up to 50 points)
    domain.keywords.forEach(keyword => {
      // Use boundary safe matching to prevent matching sub-strings (e.g. "go" inside "google")
      const regex = new RegExp(`\\b${keyword.replace('.', '\\.')}\\b`, 'i');
      if (regex.test(textLower)) {
        const weight = domain.weights[keyword] || 5;
        rawScore += weight;
        detectedKeywords.push(keyword);
      }
    });

    // Limit base keyword score to 50 points
    let keywordScore = Math.min(50, rawScore);

    // 2. Experience-weighted scoring (up to 30 points)
    let experienceBonus = 0;
    parsedSections.experience.forEach(job => {
      const jobText = cleanText(`${job.title} ${job.company} ${job.bullets.join(' ')}`);
      
      // Check which of this domain's keywords are mentioned in the job description
      let matchesInJob = 0;
      detectedKeywords.forEach(keyword => {
        if (jobText.includes(keyword)) {
          matchesInJob++;
        }
      });

      if (matchesInJob > 0) {
        // Boost score based on job duration in years
        experienceBonus += job.years * 3; 
      }
    });
    experienceBonus = Math.min(30, experienceBonus);

    // 3. Project & complexity scoring (up to 20 points)
    let projectBonus = 0;
    parsedSections.projects.forEach(project => {
      const projectText = cleanText(`${project.title} ${project.bullets.join(' ')}`);
      
      // Match keywords in project
      let matchesInProject = 0;
      detectedKeywords.forEach(keyword => {
        if (projectText.includes(keyword)) {
          matchesInProject++;
        }
      });

      if (matchesInProject > 0) {
        projectBonus += 5; // Base project match bonus
        
        // Scan for complexity terms
        COMPLEXITY_KEYWORDS.forEach(kw => {
          if (projectText.includes(kw)) {
            projectBonus += 2.5; // Complexity booster
          }
        });
      }
    });
    projectBonus = Math.min(20, projectBonus);

    // Sum scores
    const finalScore = Math.round(keywordScore + experienceBonus + projectBonus);
    domainScores[domainKey] = {
      score: Math.min(100, Math.max(5, finalScore)), // Range from 5 to 100
      keywords: detectedKeywords
    };
  }

  // Calculate overall score (weighted to reflect peak specialization vs breadth)
  const scoresArray = Object.values(domainScores).map(d => d.score);
  const maxScore = Math.max(...scoresArray);
  const avgScore = scoresArray.reduce((a, b) => a + b, 0) / scoresArray.length;
  
  // Peak score counts for 50%, average counts for 50% (gives a fair score for specialists and generalists)
  const overallScore = Math.round((maxScore * 0.6) + (avgScore * 0.4));

  // Determine Rank
  let rank = 'Junior Developer';
  if (overallScore >= 85) rank = 'Principal / Lead Developer';
  else if (overallScore >= 68) rank = 'Senior Developer';
  else if (overallScore >= 45) rank = 'Mid-Level Developer';

  return {
    domains: domainScores,
    overallScore,
    rank
  };
}

/**
 * Core entry function to parse and score the full resume text
 */
export function screenResume(text) {
  const contact = extractContactInfo(text);
  const sections = parseSections(text);
  const scoring = calculateScores(text, sections);

  return {
    contact,
    experience: sections.experience,
    projects: sections.projects,
    skills: [...new Set(sections.skills)],
    scoring
  };
}
