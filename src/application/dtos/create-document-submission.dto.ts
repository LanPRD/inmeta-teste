import { z } from "zod";

export const CreateDocumentSubmissionSchema = z.object({
  documentTypeId: z.string().min(1, "Document type ID is required")
});

export type CreateDocumentSubmissionDto = z.infer<
  typeof CreateDocumentSubmissionSchema
>;
