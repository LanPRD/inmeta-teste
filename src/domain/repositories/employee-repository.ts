import type { Employee } from "../entities";

export interface FindAllParams {
  page: number;
  limit: number;
  name?: string;
  includeDeleted?: boolean;
}

export abstract class EmployeeRepository {
  abstract findAll(
    params: FindAllParams
  ): Promise<{ data: Employee[]; total: number }>;
  abstract findById(id: string): Promise<Employee | null>;
  // Encontra mesmo se soft-deletado — usado por consultas de histórico/auditoria,
  // que devem continuar acessíveis após a exclusão lógica do colaborador.
  abstract findByIdIncludingDeleted(id: string): Promise<Employee | null>;
  abstract create(employee: Employee): Promise<Employee>;
  abstract update(employee: Employee): Promise<void>;
  abstract delete(id: string): Promise<void>;
  abstract findByEmail(email: string): Promise<Employee | null>;
}
