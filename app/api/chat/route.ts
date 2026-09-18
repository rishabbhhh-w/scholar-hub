import { NextRequest, NextResponse } from "next/server";

interface IncomingMessage {
  role: string;
  content: string;
}

interface UserProfileContext {
  category?: string;
  state?: string;
  fullName?: string;
  institution?: string;
}

function buildGeminiContents(messages: IncomingMessage[]) {
  const contents: { role: "user" | "model"; parts: { text: string }[] }[] = [];

  for (const m of messages) {
    const geminiRole =
      m.role === "assistant" || m.role === "scholarAi" || m.role === "model" ? "model" : "user";

    if (contents.length > 0 && contents[contents.length - 1].role === geminiRole) {
      contents[contents.length - 1].parts[0].text += `\n\n${m.content}`;
    } else {
      contents.push({
        role: geminiRole,
        parts: [{ text: m.content || "" }],
      });
    }
  }

  // Gemini contents must start with a user message
  while (contents.length > 0 && contents[0].role !== "user") {
    contents.shift();
  }

  return contents;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, userProfile }: { messages: IncomingMessage[]; userProfile?: UserProfileContext } =
      await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY environment variable is not configured." },
        { status: 500 }
      );
    }

    const baseSystemPrompt =
      "You are Scholar AI, an intelligent scholarship advisor for Indian students. Help students find scholarships, check eligibility, and navigate government scholarship applications like NSP, PFMS, UGC fellowships, and state schemes for ST/SC/OBC/Minority students. Be helpful, clear, and respond in simple English or Hinglish if the user prefers.";

    const contextText = userProfile
      ? `\n\nUser Profile Context:\nCategory: ${userProfile.category || "Not specified"}\nState: ${
          userProfile.state || "Not specified"
        }\nFull Name: ${userProfile.fullName || "Student"}\nInstitution: ${userProfile.institution || "Not specified"}`
      : "";

    const systemInstruction = `${baseSystemPrompt}${contextText}`;

    const geminiContents = buildGeminiContents(messages || []);

    if (geminiContents.length === 0) {
      return NextResponse.json({ error: "No valid user messages provided." }, { status: 400 });
    }

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents: geminiContents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API Error:", errorData);
      return NextResponse.json(
        {
          error:
            errorData.error?.message ||
            `Gemini API request failed with status ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I am Scholar AI. I couldn't process a text response for your query, please try asking again.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chat API Exception:", error);
    return NextResponse.json(
      { error: error?.message || "An unexpected error occurred while processing your request." },
      { status: 500 }
    );
  }
}
