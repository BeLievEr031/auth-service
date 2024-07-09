import app from "./app";
import Config from "./config";
import { AppDataSource } from "./config/data-source";
import logger from "./config/logger";

const startServer = async () => {
    try {
        const PORT = Config.PORT;
        await AppDataSource.initialize();
        logger.info("Connected to database!!");
        app.listen(PORT, () => {
            logger.info(`Server started on ${PORT}`, {
                path: process.cwd(),
            });
        });
    } catch (error) {
        logger.error(error);
        process.exit(1);
    }
};

void startServer();
