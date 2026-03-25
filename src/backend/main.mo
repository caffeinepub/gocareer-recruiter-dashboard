import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Array "mo:core/Array";
import List "mo:core/List";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Order "mo:core/Order";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Access control state
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type (required by frontend)
  public type UserProfile = {
    name : Text;
    email : Text;
    title : Text;
    bio : Text;
    avatarUrl : Text;
  };

  // Types
  type Note = {
    author : Text;
    text : Text;
    timestamp : Time.Time;
  };

  type Candidate = {
    id : Nat;
    name : Text;
    email : Text;
    phone : Text;
    appliedJobId : Nat;
    stage : {
      #applied;
      #screening;
      #interview;
      #offer;
      #hired;
    };
    notes : [Note];
    appliedDate : Time.Time;
  };

  module Candidate {
    public func compare(candidate1 : Candidate, candidate2 : Candidate) : Order.Order {
      Nat.compare(candidate1.id, candidate2.id);
    };
  };

  // Jobs
  type Job = {
    id : Nat;
    title : Text;
    location : Text;
    salaryMin : Nat;
    salaryMax : Nat;
    status : {
      #open;
      #closed;
      #draft;
    };
    description : Text;
    postedDate : Time.Time;
  };

  module Job {
    public func compare(job1 : Job, job2 : Job) : Order.Order {
      Nat.compare(job1.id, job2.id);
    };
  };

  // Message
  type Message = {
    senderRole : {
      #recruiter;
      #candidate;
    };
    text : Text;
    timestamp : Time.Time;
  };

  // Conversation
  type Conversation = {
    candidateId : Nat;
    messages : [Message];
  };

  module Conversation {
    public func compare(conversation1 : Conversation, conversation2 : Conversation) : Order.Order {
      Nat.compare(conversation1.candidateId, conversation2.candidateId);
    };
  };

  // Interview
  type Interview = {
    id : Nat;
    candidateId : Nat;
    jobId : Nat;
    datetime : Time.Time;
    interviewType : {
      #phone;
      #video;
      #onSite;
    };
    notes : Text;
    status : {
      #scheduled;
      #completed;
      #cancelled;
    };
  };

  module Interview {
    public func compare(interview1 : Interview, interview2 : Interview) : Order.Order {
      Nat.compare(interview1.id, interview2.id);
    };
  };

  // Notification Preferences
  type NotificationPreferences = {
    emailAlerts : Bool;
    interviewReminders : Bool;
    newApplications : Bool;
  };

  // Team Member
  type TeamMember = {
    name : Text;
    role : Text;
    email : Text;
    avatarUrl : Text;
  };

  // Settings (per-user)
  type Settings = {
    notificationPreferences : NotificationPreferences;
    teamMembers : [TeamMember];
  };

  // State
  var nextJobId = 1;
  var nextCandidateId = 1;
  var nextInterviewId = 1;

  let jobs = Map.empty<Nat, Job>();
  let candidates = Map.empty<Nat, Candidate>();
  let conversations = Map.empty<Nat, Conversation>();
  let interviews = Map.empty<Nat, Interview>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let userSettings = Map.empty<Principal, Settings>();

  // User Profile Management (required by frontend)
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Jobs CRUD
  public shared ({ caller }) func createJob(title : Text, location : Text, salaryMin : Nat, salaryMax : Nat, status : { #open; #closed; #draft }, description : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create jobs");
    };
    let id = nextJobId;
    let job : Job = {
      id;
      title;
      location;
      salaryMin;
      salaryMax;
      status;
      description;
      postedDate = Time.now();
    };
    jobs.add(id, job);
    nextJobId += 1;
    id;
  };

  public query ({ caller }) func getJob(id : Nat) : async ?Job {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view jobs");
    };
    jobs.get(id);
  };

  public shared ({ caller }) func updateJob(id : Nat, title : Text, location : Text, salaryMin : Nat, salaryMax : Nat, status : { #open; #closed; #draft }, description : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update jobs");
    };
    switch (jobs.get(id)) {
      case (null) { Runtime.trap("Job not found") };
      case (?_) {
        let updatedJob : Job = {
          id;
          title;
          location;
          salaryMin;
          salaryMax;
          status;
          description;
          postedDate = Time.now();
        };
        jobs.add(id, updatedJob);
      };
    };
  };

  public shared ({ caller }) func deleteJob(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete jobs");
    };
    if (not jobs.containsKey(id)) {
      Runtime.trap("Job not found");
    };
    jobs.remove(id);
  };

  public query ({ caller }) func getAllJobs() : async [Job] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view jobs");
    };
    jobs.values().toArray().sort();
  };

  // Candidates CRUD
  public shared ({ caller }) func createCandidate(name : Text, email : Text, phone : Text, appliedJobId : Nat, stage : { #applied; #screening; #interview; #offer; #hired }, notes : [Note], appliedDate : Time.Time) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create candidates");
    };
    let id = nextCandidateId;
    let candidate : Candidate = {
      id;
      name;
      email;
      phone;
      appliedJobId;
      stage;
      notes;
      appliedDate = Time.now();
    };
    candidates.add(id, candidate);
    nextCandidateId += 1;
    id;
  };

  public query ({ caller }) func getCandidate(id : Nat) : async ?Candidate {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view candidates");
    };
    candidates.get(id);
  };

  public shared ({ caller }) func updateCandidate(id : Nat, name : Text, email : Text, phone : Text, appliedJobId : Nat, notes : [Note]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update candidates");
    };
    switch (candidates.get(id)) {
      case (null) { Runtime.trap("Candidate not found") };
      case (?existingCandidate) {
        let updatedCandidate : Candidate = {
          id;
          name;
          email;
          phone;
          appliedJobId;
          stage = existingCandidate.stage;
          notes;
          appliedDate = existingCandidate.appliedDate;
        };
        candidates.add(id, updatedCandidate);
      };
    };
  };

  public shared ({ caller }) func deleteCandidate(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete candidates");
    };
    if (not candidates.containsKey(id)) {
      Runtime.trap("Candidate not found");
    };
    candidates.remove(id);
  };

  public query ({ caller }) func getAllCandidates() : async [Candidate] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view candidates");
    };
    candidates.values().toArray().sort();
  };

  public shared ({ caller }) func updateCandidateStage(id : Nat, newStage : { #applied; #screening; #interview; #offer; #hired }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update candidate stage");
    };
    switch (candidates.get(id)) {
      case (null) { Runtime.trap("Candidate not found") };
      case (?existingCandidate) {
        let updatedCandidate : Candidate = {
          id = existingCandidate.id;
          name = existingCandidate.name;
          email = existingCandidate.email;
          phone = existingCandidate.phone;
          appliedJobId = existingCandidate.appliedJobId;
          stage = newStage;
          notes = existingCandidate.notes;
          appliedDate = existingCandidate.appliedDate;
        };
        candidates.add(id, updatedCandidate);
      };
    };
  };

  // Conversations & Messages CRUD
  public shared ({ caller }) func createConversation(candidateId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create conversations");
    };
    if (not candidates.containsKey(candidateId)) {
      Runtime.trap("Candidate not found for conversation");
    };
    let conversation : Conversation = {
      candidateId;
      messages = [];
    };
    conversations.add(candidateId, conversation);
  };

  public query ({ caller }) func getConversation(candidateId : Nat) : async ?Conversation {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };
    conversations.get(candidateId);
  };

  public shared ({ caller }) func addMessage(candidateId : Nat, senderRole : { #recruiter; #candidate }, text : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add messages");
    };
    switch (conversations.get(candidateId)) {
      case (null) { Runtime.trap("Conversation not found") };
      case (?existingConversation) {
        let message : Message = {
          senderRole;
          text;
          timestamp = Time.now();
        };
        let updatedConversation : Conversation = {
          candidateId = existingConversation.candidateId;
          messages = existingConversation.messages.concat([message]);
        };
        conversations.add(candidateId, updatedConversation);
      };
    };
  };

  public query ({ caller }) func getAllConversations() : async [Conversation] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view conversations");
    };
    conversations.values().toArray().sort();
  };

  // Interviews CRUD
  public shared ({ caller }) func scheduleInterview(candidateId : Nat, jobId : Nat, interviewType : { #phone; #video; #onSite }, notes : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can schedule interviews");
    };
    if (not candidates.containsKey(candidateId)) {
      Runtime.trap("Candidate not found for interview");
    };
    let interviewId = nextInterviewId;
    let interview : Interview = {
      id = interviewId;
      candidateId;
      jobId;
      datetime = Time.now();
      interviewType;
      notes;
      status = #scheduled;
    };
    interviews.add(interviewId, interview);
    nextInterviewId += 1;
    interviewId;
  };

  public query ({ caller }) func getInterview(id : Nat) : async ?Interview {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view interviews");
    };
    interviews.get(id);
  };

  public shared ({ caller }) func updateInterview(id : Nat, candidateId : Nat, jobId : Nat, interviewType : { #phone; #video; #onSite }, notes : Text, status : { #scheduled; #completed; #cancelled }) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update interviews");
    };
    switch (interviews.get(id)) {
      case (null) { Runtime.trap("Interview not found") };
      case (?existingInterview) {
        let updatedInterview : Interview = {
          id;
          candidateId;
          jobId;
          datetime = Time.now();
          interviewType;
          notes;
          status;
        };
        interviews.add(id, updatedInterview);
      };
    };
  };

  public shared ({ caller }) func cancelInterview(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel interviews");
    };
    switch (interviews.get(id)) {
      case (null) { Runtime.trap("Interview not found") };
      case (?existingInterview) {
        let updatedInterview : Interview = {
          id = existingInterview.id;
          candidateId = existingInterview.candidateId;
          jobId = existingInterview.jobId;
          datetime = existingInterview.datetime;
          interviewType = existingInterview.interviewType;
          notes = existingInterview.notes;
          status = #cancelled;
        };
        interviews.add(id, updatedInterview);
      };
    };
  };

  public query ({ caller }) func getAllInterviews() : async [Interview] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view interviews");
    };
    interviews.values().toArray().sort();
  };

  public query ({ caller }) func getInterviewsByCandidate(candidateId : Nat) : async [Interview] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view interviews");
    };
    interviews.values().toArray().filter(func(i) { i.candidateId == candidateId });
  };

  // Settings (per-user)
  public shared ({ caller }) func updateSettings(notificationPreferences : NotificationPreferences, teamMembers : [TeamMember]) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update settings");
    };
    let settings : Settings = {
      notificationPreferences;
      teamMembers;
    };
    userSettings.add(caller, settings);
  };

  public query ({ caller }) func getSettings() : async ?Settings {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view settings");
    };
    userSettings.get(caller);
  };
};
