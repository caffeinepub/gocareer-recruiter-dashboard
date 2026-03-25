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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { DollarSign, MapPin, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Job } from "../backend";
import type { Variant_closed_open_draft } from "../backend";
import { backend } from "../lib/backendClient";

const statusColors: Record<string, string> = {
  open: "bg-emerald-100 text-emerald-700",
  draft: "bg-yellow-100 text-yellow-700",
  closed: "bg-slate-100 text-slate-600",
};

interface JobForm {
  title: string;
  location: string;
  salaryMin: string;
  salaryMax: string;
  status: string;
  description: string;
}

const emptyForm: JobForm = {
  title: "",
  location: "",
  salaryMin: "",
  salaryMax: "",
  status: "open",
  description: "",
};

export function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const [form, setForm] = useState<JobForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadJobs = useCallback(async () => {
    const data = await backend.getAllJobs();
    setJobs(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const openCreate = () => {
    setEditJob(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (job: Job) => {
    setEditJob(job);
    setForm({
      title: job.title,
      location: job.location,
      salaryMin: String(Number(job.salaryMin)),
      salaryMax: String(Number(job.salaryMax)),
      status: job.status,
      description: job.description,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.location) {
      toast.error("Title and location are required");
      return;
    }
    setSaving(true);
    try {
      const statusEnum = form.status as Variant_closed_open_draft;
      if (editJob) {
        await backend.updateJob(
          editJob.id,
          form.title,
          form.location,
          BigInt(Number(form.salaryMin) || 0),
          BigInt(Number(form.salaryMax) || 0),
          statusEnum,
          form.description,
        );
        toast.success("Job updated");
      } else {
        await backend.createJob(
          form.title,
          form.location,
          BigInt(Number(form.salaryMin) || 0),
          BigInt(Number(form.salaryMax) || 0),
          statusEnum,
          form.description,
        );
        toast.success("Job created");
      }
      setDialogOpen(false);
      loadJobs();
    } catch {
      toast.error("Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: bigint) => {
    try {
      await backend.deleteJob(id);
      toast.success("Job deleted");
      loadJobs();
    } catch {
      toast.error("Failed to delete job");
    }
  };

  const formatSalary = (min: bigint, max: bigint) =>
    `$${Math.round(Number(min) / 1000)}k – $${Math.round(Number(max) / 1000)}k`;

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-64"
        data-ocid="jobs.loading_state"
      >
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6" data-ocid="jobs.page">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-800">
            Jobs
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {jobs.length} job listings
          </p>
        </div>
        <Button
          data-ocid="jobs.open_modal_button"
          onClick={openCreate}
          className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
        >
          <Plus className="w-4 h-4" /> Post New Job
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-card overflow-hidden">
        {jobs.length === 0 ? (
          <div
            className="text-center py-16 text-slate-400"
            data-ocid="jobs.empty_state"
          >
            <p className="text-lg font-medium">No jobs yet</p>
            <p className="text-sm mt-1">
              Post your first job listing to get started
            </p>
          </div>
        ) : (
          <table className="w-full" data-ocid="jobs.table">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Title
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Location
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Salary
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Posted
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {jobs.map((job, idx) => (
                <tr
                  key={String(job.id)}
                  data-ocid={`jobs.item.${idx + 1}`}
                  className="hover:bg-slate-50/50 transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-800 text-sm">
                      {job.title}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-slate-500 text-sm">
                      <MapPin className="w-3.5 h-3.5" />
                      {job.location}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1 text-slate-600 text-sm">
                      <DollarSign className="w-3.5 h-3.5" />
                      {formatSalary(job.salaryMin, job.salaryMax)}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[job.status] ?? "bg-slate-100 text-slate-600"}`}
                    >
                      {job.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-slate-500 text-sm">
                    {new Date(
                      Number(job.postedDate / BigInt(1_000_000)),
                    ).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        data-ocid={`jobs.edit_button.${idx + 1}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => openEdit(job)}
                        className="text-slate-400 hover:text-indigo-600 h-8 w-8 p-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        data-ocid={`jobs.delete_button.${idx + 1}`}
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(job.id)}
                        className="text-slate-400 hover:text-red-600 h-8 w-8 p-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg" data-ocid="jobs.dialog">
          <DialogHeader>
            <DialogTitle>{editJob ? "Edit Job" : "Post New Job"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="job-title">Job Title</Label>
              <Input
                id="job-title"
                data-ocid="jobs.input"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Senior Frontend Engineer"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="job-location">Location</Label>
              <Input
                id="job-location"
                value={form.location}
                onChange={(e) =>
                  setForm((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="e.g. Remote, New York"
                className="mt-1"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="salary-min">Salary Min</Label>
                <Input
                  id="salary-min"
                  type="number"
                  value={form.salaryMin}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, salaryMin: e.target.value }))
                  }
                  placeholder="120000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="salary-max">Salary Max</Label>
                <Input
                  id="salary-max"
                  type="number"
                  value={form.salaryMax}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, salaryMax: e.target.value }))
                  }
                  placeholder="160000"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="job-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}
              >
                <SelectTrigger className="mt-1" data-ocid="jobs.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="job-desc">Description</Label>
              <Textarea
                id="job-desc"
                data-ocid="jobs.textarea"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
                placeholder="Describe the role..."
                className="mt-1 h-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="jobs.cancel_button"
              variant="outline"
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="jobs.submit_button"
              onClick={handleSave}
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {saving ? "Saving..." : editJob ? "Update Job" : "Post Job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
