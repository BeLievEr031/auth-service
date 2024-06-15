import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    defaultMeta: { service: "auth-service" },
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({
            level: "info",
            filename: "logs/auth-service.log",
        }),
    ],
});

export default logger;
