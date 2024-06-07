import { PostHog } from "posthog-node";
import { AppServiceName } from "@root/utils/common.util";

export const distinctId = AppServiceName;
export const analyticsClient = new PostHog("phc_55mJKwu5Y71NIxGL2UDMoUY6YchuFety17kTLio1cjz", {
  host: "https://us.i.posthog.com",
  featureFlagsPollingInterval: 5000,
  featureFlagsRequestTimeoutMs: 60000,
  fetchRetryCount: 60,
  requestTimeout: 60000,
  bootstrap: {
    distinctId,
    featureFlags: {
      monitoring: true,
    },
  },
});

export function trackEvent(event: string, properties: Record<string, any>) {
  analyticsClient.capture({
    distinctId,
    event,
    properties,
  });
}

export function isFeatureEnabled(feature: string) {
  return analyticsClient.isFeatureEnabled(feature, distinctId);
}

export function getFeatureFlags(feature: string) {
  return analyticsClient.getFeatureFlag(feature, distinctId);
}
