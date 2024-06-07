// Decorators
import { Post, Body, Controller } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
// Services
import { ProxyService } from "@root/domains/proxy/proxy.service";
// DTOs
import { ProxyDto } from "@root/domains/proxy/dtos";

@Controller("proxy")
@ApiTags("Proxy")
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Post()
  @ApiOkResponse({
    description: "Proxy response",
  })
  @ApiOperation({
    summary: "Proxy request",
    description: "> This endpoint is used to proxy requests to other services or APIs",
  })
  public async getProxy(@Body() reqBody: ProxyDto) {
    const { reqUrl, method, body, headers } = reqBody;
    return this.proxyService.proxy({
      body,
      headers: headers,
      reqUrl,
      method,
    });
  }
}
