import { NextResponse } from 'next/server';
import { getAllMatters } from '@/lib/store';
import Anthropic from '@anthropic-ai/sdk';

export async function POST() {
  if (!process.env.ANTHROPIC_API_KEY) {
    const matters = await getAllMatters();
    const totalExposure = matters.reduce((sum, m) => sum + m.potentialExposureAmount, 0);
    const critical = matters.filter(m => m.riskLevel === 'Critical').length;
    const high = matters.filter(m => m.riskLevel === 'High').length;
    return NextResponse.json({
      summary: `PROSUS REGULATORY INTELLIGENCE — EXECUTIVE SUMMARY\n\nAs of ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}, the Prosus group has ${matters.length} active regulatory matters across multiple jurisdictions with aggregate potential exposure of $${Math.round(totalExposure / 1_000_000)}M.\n\n${critical} matters are classified as Critical risk and ${high} as High risk, requiring immediate board attention.\n\n[Configure ANTHROPIC_API_KEY for full AI-generated summary]`
    });
  }

  try {
    const matters = await getAllMatters();
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const mattersText = matters.map(m =>
      `- ${m.caseNumber} | ${m.companyName} | ${m.jurisdiction} | ${m.area} | ${m.status} | Risk: ${m.riskLevel} (${m.riskScore}) | Exposure: $${Math.round(m.potentialExposureAmount / 1_000_000)}M${m.potentialExposureCriminal ? ' [CRIMINAL]' : ''}\n  Summary: ${m.summary.substring(0, 200)}...`
    ).join('\n\n');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `You are a senior legal counsel preparing a board-ready executive summary of the regulatory portfolio for Prosus Group, a global technology investment company. Generate a professional, concise executive summary covering:

1. Portfolio Overview (total matters, aggregate exposure, geographic spread)
2. Critical & High Risk Matters (brief bullets on top priorities)
3. Key Themes (cross-portfolio patterns, e.g. competition law across markets)
4. Recommended Actions (top 3-5 board-level priorities)

Today's date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}

REGULATORY MATTERS:
${mattersText}

Write in formal board-memo style. Be direct, specific, and actionable. Use clear section headers.`
      }]
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';
    return NextResponse.json({ summary: text });
  } catch (e) {
    console.error('AI summary error', e);
    return NextResponse.json({ summary: 'Unable to generate AI summary at this time. Please check your API configuration.' }, { status: 500 });
  }
}
