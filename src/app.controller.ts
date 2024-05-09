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
  path: "/health-check",
  version: "1",
})
@ApiTags("Health Check")
export class AppController {
  constructor() {}

  @Get()
  @ApiOperation({
    description: "Check the health of the system",
    summary: "System health",
  })
  @ApiOkResponse({
    type: HealthCheckDto,
    description: "The system is up and running",
  })
  @ApiInternalServerErrorResponse({
    description: "The system is down",
    type: HealthCheckDto,
  })
  async systemHealthCheck() {
    return {
      status: "up",
    };
  }
}
