import { Logger, OnApplicationShutdown } from "@nestjs/common";
// Decorators
import {
  MessageBody,
  WebSocketServer,
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
} from "@nestjs/websockets";
// Utilities
import { CommonConfig, KucoinWsClient } from "@root/utils";
// Enums
import { IoClientEvent, IoClientRequest, IoTokenRoom } from "@root/domains/socket/enums";
// Types
import type { Socket, Server } from "socket.io";
import type { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from "@nestjs/websockets";

@WebSocketGateway()
export class SocketGateway
  implements OnApplicationShutdown, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger("SocketGateway");
  private readonly kucoin = new KucoinWsClient({
    isPrivate: false,
    baseURL: CommonConfig.KUCOIN_OPENAPI_BASE_URL,
    authVersion: CommonConfig.KUCOIN_OPENAPI_VERSION,
  });
  @WebSocketServer() server: Server;

  onApplicationShutdown() {
    this.kucoin.disconnect();
  }

  isSocketOpen() {
    return this.kucoin.isSocketOpen;
  }

  async afterInit(server: Server) {
    this.logger.debug("WebSocket Gateway initialized");

    this.kucoin.onEvent("retry-subscription", () => {
      this.logger.warn("Retrying subscription...");
    });
    this.kucoin.onEvent("error", (error) => {
      this.logger.error(error, "Socket error occurred");
    });
    this.kucoin.onEvent("close", () => {
      this.logger.warn("Connection closed");
    });
    this.kucoin.onEvent("ping", () => {
      this.logger.warn("Received ping message");
    });
    this.kucoin.onEvent("welcome", () => {
      this.logger.debug("Received welcome message");
    });
    this.kucoin.onEvent("reconnect", () => {
      this.logger.warn("Reconnecting socket");
    });
    this.kucoin.onEvent("subscription", (data) => {
      this.logger.debug(JSON.stringify(data), "Subscribed to the Market Ticker");
    });
    this.kucoin.onEvent("unsubscription", (data) => {
      this.logger.debug(
        JSON.stringify(data),
        "Unsubscribed from the Market Ticker subscription",
        "SocketGateway",
      );
    });
    this.kucoin.onEvent("open", () => {
      this.logger.debug("Kucoin Socket connected");
      this.kucoin.subscribeTo("/market/ticker:all");
    });
    this.kucoin.onEvent("close", () => {
      this.kucoin.unsubscribeFrom("/market/ticker:all");
    });
    await this.kucoin.start();

    /**
     * Kucoin Socket Events: all-tickers
     * @param ticker
     * @returns void
     * @description This event is triggered when the socket receives a message from Kucoin
     */
    this.kucoin.onEvent("all-tickers", (ticker) => {
      const message = {
        tokenPrice: {
          pair: `${ticker.message.data.baseAsset}-${ticker.message.data.quoteAsset}`,
          priceNumber: ticker.message.data.price,
        },
        exchange: "kucoin",
      };

      server.emit(IoClientEvent.UPDATE_PRICES, JSON.stringify(message));
    });
  }

  handleConnection(client: Socket) {
    this.logger.debug(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage(IoClientRequest.SUBSCRIBE)
  handleMessage(@ConnectedSocket() client: Socket, @MessageBody() message: any): void {
    this.logger.debug(`Subscribe to Prices changes from client ${client.id}: ${message}`);
    this.server.socketsJoin(IoTokenRoom.PRICES);
  }

  @SubscribeMessage("ping")
  handlePingMessage(@ConnectedSocket() client: Socket) {
    this.logger.debug(`Message received from client id: ${client.id}`);

    client.emit("pong", {
      message: "Pong!",
      server_time: new Date().toISOString(),
      server_timestamp: new Date().getTime(),
    });
  }
}
