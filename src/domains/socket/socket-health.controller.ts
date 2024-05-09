import { Controller, Get, HttpException, InternalServerErrorException } from "@nestjs/common";
import { SocketGateway } from "@root/domains/socket/socket.gateway";
import { ApiOperation, ApiTags } from "@nestjs/swagger";

@Controller({
  version: "1",
  path: "/health-check/ws",
})
@ApiTags("Health Check")
export class SocketHealthController {
  constructor(private readonly socketGateway: SocketGateway) {}

  @Get()
  @ApiOperation({
    description: "Check the health of the WebSocket connection",
    summary: "WebSocket health",
  })
  async wsHealthCheck() {
    if (this.socketGateway.isSocketOpen) {
      return {
        status: "up",
      };
    }

    throw new InternalServerErrorException({
      status: "down",
    });
  }
}
