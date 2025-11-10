import mongoose, { Schema, type Document } from "mongoose"

export interface IJob extends Document {
  title: string
  description: string
  company: string
  employerId: mongoose.Types.ObjectId
  location: string
  salary: {
    min: number
    max: number
    currency: string
  }
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship"
  skills: string[]
  experienceLevel: "Entry" | "Mid" | "Senior"
  requiredExperience: number
  benefits: string[]
  applicationDeadline: Date
  status: "active" | "closed" | "draft"
  applicantCount: number
  viewCount: number
  createdAt: Date
  updatedAt: Date
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: String, required: true },
    employerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    location: { type: String, required: true },
    salary: {
      min: Number,
      max: Number,
      currency: { type: String, default: "USD" },
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship"],
      required: true,
    },
    skills: [String],
    experienceLevel: {
      type: String,
      enum: ["Entry", "Mid", "Senior"],
      required: true,
    },
    requiredExperience: { type: Number, default: 0 },
    benefits: [String],
    applicationDeadline: Date,
    status: { type: String, enum: ["active", "closed", "draft"], default: "active" },
    applicantCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const Job = mongoose.models.Job || mongoose.model("Job", jobSchema)
