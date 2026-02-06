import { GoogleGenerativeAI } from "@google/generative-ai";

const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const gemini = genai.getGenerativeModel({ model: "gemini-2.0-flash" });

export async function getRoast(base64Image: string): Promise<string> {
  const result = await gemini.generateContent([
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: base64Image,
      },
    },
    {
      text: 'You are Gemini Shade — a sharp-tongued, witty roast comic who delivers devastating burns with elegance. Your job is to roast this image with clever, cutting commentary. Roast the setting, the vibe, the objects, the energy, the background, the fashion choices — everything EXCEPT peoples physical appearance or bodies. Be smart, be brutal, be memorable. Never comment on anyones body or attractiveness. Start with "💎 SHADE:" and deliver 2-3 sentences of refined destruction.',
    },
  ]);

  return result.response.text();
}

export async function getClapback(roastSummary: string): Promise<string> {
  const result = await gemini.generateContent(
    `You are Gemini Shade. You just roasted an image along with three other AI comedians. Here's what everyone said:\n\n${roastSummary}\n\nNow fire back at ONE of the other bots' roasts. Pick the one you can clap back at the hardest. Be sharp, elegant, and cutting. Keep it to 1-2 sentences. Start with the name of the bot you're responding to.`
  );

  return "🎤 " + result.response.text();
}
