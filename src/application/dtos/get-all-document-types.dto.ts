import { z } from "zod";
import { PaginationSchema } from "./pagination.dto";

export const GetAllDocumentTypesSchema = PaginationSchema.extend({
  name: z.string().trim().optional()
});

export type GetAllDocumentTypesDto = z.infer<typeof GetAllDocumentTypesSchema>;
