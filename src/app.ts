import "reflect-metadata";
import express, { Response, Request } from "express";
import authRouter from "./routes/auth";
// import logger from "./config/logger";
const app = express();

app.get("/", (req: Request, res: Response) => {
    res.json({ msg: "hi from jbj me" });
});

app.use("/auth", authRouter);

export default app;
