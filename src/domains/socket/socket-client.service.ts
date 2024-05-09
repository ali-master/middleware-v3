import { Injectable, Logger } from "@nestjs/common";
import { Socket } from "socket.io-client";
import { IoClientEvent, IoClientMessage, IoClientRequest } from "@root/domains/socket/enums";
import { CommonConfig } from "@root/utils";

@Injectable()
export class SocketService {
  private readonly logger = new Logger(SocketService.name);
  private socket: Socket;

  constructor() {
    this.socket = require("socket.io-client")(`http://localhost:${CommonConfig.PORT}`);
    this.setupSocketEvents();
    this.sendPing();
  }

  private setupSocketEvents() {
    this.socket.emit(IoClientRequest.SUBSCRIBE, IoClientMessage.JOIN_PRICES_ROOM);
    // Listen to 'messageToClient' event from the server
    this.socket.on("pong", (data) => {
      this.logger.debug(`Received serverEvent: ${data}`);
    });

    this.socket.on("connect", () => {
      this.logger.debug("Connected to server");
    });

    this.socket.on("disconnect", () => {
      this.logger.debug("Disconnected from server");
    });

    this.socket.on("error", (error) => {
      this.logger.error(error);
    });

    this.socket.on("connect_error", (error) => {
      this.logger.error(error);
    });

    this.socket.on("connect_timeout", (timeout) => {
      this.logger.error(timeout);
    });

    this.socket.on("reconnect", (attempt) => {
      this.logger.debug(`Reconnected after ${attempt} attempts`);
    });

    this.socket.on("reconnect_attempt", (attempt) => {
      this.logger.debug(`Reconnect attempt ${attempt}`);
    });

    this.socket.on("reconnecting", (attempt) => {
      this.logger.debug(`Reconnecting attempt ${attempt}`);
    });

    this.socket.on("reconnect_error", (error) => {
      this.logger.error(error);
    });

    this.socket.on(IoClientEvent.UPDATE_PRICES, (data) => {
      // this.logger.debug(JSON.stringify(data));
    });
  }

  sendPing() {
    this.socket.emit("ping");
  }
}
