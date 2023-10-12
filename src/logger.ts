const winston = require('winston');

export const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
  ]
}).child({module: 'sqs-consumer'});
