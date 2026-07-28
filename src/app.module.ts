import { Module } from "@nestjs/common";
import { PrismaModule } from "./infra/database/prisma/prisma.module";
import { EnvModule } from "./infra/env/env.module";
import { HttpModule } from "./infra/http/http.module";

@Module({
  imports: [EnvModule, PrismaModule, HttpModule]
})
export class AppModule {}
