import { from } from "env-var";
import { Logger } from "@nestjs/common";

const log = new Logger("ENV");
export const env = from(process.env, {}, (varname, str) => {
  log.debug(`Environment variable ${varname} with Value: ${str} loaded`);
});
