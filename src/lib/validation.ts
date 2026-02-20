import { z } from "zod";

export const createFeedbackRequestSchema = z.object({
  company: z.string().min(1).max(120).trim(),
  role: z.string().min(1).max(120).trim(),
  language: z.enum(["en", "sv"]),
  interview_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

export const submitResponseSchema = z.object({
  q1_match: z.enum(["strong", "partial", "notfit"]),
  q1_detail: z.string().max(1000).trim().optional(),
  q2_communication: z.enum(["excellent", "good", "develop"]),
  q2_checkboxes: z
    .array(
      z.enum([
        "clarity",
        "structure",
        "listening",
        "confidence",
        "conciseness",
      ]),
    )
    .max(5)
    .optional(),
  q3_reason: z.enum([
    "stronger",
    "skill",
    "culture",
    "over",
    "internal",
    "other",
  ]),
  q3_detail: z.string().max(1000).trim().optional(),
  q4_future: z.enum(["yes", "maybe", "unlikely"]),
  q4_detail: z.string().max(500).trim().optional(),
  q5_rating: z.number().int().min(1).max(5),
  q6_profile: z.string().max(2000).trim().optional(),
  q7_interview: z.string().max(2000).trim().optional(),
  q7_other: z.string().max(2000).trim().optional(),
});

export type CreateFeedbackRequestInput = z.infer<
  typeof createFeedbackRequestSchema
>;
export type SubmitResponseInput = z.infer<typeof submitResponseSchema>;
