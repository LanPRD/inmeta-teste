import { Module } from "@nestjs/common";
import { EmployeeModule } from "./controllers/employee/employee.module";
import { HealthModule } from "./health/health.module";

@Module({
  imports: [HealthModule, EmployeeModule]
})
export class HttpModule {}
