import { from } from "env-var";
import { Logger } from "@nestjs/common";
import { DurationInput } from "effect/Duration";

const log = new Logger("ENV");
const envInstance = from(process.env, {}, (varname, str) => {
  log.debug(`Environment variable ${varname} with Value: ${str} loaded`);
});

export class CommonConfig {
  static readonly ENV = envInstance
    .get("NODE_ENV")
    .default("development")
    .asEnum(["development", "production"]);
  static readonly PORT = envInstance.get("PORT").required().asPortNumber();
  static readonly KUCOIN_BASE_URL = envInstance.get("KUCOIN_BASE_URL").required().asUrlString();
  static readonly KUCOIN_OPENAPI_BASE_URL = envInstance
    .get("KUCOIN_OPENAPI_BASE_URL")
    .required()
    .asUrlString();
  static readonly KUCOIN_OPENAPI_VERSION = envInstance
    .get("KUCOIN_OPENAPI_VERSION")
    .required()
    .asIntPositive();
  static readonly MIDDLEWARE_WS_RECONNECT_TIMEOUT = envInstance
    .get("MIDDLEWARE_WS_RECONNECT_TIMEOUT")
    .required()
    .asString();
  static readonly PROXY_MAX_REQUEST_TIMEOUT = envInstance
    .get("PROXY_MAX_REQUEST_TIMEOUT")
    .required()
    .asString();
  static readonly WS_HEALTH_CHECK_PING_INTERVAL = envInstance
    .get("WS_HEALTH_CHECK_PING_INTERVAL")
    .required()
    .asString() as DurationInput;
  static readonly WS_HEALTH_CHECK_PING_TIMEOUT = envInstance
    .get("WS_HEALTH_CHECK_PING_TIMEOUT")
    .required()
    .asString() as DurationInput;
  static readonly WS_HEALTH_CHECK_MAX_PING_ATTEMPTS = envInstance
    .get("WS_HEALTH_CHECK_MAX_PING_ATTEMPTS")
    .required()
    .asIntPositive();
}
