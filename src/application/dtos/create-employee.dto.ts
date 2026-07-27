import { z } from "zod";

export const CreateEmployeeSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.email("Invalid email format").toLowerCase().trim()
});

export type CreateEmployeeDto = z.infer<typeof CreateEmployeeSchema>;
