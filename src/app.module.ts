import { Module } from "@nestjs/common";
import { PrismaModule } from "./infra/database/prisma/prisma.module";
import { EnvModule } from "./infra/env/env.module";
import { EmployeesModule } from "./infra/http/controllers/employees.module";
import { HealthModule } from "./infra/http/health/health.module";

@Module({
  imports: [EnvModule, PrismaModule, HealthModule, EmployeesModule]
})
export class AppModule {}
