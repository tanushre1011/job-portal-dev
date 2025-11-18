import { NextResponse } from "next/server"
import { connectDB } from "@/lib/mongodb"
import Job from "@/models/job"

// Static demo jobs
const demoJobs = [
  { _id: "1", title: "Frontend Developer", company: "TechCorp", location: "Bangalore", jobType: "full-time", salary: { min: 50000, max: 80000, currency: "INR" }, skills: ["React", "Next.js", "TypeScript"], description: "Build modern web apps" },
  { _id: "2", title: "Backend Developer", company: "DataSolutions", location: "Mumbai", jobType: "full-time", salary: { min: 60000, max: 90000, currency: "INR" }, skills: ["Node.js", "Express", "MongoDB"], description: "Develop scalable backend APIs" },
  { _id: "3", title: "UI/UX Designer", company: "DesignPro", location: "Remote", jobType: "contract", salary: { min: 40000, max: 70000, currency: "INR" }, skills: ["Figma", "Adobe XD", "Prototyping"], description: "Create user-friendly UI/UX designs" },
  { _id: "4", title: "Full Stack Developer", company: "InnovateTech", location: "Bangalore", jobType: "full-time", salary: { min: 55000, max: 90000, currency: "INR" }, skills: ["React", "Node.js", "MongoDB"], description: "Work on frontend and backend systems" },
  { _id: "5", title: "Data Scientist", company: "AI Labs", location: "Hyderabad", jobType: "full-time", salary: { min: 70000, max: 120000, currency: "INR" }, skills: ["Python", "Machine Learning", "TensorFlow"], description: "Analyze data and build predictive models" },
]

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB()

    // Try to find job in MongoDB
    const job = await Job.findById(params.id).populate(
      "employerId",
      "firstName lastName company profileImage"
    )

    if (job) {
      return NextResponse.json({ job })
    }

    // Fallback to static demo jobs
    const demoJob = demoJobs.find((j) => j._id === params.id)
    if (demoJob) {
      return NextResponse.json({ job: demoJob })
    }

    return NextResponse.json({ message: "Job not found" }, { status: 404 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}
