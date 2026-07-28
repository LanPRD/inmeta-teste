import { z } from "zod";
import { PaginationSchema } from "./pagination.dto";

export const GetPendingDocumentsSchema = PaginationSchema.extend({
  employeeId: z.string().trim().optional(),
  documentTypeId: z.string().trim().optional()
});

export type GetPendingDocumentsDto = z.infer<typeof GetPendingDocumentsSchema>;
