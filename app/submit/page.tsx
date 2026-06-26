'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { RegulatoryArea, MatterStatus, RiskLevel } from '@/lib/types';
import clsx from 'clsx';

const COMPANIES = [
  'OLX Brazil', 'OLX Germany', 'Swiggy', 'iFood', 'PayU India', 
  'PayU Canada', 'Udemy', 'Stack Overflow', 'eMAG', 'Takealot', 
  'Meesho', 'Brainly', 'Other'
];

const AREAS: RegulatoryArea[] = ['Competition', 'Consumer Protection', 'Data Privacy', 'Financial Services', 'Tax', 'Employment', 'Antitrust', 'Securities'];
const STATUSES: MatterStatus[] = ['Under Investigation', 'Litigation', 'Settlement Negotiations', 'Resolved', 'Monitoring'];

interface SubmitResult {
  riskLevel: RiskLevel;
  riskScore: number;
  riskRationale: string;
  caseNumber: string;
}

export default function SubmitPage() {
  const [form, setForm] = useState({
    companyName: '',
    caseNumber: '',
    dateStarted: '',
    regulator: '',
    jurisdiction: '',
    area: '' as RegulatoryArea | '',
    summary: '',
    potentialExposureAmount: '',
    potentialExposureCriminal: false,
    exposureDescription: '',
    status: '' as MatterStatus | '',
    submittedBy: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement;
    setForm(prev => ({
      ...prev,
      [e.target.name]: target.type === 'checkbox' ? target.checked : e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/matters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Submission failed');
      const data = await res.json();
      setResult({
        riskLevel: data.riskLevel,
        riskScore: data.riskScore,
        riskRationale: data.riskRationale,
        caseNumber: data.caseNumber,
      });
    } catch (err) {
      setError('Failed to submit matter. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none transition-all";
  const inputStyle = { background: 'rgba(7,13,26,0.7)', border: '1px solid rgba(59,130,246,0.2)' };
  const inputFocusStyle = 'focus:ring-1 focus:ring-blue-500/50';
  const labelClass = "block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5";

  if (result) {
    const riskColors: Record<RiskLevel, string> = {
      Critical: '#ef4444', High: '#f97316', Medium: '#eab308', Low: '#22c55e',
    };
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: '#070d1a' }}>
        <div className="glass rounded-2xl p-10 max-w-lg w-full text-center fade-in">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)' }}>
            <CheckCircle size={32} className="text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Matter Submitted</h2>
          <p className="text-slate-400 text-sm mb-6">Case number: <span className="text-blue-300 font-mono">{result.caseNumber}</span></p>
          
          <div className="rounded-xl p-5 mb-6 text-left" style={{ background: 'rgba(4,9,26,0.6)', border: `1px solid ${riskColors[result.riskLevel]}30` }}>
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-3">AI Risk Assessment</div>
            <div className="flex items-center gap-3 mb-4">
              <div className="text-4xl font-bold" style={{ color: riskColors[result.riskLevel] }}>{result.riskScore}</div>
              <div>
                <div className="font-semibold text-lg" style={{ color: riskColors[result.riskLevel] }}>{result.riskLevel} Risk</div>
                <div className="text-xs text-slate-500">Risk Score (0-100)</div>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{result.riskRationale}</p>
          </div>

          <div className="flex gap-3">
            <Link href="/" className="flex-1 py-2.5 rounded-xl text-center text-sm text-slate-300 hover:text-white transition-all" style={{ border: '1px solid rgba(59,130,246,0.2)' }}>
              Back to Dashboard
            </Link>
            <button
              onClick={() => { setResult(null); setForm({ companyName: '', caseNumber: '', dateStarted: '', regulator: '', jurisdiction: '', area: '', summary: '', potentialExposureAmount: '', potentialExposureCriminal: false, exposureDescription: '', status: '', submittedBy: '' }); }}
              className="flex-1 py-2.5 rounded-xl text-center text-sm bg-blue-600 hover:bg-blue-500 text-white transition-all"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#070d1a' }}>
      <nav className="glass border-b border-blue-900/30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-white transition-all text-sm">
            <ArrowLeft size={16} /> Back to Dashboard
          </Link>
          <div className="h-4 w-px bg-slate-700" />
          <div>
            <div className="text-sm font-semibold text-white">Submit Regulatory Matter</div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">New Regulatory Matter</h1>
          <p className="text-slate-400 text-sm">Submit a new matter for tracking. AI will automatically assess risk level and score.</p>
        </div>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm text-red-300" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-5">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Company Name *</label>
                <select name="companyName" value={form.companyName} onChange={handleChange} required className={`${inputClass} ${inputFocusStyle}`} style={inputStyle}>
                  <option value="">Select company...</option>
                  {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Case Number</label>
                <input name="caseNumber" value={form.caseNumber} onChange={handleChange} placeholder="Auto-generated if blank" className={`${inputClass} ${inputFocusStyle}`} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass}>Submitted By *</label>
                <input name="submittedBy" value={form.submittedBy} onChange={handleChange} required placeholder="Your name" className={`${inputClass} ${inputFocusStyle}`} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass}>Date Started *</label>
                <input type="date" name="dateStarted" value={form.dateStarted} onChange={handleChange} required className={`${inputClass} ${inputFocusStyle}`} style={inputStyle} />
              </div>
            </div>
          </div>

          {/* Regulatory Details */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-5">Regulatory Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Regulator *</label>
                <input name="regulator" value={form.regulator} onChange={handleChange} required placeholder="e.g. CADE, FTC, ICO..." className={`${inputClass} ${inputFocusStyle}`} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass}>Jurisdiction *</label>
                <input name="jurisdiction" value={form.jurisdiction} onChange={handleChange} required placeholder="e.g. Brazil, United States..." className={`${inputClass} ${inputFocusStyle}`} style={inputStyle} />
              </div>
              <div>
                <label className={labelClass}>Regulatory Area *</label>
                <select name="area" value={form.area} onChange={handleChange} required className={`${inputClass} ${inputFocusStyle}`} style={inputStyle}>
                  <option value="">Select area...</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Status *</label>
                <select name="status" value={form.status} onChange={handleChange} required className={`${inputClass} ${inputFocusStyle}`} style={inputStyle}>
                  <option value="">Select status...</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-5">
              <label className={labelClass}>Case Summary *</label>
              <textarea
                name="summary"
                value={form.summary}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Provide a detailed description of the regulatory matter, allegations, and background..."
                className={`${inputClass} ${inputFocusStyle} resize-none`}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Exposure */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wider mb-5">Financial Exposure</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className={labelClass}>Potential Exposure Amount (USD) *</label>
                <input
                  type="number"
                  name="potentialExposureAmount"
                  value={form.potentialExposureAmount}
                  onChange={handleChange}
                  required
                  min="0"
                  placeholder="e.g. 25000000"
                  className={`${inputClass} ${inputFocusStyle}`}
                  style={inputStyle}
                />
              </div>
              <div className="flex items-center">
                <label className="flex items-center gap-3 cursor-pointer mt-4">
                  <div className="relative">
                    <input
                      type="checkbox"
                      name="potentialExposureCriminal"
                      checked={form.potentialExposureCriminal}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div
                      className="w-10 h-6 rounded-full transition-colors"
                      style={{ background: form.potentialExposureCriminal ? '#ef4444' : 'rgba(59,130,246,0.2)' }}
                    >
                      <div
                        className="w-4 h-4 bg-white rounded-full absolute top-1 transition-transform"
                        style={{ transform: form.potentialExposureCriminal ? 'translateX(20px)' : 'translateX(4px)' }}
                      />
                    </div>
                  </div>
                  <span className="text-sm text-slate-300">Criminal Exposure Risk</span>
                </label>
              </div>
            </div>
            <div className="mt-5">
              <label className={labelClass}>Exposure Description *</label>
              <textarea
                name="exposureDescription"
                value={form.exposureDescription}
                onChange={handleChange}
                required
                rows={3}
                placeholder="Describe the nature and basis of the financial exposure estimate..."
                className={`${inputClass} ${inputFocusStyle} resize-none`}
                style={inputStyle}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">
              * AI will automatically generate risk level, score, and rationale
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Analysing with AI...
                </>
              ) : (
                'Submit & Generate Risk Score'
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
