import { connectDB } from "@/lib/mongodb"
import { Job } from "@/lib/models/Job"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const location = searchParams.get("location") || ""
    const skills = searchParams.get("skills")?.split(",") || []
    const jobType = searchParams.get("jobType") || ""
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    const query: any = { status: "active" }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    if (location) {
      query.location = { $regex: location, $options: "i" }
    }

    if (skills.length > 0) {
      query.skills = { $in: skills }
    }

    if (jobType) {
      query.jobType = jobType
    }

    const total = await Job.countDocuments(query)
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("employerId", "firstName lastName company")

    return NextResponse.json({
      jobs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    })
  } catch (error) {
    console.error("Error fetching jobs:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB()

    const data = await request.json()
    const token = request.headers.get("authorization")?.split(" ")[1]

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const job = new Job({
      ...data,
      employerId: data.employerId,
    })

    await job.save()

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error("Error creating job:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
