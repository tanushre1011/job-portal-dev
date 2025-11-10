import { generateText } from "ai"
import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
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

    const resumeData = user.resume?.parsedData

    if (!resumeData) {
      return NextResponse.json({ error: "No resume data found" }, { status: 400 })
    }

    // Use AI to analyze resume and provide insights
    const { text: analysis } = await generateText({
      model: "openai/gpt-5-mini",
      prompt: `Analyze this resume data and provide career recommendations and job search advice:

Skills: ${resumeData.skills?.join(", ")}
Years of Experience: ${user.experience || "Not specified"}
Education: ${resumeData.education?.join(", ")}

Please provide:
1. Top 3 job roles that match these skills
2. Skills gaps to improve employability
3. Industries where this profile is most valuable
4. Salary expectations based on experience and skills
5. Specific areas to focus on for next career advancement

Format the response as a clear, actionable report.`,
    })

    return NextResponse.json({
      analysis,
      resumeData,
      userId: user._id,
    })
  } catch (error) {
    console.error("AI analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze resume" }, { status: 500 })
  }
}
