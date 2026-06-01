import { z } from "zod";

export const contactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(64, "Name must be 64 characters or less"),
  relationshipType: z.string().optional(),
  status: z.string().optional(),
  industry: z.string().max(64, "Industry must be 64 characters or less").optional(),
  description: z.string().max(1000, "Description must be 1000 characters or less").optional(),
  notes: z.string().optional(),
  contextData: z.record(z.string(), z.any()).optional(),
  activities: z.array(z.record(z.string(), z.any())).optional(),
  lastContacted: z.string().optional(),
  persons: z.array(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().max(254).optional().or(z.literal("")),
    phone: z.string().optional(),
    role: z.string().optional(),
    isPrimary: z.boolean().optional()
  })).optional(),
  tags: z.array(z.string()).optional(),
  assignedStaff: z.array(z.string()).optional()
}).passthrough();

export type ContactPayload = z.infer<typeof contactSchema>;
