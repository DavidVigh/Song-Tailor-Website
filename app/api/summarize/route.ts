import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: "Key missing" }, { status: 500 });

    const { description } = await req.json();
    if (!description) return NextResponse.json({ summary: "No description given." });

    // 🟢 DIRECT HTTP CALL: No SDK, no hidden versioning bugs
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `Lazább hangvételben foglald össze félmondatokban az alábbi leírást úgy, hogy egy 3 soros kicsi helyen kiférjen, valamint nem kell beleírnod a szokásos nyitószövegedet: ${description}` }] }],
        }),
      }
    );

    const data = await response.json();
    
    // If Google returns an error (invalid key, region, etc.), it will be here
    if (data.error) {
      console.error("❌ Google API Error:", data.error.message);

      if (data.error.code === 404) {
        const modelsResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`
        );
        const modelsData = await modelsResponse.json();

        const modelHints = Array.isArray(modelsData.models)
          ? modelsData.models.map((model: { name?: string; supportedGenerationMethods?: string[] }) => ({
              name: model.name,
              supportedGenerationMethods: model.supportedGenerationMethods,
            }))
          : undefined;

        return NextResponse.json(
          {
            error: data.error.message,
            availableModels: modelHints,
          },
          { status: 404 }
        );
      }

      return NextResponse.json({ error: data.error.message }, { status: data.error.code || 500 });
    }

    const summaryText = data.candidates[0].content.parts[0].text;
    return NextResponse.json({ summary: summaryText });
  } catch (error: any) {
    console.error("❌ Server Crash:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}