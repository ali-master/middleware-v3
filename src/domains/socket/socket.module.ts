import { Module } from "@nestjs/common";
// Services & Gateways
import { SocketGateway } from "@root/domains/socket/socket.gateway";
import { SocketService } from "@root/domains/socket/socket-client.service";
import { SocketHealthController } from "@root/domains/socket/socket-health.controller";

@Module({
  controllers: [SocketHealthController],
  providers: [SocketGateway, SocketService],
})
export class SocketModule {}
