import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { verifyToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tokenPayload = verifyToken(token);
    if (!tokenPayload) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(tokenPayload.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const resumeData = user.resume?.parsedData;

    if (!resumeData) {
      return NextResponse.json({ error: "No resume data found" }, { status: 400 });
    }

    const prompt = `
You are an AI career analyst. Analyze this resume data and provide detailed career recommendations.

Candidate Profile:
Skills: ${resumeData.skills?.join(", ") || "Not specified"}
Years of Experience: ${user.experience || "Not specified"}
Education: ${resumeData.education?.join(", ") || "Not specified"}
Certifications: ${resumeData.certifications?.join(", ") || "None"}

Please provide:
1️⃣ Top 3 job roles that match this skill profile  
2️⃣ Skill gaps or improvements needed  
3️⃣ Industries where this profile fits best  
4️⃣ Salary expectations (junior, mid, senior)  
5️⃣ Specific steps for the next career advancement  
6️⃣ A short motivational summary (1 paragraph)

Respond in a structured, professional format.
    `;

    // ✅ Use OpenRouter API (Llama 3 model)
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Job Portal Resume Analyzer",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct", // free + accurate
        messages: [
          { role: "system", content: "You are a professional resume analyst and career mentor." },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();
    console.log("Resume Analysis Response:", JSON.stringify(data, null, 2));

    const analysis =
      data?.choices?.[0]?.message?.content ||
      "AI could not generate analysis. Please try again.";

    return NextResponse.json({
      analysis,
      resumeData,
      userId: user._id,
    });
  } catch (error: any) {
    console.error("AI analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume", details: error.message },
      { status: 500 }
    );
  }
}