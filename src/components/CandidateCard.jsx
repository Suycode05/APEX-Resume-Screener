import React from 'react';
import { Mail, Phone, Award, User, Target, Brain } from 'lucide-react';

export default function CandidateCard({ contact, scoring, skillsCount }) {
  const { name, email, phone, github, linkedin } = contact;
  const { overallScore, rank } = scoring;

  // Classify rank badge colors
  const getRankBadgeClasses = (rankStr) => {
    const r = rankStr.toLowerCase();
    if (r.includes('lead') || r.includes('principal')) {
      return 'bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]';
    }
    if (r.includes('senior')) {
      return 'bg-violet-500/10 text-violet-300 border-violet-500/30 shadow-[0_0_12px_rgba(139,92,246,0.15)]';
    }
    if (r.includes('mid')) {
      return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
    }
    return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
  };

  return (
    <div className="relative w-full rounded-2xl bg-slate-900/40 border border-slate-800/80 p-6 overflow-hidden backdrop-blur-md shadow-lg flex flex-col gap-4">
      
      {/* Decorative Radial Background Light */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
      
      {/* Top Header Section */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 w-full">
        {/* Info Group */}
        <div className="flex items-start gap-4 z-10">
          <div className="hidden sm:flex p-4 bg-slate-800/60 border border-slate-700/50 rounded-2xl text-slate-300 shadow-inner shrink-0">
            <User className="w-8 h-8" />
          </div>
          
          <div className="space-y-2">
            <div>
              <h2 className="text-2xl font-bold text-slate-100 tracking-tight">{name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className={`px-3 py-0.5 rounded-full border text-xs font-semibold ${getRankBadgeClasses(rank)}`}>
                  {rank}
                </span>
                <span className="text-xs text-slate-500 px-2 py-0.5 rounded-full bg-slate-800/50 border border-slate-800">
                  {skillsCount} Skills Detected
                </span>
              </div>
            </div>

            {/* Contact Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 pt-2 text-sm text-slate-400">
              <a 
                href={`mailto:${email}`} 
                className="flex items-center gap-2 hover:text-violet-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span className="truncate max-w-[200px]">{email}</span>
              </a>
              
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{phone}</span>
              </div>

              {github && (
                <a 
                  href={github} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 hover:text-violet-400 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.137 20.162 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                  </svg>
                  <span className="truncate max-w-[200px]">{github.replace('https://', '')}</span>
                </a>
              )}

              {linkedin && (
                <a 
                  href={linkedin} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-2 hover:text-violet-400 transition-colors"
                >
                  <svg className="w-4 h-4 text-slate-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  <span className="truncate max-w-[200px]">{linkedin.replace('https://', '')}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Scoring Circle Component */}
        <div className="flex items-center gap-4 shrink-0 bg-slate-800/20 border border-slate-800/80 p-4 rounded-2xl z-10 w-full md:w-auto">
          <div className="relative flex items-center justify-center">
            {/* Radial progress ring */}
            <svg className="w-20 h-20 transform -rotate-90">
              {/* Track */}
              <circle 
                cx="40" 
                cy="40" 
                r="34" 
                stroke="rgba(30, 41, 59, 0.8)" 
                strokeWidth="6" 
                fill="transparent" 
              />
              {/* Indicator */}
              <circle 
                cx="40" 
                cy="40" 
                r="34" 
                stroke="url(#gradOverall)" 
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray={2 * Math.PI * 34}
                strokeDashoffset={2 * Math.PI * 34 * (1 - overallScore / 100)}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradOverall" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            {/* Central Score Text */}
            <div className="absolute text-center">
              <span className="text-xl font-extrabold text-slate-100">{overallScore}</span>
              <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">Index</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Tech Fit Score</span>
            <span className="text-sm font-semibold text-slate-200 mt-0.5">
              {overallScore >= 80 ? 'Highly Qualified' : overallScore >= 55 ? 'Role-Qualified' : 'Foundational Match'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5 leading-tight max-w-[150px]">
              Weighted evaluation based on projects & work breadth.
            </span>
          </div>
        </div>
      </div>

      {/* AI Screener report (Pushed to bottom) */}
      {scoring.summary && (
        <div className="w-full pt-3 border-t border-slate-800/60 flex items-start gap-3 text-xs text-slate-300 bg-slate-950/20 p-3.5 rounded-xl z-10">
          <Brain className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-extrabold text-violet-300 uppercase tracking-widest text-[9px] block">
              AI Recruiter Summary
            </span>
            <p className="leading-relaxed italic text-slate-300">
              "{scoring.summary}"
            </p>
          </div>
        </div>
      )}

    </div>
  );
}
