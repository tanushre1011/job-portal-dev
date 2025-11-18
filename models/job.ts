import mongoose, { Schema, model, models } from "mongoose"

interface IJob {
  title: string
  company: string
  location: string
  jobType: string
  salary: {
    min: number
    max: number
    currency: string
  }
  skills: string[]
  description: string
  employerId?: mongoose.Types.ObjectId
  createdAt?: Date
  updatedAt?: Date
}

const jobSchema = new Schema<IJob>(
  {
    title: { type: String, required: true },
    company: { type: String, required: true },
    location: { type: String, required: true },
    jobType: { type: String, required: true }, // full-time, part-time, internship, contract
    salary: {
      min: { type: Number, required: true },
      max: { type: Number, required: true },
      currency: { type: String, default: "INR" },
    },
    skills: { type: [String], default: [] },
    description: { type: String },
    employerId: { type: Schema.Types.ObjectId, ref: "User" }, // optional if linked to user
  },
  { timestamps: true }
)

// Prevent recompiling the model if it already exists
const Job = models.Job || model<IJob>("Job", jobSchema)
export default Job
