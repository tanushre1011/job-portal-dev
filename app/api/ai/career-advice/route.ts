import { connectDB } from "@/lib/mongodb";
import { User } from "@/lib/models/User";
import { verifyToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.split(" ")[1];
    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const tokenPayload = verifyToken(token);
    if (!tokenPayload)
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });

    await connectDB();
    const user = await User.findById(tokenPayload.userId);
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { searchParams } = new URL(request.url);
    const topic = searchParams.get("topic") || "career advice";

    const prompt = `
You are an AI career coach. Provide personalized advice for this job seeker.

Name: ${user.firstName} ${user.lastName}
Skills: ${user.skills?.join(", ") || "Not specified"}
Experience: ${user.experience || 0} years
Education: ${
      user.resume?.parsedData?.education?.join(", ") || "Not specified"
    }
Location: ${user.location || "Not specified"}

Topic: ${topic}

Please include:
- Career growth strategies
- Skill improvement recommendations
- Job market insights
- Networking suggestions
- Useful resources
    `;

    // ✅ OpenRouter API call
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "Job Portal AI Advisor",
      },
      body: JSON.stringify({
        model: "meta-llama/llama-3-8b-instruct", // ✅ Free and fast model
        messages: [
          { role: "system", content: "You are a professional career mentor." },
          { role: "user", content: prompt },
        ],
      }),
    });

    const data = await response.json();
    console.log("OpenRouter Response:", JSON.stringify(data, null, 2));

    const advice =
      data?.choices?.[0]?.message?.content ||
      "AI could not generate advice. Please try again.";

    return NextResponse.json({ advice });
  } catch (error: any) {
    console.error("Career advice error:", error);
    return NextResponse.json(
      { error: "Failed to generate career advice", details: error.message },
      { status: 500 }
    );
  }
}
