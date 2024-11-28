import { NextFunction, Request, Response } from "express";
import Jwt from "jsonwebtoken";
import { User } from "../@types/user.types";

export function authMiddleware(
  request: Request,
  response: Response,
  next: NextFunction
) {
  const authToken = request.headers.authorization;

  if (!authToken) {
    return response.status(401).json({ message: "token is not provided!" });
  }

  const [, token] = authToken.split(" ");

  try {
    Jwt.verify(token, String(process.env.JWT_SECRET), (err, decoded) => {
      if (err) {
        throw new Error();
      }

      request.user = decoded as User;
    });
  } catch {
    return response.status(401).json({ message: "token is invalid." });
  }
  next();
}
