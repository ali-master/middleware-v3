import { ApiProperty } from "@nestjs/swagger";

export class HealthCheckDto {
  @ApiProperty({
    example: "ok",
    description: "The status of the health check",
  })
  status: string;
}
