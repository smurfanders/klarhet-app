export interface AppRow {
  id: string;
  company: string;
  role: string;
  language: string;
  token: string;
  interview_date: string | null;
  created_at: string;
  response_id: string | null;
  q3_reason: string | null;
  q4_future: string | null;
  q5_rating: number | null;
  submitted_at: string | null;
}

export interface Stats {
  total_applications: number;
  total_responses: number;
  avg_rating: number | null;
  response_rate_pct: number | null;
  reconsider_pct: number | null;
}

export interface RejectionReason {
  reason: string;
  count: number;
}
