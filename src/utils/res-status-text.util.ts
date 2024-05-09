// Enums
import { HttpStatus } from "@nestjs/common/enums/http-status.enum";

const statusTextMap = new Map();
for (const [text, code] of Object.entries(HttpStatus)) {
  statusTextMap.set(code, text);
}
export function getHttpStatusText(statusCode: number): string {
  return statusTextMap.get(statusCode);
}
