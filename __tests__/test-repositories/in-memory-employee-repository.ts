import type { Employee } from "@/domain/entities";
import { EmployeeRepository } from "@/domain/repositories";

export class InMemoryEmployeeRepository extends EmployeeRepository {
  private employees: Employee[] = [];
  private deletedIds = new Set<string>();
  forceError = false;

  async findAll(): Promise<Employee[]> {
    if (this.forceError) throw new Error("Forced error");

    return this.employees.filter(e => !this.deletedIds.has(e.id.toString()));
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
