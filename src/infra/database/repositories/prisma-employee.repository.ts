import { ConflictError } from "@/core/errors";
import { Employee } from "@/domain/entities";
import { EmployeeRepository, type FindAllParams } from "@/domain/repositories";
import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaEmployeeMapper } from "../mappers";
import { PrismaService } from "../prisma/prisma.service";

const UNIQUE_CONSTRAINT_ERROR_CODE = "P2002";

@Injectable()
export class PrismaEmployeeRepository implements EmployeeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    params: FindAllParams
  ): Promise<{ data: Employee[]; total: number }> {
    const where: Record<string, unknown> = {};

    if (!params.includeDeleted) {
      where.deletedAt = null;
    }

    if (params.name) {
      where.name = { contains: params.name, mode: "insensitive" };
    }

    const [employees, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        orderBy: { createdAt: "asc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit
      }),
      this.prisma.employee.count({ where })
    ]);

    return {
      data: employees.map(PrismaEmployeeMapper.toDomain),
      total
    };
  }

  async findById(id: string): Promise<Employee | null> {
    const employee = await this.prisma.employee.findFirst({
      where: { id, deletedAt: null }
    });

    if (!employee) return null;

    return PrismaEmployeeMapper.toDomain(employee);
  }

  async findByEmail(email: string): Promise<Employee | null> {
    const employee = await this.prisma.employee.findFirst({
      where: { email, deletedAt: null }
    });

    if (!employee) return null;

    return PrismaEmployeeMapper.toDomain(employee);
  }

  async create(employee: Employee): Promise<Employee> {
    try {
      const entity = await this.prisma.employee.create({
        data: PrismaEmployeeMapper.toPrisma(employee)
      });

      return PrismaEmployeeMapper.toDomain(entity);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_ERROR_CODE
      ) {
        throw new ConflictError("Employee with this email already exists");
      }

      throw error;
    }
  }

  async update(employee: Employee): Promise<void> {
    try {
      await this.prisma.employee.update({
        where: { id: employee.id.toString() },
        data: {
          name: employee.name,
          email: employee.email
        }
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === UNIQUE_CONSTRAINT_ERROR_CODE
      ) {
        throw new ConflictError("Employee with this email already exists");
      }

      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    await this.prisma.employee.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  }
}
