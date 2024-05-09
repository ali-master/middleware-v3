import { ExecutionContext, Module } from "@nestjs/common";
import { ClsModule } from "nestjs-cls";
// Domain Modules
import { SocketModule, ProxyModule, KucoinModule } from "@root/domains";
// Utilities
import { ulid } from "ulid";

@Module({
  imports: [
    ClsModule.forRoot({
      interceptor: {
        mount: true,
        generateId: true,
        idGenerator: (ctx: ExecutionContext) => {
          const req = ctx.switchToHttp().getRequest();
          const correlationId = req.headers["X-Correlation-Id"] ?? ulid();
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
})
export class AppModule {}
