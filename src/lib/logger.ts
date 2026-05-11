import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: {
    service: "digital-marketplace",
    env: process.env.NODE_ENV,
  },
  transport: process.env.NODE_ENV === "development" 
    ? { target: "pino-pretty", options: { colorize: true } } 
    : undefined,
});
