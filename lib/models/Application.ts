import mongoose, { Schema, type Document } from "mongoose"

export interface IApplication extends Document {
  jobId: mongoose.Types.ObjectId
  jobSeekerId: mongoose.Types.ObjectId
  employerId: mongoose.Types.ObjectId
  resumeUrl: string
  coverLetter: string
  status: "pending" | "reviewed" | "shortlisted" | "rejected" | "accepted"
  matchScore: number
  appliedAt: Date
  updatedAt: Date
}

const applicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job", required: true },
    jobSeekerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    employerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    resumeUrl: { type: String, required: true },
    coverLetter: String,
    status: {
      type: String,
      enum: ["pending", "reviewed", "shortlisted", "rejected", "accepted"],
      default: "pending",
    },
    matchScore: { type: Number, default: 0 },
  },
  { timestamps: true },
)

export const Application = mongoose.models.Application || mongoose.model("Application", applicationSchema)
