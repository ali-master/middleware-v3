import { Injectable } from "@nestjs/common";
// DTOs
import { OrderbookSymbolPriceDto } from "@root/domains/kucoin/dtos";
// Utilities
import { Effect } from "effect";
import * as Http from "@effect/platform/HttpClient";
import { addDashBetweenPair, CommonConfig, getMaxRequestTimeoutPolicy } from "@root/utils";

@Injectable()
export class KucoinService {
  private pairUrl(pair: string): string {
    return `${CommonConfig.KUCOIN_BASE_URL}api/v1/market/orderbook/level1?symbol=${pair}`;
  }
  private readonly timeoutPolicy = getMaxRequestTimeoutPolicy();

  public async getMarketPrice(pair: string) {
    const symbol = addDashBetweenPair(pair).toUpperCase();
    const reqUrl = this.pairUrl(symbol);
    const req = Http.request
      .get(reqUrl, {
        acceptJson: true,
      })
      .pipe(
        Http.client.fetch,
        this.timeoutPolicy,
        Http.response.json,
        Effect.andThen((result) => {
          if ((result as any).data) {
            return new OrderbookSymbolPriceDto(result).toJSON();
          }

          return {
            symbol,
            price: null,
          };
        }),
      );
    const { price } = await Effect.runPromise(req);

    return {
      symbol,
      price,
    };
  }
}
