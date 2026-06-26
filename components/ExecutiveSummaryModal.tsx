'use client';

import { useState, useEffect } from 'react';
import { X, Copy, CheckCheck } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function ExecutiveSummaryModal({ onClose }: Props) {
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const generate = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/ai/summary', { method: 'POST' });
        const data = await res.json();
        setSummary(data.summary || 'Unable to generate summary.');
      } catch {
        setSummary('An error occurred while generating the executive summary.');
      } finally {
        setLoading(false);
      }
    };
    generate();
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl shadow-2xl fade-in max-h-[80vh] flex flex-col"
        style={{ background: '#0d1526', border: '1px solid rgba(59,130,246,0.25)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(59,130,246,0.15)' }}>
          <div>
            <h2 className="text-lg font-semibold text-white">Executive Summary</h2>
            <p className="text-xs text-slate-500 mt-0.5">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          <div className="flex items-center gap-2">
            {!loading && summary && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: copied ? '#86efac' : '#93c5fd' }}
              >
                {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-blue-900/30 text-slate-400 hover:text-white transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-slate-400 text-sm">Generating board-ready executive summary...</div>
              <div className="text-slate-600 text-xs">Analysing all regulatory matters with AI</div>
            </div>
          ) : (
            <div className="prose prose-invert max-w-none">
              <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
