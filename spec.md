# GoCareer Recruiter Dashboard

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- Full recruiter dashboard application with 6 main sections
- Navigation sidebar with links to all sections
- Dashboard overview page with stats and activity
- Jobs management page (create, edit, delete job listings)
- Candidates Kanban board with drag-and-drop pipeline stages
- Messages inbox with conversation thread UI
- Schedule page with calendar and interview time slots
- Settings page with profile, notifications, team members
- Real photo avatars for candidates and team members

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan

### Backend (Motoko)
- Job type: id, title, location, salaryRange, status, description, postedDate
- Candidate type: id, name, photoUrl, role, appliedFor, stage (Applied/Screening/Interview/Offer/Hired), notes, appliedDate, email, phone
- Message/Conversation types: conversationId, candidateId, messages array with sender/text/timestamp
- Interview/ScheduleEvent type: id, candidateId, jobId, datetime, type, notes
- Settings type: profile info, notification preferences, team members
- CRUD operations for all entities
- Move candidate between Kanban stages

### Frontend
- Sidebar navigation with GoCareer branding
- Dashboard: stat cards (open jobs, active candidates, upcoming interviews, recent hires), recent activity feed
- Jobs: searchable/filterable table, create/edit modal with all fields
- Candidates: Kanban board with 5 columns (Applied, Screening, Interview, Offer, Hired), candidate cards with photo + name + role, drag between columns, click to open profile with notes
- Messages: left panel conversation list with avatars, right panel message thread
- Schedule: monthly/weekly calendar view, interview slots shown as events, click to create new interview
- Settings: tabs for Profile, Notifications, Team Members (each with real photos)
- All candidate and team member avatars use generated realistic headshot images
