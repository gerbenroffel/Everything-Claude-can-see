'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Search, SlidersHorizontal, FileText, Sparkles, Plus, Shield } from 'lucide-react';
import { RegulatoryMatter, RegulatoryArea, MatterStatus } from '@/lib/types';
import MetricCards from '@/components/MetricCards';
import MattersTable from '@/components/MattersTable';
import AIChat from '@/components/AIChat';
import ExecutiveSummaryModal from '@/components/ExecutiveSummaryModal';
import AreaBreakdown from '@/components/AreaBreakdown';

const AREAS: RegulatoryArea[] = [
  'Competition', 'Consumer Protection', 'Data Privacy',
  'Financial Services', 'Tax', 'Employment', 'Antitrust', 'Securities',
];

const STATUSES: MatterStatus[] = [
  'Under Investigation', 'Litigation', 'Settlement Negotiations', 'Resolved', 'Monitoring',
];

export default function DashboardPage() {
  const [matters, setMatters] = useState<RegulatoryMatter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('');
  const [status, setStatus] = useState('');
  const [company, setCompany] = useState('');
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    fetch('/api/matters')
      .then(r => r.json())
      .then(d => { setMatters(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const companies = [...new Set(matters.map(m => m.companyName))].sort();

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #04091a 0%, #070d1a 100%)' }}>
      {/* Top navigation */}
      <header className="sticky top-0 z-40 border-b border-slate-800/60" style={{ background: 'rgba(7,13,26,0.92)', backdropFilter: 'blur(20px)' }}>
        <div className="max-w-screen-2xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
              <Shield size={16} className="text-blue-400" />
            </div>
            <div>
              <div className="font-bold text-slate-100 tracking-tight leading-none">PROSUS</div>
              <div className="text-xs text-slate-500 leading-none mt-0.5">Regulatory Intelligence Portal</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSummary(true)}
              className="flex items-center gap-2 text-sm text-purple-300 hover:text-purple-200 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/20 hover:border-purple-500/40 rounded-lg px-4 py-2 transition-all"
            >
              <Sparkles size={14} />
              Executive Summary
            </button>
            <Link
              href="/submit"
              className="flex items-center gap-2 text-sm text-white bg-blue-600 hover:bg-blue-500 rounded-lg px-4 py-2 transition-colors"
            >
              <Plus size={14} />
              Submit Matter
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-6 py-6 space-y-6">
        {/* Metrics */}
        {loading ? (
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 shimmer rounded-xl" />
            ))}
          </div>
        ) : (
          <MetricCards matters={matters} />
        )}

        {/* Main content */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-4">
          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-4">
            <AreaBreakdown matters={matters} />

            {/* Company distribution */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Cases by Company</h3>
              <div className="space-y-2">
                {companies.map(co => {
                  const count = matters.filter(m => m.companyName === co && m.status !== 'Resolved').length;
                  const critical = matters.filter(m => m.companyName === co && m.riskLevel === 'Critical' && m.status !== 'Resolved').length;
                  if (count === 0) return null;
                  return (
                    <button
                      key={co}
                      onClick={() => setCompany(company === co ? '' : co)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                        company === co
                          ? 'bg-blue-600/20 border border-blue-500/30 text-slate-200'
                          : 'hover:bg-slate-800/40 text-slate-400'
                      }`}
                    >
                      <span>{co}</span>
                      <div className="flex items-center gap-1.5">
                        {critical > 0 && <span className="text-xs text-red-400 font-semibold">⚠ {critical}</span>}
                        <span className="text-xs bg-slate-800 rounded px-1.5 py-0.5">{count}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Table area */}
          <div className="xl:col-span-3 space-y-3">
            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  className="input-dark w-full rounded-lg pl-9 pr-3 py-2 text-sm"
                  placeholder="Search cases, regulators, companies…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <SlidersHorizontal size={13} className="text-slate-500" />
              </div>

              <select
                className="input-dark rounded-lg px-3 py-2 text-sm cursor-pointer"
                value={area}
                onChange={e => setArea(e.target.value)}
              >
                <option value="">All Areas</option>
                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>

              <select
                className="input-dark rounded-lg px-3 py-2 text-sm cursor-pointer"
                value={status}
                onChange={e => setStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>

              {(search || area || status || company) && (
                <button
                  onClick={() => { setSearch(''); setArea(''); setStatus(''); setCompany(''); }}
                  className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 rounded-lg px-3 py-2 transition-all"
                >
                  Clear filters
                </button>
              )}
            </div>

            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-14 shimmer rounded-lg" />
                ))}
              </div>
            ) : (
              <MattersTable
                matters={matters}
                searchQuery={search}
                areaFilter={area}
                statusFilter={status}
                companyFilter={company}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-slate-700 py-4 border-t border-slate-800/30">
          Prosus Regulatory Intelligence Portal · Confidential · For authorised users only
        </footer>
      </main>

      {/* AI Chat */}
      <AIChat />

      {/* Executive Summary Modal */}
      {showSummary && <ExecutiveSummaryModal onClose={() => setShowSummary(false)} />}
    </div>
  );
}
