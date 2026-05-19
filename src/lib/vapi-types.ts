export type VapiAssistantPayload = {
  name: string;
  firstMessage: string;
  systemPrompt: string;
  provider: string;
  model: string;
};

export type VapiAssistantSummary = {
  id: string;
  name?: string;
  firstMessage?: string;
  model?: {
    provider?: string;
    model?: string;
    messages?: { role: string; content?: string }[];
  };
};

export function normalizeAssistantList(
  payload: unknown,
): VapiAssistantSummary[] {
  if (Array.isArray(payload)) {
    return payload as VapiAssistantSummary[];
  }
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data as VapiAssistantSummary[];
    if (Array.isArray(o.results)) return o.results as VapiAssistantSummary[];
    if (Array.isArray(o.assistants)) return o.assistants as VapiAssistantSummary[];
  }
  return [];
}

export function getSystemPromptFromAssistant(
  assistant: VapiAssistantSummary,
): string {
  const messages = assistant.model?.messages;
  const sys = messages?.find((m) => m.role === "system");
  return typeof sys?.content === "string" ? sys.content : "";
}
