import { prismaClient } from "../lib/db";
import { createHmac, randomBytes } from "node:crypto";
import JWT from "jsonwebtoken";
import { JWT_SECRET } from "./jwt";
import MailService from "./mail";

export interface CreateUserPayload {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface GetUserTokenPayload {
  email: string;
  password: string;
}

class UserService {
  public static createUser(payload: CreateUserPayload) {
    const { firstName, lastName, email, password } = payload;
    const salt = randomBytes(32).toString("hex");
    const hashedPassword = UserService.generateHash(salt, password);
    return prismaClient.user.create({
      data: {
        firstName,
        lastName,
        email,
        salt,
        password: hashedPassword,
      },
    });
  }

  private static generateHash(salt: string, password: string) {
    const hashedPassword = createHmac("sha256", salt)
      .update(password)
      .digest("hex");
    return hashedPassword;
  }

  public static getUserById(id: string) {
    return prismaClient.user.findUnique({
      where: {
        id,
      },
    });
  }

  private static getUserByEmail(email: string) {
    return prismaClient.user.findUnique({
      where: {
        email,
      },
    });
  }

  public static async getUserToken(payload: GetUserTokenPayload) {
    const { email, password } = payload;
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    const userSalt = user.salt;
    const userHashPassword = UserService.generateHash(userSalt, password);

    if (userHashPassword !== user.password) {
      throw new Error("Incorrect password");
    }

    // Generate token
    const token = JWT.sign({ id: user.id, email: user.email }, JWT_SECRET);
    return token;
  }

  public static async forgotPassword(payload: { email: string }) {
    const { email } = payload;
    const user = await UserService.getUserByEmail(email);
    if (!user) {
      throw new Error("User not found");
    }

    const newPassword = randomBytes(8).toString("hex");
    const salt = randomBytes(32).toString("hex");
    const hashedPassword = UserService.generateHash(salt, newPassword);

    await prismaClient.user.update({
      where: {
        id: user.id,
      },
      data: {
        salt,
        password: hashedPassword,
      },
    });

    const res = await MailService.sendMail({
      password: newPassword,
      email,
      userId: user.id,
    });

    console.log(res);
    if (res) {
      return true;
    }
    return false;
  }
}

export default UserService;
