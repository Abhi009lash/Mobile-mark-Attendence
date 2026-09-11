export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  tag: string;
  message: string;
  data?: unknown;
}

const MAX_HISTORY = 50;
const logHistory: LogEntry[] = [];

function formatTime(): string {
  const now = new Date();
  return now.toTimeString().split(' ')[0] + '.' + String(now.getMilliseconds()).padStart(3, '0');
}

function recordLog(level: LogLevel, tag: string, message: string, data?: unknown): void {
  const entry: LogEntry = {
    timestamp: formatTime(),
    level,
    tag,
    message,
    data,
  };

  logHistory.push(entry);
  if (logHistory.length > MAX_HISTORY) {
    logHistory.shift();
  }

  const prefix = `[${entry.timestamp}][${level}][${tag}]`;
  switch (level) {
    case 'DEBUG':
      console.debug(prefix, message, data !== undefined ? data : '');
      break;
    case 'INFO':
      console.log(prefix, message, data !== undefined ? data : '');
      break;
    case 'WARN':
      console.warn(prefix, message, data !== undefined ? data : '');
      break;
    case 'ERROR':
      console.error(prefix, message, data !== undefined ? data : '');
      break;
  }
}

export const logger = {
  debug(tag: string, message: string, data?: unknown): void {
    recordLog('DEBUG', tag, message, data);
  },

  info(tag: string, message: string, data?: unknown): void {
    recordLog('INFO', tag, message, data);
  },

  warn(tag: string, message: string, data?: unknown): void {
    recordLog('WARN', tag, message, data);
  },

  error(tag: string, message: string, error?: unknown): void {
    recordLog('ERROR', tag, message, error);
  },

  getHistory(): LogEntry[] {
    return [...logHistory];
  },

  clearHistory(): void {
    logHistory.length = 0;
  },
};
