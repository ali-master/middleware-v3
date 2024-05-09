import * as requestIp from "request-ip";

export function getRequestIp(req: any) {
  return requestIp.getClientIp(req);
}
