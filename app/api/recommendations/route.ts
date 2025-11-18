import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { skills } = await req.json()

    // Validate skills
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
      return NextResponse.json({ jobs: [] })
    }

    // Create query string for RapidAPI
    const query = skills.join(" ")

    // Call JSearch API
    const apiResponse = await fetch(
      `https://jsearch.p.rapidapi.com/search?query=${encodeURIComponent(query)}&num_pages=1`,
      {
        method: "GET",
        headers: {
          "X-RapidAPI-Key": process.env.RAPIDAPI_KEY!, // ✅ Make sure your env variable is set
          "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
        },
      }
    )

    if (!apiResponse.ok) {
      console.error("RapidAPI error:", apiResponse.status, await apiResponse.text())
      return NextResponse.json({ jobs: [] }, { status: 500 })
    }

    const data = await apiResponse.json()

    // Map the data to the format JobRecommendations expects
    const jobs = (data.data || []).map((job: any) => ({
      job_id: job.job_id || job.job_id ?? Math.random().toString(36).substring(2, 9),
      employer_name: job.employer_name,
      job_title: job.job_title,
      job_city: job.job_city,
      job_country: job.job_country,
      job_apply_link: job.job_apply_link,
    }))

    return NextResponse.json({ jobs })
  }
