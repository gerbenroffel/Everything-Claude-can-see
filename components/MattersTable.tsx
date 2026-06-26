'use client';

import { useState } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronRight } from 'lucide-react';
import { RegulatoryMatter } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  matters: RegulatoryMatter[];
}

type SortKey = keyof RegulatoryMatter;
type SortDir = 'asc' | 'desc';

function formatExposure(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${Math.round(amount / 1_000_000)}M`;
  return `$${amount.toLocaleString()}`;
}

function RiskBadge({ level, score, rationale }: { level: string; score: number; rationale: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const cls = clsx('px-2 py-1 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 cursor-help relative', {
    'badge-critical': level === 'Critical',
    'badge-high': level === 'High',
    'badge-medium': level === 'Medium',
    'badge-low': level === 'Low',
  });
  return (
    <div className="relative inline-block">
      <span
        className={cls}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <span className="font-mono">{score}</span>
        <span className="opacity-60">|</span>
        {level}
      </span>
      {showTooltip && (
        <div
          className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-3 rounded-lg text-xs text-slate-200 shadow-2xl"
          style={{ background: '#0d1526', border: '1px solid rgba(59,130,246,0.3)' }}
        >
          <div className="font-semibold text-blue-300 mb-1">Risk Rationale</div>
          {rationale}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent"
            style={{ borderTopColor: 'rgba(59,130,246,0.3)' }}
          />
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const cls = clsx('px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap', {
    'status-under-investigation': status === 'Under Investigation',
    'status-litigation': status === 'Litigation',
    'status-settlement': status === 'Settlement Negotiations',
    'status-resolved': status === 'Resolved',
    'status-monitoring': status === 'Monitoring',
  });
  return <span className={cls}>{status}</span>;
}

function SortIcon({ col, sortKey, sortDir }: { col: SortKey; sortKey: SortKey; sortDir: SortDir }) {
  if (col !== sortKey) return <ChevronsUpDown size={13} className="text-slate-600" />;
  return sortDir === 'asc' ? <ChevronUp size={13} className="text-blue-400" /> : <ChevronDown size={13} className="text-blue-400" />;
}

export default function MattersTable({ matters }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>('riskScore');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('desc');
    }
  };

  const sorted = [...matters].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === 'number' && typeof bv === 'number') {
      return sortDir === 'asc' ? av - bv : bv - av;
    }
    const as = String(av);
    const bs = String(bv);
    return sortDir === 'asc' ? as.localeCompare(bs) : bs.localeCompare(as);
  });

  const cols: { key: SortKey; label: string; className?: string }[] = [
    { key: 'caseNumber', label: 'Case #' },
    { key: 'companyName', label: 'Company' },
    { key: 'regulator', label: 'Regulator' },
    { key: 'jurisdiction', label: 'Jurisdiction' },
    { key: 'area', label: 'Area' },
    { key: 'potentialExposureAmount', label: 'Exposure', className: 'text-right' },
    { key: 'potentialExposureCriminal', label: 'Criminal' },
    { key: 'riskScore', label: 'Risk' },
    { key: 'status', label: 'Status' },
    { key: 'lastUpdated', label: 'Updated' },
  ];

  if (matters.length === 0) {
    return (
      <div className="glass rounded-xl p-16 text-center">
        <div className="text-slate-500 text-sm">No matters match your current filters.</div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(59,130,246,0.1)', background: 'rgba(4,9,26,0.6)' }}>
              <th className="w-8" />
              {cols.map(col => (
                <th
                  key={col.key}
                  className={clsx(
                    'px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-blue-300 select-none transition-colors whitespace-nowrap',
                    col.className
                  )}
                  onClick={() => handleSort(col.key)}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.label}
                    <SortIcon col={col.key} sortKey={sortKey} sortDir={sortDir} />
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((matter, idx) => {
              const isExpanded = expandedId === matter.id;
              const isEven = idx % 2 === 0;
              return (
                <>
                  <tr
                    key={matter.id}
                    className="cursor-pointer transition-all group"
                    style={{
                      background: isEven ? 'rgba(7,13,26,0.4)' : 'rgba(13,21,38,0.3)',
                      borderBottom: '1px solid rgba(30,53,97,0.2)',
                    }}
                    onClick={() => setExpandedId(isExpanded ? null : matter.id)}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(30,53,97,0.3)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = isEven ? 'rgba(7,13,26,0.4)' : 'rgba(13,21,38,0.3)';
                    }}
                  >
                    <td className="pl-4 pr-1 py-3.5">
                      <ChevronRight
                        size={14}
                        className={clsx('text-slate-500 transition-transform', { 'rotate-90 text-blue-400': isExpanded })}
                      />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-slate-400">{matter.caseNumber}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-100">{matter.companyName}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-300">{matter.regulator}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-slate-400 text-xs">{matter.jurisdiction}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(59,130,246,0.08)', color: '#93c5fd', border: '1px solid rgba(59,130,246,0.15)' }}>
                        {matter.area}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <span className="font-semibold text-slate-200 font-mono">{formatExposure(matter.potentialExposureAmount)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      {matter.potentialExposureCriminal && (
                        <span className="text-xs px-2 py-1 rounded font-semibold" style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.3)' }}>
                          Criminal
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <RiskBadge level={matter.riskLevel} score={matter.riskScore} rationale={matter.riskRationale} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={matter.status} />
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-xs text-slate-500 font-mono">{matter.lastUpdated}</span>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr key={`${matter.id}-expanded`} className="slide-in">
                      <td colSpan={11} style={{ background: 'rgba(4,9,26,0.8)', borderBottom: '1px solid rgba(59,130,246,0.15)' }}>
                        <div className="px-8 py-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Case Summary</h4>
                            <p className="text-slate-300 text-sm leading-relaxed">{matter.summary}</p>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Risk Rationale</h4>
                              <p className="text-slate-300 text-sm leading-relaxed">{matter.riskRationale}</p>
                            </div>
                            <div>
                              <h4 className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-2">Exposure Description</h4>
                              <p className="text-slate-400 text-sm">{matter.exposureDescription}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                              <div><span className="text-slate-500">Date Started:</span> <span className="text-slate-300 ml-1">{matter.dateStarted}</span></div>
                              <div><span className="text-slate-500">Submitted by:</span> <span className="text-slate-300 ml-1">{matter.submittedBy}</span></div>
                              <div><span className="text-slate-500">Case Number:</span> <span className="text-slate-300 font-mono ml-1">{matter.caseNumber}</span></div>
                              <div><span className="text-slate-500">Last Updated:</span> <span className="text-slate-300 font-mono ml-1">{matter.lastUpdated}</span></div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 text-xs text-slate-500 border-t border-blue-900/20">
        {matters.length} matter{matters.length !== 1 ? 's' : ''} - Click any row to expand details
      </div>
    </div>
  );
}
