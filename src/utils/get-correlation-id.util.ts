import { ClsServiceManager } from "nestjs-cls";

export function getCorrelationId() {
  const cls = ClsServiceManager.getClsService();

  return cls.getId() ?? "";
}
