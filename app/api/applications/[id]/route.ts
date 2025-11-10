import { connectDB } from "@/lib/mongodb"
import { Application } from "@/lib/models/Application"
import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { status } = await request.json()

    const application = await Application.findByIdAndUpdate(params.id, { status }, { new: true })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    return NextResponse.json(application)
  } catch (error) {
    console.error("Error updating application:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
