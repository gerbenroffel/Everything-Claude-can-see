'use client';
import { useState, useMemo } from 'react';
import { RegulatoryMatter, RiskLevel, MatterStatus } from '@/lib/types';
import { ChevronDown, ChevronUp, AlertTriangle, Lock, ChevronRight } from 'lucide-react';

const riskClass: Record<RiskLevel, string> = {
  Critical: 'badge-critical',
  High: 'badge-high',
  Medium: 'badge-medium',
  Low: 'badge-low',
};

const statusClass: Record<MatterStatus, string> = {
  'Under Investigation': 'status-under-investigation',
  'Litigation': 'status-litigation',
  'Settlement Negotiations': 'status-settlement',
  'Resolved': 'status-resolved',
  'Monitoring': 'status-monitoring',
};

function formatAmount(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  return `$${(n / 1_000_000).toFixed(0)}M`;
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const COMPANY_COLORS: Record<string, string> = {
  iFood: 'bg-red-500',
  Meesho: 'bg-pink-500',
  OLX: 'bg-blue-500',
  Swiggy: 'bg-orange-500',
  Brainly: 'bg-purple-500',
  PayU: 'bg-cyan-500',
  Udemy: 'bg-violet-500',
  'Stack Overflow': 'bg-amber-500',
  eMAG: 'bg-emerald-500',
  Takealot: 'bg-teal-500',
};

interface Props {
  matters: RegulatoryMatter[];
  searchQuery: string;
  areaFilter: string;
  statusFilter: string;
  companyFilter: string;
}

type SortKey = 'riskScore' | 'potentialExposureAmount' | 'dateStarted' | 'companyName';

export default function MattersTable({ matters, searchQuery, areaFilter, statusFilter, companyFilter }: Props) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('riskScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = useMemo(() => {
    let list = matters;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(m =>
        m.companyName.toLowerCase().includes(q) ||
        m.caseNumber.toLowerCase().includes(q) ||
        m.regulator.toLowerCase().includes(q) ||
        m.summary.toLowerCase().includes(q) ||
        m.area.toLowerCase().includes(q)
      );
    }
    if (areaFilter) list = list.filter(m => m.area === areaFilter);
    if (statusFilter) list = list.filter(m => m.status === statusFilter);
    if (companyFilter) list = list.filter(m => m.companyName === companyFilter);

    return [...list].sort((a, b) => {
      const av = a[sortKey] as string | number;
      const bv = b[sortKey] as string | number;
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
  }, [matters, searchQuery, areaFilter, statusFilter, companyFilter, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <ChevronUp size={12} className="opacity-20" />;
    return sortDir === 'desc' ? <ChevronDown size={12} className="text-blue-400" /> : <ChevronUp size={12} className="text-blue-400" />;
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-800/60">
              {[
                { label: 'Case #', key: null },
                { label: 'Company', key: 'companyName' as SortKey },
                { label: 'Date', key: 'dateStarted' as SortKey },
                { label: 'Regulator', key: null },
                { label: 'Area', key: null },
                { label: 'Summary', key: null },
                { label: 'Exposure', key: 'potentialExposureAmount' as SortKey },
                { label: 'Risk', key: 'riskScore' as SortKey },
                { label: 'Status', key: null },
                { label: '', key: null },
              ].map(({ label, key }) => (
                <th
                  key={label}
                  className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${key ? 'cursor-pointer hover:text-slate-300 select-none' : ''}`}
                  onClick={() => key && toggleSort(key)}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    {key && <SortIcon k={key} />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m, i) => (
              <>
                <tr
                  key={m.id}
                  className={`table-row-hover border-b border-slate-800/40 cursor-pointer fade-in ${m.status === 'Resolved' ? 'opacity-60' : ''}`}
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
                  onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                >
                  <td className="px-4 py-3 font-mono text-xs text-slate-400">{m.caseNumber}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${COMPANY_COLORS[m.companyName] ?? 'bg-slate-500'}`} />
                      <span className="font-medium text-slate-200 whitespace-nowrap">{m.companyName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{formatDate(m.dateStarted)}</td>
                  <td className="px-4 py-3">
                    <div className="text-slate-300 whitespace-nowrap">{m.regulator}</div>
                    <div className="text-xs text-slate-500">{m.jurisdiction}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge area-badge">{m.area}</span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">{m.summary}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-semibold text-slate-200">{formatAmount(m.potentialExposureAmount)}</div>
                    {m.potentialExposureCriminal && (
                      <div className="flex items-center gap-1 text-xs text-red-400 mt-0.5">
                        <Lock size={10} />
                        <span>Criminal</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="tooltip-trigger">
                      <span className={`badge ${riskClass[m.riskLevel]}`}>
                        {m.riskLevel === 'Critical' && <AlertTriangle size={10} />}
                        {m.riskLevel} · {m.riskScore}
                      </span>
                      <div className="tooltip-content">{m.riskRationale}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge ${statusClass[m.status]}`}>{m.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <ChevronRight
                      size={16}
                      className={`text-slate-600 transition-transform duration-200 ${expanded === m.id ? 'rotate-90 text-blue-400' : ''}`}
                    />
                  </td>
                </tr>
                {expanded === m.id && (
                  <tr key={`${m.id}-expanded`} className="bg-navy-800/50">
                    <td colSpan={10} className="px-6 py-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Full Summary</h4>
                          <p className="text-slate-300 text-sm leading-relaxed">{m.summary}</p>
                          <div className="mt-4">
                            <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Exposure Details</h4>
                            <p className="text-slate-300 text-sm leading-relaxed">{m.exposureDescription}</p>
                          </div>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-2">AI Risk Assessment</h4>
                          <div className={`inline-flex items-center gap-2 badge ${riskClass[m.riskLevel]} mb-3`}>
                            {m.riskLevel === 'Critical' && <AlertTriangle size={12} />}
                            {m.riskLevel} Risk · Score {m.riskScore}/100
                          </div>
                          <p className="text-slate-300 text-sm leading-relaxed">{m.riskRationale}</p>
                          <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                            <div>
                              <span className="text-slate-500">Submitted by</span>
                              <div className="text-slate-300 mt-0.5">{m.submittedBy}</div>
                            </div>
                            <div>
                              <span className="text-slate-500">Last updated</span>
                              <div className="text-slate-300 mt-0.5">{formatDate(m.lastUpdated)}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <FileText size={32} className="mx-auto mb-3 opacity-30" />
            <p>No matters match your filters</p>
          </div>
        )}
      </div>
      <div className="px-4 py-3 border-t border-slate-800/60 text-xs text-slate-500">
        Showing {filtered.length} of {matters.length} matters · Click a row to expand details · Hover risk badge for AI rationale
      </div>
    </div>
  );
}

function FileText(props: { size: number; className?: string }) {
  return (
    <svg width={props.size} height={props.size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
      <line x1="16" y1="13" x2="8" y2="13"/>
      <line x1="16" y1="17" x2="8" y2="17"/>
      <polyline points="10 9 9 9 8 9"/>
    </svg>
  );
}
