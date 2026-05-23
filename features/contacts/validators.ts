import { z } from "zod";

export const contactSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required").max(64, "Name must be 64 characters or less"),
  relationshipType: z.enum([
    "Lead", "Customer", "Client", "Vendor", "Partner", 
    "Freelancer", "Investor", "Internal", "Other"
  ]),
  status: z.enum([
    "New", "Active", "Pending", "Inactive", "Archived"
  ]),
  industry: z.string().max(64, "Industry must be 64 characters or less").optional(),
  description: z.string().max(120, "Description must be 120 characters or less").optional(),
  
  // Existing payload fields that need to be passed through
  contextData: z.record(z.string(), z.any()).optional(),
  persons: z.array(z.object({
    id: z.string(),
    name: z.string(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().optional(),
    role: z.string().optional(),
    isPrimary: z.boolean().optional()
  })).optional(),
  tags: z.array(z.string()).optional(),
  assignedStaff: z.array(z.string()).optional()
}).passthrough();

export type ContactPayload = z.infer<typeof contactSchema>;
