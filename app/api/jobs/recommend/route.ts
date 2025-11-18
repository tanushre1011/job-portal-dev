// app/api/jobs/recommend/route.ts
import { NextResponse, NextRequest } from "next/server";
import mongoose, { Schema } from "mongoose";

/** Connect to MongoDB (Atlas). Guarded for HMR. */
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI not set in environment");
  await mongoose.connect(uri, { dbName: process.env.MONGO_DB_NAME || undefined });
}

/** Minimal inline schemas (only required fields). */
function ensureModels() {
  if (!mongoose.models?.Job) {
    const JobSchema = new Schema(
      {
        title: String,
        company: String,
        location: String,
        skills: { type: [String], default: [] },
        description: String,
        jobType: String,
        salary: Schema.Types.Mixed,
        postedAt: Date,
        applyCount: Number,
      },
      { collection: "jobs", timestamps: true }
    );
    mongoose.model("Job", JobSchema);
  }

  if (!mongoose.models?.Resume) {
    const ResumeSchema = new Schema(
      {
        originalName: String,
        text: String,
        name: String,
        email: String,
        phone: String,
        skills: { type: [String], default: [] },
        uploadedAt: Date,
      },
      { collection: "resumes", timestamps: true }
    );
    mongoose.model("Resume", ResumeSchema);
  }
}

/** Helper: safely normalise a possible skills value to a lowercase string array */
function normalizeSkillArray(value: any): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((s) => String(s || "").toLowerCase().trim()).filter(Boolean);
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    ensureModels();

    const Job = mongoose.models.Job as mongoose.Model<any>;
    const Resume = mongoose.models.Resume as mongoose.Model<any>;

    const resumeId = req.nextUrl.searchParams.get("resumeId");
    if (!resumeId) return NextResponse.json({ recommendations: [] });

    const resume = await Resume.findById(resumeId).lean() as any;
    if (!resume) return NextResponse.json({ recommendations: [] });

    const userSkills = normalizeSkillArray(resume.skills);

    const jobs = await Job.find().lean();

    const scored = (jobs || [])
      .map((job: any) => {
        const jobSkills = normalizeSkillArray(job.skills);
        const overlap = jobSkills.filter((s: string) => userSkills.includes(s)).length;
        const score = jobSkills.length ? overlap / jobSkills.length : 0;
        return { job, score, overlap };
      })
      .filter((x: any) => x.score > 0)
      .sort((a: any, b: any) => b.score - a.score || b.overlap - a.overlap)
      .map((x: any) => ({ job: x.job, score: Math.round(x.score * 100), overlap: x.overlap }));

    return NextResponse.json({ recommendations: scored });
  } catch (err: any) {
    console.error("recommend error", err);
    return NextResponse.json({ recommendations: [], error: err?.message || String(err) }, { status: 500 });
  }
}
