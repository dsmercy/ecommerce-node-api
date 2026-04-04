import pino from 'pino';
import { env } from '../config/env.js';

const logger = pino(
  env.nodeEnv === 'development'
    ? {
        level: 'debug',
        timestamp: pino.stdTimeFunctions.isoTime,
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        },
      }
    : {
        level: 'info',
        timestamp: pino.stdTimeFunctions.isoTime,
      }
);

export default logger;
