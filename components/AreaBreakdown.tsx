'use client';
import { RegulatoryMatter } from '@/lib/types';

const AREA_COLORS: Record<string, string> = {
  'Competition':        '#60a5fa',
  'Consumer Protection':'#34d399',
  'Data Privacy':       '#a78bfa',
  'Financial Services': '#f472b6',
  'Tax':                '#fb923c',
  'Employment':         '#fbbf24',
  'Antitrust':          '#f87171',
  'Securities':         '#38bdf8',
};

interface Props { matters: RegulatoryMatter[] }

export default function AreaBreakdown({ matters }: Props) {
  const open = matters.filter(m => m.status !== 'Resolved');
  const counts: Record<string, number> = {};
  const exposure: Record<string, number> = {};
  open.forEach(m => {
    counts[m.area] = (counts[m.area] ?? 0) + 1;
    exposure[m.area] = (exposure[m.area] ?? 0) + m.potentialExposureAmount;
  });

  const areas = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  const maxCount = Math.max(...areas.map(([, n]) => n), 1);

  return (
    <div className="glass-card rounded-xl p-5">
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Open Matters by Area</h3>
      <div className="space-y-3">
        {areas.map(([area, count]) => {
          const color = AREA_COLORS[area] ?? '#94a3b8';
          const pct = (count / maxCount) * 100;
          const exp = exposure[area] ?? 0;
          return (
            <div key={area}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-300">{area}</span>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  <span className="font-mono">${(exp / 1_000_000).toFixed(0)}M</span>
                  <span className="font-semibold" style={{ color }}>{count}</span>
                </div>
              </div>
              <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
