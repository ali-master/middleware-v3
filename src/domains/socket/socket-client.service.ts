import { Logger } from "@nestjs/common";
import { CommonConfig } from "@root/utils";
// Decorators
import { Injectable } from "@nestjs/common";
// Enums
import { IoClientEvent, IoClientMessage, IoClientRequest } from "@root/domains/socket/enums";
// Types
import type { Socket } from "socket.io-client";
import type { OnApplicationShutdown } from "@nestjs/common";
import { Duration } from "effect";
import { DurationInput } from "effect/Duration";

@Injectable()
export class SocketHealthCheckService implements OnApplicationShutdown {
  private readonly logger = new Logger(SocketHealthCheckService.name);
  private socket: Socket;
  private readonly pingInterval = Duration.toMillis(CommonConfig.WS_HEALTH_CHECK_PING_INTERVAL);
  private pingAttempts = 0;
  private maxPingAttempts = CommonConfig.WS_HEALTH_CHECK_MAX_PING_ATTEMPTS;
  private pingTimeout: NodeJS.Timeout;
  private maxPingTimeout = Duration.toMillis(CommonConfig.WS_HEALTH_CHECK_PING_TIMEOUT);
  private pingIntervalId: NodeJS.Timeout;
  private isPinging = false;
  private isPongReceived = false;
  private isPongTimeout = false;

  constructor() {
    this.socket = require("socket.io-client")(`http://localhost:${CommonConfig.PORT}`);
    this.setupSocketEvents();
    this.sendPing();
  }

  onApplicationShutdown() {
    this.stopPing();
    this.socket.disconnect();
  }

  isHealthy() {
    return this.socket.connected && !this.isPongTimeout && this.pingAttempts < this.maxPingAttempts;
  }

  private setupSocketEvents() {
    this.socket.emit(IoClientRequest.SUBSCRIBE, IoClientMessage.JOIN_PRICES_ROOM);

    this.socket.on("connect", () => {
      this.logger.debug("Connected to server");
    });

    this.socket.on("disconnect", () => {
      this.logger.debug("Disconnected from server");
    });

    this.socket.on("error", (error) => {
      this.logger.error(`Error: ${error}`);
    });

    this.socket.on("connect_error", (error) => {
      this.logger.error(`Connection error: ${error}`);
    });

    this.socket.on("connect_timeout", (timeout) => {
      this.logger.error(`Connection timeout after ${timeout} ms`);
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
      this.logger.error(`Reconnection error: ${error}`);
    });

    this.socket.on("reconnect_failed", () => {
      this.logger.error("Reconnection failed");
    });

    this.socket.on("pong", () => {
      this.isPongReceived = true;
      this.isPongTimeout = false;
      this.pingAttempts = 0;
      this.isPinging = false;
      this.logger.debug("Received pong message");
    });
  }

  private sendEvent(event: string, data: any) {
    this.socket.emit(event, data);
  }

  private sendPing() {
    this.pingIntervalId = setInterval(() => {
      this.isPinging = true;
      this.pingAttempts++;
      this.logger.debug(`Ping attempt ${this.pingAttempts}`);
      this.sendEvent("ping", "ping");
      this.pingTimeout = setTimeout(() => {
        if (!this.isPongReceived) {
          this.isPongTimeout = true;
          this.logger.error("Ping timeout");
          this.socket.disconnect();
        }
        this.isPongReceived = false;
        this.isPinging = false;
      }, this.maxPingTimeout); // 1 second less than the ping interval
    }, this.pingInterval);
  }

  private stopPing() {
    clearInterval(this.pingIntervalId);
    clearTimeout(this.pingTimeout);
  }
}
