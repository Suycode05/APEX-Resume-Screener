import React, { useState, useEffect } from 'react';
import ResumeUpload from './components/ResumeUpload';
import CandidateCard from './components/CandidateCard';
import ScoreDashboard from './components/ScoreDashboard';
import ExperienceTimeline from './components/ExperienceTimeline';
import ProjectsSection from './components/ProjectsSection';
import { 
  Sparkles, 
  RotateCcw, 
  Eye, 
  Brain, 
  ShieldCheck, 
  FileText, 
  ChevronRight, 
  Code, 
  Briefcase,
  UserCheck,
  TrendingUp,
  SlidersHorizontal,
  Trash2,
  ListTodo
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8008/api";

export default function App() {
  const [candidatesList, setCandidatesList] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [sortBy, setSortBy] = useState('overallScore');

  // Fetch candidate list on mount or when sort parameter changes
  const fetchCandidates = async (sortByField = 'overallScore', selectOption = 'keep') => {
    try {
      console.log("[fetchCandidates] Called with sortByField =", sortByField, "selectOption =", selectOption);
      const res = await fetch(`${API_BASE}/candidates?sortBy=${sortByField}`);
      if (!res.ok) throw new Error("Failed to fetch candidate list.");
      const data = await res.json();
      setCandidatesList(data);
      console.log("[fetchCandidates] Fetched candidates list. Total:", data.length);
      
      if (data.length > 0) {
        if (selectOption === 'top') {
          console.log("[fetchCandidates] Option is 'top'. Selecting:", data[0].contact.name);
          setSelectedCandidate(data[0]);
        } else if (selectOption && typeof selectOption === 'object') {
          console.log("[fetchCandidates] Option is specific candidate object:", selectOption.contact?.name);
          const matched = data.find(c => c.contact.email.toLowerCase() === selectOption.contact.email.toLowerCase());
          console.log("[fetchCandidates] Matched in list:", matched ? matched.contact.name : "not found");
          setSelectedCandidate(matched || selectOption);
        } else {
          // 'keep' behavior: try to preserve the existing selection
          setSelectedCandidate(prev => {
            console.log("[fetchCandidates] Option is 'keep'. prev =", prev ? prev.contact.name : "null");
            if (!prev) {
              console.log("[fetchCandidates] No prev selection. Selecting top candidate:", data[0].contact.name);
              return data[0];
            }
            const matched = data.find(c => c.contact.email.toLowerCase() === prev.contact.email.toLowerCase());
            console.log("[fetchCandidates] Preserving prev or updated:", matched ? matched.contact.name : data[0].contact.name);
            return matched || data[0];
          });
        }
      } else {
        console.log("[fetchCandidates] Data empty. Selecting null.");
        setSelectedCandidate(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCandidates(sortBy, 'keep');
  }, [sortBy]);

  // Handle new resume uploading to backend FastAPI
  const handleFileSelected = async (file) => {
    setIsParsing(true);
    setUploadError(null);
    
    const formData = new FormData();
    formData.append("file", file);

    try {
      console.log("[handleFileSelected] Starting upload for file:", file.name);
      const res = await fetch(`${API_BASE}/screen`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to process candidate resume.");
      }

      console.log("[handleFileSelected] Upload success. Received candidate:", data.contact?.name);
      // Success: set selection directly to the newly parsed candidate
      setSelectedCandidate(data);
      // Re-fetch list to update leaderboard and pass the new candidate to select it
      await fetchCandidates(sortBy, data);
      setActiveTab('overview');
    } catch (err) {
      console.error("[handleFileSelected] Error during upload:", err);
      setUploadError(err.message || "Connection refused by FastAPI server.");
    } finally {
      setIsParsing(false);
    }
  };

  // Clear all candidates
  const handleClearLeaderboard = async () => {
    if (!confirm("Are you sure you want to clear all candidates from the database?")) return;
    try {
      const res = await fetch(`${API_BASE}/candidates`, { method: "DELETE" });
      if (res.ok) {
        setCandidatesList([]);
        setSelectedCandidate(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Reset database with default candidates
  const handleResetSandbox = async () => {
    try {
      const res = await fetch(`${API_BASE}/candidates/reset`, { method: "POST" });
      if (res.ok) {
        await fetchCandidates(sortBy, 'top');
        setActiveTab('overview');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Classify score indicators
  const getRankBadgeClasses = (rankStr) => {
    const r = rankStr.toLowerCase();
    if (r.includes('lead') || r.includes('principal')) return 'bg-amber-500/10 text-amber-300 border-amber-500/20';
    if (r.includes('senior')) return 'bg-violet-500/10 text-violet-300 border-violet-500/20';
    if (r.includes('mid')) return 'bg-blue-500/10 text-blue-300 border-blue-500/20';
    return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-violet-500/30 selection:text-violet-200">
      
      {/* Abstract background ambient lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      {/* HEADER BAR */}
      <header className="sticky top-0 z-50 border-b border-slate-900/80 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-tr from-violet-600 to-blue-600 rounded-xl shadow-lg shadow-violet-600/15">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              APEX Resume Screener
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
              LangGraph Stateful Cognitive Grader
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleResetSandbox}
            className="flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 hover:bg-slate-900/80 text-slate-300 transition-all font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reload Sandbox
          </button>
          
          <button 
            onClick={handleClearLeaderboard}
            className="flex items-center gap-2 text-xs px-3.5 py-1.5 rounded-xl border border-red-950/30 hover:border-red-900/40 bg-red-950/10 hover:bg-red-950/20 text-red-300 transition-all font-semibold"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Registry
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 z-10">
        
        {/* LEFT COLUMN: UPLOAD & RANKED LEADERBOARD (takes 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* File Upload zone */}
          <div className="p-5 rounded-2xl bg-slate-900/20 border border-slate-800/80 backdrop-blur-md shadow-md space-y-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
              Screen Resume
            </h3>
            
            <ResumeUpload 
              onFileSelected={handleFileSelected}
              loading={isParsing}
              error={uploadError}
            />

            <div className="flex items-center gap-2 px-1 text-slate-500 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Parsed securely by FastAPI & LangGraph nodes.</span>
            </div>
          </div>

          {/* Leaderboard/Ranked List */}
          <div className="p-5 rounded-2xl bg-slate-900/20 border border-slate-800/80 backdrop-blur-md shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-violet-400" />
                Live Rankings
              </h3>
              
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-slate-300 focus:outline-none focus:border-violet-500 cursor-pointer"
                >
                  <option value="overallScore">Overall Index</option>
                  <option value="frontend">Frontend Fit</option>
                  <option value="backend">Backend Fit</option>
                  <option value="devops">DevOps Fit</option>
                  <option value="dataAi">Data & AI Fit</option>
                </select>
              </div>
            </div>

            {candidatesList.length > 0 ? (
              <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
                {candidatesList.map((cand, idx) => {
                  const isSelected = selectedCandidate && selectedCandidate.contact.email === cand.contact.email;
                  const activeScore = sortBy === 'overallScore' 
                    ? cand.scoring.overallScore 
                    : cand.scoring.domains[sortBy].score;

                  return (
                    <button
                      key={cand.id}
                      onClick={() => {
                        setSelectedCandidate(cand);
                        setActiveTab('overview');
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-300 w-full hover:scale-[1.01] ${
                        isSelected
                          ? 'bg-violet-950/20 border-violet-500/50 shadow-[0_0_10px_rgba(139,92,246,0.1)]'
                          : 'bg-slate-900/30 border-slate-800/80 hover:border-slate-700/60 hover:bg-slate-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-750 flex items-center justify-center text-[10px] text-slate-400 font-bold shrink-0">
                          {idx + 1}
                        </div>
                        <div className="text-left min-w-0">
                          <span className="font-bold text-slate-200 text-xs block truncate">
                            {cand.contact.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {cand.scoring.rank}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-mono font-extrabold text-slate-200">
                            {activeScore}
                          </span>
                          <span className="block text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                            Index
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-xs italic text-slate-500 py-6 text-center">
                No candidates screened yet. Upload a resume to populate rankings!
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: MAIN DASHBOARD VIEWS (takes 8 cols) */}
        <div className="lg:col-span-8 flex flex-col min-h-[500px]">
          
          {isParsing ? (
            /* VISUAL LOADING SPINNER */
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-slate-900/10 border border-slate-850 rounded-2xl backdrop-blur-sm">
              <div className="w-12 h-12 rounded-full border-2 border-violet-500/20 border-t-violet-400 animate-spin" />
              <p className="text-slate-400 text-sm mt-4 font-semibold animate-pulse">
                Calling Python FastAPI... Executing LangGraph pipeline...
              </p>
            </div>
          ) : selectedCandidate ? (
            /* ACTIVE RESULTS DASHBOARD */
            <div className="flex-grow space-y-6">
              
              {/* Dynamic Header profile */}
              <CandidateCard 
                contact={selectedCandidate.contact} 
                scoring={selectedCandidate.scoring}
                skillsCount={selectedCandidate.skills.length}
              />

              {/* NAVIGATION TABS */}
              <div className="flex border-b border-slate-800 overflow-x-auto pb-px">
                {[
                  { id: 'overview', name: 'Overview & Scores', icon: Brain },
                  { id: 'timeline', name: 'Work History', icon: Briefcase },
                  { id: 'projects', name: 'Extracted Projects', icon: Code },
                  { id: 'leaderboard', name: 'Comparison Leaderboard', icon: ListTodo }
                ].map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all shrink-0 ${
                        isActive
                          ? 'border-violet-500 text-violet-400 bg-violet-950/5'
                          : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.name}
                    </button>
                  );
                })}
              </div>

              {/* TAB PANELS CONTAINER */}
              <div className="p-6 rounded-2xl bg-slate-900/10 border border-slate-800/80 backdrop-blur-md min-h-[350px]">
                {activeTab === 'overview' && (
                  <ScoreDashboard scoring={selectedCandidate.scoring} />
                )}
                {activeTab === 'timeline' && (
                  <ExperienceTimeline experience={selectedCandidate.experience} />
                )}
                {activeTab === 'projects' && (
                  <ProjectsSection projects={selectedCandidate.projects} />
                )}
                {activeTab === 'leaderboard' && (
                  /* FULL DETAILED LEADERBOARD VIEW */
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <ListTodo className="w-4 h-4 text-violet-400" />
                        Candidate Comparison Leaderboard
                      </h3>
                      <span className="text-xs text-slate-500">
                        Comparing {candidatesList.length} candidates
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm text-slate-400">
                        <thead className="text-xs uppercase bg-slate-900/50 border-b border-slate-850 text-slate-500 font-bold tracking-wider">
                          <tr>
                            <th className="px-4 py-3">Rank</th>
                            <th className="px-4 py-3">Name</th>
                            <th className="px-4 py-3">Overall</th>
                            <th className="px-4 py-3">Frontend</th>
                            <th className="px-4 py-3">Backend</th>
                            <th className="px-4 py-3">DevOps</th>
                            <th className="px-4 py-3">Data / AI</th>
                            <th className="px-4 py-3">Hiring Tier</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {candidatesList.map((cand, idx) => {
                            const isCurrent = cand.contact.email === selectedCandidate.contact.email;

                            return (
                              <tr 
                                key={cand.id}
                                onClick={() => setSelectedCandidate(cand)}
                                className={`cursor-pointer hover:bg-slate-900/40 transition-colors ${
                                  isCurrent ? 'bg-violet-950/10 text-slate-200' : ''
                                }`}
                              >
                                <td className="px-4 py-3.5 font-bold font-mono">#{idx + 1}</td>
                                <td className="px-4 py-3.5 font-semibold text-slate-200 truncate max-w-[150px]">
                                  {cand.contact.name}
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="px-2 py-0.5 rounded bg-slate-900 text-violet-400 font-mono font-extrabold">
                                    {cand.scoring.overallScore}
                                  </span>
                                </td>
                                <td className="px-4 py-3.5 font-mono">{cand.scoring.domains.frontend.score}</td>
                                <td className="px-4 py-3.5 font-mono">{cand.scoring.domains.backend.score}</td>
                                <td className="px-4 py-3.5 font-mono">{cand.scoring.domains.devops.score}</td>
                                <td className="px-4 py-3.5 font-mono">{cand.scoring.domains.dataAi.score}</td>
                                <td className="px-4 py-3.5">
                                  <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-semibold whitespace-nowrap ${getRankBadgeClasses(cand.scoring.rank)}`}>
                                    {cand.scoring.rank}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* DEFAULT LANDING INSTRUCTION VIEW */
            <div className="flex-grow flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl bg-slate-900/10 border border-slate-900/80 backdrop-blur-md relative overflow-hidden">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-600/5 rounded-full blur-[80px]" />
              
              <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-3xl text-violet-400 shadow-lg mb-6 relative">
                <Brain className="w-12 h-12" />
              </div>

              <h2 className="text-xl md:text-2xl font-extrabold text-slate-200 tracking-tight max-w-[450px] leading-tight">
                No active candidates. Populate the rankings leaderboard to compare profiles.
              </h2>
              <p className="text-sm text-slate-500 max-w-[400px] mt-3 leading-relaxed">
                Click **"Reload Sandbox"** in the top right to restore the demo candidates, or drop a resume on the left to begin your own evaluations.
              </p>
            </div>
          )}

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950/40 text-center py-4 text-xs text-slate-600 font-medium">
        APEX Resume Screener • Python FastAPI + LangChain + LangGraph Backend • React Tailwind v4
      </footer>
    </div>
  );
}
