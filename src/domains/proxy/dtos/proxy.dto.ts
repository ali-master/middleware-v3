import { ApiProperty } from "@nestjs/swagger";

export class ProxyDto {
  @ApiProperty({
    description: "Request URL",
    example: "https://example.com",
  })
  reqUrl: string;
  @ApiProperty({
    description: "Request method",
    example: "GET",
  })
  method: string;
  @ApiProperty({
    description: "Request body",
    example: null,
  })
  body: any;
  @ApiProperty({
    description: "Request headers",
    example: {
      "Content-Type": "application/json",
    },
  })
  headers: any;
}
