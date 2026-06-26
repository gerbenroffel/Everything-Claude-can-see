import { NextResponse } from 'next/server';
import { getAllMatters } from '@/lib/store';
import Anthropic from '@anthropic-ai/sdk';

export async function POST() {
  const matters = getAllMatters();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      summary: `PROSUS REGULATORY INTELLIGENCE SUMMARY\n\nAs of ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}, the Prosus portfolio carries ${matters.length} regulatory matters across ${new Set(matters.map(m => m.companyName)).size} portfolio companies. To enable AI-generated summaries, please configure the ANTHROPIC_API_KEY environment variable in your Vercel deployment settings.\n\nThis portal tracks matters across all key regulatory areas including Competition, Data Privacy, Consumer Protection, Financial Services, and Employment law.`,
    });
  }

  const open = matters.filter(m => m.status !== 'Resolved');
  const totalExposure = open.reduce((s, m) => s + m.potentialExposureAmount, 0);
  const criminal = open.filter(m => m.potentialExposureCriminal);
  const critical = open.filter(m => m.riskLevel === 'Critical');

  const mattersContext = matters.map(m =>
    `• [${m.caseNumber}] ${m.companyName} — ${m.area} — ${m.regulator} (${m.jurisdiction}) — ${m.status} — Risk: ${m.riskLevel} (${m.riskScore}/100) — Exposure: $${(m.potentialExposureAmount / 1_000_000).toFixed(0)}M${m.potentialExposureCriminal ? ' + criminal' : ''}\n  Summary: ${m.summary.substring(0, 200)}…`
  ).join('\n\n');

  const prompt = `You are the General Counsel of Prosus, a global technology investment company. Write a board-ready executive summary of the company's current regulatory matters portfolio.

Current portfolio data:
- Total matters: ${matters.length}
- Open matters: ${open.length}
- Total open financial exposure: $${(totalExposure / 1_000_000_000).toFixed(2)}B
- Critical risk matters: ${critical.length}
- Matters with criminal exposure: ${criminal.length}
- Resolved: ${matters.filter(m => m.status === 'Resolved').length}

All matters:
${mattersContext}

Write a concise executive summary (3 tight paragraphs) covering:
1. Overall portfolio regulatory risk picture and key headline numbers
2. The 2-3 most critical matters requiring immediate board attention, with specific details
3. Recommended actions and areas of focus for the next 90 days

Tone: professional, direct, suitable for a board pack. Do not use bullet points — flowing prose only. Do not include a title or heading.`;

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }],
    });

    const summary = message.content[0].type === 'text' ? message.content[0].text : 'Unable to generate summary.';
    return NextResponse.json({ summary });
  } catch (err) {
    console.error('Summary generation error:', err);
    return NextResponse.json({ summary: 'Summary generation failed. Please check your API key configuration.' }, { status: 500 });
  }
}
