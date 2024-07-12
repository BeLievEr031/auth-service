import "reflect-metadata";
import express, { Response, Request, NextFunction } from "express";
import authRouter from "./routes/auth";
import { HttpError } from "http-errors";
import cookieParser from "cookie-parser";
// import logger from "./config/logger";
const app = express();
app.use(express.json({ limit: "15KB" }));

app.get("/", (req: Request, res: Response) => {
    res.json({ msg: "hi from jbj me" });
});

app.use(cookieParser());

app.use("/auth", authRouter);

// error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof Error) {
        const statusCode = err.statusCode || 500;

        res.status(statusCode).json({
            errors: [
                {
                    type: err.name,
                    message: err.message,
                    path: "",
                    location: "",
                    err,
                    stack: process.env.NODE_ENV === "dev" && err.stack,
                },
            ],
        });
    }
});
export default app;
