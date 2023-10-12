const winston = require('winston');

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-ddTHH:mm:ss.SSS' }),
      winston.format.printf(({ level, message, timestamp }) => {
        return `${timestamp} ${level}: ${message}`;
      })
  ),
  transports: [
    new winston.transports.Console(),
  ]
}).child({module: 'sqs-consumer'});
