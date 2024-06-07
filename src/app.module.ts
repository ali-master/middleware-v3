import { ExecutionContext, Module } from "@nestjs/common";
import { ClsModule } from "nestjs-cls";
// Domain Modules

// Controllers
import { AppController } from "@root/app.controller";
// Utilities
import { getRandomId } from "@mofid/utils";

@Module({
  imports: [
    ClsModule.forRoot({
      interceptor: {
        mount: true,
        generateId: true,
        idGenerator: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          const correlationId = req.headers["X-Correlation-Id"] ?? getRandomId();
          req.headers["X-Correlation-Id"] = correlationId;

          return correlationId;
        },
      },
      global: true,
    }),
  ],
  controllers: [AppController],
})
export class AppModule {}
