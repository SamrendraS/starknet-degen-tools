import pino from 'pino';

const isProd = process.env.NODE_ENV === 'production';

const logger = isProd
  ? pino({
      level: process.env.LOG_LEVEL || 'info',
    })
  : pino({
      level: process.env.LOG_LEVEL || 'debug',
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });

export default logger;
