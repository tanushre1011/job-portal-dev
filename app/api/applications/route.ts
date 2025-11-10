import { connectDB } from "@/lib/mongodb"
import { Application } from "@/lib/models/Application"
import { Job } from "@/lib/models/Job"
import { User } from "@/lib/models/User"
import { calculateMatchScore } from "@/lib/matching-algorithm"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const { jobId, jobSeekerId, coverLetter, resumeUrl } = await request.json()

    const job = await Job.findById(jobId)
    const user = await User.findById(jobSeekerId)

    if (!job || !user) {
      return NextResponse.json({ error: "Job or user not found" }, { status: 404 })
    }

    const existingApplication = await Application.findOne({
      jobId,
      jobSeekerId,
    })

    if (existingApplication) {
      return NextResponse.json({ error: "Already applied for this job" }, { status: 400 })
    }

    const matchResult = calculateMatchScore(job.skills || [], user.skills || [])

    const application = new Application({
      jobId,
      jobSeekerId,
      employerId: job.employerId,
      resumeUrl,
      coverLetter,
      matchScore: matchResult.matchScore,
    })

    await application.save()

    await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } })

    return NextResponse.json(application, { status: 201 })
  } catch (error) {
    console.error("Error creating application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const jobSeekerId = searchParams.get("jobSeekerId")
    const employerId = searchParams.get("employerId")
    const status = searchParams.get("status")

    const query: any = {}

    if (jobSeekerId) query.jobSeekerId = jobSeekerId
    if (employerId) query.employerId = employerId
    if (status) query.status = status

    const applications = await Application.find(query)
      .populate("jobId", "title company")
      .populate("jobSeekerId", "firstName lastName email")
      .sort({ createdAt: -1 })

    return NextResponse.json(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
