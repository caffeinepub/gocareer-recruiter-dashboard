import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Calendar,
  MapPin,
  Phone,
  UserCheck,
  Users,
  Video,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Candidate, Interview, Job } from "../backend";
import {
  Variant_hired_offer_screening_interview_applied,
  Variant_scheduled_cancelled_completed,
} from "../backend";
import { StatCard } from "../components/StatCard";
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

const stageBadgeColor: Record<string, string> = {
  applied: "bg-blue-100 text-blue-700",
  screening: "bg-yellow-100 text-yellow-700",
  interview: "bg-purple-100 text-purple-700",
  offer: "bg-orange-100 text-orange-700",
  hired: "bg-emerald-100 text-emerald-700",
};

export function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      backend.getAllJobs(),
      backend.getAllCandidates(),
      backend.getAllInterviews(),
    ]).then(([j, c, i]) => {
      setJobs(j);
      setCandidates(c);
      setInterviews(i);
      setLoading(false);
    });
  }, []);

  const openJobs = jobs.filter((j) => j.status === "open").length;
  const activeCandidates = candidates.filter(
    (c) => c.stage !== Variant_hired_offer_screening_interview_applied.hired,
  ).length;
  const now = BigInt(Date.now()) * BigInt(1_000_000);
  const weekMs = BigInt(7 * 24 * 60 * 60) * BigInt(1_000_000_000);
  const interviewsThisWeek = interviews.filter(
    (i) =>
      i.datetime >= now &&
      i.datetime <= now + weekMs &&
      i.status === Variant_scheduled_cancelled_completed.scheduled,
  ).length;
  const recentHires = candidates.filter(
    (c) => c.stage === Variant_hired_offer_screening_interview_applied.hired,
  ).length;

  const upcomingInterviews = interviews
    .filter(
      (i) =>
        i.datetime >= now &&
        i.status === Variant_scheduled_cancelled_completed.scheduled,
    )
    .sort((a, b) => (a.datetime < b.datetime ? -1 : 1))
    .slice(0, 3);

  const recentCandidates = [...candidates]
    .sort((a, b) => (a.appliedDate > b.appliedDate ? -1 : 1))
    .slice(0, 5);

  const getJobTitle = (jobId: bigint) =>
    jobs.find((j) => j.id === jobId)?.title ?? "Unknown";
  const getCandidateName = (candidateId: bigint) =>
    candidates.find((c) => c.id === candidateId)?.name ?? "Unknown";

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-64"
        data-ocid="dashboard.loading_state"
      >
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" data-ocid="dashboard.page">
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-800">
          Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Welcome back, Sarah. Here's what's happening.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Open Jobs"
          value={openJobs}
          icon={Briefcase}
          iconBg="bg-indigo-50"
          iconColor="text-indigo-600"
        />
        <StatCard
          label="Active Candidates"
          value={activeCandidates}
          icon={Users}
          iconBg="bg-blue-50"
          iconColor="text-blue-600"
        />
        <StatCard
          label="Interviews This Week"
          value={interviewsThisWeek}
          icon={Calendar}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
        />
        <StatCard
          label="Recent Hires"
          value={recentHires}
          icon={UserCheck}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Upcoming Interviews */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <h2 className="font-display font-semibold text-slate-800 mb-4">
            Upcoming Interviews
          </h2>
          {upcomingInterviews.length === 0 ? (
            <div
              className="text-center py-8 text-slate-400 text-sm"
              data-ocid="interviews.empty_state"
            >
              No upcoming interviews
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingInterviews.map((interview, idx) => {
                const date = new Date(
                  Number(interview.datetime / BigInt(1_000_000)),
                );
                const TypeIcon =
                  interview.interviewType === "video"
                    ? Video
                    : interview.interviewType === "phone"
                      ? Phone
                      : MapPin;
                return (
                  <div
                    key={String(interview.id)}
                    data-ocid={`interviews.item.${idx + 1}`}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-50"
                  >
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <TypeIcon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">
                        {getCandidateName(interview.candidateId)}
                      </p>
                      <p className="text-xs text-slate-500 truncate">
                        {getJobTitle(interview.jobId)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-700">
                        {date.toLocaleDateString()}
                      </p>
                      <p className="text-xs text-slate-500">
                        {date.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Candidates */}
        <div className="bg-white rounded-xl shadow-card p-5">
          <h2 className="font-display font-semibold text-slate-800 mb-4">
            Recent Candidates
          </h2>
          <div className="space-y-3">
            {recentCandidates.map((candidate, idx) => (
              <div
                key={String(candidate.id)}
                data-ocid={`candidates.item.${idx + 1}`}
                className="flex items-center gap-3"
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={candidatePhotos[candidate.name]}
                    alt={candidate.name}
                  />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-semibold">
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
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full capitalize ${stageBadgeColor[candidate.stage] ?? "bg-slate-100 text-slate-600"}`}
                >
                  {candidate.stage}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
