import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Candidate, Conversation } from "../backend";
import { Variant_recruiter_candidate } from "../backend";
import { backend } from "../lib/backendClient";

const candidatePhotos: Record<string, string> = {
  "Amara Johnson": "/assets/generated/candidate-1.dim_200x200.jpg",
  "Raj Patel": "/assets/generated/candidate-2.dim_200x200.jpg",
  "Sarah Mitchell": "/assets/generated/candidate-3.dim_200x200.jpg",
  "Kevin Chen": "/assets/generated/candidate-4.dim_200x200.jpg",
  "Maria Rodriguez": "/assets/generated/candidate-5.dim_200x200.jpg",
  "Omar Hassan": "/assets/generated/candidate-6.dim_200x200.jpg",
  "Marcus Williams": "/assets/generated/candidate-7.dim_200x200.jpg",
  "Tom Harrison": "/assets/generated/candidate-8.dim_200x200.jpg",
  "Priya Sharma": "/assets/generated/candidate-9.dim_200x200.jpg",
};

export function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState<bigint | null>(
    null,
  );
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const [convs, cands] = await Promise.all([
      backend.getAllConversations(),
      backend.getAllCandidates(),
    ]);
    setConversations(convs);
    setCandidates(cands);
    setSelectedCandidateId(
      (prev) => prev ?? (convs.length > 0 ? convs[0].candidateId : null),
    );
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const selectedConv = conversations.find(
    (c) => c.candidateId === selectedCandidateId,
  );
  const getCandidateName = (id: bigint) =>
    candidates.find((c) => c.id === id)?.name ?? "Unknown";
  const getCandidatePhoto = (id: bigint) => {
    const name = getCandidateName(id);
    return candidatePhotos[name];
  };

  const handleSend = async () => {
    if (!selectedCandidateId || !messageText.trim()) return;
    setSending(true);
    try {
      await backend.addMessage(
        selectedCandidateId,
        Variant_recruiter_candidate.recruiter,
        messageText.trim(),
      );
      setMessageText("");
      const convs = await backend.getAllConversations();
      setConversations(convs);
    } catch {
      toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-64"
        data-ocid="messages.loading_state"
      >
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="flex h-full" data-ocid="messages.page">
      {/* Conversation List */}
      <div className="w-80 flex-shrink-0 bg-white border-r border-slate-100 flex flex-col">
        <div className="px-5 py-4 border-b border-slate-100">
          <h1 className="font-display font-bold text-slate-800 text-lg">
            Messages
          </h1>
        </div>
        <ScrollArea className="flex-1">
          {conversations.length === 0 ? (
            <div
              className="text-center py-12 text-slate-400 text-sm"
              data-ocid="messages.empty_state"
            >
              No conversations
            </div>
          ) : (
            conversations.map((conv, idx) => {
              const name = getCandidateName(conv.candidateId);
              const lastMsg = conv.messages[conv.messages.length - 1];
              const isSelected = conv.candidateId === selectedCandidateId;
              return (
                <button
                  key={String(conv.candidateId)}
                  type="button"
                  data-ocid={`messages.item.${idx + 1}`}
                  onClick={() => setSelectedCandidateId(conv.candidateId)}
                  className={`w-full flex items-center gap-3 px-5 py-4 border-b border-slate-50 transition-colors text-left ${
                    isSelected ? "bg-indigo-50" : "hover:bg-slate-50"
                  }`}
                >
                  <Avatar className="w-10 h-10 flex-shrink-0">
                    <AvatarImage
                      src={getCandidatePhoto(conv.candidateId)}
                      alt={name}
                    />
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-semibold">
                      {name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-semibold truncate ${isSelected ? "text-indigo-700" : "text-slate-800"}`}
                    >
                      {name}
                    </p>
                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {lastMsg?.text ?? "No messages"}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </ScrollArea>
      </div>

      {/* Message Thread */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {selectedConv ? (
          <>
            <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-3">
              <Avatar className="w-9 h-9">
                <AvatarImage
                  src={getCandidatePhoto(selectedConv.candidateId)}
                />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm">
                  {getCandidateName(selectedConv.candidateId)
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-slate-800 text-sm">
                  {getCandidateName(selectedConv.candidateId)}
                </p>
                <p className="text-xs text-emerald-600">Active candidate</p>
              </div>
            </div>

            <ScrollArea className="flex-1 px-6 py-5">
              <div className="space-y-3">
                {selectedConv.messages.map((msg) => {
                  const isRecruiter = msg.senderRole === "recruiter";
                  return (
                    <div
                      key={String(msg.timestamp)}
                      className={`flex ${isRecruiter ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
                          isRecruiter
                            ? "bg-indigo-600 text-white rounded-br-sm"
                            : "bg-white shadow-xs text-slate-800 rounded-bl-sm"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            </ScrollArea>

            <div className="bg-white border-t border-slate-100 px-6 py-4">
              <div className="flex gap-2">
                <Input
                  data-ocid="messages.input"
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="flex-1"
                />
                <Button
                  data-ocid="messages.primary_button"
                  onClick={handleSend}
                  disabled={sending || !messageText.trim()}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            <p>Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
}
