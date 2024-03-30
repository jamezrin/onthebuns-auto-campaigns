import winston from 'winston';

export const hybridJsonFormat = winston.format.printf(
  ({ app: _, level, message, ...rest }) => {
    const base = `[${level}]: ${message}`;

    if (Object.keys(rest).length === 0) {
      return base;
    }

    return base + '\r\n' + JSON.stringify(rest, null, 2);
  },
);

export const prdFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json(),
);

export const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  hybridJsonFormat,
);

export function setupLogger() {
  const logger = winston.createLogger({
    level: 'info',
    format: process.env.NODE_ENV === 'production' ? prdFormat : devFormat,
    defaultMeta: { app: 'onthatass-auto-campaigns' },
    transports: [new winston.transports.Console()],
  });

  return logger;
}
