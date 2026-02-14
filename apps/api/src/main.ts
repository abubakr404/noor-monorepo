import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";
import { validationPipe } from "./common/pipes/validation.pipe";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix("api/v1");

  // Enable CORS for frontend
  app.enableCors({
    origin: ["http://localhost:3000", "http://localhost:8081"],
    credentials: true,
  });

  // Global pipes, interceptors, filters
  app.useGlobalPipes(validationPipe);
  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT ?? 3001;
  await app.listen(port);
  console.log(`🚀 Zikr API running on http://localhost:${port}/api/v1`);
}
bootstrap();
