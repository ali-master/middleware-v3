import { Module } from "@nestjs/common";
// Controllers
import { SocketHealthController } from "@root/domains/socket/socket-health.controller";
// Services & Gateways
import { SocketGateway } from "@root/domains/socket/socket.gateway";
import { SocketHealthCheckService } from "@root/domains/socket/socket-client.service";

@Module({
  controllers: [SocketHealthController],
  providers: [SocketGateway, SocketHealthCheckService],
})
export class SocketModule {}
