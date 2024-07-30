import "reflect-metadata";
import express, { Response, Request, NextFunction } from "express";
import authRouter from "./routes/auth";
import tenantRouter from "./routes/tenant";
import { HttpError } from "http-errors";
import cookieParser from "cookie-parser";
// import logger from "./config/logger";
const app = express();
app.use(express.json({ limit: "15KB" }));

app.get("/", (req: Request, res: Response) => {
    res.json({ msg: "hi from jbj me" });
});

app.use(express.static("public"));
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/tenant", tenantRouter);

// error handling middleware
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: HttpError, _req: Request, res: Response, next: NextFunction) => {
    const statusCode = err.status || err.statusCode || 500;
    res.status(statusCode).json({
        errors: [
            {
                type: err.name,
                message: err.inner?.message || err.message,
                path: "",
                location: "",
                err,
                stack: process.env.NODE_ENV === "dev" && err.stack,
            },
        ],
    });
});
export default app;
