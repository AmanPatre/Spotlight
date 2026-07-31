# Spotlight — AI-Powered Webinar Platform

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.8-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=for-the-badge&logo=postgresql)
![Stream.io](https://img.shields.io/badge/Stream.io-Video%20%26%20Chat-005FFF?style=for-the-badge)
![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)

**A full-stack, production-ready webinar platform with live streaming, AI-powered lead scoring, real-time chat, CTA banners, and automated post-webinar email reports.**

[Features](#-features) • [Architecture](#-architecture) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Environment Variables](#-environment-variables) • [Database Schema](#-database-schema) • [API Reference](#-api-reference) • [Deployment](#-deployment)

</div>

---

## Overview

Spotlight is a SaaS webinar platform that enables hosts to run live (or pre-recorded) webinars, engage audiences with real-time chat and interactive CTAs, and automatically process attendee leads using AI after the session ends. The platform integrates a full WebRTC live streaming stack, a voice AI breakout room, a payments layer, and a background processing pipeline — all built on Next.js 16 with App Router.

---

## Features

### For Hosts
- **4-step guided webinar creation** with a multi-step wizard (Zustand + Framer Motion)
- **Live streaming** via Stream.io's WebRTC SFU infrastructure (no DIY signaling)
- **Pre-recorded mode** — upload a video via UploadThing and run a simulated live session
- **OBS / RTMP ingress** — broadcast from OBS Studio instead of browser camera
- **Screen sharing** built into the live room
- **Interactive CTA banners** sent in real-time to all attendees (`BUY_NOW` or `BOOK_A_CALL`)
- **Live chat** with optional lock/unlock control
- **Waiting room management** — open standby mode before going live
- **AI-powered post-webinar email report** (Hot Leads Digest) with lead scores and VAPI call summaries

### For Attendees
- **Public registration** without requiring a user account
- **Smart waiting room** that auto-redirects when the host goes live (5s polling)
- **Real-time video playback** as a viewer-only participant
- **Live chat** during the session
- **CTA overlays** — triggered by the host, shown as banners in real-time
- **VAPI AI breakout room** — 1-on-1 voice call with an AI sales agent after clicking "Book a Call"

### AI & Automation
- **Gemini 3.1 Flash Lite** analyzes VAPI call transcripts per attendee
- **Rules-based + AI lead scoring** (scores 1–10) for every active attendee
- **Webinar-level AI summary** generated from all individual score summaries
- **Automated email dispatch** via Resend (React Email templates)
- **Inngest background pipeline** handles all post-webinar processing without timeout constraints

### Payments
- **Razorpay integration** for Pro plan subscriptions
- **Coupon code system** configurable per webinar
- **Pro pass gating** — only Pro users can create webinars

---

## Architecture

### System Overview

```mermaid
graph TB
    subgraph Client["Browser (Client)"]
        H["Host App<br/>(Clerk Auth)"]
        A["Attendee App<br/>(Public)"]
    end

    subgraph NextJS["Next.js 16 (App Router)"]
        SA["Server Actions"]
        API["API Routes"]
        MW["Middleware<br/>(Clerk)"]
    end

    subgraph DB["Data Layer"]
        PG["PostgreSQL<br/>(Neon Serverless)"]
        PR["Prisma ORM"]
    end

    subgraph Streaming["Real-Time Layer"]
        SV["Stream Video<br/>(WebRTC SFU)"]
        SC["Stream Chat"]
    end

    subgraph AI["AI & Background"]
        INN["Inngest<br/>(Job Queue)"]
        GEM["Google Gemini<br/>(AI SDK)"]
        VAPI["VAPI<br/>(Voice AI)"]
    end

    subgraph External["External Services"]
        CLK["Clerk<br/>(Auth)"]
        RES["Resend<br/>(Email)"]
        RZP["Razorpay<br/>(Payments)"]
        UT["UploadThing<br/>(Video Storage)"]
    end

    H --> MW --> SA --> PR --> PG
    A --> API --> PR --> PG
    H --> SV
    A --> SV
    H --> SC
    A --> SC
    SA --> INN --> GEM
    INN --> VAPI
    INN --> RES
    H --> CLK
    H --> RZP
    H --> UT
```

---

### Webinar Lifecycle (State Machine)

```mermaid
stateDiagram-v2
    [*] --> SCHEDULED: Host creates webinar
    SCHEDULED --> WAITING_ROOM: Host opens waiting room
    WAITING_ROOM --> LIVE: Host enters live room\n+ call.goLive()
    LIVE --> ENDED: Host ends stream\n+ Inngest pipeline fires
    SCHEDULED --> CANCELLED: Host cancels
    WAITING_ROOM --> CANCELLED: Host cancels
    ENDED --> [*]
    CANCELLED --> [*]
```

---

### Live Streaming Architecture

```mermaid
flowchart TB
    subgraph Host["Host (Clerk Auth)"]
        H1["/webinars/id — Detail Page"]
        H2["Open Waiting Room / Go Live"]
        H3["/webinars/id/live — Live Room"]
        H4["LiveRoomClient\n+ HostStreamView"]
    end

    subgraph DB["PostgreSQL (Prisma)"]
        W["Webinar.webinarStatus"]
        ATT["Attendance records"]
    end

    subgraph StreamCloud["Stream.io Cloud"]
        C["Call type: livestream\nCall ID = webinarId"]
        V["WebRTC SFU\n(Media Distribution)"]
        CH["Stream Chat Channel"]
    end

    subgraph Attendee["Attendee (Public)"]
        P1["/webinar/id — Register"]
        P2["WaitingRoom\n(polls every 5s)"]
        P3["/webinar/id/live — Watch"]
        P4["AttendeeStreamView"]
    end

    subgraph TokenAPI["Next.js API Routes"]
        T1["GET /api/stream-token\n(Clerk-signed JWT)"]
        T2["POST /api/attendee-stream-token\n(Attendee JWT)"]
    end

    H1 --> H2 --> W
    H2 --> H3 --> T1 --> C
    H4 --> V
    H4 --> CH

    P1 --> ATT
    P1 --> P2
    P2 -->|"poll getWebinarStatus"| W
    P2 -->|"status = LIVE"| P3
    P3 --> T2 --> C
    P4 --> V
    P4 --> CH
```

> **Key insight:** `webinarId` (UUID in PostgreSQL) **is also** the Stream **call ID**. One webinar = one `livestream` call in Stream.io.

---

### Post-Webinar AI Pipeline (Inngest)

```mermaid
sequenceDiagram
    participant Host
    participant DB as PostgreSQL
    participant Inngest
    participant VAPI as VAPI API
    participant Gemini as Google Gemini
    participant Email as Resend

    Host->>DB: updateWebinarStatus(ENDED)
    DB-->>Host: endTime logged
    Host->>Inngest: inngest.send("app/webinar.ended")
    Note over Inngest: Job queued asynchronously

    Inngest->>DB: fetch active attendances
    DB-->>Inngest: attendance list

    alt Webinar is BOOK_A_CALL type
        Inngest->>Inngest: step.sleep("5min")\nWait for VAPI transcripts
    end

    loop For each active attendee
        Inngest->>VAPI: GET /call?assistantId=...
        VAPI-->>Inngest: call transcript
        Inngest->>Gemini: Analyze transcript\n→ { score, summary }
        Gemini-->>Inngest: { score: 8, summary: "..." }
        Inngest->>DB: upsert CallDebrief
    end

    Inngest->>Gemini: Generate overall audience summary
    Gemini-->>Inngest: overallSummary
    Inngest->>DB: update Webinar.summary

    Inngest->>Email: Send HotLeadsDigest email
    Email-->>Host: Webinar Report (inbox)
```

---

### Token Authentication Flow

```mermaid
sequenceDiagram
    participant Browser
    participant NextAPI as Next.js API
    participant Clerk
    participant Stream as Stream.io

    alt Host Token
        Browser->>NextAPI: GET /api/stream-token\n(with Clerk session cookie)
        NextAPI->>Clerk: currentUser()
        Clerk-->>NextAPI: user.id
        NextAPI->>NextAPI: StreamClient.generateUserToken(user.id)
        NextAPI-->>Browser: { token }
    else Attendee Token
        Browser->>NextAPI: POST /api/attendee-stream-token\n{ attendeeId }
        NextAPI->>NextAPI: StreamClient.generateUserToken(attendeeId)
        NextAPI-->>Browser: { token }
    end

    Browser->>Stream: connect(apiKey, token)
    Stream-->>Browser: WebRTC session established
```

---

### CTA Real-Time Event Flow

```mermaid
sequenceDiagram
    participant Host
    participant Stream as Stream.io\n(Custom Events)
    participant Attendee1
    participant Attendee2

    Host->>Stream: call.sendCustomEvent({ type: "CTA_TRIGGERED",\nctaType: "BUY_NOW", ctaMetadata: {...} })
    Stream-->>Attendee1: custom event received
    Stream-->>Attendee2: custom event received
    Attendee1->>Attendee1: Show CTABanner overlay
    Attendee2->>Attendee2: Show CTABanner overlay
```

---

### Webinar Creation Flow

```mermaid
flowchart TD
    A["User clicks 'Create Webinar'"] --> B["Dialog opens\n(CreateWebinarButton/index.tsx)"]
    B --> C["MultiStepForm.tsx\n(Step controller)"]
    C --> D["Step 1: BasicInfoStep\nName, Date, Time, Video"]
    D -->|"Validate via Zustand"| E["Step 2: CTAStep\nLabel, Tags, CTA Type, AI Agent"]
    E -->|"Validate"| F["Step 3: ProductInfoStep\nProduct, Price, Currency"]
    F -->|"Validate"| G["Step 4: AdditionalInfoStep\nLock Chat, Coupon Code"]
    G -->|"Submit"| H["createWebinar()\nServer Action"]
    H --> I{{"Auth Check\n(Clerk)"}}
    I --> J{{"Pro Plan Gate"}}
    J --> K["Prisma: webinar.create()"]
    K --> L["revalidatePath('/')"]
    L --> M["Success Screen\nShareable Link Generated"]
```

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Framework** | Next.js 16.2 (App Router) | Full-stack React, Server Actions, API Routes |
| **Language** | TypeScript 5 | End-to-end type safety |
| **Auth** | Clerk | Authentication, session management |
| **Database** | PostgreSQL via Neon (Serverless) | Primary data store |
| **ORM** | Prisma 7.8 | Type-safe DB queries, migrations |
| **Styling** | Tailwind CSS 4 + shadcn/ui | UI component library |
| **Animations** | Framer Motion | Step transitions, micro-animations |
| **Live Video** | Stream.io Video SDK | WebRTC SFU, livestream call management |
| **Live Chat** | Stream Chat SDK | Real-time text messaging |
| **Voice AI** | VAPI | AI-powered 1-on-1 voice breakout rooms |
| **AI Models** | Google Gemini 3.1 Flash Lite | Transcript analysis, lead scoring, summaries |
| **AI SDK** | Vercel AI SDK (`ai`) | Structured object generation from LLMs |
| **Background Jobs** | Inngest | Durable, retryable post-webinar pipeline |
| **Email** | Resend + React Email | Transactional HTML emails as React components |
| **Payments** | Razorpay | Pro plan subscriptions |
| **File Uploads** | UploadThing | Pre-recorded video hosting |
| **State Management** | Zustand | Global webinar creation form state |
| **Validation** | Zod | Schema validation (AI outputs + forms) |

---

## Project Structure

```
webinaar-platform/
├── prisma/
│   ├── schema.prisma           # Database models & enums
│   └── migrations/             # DB migration history
│
├── src/
│   ├── app/
│   │   ├── (auth)/             # Sign-in / Sign-up pages (Clerk)
│   │   ├── (protectedRoutes)/  # Host-only routes
│   │   │   ├── webinars/
│   │   │   │   ├── page.tsx                     # /webinars dashboard
│   │   │   │   └── [webinarid]/
│   │   │   │       ├── page.tsx                 # Webinar detail + status controls
│   │   │   │       └── live/
│   │   │   │           └── page.tsx             # Host live room
│   │   │   └── callback/                        # Auth callback handler
│   │   │
│   │   ├── webinar/            # Public attendee routes
│   │   │   └── [webinarid]/
│   │   │       ├── page.tsx                     # Registration + Waiting Room
│   │   │       ├── live/page.tsx                # Attendee live view
│   │   │       └── call/page.tsx                # VAPI AI breakout room
│   │   │
│   │   ├── api/
│   │   │   ├── stream-token/   # Host Stream JWT
│   │   │   ├── attendee-stream-token/  # Attendee Stream JWT
│   │   │   ├── inngest/        # Inngest webhook handler
│   │   │   ├── razorpay/       # Payment webhooks + order creation
│   │   │   └── uploadthing/    # UploadThing file router
│   │   │
│   │   ├── globals.css
│   │   ├── layout.tsx          # Root layout (Clerk + Providers)
│   │   └── page.tsx            # Landing page
│   │
│   ├── actions/                # Next.js Server Actions ("use server")
│   │   ├── auth.ts             # onAuthenticateUser (Clerk → DB User)
│   │   ├── webinar.ts          # createWebinar, updateWebinarStatus, getWebinarStatus
│   │   ├── attendence.ts       # registerAttendee, updateAttendanceStatus
│   │   └── vapi.ts             # getVapiAssistants
│   │
│   ├── components/
│   │   ├── ui/                 # shadcn/ui base components
│   │   └── ui/ReusableComponent/
│   │       └── CreateWebinarButton/
│   │           ├── index.tsx           # Dialog shell + success screen
│   │           ├── MultiStepForm.tsx   # Step controller + submit logic
│   │           ├── BasicInfoStep.tsx   # Step 1
│   │           ├── CTAStep.tsx         # Step 2
│   │           ├── ProductInfoStep.tsx # Step 3
│   │           └── AdditionalInfoStep.tsx # Step 4
│   │
│   ├── inngest/
│   │   ├── client.ts           # Inngest client instance
│   │   └── functions.ts        # processWebinarEnd (the AI pipeline)
│   │
│   ├── emails/
│   │   └── HotLeadsDigest.tsx  # React Email template for post-webinar report
│   │
│   ├── lib/
│   │   ├── prismaClient.ts     # Singleton Prisma client (Neon adapter)
│   │   └── type.ts             # Form validation logic (per step)
│   │
│   ├── store/
│   │   └── useWebinarStore.ts  # Zustand global store for webinar creation
│   │
│   └── providers/
│       └── index.tsx           # ThemeProvider, Toaster wrappers
│
├── public/                     # Static assets
├── .env                        # Environment variables (see below)
├── next.config.ts
├── prisma.config.ts
└── package.json
```

---

## Database Schema

```mermaid
erDiagram
    User {
        UUID id PK
        String name
        String clerkId UK
        String email UK
        Boolean isPro
        DateTime proExpiresAt
        String razorpayAccountId
    }

    Webinar {
        UUID id PK
        String title
        String description
        DateTime startTime
        DateTime endTime
        WebinarStatusEnum webinarStatus
        UUID presenterId FK
        CtaTypeEnum ctaType
        String ctaLabel
        Boolean couponEnabled
        String couponCode
        Boolean lockChat
        UUID aiAgentId
        Float price
        String currency
        Boolean isPreRecorded
        String videoUrl
        String summary
    }

    Attendee {
        UUID id PK
        String email UK
        String name
        CallStatusEnum callStatus
    }

    Attendance {
        UUID id PK
        UUID webinarId FK
        UUID attendeeId FK
        AttendedTypeEnum attendedType
        Int watchTime
        DateTime joinedAt
        DateTime leftAt
    }

    CallDebrief {
        UUID id PK
        UUID attendanceId FK
        Int score
        String summary
        Boolean isHotLead
    }

    ProcessedWebhook {
        String id PK
        String eventId UK
    }

    User ||--o{ Webinar : "presents"
    Webinar ||--o{ Attendance : "has"
    Attendee ||--o{ Attendance : "makes"
    Attendance ||--o| CallDebrief : "scored by"
```

### Enums

| Enum | Values |
|------|--------|
| `WebinarStatusEnum` | `SCHEDULED`, `WAITING_ROOM`, `LIVE`, `ENDED`, `CANCELLED` |
| `CtaTypeEnum` | `BUY_NOW`, `BOOK_A_CALL` |
| `AttendedTypeEnum` | `REGISTERED`, `ATTENDED`, `ADDED_TO_CART`, `FOLLOW_UP`, `BREAKOUT_ROOM`, `CONVERTED` |
| `CallStatusEnum` | `PENDING`, `InProgress`, `COMPLETED` |

---

## Getting Started

### Prerequisites

- Node.js `>= 18`
- PostgreSQL database (recommended: [Neon](https://neon.tech/) for serverless)
- Accounts for: [Clerk](https://clerk.dev), [Stream.io](https://getstream.io), [VAPI](https://vapi.ai), [Inngest](https://inngest.com), [Resend](https://resend.com), [Razorpay](https://razorpay.com), [UploadThing](https://uploadthing.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-username/webinaar-platform.git
cd webinaar-platform

# 2. Install dependencies (also runs prisma generate via postinstall)
npm install

# 3. Copy and fill environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Run database migrations
npx prisma migrate deploy

# 5. Start the Inngest dev server (in a separate terminal)
npx inngest-cli@latest dev

# 6. Start the Next.js dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## Environment Variables

Create a `.env` file in the root directory with the following keys:

```env
# ─── Database ────────────────────────────────────────────────────────────────
DATABASE_URL="postgresql://..."           # Neon / any PostgreSQL connection string

# ─── Application ─────────────────────────────────────────────────────────────
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# ─── Clerk (Authentication) ──────────────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/callback
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/callback

# ─── Stream.io (Live Video + Chat) ────────────────────────────────────────────
NEXT_PUBLIC_STREAM_API_KEY=...           # Public (used browser-side)
STREAM_SECRET_KEY=...                    # Secret (server-only, never expose)

# ─── VAPI (Voice AI) ─────────────────────────────────────────────────────────
VAPI_API_KEY=...                         # Server-side VAPI calls
NEXT_PUBLIC_VAPI_PUBLIC_KEY=...          # Browser-side VAPI SDK

# ─── Razorpay (Payments) ─────────────────────────────────────────────────────
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_ID=rzp_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...              # Set this in Razorpay dashboard too

# ─── Resend (Email) ──────────────────────────────────────────────────────────
RESEND_API_KEY=re_...

# ─── Google Gemini (AI) ──────────────────────────────────────────────────────
GOOGLE_GENERATIVE_AI_API_KEY=...

# ─── Inngest (Background Jobs) ───────────────────────────────────────────────
INNGEST_EVENT_KEY=local                  # Use "local" for development
INNGEST_DEV=1                            # Remove in production
INNGEST_BASE_URL=http://localhost:8288   # Remove in production

# ─── UploadThing (Video Uploads) ─────────────────────────────────────────────
UPLOADTHING_TOKEN=...
UPLOADTHING_SECRET=...
```

> **Never commit `.env` to version control.** Add it to `.gitignore`.

---

## API Reference

### Stream Token Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/stream-token` | `GET` | Clerk session | Returns a signed Stream JWT for the authenticated host |
| `/api/attendee-stream-token` | `POST` | None (public) | Returns a signed Stream JWT for an attendee given `{ attendeeId }` |

### Inngest Webhook

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/inngest` | `GET, POST, PUT` | Inngest cloud communication endpoint |

### Razorpay

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/razorpay/create-order` | `POST` | Creates a Razorpay order for Pro subscription |
| `/api/razorpay/webhook` | `POST` | Handles payment confirmation webhook (idempotent) |

### UploadThing

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/uploadthing` | `GET, POST` | File router for pre-recorded video uploads |

---

## Key Flows Explained

### 1. Webinar Lifecycle

| Action | DB Status | Stream Call Exists? | Attendees See Video? |
|--------|-----------|---------------------|----------------------|
| Webinar Created | `SCHEDULED` | No | Registration + countdown |
| Host Opens Waiting Room | `WAITING_ROOM` | No | Standby UI (polling) |
| Host Enters Live Room | `LIVE` (auto) | Yes | Yes, after host `goLive()` |
| Host Clicks End Stream | `ENDED` | Disconnected | Session ended screen |

### 2. Lead Scoring System

After a webinar ends, each active attendee gets a score (1–10):

| Score | Condition |
|-------|-----------|
| **10** | Converted (payment verified) |
| **8** | Cart abandoned (clicked BUY_NOW but didn't pay) |
| **8** | Clicked BOOK_A_CALL CTA but didn't join breakout |
| **5** | Stayed ≥ 70% of the webinar duration |
| **AI-scored** | Joined VAPI breakout room (Gemini analyzes transcript) |
| **2** | Left early, no significant action |

### 3. Two-Channel Real-Time Architecture

| Channel | Technology | Purpose |
|---------|-----------|---------|
| **Video/Audio** | Stream Video SDK (`livestream` call) | Host broadcast → viewer playback |
| **Text Chat** | Stream Chat SDK (`livestream` channel) | Bidirectional messaging |
| **CTA Events** | Stream custom events on the call | Instant banner delivery to all attendees |
| **Voice AI** | VAPI + Daily.co (separate from Stream) | 1-on-1 AI sales calls in `/webinar/[id]/call` |

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| Attendee: "Call not found" | Host hasn't entered `/webinars/{id}/live` yet | Retry logic handles this automatically (5 retries) |
| Attendee: "Failed to get stream token" | Missing env vars | Check `NEXT_PUBLIC_STREAM_API_KEY` and `STREAM_SECRET_KEY` |
| Host: 401 on `/api/stream-token` | Not signed in to Clerk | Sign in first |
| Video works, chat doesn't | Chat client init failed separately | Check `HostChatPanel` / `AttendeeChatPanel` console errors |
| CTA doesn't appear on attendee side | `call.on("custom")` not registered | Check attendee `useEffect` depending on `call` object |
| DB shows `LIVE` but no video | Host left tab without ending properly | `updateWebinarStatus(ENDED)` and re-open the live room |
| Inngest function not triggering | `INNGEST_DEV=1` not set / Inngest dev server not running | Run `npx inngest-cli dev` in a terminal |
| Post-webinar email not received | Resend API key invalid or Inngest pipeline errored | Check Inngest dashboard for function logs |

---

## Deployment

### Recommended: Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Important production notes:**
1. Remove `INNGEST_DEV=1` and `INNGEST_BASE_URL` from production env vars
2. Set `INNGEST_EVENT_KEY` to a production key from the [Inngest dashboard](https://app.inngest.com)
3. Register your production Inngest endpoint: `https://your-domain.com/api/inngest`
4. Set `NEXT_PUBLIC_BASE_URL` to your production domain
5. Update Clerk's allowed redirect URLs in the Clerk dashboard
6. Update Razorpay webhook URL to `https://your-domain.com/api/razorpay/webhook`

### Database Migrations in Production

```bash
npx prisma migrate deploy
```

---

## Scripts

| Script | Command | Description |
|--------|---------|-------------|
| Dev server | `npm run dev` | Starts Next.js dev server on port 3000 |
| Build | `npm run build` | Builds the production bundle |
| Start | `npm run start` | Starts the production server |
| Lint | `npm run lint` | Runs ESLint |
| DB Client | `npx prisma studio` | Opens Prisma Studio (DB GUI) |
| DB Migrate | `npx prisma migrate dev` | Runs migrations in development |
| Inngest Dev | `npx inngest-cli dev` | Starts local Inngest dev server on port 8288 |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "feat: add my feature"`
4. Push the branch: `git push origin feature/my-feature`
5. Open a Pull Request

Please follow the existing code style (TypeScript strict mode, Server Actions for mutations, Prisma for all DB access).

---

## License

This project is private and proprietary.

---

<div align="center">
Built with Next.js, Stream.io, VAPI, Google Gemini, and Inngest.
</div>
