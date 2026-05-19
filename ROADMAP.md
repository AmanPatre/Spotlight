# 🔦 Spotlight — Detailed Build Plan (Resume Edition)
**Status:** Stripe skipped. Goal = working deployed demo in ~10 hours.

---

## ✅ Already Done (Don't Redo)
- Next.js 15 + Tailwind + Shadcn setup
- Clerk auth + `onAuthenticateUser()`
- Prisma schema (User, Webinar, Attendance, Attendee)
- Neon PostgreSQL connected
- Create Webinar multi-step form + `createWebinar()` action
- Webinars list page `/webinars` + WebinarCard
- Pipeline page `/webinars/[id]/pipeline` + `getWebinarAttendence()`
- Settings page (Stripe Connect UI — leave as-is for now)
- Home dashboard page

---

# 📦 Phase 1 — Webinar Detail Page
**Estimated time: ~1 hour**
**Goal:** Make `/webinars/[webinarid]` a real, functional page with Go Live controls.

---

### 1.1 — Add `getWebinarById` Server Action

**File:** `src/actions/webinar.ts` ← add to existing file

```ts
export const getWebinarById = async (webinarId: string) => {
  try {
    const webinar = await prismaClient.webinar.findUnique({
      where: { id: webinarId },
      include: {
        presenter: {
          select: { name: true, stripeConnectId: true, id: true },
        },
      },
    });
    return webinar;
  } catch (error) {
    console.error("Error fetching webinar", error);
    return null;
  }
};
```

---

### 1.2 — Add `updateWebinarStatus` Server Action

**File:** `src/actions/webinar.ts` ← add to existing file

```ts
export const updateWebinarStatus = async (
  webinarId: string,
  status: WebinarStatusEnum
) => {
  try {
    const user = await onAuthenticateUser();
    if (!user.user) return { status: 401, message: "Unauthorized" };

    await prismaClient.webinar.update({
      where: { id: webinarId, presenterId: user.user.id },
      data: { webinarStatus: status },
    });

    revalidatePath(`/webinars/${webinarId}`);
    return { status: 200, message: "Status updated" };
  } catch (error) {
    return { status: 500, message: "Failed to update status" };
  }
};
```

---

### 1.3 — Files to Create

```
src/app/(protectedRoutes)/webinars/[webinarid]/
  page.tsx                         ← main detail page (server component)
  _components/
    WebinarDetailHeader.tsx        ← title, date, status badge, copy link button
    WebinarStatusControls.tsx      ← Go Live / End buttons (client component)
    WebinarOverviewTab.tsx         ← description, tags, AI agent info
```

---

### 1.4 — What the Detail Page Should Show

- Webinar title + description
- Date & time (formatted nicely)
- Status badge: `SCHEDULED` / `WAITING_ROOM` / `LIVE` / `ENDED`
- Shareable attendee link: `{BASE_URL}/webinar/{id}`
- Two tabs: **Overview** and **Pipeline**
- Action buttons based on current status:

| Current Status | Button to Show |
|---|---|
| SCHEDULED | "Open Waiting Room" → sets to `WAITING_ROOM` |
| WAITING_ROOM | "Go Live" → sets to `LIVE` + redirect to `/live` |
| LIVE | "End Webinar" → sets to `ENDED` |
| ENDED | "View Recording" (placeholder for now) |

---

### 1.5 — Phase 1 Checklist
- [ ] Add `getWebinarById()` to `webinar.ts`
- [ ] Add `updateWebinarStatus()` to `webinar.ts`
- [ ] Build `page.tsx` — fetch webinar, show 404 if not found
- [ ] Build `WebinarDetailHeader` — title, date, status badge
- [ ] Build `WebinarStatusControls` — buttons that call `updateWebinarStatus`
- [ ] Show shareable attendee URL with copy-to-clipboard button
- [ ] Tab: Overview (description, tags, AI agent name)
- [ ] Tab: Pipeline → renders existing pipeline layout

---

---

# 📦 Phase 2 — Stream.io Live Streaming (Host Side)
**Estimated time: ~3 hours**
**Goal:** Host can go live from the dashboard. Video is delivered via Stream.io.

---

### 2.1 — Install Packages
```bash
npm install @stream-io/video-react-sdk @stream-io/node-sdk
```

---

### 2.2 — Add ENV Variables
```env
NEXT_PUBLIC_STREAM_API_KEY=your_key_here
STREAM_SECRET_KEY=your_secret_here
```

> Get keys from: https://dashboard.getstream.io → Create App → Video & Audio

---

### 2.3 — Stream Token API Route

**File:** `src/app/api/stream-token/route.ts`

```ts
import { StreamClient } from "@stream-io/node-sdk";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = new StreamClient(
    process.env.NEXT_PUBLIC_STREAM_API_KEY!,
    process.env.STREAM_SECRET_KEY!
  );

  const token = client.generateUserToken({ user_id: user.id });
  return NextResponse.json({ token });
}
```

---

### 2.4 — Files to Create

```
src/app/(protectedRoutes)/webinars/[webinarid]/live/
  page.tsx                         ← host live room (protected)
  _components/
    HostStreamView.tsx             ← Stream video SDK embed (client component)
    OBSSetupPanel.tsx              ← RTMP URL + stream key instructions
    HostChatPanel.tsx              ← Stream chat for host
    CTAControlPanel.tsx            ← "Drop Buy Now" / "Drop Book a Call" buttons
    LiveControlBar.tsx             ← End stream button, viewer count
```

---

### 2.5 — How CTA Triggering Works

When the host clicks "Drop CTA", it sends a **custom Stream event** to all attendees:

```ts
// In CTAControlPanel.tsx (client component)
const sendCTAEvent = async (ctaType: "BUY_NOW" | "BOOK_A_CALL") => {
  await call.sendCustomEvent({ type: "CTA_TRIGGERED", ctaType });
};
```

Attendees listen for this event and show the CTA banner on their screen.

---

### 2.6 — Phase 2 Checklist
- [ ] Install `@stream-io/video-react-sdk` and `@stream-io/node-sdk`
- [ ] Add Stream API keys to `.env`
- [ ] Create `/api/stream-token` route
- [ ] Build `HostStreamView` — init Stream client, join/create call
- [ ] Show RTMP ingest URL + stream key for OBS setup
- [ ] Build `HostChatPanel` using Stream Chat SDK
- [ ] Build `CTAControlPanel` — sends custom event when clicked
- [ ] Build `LiveControlBar` — end stream button
- [ ] Wire "Go Live" button (Phase 1) to navigate to `/live`

---

---

# 📦 Phase 3 — Public Attendee Flow
**Estimated time: ~2 hours**
**Goal:** Attendees can register, wait, and watch the live stream.

---

### 3.1 — Public Routes (No Auth Required)

```
src/app/webinar/[webinarid]/
  page.tsx               ← registration / landing page
  live/page.tsx          ← attendee live view
  breakout/page.tsx      ← AI agent room (Phase 4)
```

> ⚠️ These live in `src/app/webinar/` (outside the auth group) — completely public.

---

### 3.2 — Registration Page

**File:** `src/app/webinar/[webinarid]/page.tsx`

Shows:
- Webinar title, date, host name
- Registration form: name + email
- On submit → creates `Attendee` + `Attendance(REGISTERED)` in DB
- Redirects to waiting room or live page based on current status

**Server Action to add** in `src/actions/attendence.ts`:
```ts
export const registerAttendee = async (
  webinarId: string,
  name: string,
  email: string
) => {
  // 1. Upsert Attendee by email
  const attendee = await prismaClient.attendee.upsert({
    where: { email },
    create: { email, name },
    update: { name },
  });

  // 2. Upsert Attendance record
  await prismaClient.attendance.upsert({
    where: { attendeeId_webinarId: { attendeeId: attendee.id, webinarId } },
    create: { attendeeId: attendee.id, webinarId, attendedType: "REGISTERED" },
    update: {},
  });

  return { attendeeId: attendee.id };
};
```

---

### 3.3 — Waiting Room

Show when `webinarStatus === 'SCHEDULED'` or `'WAITING_ROOM'`.

```ts
// Client component — polls webinar status every 10s
useEffect(() => {
  const interval = setInterval(async () => {
    const status = await getWebinarStatus(webinarId);
    if (status === "LIVE") router.push(`/webinar/${webinarId}/live`);
  }, 10000);
  return () => clearInterval(interval);
}, []);
```

---

### 3.4 — Attendee Live View

**File:** `src/app/webinar/[webinarid]/live/page.tsx`

- Embed Stream video player (watch-only — not a broadcaster)
- Chat panel (read + write)
- On page load → update attendance status to `ATTENDED`
- Listen for host CTA events:
  - `BUY_NOW` → show buy modal
  - `BOOK_A_CALL` → show "Join Breakout Room" banner → redirect to `/breakout`

---

### 3.5 — Files to Create

```
src/app/webinar/[webinarid]/
  page.tsx                         ← registration landing (server component)
  live/page.tsx                    ← attendee stream view
  _components/
    RegistrationForm.tsx           ← name + email form (client)
    WaitingRoom.tsx                ← "starts soon" + auto-poll
    AttendeeStreamView.tsx         ← Stream SDK video embed (watch only)
    AttendeeChatPanel.tsx          ← stream chat
    CTABanner.tsx                  ← slides up when host triggers CTA
    BuyNowModal.tsx                ← mock purchase modal (Stripe skipped for now)
```

---

### 3.6 — Phase 3 Checklist
- [ ] Add `registerAttendee()` server action to `attendence.ts`
- [ ] Add `getWebinarStatus()` server action (just returns status string)
- [ ] Add `updateAttendanceStatus()` server action
- [ ] Build registration page with form
- [ ] Build `WaitingRoom` component with status polling
- [ ] Build `AttendeeStreamView` — join Stream call as viewer
- [ ] Build `AttendeeChatPanel`
- [ ] Build `CTABanner` — appears on custom Stream event from host
- [ ] Update attendance to `ATTENDED` when attendee joins live page
- [ ] Store `attendeeId` in a cookie for status updates throughout the session

---

---

# 📦 Phase 4 — Vapi AI Breakout Room
**Estimated time: ~2 hours**
**Goal:** Attendee gets called by AI voice agent when they click "Book a Call".

---

### 4.1 — Install Vapi SDK
```bash
npm install @vapi-ai/web
```

---

### 4.2 — Add ENV Variables
```env
NEXT_PUBLIC_VAPI_PUBLIC_KEY=your_public_key
VAPI_API_KEY=your_private_key
```

> Get keys from: https://dashboard.vapi.ai

---

### 4.3 — Create Your AI Agent on Vapi Dashboard (One-time Setup)

1. Go to https://dashboard.vapi.ai → **Assistants** → Create
2. Set **System Prompt**:
   ```
   You are a friendly sales assistant for [Product Name].
   Your goal is to understand the user's challenges and book them
   for a 1-on-1 strategy call with our team.

   Ask them:
   1. What's your biggest challenge right now?
   2. What have you tried before?
   3. What does success look like for you?

   If they're a good fit, tell them you'll send them a calendar link.
   Always be warm, concise, and encouraging.
   ```
3. Choose a voice (e.g., "Lily" or "Ryan")
4. Copy the **Assistant ID**
5. Paste it into the `aiAgentId` field when creating a webinar

---

### 4.4 — Files to Create

```
src/app/webinar/[webinarid]/breakout/
  page.tsx                         ← breakout room page (server: fetch agentId)
  _components/
    VapiAgent.tsx                  ← client: starts and manages Vapi call
    CallStatusUI.tsx               ← "AI is speaking..." / "Listening..." animations
    TranscriptPanel.tsx            ← live conversation transcript
    CallEndScreen.tsx              ← "Thanks! We'll be in touch." screen
src/app/api/vapi-webhook/
  route.ts                         ← POST handler for Vapi call events
```

---

### 4.5 — VapiAgent Client Component

**File:** `src/app/webinar/[webinarid]/breakout/_components/VapiAgent.tsx`

```ts
"use client";
import Vapi from "@vapi-ai/web";
import { useEffect, useState } from "react";

type Status = "connecting" | "active" | "ended";

export default function VapiAgent({ agentId }: { agentId: string }) {
  const [status, setStatus] = useState<Status>("connecting");
  const [transcript, setTranscript] = useState<string[]>([]);

  useEffect(() => {
    const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!);

    vapi.on("call-start", () => setStatus("active"));
    vapi.on("call-end", () => setStatus("ended"));
    vapi.on("transcript", (t) => {
      if (t.transcriptType === "final") {
        setTranscript((prev) => [...prev, `${t.role}: ${t.transcript}`]);
      }
    });

    vapi.start(agentId);
    return () => { vapi.stop(); };
  }, [agentId]);

  if (status === "ended") return <CallEndScreen />;

  return (
    <div>
      <CallStatusUI status={status} />
      <TranscriptPanel transcript={transcript} />
    </div>
  );
}
```

---

### 4.6 — Phase 4 Checklist
- [ ] Install `@vapi-ai/web`
- [ ] Add Vapi keys to `.env`
- [ ] Create AI assistant on Vapi dashboard → copy Assistant ID
- [ ] Build `breakout/page.tsx` — fetch `webinar.aiAgentId`, update attendance status
- [ ] Build `VapiAgent` component — start call, handle all events
- [ ] Build `CallStatusUI` — animated speaking/listening indicator
- [ ] Build `TranscriptPanel` — scrolling live transcript
- [ ] Build `CallEndScreen` — thank you message + next steps
- [ ] (Optional) Build `/api/vapi-webhook` → update DB when call completes

---

---

# 📦 Phase 5 — Polish + Deploy
**Estimated time: ~1.5 hours**
**Goal:** Live URL on Vercel. Clean UI. Ready for resume.

---

### 5.1 — UI Polish Tasks
- [ ] Add **loading skeletons** to webinar detail page and webinars list
- [ ] Fix **Upcoming / Ended tabs** on `/webinars` page (add `where` filter by status)
- [ ] Add **toast notifications** for all server actions (using `sonner` — already installed)
- [ ] Add proper **empty states** (no webinars yet, no attendees yet)
- [ ] Make everything **mobile responsive** — check on 375px screen
- [ ] Add `src/app/error.tsx` error boundary page
- [ ] Add `src/app/not-found.tsx` 404 page

---

### 5.2 — Deploy to Vercel (Free, ~5 minutes)

```bash
# Option A: Vercel CLI
npm install -g vercel
vercel

# Option B: Push to GitHub → import project at vercel.com
```

After deploying:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add ALL variables from your `.env` file
3. Redeploy

> Your app goes live at `your-project.vercel.app` instantly.

---

### 5.3 — GitHub README

```md
# 🔦 Spotlight — AI-Powered Webinar Platform

🔗 **Live Demo:** [your-url.vercel.app](https://your-url.vercel.app)

## What is Spotlight?
A full-stack SaaS webinar platform where hosts can go live,
trigger CTAs, and let AI voice agents automatically qualify leads
in private breakout rooms.

## Key Features
- 🎥 Real-time live streaming via Stream.io + OBS
- 🤖 Vapi AI voice agents that call attendees and qualify leads
- 📊 Kanban lead pipeline tracking (6 pipeline stages)
- 🔐 Clerk authentication + protected routes
- 🗃️ PostgreSQL on Neon + Prisma ORM

## Tech Stack
| Frontend | Backend | Services |
|---|---|---|
| Next.js 15 | Server Actions | Clerk Auth |
| TypeScript | Prisma ORM | Stream.io |
| Tailwind CSS | Neon PostgreSQL | Vapi AI |
| Shadcn UI | | |

## Local Setup
1. Clone the repo
2. Copy `.env.example` → `.env` and fill in keys
3. Run `npx prisma db push`
4. Run `npm run dev`
```

---

### 5.4 — Phase 5 Checklist
- [ ] Add loading skeletons to all async pages
- [ ] Fix webinar list tabs (Upcoming / Ended filter logic)
- [ ] Add toast notifications for all server actions
- [ ] Add `error.tsx` and `not-found.tsx`
- [ ] Deploy to Vercel
- [ ] Add all env vars to Vercel dashboard
- [ ] Test the complete flow on the live URL
- [ ] Update GitHub README with live URL + demo GIF

---

---

## 📊 Full Summary

| Phase | Feature | Est. Time | Resume Impact |
|---|---|---|---|
| ✅ Done | Auth, DB, Webinar CRUD, Pipeline | — | ⭐⭐⭐ |
| 1 | Webinar Detail Page + Status Controls | ~1 hr | ⭐⭐ |
| 2 | Stream.io — Host Live Room | ~3 hrs | ⭐⭐⭐⭐ |
| 3 | Public Attendee Flow (register → watch) | ~2 hrs | ⭐⭐⭐ |
| 4 | Vapi AI Breakout Room | ~2 hrs | ⭐⭐⭐⭐⭐ |
| 5 | Polish + Deploy to Vercel | ~1.5 hrs | ⭐⭐⭐⭐⭐ |
| **Total remaining** | | **~9.5 hrs** | |

---

> **Start right now with Phase 1** — it's 1 hour, zero external dependencies, and unblocks everything else.
