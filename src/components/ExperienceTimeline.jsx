import React from 'react';
import { Calendar, Briefcase, ChevronRight, Award } from 'lucide-react';

export default function ExperienceTimeline({ experience }) {
  if (!experience || experience.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 italic bg-slate-900/10 rounded-2xl border border-slate-800">
        No work experience blocks detected.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Section Title */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <Briefcase className="w-5 h-5 text-violet-400" />
        <h3 className="text-lg font-semibold text-slate-200">Work Experience Timeline</h3>
      </div>

      {/* Timeline track container */}
      <div className="relative pl-6 md:pl-8 border-l-2 border-slate-800/80 space-y-8 ml-3 py-2">
        {experience.map((job, idx) => {
          // Highlight the first (most recent) item slightly differently
          const isLatest = idx === 0;

          return (
            <div key={idx} className="relative group">
              
              {/* Timeline Indicator Node */}
              <div 
                className={`absolute -left-[31px] md:-left-[39px] top-1.5 w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                  isLatest 
                    ? 'bg-violet-500 border-violet-400 shadow-[0_0_10px_#8b5cf6]' 
                    : 'bg-slate-900 border-slate-700 group-hover:border-violet-500'
                }`} 
              />

              {/* Job Entry Panel */}
              <div className="space-y-3">
                {/* Header Metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div>
                    <h4 className="text-base font-bold text-slate-100 group-hover:text-violet-400 transition-colors">
                      {job.title}
                    </h4>
                    <p className="text-sm font-semibold text-slate-400">
                      {job.company}
                    </p>
                  </div>
                  
                  {/* Date badge */}
                  <div className="flex items-center gap-1.5 self-start sm:self-center px-3 py-1 rounded-full bg-slate-800/50 border border-slate-800 text-xs text-slate-300 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-violet-400" />
                    <span>{job.duration || 'Not specified'}</span>
                    {job.years && (
                      <span className="text-[10px] text-slate-500 pl-1 border-l border-slate-700">
                        {job.years} {job.years === 1 ? 'yr' : 'yrs'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Bullet Points */}
                {job.bullets && job.bullets.length > 0 && (
                  <ul className="space-y-2 text-sm text-slate-400 leading-relaxed pl-1">
                    {job.bullets.map((bullet, bIdx) => (
                      <li key={bIdx} className="flex items-start gap-2.5">
                        <ChevronRight className="w-4 h-4 text-violet-500/70 shrink-0 mt-0.5" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
