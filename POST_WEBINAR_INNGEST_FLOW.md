# Post-Webinar Processing: The Complete Deep Dive
## Inngest + AI Scoring + Email Dispatch

---

## The Big Picture

When the Host clicks "End Webinar", Spotlight does NOT just flip a status field.
It fires an entire intelligent, multi-step background pipeline that:
1. Fetches every active attendee from the database
2. Scores each attendee as a sales Lead using a rules engine + AI
3. Fetches their VAPI call transcript from VAPI's servers
4. Asks Gemini to analyze the transcript and give an intent score
5. Generates an overall webinar audience summary using Gemini
6. Sends a beautiful "Webinar Debrief Report" email to the Host via Resend

The key technology making this possible is **Inngest** — a background job queue.
Without Inngest, all of this heavy work would crash a normal Next.js API route (which has a 10-second timeout on Vercel).

---

## FILES INVOLVED

| File | Role |
|---|---|
| `src/app/(protectedRoutes)/webinars/[webinarid]/live/_components/HostStreamView.tsx` | The "End Webinar" button — the trigger |
| `src/actions/webinar.ts` → `updateWebinarStatus()` | The Server Action that fires the Inngest event |
| `src/inngest/client.ts` | Creates the Inngest client instance |
| `src/app/api/inngest/route.ts` | Registers the Inngest function with Next.js |
| `src/inngest/functions.ts` → `processWebinarEnd` | The entire background pipeline (the brain) |
| `src/emails/HotLeadsDigest.tsx` | The React-based email template |

---

## STEP 1: The Trigger — Host Clicks "End Webinar"

**File:** `HostStreamView.tsx`

When the host clicks the "End Stream" button, the frontend calls `updateWebinarStatus(webinarId, "ENDED")`.

**File:** `src/actions/webinar.ts`

```typescript
export const updateWebinarStatus = async (webinarId, status) => {
    const user = await onAuthenticateUser(); // Clerk auth check

    // 1. Update the database: set status = ENDED and log the endTime
    await prismaClient.webinar.update({
        where: { id: webinarId },
        data: {
            webinarStatus: "ENDED",
            endTime: new Date(), // Timestamp used later to calculate live duration
        },
    });

    // 2. IF the new status is ENDED, fire an Inngest event
    if (status === "ENDED") {
        await inngest.send({
            name: "app/webinar.ended",  // The event name Inngest listens for
            data: {
                webinarId,
                presenterEmail: user.user.email, // We pass these as the "payload"
            },
        });
    }
};
```

### What is `inngest.send()`?
Think of it like dropping a package into a postbox.
You put the package in (`webinarId` + `presenterEmail`), and your code's job is done.
Inngest picks it up in the background and runs the delivery (the pipeline) for you,
completely independently of the user's browser or the Next.js request lifecycle.

---

## STEP 2: The Inngest Client & Registration

**File:** `src/inngest/client.ts`
```typescript
import { Inngest } from "inngest";
export const inngest = new Inngest({ id: "webinar-platform" });
```
This creates the single Inngest instance. The `id` "webinar-platform" is the unique
identifier for your app on the Inngest cloud dashboard.

---

**File:** `src/app/api/inngest/route.ts`
```typescript
import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";
import { processWebinarEnd } from "../../../inngest/functions";

export const { GET, POST, PUT } = serve({
    client: inngest,
    functions: [processWebinarEnd],
});
```

### What does this file do?
This file is a special Next.js API Route that Inngest's cloud servers use to communicate
with your application. When Inngest is ready to run `processWebinarEnd`, it sends an HTTP 
request to `/api/inngest`. This route receives it and executes the function. It's the 
"Inngest Webhook" for your app.

---

## STEP 3: The Background Pipeline — `processWebinarEnd`

**File:** `src/inngest/functions.ts`

This is the core brain of the entire post-webinar flow. It is structured as a series 
of `step.run()` blocks. Each `step.run()` is automatically retried by Inngest if it fails.

```typescript
export const processWebinarEnd = inngest.createFunction(
    {
        id: "process-webinar-end",
        triggers: [{ event: "app/webinar.ended" }] // Listens for the event we fired
    },
    async ({ event, step }) => {
        const { webinarId, presenterEmail } = event.data; // Unpack the payload
        // ... pipeline steps below
    }
);
```

### Sub-Step A: Fetch All Active Attendees
```typescript
const breakoutAttendances = await step.run("fetch-active-attendees", async () => {
    return prismaClient.attendance.findMany({
        where: {
            webinarId,
            // Only fetch people who actually watched — not just registered
            attendedType: { in: ["ATTENDED", "ADDED_TO_CART", "BREAKOUT_ROOM", "FOLLOW_UP", "CONVERTED"] },
        },
        include: { user: true, webinar: true },
    });
});
```

### Sub-Step B: Smart Wait (For BOOK_A_CALL webinars only)
```typescript
if (isBookCall) {
    await step.sleep("wait-for-calls-sync", "5m");
}
```
This is a crucial grace-period. VAPI call transcripts take a few minutes to be
finalized and uploaded to VAPI's servers after the call ends. By waiting 5 minutes,
we ensure that when we fetch VAPI transcripts in the next step, they are fully populated.
Inngest's `step.sleep()` is smart — it doesn't block a server thread. It literally
pauses the job entirely and resumes it after 5 minutes.

### Sub-Step C: Calculate the "Stayed Until End" Threshold
```typescript
const liveDurationSeconds = (endTime - startTime) / 1000;
const effectiveDuration = Math.min(liveDurationSeconds, scheduledDuration * 60);
const thresholdSeconds = effectiveDuration * 0.7; // 70% of actual live time
```
If a webinar ran for 60 minutes, an attendee must have stayed at least 42 minutes 
(70%) to be considered a "Warm Lead" based on watch time.

---

## STEP 4: Lead Scoring — Per Attendee Loop

For every single active attendee, we run an isolated scoring step:

```typescript
for (const attendance of breakoutAttendances) {
    const result = await step.run(`score-lead-${attendance.id}`, async () => {
        let score = 2;
        let summary = "Cold Lead: Left early.";
```

### The Scoring Decision Tree:
```
Did they CONVERT (pay)?
    YES → score = 10, summary = "Converted: Payment verified."

Did they click BUY_NOW CTA but abandon cart?
    YES → score = 8, summary = "Hot Lead (Cart Abandoned)"

Did they stay 70%+ of the webinar (any CTA type)?
    YES → score = 5, summary = "Warm Lead: Stayed until the end."

Did they join the BREAKOUT ROOM (BOOK_A_CALL only)?
    YES → [GO TO STEP 5: AI SCORING]
    NO but clicked CTA → score = 8, "High Intent: Clicked Book a Call but didn't join."
```

---

## STEP 5: AI Scoring via VAPI + Gemini

This only runs for attendees who entered the VAPI breakout room.

### Phase A: Fetch the VAPI Transcript
```typescript
const response = await fetch(
    `https://api.vapi.ai/call?assistantId=${webinar.aiAgentId}&limit=50`,
    { headers: { "Authorization": `Bearer ${process.env.VAPI_API_KEY}` } }
);
const calls = await response.json();

// Find the specific call for THIS attendee at THIS webinar using the metadata
// we embedded when we called vapi.start(assistantId, { metadata: { webinarId, attendeeId } })
const myCall = calls.find(c =>
    c.assistantOverrides?.metadata?.webinarId === webinarId &&
    c.assistantOverrides?.metadata?.attendeeId === attendance.attendeeId
);

const vapiTranscript = myCall?.transcript || null;
```

This is why we embedded `{ metadata: { webinarId, attendeeId } }` inside 
`VapiCallRoom.tsx` when starting the VAPI call! It lets us uniquely identify 
each attendee's specific 1-on-1 conversation from VAPI's list of all calls.

### Phase B: Gemini AI Analysis
```typescript
const { object } = await generateObject({
    model: google("gemini-3.1-flash-lite"),
    schema: z.object({
        summary: z.string(),
        score: z.number().min(1).max(10),
    }),
    prompt: `Analyze this sales call for ${attendance.user.name}. 
    Webinar Type: ${webinar.ctaType}
    Product: ${webinar.productTitle}
    Price: ${webinar.price}
    Transcript: ${vapiTranscript}
    
    Provide a 1-2 sentence summary of their interest and a score from 1-10.`,
});

// Save the AI-generated score and summary to the database
await prismaClient.callDebrief.upsert({
    where: { attendanceId: attendance.id },
    update: { score: object.score, summary: object.summary, isHotLead: object.score >= 6 },
    create: { ... }
});
```

`generateObject` is from Vercel's AI SDK. It forces Gemini to respond in a strict
typed JSON structure, validated against the Zod schema. You can never get a random
text response — it always comes back with `{ summary: "...", score: 7 }`.

---

## STEP 6: Overall Webinar Summary Generation

After ALL attendee scores are calculated, Gemini generates a single macro-level summary
of how the entire audience responded.

```typescript
await step.run("generate-webinar-summary", async () => {
    const debriefs = await prismaClient.callDebrief.findMany({
        where: { attendance: { webinarId } },
        select: { summary: true, score: true }
    });

    const summaryList = debriefs
        .map((d, i) => `Attendee ${i + 1} (Score ${d.score}/10): ${d.summary}`)
        .join("\n\n");

    const { object } = await generateObject({
        model: google("gemini-3.1-flash-lite"),
        schema: z.object({ overallSummary: z.string() }),
        prompt: `You are a sales analytics assistant. Below are the AI-scored summaries:
${summaryList}
Write a concise 2-3 sentence overall summary of audience response and conversion potential.`,
    });

    // Save this summary to the Webinar record itself
    await prismaClient.webinar.update({
        where: { id: webinarId },
        data: { summary: object.overallSummary }
    });
});
```

This overall summary is what you see on the Host's Dashboard card for the webinar.

---

## STEP 7: The Email — HotLeadsDigest

**File:** `src/emails/HotLeadsDigest.tsx`

```typescript
await step.run("send-hot-leads-digest", async () => {
    await resend.emails.send({
        from: "Spotlight Notifications <onboarding@resend.dev>",
        to: [presenterEmail],
        subject: `📊 Webinar Report: ${webinar.title}`,
        react: HotLeadsDigest({     // <-- A React component rendered as an email!
            webinarTitle: webinar.title,
            hotLeads,               // All attendees with score >= 6
            convertedLeads,         // All attendees who actually paid
            totalAttendees: breakoutAttendances.length,
            pipelineValue,          // convertedLeads * webinarPrice
            currency,
        }) as React.ReactElement,
    });
});
```

### What is Resend?
Resend is a developer-first email service (like SendGrid). The killer feature is 
`react: <YourComponent />` — you write your emails as actual React JSX components 
using `@react-email/components`. Resend converts your JSX into battle-tested, 
cross-email-client HTML and fires it off. No HTML email template nightmares.

### What does the email contain?
The `HotLeadsDigest.tsx` component renders:
- Total Attendees + Hot Leads count + Converted count (styled stat cards)
- Total Pipeline Value in a black card (Converted count × Product price)
- A table of Converted attendees (green rows) with their AI debrief summaries
- A table of Hot Lead attendees with their AI score badge (7/10) and summaries
- A footer link to the Spotlight Dashboard

---

## The Full Timeline (From "End Webinar" Click)

```
T = 0s    → Host clicks "End Webinar" on HostStreamView.tsx
T = 50ms  → updateWebinarStatus() sets DB status = ENDED, endTime = NOW
T = 100ms → inngest.send({ name: "app/webinar.ended" }) fires
T = 200ms → Inngest cloud receives the event, queues the job
T = 500ms → Inngest calls /api/inngest route, processWebinarEnd starts
T = 1s    → "fetch-active-attendees" step: DB query runs, attendees fetched
T = 6min  → (If BOOK_A_CALL): step.sleep("wait-for-calls-sync", "5m") wakes up
T = 6m+   → Loop begins: for each attendee, score-lead-{id} step runs
            → VAPI transcript fetched from api.vapi.ai
            → Gemini analyzes transcript, returns { score, summary }
            → prismaClient.callDebrief.upsert saves the result
T = ~10m  → "generate-webinar-summary" step: Gemini writes the macro summary
            → prismaClient.webinar.update saves it to the webinar record
T = ~10m+ → "send-hot-leads-digest" step: Resend fires the email to the Host
T = ~11m  → Host receives the "Webinar Debrief Report 🚨" email in their inbox
```
