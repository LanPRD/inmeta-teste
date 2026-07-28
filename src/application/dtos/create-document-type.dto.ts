import { z } from "zod";

export const CreateDocumentTypeSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  description: z.string().trim().optional()
});

export type CreateDocumentTypeDto = z.infer<typeof CreateDocumentTypeSchema>;
