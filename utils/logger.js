/**
 * @module logger
 */

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const _ = require('lodash');
const appConfig = require('../config');

// const logLevels = ['error', 'warn', 'info', 'debug', 'verbose', 'silly'];

const defaults = {
  logsFolder: process.env.NODE_ENV === 'test' ? './test_logs/' : './logs/',
  jsonLogs: false
};

function configureLogger({
  logsFolder = defaults.logsFolder,
  jsonLogs = defaults.jsonLogs,
  logLevel = winston.level,
  silent = defaults.silent,
  maxLogFiles
} = {}) {
  const options = {};

  if (logsFolder) {
    if (!path.isAbsolute(logsFolder)) {
      logsFolder = path.resolve(process.cwd(), logsFolder);
    }
  }

  options.dirname = logsFolder;
  options.level = logLevel;
  options.maxLogFiles = maxLogFiles;
  options.silent = silent;

  if (jsonLogs) {
    options.json = true;
    options.stringify = true;
  }

  const transports = [];

  if (!_.isNil(options.dirname)) {
    const server = new DailyRotateFile({
      filename: './server.info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.splat(),
        winston.format.json()
      ),
      ...options
    });
    server.name = 'server';
    transports.push(server);

    const serverError = new DailyRotateFile(
      Object.assign({
        name: 'server-error',
        filename: './server.err',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.splat(),
          winston.format.json()
        ),
        ...options,
        level: 'error'
      })
    );
    serverError.name = 'server-error';
    transports.push(serverError);
  }

  const consoleFormat = options.json
    ? winston.format.json()
    : winston.format.simple();
  const consoleOptions = {
    colorize: true,
    name: 'console',
    format: consoleFormat,
    ...options
  };

  transports.push(new winston.transports.Console(consoleOptions));

  const logger = winston.createLogger({
    transports
  });

  return logger;
}

module.exports = configureLogger({
  logsFolder: appConfig.logsFolder,
  jsonLogs: appConfig.jsonLogs,
  logLevel: appConfig.logLevel,
  maxLogFiles: appConfig.maxLogFiles
});
