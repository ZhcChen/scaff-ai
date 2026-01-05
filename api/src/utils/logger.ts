/**
 * 日志工具封装
 *
 * 设计原则：
 * 1. 启动前日志 → 控制台输出
 * 2. 启动后日志 → 写入数据库（可扩展 Kafka 等）
 * 3. 支持多种日志级别
 * 4. 支持扩展多种输出目标
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: Record<string, unknown>;
  traceId?: string;
  userId?: number;
  timestamp: Date;
}

export interface LogTransport {
  name: string;
  write(entry: LogEntry): Promise<void>;
}

// 控制台输出（启动前使用）
class ConsoleTransport implements LogTransport {
  name = "console";

  async write(entry: LogEntry): Promise<void> {
    const timestamp = entry.timestamp.toISOString();
    const prefix = `[${timestamp}] [${entry.level.toUpperCase()}]`;
    const context = entry.context ? ` [${entry.context}]` : "";
    const traceId = entry.traceId ? ` [${entry.traceId}]` : "";

    const message = `${prefix}${context}${traceId} ${entry.message}`;

    switch (entry.level) {
      case "error":
        console.error(message, entry.data || "");
        break;
      case "warn":
        console.warn(message, entry.data || "");
        break;
      case "debug":
        console.debug(message, entry.data || "");
        break;
      default:
        console.log(message, entry.data || "");
    }
  }
}

// 数据库输出（启动后使用）
class DatabaseTransport implements LogTransport {
  name = "database";
  private getDb: (() => Promise<unknown>) | null = null;
  private buffer: LogEntry[] = [];
  private flushInterval: Timer | null = null;
  private batchSize = 100;
  private flushIntervalMs = 5000;

  setDbGetter(getter: () => Promise<unknown>) {
    this.getDb = getter;
    // 启动定时刷新
    this.flushInterval = setInterval(() => this.flush(), this.flushIntervalMs);
  }

  async write(entry: LogEntry): Promise<void> {
    this.buffer.push(entry);

    if (this.buffer.length >= this.batchSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.buffer.length === 0 || !this.getDb) return;

    const entries = this.buffer.splice(0, this.buffer.length);

    try {
      const db = await this.getDb();
      // 批量插入日志
      // 这里需要根据实际的 db 实例来实现
      if (db && typeof (db as any).insert === "function") {
        // Drizzle ORM 批量插入
        // await db.insert(sysOperationLog).values(entries.map(...));
      }
    } catch (error) {
      // 数据库写入失败，回退到控制台
      for (const entry of entries) {
        console.error("[LOG DB FALLBACK]", entry);
      }
    }
  }

  destroy() {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    this.flush();
  }
}

// 日志管理器
class Logger {
  private transports: LogTransport[] = [];
  private isStarted = false;
  private consoleTransport = new ConsoleTransport();
  private dbTransport = new DatabaseTransport();
  private defaultContext = "app";

  constructor() {
    // 默认使用控制台
    this.transports.push(this.consoleTransport);
  }

  /**
   * 标记服务已启动，切换到数据库日志
   */
  markStarted(dbGetter: () => Promise<unknown>) {
    this.isStarted = true;
    this.dbTransport.setDbGetter(dbGetter);
    this.transports.push(this.dbTransport);
  }

  /**
   * 添加自定义 Transport（如 Kafka）
   */
  addTransport(transport: LogTransport) {
    this.transports.push(transport);
  }

  /**
   * 移除 Transport
   */
  removeTransport(name: string) {
    this.transports = this.transports.filter(t => t.name !== name);
  }

  /**
   * 创建带上下文的 logger
   */
  withContext(context: string): ContextLogger {
    return new ContextLogger(this, context);
  }

  /**
   * 写入日志
   */
  async log(
    level: LogLevel,
    message: string,
    options: {
      context?: string;
      data?: Record<string, unknown>;
      traceId?: string;
      userId?: number;
    } = {}
  ): Promise<void> {
    const entry: LogEntry = {
      level,
      message,
      context: options.context || this.defaultContext,
      data: options.data,
      traceId: options.traceId,
      userId: options.userId,
      timestamp: new Date(),
    };

    // 启动前只输出到控制台
    if (!this.isStarted) {
      await this.consoleTransport.write(entry);
      return;
    }

    // 启动后输出到所有 transports
    await Promise.all(this.transports.map(t => t.write(entry)));
  }

  debug(message: string, options?: Parameters<Logger["log"]>[2]) {
    return this.log("debug", message, options);
  }

  info(message: string, options?: Parameters<Logger["log"]>[2]) {
    return this.log("info", message, options);
  }

  warn(message: string, options?: Parameters<Logger["log"]>[2]) {
    return this.log("warn", message, options);
  }

  error(message: string, options?: Parameters<Logger["log"]>[2]) {
    return this.log("error", message, options);
  }

  /**
   * 关闭日志（刷新缓冲区）
   */
  destroy() {
    this.dbTransport.destroy();
  }
}

// 带上下文的 Logger
class ContextLogger {
  constructor(
    private logger: Logger,
    private context: string
  ) {}

  debug(message: string, data?: Record<string, unknown>) {
    return this.logger.debug(message, { context: this.context, data });
  }

  info(message: string, data?: Record<string, unknown>) {
    return this.logger.info(message, { context: this.context, data });
  }

  warn(message: string, data?: Record<string, unknown>) {
    return this.logger.warn(message, { context: this.context, data });
  }

  error(message: string, data?: Record<string, unknown>) {
    return this.logger.error(message, { context: this.context, data });
  }

  withTrace(traceId: string, userId?: number) {
    return {
      debug: (message: string, data?: Record<string, unknown>) =>
        this.logger.debug(message, { context: this.context, data, traceId, userId }),
      info: (message: string, data?: Record<string, unknown>) =>
        this.logger.info(message, { context: this.context, data, traceId, userId }),
      warn: (message: string, data?: Record<string, unknown>) =>
        this.logger.warn(message, { context: this.context, data, traceId, userId }),
      error: (message: string, data?: Record<string, unknown>) =>
        this.logger.error(message, { context: this.context, data, traceId, userId }),
    };
  }
}

// 导出单例
export const logger = new Logger();

// 导出类型供扩展使用
export { Logger, ConsoleTransport, DatabaseTransport, ContextLogger };
export type { LogTransport };
