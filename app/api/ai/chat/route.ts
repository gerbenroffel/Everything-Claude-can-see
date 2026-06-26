import { NextRequest, NextResponse } from 'next/server';
import { getAllMatters } from '@/lib/store';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({
      answer: 'AI Q&A requires the ANTHROPIC_API_KEY environment variable to be configured. Please add it in your Vercel deployment settings.',
    });
  }

  const matters = getAllMatters();
  const mattersContext = matters.map(m =>
    `[${m.caseNumber}] ${m.companyName} | ${m.area} | ${m.regulator}, ${m.jurisdiction} | Status: ${m.status} | Risk: ${m.riskLevel} (${m.riskScore}/100) | Exposure: $${(m.potentialExposureAmount / 1_000_000).toFixed(0)}M${m.potentialExposureCriminal ? ' (criminal)' : ''} | ${m.summary.substring(0, 150)}`
  ).join('\n');

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 600,
      system: `You are a regulatory intelligence assistant for Prosus, a global technology investment company. You have access to the complete regulatory matters database shown below. Answer questions accurately and concisely, citing specific case numbers and companies. Use numbers and specifics. Keep answers under 150 words unless a longer answer is truly necessary.

Current regulatory matters database:
${mattersContext}`,
      messages: [{ role: 'user', content: question }],
    });

    const answer = message.content[0].type === 'text' ? message.content[0].text : 'Unable to generate a response.';
    return NextResponse.json({ answer });
  } catch (err) {
    console.error('Chat error:', err);
    return NextResponse.json({ answer: 'I encountered an error processing your question. Please try again.' }, { status: 500 });
  }
}
