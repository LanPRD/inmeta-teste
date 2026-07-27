import {
  CreateEmployeeUseCase,
  DeleteEmployeeUseCase,
  GetAllEmployeesUseCase,
  GetEmployeeByIdUseCase,
  UpdateEmployeeUseCase
} from "@/application/use-cases/employees";
import { EmployeeRepository } from "@/domain/repositories";
import { PrismaEmployeeRepository } from "@/infra/database/repositories/prisma-employee.repository";
import { Module } from "@nestjs/common";
import { EmployeesController } from "./employees.controller";

@Module({
  controllers: [EmployeesController],
  providers: [
    {
      provide: EmployeeRepository,
      useClass: PrismaEmployeeRepository
    },
    CreateEmployeeUseCase,
    GetEmployeeByIdUseCase,
    GetAllEmployeesUseCase,
    UpdateEmployeeUseCase,
    DeleteEmployeeUseCase
  ]
})
export class EmployeesModule {}
