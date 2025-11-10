import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tokenPayload = verifyToken(token)
    if (!tokenPayload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await User.findById(params.id).select("-password")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tokenPayload = verifyToken(token)
    if (!tokenPayload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Only allow users to update their own profile
    if (tokenPayload.userId !== params.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const data = await request.json()
    const user = await User.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    }).select("-password")

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
