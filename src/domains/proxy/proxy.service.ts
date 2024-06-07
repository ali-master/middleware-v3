import { Injectable } from "@nestjs/common";
// DTOs
import { ProxyDto } from "@root/domains/proxy/dtos";

@Injectable()
export class ProxyService {
  public async proxy(payload: ProxyDto) {
    const { method, headers, reqUrl, body } = payload;
    const fetchConfig = {
      ...(method && { method: method }),
      ...(body && (method === "POST" || method === "PUT") && { body: JSON.stringify(body) }),
      ...(headers && {
        headers: headers,
      }),
    };
    const response = await fetch(reqUrl, fetchConfig);

    return await response.json();
  }
}
