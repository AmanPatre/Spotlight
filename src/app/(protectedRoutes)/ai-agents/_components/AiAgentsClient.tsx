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
import { Cpu, Loader2, Plus, Search, Settings2 } from "lucide-react";
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
    <div className="flex flex-col lg:flex-row gap-6 w-full min-h-[70vh]">
      <aside className="w-full lg:w-80 shrink-0 flex flex-col gap-4 rounded border border-[#27272a] bg-[#141313] p-4 shadow-sm">
        <div className="flex flex-col gap-2 w-full">
          <Button
            className="w-full gap-2 bg-[#ffffff] hover:bg-[#c6c6c7] text-[#141313] rounded font-semibold h-9 text-[13px] transition-all"
            type="button"
            onClick={() => setCreateOpen(true)}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            DEPLOY NEW AGENT
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto bg-[#141313] border-[#444748] text-[#ffffff] rounded-none shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-[20px] font-semibold tracking-tight uppercase border-b border-[#444748] pb-3" style={{ fontFamily: 'Geist, sans-serif' }}>
                  New AI Assistant
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-4">
                <div className="space-y-2">
                  <Label className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest font-mono">Name</Label>
                  <Input
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    placeholder="e.g. Sales Setter — Webinar A"
                    className="bg-[#1c1b1b] border-[#444748] text-[#ffffff] rounded placeholder:text-[#52525b] focus:ring-1 focus:ring-[#ffffff] h-10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest font-mono">First message</Label>
                  <Textarea
                    value={createFirst}
                    onChange={(e) => setCreateFirst(e.target.value)}
                    rows={3}
                    className="bg-[#1c1b1b] border-[#444748] text-[#ffffff] rounded placeholder:text-[#52525b] focus:ring-1 focus:ring-[#ffffff]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest font-mono">System prompt</Label>
                  <Textarea
                    value={createPrompt}
                    onChange={(e) => setCreatePrompt(e.target.value)}
                    rows={8}
                    className="bg-[#000000] border-[#444748] text-[#e5e2e1] rounded font-mono text-xs focus:ring-1 focus:ring-[#ffffff]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest font-mono">Provider</Label>
                    <Select
                      value={createProvider}
                      onValueChange={(v) => {
                        if (v) handleProviderChange(v, "create");
                      }}
                    >
                      <SelectTrigger className="w-full bg-[#1c1b1b] border-[#444748] text-[#ffffff] rounded h-10 uppercase font-mono text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1c1b1b] border-[#444748] text-[#ffffff] rounded-none shadow-xl">
                        <SelectItem value="google">google</SelectItem>
                        <SelectItem value="openai">openai</SelectItem>
                        <SelectItem value="anthropic">anthropic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest font-mono">Model</Label>
                    <Select
                      value={createModel}
                      onValueChange={(v) => {
                        if (v) setCreateModel(v);
                      }}
                    >
                      <SelectTrigger className="w-full bg-[#1c1b1b] border-[#444748] text-[#ffffff] rounded h-10 font-mono text-[11px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1c1b1b] border-[#444748] text-[#ffffff] rounded-none shadow-xl">
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
                  className="w-full bg-[#ffffff] hover:bg-[#c6c6c7] text-[#141313] font-bold h-11 tracking-widest transition-all rounded-none mt-2"
                  onClick={handleCreate}
                  disabled={creating}
                >
                  {creating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "CREATE ON VAPI"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 w-4 h-4 -translate-y-1/2 text-[#c4c7c8]" />
          <Input
            placeholder="FILTER AGENTS"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-[#1c1b1b] border-[#444748] rounded text-[#ffffff] placeholder:text-[#52525b] focus:ring-1 focus:ring-[#ffffff] h-9 text-[11px] font-mono tracking-widest"
          />
        </div>

        <div className="flex-1 min-h-[200px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
          {loadingList ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-6 h-6 animate-spin text-[#ffffff]" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-[12px] font-mono text-zinc-500 px-4 py-12 text-center uppercase tracking-widest">
              No agents discovered.
            </p>
          ) : (
            filtered.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setSelectedId(a.id)}
                className={cn(
                  "w-full text-left rounded-sm px-4 py-3 transition-all border-l-2",
                  selectedId === a.id
                    ? "bg-[#353434] border-[#ffffff] text-[#ffffff]"
                    : "border-transparent hover:bg-[#1c1b1b] text-[#b4b4bd] hover:text-[#ffffff]",
                )}
              >
                <div className="text-[14px] font-semibold truncate leading-[1] mb-1" style={{ fontFamily: 'Geist, sans-serif' }}>{a.name || "Untitled Agent"}</div>
                <div className="text-[10px] font-mono text-[#52525b] truncate uppercase tracking-tighter">{a.id}</div>
              </button>
            ))
          )}
        </div>
      </aside>

      <section className="flex-1 min-w-0 rounded border border-[#27272a] bg-[#141313] p-8 flex flex-col gap-8 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-6 pb-6 border-b border-[#444748]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-[#ffffff] border border-[#444748] flex items-center justify-center shadow-inner">
              <Settings2 className="w-5 h-5 text-[#2f3131]" />
            </div>
            <div>
              <h2 className="text-[20px] font-semibold text-[#ffffff] leading-[1.2]" style={{ fontFamily: 'Geist, sans-serif' }}>Configure Agent</h2>
              <p className="text-[12px] font-mono text-[#c4c7c8] mt-1 uppercase tracking-widest">Deployment Parameters</p>
            </div>
          </div>
          <Button
            className="bg-[#ffffff] hover:bg-[#c6c6c7] text-[#141313] rounded font-bold h-9 text-[12px] px-6 transition-all tracking-widest"
            onClick={handleSave}
            disabled={!selectedId || saving}
          >
            {saving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              "SYNC CHANGES"
            )}
          </Button>
        </div>

        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 opacity-40">
            <Cpu className="w-12 h-12 text-[#c4c7c8] mb-4" />
            <p className="text-[13px] font-mono uppercase tracking-[0.2em] text-[#c4c7c8]">
              Select agent instance to begin calibration
            </p>
          </div>
        ) : (
          <div className="space-y-8 flex-1 flex flex-col min-h-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest font-mono">Agent Name</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-[#1c1b1b] border-[#444748] text-[#ffffff] rounded placeholder:text-[#52525b] focus:ring-1 focus:ring-[#ffffff] h-11"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest font-mono">First Interaction Message</Label>
                <div className="relative">
                  <Textarea
                    value={firstMessage}
                    onChange={(e) => setFirstMessage(e.target.value)}
                    rows={1}
                    className="bg-[#1c1b1b] border-[#444748] text-[#ffffff] rounded min-h-[44px] py-3 focus:ring-1 focus:ring-[#ffffff]"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between">
                <Label className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest font-mono">Neural System Instruction (Prompt)</Label>
                <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">UTF-8 MONO-RENDER</span>
              </div>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="bg-[#000000] border-[#444748] text-[#e5e2e1] rounded flex-1 min-h-[300px] font-mono text-[12px] leading-relaxed p-6 focus:ring-1 focus:ring-[#ffffff] custom-scrollbar selection:bg-[#ffffff] selection:text-[#000000]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-4 border-t border-[#444748]/50">
              <div className="space-y-3">
                <Label className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest font-mono">LLM Provider</Label>
                <Select
                  value={provider}
                  onValueChange={(v) => {
                    if (v) handleProviderChange(v, "edit");
                  }}
                >
                  <SelectTrigger className="w-full bg-[#1c1b1b] border-[#444748] text-[#ffffff] rounded h-11 uppercase font-mono text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c1b1b] border-[#444748] text-[#ffffff] rounded-none shadow-xl">
                    <SelectItem value="google" className="focus:bg-[#ffffff] focus:text-[#000000]">GOOGLE GEMINI</SelectItem>
                    <SelectItem value="openai" className="focus:bg-[#ffffff] focus:text-[#000000]">OPENAI GPT</SelectItem>
                    <SelectItem value="anthropic" className="focus:bg-[#ffffff] focus:text-[#000000]">ANTHROPIC CLAUDE</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[12px] font-medium text-[#c4c7c8] uppercase tracking-widest font-mono">Model Specification</Label>
                <Select
                  value={model}
                  onValueChange={(v) => {
                    if (v) setModel(v);
                  }}
                >
                  <SelectTrigger className="w-full bg-[#1c1b1b] border-[#444748] text-[#ffffff] rounded h-11 font-mono text-[13px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1c1b1b] border-[#444748] text-[#ffffff] rounded-none shadow-xl">
                    {(PROVIDER_MODELS[provider] || PROVIDER_MODELS.openai).map(
                      (m) => (
                        <SelectItem key={m} value={m} className="focus:bg-[#ffffff] focus:text-[#000000] uppercase">
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
