export type Language = 'en' | 'sv'
export type ExperienceMatch = 'strong' | 'partial' | 'notfit'
export type CommunicationRating = 'excellent' | 'good' | 'develop'
export type RejectionReason = 'stronger' | 'skill' | 'culture' | 'over' | 'internal' | 'other'
export type FutureConsideration = 'yes' | 'maybe' | 'unlikely'

export interface Application {
  id: string
  company: string
  role: string
  language: Language
  token: string
  interview_date: string | null
  created_at: string
}

export interface Response {
  id: string
  application_id: string
  q1_match: ExperienceMatch | null
  q1_detail: string | null
  q2_communication: CommunicationRating | null
  q2_checkboxes: string[] | null
  q3_reason: RejectionReason | null
  q3_detail: string | null
  q4_future: FutureConsideration | null
  q4_detail: string | null
  q5_rating: number | null
  q6_profile: string | null
  q7_interview: string | null
  q7_other: string | null
  submitted_at: string
}

export interface DashboardRow extends Application {
  response_id: string | null
  q1_match: ExperienceMatch | null
  q2_communication: CommunicationRating | null
  q3_reason: RejectionReason | null
  q4_future: FutureConsideration | null
  q5_rating: number | null
  submitted_at: string | null
}

export interface UserStats {
  total_applications: number
  total_responses: number
  avg_rating: number | null
  response_rate_pct: number | null
  reconsider_pct: number | null
}
