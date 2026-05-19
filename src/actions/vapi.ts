"use server";

import { onAuthenticateUser } from "./auth";
import {
  normalizeAssistantList,
  type VapiAssistantPayload,
  type VapiAssistantSummary,
} from "@/lib/vapi-types";

const VAPI_API_URL = "https://api.vapi.ai";
const headers = {
  Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
  "Content-Type": "application/json",
};

export async function getVapiAssistants() {
  try {
    const user = await onAuthenticateUser();
    if (!user.user) return { success: false, error: "Unauthorized" };

    const res = await fetch(`${VAPI_API_URL}/assistant`, {
      headers,
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error("VAPI API Error:", await res.text());
      return { success: false, error: "Failed to fetch assistants" };
    }

    const raw = await res.json();
    const assistants = normalizeAssistantList(raw);
    return { success: true, assistants };
  } catch (error) {
    console.error("Error fetching Vapi assistants", error);
    return { success: false, error: "Internal Error" };
  }
}

export async function getVapiAssistantById(id: string) {
  try {
    const user = await onAuthenticateUser();
    if (!user.user) return { success: false, error: "Unauthorized" };

    const res = await fetch(`${VAPI_API_URL}/assistant/${id}`, {
      headers,
      next: { revalidate: 0 },
    });

    if (!res.ok) {
      console.error("VAPI API Error:", await res.text());
      return { success: false, error: "Failed to fetch assistant" };
    }

    const assistant = (await res.json()) as VapiAssistantSummary;
    return { success: true, assistant };
  } catch (error) {
    console.error("Error fetching Vapi assistant", error);
    return { success: false, error: "Internal Error" };
  }
}

export async function createVapiAssistant(data: VapiAssistantPayload) {
  try {
    const user = await onAuthenticateUser();
    if (!user.user) return { success: false, error: "Unauthorized" };

    const payload = {
      name: data.name,
      firstMessage: data.firstMessage,
      model: {
        provider: data.provider,
        model: data.model,
        messages: [
          {
            role: "system",
            content: data.systemPrompt,
          },
        ],
      },
      voice: {
        provider: "vapi",
        voiceId: "Elliot",  // Built-in Vapi voice, no extra API key needed
      },
    };

    const res = await fetch(`${VAPI_API_URL}/assistant`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("VAPI API Error:", await res.text());
      return { success: false, error: "Failed to create assistant" };
    }

    return { success: true, assistant: (await res.json()) as VapiAssistantSummary };
  } catch (error) {
    console.error("Error creating Vapi assistant", error);
    return { success: false, error: "Internal Error" };
  }
}

export async function updateVapiAssistant(id: string, data: VapiAssistantPayload) {
  try {
    const user = await onAuthenticateUser();
    if (!user.user) return { success: false, error: "Unauthorized" };

    const payload = {
      name: data.name,
      firstMessage: data.firstMessage,
      model: {
        provider: data.provider,
        model: data.model,
        messages: [
          {
            role: "system",
            content: data.systemPrompt,
          },
        ],
      },
      // Ensure voice is always set to Vapi built-in (no extra API key needed)
      voice: {
        provider: "vapi",
        voiceId: "Elliot",
      },
    };

    const res = await fetch(`${VAPI_API_URL}/assistant/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("VAPI API Error:", await res.text());
      return { success: false, error: "Failed to update assistant" };
    }

    return { success: true, assistant: (await res.json()) as VapiAssistantSummary };
  } catch (error) {
    console.error("Error updating Vapi assistant", error);
    return { success: false, error: "Internal Error" };
  }
}
