export interface LogMeta {
  requestId?: string;
  method?: string;
  path?: string;
  status?: number;
  duration?: number;
  userId?: string;
  agentId?: string;
  executionId?: string;
  [key: string]: unknown;
}

class StructuredLogger {
  private formatLog(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', message: string, meta?: LogMeta) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(meta || {})
    });
  }

  info(message: string, meta?: LogMeta) {
    console.log(this.formatLog('INFO', message, meta));
  }

  warn(message: string, meta?: LogMeta) {
    console.warn(this.formatLog('WARN', message, meta));
  }

  error(message: string, error?: unknown, meta?: LogMeta) {
    const errorDetails = error instanceof Error 
      ? { errorMessage: error.message, stack: error.stack }
      : { rawError: error };

    console.error(this.formatLog('ERROR', message, { ...meta, ...errorDetails }));
  }

  debug(message: string, meta?: LogMeta) {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatLog('DEBUG', message, meta));
    }
  }
}

export const logger = new StructuredLogger();
