'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Shield, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { RegulatoryArea, MatterStatus, RiskLevel } from '@/lib/types';

const COMPANIES = ['iFood', 'Meesho', 'OLX', 'Swiggy', 'Brainly', 'PayU', 'Udemy', 'Stack Overflow', 'eMAG', 'Takealot'];
const AREAS: RegulatoryArea[] = ['Competition', 'Consumer Protection', 'Data Privacy', 'Financial Services', 'Tax', 'Employment', 'Antitrust', 'Securities'];
const STATUSES: MatterStatus[] = ['Under Investigation', 'Litigation', 'Settlement Negotiations', 'Resolved', 'Monitoring'];

const riskColors: Record<RiskLevel, string> = {
  Critical: 'text-red-400 border-red-500/30 bg-red-500/10',
  High: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  Medium: 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
  Low: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
};

interface SubmitResult {
  id: string;
  caseNumber: string;
  riskLevel: RiskLevel;
  riskScore: number;
  riskRationale: string;
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

  function set(key: string, value: string | boolean) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/matters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          potentialExposureAmount: Number(form.potentialExposureAmount) * 1_000_000,
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      const data = await res.json();
      setResult(data);
    } catch {
      setError('Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(180deg, #04091a 0%, #070d1a 100%)' }}>
        <div className="glass rounded-2xl p-8 max-w-lg w-full text-center slide-up">
          <div className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={28} className="text-emerald-400" />
          </div>
          <h2 className="text-xl font-bold text-slate-200 mb-1">Matter Submitted</h2>
          <p className="text-slate-500 text-sm mb-6">Case {result.caseNumber} has been registered and risk-assessed</p>

          <div className={`rounded-xl border p-5 mb-6 ${riskColors[result.riskLevel]}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={18} />
              <span className="font-bold text-lg">AI Risk Assessment</span>
            </div>
            <div className="text-3xl font-bold mb-1">{result.riskLevel} Risk</div>
            <div className="text-sm opacity-80 mb-3">Score: {result.riskScore} / 100</div>
            <p className="text-sm opacity-90 leading-relaxed text-left">{result.riskRationale}</p>
          </div>

          <div className="flex gap-3">
            <Link href="/" className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors text-center">
              View Dashboard
            </Link>
            <button
              onClick={() => { setResult(null); setForm({ companyName: '', caseNumber: '', dateStarted: '', regulator: '', jurisdiction: '', area: '', summary: '', potentialExposureAmount: '', potentialExposureCriminal: false, exposureDescription: '', status: '', submittedBy: '' }); }}
              className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors text-center"
            >
              Submit Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #04091a 0%, #070d1a 100%)' }}>
      <header className="sticky top-0 z-40 border-b border-slate-800/60" style={{ background: 'rgba(7,13,26,0.92)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-4">
          <Link href="/" className="text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Shield size={14} className="text-blue-400" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm tracking-tight">PROSUS</div>
              <div className="text-xs text-slate-500">Submit Regulatory Matter</div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Report a Regulatory Matter</h1>
          <p className="text-slate-400 text-sm">Submit new regulatory matters for your portfolio company. AI will automatically assess the risk level upon submission.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company & Case */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 border-b border-slate-800/60 pb-3">Case Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Portfolio Company *</label>
                <select required className="input-dark w-full rounded-lg px-3 py-2.5 text-sm" value={form.companyName} onChange={e => set('companyName', e.target.value)}>
                  <option value="">Select company</option>
                  {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Case / Reference Number *</label>
                <input required placeholder="e.g. REG-2024-015" className="input-dark w-full rounded-lg px-3 py-2.5 text-sm" value={form.caseNumber} onChange={e => set('caseNumber', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Date Matter Started *</label>
                <input required type="date" className="input-dark w-full rounded-lg px-3 py-2.5 text-sm" value={form.dateStarted} onChange={e => set('dateStarted', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Current Status *</label>
                <select required className="input-dark w-full rounded-lg px-3 py-2.5 text-sm" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="">Select status</option>
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Regulator */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 border-b border-slate-800/60 pb-3">Regulatory Authority</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Regulator Name *</label>
                <input required placeholder="e.g. Competition Commission of India (CCI)" className="input-dark w-full rounded-lg px-3 py-2.5 text-sm" value={form.regulator} onChange={e => set('regulator', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Jurisdiction *</label>
                <input required placeholder="e.g. India" className="input-dark w-full rounded-lg px-3 py-2.5 text-sm" value={form.jurisdiction} onChange={e => set('jurisdiction', e.target.value)} />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Regulatory Area *</label>
                <select required className="input-dark w-full rounded-lg px-3 py-2.5 text-sm" value={form.area} onChange={e => set('area', e.target.value)}>
                  <option value="">Select area</option>
                  {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Allegations */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 border-b border-slate-800/60 pb-3">Matter Details</h2>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Summary of Allegations *</label>
              <textarea
                required
                rows={4}
                placeholder="Describe the regulatory matter, the allegations or concerns raised, and the key facts…"
                className="input-dark w-full rounded-lg px-3 py-2.5 text-sm resize-none"
                value={form.summary}
                onChange={e => set('summary', e.target.value)}
              />
              <p className="text-xs text-slate-600 mt-1">{form.summary.length} characters (minimum 50 recommended)</p>
            </div>
          </div>

          {/* Exposure */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 border-b border-slate-800/60 pb-3">Potential Exposure</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Financial Exposure (USD millions) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="0"
                    className="input-dark w-full rounded-lg pl-7 pr-10 py-2.5 text-sm"
                    value={form.potentialExposureAmount}
                    onChange={e => set('potentialExposureAmount', e.target.value)}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs">M</span>
                </div>
              </div>
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-3 cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={form.potentialExposureCriminal}
                      onChange={e => set('potentialExposureCriminal', e.target.checked)}
                    />
                    <div className={`w-10 h-5 rounded-full transition-colors ${form.potentialExposureCriminal ? 'bg-red-600' : 'bg-slate-700'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full mt-0.5 transition-transform ${form.potentialExposureCriminal ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-300">Criminal / Personal Liability</div>
                    <div className="text-xs text-slate-500">Includes potential prosecution of officers</div>
                  </div>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Exposure Description *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe how the exposure figure was calculated, what it covers (fines, remediation, legal costs), and any key assumptions…"
                className="input-dark w-full rounded-lg px-3 py-2.5 text-sm resize-none"
                value={form.exposureDescription}
                onChange={e => set('exposureDescription', e.target.value)}
              />
            </div>
          </div>

          {/* Submitter */}
          <div className="glass-card rounded-xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-slate-300 border-b border-slate-800/60 pb-3">Submission Details</h2>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Submitted By (Name & Title) *</label>
              <input required placeholder="e.g. Jane Smith, Chief Compliance Officer" className="input-dark w-full rounded-lg px-3 py-2.5 text-sm" value={form.submittedBy} onChange={e => set('submittedBy', e.target.value)} />
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4 pb-8">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
              {submitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Submitting &amp; Assessing Risk…
                </>
              ) : (
                <>
                  <Shield size={16} />
                  Submit &amp; Generate AI Risk Score
                </>
              )}
            </button>
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition-colors">Cancel</Link>
          </div>
        </form>
      </main>
    </div>
  );
}
