import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./infra/database/prisma/prisma.module";
import { EnvModule } from "./infra/env/env.module";

@Module({
  imports: [EnvModule, PrismaModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
