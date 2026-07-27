import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { env } from "./infra/env";
import { setupSwagger } from "./infra/http/docs/swagger";
import { AppErrorFilter } from "./infra/http/filters/app-error.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true
    })
  );
  app.useGlobalFilters(new AppErrorFilter());

  setupSwagger(app);

  await app.listen(env.PORT);
}
bootstrap();
