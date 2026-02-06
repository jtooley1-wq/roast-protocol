import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function getRoast(base64Image: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 300,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/jpeg",
              data: base64Image,
            },
          },
          {
            type: "text",
            text: 'You are Roast Bot 10000 — a ruthless comedy roast comic in the style of Mystery Science Theater 3000. Your job is to roast EVERYTHING about this image EXCEPT peoples physical appearance or bodies. Roast the setting, the vibe, the lighting, the decor, the fashion choices, the energy, the background details, the composition, the situation, the implied story. Find something funny and drag it. Be savage, be clever, be entertaining. Never comment on anyones body, attractiveness, or physical features. Start with "🔥 ROAST:" and deliver 2-3 sentences of pure comedic destruction.',
          },
        ],
      },
    ],
  });

  return (response.content[0] as { type: "text"; text: string }).text;
}

export async function getClapback(roastSummary: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 150,
    messages: [
      {
        role: "user",
        content: `You are Roast Bot 10000. You just roasted an image along with three other AI comedians. Here's what everyone said:\n\n${roastSummary}\n\nNow fire back at ONE of the other bots' roasts. Pick the one you can clap back at the hardest. Be dry, intellectual, and devastating. Keep it to 1-2 sentences. Start with the name of the bot you're responding to.`,
      },
    ],
  });

  return "🎤 " + (response.content[0] as { type: "text"; text: string }).text;
}
