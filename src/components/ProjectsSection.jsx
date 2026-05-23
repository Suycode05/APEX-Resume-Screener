import React from 'react';
import { FolderGit2, Code, Terminal, Target } from 'lucide-react';
import { TECH_DOMAINS } from '../utils/parser';

export default function ProjectsSection({ projects }) {
  if (!projects || projects.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 italic bg-slate-900/10 rounded-2xl border border-slate-800">
        No project blocks detected.
      </div>
    );
  }

  // Extract all technology keywords across domains to search in projects
  const allTechKeywords = Object.values(TECH_DOMAINS).reduce((acc, domain) => {
    return [...acc, ...domain.keywords];
  }, []);

  // Unique list of tags
  const uniqueTechKeywords = [...new Set(allTechKeywords)];

  // Helper to extract keywords from a project block
  const detectProjectTech = (project) => {
    const text = `${project.title} ${project.bullets.join(' ') || ''}`.toLowerCase();
    const detected = [];
    
    uniqueTechKeywords.forEach(keyword => {
      // Avoid matching substrings
      const regex = new RegExp(`\\b${keyword.replace('.', '\\.')}\\b`, 'i');
      if (regex.test(text)) {
        detected.push(keyword);
      }
    });

    return [...new Set(detected)];
  };

  const capitalizeTech = (tech) => {
    const upperList = ['ai', 'ml', 'nlp', 'llm', 'aws', 'gcp', 'sql', 'css', 'html', 'ci/cd', 'k8s', 'saas'];
    if (upperList.includes(tech.toLowerCase())) {
      return tech.toUpperCase();
    }
    return tech.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="space-y-6">
      
      {/* Section Title */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <FolderGit2 className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-slate-200">Extracted Projects</h3>
      </div>

      {/* Grid of Projects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj, idx) => {
          const detectedTech = detectProjectTech(proj);

          return (
            <div 
              key={idx} 
              className="flex flex-col justify-between p-5 rounded-2xl bg-slate-900/30 border border-slate-800/80 hover:border-slate-700/60 transition-all duration-300 shadow-md group relative overflow-hidden"
            >
              {/* Highlight bar top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500/30 to-blue-500/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="space-y-3">
                {/* Project Header */}
                <div className="flex justify-between items-start gap-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 text-violet-400 group-hover:scale-105 transition-transform">
                      <Code className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-200 group-hover:text-violet-400 transition-colors">
                      {proj.title}
                    </h4>
                  </div>
                </div>

                {/* Bullets details */}
                {proj.bullets && proj.bullets.length > 0 && (
                  <ul className="space-y-1.5 text-xs text-slate-400 leading-relaxed pl-1">
                    {proj.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-500/70 mt-1.5 shrink-0" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Technologies identified in this project */}
              <div className="mt-4 pt-3 border-t border-slate-800/50">
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mb-2">
                  Matching Stack Detected
                </span>
                
                {detectedTech.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {detectedTech.map(tech => (
                      <span 
                        key={tech} 
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono"
                      >
                        {capitalizeTech(tech)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="text-[10px] italic text-slate-500">
                    No matching keywords detected in description text.
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
