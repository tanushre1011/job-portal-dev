import { connectDB } from "@/lib/mongodb"
import { User } from "@/lib/models/User"
import { parseResumeText } from "@/lib/resume-parser"
import { verifyToken } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
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

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!file.type.includes("pdf") && !file.type.includes("text")) {
      return NextResponse.json(
        { error: "Only PDF and text files are supported" },
        { status: 400 }
      )
    }

    // Store resume inline for now
    const fileBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(fileBuffer).toString("base64")
    const resumeUrl = `data:${file.type};base64,${base64}`

    // Extract text
    let resumeText = ""

    if (file.type.includes("text")) {
      resumeText = await file.text()
    } else if (file.type.includes("pdf")) {
      resumeText = file.name // TEMP fallback
    }

    const parsedResume = await parseResumeText(resumeText)

    // Get existing user (important!)
    const existingUser = await User.findById(tokenPayload.userId)

    if (!existingUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Merge skills without duplicates
    const updatedSkills = Array.from(
      new Set([...(existingUser.skills || []), ...(parsedResume.skills || [])])
    )

    // Overwrite only experience extracted from resume (optional)
    const updatedExperience =
      parsedResume.experience?.length > 0
        ? parsedResume.experience
        : existingUser.experience

    // Update only specific fields
    existingUser.resume = {
      url: resumeUrl,
      uploadedAt: new Date(),
      parsedData: parsedResume,
    }

    existingUser.skills = updatedSkills
    existingUser.experience = updatedExperience

    await existingUser.save()

    return NextResponse.json({
      message: "Resume uploaded successfully",
      resume: existingUser.resume,
      parsedData: parsedResume,
      skills: existingUser.skills,
      experience: existingUser.experience,
    })
  } catch (error) {
    console.error("Resume upload error:", error)
    return NextResponse.json({ error: "Failed to upload resume" }, { status: 500 })
  }
}
