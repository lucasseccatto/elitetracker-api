import { User } from "./user.types";

export {};

declare global {
  namespace Express {
    export interface Request {
      user: User;
    }
  }
}
