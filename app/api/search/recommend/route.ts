import { connectDB } from "@/lib/mongodb"
import { Job } from "@/lib/models/Job"
import { User } from "@/lib/models/User"
import { calculateAdvancedScore } from "@/lib/matching-algorithm"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
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

    // Get user profile
    const user = await User.findById(tokenPayload.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Get all active jobs
    const jobs = await Job.find({ status: "active" }).populate("employerId", "firstName lastName company")

    // Calculate match scores for each job
    const recommendedJobs = jobs
      .map((job) => {
        const score = calculateAdvancedScore(
          job.skills || [],
          user.skills || [],
          user.experience || 0,
          job.requiredExperience || 0,
          user.location,
          job.location,
          job.jobType,
          user.preferredJobType,
        )

        return {
          ...job.toObject(),
          matchScore: score,
        }
      })
      .filter((job) => job.matchScore >= 50) // Only jobs with 50%+ match
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10) // Top 10 recommendations

    return NextResponse.json({
      recommendations: recommendedJobs,
      count: recommendedJobs.length,
    })
  } catch (error) {
    console.error("Error getting recommendations:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
