'use client';

import { useEffect, useState } from 'react';
import { FileText, DollarSign, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import { RegulatoryMatter } from '@/lib/types';

interface Props {
  matters: RegulatoryMatter[];
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

function formatExposure(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${Math.round(amount / 1_000_000)}M`;
  return `$${amount.toLocaleString()}`;
}

export default function MetricCards({ matters }: Props) {
  const totalExposure = matters.reduce((sum, m) => sum + m.potentialExposureAmount, 0);
  const criticalHigh = matters.filter(m => m.riskLevel === 'Critical' || m.riskLevel === 'High').length;
  const openCases = matters.filter(m => m.status !== 'Resolved' && m.status !== 'Monitoring').length;
  const resolved = matters.filter(m => m.status === 'Resolved').length;

  const totalCount = useCountUp(matters.length);
  const criticalHighCount = useCountUp(criticalHigh);
  const openCount = useCountUp(openCases);
  const resolvedCount = useCountUp(resolved);

  const exposureMillion = Math.round(totalExposure / 1_000_000);
  const exposureCount = useCountUp(exposureMillion);
  const exposureDisplay = totalExposure >= 1_000_000_000 
    ? `$${(exposureCount / 1000).toFixed(1)}B`
    : `$${exposureCount}M`;

  const cards = [
    {
      label: 'Total Cases',
      value: totalCount.toString(),
      icon: FileText,
      iconColor: 'text-blue-400',
      iconBg: 'rgba(59,130,246,0.1)',
      border: 'rgba(59,130,246,0.2)',
    },
    {
      label: 'Total Exposure',
      value: exposureDisplay,
      icon: DollarSign,
      iconColor: 'text-purple-400',
      iconBg: 'rgba(168,85,247,0.1)',
      border: 'rgba(168,85,247,0.2)',
    },
    {
      label: 'Critical & High Risk',
      value: criticalHighCount.toString(),
      icon: AlertTriangle,
      iconColor: 'text-red-400',
      iconBg: 'rgba(239,68,68,0.1)',
      border: 'rgba(239,68,68,0.2)',
      valueColor: 'text-red-400',
    },
    {
      label: 'Active Cases',
      value: openCount.toString(),
      icon: Clock,
      iconColor: 'text-yellow-400',
      iconBg: 'rgba(234,179,8,0.1)',
      border: 'rgba(234,179,8,0.2)',
      valueColor: 'text-yellow-400',
    },
    {
      label: 'Resolved',
      value: resolvedCount.toString(),
      icon: CheckCircle,
      iconColor: 'text-green-400',
      iconBg: 'rgba(34,197,94,0.1)',
      border: 'rgba(34,197,94,0.2)',
      valueColor: 'text-green-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="glass rounded-xl p-5 fade-in glass-hover"
            style={{ borderColor: card.border }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg" style={{ background: card.iconBg }}>
                <Icon size={18} className={card.iconColor} />
              </div>
            </div>
            <div className={`text-3xl font-bold mb-1 ${(card as any).valueColor || 'text-white'}`}>
              {card.value}
            </div>
            <div className="text-xs text-slate-400 font-medium tracking-wide uppercase">
              {card.label}
            </div>
          </div>
        );
      })}
    </div>
  );
}
