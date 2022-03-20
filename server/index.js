import config from "./config.js";
import server from "./server.js";
import { logger } from "./utils.js";

server
  .listen(config.port)
  .on('listening', () => logger.info(`server running at ${config.port}!`))

process.on('uncaughtException', (error) => logger.info(`uncaughtException happened: ${error.stack || error}`))
process.on('unhandledRejection', (error) => logger.info(`unhandledRejection happened: ${error.stack || error}`))
