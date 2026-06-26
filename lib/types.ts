export type RegulatoryArea =
  | 'Competition'
  | 'Consumer Protection'
  | 'Data Privacy'
  | 'Financial Services'
  | 'Tax'
  | 'Employment'
  | 'Antitrust'
  | 'Securities';

export type MatterStatus =
  | 'Under Investigation'
  | 'Litigation'
  | 'Settlement Negotiations'
  | 'Resolved'
  | 'Monitoring';

export type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

export interface RegulatoryMatter {
  id: string;
  caseNumber: string;
  companyName: string;
  dateStarted: string;
  regulator: string;
  jurisdiction: string;
  area: RegulatoryArea;
  summary: string;
  potentialExposureAmount: number;
  potentialExposureCriminal: boolean;
  exposureDescription: string;
  status: MatterStatus;
  riskLevel: RiskLevel;
  riskScore: number;
  riskRationale: string;
  lastUpdated: string;
  submittedBy: string;
}
