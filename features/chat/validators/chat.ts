import { z } from "zod";

export const CreateChannelSchema = z.object({
  name: z.string().trim().min(1).max(30),
  description: z.string().trim().max(50).optional(),
});

export const CreateMessageSchema = z.object({
  content: z.string().trim().min(1).max(4000),
  replyToId: z.string().trim().min(1).max(128).optional(),
});

export const UpdateMessageSchema = z.object({
  content: z.string().trim().min(1).max(4000),
});
