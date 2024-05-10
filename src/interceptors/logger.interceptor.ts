import { HttpException, HttpStatus, Injectable, Logger } from "@nestjs/common";
// Utilities
import { tap } from "rxjs/operators";
import {
  getHttpStatusText,
  getRequestIp,
  getCorrelationId,
  filterSensitiveProps,
} from "@root/utils";
// Types
import type { Observable } from "rxjs";
import type { FastifyReply, FastifyRequest } from "fastify";
import type { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";

/**
 * Interceptor that logs input/output requests
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger();

  /**
   * Intercept method, logs before and after the request being processed
   * @param context details about the current request
   * @param next implements the handle method that returns an Observable
   */
  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest<FastifyRequest>();
    let { method, url, body, headers, params, query, protocol } = req;
    const shouldNotBeLogged = /api\/(v\d)\/(health|metrics)/g.test(url);

    if (shouldNotBeLogged) {
      return next.handle();
    }
    if (req.url.includes("proxy")) {
      const {
        reqUrl,
        method: proxyMethod,
        body: proxyBody,
        headers: proxyHeaders,
      } = body as unknown as Record<string, string>;
      url = reqUrl;
      method = proxyMethod;
      body = proxyBody;
      headers = proxyHeaders as any;
    }

    const xCorrelationId = getCorrelationId();
    const reqIp = getRequestIp(req);
    const startTime = Date.now();
    const logData = {
      type: "request",
      message: "request",
      process: "start",
      reqBody: body,
      reqHeaders: filterSensitiveProps(headers),
      reqUrl: url,
      reqMethod: method,
      reqParams: params,
      reqQuery: query,
      reqProtocol: protocol,
      reqIp,
    };
    this.logger.log(JSON.stringify(logData), xCorrelationId);

    return next.handle().pipe(
      tap({
        next: (body: any): void => {
          const res = context.switchToHttp().getResponse<FastifyReply>();
          this.logNext(
            {
              ...logData,
              resBody: JSON.stringify(body),
            },
            startTime,
            context,
          );

          res.headers["X-Correlation-Id"] = xCorrelationId;
        },
        error: (err: Error): void => {
          this.logError(err, logData, startTime, context);
        },
      }),
    );
  }

  /**
   * Logs the request response in success cases
   * @param logData
   * @param startTime
   * @param context details about the current request
   */
  private logNext(logData: any, startTime: number, context: ExecutionContext): void {
    const res = context.switchToHttp().getResponse<FastifyReply>();
    const { statusCode } = res;
    const xCorrelationId = getCorrelationId();
    const logResult = {
      ...logData,
      type: "response",
      message: "response",
      process: "finish",
    };
    logResult.resDuration = `${Date.now() - startTime}ms`;
    logResult.resStatus = statusCode;
    logResult.resStatusText = getHttpStatusText(statusCode);

    this.logger.log(JSON.stringify(logResult), xCorrelationId);
  }

  /**
   * Logs the request response in success cases
   * @param error Error object
   * @param logData
   * @param startTime
   * @param context details about the current request
   */
  private logError(error: any, logData: any, startTime: number, context: ExecutionContext): void {
    const req: Request = context.switchToHttp().getRequest<Request>();
    const { headers = {} } = req;

    const xCorrelationId = getCorrelationId();
    logData.resHeaders = { headers: filterSensitiveProps(headers) };
    logData.error = error.message;
    logData.errorStack = error.stack ?? "unknown";
    logData.errorDescription = error?.description ?? error?.reason ?? "unknown";
    logData.errorStatus = error?.status ?? 500;
    logData.errorType = error?.error;

    const logResult = {
      type: "response",
      message: "error",
      process: "finish",
      error,
      ...logData,
    };
    logResult.resDuration = `${Date.now() - startTime}ms`;
    logResult.resStatus = error?.status ?? 500;
    logResult.resStatusText = getHttpStatusText(logResult.resStatus);

    if (error instanceof HttpException) {
      const statusCode: number = error.getStatus();
      logResult.resStatus = statusCode;
      logResult.resStatusText = getHttpStatusText(statusCode);

      if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.warn(JSON.stringify(logResult), xCorrelationId);
      } else {
        this.logger.error(JSON.stringify(logResult), undefined, xCorrelationId);
      }
    } else {
      this.logger.error(JSON.stringify(logResult), undefined, xCorrelationId);
    }
  }
}
