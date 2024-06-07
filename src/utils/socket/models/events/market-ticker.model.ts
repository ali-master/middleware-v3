import { MessageData } from "@root/utils/socket";

export interface TickerModel {
  sequence: number;
  price: string;
  size: string;
  bestBid: string;
  bestBidSize: string;
  bestAsk: string;
  bestAskSize: string;
  baseAsset: string;
  quoteAsset: string;
}
export interface MarketTickerModel extends MessageData<TickerModel> {}
