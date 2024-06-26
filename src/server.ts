import app from "./app";
import Config from "./config";
import logger from "./config/logger";

const startServer = () => {
    try {
        const PORT = Config.PORT;
        app.listen(PORT, () => {
            logger.info(`Server started o sjbjk n sdsf PORT 🔥🔥 ${PORT}`, {
                path: process.cwd(),
            });
        });
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

startServer();
