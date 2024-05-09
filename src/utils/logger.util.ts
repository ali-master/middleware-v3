import pretty from "pino-pretty";
import { default as PinoLogger } from "pino";

export const serviceName = "Middleware";
const stream = pretty({
  colorize: true,
  append: true,
  crlf: true,
  levelFirst: true,
  colorizeObjects: true,
  singleLine: true,
});
export const SystemLogger = PinoLogger(
  {
    name: serviceName,
    enabled: true,
    safe: true,
  },
  stream,
);
