import { NextRequest, NextResponse } from 'next/server';
import { getAllMatters, addMatter } from '@/lib/store';
import { RegulatoryMatter } from '@/lib/types';
import Anthropic from '@anthropic-ai/sdk';

export async function GET() {
  const matters = getAllMatters();
  return NextResponse.json(matters);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  const id = `matter_${Date.now()}`;
  let riskLevel = 'Medium';
  let riskScore = 50;
  let riskRationale = 'Risk assessment unavailable — API key not configured.';

  if (process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const prompt = `You are a regulatory risk analyst. Assess the risk level of this regulatory matter and return a JSON object only.

Matter details:
- Company: ${body.companyName}
- Regulator: ${body.regulator} (${body.jurisdiction})
- Area: ${body.area}
- Status: ${body.status}
- Summary: ${body.summary}
- Financial exposure: $${(body.potentialExposureAmount / 1_000_000).toFixed(1)}M
- Criminal liability: ${body.potentialExposureCriminal ? 'Yes' : 'No'}
- Exposure description: ${body.exposureDescription}

Return only valid JSON with these exact fields:
{
  "riskLevel": "Critical" | "High" | "Medium" | "Low",
  "riskScore": <integer 1-100>,
  "riskRationale": "<2-3 sentence professional explanation of the risk assessment>"
}

Risk guidelines:
- Critical (75-100): Criminal exposure, >$100M, dominant market position, or systemic compliance failure
- High (50-74): Significant fines, reputational damage, regulatory precedent risk
- Medium (25-49): Manageable exposure, cooperative regulators, strong defences
- Low (1-24): Minor violations, resolved or nearing resolution, limited impact`;

      const message = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      });

      const text = message.content[0].type === 'text' ? message.content[0].text : '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        riskLevel = parsed.riskLevel ?? riskLevel;
        riskScore = parsed.riskScore ?? riskScore;
        riskRationale = parsed.riskRationale ?? riskRationale;
      }
    } catch (err) {
      console.error('Risk assessment error:', err);
    }
  }

  const matter: RegulatoryMatter = {
    id,
    caseNumber: body.caseNumber,
    companyName: body.companyName,
    dateStarted: body.dateStarted,
    regulator: body.regulator,
    jurisdiction: body.jurisdiction,
    area: body.area,
    summary: body.summary,
    potentialExposureAmount: body.potentialExposureAmount,
    potentialExposureCriminal: body.potentialExposureCriminal ?? false,
    exposureDescription: body.exposureDescription,
    status: body.status,
    riskLevel: riskLevel as RegulatoryMatter['riskLevel'],
    riskScore,
    riskRationale,
    lastUpdated: new Date().toISOString().split('T')[0],
    submittedBy: body.submittedBy,
  };

  addMatter(matter);

  return NextResponse.json({
    id,
    caseNumber: body.caseNumber,
    riskLevel: matter.riskLevel,
    riskScore: matter.riskScore,
    riskRationale: matter.riskRationale,
  });
}
