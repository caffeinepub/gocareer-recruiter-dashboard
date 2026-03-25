import { Badge } from "@/components/ui/badge";
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
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Plus,
  Video,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Candidate, Interview, Job } from "../backend";
import {
  Variant_scheduled_cancelled_completed,
  type Variant_video_phone_onSite,
} from "../backend";
import { backend } from "../lib/backendClient";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const typeColors: Record<string, string> = {
  video: "bg-indigo-100 text-indigo-700",
  phone: "bg-blue-100 text-blue-700",
  onSite: "bg-emerald-100 text-emerald-700",
};

const TypeIcon = ({ type }: { type: string }) => {
  if (type === "video") return <Video className="w-3 h-3" />;
  if (type === "phone") return <Phone className="w-3 h-3" />;
  return <MapPin className="w-3 h-3" />;
};

interface CalendarCell {
  cellKey: string;
  day: number | null;
}

export function Schedule() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    candidateId: "",
    jobId: "",
    date: "",
    time: "",
    type: "video",
    notes: "",
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [iv, ca, jo] = await Promise.all([
      backend.getAllInterviews(),
      backend.getAllCandidates(),
      backend.getAllJobs(),
    ]);
    setInterviews(iv);
    setCandidates(ca);
    setJobs(jo);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const getCandidateName = (id: bigint) =>
    candidates.find((c) => c.id === id)?.name ?? "Unknown";
  const getJobTitle = (id: bigint) =>
    jobs.find((j) => j.id === id)?.title ?? "Unknown";

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const buildCalendarCells = (): CalendarCell[] => {
    const cells: CalendarCell[] = [];
    for (let p = 0; p < firstDay; p++)
      cells.push({ cellKey: `pad-s-${year}-${month}-${p}`, day: null });
    for (let d = 1; d <= daysInMonth; d++)
      cells.push({ cellKey: `day-${year}-${month}-${d}`, day: d });
    let e = 0;
    while (cells.length % 7 !== 0)
      cells.push({ cellKey: `pad-e-${year}-${month}-${e++}`, day: null });
    return cells;
  };
  const calendarCells = buildCalendarCells();

  const getInterviewsForDay = (day: number) =>
    interviews.filter((iv) => {
      const d = new Date(Number(iv.datetime / BigInt(1_000_000)));
      return (
        d.getFullYear() === year &&
        d.getMonth() === month &&
        d.getDate() === day &&
        iv.status === Variant_scheduled_cancelled_completed.scheduled
      );
    });

  const upcomingInterviews = interviews
    .filter(
      (iv) =>
        iv.datetime >= BigInt(Date.now()) * BigInt(1_000_000) &&
        iv.status === Variant_scheduled_cancelled_completed.scheduled,
    )
    .sort((a, b) => (a.datetime < b.datetime ? -1 : 1))
    .slice(0, 8);

  const handleSchedule = async () => {
    if (!form.candidateId || !form.jobId || !form.date || !form.time) {
      toast.error("All fields required");
      return;
    }
    setSaving(true);
    try {
      const id = await backend.scheduleInterview(
        BigInt(form.candidateId),
        BigInt(form.jobId),
        form.type as Variant_video_phone_onSite,
        form.notes,
      );
      await backend.updateInterview(
        id,
        BigInt(form.candidateId),
        BigInt(form.jobId),
        form.type as Variant_video_phone_onSite,
        form.notes,
        Variant_scheduled_cancelled_completed.scheduled,
      );
      toast.success("Interview scheduled");
      setDialogOpen(false);
      setForm({
        candidateId: "",
        jobId: "",
        date: "",
        time: "",
        type: "video",
        notes: "",
      });
      load();
    } catch {
      toast.error("Failed to schedule interview");
    } finally {
      setSaving(false);
    }
  };

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-64"
        data-ocid="schedule.loading_state"
      >
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 flex gap-6 h-full" data-ocid="schedule.page">
      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-display font-bold text-slate-800">
              Schedule
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {MONTHS[month]} {year}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              data-ocid="schedule.pagination_prev"
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              data-ocid="schedule.pagination_next"
              variant="outline"
              size="sm"
              className="w-8 h-8 p-0"
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button
              data-ocid="schedule.open_modal_button"
              onClick={() => setDialogOpen(true)}
              className="ml-2 bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5"
            >
              <Plus className="w-4 h-4" /> Schedule
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card overflow-hidden flex-1">
          <div className="grid grid-cols-7 border-b border-slate-100">
            {DAYS.map((d) => (
              <div
                key={d}
                className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider py-3"
              >
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {calendarCells.map(({ cellKey, day }) => (
              <div
                key={cellKey}
                className={`min-h-24 border-b border-r border-slate-50 p-2 ${day && isToday(day) ? "bg-indigo-50/50" : ""}`}
              >
                {day && (
                  <>
                    <span
                      className={`text-sm font-medium ${isToday(day) ? "w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs" : "text-slate-700"}`}
                    >
                      {day}
                    </span>
                    <div className="mt-1 space-y-1">
                      {getInterviewsForDay(day)
                        .slice(0, 2)
                        .map((iv) => (
                          <div
                            key={String(iv.id)}
                            className={`text-xs px-1.5 py-0.5 rounded flex items-center gap-1 truncate ${typeColors[iv.interviewType] ?? "bg-slate-100"}`}
                          >
                            <TypeIcon type={iv.interviewType} />
                            <span className="truncate">
                              {getCandidateName(iv.candidateId)}
                            </span>
                          </div>
                        ))}
                      {getInterviewsForDay(day).length > 2 && (
                        <p className="text-xs text-slate-400">
                          +{getInterviewsForDay(day).length - 2} more
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-72 flex-shrink-0">
        <h2 className="font-display font-semibold text-slate-800 mb-4">
          Upcoming
        </h2>
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {upcomingInterviews.length === 0 ? (
              <div
                className="text-center py-8 text-slate-400 text-sm"
                data-ocid="schedule.empty_state"
              >
                No upcoming interviews
              </div>
            ) : (
              upcomingInterviews.map((iv, idx) => {
                const date = new Date(Number(iv.datetime / BigInt(1_000_000)));
                return (
                  <div
                    key={String(iv.id)}
                    data-ocid={`schedule.item.${idx + 1}`}
                    className="bg-white rounded-xl shadow-xs p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {getCandidateName(iv.candidateId)}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {getJobTitle(iv.jobId)}
                        </p>
                      </div>
                      <Badge
                        className={`text-xs ${typeColors[iv.interviewType]}`}
                        variant="outline"
                      >
                        {iv.interviewType}
                      </Badge>
                    </div>
                    <p className="text-xs text-indigo-600 font-medium mt-2">
                      {date.toLocaleDateString()} ·{" "}
                      {date.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent data-ocid="schedule.dialog">
          <DialogHeader>
            <DialogTitle>Schedule Interview</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Candidate</Label>
              <Select
                value={form.candidateId}
                onValueChange={(v) =>
                  setForm((p) => ({ ...p, candidateId: v }))
                }
              >
                <SelectTrigger className="mt-1" data-ocid="schedule.select">
                  <SelectValue placeholder="Select candidate" />
                </SelectTrigger>
                <SelectContent>
                  {candidates.map((c) => (
                    <SelectItem key={String(c.id)} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Job</Label>
              <Select
                value={form.jobId}
                onValueChange={(v) => setForm((p) => ({ ...p, jobId: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select job" />
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
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date</Label>
                <Input
                  data-ocid="schedule.input"
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, date: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={form.time}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, time: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm((p) => ({ ...p, type: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="onSite">On-Site</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea
                data-ocid="schedule.textarea"
                value={form.notes}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Interview notes..."
                className="mt-1 h-20"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="schedule.cancel_button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="schedule.submit_button"
              onClick={handleSchedule}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {saving ? "Scheduling..." : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
