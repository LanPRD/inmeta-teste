import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  type NestFastifyApplication
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { EnvService } from "./infra/env/env.service";
import { setupSwagger } from "./infra/http/docs/swagger";
import { AppErrorFilter } from "./infra/http/filters/app-error.filter";

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter()
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );
  app.useGlobalFilters(new AppErrorFilter());

  setupSwagger(app);

  const env = app.get(EnvService);

  await app.listen(env.get("PORT"), "0.0.0.0");
}
bootstrap();
