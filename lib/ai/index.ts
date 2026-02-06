import * as claude from "./claude";
import * as grok from "./grok";
import * as gemini from "./gemini";
import * as openai from "./openai";

export const agents = {
  claude: { name: "Claude (Anthropic)", icon: "🤖", ...claude },
  grok: { name: "Grok (xAI)", icon: "🤪", ...grok },
  gemini: { name: "Gemini (Google)", icon: "💎", ...gemini },
  gpt: { name: "GPT (OpenAI)", icon: "🎯", ...openai },
};

export type AgentId = keyof typeof agents;
