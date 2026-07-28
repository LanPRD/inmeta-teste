import { z } from "zod";

export const UpdateEmployeeSchema = z
  .object({
    name: z.string().min(1, "Name is required").trim().optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Invalid email format"))
      .optional()
  })
  .refine(data => data.name !== undefined || data.email !== undefined, {
    message: "At least one field must be provided"
  });

export type UpdateEmployeeDto = z.infer<typeof UpdateEmployeeSchema>;
