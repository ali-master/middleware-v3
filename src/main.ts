import "dotenv/config";
import "source-map-support";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "@root/app.module";
import { SwaggerModule } from "@nestjs/swagger";
// Interceptors
import { ClsInterceptor, ClsMiddleware } from "nestjs-cls";
import { LoggingInterceptor } from "@root/interceptors";
// Types
import type { FastifyRequest } from "fastify";
import type { NestFastifyApplication } from "@nestjs/platform-fastify";
// Utilities
import { Logger } from "@nestjs/common";
import { getRandomId } from "@mofid/utils";
import { default as KillPort } from "kill-port";
import { DocumentBuilder } from "@nestjs/swagger";
import { CommonConfig, setupSignals } from "@root/utils";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { apiReference } from "@scalar/nestjs-api-reference";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
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
  app.use(
    new ClsMiddleware({
      saveReq: true,
      saveRes: true,
      generateId: true,
      idGenerator: (req: FastifyRequest) => {
        const correlationId = (req.headers["X-Correlation-Id"] as string) ?? getRandomId();
        req.headers["X-Correlation-Id"] = correlationId;

        return correlationId;
      },
    }).use,
  );

  const scalarPath = `${globalPrefix}/docs`;
  const title = "Mofid | API documentation";
  const description = "API documentation and endpoints";
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
        title,
        description,
      },
      layout: "modern",
    }),
  );

  app.useGlobalInterceptors(new ClsInterceptor());
  app.useGlobalInterceptors(new LoggingInterceptor());

  app.enableShutdownHooks();
  setupSignals(async () => {
    logger.warn("Service is shutting down", "Shutdown");
    await app.close();
    logger.warn("Service has been shut down", "Shutdown");
    process.exit(0);
  });
  const port = CommonConfig.PORT || 4000;
  try {
    logger.log(`Checking if port ${port} is in use`);
    await KillPort(port);
    logger.log(`Port ${port} is now free`);
  } catch (e) {
    logger.log(`Port ${port} is not in use or could not be killed`);
  } finally {
    await app.listen(port, "0.0.0.0");
  }
  logger.log(`Service is running on: ${await app.getUrl()}`);
  logger.log(`Service is running in ${CommonConfig.ENV} mode`);
  logger.log(`Service documentation is available at ${await app.getUrl()}${scalarPath}`);
}
void bootstrap();
