import { clerkClient } from "@clerk/clerk-sdk-node";
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import Prisma from "../../prisma";

export default async function clerkAuth(req: Request, res: Response, next: NextFunction) {
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

    if (decoded?.sub) {
      try {
        const user = await clerkClient.users.getUser(decoded.sub as string);
        req["user"] = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.emailAddresses[0].emailAddress,
        };

        const userExists = await Prisma.user.findUnique({
          where: {
            email: user.emailAddresses[0].emailAddress,
          },
        });

        if (!userExists) {
          console.log("creating user");
          await Prisma.user.create({
            data: {
              clerkSub: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.emailAddresses[0].emailAddress,
            },
          });
          console.log("user created");
        }

        next();
      } catch (error) {
        console.log(error);
        res.status(400).json({ message: "invalid token", status: "fail" });
        return;
      }
    }

    next();
  } catch (error) {
    res.status(400).json({ message: "invalid token", status: "fail" });
  }
}
