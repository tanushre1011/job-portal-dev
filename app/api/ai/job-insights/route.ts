import { generateText } from "ai"
import { connectDB } from "@/lib/mongodb"
import { Job } from "@/lib/models/Job"
import { User } from "@/lib/models/User"
import { verifyToken } from "@/lib/auth"
import { calculateAdvancedScore } from "@/lib/matching-algorithm"
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

    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get("jobId")

    const user = await User.findById(tokenPayload.userId)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const job = await Job.findById(jobId).populate("employerId", "company")
    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    const matchScore = calculateAdvancedScore(
      job.skills || [],
      user.skills || [],
      user.experience || 0,
      job.requiredExperience || 0,
      user.location,
      job.location,
      job.jobType,
    )

    // Use AI to provide job-specific insights
    const { text: insights } = await generateText({
      model: "openai/gpt-5-mini",
      prompt: `Provide personalized career insights for this job application:

Job: ${job.title} at ${(job.employerId as any).company}
Location: ${job.location}
Required Skills: ${job.skills?.join(", ")}
Experience Required: ${job.requiredExperience} years
Job Type: ${job.jobType}
Salary Range: ${job.salary?.min}-${job.salary?.max}

Your Profile:
Skills: ${user.skills?.join(", ")}
Experience: ${user.experience} years
Location: ${user.location}

Match Score: ${matchScore}%

Please provide:
1. Why this job is a good fit for your profile
2. Key skills you have that the company is looking for
3. Areas where you could improve for this role
4. Specific preparation tips for the interview
5. Salary negotiation insights based on the market

Keep it concise and actionable.`,
    })

    return NextResponse.json({
      jobId,
      jobTitle: job.title,
      company: (job.employerId as any).company,
      matchScore,
      insights,
    })
  } catch (error) {
    console.error("Job insights error:", error)
    return NextResponse.json({ error: "Failed to get job insights" }, { status: 500 })
  }
}
