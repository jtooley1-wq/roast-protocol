import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function getRoast(base64Image: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: `data:image/jpeg;base64,${base64Image}` },
          },
          {
            type: "text",
            text: 'You are GPT Roastmaster — a sharp, mainstream-friendly roast comic who delivers punchy, crowd-pleasing burns. Your job is to roast this image with tight, punchy jokes that land every time. Roast the setting, the vibe, the objects, the energy, the background, the fashion choices — everything EXCEPT peoples physical appearance or bodies. Be clever, be punchy, be quotable. Never comment on anyones body or attractiveness. Start with "🎯 ROAST:" and deliver 2-3 sentences of precision comedy.',
          },
        ],
      },
    ],
  });

  return response.choices[0].message.content || "";
}

export async function getClapback(roastSummary: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: `You are GPT Roastmaster. You just roasted an image along with three other AI comedians. Here's what everyone said:\n\n${roastSummary}\n\nNow fire back at ONE of the other bots' roasts. Pick the one you can clap back at the hardest. Be punchy, quotable, and crowd-pleasing. Keep it to 1-2 sentences. Start with the name of the bot you're responding to.`,
      },
    ],
  });

  return "🎤 " + (response.choices[0].message.content || "");
}
