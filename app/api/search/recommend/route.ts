import { NextRequest, NextResponse } from "next/server"
import { User } from "@/lib/models/User"
import { verifyToken } from "@/lib/auth"
import { connectDB } from "@/lib/mongodb"

// Utility: pick 1..all random skills from array
function getRandomSkills(skills: string[]): string[] {
  const shuffled = skills.sort(() => 0.5 - Math.random()) // shuffle
  const count = Math.floor(Math.random() * skills.length) + 1 // 1..length
  return shuffled.slice(0, count)
}

export async function GET(req: NextRequest) {
  try {
    await connectDB()

    // Verify user token
    const token = req.headers.get("authorization")?.split(" ")[1]
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

    const payload = verifyToken(token)
    if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    // Fetch user
    const user = await User.findById(payload.userId)
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })
    if (!user.skills || user.skills.length === 0) return NextResponse.json({ recommendations: [] })

    // Build query for RapidAPI
    const query = user.skills.join(" OR ")

    const apiResponse = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&num_pages=1`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!,
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      }
    )

    if (!apiResponse.ok) {
      console.error("RapidAPI error:", await apiResponse.text())
      return NextResponse.json({ recommendations: [] }, { status: 500 })
    }

    const data = await apiResponse.json()

    const jobs = (data.data || []).map((job: any) => {
      // Combine all text fields for better matching
      const text = `
        ${job.job_title || ""}
        ${job.job_description || ""}
        ${(job.job_highlights?.Qualifications || []).join(" ")}
      `.toLowerCase()

      // Calculate weighted match score
      let score = 0
      user.skills.forEach((skill: string) => {
        const s = skill.toLowerCase()
        if ((job.job_title || "").toLowerCase().includes(s)) score += 40
        if ((job.job_description || "").toLowerCase().includes(s)) score += 30
        if ((job.job_highlights?.Qualifications || []).join(" ").toLowerCase().includes(s)) score += 30
      })

      // Cap at 100 + small random variation ±5%
      let matchScore = Math.min(score, 100)
      const variation = Math.floor(Math.random() * 11) - 5 // -5 to +5
      matchScore = Math.max(Math.min(matchScore + variation, 100), 0)

      // Pick random subset of matched skills
      const allMatchedSkills = user.skills.filter(skill => text.includes(skill.toLowerCase()))
      const matchedSkills = getRandomSkills(allMatchedSkills)

      return {
        _id: job.job_id,
        title: job.job_title,
        company: job.employer_name,
        location: `${job.job_city || ""}, ${job.job_country || ""}`,
        skills: matchedSkills,
        job_apply_link: job.job_apply_link,
        matchScore,
      }
    })

    // Sort jobs by matchScore descending
    const sortedJobs = jobs.sort((a, b) => b.matchScore - a.matchScore)

    return NextResponse.json({
      recommendations: sortedJobs,
    })
  } catch (err) {
    console.error("Error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
} // <-- closing GET function
