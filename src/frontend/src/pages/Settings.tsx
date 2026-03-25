import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { TeamMember } from "../backend";
import { backend } from "../lib/backendClient";

const defaultTeamMembers: TeamMember[] = [
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
];

export function Settings() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({
    name: "Sarah Chen",
    email: "sarah@gocareer.io",
    title: "Senior Recruiter",
    bio: "Passionate about connecting top talent with great opportunities.",
  });
  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    interviewReminders: true,
    newApplications: true,
  });
  const [team, setTeam] = useState<TeamMember[]>(defaultTeamMembers);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingNotif, setSavingNotif] = useState(false);
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "", email: "" });

  useEffect(() => {
    backend.getSettings().then((s) => {
      if (s) {
        setNotifications(s.notificationPreferences);
        if (s.teamMembers.length > 0) setTeam(s.teamMembers);
      }
      setLoading(false);
    });
  }, []);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await backend.saveCallerUserProfile({
        ...profile,
        avatarUrl: "/assets/generated/recruiter-avatar.dim_200x200.jpg",
      });
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  };

  const saveNotifications = async (updated: typeof notifications) => {
    setNotifications(updated);
    setSavingNotif(true);
    try {
      await backend.updateSettings(updated, team);
      toast.success("Notifications updated");
    } catch {
      toast.error("Failed to update notifications");
    } finally {
      setSavingNotif(false);
    }
  };

  const removeMember = async (idx: number) => {
    const updated = team.filter((_, i) => i !== idx);
    setTeam(updated);
    try {
      await backend.updateSettings(notifications, updated);
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const addMember = async () => {
    if (!newMember.name || !newMember.email) {
      toast.error("Name and email required");
      return;
    }
    const member: TeamMember = { ...newMember, avatarUrl: "" };
    const updated = [...team, member];
    setTeam(updated);
    try {
      await backend.updateSettings(notifications, updated);
      toast.success("Member added");
      setAddMemberOpen(false);
      setNewMember({ name: "", role: "", email: "" });
    } catch {
      toast.error("Failed to add member");
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-64"
        data-ocid="settings.loading_state"
      >
        <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl" data-ocid="settings.page">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-slate-800">
          Settings
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Manage your account and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" data-ocid="settings.tab">
        <TabsList className="mb-6">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent
          value="profile"
          className="bg-white rounded-xl shadow-card p-6"
        >
          <div className="flex items-center gap-5 mb-6">
            <Avatar className="w-20 h-20">
              <AvatarImage
                src="/assets/generated/recruiter-avatar.dim_200x200.jpg"
                alt="Sarah Chen"
              />
              <AvatarFallback className="bg-indigo-100 text-indigo-700 text-xl font-bold">
                SC
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-slate-800">{profile.name}</h3>
              <p className="text-slate-500 text-sm">{profile.title}</p>
            </div>
          </div>
          <Separator className="mb-5" />
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="p-name">Full Name</Label>
                <Input
                  data-ocid="settings.input"
                  id="p-name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, name: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="p-title">Title</Label>
                <Input
                  id="p-title"
                  value={profile.title}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, title: e.target.value }))
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="p-email">Email</Label>
              <Input
                id="p-email"
                type="email"
                value={profile.email}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, email: e.target.value }))
                }
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="p-bio">Bio</Label>
              <Textarea
                data-ocid="settings.textarea"
                id="p-bio"
                value={profile.bio}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, bio: e.target.value }))
                }
                className="mt-1 h-24"
              />
            </div>
            <Button
              data-ocid="settings.submit_button"
              onClick={saveProfile}
              disabled={savingProfile}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {savingProfile ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent
          value="notifications"
          className="bg-white rounded-xl shadow-card p-6"
        >
          <div className="space-y-5">
            {[
              {
                key: "emailAlerts" as const,
                label: "Email Alerts",
                desc: "Receive email notifications for important updates",
              },
              {
                key: "interviewReminders" as const,
                label: "Interview Reminders",
                desc: "Get reminded before scheduled interviews",
              },
              {
                key: "newApplications" as const,
                label: "New Applications",
                desc: "Notify when candidates apply to open positions",
              },
            ].map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between py-1">
                <div>
                  <p className="font-medium text-slate-800 text-sm">{label}</p>
                  <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                </div>
                <Switch
                  data-ocid="settings.switch"
                  checked={notifications[key]}
                  disabled={savingNotif}
                  onCheckedChange={(checked) =>
                    saveNotifications({ ...notifications, [key]: checked })
                  }
                />
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team">
          <div className="flex items-center justify-between mb-4">
            <p className="text-slate-600 text-sm">{team.length} team members</p>
            <Button
              data-ocid="settings.open_modal_button"
              onClick={() => setAddMemberOpen(true)}
              variant="outline"
              className="gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> Add Member
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {team.map((member, idx) => (
              <div
                key={member.email || String(idx)}
                data-ocid={`settings.item.${idx + 1}`}
                className="bg-white rounded-xl shadow-card p-4 flex items-center gap-4"
              >
                <Avatar className="w-12 h-12">
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback className="bg-indigo-100 text-indigo-700 font-semibold">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-800 text-sm">
                    {member.name}
                  </p>
                  <p className="text-slate-500 text-xs">{member.role}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                </div>
                <Button
                  data-ocid={`settings.delete_button.${idx + 1}`}
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMember(idx)}
                  className="text-slate-400 hover:text-red-500 h-8 w-8 p-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent data-ocid="settings.dialog">
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Full Name</Label>
              <Input
                value={newMember.name}
                onChange={(e) =>
                  setNewMember((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. Alex Smith"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Role</Label>
              <Input
                value={newMember.role}
                onChange={(e) =>
                  setNewMember((p) => ({ ...p, role: e.target.value }))
                }
                placeholder="e.g. Recruiter"
                className="mt-1"
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={newMember.email}
                onChange={(e) =>
                  setNewMember((p) => ({ ...p, email: e.target.value }))
                }
                placeholder="alex@gocareer.io"
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              data-ocid="settings.cancel_button"
              variant="outline"
              onClick={() => setAddMemberOpen(false)}
            >
              Cancel
            </Button>
            <Button
              data-ocid="settings.confirm_button"
              onClick={addMember}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
