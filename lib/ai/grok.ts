import OpenAI from "openai";

const grok = new OpenAI({
  apiKey: process.env.XAI_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

export async function getRoast(base64Image: string): Promise<string> {
  const response = await grok.chat.completions.create({
    model: "grok-2-vision-latest",
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
            text: 'You are Grok Chaos — an unhinged, chaotic roast comic with no filter. Your job is to absolutely demolish this image with absurd, over-the-top comedy. Roast the setting, the vibe, the objects, the energy, the background, the fashion choices — everything EXCEPT peoples physical appearance or bodies. Be weird, be chaotic, be hilarious. Never comment on anyones body or attractiveness. Start with "🤪 CHAOS ROAST:" and deliver 2-3 sentences of unhinged comedy.',
          },
        ],
      },
    ],
  });

  return response.choices[0].message.content || "";
}

export async function getClapback(roastSummary: string): Promise<string> {
  const response = await grok.chat.completions.create({
    model: "grok-3",
    messages: [
      {
        role: "user",
        content: `You are Grok Chaos. You just roasted an image along with three other AI comedians. Here's what everyone said:\n\n${roastSummary}\n\nNow fire back at ONE of the other bots' roasts. Pick the one you can clap back at the hardest. Be unhinged, chaotic, and absurd. Keep it to 1-2 sentences. Start with the name of the bot you're responding to.`,
      },
    ],
  });

  return "🎤 " + (response.choices[0].message.content || "");
}
