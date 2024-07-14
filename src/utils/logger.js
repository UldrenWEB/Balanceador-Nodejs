import { createLogger, format, transports } from "winston";
import path from "path";

const createServiceLogger = (host) => {
  return createLogger({
    level: "info",
    format: format.combine(
      format.timestamp(),
      format.printf(
        ({ timestamp, level, message }) => `${timestamp} ${level}: ${message}`
      )
    ),
    transports: [
      new transports.File({ filename: path.join("src/logs", `${host}.log`) }),
    ],
  });
};

export default createServiceLogger;
