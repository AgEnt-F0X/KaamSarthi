# KaamSarthi Product Rules

KaamSarthi is a voice-first, mobile-first employment companion that helps blue-collar workers across India create profiles, discover jobs, build resumes, and improve employability using the simplest possible user experience.

KaamSarthi is not LinkedIn, Naukri.com, Indeed, Workday, SAP, or a recruiter dashboard. It should feel closer to PhonePe, Google Pay, and Swiggy: simple, friendly, human, accessible, and trustworthy.

## Target User

- Age: 18-60
- Education: low to medium
- Technology comfort: low
- English knowledge: limited
- Income: Rs 10,000-35,000 per month
- Device: budget Android phone

Design for large buttons, short text, low typing effort, simple onboarding, and predictable bottom navigation.

## Core Product Principles

- Voice is primary. Typing is secondary.
- Say "Tell us about yourself" instead of "Fill this form".
- Local first. Cloud second.
- Profile, resume, and applications must remain available offline.
- Aadhaar is local only. Do not add government integration, Aadhaar verification APIs, or external sharing.
- The AI assistant acts like an employment counselor, not a general chatbot.
- Job discovery should show relevant jobs first, not endless unrelated lists.

## Required Navigation

Never exceed five bottom tabs. Use exactly:

- Home
- Applied Jobs
- AI Assistant
- Job Opportunities
- Language & Resume

No hamburger menu. No nested navigation.

## Data Model

Worker profile:

- Name
- Mobile
- Aadhaar
- Skills
- Experience
- Location
- Resume

Jobs:

- Title
- Company
- Salary
- Location
- Category
- Status

Applications:

- Applied
- Pending
- Interview
- Selected
- Rejected

## Success Metric

A worker should be able to open the app, create a profile, find a job, apply, and share a resume within five minutes without training.

