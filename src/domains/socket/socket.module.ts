import { Module } from "@nestjs/common";
// Services & Gateways
import { SocketGateway } from "@root/domains/socket/socket.gateway";
import { SocketHealthController } from "@root/domains/socket/socket-health.controller";

@Module({
  controllers: [SocketHealthController],
  providers: [SocketGateway],
})
export class SocketModule {}
