import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "@root/app.module";
import { SwaggerModule } from "@nestjs/swagger";
// Interceptors
import { ClsInterceptor } from "nestjs-cls";
import { LoggingInterceptor } from "@root/interceptors";
// Types
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
// Utilities
import { Logger } from "@nestjs/common";
import { CommonConfig } from "@root/utils";
import { DocumentBuilder } from "@nestjs/swagger";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { apiReference } from "@scalar/nestjs-api-reference";

async function bootstrap() {
  const logger = new Logger();
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter(), {
    bufferLogs: true,
    autoFlushLogs: true,
    abortOnError: false,
    bodyParser: true,
    forceCloseConnections: false,
  });
  const globalPrefix = "/api";
  app.setGlobalPrefix(globalPrefix);
  app.enableVersioning();

  const scalarPath = `${globalPrefix}/docs`;
  const title = "Pooleno | API documentation";
  const description = "API documentation and endpoints";
  const swaggerPath = `${globalPrefix}/docs`;
  const options = new DocumentBuilder()
    .setTitle(title)
    .setDescription(description)
    .setContact("Tech Contact", "https://pooleno.ir", "tech@pooleno.ir")
    .setTermsOfService("https://pooleno.ir/policies/terms/")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  app.use(
    scalarPath,
    apiReference({
      theme: "alternate",
      withFastify: true,
      spec: {
        content: document,
      },
      metaData: {
        title: "Pooleno Middleware API Documentation",
        description: "Middleware API documentation and endpoints",
      },
      layout: "modern",
    }),
  );

  app.useGlobalInterceptors(new ClsInterceptor());
  app.useGlobalInterceptors(new LoggingInterceptor());

  await app.listen(CommonConfig.PORT, "0.0.0.0");
  logger.log(`Service is running on: ${await app.getUrl()}`, "Bootstrap");
  logger.log(`Service is running in ${CommonConfig.ENV} mode`, "Bootstrap");
  logger.log(
    `Service documentation is available at ${await app.getUrl()}${scalarPath}`,
    "Bootstrap",
  );
}
void bootstrap();
