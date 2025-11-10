import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"
import { generateToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { email, password, firstName, lastName, userType } = await request.json()

    if (!email || !password || !firstName || !lastName || !userType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    const user = new User({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      userType,
    })

    await user.save()

    const token = generateToken(user)

    return NextResponse.json(
      {
        message: "User registered successfully",
        token,
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          userType: user.userType,
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
