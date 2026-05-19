"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createVapiAssistant,
  getVapiAssistantById,
  getVapiAssistants,
  updateVapiAssistant,
} from "@/actions/vapi";
import {
  getSystemPromptFromAssistant,
  type VapiAssistantSummary,
} from "@/lib/vapi-types";
import { cn } from "@/lib/utils";
import { Loader2, Plus, Search, Settings2 } from "lucide-react";
import { toast } from "sonner";

const PROVIDER_MODELS: Record<string, string[]> = {
  google: ["gemini-2.0-flash-001", "gemini-1.5-flash", "gemini-1.5-pro"],
  openai: ["gpt-4o", "gpt-4o-mini", "gpt-4.1"],
  anthropic: ["claude-3-5-sonnet-20241022", "claude-3-5-haiku-20241022"],
};

export default function AiAgentsClient() {
  const [assistants, setAssistants] = useState<VapiAssistantSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const [name, setName] = useState("");
  const [firstMessage, setFirstMessage] = useState("");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [provider, setProvider] = useState("google");
  const [model, setModel] = useState("gemini-2.0-flash-001");

  const [createName, setCreateName] = useState("");
  const [createFirst, setCreateFirst] = useState(
    "Hi there! Thanks for joining. How can I help you today?",
  );
  const [createPrompt, setCreatePrompt] = useState(
    "You are a friendly sales assistant. Qualify the lead and offer to book a follow-up with the team.",
  );
  const [createProvider, setCreateProvider] = useState("google");
  const [createModel, setCreateModel] = useState("gemini-2.0-flash-001");
  const [creating, setCreating] = useState(false);

  const refresh = useCallback(async () => {
    setLoadingList(true);
    const res = await getVapiAssistants();
    if (res.success && res.assistants) {
      setAssistants(res.assistants);
    } else {
      toast.error(res.error || "Could not load assistants");
    }
    setLoadingList(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!selectedId) {
      setName("");
      setFirstMessage("");
      setSystemPrompt("");
      setProvider("google");
      setModel("gemini-2.0-flash-001");
      return;
    }

    let cancelled = false;
    (async () => {
      const res = await getVapiAssistantById(selectedId);
      if (cancelled || !res.success || !res.assistant) return;
      const a = res.assistant;
      setName(a.name || "");
      setFirstMessage(a.firstMessage || "");
      setSystemPrompt(getSystemPromptFromAssistant(a));
      setProvider(a.model?.provider || "google");
      setModel(a.model?.model || "gemini-2.0-flash-001");
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return assistants;
    return assistants.filter(
      (a) =>
        (a.name || "").toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q),
    );
  }, [assistants, search]);

  const handleProviderChange = (p: string, mode: "edit" | "create") => {
    const models = PROVIDER_MODELS[p] || PROVIDER_MODELS.openai;
    const nextModel = models[0] || "gpt-4o";
    if (mode === "edit") {
      setProvider(p);
      setModel(nextModel);
    } else {
      setCreateProvider(p);
      setCreateModel(nextModel);
    }
  };

  const handleSave = async () => {
    if (!selectedId) return;
    setSaving(true);
    try {
      const res = await updateVapiAssistant(selectedId, {
        name,
        firstMessage,
        systemPrompt,
        provider,
        model,
      });
      if (res.success) {
        toast.success("Assistant updated");
        await refresh();
      } else {
        toast.error(res.error || "Update failed");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!createName.trim()) {
      toast.error("Name is required");
      return;
    }
    setCreating(true);
    try {
      const res = await createVapiAssistant({
        name: createName.trim(),
        firstMessage: createFirst.trim(),
        systemPrompt: createPrompt.trim(),
        provider: createProvider,
        model: createModel,
      });
      if (res.success && res.assistant?.id) {
        toast.success("Assistant created");
        setCreateOpen(false);
        setCreateName("");
        await refresh();
        setSelectedId(res.assistant.id);
      } else {
        toast.error(res.error || "Create failed");
      }
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full min-h-[60vh]">
      <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-3 rounded-lg border border-[#27272a] bg-[#18181b] p-4">
        <div className="flex flex-col gap-2 w-full">
          <Button
            className="w-full gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-md h-8 text-sm"
            type="button"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="size-4" />
            Deploy New Agent
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New AI assistant</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Sales Setter — Webinar A"
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>First message</Label>
                  <Textarea
                    value={createFirst}
                    onChange={(e) => setCreateFirst(e.target.value)}
                    rows={3}
                    className="bg-background/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>System prompt</Label>
                  <Textarea
                    value={createPrompt}
                    onChange={(e) => setCreatePrompt(e.target.value)}
                    rows={8}
                    className="bg-background/50 font-mono text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select
                      value={createProvider}
                      onValueChange={(v) => {
                        if (v) handleProviderChange(v, "create");
                      }}
                    >
                      <SelectTrigger className="w-full bg-background/50 border border-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-input">
                        <SelectItem value="google">google</SelectItem>
                        <SelectItem value="openai">openai</SelectItem>
                        <SelectItem value="anthropic">anthropic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Select
                      value={createModel}
                      onValueChange={(v) => {
                        if (v) setCreateModel(v);
                      }}
                    >
                      <SelectTrigger className="w-full bg-background/50 border border-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border border-input">
                        {(PROVIDER_MODELS[createProvider] || []).map((m) => (
                          <SelectItem key={m} value={m}>
                            {m}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button
                  className="w-full rounded-xl"
                  onClick={handleCreate}
                  disabled={creating}
                >
                  {creating ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Create on Vapi"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#52525b]" />
          <Input
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#0e0e10] border-[#27272a] rounded-md text-sm text-[#a1a1aa] placeholder:text-[#52525b] focus-visible:ring-violet-500/40 h-8"
          />
        </div>

        <div className="flex-1 min-h-[200px] overflow-y-auto space-y-1 pr-1">
          {loadingList ? (
            <div className="flex justify-center py-12">
              <Loader2 className="size-6 animate-spin text-violet-500" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-[#71717a] px-2 py-6 text-center">
              No agents yet. Deploy one to get started.
            </p>
          ) : (
            filtered.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedId(a.id)}
                className={cn(
                  "w-full text-left rounded-md px-3 py-2.5 text-sm transition-colors border",
                  selectedId === a.id
                    ? "bg-violet-600/10 border-violet-500/40 text-[#fafafa]"
                    : "border-transparent hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#fafafa]",
                )}
              >
                <div className="font-medium truncate">{a.name || "Untitled"}</div>
                <div className="text-[10px] font-mono text-[#52525b] truncate mt-0.5">{a.id}</div>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="flex-1 min-w-0 rounded-lg border border-[#27272a] bg-[#18181b] p-6 flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-violet-600/10 border border-violet-500/20 flex items-center justify-center">
              <Settings2 className="size-4 text-violet-400" />
            </div>
            <div>
              <h2 className="text-base font-medium text-[#fafafa]">Configure Agent</h2>
              <p className="text-xs text-[#71717a] mt-0.5">Instance Settings</p>
            </div>
          </div>
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white rounded-md h-8 text-sm px-4"
            onClick={handleSave}
            disabled={!selectedId || saving}
          >
            {saving ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              "Save Changes"
            )}
          </Button>
        </div>

        {!selectedId ? (
          <p className="text-[#71717a] text-sm">
            Select an agent from the list to configure its voice engine, system prompt, and model.
          </p>
        ) : (
          <div className="space-y-6 flex-1 flex flex-col min-h-0">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2">
              <Label>First message</Label>
              <Textarea
                value={firstMessage}
                onChange={(e) => setFirstMessage(e.target.value)}
                rows={3}
                className="bg-background/50"
              />
            </div>
            <div className="space-y-2 flex-1 flex flex-col min-h-0">
              <Label>System prompt</Label>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="bg-background/50 flex-1 min-h-[200px] font-mono text-xs"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Provider</Label>
                <Select
                  value={provider}
                  onValueChange={(v) => {
                    if (v) handleProviderChange(v, "edit");
                  }}
                >
                  <SelectTrigger className="w-full bg-background/50 border border-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-input">
                    <SelectItem value="google">google</SelectItem>
                    <SelectItem value="openai">openai</SelectItem>
                    <SelectItem value="anthropic">anthropic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Model</Label>
                <Select
                  value={model}
                  onValueChange={(v) => {
                    if (v) setModel(v);
                  }}
                >
                  <SelectTrigger className="w-full bg-background/50 border border-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border border-input">
                    {(PROVIDER_MODELS[provider] || PROVIDER_MODELS.openai).map(
                      (m) => (
                        <SelectItem key={m} value={m}>
                          {m}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
