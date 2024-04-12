import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export default function clerkAuth(req: Request, res: Response, next: NextFunction) {
  const publicKey = process.env.CLERK_JWT_PEM_KEY || "";
  const token = req.headers.authorization;

  if (token === undefined) {
    res.status(401).json({ message: "user not signed in", status: "fail", data: {} });

    return;
  }

  if (publicKey === "") {
    console.log("clerk jwt pem key not found");
    process.exit(1);
  }

  try {
    let session = token.split(" ")[1];
    let decoded = jwt.verify(session, publicKey);
    console.log(decoded);

    next();
  } catch (error) {
    res.status(400).json({ message: "invalid token", status: "fail" });
  }
}
