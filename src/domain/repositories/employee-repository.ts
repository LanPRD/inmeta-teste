import type { Employee } from "../entities";

export interface FindAllParams {
  page: number;
  limit: number;
  name?: string;
}

export abstract class EmployeeRepository {
  abstract findAll(
    params: FindAllParams
  ): Promise<{ data: Employee[]; total: number }>;
  abstract findById(id: string): Promise<Employee | null>;
  abstract create(employee: Employee): Promise<Employee>;
  abstract update(employee: Employee): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract findByEmail(email: string): Promise<Employee | null>;
}
