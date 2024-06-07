import { ExecutionContext, Module } from "@nestjs/common";
import { ClsModule } from "nestjs-cls";
// Domain Modules
import { SocketModule, ProxyModule, KucoinModule } from "@root/domains";
// Controllers
import { AppController } from "@root/app.controller";
// Utilities
import { getRandomId } from "@root/utils";

@Module({
  imports: [
    ClsModule.forRoot({
      interceptor: {
        mount: true,
        generateId: true,
        idGenerator: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          const correlationId = req.headers["X-Correlation-Id"] ?? getRandomId;
          req.headers["X-Correlation-Id"] = correlationId;

          return correlationId;
        },
      },
      global: true,
    }),
    ProxyModule,
    KucoinModule,
    SocketModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
