import JWT from "jsonwebtoken";
import { JWTUser } from "../interfaces";

export const JWT_SECRET = "$uper$ecret";

class JWTService {
  public static decodeJWTToken(token: string) {
    try {
      return JWT.verify(token, JWT_SECRET) as JWTUser;
    } catch (error) {
      return null;
    }
  }
}

export default JWTService;
