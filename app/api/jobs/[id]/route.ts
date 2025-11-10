import { connectDB } from "@/lib/mongodb"
import { Job } from "@/lib/models/Job"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const job = await Job.findByIdAndUpdate(params.id, { $inc: { viewCount: 1 } }, { new: true }).populate(
      "employerId",
      "firstName lastName company profileImage",
    )

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error("Error fetching job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const data = await request.json()

    const job = await Job.findByIdAndUpdate(params.id, data, {
      new: true,
      runValidators: true,
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error("Error updating job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
