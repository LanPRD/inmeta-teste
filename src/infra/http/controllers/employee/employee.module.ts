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
import { DeleteEmployeeController } from "./delete-employee.controller";
import { GetAllEmployeesController } from "./get-all-employees.controller";
import { GetEmployeeByIdController } from "./get-employee-by-id.controller";
import { UpdateEmployeeController } from "./update-employee.controller";

@Module({
  controllers: [
    CreateEmployeeController,
    GetAllEmployeesController,
    GetEmployeeByIdController,
    UpdateEmployeeController,
    DeleteEmployeeController,
  ],
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
