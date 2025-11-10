import { generateText } from "ai"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1]
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tokenPayload = verifyToken(token)
    if (!tokenPayload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(tokenPayload.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const topic = searchParams.get("topic") || "general"

    // Use AI to provide personalized career advice
    const { text: advice } = await generateText({
      model: "openai/gpt-5-mini",
      prompt: `Provide personalized career advice for this job seeker:

Profile:
Name: ${user.firstName} ${user.lastName}
Skills: ${user.skills?.join(", ") || "Not specified"}
Experience: ${user.experience} years
Education: ${user.resume?.parsedData?.education?.join(", ") || "Not specified"}
Location: ${user.location || "Not specified"}

Topic: ${topic}

Please provide:
- Specific, actionable advice for their current career stage
- Industry trends that match their skills
- Skill gaps to address
- Networking suggestions
- Resources for professional development
- Next steps for career growth

Make it personalized and practical.`,
    })

    return NextResponse.json({
      userId: user._id,
      topic,
      advice,
    })
  } catch (error) {
    console.error("Career advice error:", error)
    return NextResponse.json({ error: "Failed to get career advice" }, { status: 500 })
  }
}
