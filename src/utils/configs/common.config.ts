import { env } from "../env.util";

export class CommonConfig {
  static readonly ENV = env
    .get("NODE_ENV")
    .default("development")
    .asEnum(["development", "production"]);
  static readonly PORT = env.get("PORT").required().asPortNumber();
}
