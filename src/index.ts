import * as dotenv from "dotenv";
import express, { Request, Response } from "express";
import clerkAuth from "./middleware/clerkAuth";
import prisma from "../prisma";

dotenv.config();

console.log(process.env.DATABASE_URL);

const app = express();
const port = process.env.PORT || 3000;

prisma.$connect().then(() => console.log("connected"));

app.get("/", (req: Request, res: Response) => {
    res.status(200).json({ message: "Hello", status: "success" });
});

app.get("/test", clerkAuth, (req: Request, res: Response) => {
    res.status(200).json({ message: "you are authenticated", status: "success" });
});

app.listen(port, () => {
    console.log(`server running on http://localhost:${port}`);
});
