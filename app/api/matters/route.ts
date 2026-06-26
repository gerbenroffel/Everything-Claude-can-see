import { NextRequest, NextResponse } from 'next/server';
import { getAllMatters, addMatter } from '@/lib/store';
import { RegulatoryMatter } from '@/lib/types';
import { randomUUID } from 'crypto';

export async function GET() {
  const matters = await getAllMatters();
  const sorted = matters.sort((a, b) => b.riskScore - a.riskScore);
  return NextResponse.json(sorted);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  let riskLevel = 'Medium';
  let riskScore = 50;
  let riskRationale = 'Risk assessment pending AI analysis.';
  
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const riskResponse = await fetch(`${baseUrl}/api/ai/risk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (riskResponse.ok) {
      const riskData = await riskResponse.json();
      riskLevel = riskData.riskLevel;
      riskScore = riskData.riskScore;
      riskRationale = riskData.riskRationale;
    }
  } catch (e) {
    console.error('Risk API error', e);
  }

  const matter: RegulatoryMatter = {
    id: randomUUID(),
    caseNumber: body.caseNumber || `PRX-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
    companyName: body.companyName,
    dateStarted: body.dateStarted,
    regulator: body.regulator,
    jurisdiction: body.jurisdiction,
    area: body.area,
    summary: body.summary,
    potentialExposureAmount: Number(body.potentialExposureAmount),
    potentialExposureCriminal: body.potentialExposureCriminal === true || body.potentialExposureCriminal === 'true',
    exposureDescription: body.exposureDescription,
    status: body.status,
    riskLevel: riskLevel as any,
    riskScore,
    riskRationale,
    lastUpdated: new Date().toISOString().split('T')[0],
    submittedBy: body.submittedBy,
  };

  await addMatter(matter);
  return NextResponse.json(matter, { status: 201 });
}
