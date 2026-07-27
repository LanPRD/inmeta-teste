import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { EnvService } from "@/infra/env/env.service";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor(env: EnvService) {
    super({ adapter: new PrismaPg({ connectionString: env.get("DATABASE_URL") }) });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log("Connected to the database");
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
