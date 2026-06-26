'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, FileText, RefreshCw } from 'lucide-react';
import { RegulatoryMatter, RegulatoryArea, MatterStatus } from '@/lib/types';
import MetricCards from '@/components/MetricCards';
import MattersTable from '@/components/MattersTable';
import AIChat from '@/components/AIChat';
import ExecutiveSummaryModal from '@/components/ExecutiveSummaryModal';

export default function DashboardPage() {
  const [matters, setMatters] = useState<RegulatoryMatter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  const fetchMatters = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/matters');
      const data = await res.json();
      setMatters(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMatters(); }, [fetchMatters]);

  const companies = Array.from(new Set(matters.map(m => m.companyName))).sort();
  const areas: RegulatoryArea[] = ['Competition', 'Consumer Protection', 'Data Privacy', 'Financial Services', 'Tax', 'Employment', 'Antitrust', 'Securities'];
  const statuses: MatterStatus[] = ['Under Investigation', 'Litigation', 'Settlement Negotiations', 'Resolved', 'Monitoring'];

  const filtered = matters.filter(m => {
    const matchSearch = !search || 
      m.companyName.toLowerCase().includes(search.toLowerCase()) ||
      m.caseNumber.toLowerCase().includes(search.toLowerCase()) ||
      m.regulator.toLowerCase().includes(search.toLowerCase()) ||
      m.jurisdiction.toLowerCase().includes(search.toLowerCase());
    const matchArea = !areaFilter || m.area === areaFilter;
    const matchStatus = !statusFilter || m.status === statusFilter;
    const matchCompany = !companyFilter || m.companyName === companyFilter;
    return matchSearch && matchArea && matchStatus && matchCompany;
  });

  return (
    <div className="min-h-screen" style={{ background: '#070d1a' }}>
      {/* Top Navigation */}
      <nav className="glass border-b border-blue-900/30 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-2xl font-bold text-blue-400 tracking-widest">PROSUS</div>
              <div className="text-xs text-slate-400 tracking-wider uppercase">Regulatory Intelligence Portal</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchMatters}
              className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-900/20 transition-all"
              title="Refresh data"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setShowSummaryModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-700/50 text-blue-300 hover:bg-blue-900/30 transition-all text-sm font-medium"
            >
              <FileText size={16} />
              Generate Executive Summary
            </button>
            <Link
              href="/submit"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all text-sm font-medium"
            >
              <Plus size={16} />
              Submit Matter
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        {/* Metric Cards */}
        <div className="mb-8">
          <MetricCards matters={matters} />
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by company, case number, regulator..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 min-w-[240px] bg-navy-800/50 border border-blue-900/30 rounded-lg px-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-600/50 focus:bg-navy-700/50 transition-all"
              style={{ background: 'rgba(7,13,26,0.6)' }}
            />
            <select
              value={areaFilter}
              onChange={e => setAreaFilter(e.target.value)}
              className="bg-navy-800/50 border border-blue-900/30 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-600/50 transition-all"
              style={{ background: 'rgba(7,13,26,0.6)' }}
            >
              <option value="">All Areas</option>
              {areas.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="bg-navy-800/50 border border-blue-900/30 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-600/50 transition-all"
              style={{ background: 'rgba(7,13,26,0.6)' }}
            >
              <option value="">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select
              value={companyFilter}
              onChange={e => setCompanyFilter(e.target.value)}
              className="bg-navy-800/50 border border-blue-900/30 rounded-lg px-4 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-600/50 transition-all"
              style={{ background: 'rgba(7,13,26,0.6)' }}
            >
              <option value="">All Companies</option>
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {(search || areaFilter || statusFilter || companyFilter) && (
              <button
                onClick={() => { setSearch(''); setAreaFilter(''); setStatusFilter(''); setCompanyFilter(''); }}
                className="px-4 py-2 rounded-lg text-slate-400 hover:text-white border border-slate-700/50 hover:border-slate-600 text-sm transition-all"
              >
                Clear filters
              </button>
            )}
          </div>
          {filtered.length !== matters.length && (
            <div className="mt-2 text-xs text-slate-500">
              Showing {filtered.length} of {matters.length} matters
            </div>
          )}
        </div>

        {/* Table */}
        {loading ? (
          <div className="glass rounded-xl p-16 text-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <div className="text-slate-400 text-sm">Loading regulatory matters...</div>
          </div>
        ) : (
          <MattersTable matters={filtered} />
        )}
      </main>

      <AIChat />
      
      {showSummaryModal && (
        <ExecutiveSummaryModal onClose={() => setShowSummaryModal(false)} />
      )}
    </div>
  );
}
