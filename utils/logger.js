const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const developmentLogger = () => {
  return createLogger({
    level: 'debug',
    format: combine(
      colorize(),
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      logFormat
    ),
    transports: [new transports.Console()],
  });
};

const productionLogger = () => {
  return createLogger({
    level: 'info',
    format: combine(
      timestamp(),
      errors({ stack: true }),
      format.json()
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: '../logs/error.log', level: 'error' }),
      new transports.File({ filename: '../logs/combined.log' }),
    ],
  });
};

let logger = null;
if (process.env.NODE_ENV === 'production') {
  logger = productionLogger();
} else {
  logger = developmentLogger();
}

module.exports = logger;