import { PrismaModule } from "@/infra/database/prisma/prisma.module";
import { Module } from "@nestjs/common";
import { TerminusModule } from "@nestjs/terminus";
import { HealthController } from "./health.controller";
import { PrismaHealthIndicator } from "./prisma.health-indicator";

@Module({
  imports: [TerminusModule, PrismaModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator]
})
export class HealthModule {}
