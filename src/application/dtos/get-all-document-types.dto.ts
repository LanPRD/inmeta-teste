import { z } from "zod";
import { PaginationSchema } from "./pagination.dto";

export const GetAllDocumentTypesSchema = PaginationSchema.extend({
  name: z.string().trim().optional(),
  includeDeleted: z.coerce.boolean().optional()
});

export type GetAllDocumentTypesDto = z.infer<typeof GetAllDocumentTypesSchema>;
