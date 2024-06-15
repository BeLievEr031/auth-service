import app from "./app";
import Config from "./config";

const startServer = () => {
    try {
        const PORT = Config.PORT;
        app.listen(PORT, () => console.log(`Listening on PORT ${PORT}`));
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
};

startServer();
