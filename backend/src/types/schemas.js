import { z } from 'zod';

// =============================================
// Core Domain Schemas (mirrors Python models.py)
// =============================================

export const UserProfileSchema = z.object({
  name: z.string().min(1),
  education_level: z.enum(["High School", "Bachelor's", "Master's", "PhD", "Other"]),
  field_of_study: z.string().min(1),
  gpa: z.number().min(0).max(4).nullable().optional(),
  skills: z.string().min(1),
  experience_years: z.number().int().min(0),
  languages: z.string().min(1),
  achievements: z.string().min(1),
  goals: z.string().min(1)
});

export const OpportunitySchema = z.object({
  title: z.string().min(1),
  opp_type: z.string().min(1),
  description: z.string().min(1),
  requirements: z.string().min(1),
  deadline: z.string().nullable().optional(),
  provider: z.string().nullable().optional(),
  funding: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  link: z.string().nullable().optional()
});

// =============================================
// AI Result Schemas (replaces Pydantic models)
// =============================================

export const MatchResultSchema = z.object({
  compatibility_score: z.number().min(0).max(1),
  strengths: z.string(),
  gaps: z.string(),
  recommendation: z.string()
});

export const ApplicationMaterialSchema = z.object({
  material_type: z.enum(['cover_letter', 'personal_statement', 'motivation_letter']),
  content: z.string(),
  word_count: z.number().int(),
  key_points_highlighted: z.array(z.string()),
  suggestions_for_improvement: z.string()
});

export const DocumentAnalysisSchema = z.object({
  document_type: z.string(),
  extracted_text: z.string(),
  key_information: z.record(z.unknown()).default({}),
  suggestions: z.string(),
  confidence_score: z.number().min(0).max(1)
});

export const ScrapedOpportunitySchema = z.object({
  title: z.string(),
  opp_type: z.string(),
  description: z.string(),
  requirements: z.string(),
  deadline: z.string().nullable().optional(),
  provider: z.string().nullable().optional(),
  funding: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  link: z.string().optional(),
  eligibility: z.string().nullable().optional(),
  benefits: z.string().nullable().optional()
});

// =============================================
// Agent Schemas (mirrors agents/*.py Pydantic models)
// =============================================

export const GapAnalysisSchema = z.object({
  category: z.string(),
  severity: z.enum(['critical', 'moderate', 'minor']),
  description: z.string(),
  impact: z.string()
});

export const QuickWinSchema = z.object({
  action: z.string(),
  impact: z.string(),
  time_estimate: z.string(),
  priority: z.enum(['high', 'medium', 'low'])
});

export const ImprovementSuggestionSchema = z.object({
  area: z.string(),
  current_state: z.string(),
  target_state: z.string(),
  action_steps: z.array(z.string()),
  timeline: z.string(),
  impact_score: z.number().min(0).max(1)
});

export const DayPlanSchema = z.object({
  period: z.string(),
  goals: z.array(z.string()),
  tasks: z.array(z.string()),
  success_metrics: z.array(z.string())
});

export const ProfileOptimizationResultSchema = z.object({
  profile_strength_score: z.number().min(0).max(10),
  completeness_percentage: z.number().min(0).max(100),
  match_potential_increase: z.number(),
  critical_gaps: z.array(GapAnalysisSchema),
  quick_wins: z.array(QuickWinSchema),
  high_impact_improvements: z.array(ImprovementSuggestionSchema),
  action_plan_30_days: DayPlanSchema,
  action_plan_60_days: DayPlanSchema,
  action_plan_90_days: DayPlanSchema,
  overall_recommendation: z.string()
});

export const SearchQuerySchema = z.object({
  query: z.string(),
  reasoning: z.string(),
  priority: z.enum(['high', 'medium', 'low'])
});

export const SimilarOpportunitySchema = z.object({
  title: z.string(),
  type: z.string(),
  why_similar: z.string(),
  relevance_score: z.number().min(0).max(1)
});

export const OpportunityScoutResultSchema = z.object({
  search_queries: z.array(SearchQuerySchema),
  similar_opportunities: z.array(SimilarOpportunitySchema),
  hidden_opportunities: z.array(z.string()),
  recommendation: z.string()
});

export const ApplicationPrioritySchema = z.object({
  opportunity_title: z.string(),
  priority_level: z.enum(['High', 'Medium', 'Low']),
  match_score: z.number(),
  deadline: z.string(),
  reasoning: z.string(),
  estimated_effort_hours: z.number().int(),
  success_probability: z.number().min(0).max(1),
  roi_score: z.number().min(0).max(1)
});

export const WeeklyTaskSchema = z.object({
  week: z.string(),
  tasks: z.array(z.string()),
  deadline_focus: z.array(z.string())
});

export const ApplicationStrategyResultSchema = z.object({
  prioritized_applications: z.array(ApplicationPrioritySchema),
  weekly_timeline: z.array(WeeklyTaskSchema),
  strategy_summary: z.string(),
  effort_estimate_total_hours: z.number().int(),
  recommended_focus: z.array(z.string())
});
