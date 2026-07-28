import { z } from "zod";

export const UpdateDocumentTypeSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim().optional(),
    description: z.string().trim().optional()
  })
  .refine(data => data.name !== undefined || data.description !== undefined, {
    message: "At least one field must be provided"
  });

export type UpdateDocumentTypeDto = z.infer<typeof UpdateDocumentTypeSchema>;
