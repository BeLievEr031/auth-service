import express, { Response, Request } from "express";
// import logger from "./config/logger";
const app = express();

app.get("/", (req: Request, res: Response) => {
    res.json({ msg: "hi from jbj me" });
});

app.post("/auth/register", (req, res) => {
    res.status(201).send("POST Register");
});

export default app;
