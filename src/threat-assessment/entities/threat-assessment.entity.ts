export class ThreatAssessmentEntity {
  id: number;
  zone: string | null;
  state: string | null;
  year: number | null;
  page: string | null;
  risk: string | null;
  primary_threats: string | null;
  hotspots_lga: string | null;
}

export class ThreatLgaEntity {
  id: number;
  zone: string | null;
  state: string | null;
  year: number | null;
  page: string | null;
  lga: string | null;
  risk: string | null;
  primary_threats: string | null;
}

