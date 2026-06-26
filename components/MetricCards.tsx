'use client';
import { useEffect, useState } from 'react';
import { RegulatoryMatter } from '@/lib/types';
import { AlertTriangle, DollarSign, FileText, Clock, CheckCircle } from 'lucide-react';

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setValue(target); clearInterval(timer); }
      else setValue(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

function formatExposure(total: number) {
  if (total >= 1_000_000_000) return `$${(total / 1_000_000_000).toFixed(2)}B`;
  return `$${(total / 1_000_000).toFixed(0)}M`;
}

interface Props { matters: RegulatoryMatter[] }

export default function MetricCards({ matters }: Props) {
  const total = matters.length;
  const totalExposure = matters.filter(m => m.status !== 'Resolved').reduce((s, m) => s + m.potentialExposureAmount, 0);
  const critical = matters.filter(m => m.riskLevel === 'Critical' && m.status !== 'Resolved').length;
  const open = matters.filter(m => m.status !== 'Resolved').length;
  const resolved = matters.filter(m => m.status === 'Resolved').length;

  const animTotal = useCountUp(total);
  const animCritical = useCountUp(critical);
  const animOpen = useCountUp(open);
  const animResolved = useCountUp(resolved);

  const cards = [
    {
      label: 'Total Cases',
      value: animTotal,
      display: String(animTotal),
      icon: FileText,
      color: 'text-blue-400',
      border: 'border-blue-500/20',
      glow: 'shadow-blue-500/5',
    },
    {
      label: 'Open Exposure',
      value: totalExposure,
      display: formatExposure(totalExposure),
      icon: DollarSign,
      color: 'text-purple-400',
      border: 'border-purple-500/20',
      glow: 'shadow-purple-500/5',
    },
    {
      label: 'Critical / High Risk',
      value: animCritical,
      display: `${animCritical} / ${matters.filter(m => (m.riskLevel === 'Critical' || m.riskLevel === 'High') && m.status !== 'Resolved').length}`,
      icon: AlertTriangle,
      color: 'text-red-400',
      border: 'border-red-500/20',
      glow: 'shadow-red-500/5',
    },
    {
      label: 'Open Matters',
      value: animOpen,
      display: String(animOpen),
      icon: Clock,
      color: 'text-amber-400',
      border: 'border-amber-500/20',
      glow: 'shadow-amber-500/5',
    },
    {
      label: 'Resolved',
      value: animResolved,
      display: String(animResolved),
      icon: CheckCircle,
      color: 'text-emerald-400',
      border: 'border-emerald-500/20',
      glow: 'shadow-emerald-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className={`glass-card rounded-xl p-4 shadow-lg ${card.glow} fade-in`}
          style={{ animationDelay: `${i * 80}ms`, animationFillMode: 'both' }}
        >
          <div className="flex items-start justify-between mb-3">
            <card.icon size={18} className={card.color} />
            <div className={`w-1.5 h-1.5 rounded-full ${card.color.replace('text-', 'bg-')} opacity-60`} />
          </div>
          <div className={`text-2xl font-bold ${card.color} count-up mb-1`}>{card.display}</div>
          <div className="text-xs text-slate-500 font-medium">{card.label}</div>
        </div>
      ))}
    </div>
  );
}
