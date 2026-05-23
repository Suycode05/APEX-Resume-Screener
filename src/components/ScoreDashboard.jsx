import React from 'react';
import { Layout, Server, Cloud, Cpu, Sparkles } from 'lucide-react';
import { TECH_DOMAINS } from '../utils/parser';

export default function ScoreDashboard({ scoring }) {
  const { domains } = scoring;

  // Domain UI customization mapping
  const domainConfig = {
    frontend: {
      title: 'Frontend Development',
      icon: Layout,
      colorClass: 'text-sky-400',
      strokeColor: '#38bdf8',
      bgColor: 'bg-sky-500/10 border-sky-500/20',
      pillColor: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
      description: 'Interfaces, component design, responsive styling, and client-side states.'
    },
    backend: {
      title: 'Backend Development',
      icon: Server,
      colorClass: 'text-emerald-400',
      strokeColor: '#34d399',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      pillColor: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
      description: 'APIs, microservices, databases, caching, and server-side runtimes.'
    },
    devops: {
      title: 'DevOps & Cloud',
      icon: Cloud,
      colorClass: 'text-amber-400',
      strokeColor: '#fbbf24',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      pillColor: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
      description: 'Containers, pipelines, orchestration, infrastructure scripting, and monitoring.'
    },
    dataAi: {
      title: 'Data Science & AI',
      icon: Cpu,
      colorClass: 'text-rose-400',
      strokeColor: '#f43f5e',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
      pillColor: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
      description: 'Dataframes, modeling, NLP, neural networks, vector search, and LLM automation.'
    }
  };

  const getScoreRating = (score) => {
    if (score >= 80) return 'Expert';
    if (score >= 50) return 'Intermediate';
    if (score >= 20) return 'Novice';
    return 'Unmatched';
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Intro */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Sparkles className="w-5 h-5 text-violet-400 animate-pulse" />
        <h3 className="text-lg font-semibold text-slate-200">Domain Proficiency Analysis</h3>
      </div>

      {/* Grid of Domain Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {Object.entries(domains).map(([key, value]) => {
          const config = domainConfig[key];
          const IconComponent = config.icon;
          const score = value.score;
          const rating = getScoreRating(score);

          // SVG radial configs
          const radius = 28;
          const circumference = 2 * Math.PI * radius;
          const strokeDashoffset = circumference * (1 - score / 100);

          return (
            <div 
              key={key} 
              className="relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/30 border border-slate-800/80 backdrop-blur-sm shadow-md hover:border-slate-700/60 transition-all duration-300"
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl bg-slate-800/80 border border-slate-700/50 ${config.colorClass}`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-slate-200">{config.title}</h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed pt-1.5 pr-2">
                    {config.description}
                  </p>
                </div>

                {/* Score Circle Gauge */}
                <div className="relative flex items-center justify-center shrink-0">
                  <svg className="w-16 h-16 transform -rotate-90">
                    <circle 
                      cx="32" 
                      cy="32" 
                      r={radius} 
                      stroke="rgba(30, 41, 59, 0.5)" 
                      strokeWidth="5" 
                      fill="transparent" 
                    />
                    <circle 
                      cx="32" 
                      cy="32" 
                      r={radius} 
                      stroke={config.strokeColor} 
                      strokeWidth="5" 
                      fill="transparent" 
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute text-center">
                    <span className="text-sm font-extrabold text-slate-100">{score}</span>
                    <span className="block text-[7px] text-slate-500 font-bold uppercase">{rating}</span>
                  </div>
                </div>
              </div>

              {/* Technologies Found */}
              <div className="mt-4 pt-3 border-t border-slate-800/50">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-2">
                  Matching Technologies Detected
                </span>
                
                {value.keywords.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {value.keywords.map(kw => {
                      // Find official capitalized name if possible
                      const originalDomain = TECH_DOMAINS[key];
                      const matchedWord = originalDomain.keywords.find(k => k === kw) || kw;
                      
                      // Capitalization helper
                      const displayWord = matchedWord
                        .split(' ')
                        .map(w => w === 'ai' || w === 'ml' || w === 'nlp' || w === 'llm' || w === 'aws' || w === 'gcp' || w === 'sql' || w === 'css' || w === 'html'
                          ? w.toUpperCase() 
                          : w.charAt(0).toUpperCase() + w.slice(1)
                        )
                        .join(' ');

                      return (
                        <span 
                          key={kw} 
                          className={`text-xs px-2.5 py-0.5 rounded-full border ${config.pillColor} font-mono`}
                        >
                          {displayWord}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs italic text-slate-500">
                    No relevant matching keywords found in text.
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
