import winston from 'winston';

export function setupLogger() {
  const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss',
      }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json(),
    ),
    defaultMeta: { app: 'onthatass-auto-campaigns' },
    transports: [new winston.transports.Console()],
  });

  if (process.env.NODE_ENV !== 'production') {
    logger.add(
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.timestamp(),
          customDevWinstonFormat,
        ),
      }),
    );
  }

  return logger;
}

export const customDevWinstonFormat = winston.format.printf(
  ({ app, level, message, timestamp, ...rest }) => {
    const base = `[${app}] ${timestamp} ${level}: ${message}`;

    if (Object.keys(rest).length === 0) {
      return base;
    }

    return base + '\r\n' + JSON.stringify(rest, null, 2);
  },
);
