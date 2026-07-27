import { PrismaService } from "@/infra/database/prisma/prisma.service";
import { Injectable } from "@nestjs/common";
import { HealthIndicatorService } from "@nestjs/terminus";

@Injectable()
export class PrismaHealthIndicator {
  constructor(
    private readonly prisma: PrismaService,
    private readonly healthIndicatorService: HealthIndicatorService
  ) {}

  async isHealthy(key: string) {
    const indicator = this.healthIndicatorService.check(key);

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return indicator.up();
    } catch (error) {
      return indicator.down({
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  }
}
