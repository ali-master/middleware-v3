// Decorators
import { Param, Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
// Services
import { KucoinService } from "@root/domains/kucoin/kucoin.service";

@Controller("kucoin")
@ApiTags("Kucoin")
export class KucoinController {
  constructor(private readonly kucoinService: KucoinService) {}

  @Get("/get-market/:pair")
  @ApiOkResponse({
    description: "Kucoin Market Price",
  })
  @ApiOperation({
    summary: "Kucoin Market Price",
    description: "> This endpoint is used to get the market price of a Kucoin pair",
  })
  public async getMarketPrice(@Param("pair") pair: string) {
    return this.kucoinService.getMarketPrice(pair);
  }
}
