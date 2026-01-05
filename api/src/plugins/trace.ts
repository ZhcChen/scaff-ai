import { Elysia } from "elysia";
import { genId } from "../utils";

export const tracePlugin = new Elysia({ name: "trace" })
  .derive(({ headers }) => {
    const traceId = (headers["x-trace-id"] as string) || genId(32);
    const startTime = Date.now();

    return { traceId, startTime };
  })
  .onAfterResponse(({ traceId, startTime, request, set }) => {
    const duration = Date.now() - startTime;

    // 设置响应头
    set.headers["x-trace-id"] = traceId;

    // 打印日志
    console.log(
      JSON.stringify({
        time: new Date().toISOString(),
        traceId,
        method: request.method,
        path: new URL(request.url).pathname,
        duration: `${duration}ms`,
      })
    );
  });
