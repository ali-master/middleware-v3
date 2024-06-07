import { Module } from "@nestjs/common";
import { ProxyService } from "@root/domains/proxy/proxy.service";
import { ProxyController } from "@root/domains/proxy/proxy.controller";

@Module({
  controllers: [ProxyController],
  providers: [ProxyService],
})
export class ProxyModule {}
