import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Settings {
    notificationPreferences: NotificationPreferences;
    teamMembers: Array<TeamMember>;
}
export interface NotificationPreferences {
    emailAlerts: boolean;
    interviewReminders: boolean;
    newApplications: boolean;
}
export type Time = bigint;
export interface Job {
    id: bigint;
    status: Variant_closed_open_draft;
    title: string;
    postedDate: Time;
    description: string;
    salaryMax: bigint;
    salaryMin: bigint;
    location: string;
}
export interface Interview {
    id: bigint;
    status: Variant_scheduled_cancelled_completed;
    jobId: bigint;
    interviewType: Variant_video_phone_onSite;
    notes: string;
    candidateId: bigint;
    datetime: Time;
}
export interface Candidate {
    id: bigint;
    appliedJobId: bigint;
    name: string;
    email: string;
    stage: Variant_hired_offer_screening_interview_applied;
    appliedDate: Time;
    notes: Array<Note>;
    phone: string;
}
export interface TeamMember {
    name: string;
    role: string;
    email: string;
    avatarUrl: string;
}
export interface Message {
    text: string;
    timestamp: Time;
    senderRole: Variant_recruiter_candidate;
}
export interface Conversation {
    messages: Array<Message>;
    candidateId: bigint;
}
export interface UserProfile {
    bio: string;
    title: string;
    name: string;
    email: string;
    avatarUrl: string;
}
export interface Note {
    text: string;
    author: string;
    timestamp: Time;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_closed_open_draft {
    closed = "closed",
    open = "open",
    draft = "draft"
}
export enum Variant_hired_offer_screening_interview_applied {
    hired = "hired",
    offer = "offer",
    screening = "screening",
    interview = "interview",
    applied = "applied"
}
export enum Variant_recruiter_candidate {
    recruiter = "recruiter",
    candidate = "candidate"
}
export enum Variant_scheduled_cancelled_completed {
    scheduled = "scheduled",
    cancelled = "cancelled",
    completed = "completed"
}
export enum Variant_video_phone_onSite {
    video = "video",
    phone = "phone",
    onSite = "onSite"
}
export interface backendInterface {
    addMessage(candidateId: bigint, senderRole: Variant_recruiter_candidate, text: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelInterview(id: bigint): Promise<void>;
    createCandidate(name: string, email: string, phone: string, appliedJobId: bigint, stage: Variant_hired_offer_screening_interview_applied, notes: Array<Note>, appliedDate: Time): Promise<bigint>;
    createConversation(candidateId: bigint): Promise<void>;
    createJob(title: string, location: string, salaryMin: bigint, salaryMax: bigint, status: Variant_closed_open_draft, description: string): Promise<bigint>;
    deleteCandidate(id: bigint): Promise<void>;
    deleteJob(id: bigint): Promise<void>;
    getAllCandidates(): Promise<Array<Candidate>>;
    getAllConversations(): Promise<Array<Conversation>>;
    getAllInterviews(): Promise<Array<Interview>>;
    getAllJobs(): Promise<Array<Job>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCandidate(id: bigint): Promise<Candidate | null>;
    getConversation(candidateId: bigint): Promise<Conversation | null>;
    getInterview(id: bigint): Promise<Interview | null>;
    getInterviewsByCandidate(candidateId: bigint): Promise<Array<Interview>>;
    getJob(id: bigint): Promise<Job | null>;
    getSettings(): Promise<Settings | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    scheduleInterview(candidateId: bigint, jobId: bigint, interviewType: Variant_video_phone_onSite, notes: string): Promise<bigint>;
    updateCandidate(id: bigint, name: string, email: string, phone: string, appliedJobId: bigint, notes: Array<Note>): Promise<void>;
    updateCandidateStage(id: bigint, newStage: Variant_hired_offer_screening_interview_applied): Promise<void>;
    updateInterview(id: bigint, candidateId: bigint, jobId: bigint, interviewType: Variant_video_phone_onSite, notes: string, status: Variant_scheduled_cancelled_completed): Promise<void>;
    updateJob(id: bigint, title: string, location: string, salaryMin: bigint, salaryMax: bigint, status: Variant_closed_open_draft, description: string): Promise<void>;
    updateSettings(notificationPreferences: NotificationPreferences, teamMembers: Array<TeamMember>): Promise<void>;
}
