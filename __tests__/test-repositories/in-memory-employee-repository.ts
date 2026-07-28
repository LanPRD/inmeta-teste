import type { Employee } from "@/domain/entities";
import { EmployeeRepository, type FindAllParams } from "@/domain/repositories";

export class InMemoryEmployeeRepository extends EmployeeRepository {
  private employees: Employee[] = [];
  private deletedIds = new Set<string>();
  forceError = false;

  async findAll(
    params: FindAllParams
  ): Promise<{ data: Employee[]; total: number }> {
    if (this.forceError) throw new Error("Forced error");

    let filtered = this.employees.filter(
      e => !this.deletedIds.has(e.id.toString())
    );

    if (params.name) {
      const search = params.name.toLowerCase();
      filtered = filtered.filter(e => e.name.toLowerCase().includes(search));
    }

    const total = filtered.length;
    const offset = (params.page - 1) * params.limit;
    const data = filtered.slice(offset, offset + params.limit);

    return { data, total };
  }

  async findById(id: string): Promise<Employee | null> {
    if (this.forceError) throw new Error("Forced error");

    return (
      this.employees.find(
        e => e.id.toString() === id && !this.deletedIds.has(e.id.toString())
      ) ?? null
    );
  }

  async findByEmail(email: string): Promise<Employee | null> {
    if (this.forceError) throw new Error("Forced error");

    return (
      this.employees.find(
        e => e.email === email && !this.deletedIds.has(e.id.toString())
      ) ?? null
    );
  }

  async create(employee: Employee): Promise<Employee> {
    this.employees.push(employee);
    return employee;
  }

  async update(employee: Employee): Promise<void> {
    const index = this.employees.findIndex(
      e => e.id.toString() === employee.id.toString()
    );

    if (index !== -1) {
      this.employees[index] = employee;
    }
  }

  async delete(id: string): Promise<void> {
    this.deletedIds.add(id);
  }
}
