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
      return NextResponse.json({ error: "Only PDF and text files are supported" }, { status: 400 })
    }

    // For now, we'll store the file URL in a simulated storage
    // In production, you'd use Vercel Blob, AWS S3, or similar
    const fileBuffer = await file.arrayBuffer()
    const base64 = Buffer.from(fileBuffer).toString("base64")
    const resumeUrl = `data:${file.type};base64,${base64}`

    // Parse the resume text
    let resumeText = ""

    if (file.type.includes("text")) {
      resumeText = await file.text()
    } else if (file.type.includes("pdf")) {
      // For PDF files, try to extract text (simplified approach)
      resumeText = file.name // Fallback to filename for now
    }

    const parsedResume = await parseResumeText(resumeText)

    // Update user with resume data
    const user = await User.findByIdAndUpdate(
      tokenPayload.userId,
      {
        resume: {
          url: resumeUrl,
          uploadedAt: new Date(),
          parsedData: {
            skills: parsedResume.skills,
            experience: parsedResume.experience,
            education: parsedResume.education,
          },
        },
        skills: parsedResume.skills,
        experience: parsedResume.experience,
      },
      { new: true },
    )

    return NextResponse.json({
      message: "Resume uploaded successfully",
      resume: user?.resume,
      parsedData: parsedResume,
    })
  } catch (error) {
    console.error("Resume upload error:", error)
    return NextResponse.json({ error: "Failed to upload resume" }, { status: 500 })
  }
}
