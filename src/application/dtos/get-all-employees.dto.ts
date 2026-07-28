import { z } from "zod";

export const GetAllEmployeesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  name: z.string().trim().optional()
});

export type GetAllEmployeesDto = z.infer<typeof GetAllEmployeesSchema>;
