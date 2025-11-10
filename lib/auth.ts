import jwt from "jsonwebtoken"
import type { IUser } from "./models/User"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export interface TokenPayload {
  userId: string
  email: string
  userType: string
}

export function generateToken(user: IUser): string {
  const payload: TokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    userType: user.userType,
  }

  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" })
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
    return decoded
  } catch (error) {
    return null
  }
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.decode(token) as TokenPayload
    return decoded
  } catch (error) {
    return null
  }
}
