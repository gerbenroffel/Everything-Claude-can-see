import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!process.env.ANTHROPIC_API_KEY) {
    // Deterministic fallback scoring
    let score = 50;
    if (body.potentialExposureCriminal) score += 20;
    if (body.potentialExposureAmount > 100_000_000) score += 15;
    else if (body.potentialExposureAmount > 50_000_000) score += 10;
    if (body.status === 'Litigation') score += 10;
    if (body.status === 'Under Investigation') score += 5;
    score = Math.min(95, Math.max(10, score));

    const level = score >= 80 ? 'Critical' : score >= 65 ? 'High' : score >= 40 ? 'Medium' : 'Low';
    return NextResponse.json({
      riskLevel: level,
      riskScore: score,
      riskRationale: `Automated risk assessment based on exposure amount ($${Math.round(body.potentialExposureAmount / 1_000_000)}M), matter status (${body.status}), and criminal exposure flag. Configure ANTHROPIC_API_KEY for detailed AI analysis.`
    });
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const message = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Assess the regulatory risk for this matter and respond with ONLY valid JSON (no markdown, no code blocks):

Company: ${body.companyName}
Regulator: ${body.regulator}
Jurisdiction: ${body.jurisdiction}
Area: ${body.area}
Status: ${body.status}
Exposure: $${body.potentialExposureAmount} USD
Criminal Risk: ${body.potentialExposureCriminal ? 'Yes' : 'No'}
Summary: ${body.summary}

Respond with this exact JSON structure:
{"riskLevel": "Critical|High|Medium|Low", "riskScore": <0-100 integer>, "riskRationale": "<2-3 sentences explaining the risk assessment>"}`
      }]
    });

    const text = message.content[0].type === 'text' ? message.content[0].text.trim() : '{}';
    
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        throw new Error('Could not parse JSON from response');
      }
    }

    return NextResponse.json({
      riskLevel: parsed.riskLevel || 'Medium',
      riskScore: typeof parsed.riskScore === 'number' ? parsed.riskScore : 50,
      riskRationale: parsed.riskRationale || 'Risk assessment completed.',
    });
  } catch (e) {
    console.error('AI risk error', e);
    return NextResponse.json({ riskLevel: 'Medium', riskScore: 50, riskRationale: 'AI risk assessment unavailable. Default medium risk assigned.' }, { status: 500 });
  }
}
