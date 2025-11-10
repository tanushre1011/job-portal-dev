import { connectDB } from "@/lib/mongodb"
import { Job } from "@/lib/models/Job"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)

    // Search filters
    const search = searchParams.get("search") || ""
    const location = searchParams.get("location") || ""
    const skills = searchParams.get("skills")?.split(",").filter(Boolean) || []
    const jobType = searchParams.get("jobType") || ""
    const minSalary = searchParams.get("minSalary") ? Number.parseInt(searchParams.get("minSalary")!) : null
    const maxSalary = searchParams.get("maxSalary") ? Number.parseInt(searchParams.get("maxSalary")!) : null
    const experience = searchParams.get("experience") || ""
    const company = searchParams.get("company") || ""
    const sortBy = searchParams.get("sortBy") || "newest" // newest, salary, relevance
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(50, Number.parseInt(searchParams.get("limit") || "10"))

    const query: any = { status: "active" }

    // Text search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { company: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ]
    }

    // Location filter
    if (location) {
      query.location = { $regex: location, $options: "i" }
    }

    // Skills filter - job must require at least one of the selected skills
    if (skills.length > 0) {
      query.skills = { $in: skills }
    }

    // Job type filter
    if (jobType) {
      query.jobType = jobType
    }

    // Salary range filter
    if (minSalary || maxSalary) {
      query.$or = [
        {
          $and: [
            { "salary.min": { ...(minSalary ? { $gte: minSalary } : {}) } },
            { "salary.max": { ...(maxSalary ? { $lte: maxSalary } : {}) } },
          ],
        },
        {
          $and: [
            { "salary.min": { ...(maxSalary ? { $lte: maxSalary } : {}) } },
            { "salary.max": { ...(minSalary ? { $gte: minSalary } : {}) } },
          ],
        },
      ]
    }

    // Experience level filter
    if (experience) {
      query.experienceLevel = experience
    }

    // Company filter
    if (company) {
      query.company = { $regex: company, $options: "i" }
    }

    // Sorting
    let sortOption: any = { createdAt: -1 }
    if (sortBy === "salary") {
      sortOption = { "salary.max": -1 }
    } else if (sortBy === "relevance") {
      sortOption = { viewCount: -1, applicantCount: -1 }
    }

    const total = await Job.countDocuments(query)
    const jobs = await Job.find(query)
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("employerId", "firstName lastName company profileImage")
      .lean()

    return NextResponse.json({
      jobs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      filters: {
        search,
        location,
        skills,
        jobType,
        minSalary,
        maxSalary,
        experience,
        company,
        sortBy,
      },
    })
  } catch (error) {
    console.error("Error in advanced search:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
