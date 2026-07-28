import { z } from "zod";
import { PaginationSchema } from "./pagination.dto";

export const GetAllEmployeesSchema = PaginationSchema.extend({
  name: z.string().trim().optional(),
  includeDeleted: z.coerce.boolean().optional()
});

export type GetAllEmployeesDto = z.infer<typeof GetAllEmployeesSchema>;
