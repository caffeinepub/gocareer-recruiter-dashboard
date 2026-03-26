import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Candidate, Job, Note } from "../backend";
import { Variant_hired_offer_screening_interview_applied } from "../backend";
import { backend } from "../lib/backendClient";

const stages = [
  {
    id: Variant_hired_offer_screening_interview_applied.applied,
    label: "Applied",
    color: "bg-blue-50 border-blue-200",
    headerColor: "bg-blue-600",
  },
  {
    id: Variant_hired_offer_screening_interview_applied.screening,
    label: "Screening",
    color: "bg-yellow-50 border-yellow-200",
    headerColor: "bg-yellow-500",
  },
  {
    id: Variant_hired_offer_screening_interview_applied.interview,
    label: "Interview",
    color: "bg-purple-50 border-purple-200",
    headerColor: "bg-purple-600",
  },
  {
    id: Variant_hired_offer_screening_interview_applied.offer,
    label: "Offer",
    color: "bg-orange-50 border-orange-200",
    headerColor: "bg-orange-500",
  },
  {
    id: Variant_hired_offer_screening_interview_applied.hired,
    label: "Hired",
    color: "bg-emerald-50 border-emerald-200",
    headerColor: "bg-emerald-600",
  },
];

interface AddCandidateForm {
  name: string;
  email: string;
  phone: string;
  jobId: string;
}

export function Candidates() {
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(
    null,
  );
  const [sheetOpen, setSheetOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [addForm, setAddForm] = useState<AddCandidateForm>({
    name: "",
    email: "",
    phone: "",
    jobId: "",
  });
  const [addSaving, setAddSaving] = useState(false);
  const [movingStage, setMovingStage] = useState(false);

  const load = useCallback(async () => {
    const [c, j] = await Promise.all([
      backend.getAllCandidates(),
      backend.getAllJobs(),
    ]);
    setCandidates(c);
    setJobs(j);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openDetail = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setNewNote("");
    setSheetOpen(true);
  };

  const handleStageChange = async (newStage: string) => {
    if (!selectedCandidate) return;
    setMovingStage(true);
    try {
      await backend.updateCandidateStage(
        selectedCandidate.id,
        newStage as Variant_hired_offer_screening_interview_applied,
      );
      toast.success("Stage updated");
      const updated = {
        ...selectedCandidate,
        stage: newStage as Variant_hired_offer_screening_interview_applied,
      };
      setSelectedCandidate(updated);
      setCandidates((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
    } catch {
      toast.error("Failed to update stage");
    } finally {
      setMovingStage(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedCandidate || !newNote.trim()) return;
    setSavingNote(true);
    try {
      const note: Note = {
        text: newNote.trim(),
        author: "Sarah Chen",
        timestamp: BigInt(Date.now()) * BigInt(1_000_000),
      };
      const updatedNotes = [...selectedCandidate.notes, note];
      await backend.updateCandidate(
        selectedCandidate.id,
        selectedCandidate.name,
        selectedCandidate.email,
        selectedCandidate.phone,
        selectedCandidate.appliedJobId,
        updatedNotes,
      );
      const updated = { ...selectedCandidate, notes: updatedNotes };
      setSelectedCandidate(updated);
      setCandidates((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c)),
      );
      setNewNote("");
      toast.success("Note saved");
    } catch {
      toast.error("Failed to save note");
    } finally {
      setSavingNote(false);
    }
  };

  const handleAddCandidate = async () => {
    if (!addForm.name || !addForm.email || !addForm.jobId) {
      toast.error("Name, email, and job are required");
      return;
    }
    setAddSaving(true);
    try {
      await backend.createCandidate(
        addForm.name,
        addForm.email,
        addForm.phone,
        BigInt(addForm.jobId),
        Variant_hired_offer_screening_interview_applied.applied,
        [],
        BigInt(Date.now()) * BigInt(1_000_000),
      );
      toast.success("Candidate added");
      setAddDialogOpen(false);
      setAddForm({ name: "", email: "", phone: "", jobId: "" });
      load();
    } catch {
      toast.error("Failed to add candidate");
    } finally {
      setAddSaving(false);
    }
  };

  const getJobTitle = (jobId: bigint) =>
    jobs.find((j) => j.id === jobId)?.title ?? "Unknown";

  const daysSince = (ts: bigint) => {
    const diffMs = Date.now() - Number(ts / BigInt(1_000_000));
    return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-64"
        data-ocid="candidates.loading_state"
      >
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 flex flex-col h-full" data-ocid="candidates.page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">
            Candidates
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {candidates.length} total candidates
          </p>
        </div>
        <Button
          data-ocid="candidates.open_modal_button"
          onClick={() => setAddDialogOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" /> Add Candidate
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
        {stages.map((stage) => {
          const stageCandidates = candidates.filter(
            (c) => c.stage === stage.id,
          );
          return (
            <div
              key={stage.id}
              className={`flex-shrink-0 w-64 rounded-xl border ${stage.color} flex flex-col`}
              style={{ minHeight: 200 }}
            >
              <div
                className={`${stage.headerColor} rounded-t-xl px-4 py-3 flex items-center justify-between`}
              >
                <span className="text-white text-sm font-semibold">
                  {stage.label}
                </span>
                <span className="bg-white/20 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {stageCandidates.length}
                </span>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                  {stageCandidates.length === 0 && (
                    <div
                      className="text-center py-6 text-slate-400 text-xs"
                      data-ocid={`${stage.id}.empty_state`}
                    >
                      No candidates
                    </div>
                  )}
                  {stageCandidates.map((candidate, cidx) => (
                    <button
                      key={String(candidate.id)}
                      type="button"
                      data-ocid={`candidates.item.${cidx + 1}`}
                      onClick={() => openDetail(candidate)}
                      className="w-full bg-white rounded-lg shadow-xs p-3 text-left hover:shadow-card transition-shadow"
                    >
                      <div className="flex items-center gap-2.5">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xs font-semibold">
                            {candidate.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-slate-800 truncate">
                            {candidate.name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {getJobTitle(candidate.appliedJobId)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 mt-2">
                        {daysSince(candidate.appliedDate)}d ago
                      </p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>

      {/* Candidate Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          className="w-96 overflow-y-auto"
          data-ocid="candidates.sheet"
        >
          {selectedCandidate && (
            <>
              <SheetHeader className="pb-4">
                <SheetTitle>Candidate Profile</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col items-center mb-6">
                <Avatar className="w-20 h-20 mb-3">
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl font-semibold">
                    {selectedCandidate.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-display font-bold text-slate-800 text-lg">
                  {selectedCandidate.name}
                </h3>
                <p className="text-slate-500 text-sm">
                  {getJobTitle(selectedCandidate.appliedJobId)}
                </p>
              </div>
              <div className="space-y-2 mb-5">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {selectedCandidate.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400" />
                  {selectedCandidate.phone}
                </div>
              </div>
              <div className="mb-5">
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Stage
                </Label>
                <Select
                  value={selectedCandidate.stage}
                  onValueChange={handleStageChange}
                  disabled={movingStage}
                >
                  <SelectTrigger
                    className="mt-1.5"
                    data-ocid="candidates.select"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Notes
                </Label>
                <div className="mt-2 space-y-2">
                  {selectedCandidate.notes.map((note, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: notes have no stable id
                    <div key={i} className="bg-slate-50 rounded-lg p-3">
                      <p className="text-sm text-slate-700">{note.text}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {note.author} ·{" "}
                        {new Date(
                          Number(note.timestamp / BigInt(1_000_000)),
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-3">
                  <Textarea
                    data-ocid="candidates.textarea"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    placeholder="Add a note..."
                    className="h-20 text-sm"
                  />
                  <Button
                    data-ocid="candidates.save_button"
                    onClick={handleAddNote}
                    disabled={savingNote || !newNote.trim()}
                    className="mt-2 w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    size="sm"
                  >
                    {savingNote ? "Saving..." : "Save Note"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Candidate Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent data-ocid="candidates.dialog">
          <DialogHeader>
            <DialogTitle>Add Candidate</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Full Name</Label>
              <Input
                data-ocid="candidates.input"
                value={addForm.name}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Jane Smith"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={addForm.email}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="jane@email.com"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                value={addForm.phone}
                onChange={(e) =>
                  setAddForm((p) => ({ ...p, phone: e.target.value }))
                }
                placeholder="+1-555-0100"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Job</Label>
              <Select
                value={addForm.jobId}
                onValueChange={(v) => setAddForm((p) => ({ ...p, jobId: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a job" />
                </SelectTrigger>
                <SelectContent>
                  {jobs.map((j) => (
                    <SelectItem key={String(j.id)} value={String(j.id)}>
                      {j.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="candidates.cancel_button"
              variant="outline"
              onClick={() => setAddDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="candidates.submit_button"
              onClick={handleAddCandidate}
              disabled={addSaving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {addSaving ? "Adding..." : "Add Candidate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
