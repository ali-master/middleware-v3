import { env } from "../env.util";

export class AnalyticsConfig {
  static readonly API_KEY = env.get("POSTHOG_API_KEY").required().asString();
}
