import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { skills } = await req.json()

    if (!skills || skills.length === 0) {
      return NextResponse.json({ jobs: [] })
    }

    const query = skills.join(" ")

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

    const data = await apiResponse.json()

    return NextResponse.json({
      jobs: data.data || [],
    })
  } catch (error) {
    console.error("Recommendation Error:", error)
    return NextResponse.json({ error: "Failed to fetch jobs" }, { status: 500 })
  }
}
