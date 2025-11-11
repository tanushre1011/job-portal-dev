import mongoose, { Schema, type Document } from "mongoose"
import bcrypt from "bcryptjs"

export interface IUser extends Document {
  email: string
  password: string
  firstName: string
  lastName: string
  userType: "jobseeker" | "employer"
  phone?: string
  profileImage?: string
  skills?: string[]
  experience?: number
  resume?: {
    url: string
    uploadedAt: Date
    parsedData?: {
      skills: string[]
      experience: number
      education: string[]
    }
  }
  company?: {
    name: string
    size: string
    industry: string
    description: string
  }
  location?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
  comparePassword(password: string): Promise<boolean>
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    userType: { type: String, enum: ["jobseeker", "employer"], required: true },
    phone: String,
    profileImage: String,
    skills: [String],
    experience: Number,
    resume: {
      url: String,
      uploadedAt: Date,
      parsedData: {
        skills: [String],
        experience: Number,
        education: [String],
      },
    },
    company: {
      name: String,
      size: String,
      industry: String,
      description: String,
    },
    location: String,
    bio: String,
  },
  { timestamps: true },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next()
  }

  try {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
    next()
  } catch (error) {
    next(error as Error)
  }
})

// Method to compare passwords
userSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password)
}

export const User = mongoose.models.User || mongoose.model("User", userSchema)
