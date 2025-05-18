const http = require('http');
const config = require('./config/config');
const app = require('./app');
const logger = require('./config/logger');
const { sequelize } = require('./models');

const server = http.createServer(app);

sequelize
  .authenticate()
  .then(() => {
    logger.info('Database connected');
    server.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
    });
  })
  .catch((err) => {
    logger.error('Database connection error:', err);
    process.exit(1);
  });

const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});