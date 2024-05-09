import { Module } from "@nestjs/common";
import { KucoinService } from "@root/domains/kucoin/kucoin.service";
import { KucoinController } from "@root/domains/kucoin/kucoin.controller";

@Module({
  controllers: [KucoinController],
  providers: [KucoinService],
})
export class KucoinModule {}
