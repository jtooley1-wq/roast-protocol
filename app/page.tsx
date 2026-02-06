"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

type AgentId = "claude" | "grok" | "gemini" | "gpt";

interface Roast {
  agent: AgentId;
  name: string;
  body: string;
  isClapback?: boolean;
}

interface AgentStatus {
  status: "waiting" | "active" | "complete" | "error";
  text: string;
}

const agentConfig: Record<AgentId, { name: string; icon: string; color: string }> = {
  claude: { name: "Claude (Anthropic)", icon: "🤖", color: "text-orange-500 border-orange-500" },
  grok: { name: "Grok (xAI)", icon: "🤪", color: "text-green-500 border-green-500" },
  gemini: { name: "Gemini (Google)", icon: "💎", color: "text-purple-500 border-purple-500" },
  gpt: { name: "GPT (OpenAI)", icon: "🎯", color: "text-blue-500 border-blue-500" },
};

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [roasts, setRoasts] = useState<Roast[]>([]);
  const [agentStatuses, setAgentStatuses] = useState<Record<AgentId, AgentStatus>>({
    claude: { status: "waiting", text: "Waiting..." },
    grok: { status: "waiting", text: "Waiting..." },
    gemini: { status: "waiting", text: "Waiting..." },
    gpt: { status: "waiting", text: "Waiting..." },
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(selectedFile);
    }
  };

  const resetAgentStatuses = () => {
    setAgentStatuses({
      claude: { status: "waiting", text: "Waiting..." },
      grok: { status: "waiting", text: "Waiting..." },
      gemini: { status: "waiting", text: "Waiting..." },
      gpt: { status: "waiting", text: "Waiting..." },
    });
  };

  const updateAgentStatus = (agent: AgentId, status: AgentStatus["status"], text: string) => {
    setAgentStatuses((prev) => ({
      ...prev,
      [agent]: { status, text },
    }));
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsProcessing(true);
    setRoasts([]);
    resetAgentStatuses();

    const formData = new FormData();
    formData.append("image", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) return;

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() || "";

        for (const part of parts) {
          const lines = part.split("\n");
          let event = "";
          let data = "";

          for (const line of lines) {
            if (line.startsWith("event: ")) event = line.slice(7);
            if (line.startsWith("data: ")) data = line.slice(6);
          }

          if (event && data) {
            const d = JSON.parse(data);

            switch (event) {
              case "agent-start":
                updateAgentStatus(d.agent, "active", "Analyzing...");
                break;
              case "roast":
                updateAgentStatus(d.agent, "complete", d.body.substring(0, 60) + "...");
                setRoasts((prev) => [...prev, { agent: d.agent, name: d.name, body: d.body }]);
                break;
              case "clapback-start":
                updateAgentStatus(d.agent, "active", "Crafting clapback...");
                break;
              case "clapback":
                updateAgentStatus(d.agent, "complete", d.body.substring(0, 60) + "...");
                setRoasts((prev) => [...prev, { agent: d.agent, name: d.name, body: d.body, isClapback: true }]);
                break;
              case "agent-error":
                updateAgentStatus(d.agent, "error", `Error: ${d.error}`);
                break;
            }
          }
        }
      }
    } catch (err) {
      console.error("Upload failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const initialRoasts = roasts.filter((r) => !r.isClapback);
  const clapbacks = roasts.filter((r) => r.isClapback);

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-8 pb-8 border-b border-gray-800">
          <h1 className="text-4xl font-bold font-mono mb-2">
            ROAST<span className="text-indigo-500">PROTOCOL</span>
          </h1>
          <p className="text-gray-500">Four AI agents. One image. Maximum carnage.</p>

          <div className="flex justify-center gap-3 mt-6 flex-wrap">
            {(Object.entries(agentConfig) as [AgentId, typeof agentConfig.claude][]).map(
              ([id, agent]) => (
                <Badge
                  key={id}
                  variant="outline"
                  className={`${agent.color} bg-transparent ${
                    agentStatuses[id].status === "active" ? "animate-pulse" : ""
                  }`}
                >
                  <span className="mr-1">{agent.icon}</span>
                  {agent.name.split(" ")[0]}
                </Badge>
              )
            )}
          </div>
        </header>

        {/* Upload Section */}
        <Card className="bg-[#1a1a24] border-gray-800 p-6 mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Submit for Roasting
          </h2>

          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
              file
                ? "border-indigo-500 bg-indigo-500/10"
                : "border-gray-700 hover:border-indigo-500 hover:bg-indigo-500/5"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            {preview ? (
              <img
                src={preview}
                alt="Preview"
                className="max-h-64 mx-auto rounded-lg"
              />
            ) : (
              <>
                <div className="text-4xl mb-3">📸</div>
                <p className="text-gray-500">
                  <span className="text-indigo-500 font-semibold">Click to upload</span> or
                  drag and drop
                </p>
              </>
            )}
            {file && <p className="text-indigo-400 mt-2 font-medium">{file.name}</p>}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || isProcessing}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-6 text-lg"
          >
            {isProcessing ? "🔄 Agents analyzing..." : "🔥 Initiate Roast Protocol"}
          </Button>
        </Card>

        {/* Processing Panel */}
        {isProcessing && (
          <Card className="bg-[#1a1a24] border-gray-800 p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-5 border-2 border-gray-700 border-t-indigo-500 rounded-full animate-spin" />
              <h3 className="font-semibold">Agents Analyzing...</h3>
            </div>

            <div className="space-y-3">
              {(Object.entries(agentConfig) as [AgentId, typeof agentConfig.claude][]).map(
                ([id, agent]) => (
                  <div
                    key={id}
                    className={`flex items-start gap-3 p-3 rounded-lg bg-[#12121a] border-l-2 transition-all ${
                      agentStatuses[id].status === "active"
                        ? "border-indigo-500 opacity-100"
                        : agentStatuses[id].status === "complete"
                        ? agent.color.split(" ")[1]
                        : "border-gray-700 opacity-50"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        agent.color.split(" ")[1]
                      } ${agentStatuses[id].status === "active" ? "animate-pulse" : ""}`}
                    >
                      {agent.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`font-semibold text-sm ${agent.color.split(" ")[0]}`}>
                        {agent.name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        {agentStatuses[id].text}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </Card>
        )}

        {/* Roasts Display */}
        {initialRoasts.length > 0 && (
          <Card className="bg-[#1a1a24] border-gray-800 overflow-hidden">
            {preview && (
              <img src={preview} alt="Roasted" className="w-full object-contain bg-[#12121a]" />
            )}

            <div className="p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
                Agent Roasts
                <span className="flex-1 h-px bg-gray-800" />
              </h3>

              <div className="space-y-4">
                {initialRoasts.map((roast, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg bg-[#12121a] border-l-2 ${
                      agentConfig[roast.agent].color.split(" ")[1]
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`font-semibold ${agentConfig[roast.agent].color.split(" ")[0]}`}>
                        {agentConfig[roast.agent].name}
                      </span>
                      <Badge variant="outline" className="text-xs text-gray-500 border-gray-700">
                        Initial
                      </Badge>
                    </div>
                    <p className="text-gray-200 leading-relaxed">{roast.body}</p>
                  </div>
                ))}
              </div>

              {clapbacks.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide my-6 flex items-center gap-2">
                    Clapbacks
                    <span className="flex-1 h-px bg-gray-800" />
                  </h3>

                  <div className="space-y-4 ml-6">
                    {clapbacks.map((roast, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-lg bg-[#0a0a0f] border-l-2 ${
                          agentConfig[roast.agent].color.split(" ")[1]
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`font-semibold ${agentConfig[roast.agent].color.split(" ")[0]}`}>
                            {agentConfig[roast.agent].name}
                          </span>
                          <Badge variant="outline" className="text-xs text-gray-500 border-gray-700">
                            Response
                          </Badge>
                        </div>
                        <p className="text-gray-200 leading-relaxed">{roast.body}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
