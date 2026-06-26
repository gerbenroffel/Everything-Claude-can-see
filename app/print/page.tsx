'use client';

import { useEffect, useState } from 'react';
import { RegulatoryMatter, RiskLevel } from '@/lib/types';

function formatAmount(n: number) {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  return `$${(n / 1_000_000).toFixed(0)}M`;
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
}

const riskColors: Record<RiskLevel, string> = {
  Critical: '#dc2626',
  High: '#ea580c',
  Medium: '#ca8a04',
  Low: '#16a34a',
};

const riskBg: Record<RiskLevel, string> = {
  Critical: '#fef2f2',
  High: '#fff7ed',
  Medium: '#fefce8',
  Low: '#f0fdf4',
};

export default function PrintPage() {
  const [matters, setMatters] = useState<RegulatoryMatter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/matters')
      .then(r => r.json())
      .then(d => { setMatters(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const totalExposure = matters.reduce((s, m) => s + m.potentialExposureAmount, 0);
  const open = matters.filter(m => m.status !== 'Resolved').length;
  const criminal = matters.filter(m => m.potentialExposureCriminal).length;
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Georgia, serif' }}>
        Loading…
      </div>
    );
  }

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: white; color: #111; font-family: 'Georgia', serif; }

        .no-print {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 999;
          display: flex;
          gap: 10px;
        }
        .btn {
          padding: 10px 20px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          font-size: 14px;
          font-family: sans-serif;
          font-weight: 600;
        }
        .btn-print { background: #1d4ed8; color: white; }
        .btn-back  { background: #f1f5f9; color: #334155; }

        @media print {
          .no-print { display: none !important; }
          .page-break { page-break-before: always; }
          body { font-size: 11pt; }
        }

        .page { max-width: 900px; margin: 0 auto; padding: 48px 40px; }

        /* Cover */
        .cover-header { border-bottom: 3px solid #1d4ed8; padding-bottom: 24px; margin-bottom: 32px; }
        .cover-title  { font-size: 28px; font-weight: bold; color: #1e3a8a; letter-spacing: -0.5px; }
        .cover-sub    { font-size: 13px; color: #64748b; margin-top: 4px; font-family: sans-serif; }
        .cover-meta   { display: flex; gap: 40px; margin-top: 24px; }
        .meta-item label { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-family: sans-serif; margin-bottom: 3px; }
        .meta-item .value { font-size: 22px; font-weight: bold; color: #1e3a8a; font-family: sans-serif; }
        .meta-item .sub   { font-size: 11px; color: #64748b; font-family: sans-serif; }

        /* Summary table */
        .summary-table { width: 100%; border-collapse: collapse; margin-top: 32px; font-family: sans-serif; font-size: 11px; }
        .summary-table th { background: #1e3a8a; color: white; padding: 8px 10px; text-align: left; font-weight: 600; }
        .summary-table td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; vertical-align: top; }
        .summary-table tr:nth-child(even) td { background: #f8fafc; }

        /* Matter cards */
        .section-title { font-size: 18px; font-weight: bold; color: #1e3a8a; margin: 40px 0 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; font-family: sans-serif; }
        .matter-card  { border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 20px; overflow: hidden; }
        .matter-header { padding: 14px 16px; display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; }
        .matter-case   { font-size: 10px; font-family: monospace; color: #64748b; margin-bottom: 3px; }
        .matter-title  { font-size: 15px; font-weight: bold; color: #0f172a; font-family: sans-serif; }
        .matter-meta   { font-size: 11px; color: #64748b; font-family: sans-serif; margin-top: 2px; }
        .risk-badge    { padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; font-family: sans-serif; white-space: nowrap; text-align: center; }
        .matter-body   { padding: 0 16px 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .matter-section h4 { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #94a3b8; font-family: sans-serif; font-weight: 700; margin-bottom: 6px; }
        .matter-section p  { font-size: 11.5px; color: #334155; line-height: 1.6; }
        .matter-footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 8px 16px; display: flex; gap: 24px; font-size: 10px; color: #64748b; font-family: sans-serif; }
        .matter-footer span b { color: #334155; }

        .status-pill { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; font-family: sans-serif; background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
        .criminal-flag { display: inline-block; padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; font-family: sans-serif; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; margin-left: 6px; }

        .footer { margin-top: 48px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; font-family: sans-serif; text-align: center; }
      `}</style>

      {/* Print / Back buttons — hidden when printing */}
      <div className="no-print">
        <button className="btn btn-back" onClick={() => window.history.back()}>← Back</button>
        <button className="btn btn-print" onClick={() => window.print()}>🖨 Print / Save as PDF</button>
      </div>

      <div className="page">
        {/* Cover header */}
        <div className="cover-header">
          <div className="cover-title">PROSUS GROUP</div>
          <div className="cover-title" style={{ fontSize: 20, marginTop: 4 }}>Regulatory Matters — Portfolio Report</div>
          <div className="cover-sub">CONFIDENTIAL · For authorised recipients only · Generated {today}</div>

          <div className="cover-meta">
            <div className="meta-item">
              <label>Total Matters</label>
              <div className="value">{matters.length}</div>
            </div>
            <div className="meta-item">
              <label>Open Exposure</label>
              <div className="value">{formatAmount(totalExposure)}</div>
            </div>
            <div className="meta-item">
              <label>Open Cases</label>
              <div className="value">{open}</div>
              <div className="sub">of {matters.length} total</div>
            </div>
            <div className="meta-item">
              <label>Criminal Exposure</label>
              <div className="value" style={{ color: criminal > 0 ? '#dc2626' : '#16a34a' }}>{criminal}</div>
              <div className="sub">matter{criminal !== 1 ? 's' : ''}</div>
            </div>
            <div className="meta-item">
              <label>Critical / High Risk</label>
              <div className="value" style={{ color: '#dc2626' }}>
                {matters.filter(m => m.riskLevel === 'Critical' || m.riskLevel === 'High').length}
              </div>
            </div>
          </div>
        </div>

        {/* Summary table */}
        <div style={{ fontFamily: 'sans-serif', fontSize: 13, fontWeight: 600, color: '#1e3a8a', marginBottom: 12 }}>
          Summary of All Matters
        </div>
        <table className="summary-table">
          <thead>
            <tr>
              <th>Case #</th>
              <th>Company</th>
              <th>Regulator</th>
              <th>Area</th>
              <th>Exposure</th>
              <th>Risk</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {matters.map(m => (
              <tr key={m.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 10 }}>{m.caseNumber}</td>
                <td style={{ fontWeight: 600 }}>{m.companyName}</td>
                <td>{m.regulator}<br /><span style={{ color: '#94a3b8', fontSize: 10 }}>{m.jurisdiction}</span></td>
                <td>{m.area}</td>
                <td style={{ fontWeight: 600 }}>
                  {formatAmount(m.potentialExposureAmount)}
                  {m.potentialExposureCriminal && <span style={{ color: '#dc2626', fontSize: 10, display: 'block' }}>+ Criminal</span>}
                </td>
                <td>
                  <span style={{ color: riskColors[m.riskLevel], fontWeight: 700 }}>
                    {m.riskLevel} ({m.riskScore})
                  </span>
                </td>
                <td>{m.status}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Detailed matter cards */}
        <div className="section-title page-break">Detailed Matter Descriptions</div>

        {matters.map((m, i) => (
          <div key={m.id} className="matter-card" style={{ borderLeftWidth: 4, borderLeftColor: riskColors[m.riskLevel] }}>
            <div className="matter-header" style={{ background: riskBg[m.riskLevel] + '66' }}>
              <div style={{ flex: 1 }}>
                <div className="matter-case">{m.caseNumber}</div>
                <div className="matter-title">{m.companyName}</div>
                <div className="matter-meta">
                  {m.regulator} · {m.jurisdiction} · Started {formatDate(m.dateStarted)}
                </div>
                <div style={{ marginTop: 6 }}>
                  <span className="status-pill">{m.status}</span>
                  {m.potentialExposureCriminal && <span className="criminal-flag">⚠ Criminal Liability</span>}
                </div>
              </div>
              <div style={{ textAlign: 'center', flexShrink: 0 }}>
                <div className="risk-badge" style={{ background: riskBg[m.riskLevel], color: riskColors[m.riskLevel], border: `1px solid ${riskColors[m.riskLevel]}40` }}>
                  {m.riskLevel.toUpperCase()}
                </div>
                <div style={{ fontSize: 22, fontWeight: 800, color: riskColors[m.riskLevel], fontFamily: 'sans-serif', marginTop: 4 }}>{m.riskScore}</div>
                <div style={{ fontSize: 9, color: '#94a3b8', fontFamily: 'sans-serif' }}>RISK SCORE</div>
              </div>
            </div>

            <div className="matter-body">
              <div className="matter-section">
                <h4>Summary of Allegations</h4>
                <p>{m.summary}</p>
              </div>
              <div>
                <div className="matter-section" style={{ marginBottom: 14 }}>
                  <h4>Potential Exposure</h4>
                  <p style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', fontFamily: 'sans-serif' }}>{formatAmount(m.potentialExposureAmount)}</p>
                  <p style={{ marginTop: 4 }}>{m.exposureDescription}</p>
                </div>
                <div className="matter-section">
                  <h4>AI Risk Rationale</h4>
                  <p style={{ fontStyle: 'italic' }}>{m.riskRationale}</p>
                </div>
              </div>
            </div>

            <div className="matter-footer">
              <span>Area: <b>{m.area}</b></span>
              <span>Submitted by: <b>{m.submittedBy}</b></span>
              <span>Last updated: <b>{formatDate(m.lastUpdated)}</b></span>
            </div>
          </div>
        ))}

        <div className="footer">
          Prosus Group — Regulatory Intelligence Portal · Confidential · {today}<br />
          This document was auto-generated and is intended for authorised recipients only. Not legal advice.
        </div>
      </div>
    </>
  );
}
