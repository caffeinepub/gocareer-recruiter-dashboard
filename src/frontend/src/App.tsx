import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import {
  Variant_closed_open_draft,
  Variant_hired_offer_screening_interview_applied,
  Variant_recruiter_candidate,
} from "./backend";
import { Sidebar } from "./components/Sidebar";
import { backend } from "./lib/backendClient";
import { Candidates } from "./pages/Candidates";
import { Dashboard } from "./pages/Dashboard";
import { Jobs } from "./pages/Jobs";
import { Messages } from "./pages/Messages";
import { Schedule } from "./pages/Schedule";
import { Settings } from "./pages/Settings";

type Page =
  | "dashboard"
  | "jobs"
  | "candidates"
  | "messages"
  | "schedule"
  | "settings";

async function seedData() {
  const ts = () => BigInt(Date.now()) * BigInt(1_000_000);

  // Create jobs
  const jobIds = await Promise.all([
    backend.createJob(
      "Senior Frontend Engineer",
      "Remote",
      BigInt(120000),
      BigInt(160000),
      Variant_closed_open_draft.open,
      "We are looking for a senior frontend engineer to join our growing team.",
    ),
    backend.createJob(
      "Product Designer",
      "New York",
      BigInt(90000),
      BigInt(120000),
      Variant_closed_open_draft.open,
      "Join our design team and shape the future of our product.",
    ),
    backend.createJob(
      "Backend Developer",
      "San Francisco",
      BigInt(130000),
      BigInt(170000),
      Variant_closed_open_draft.draft,
      "Seeking a backend developer with strong distributed systems experience.",
    ),
    backend.createJob(
      "Marketing Manager",
      "London",
      BigInt(70000),
      BigInt(90000),
      Variant_closed_open_draft.closed,
      "Lead our marketing efforts across EMEA.",
    ),
  ]);

  // Create candidates
  const candidateIds = await Promise.all([
    backend.createCandidate(
      "Amara Johnson",
      "amara@email.com",
      "+1-555-0101",
      jobIds[0],
      Variant_hired_offer_screening_interview_applied.applied,
      [],
      ts(),
    ),
    backend.createCandidate(
      "Raj Patel",
      "raj@email.com",
      "+1-555-0102",
      jobIds[1],
      Variant_hired_offer_screening_interview_applied.screening,
      [],
      ts(),
    ),
    backend.createCandidate(
      "Sarah Mitchell",
      "sarah.m@email.com",
      "+1-555-0103",
      jobIds[2],
      Variant_hired_offer_screening_interview_applied.interview,
      [],
      ts(),
    ),
    backend.createCandidate(
      "Kevin Chen",
      "kevin@email.com",
      "+1-555-0104",
      jobIds[0],
      Variant_hired_offer_screening_interview_applied.offer,
      [],
      ts(),
    ),
    backend.createCandidate(
      "Maria Rodriguez",
      "maria@email.com",
      "+1-555-0105",
      jobIds[3],
      Variant_hired_offer_screening_interview_applied.hired,
      [],
      ts(),
    ),
    backend.createCandidate(
      "Omar Hassan",
      "omar@email.com",
      "+1-555-0106",
      jobIds[1],
      Variant_hired_offer_screening_interview_applied.applied,
      [],
      ts(),
    ),
    backend.createCandidate(
      "Marcus Williams",
      "marcus@email.com",
      "+1-555-0107",
      jobIds[2],
      Variant_hired_offer_screening_interview_applied.screening,
      [],
      ts(),
    ),
    backend.createCandidate(
      "Tom Harrison",
      "tom@email.com",
      "+1-555-0108",
      jobIds[0],
      Variant_hired_offer_screening_interview_applied.interview,
      [],
      ts(),
    ),
    backend.createCandidate(
      "Priya Sharma",
      "priya@email.com",
      "+1-555-0109",
      jobIds[3],
      Variant_hired_offer_screening_interview_applied.applied,
      [],
      ts(),
    ),
  ]);

  // Create conversations with messages
  await backend.createConversation(candidateIds[0]);
  await backend.addMessage(
    candidateIds[0],
    Variant_recruiter_candidate.recruiter,
    "Hi Amara, we've reviewed your application and we're impressed! We'd love to schedule a call.",
  );
  await backend.addMessage(
    candidateIds[0],
    Variant_recruiter_candidate.candidate,
    "Thank you so much! I'm very excited about this opportunity. When would work for you?",
  );

  await backend.createConversation(candidateIds[1]);
  await backend.addMessage(
    candidateIds[1],
    Variant_recruiter_candidate.recruiter,
    "Hi Raj, we'd like to move you to the next stage. Can you complete a short design exercise?",
  );
  await backend.addMessage(
    candidateIds[1],
    Variant_recruiter_candidate.candidate,
    "Absolutely! I'd be happy to. Please send over the details.",
  );

  await backend.createConversation(candidateIds[2]);
  await backend.addMessage(
    candidateIds[2],
    Variant_recruiter_candidate.recruiter,
    "Sarah, your technical interview is scheduled for next Tuesday at 2pm. Please confirm.",
  );
  await backend.addMessage(
    candidateIds[2],
    Variant_recruiter_candidate.candidate,
    "Confirmed! Looking forward to it. Should I prepare anything specific?",
  );

  // Save settings
  await backend.updateSettings(
    { emailAlerts: true, interviewReminders: true, newApplications: true },
    [
      {
        name: "James Park",
        role: "Recruiter",
        email: "james@gocareer.io",
        avatarUrl: "/assets/generated/candidate-4.dim_200x200.jpg",
      },
      {
        name: "Emily Torres",
        role: "HR Manager",
        email: "emily@gocareer.io",
        avatarUrl: "/assets/generated/candidate-5.dim_200x200.jpg",
      },
      {
        name: "David Kim",
        role: "Technical Recruiter",
        email: "david@gocareer.io",
        avatarUrl: "/assets/generated/candidate-2.dim_200x200.jpg",
      },
    ],
  );
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("dashboard");
  const [seeding, setSeeding] = useState(true);

  useEffect(() => {
    backend.getAllJobs().then(async (jobs) => {
      if (jobs.length === 0) {
        try {
          await seedData();
        } catch (e) {
          console.error("Seed failed:", e);
        }
      }
      setSeeding(false);
    });
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "jobs":
        return <Jobs />;
      case "candidates":
        return <Candidates />;
      case "messages":
        return <Messages />;
      case "schedule":
        return <Schedule />;
      case "settings":
        return <Settings />;
    }
  };

  if (seeding) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Loading GoCareer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <main className="flex-1 overflow-y-auto">{renderPage()}</main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
