import type { Employee } from "../entities";

export abstract class EmployeeRepository {
  abstract findAll(): Promise<Employee[]>;
  abstract findById(id: string): Promise<Employee | null>;
  abstract create(employee: Employee): Promise<void>;
  abstract update(employee: Employee): Promise<void>;
  abstract delete(id: string): Promise<void>;
}
