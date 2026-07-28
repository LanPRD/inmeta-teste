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
import { CreateEmployeeController } from "./create-employee.controller";
import { GetEmployeeByIdController } from "./get-employee-by-id.controller";

@Module({
  controllers: [CreateEmployeeController, GetEmployeeByIdController],
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
export class EmployeeModule {}
