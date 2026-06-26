import { NextRequest, NextResponse } from 'next/server';
import { getAllMatters } from '@/lib/store';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  const { question } = await request.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ answer: 'AI features require an ANTHROPIC_API_KEY environment variable to be configured. Please add it to your .env.local file.' });
  }

  try {
    const matters = await getAllMatters();
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const mattersContext = matters.map(m =>
      `${m.caseNumber}: ${m.companyName} | ${m.area} | ${m.jurisdiction} | ${m.status} | Risk: ${m.riskLevel} (${m.riskScore}/100) | Exposure: $${Math.round(m.potentialExposureAmount / 1_000_000)}M${m.potentialExposureCriminal ? ' + Criminal' : ''} | ${m.summary.substring(0, 150)}`
    ).join('\n');

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: `You are a Prosus Regulatory Intelligence Assistant with expertise in global regulatory matters. You have access to the company's current regulatory portfolio and answer questions concisely and accurately. Always be professional, specific, and helpful. If citing specific matters, reference the case number.

CURRENT REGULATORY PORTFOLIO:
${mattersContext}`,
      messages: [{ role: 'user', content: question }]
    });

    const answer = message.content[0].type === 'text' ? message.content[0].text : 'Unable to generate response.';
    return NextResponse.json({ answer });
  } catch (e) {
    console.error('AI chat error', e);
    return NextResponse.json({ answer: 'An error occurred while processing your question. Please try again.' }, { status: 500 });
  }
}
