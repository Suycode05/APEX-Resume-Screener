import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, Sparkles } from 'lucide-react';

export default function ResumeUpload({ onFileSelected, loading, error }) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const processFile = (file) => {
    if (!file) return;
    
    const fileType = file.name.split('.').pop().toLowerCase();
    if (fileType !== 'pdf' && fileType !== 'txt') {
      alert('Only PDF and TXT files are supported.');
      return;
    }
    
    onFileSelected(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
      // Clear file value to allow re-uploading the same file
      e.target.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Upload Box Container using semantic HTML Label for native input forwarding */}
      <label 
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center min-h-[220px] rounded-2xl border-2 border-dashed transition-all duration-300 p-8 text-center cursor-pointer ${
          isDragActive 
            ? 'border-violet-500 bg-violet-950/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]' 
            : 'border-slate-700 hover:border-violet-500/50 bg-slate-900/40 hover:bg-slate-900/60'
        } ${loading ? 'pointer-events-none opacity-90' : ''}`}
      >
        {/* Native file input, hidden visually but clickable via parent label */}
        <input 
          type="file" 
          className="hidden" 
          accept=".pdf,.txt" 
          onChange={handleChange}
          disabled={loading}
        />

        {loading ? (
          /* SCANNING/LOADING STATE */
          <div className="flex flex-col items-center justify-center w-full space-y-6 py-4">
            {/* Visual Document Scanner Animation */}
            <div className="relative w-20 h-24 rounded-lg bg-slate-800 border-2 border-slate-700 flex items-center justify-center overflow-hidden shadow-inner">
              <FileText className="w-10 h-10 text-slate-500 animate-pulse" />
              {/* Animated Laser Scanning Beam */}
              <div className="absolute left-0 right-0 h-1 bg-violet-400 shadow-[0_0_8px_#a78bfa] animate-scan" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-200 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-400 animate-spin" />
                Screening with LangGraph
              </h3>
              <p className="text-xs text-slate-400 max-w-[250px] mx-auto leading-relaxed">
                FastAPI running stateful cognitive extraction, grading, and summarization...
              </p>
            </div>
          </div>
        ) : (
          /* DEFAULT IDLE STATE */
          <div className="flex flex-col items-center justify-center space-y-4 py-4">
            <div className="p-4 bg-slate-800/80 border border-slate-700 rounded-2xl shadow-md text-violet-400 group-hover:scale-105 transition-transform duration-300">
              <Upload className="w-8 h-8" />
            </div>
            
            <div className="space-y-1">
              <p className="text-base font-medium text-slate-200">
                Drag and drop your resume file here
              </p>
              <p className="text-sm text-slate-400">
                or <span className="text-violet-400 font-semibold hover:underline">browse files</span> from your computer
              </p>
            </div>
            
            <div className="flex gap-4 pt-2 text-[10px] text-slate-500 font-mono">
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">PDF Document</span>
              <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700">Plain Text (TXT)</span>
            </div>
          </div>
        )}
      </label>

      {/* Error Alert Box */}
      {error && (
        <div className="mt-4 p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-300 flex items-start gap-3 text-sm animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-red-200">API Error:</span> {error}
          </div>
        </div>
      )}
    </div>
  );
}
