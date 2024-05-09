import { SocketGateway } from "@root/domains/socket/socket.gateway";
// Exceptions
import { InternalServerErrorException } from "@nestjs/common";
// Decorators
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiInternalServerErrorResponse,
} from "@nestjs/swagger";
import { Controller, Get } from "@nestjs/common";
// DTOs
import { HealthCheckDto } from "@root/dtos/health-check.dto";

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
  @ApiOkResponse({
    type: HealthCheckDto,
    description: "The system is up and running",
  })
  @ApiInternalServerErrorResponse({
    description: "The system is down",
    type: HealthCheckDto,
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
