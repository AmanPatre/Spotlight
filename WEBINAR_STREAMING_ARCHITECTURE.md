# 🎥 Spotlight: Streaming & WebRTC Architecture Deep Dive

This document provides a **0-to-100% mastery guide** on the live streaming architecture of the Spotlight platform. It covers the underlying theory, the system design, and the exact code implementations for the Waiting Room, WebRTC connections, and live broadcast syncing.

---

## 1. The Theory: How Live Streaming Works (WebRTC & SFU)

To build a livestreaming app, you need low latency. Standard HTTP protocols (like HLS/DASH used by Netflix or YouTube) have a 5-15 second delay. For an interactive webinar with a live chat, that delay is unacceptable. 

We use **WebRTC (Web Real-Time Communication)**, which provides sub-second latency.

### The Problem with standard WebRTC (P2P)
Standard WebRTC is **Peer-to-Peer (P2P)**. If you have 1 Host and 1000 Attendees, the Host's browser would have to encode and upload 1000 separate video streams. The Host's computer and internet would instantly crash.

### The Solution: SFU (Selective Forwarding Unit)
Spotlight uses an **SFU Architecture** powered by **GetStream.io**.
1. **The Host** sends exactly **one** video stream to the GetStream server.
2. **The GetStream Server** duplicates that stream and routes it to the 1000 Attendees.
3. This shifts the heavy lifting from the Host's laptop to GetStream's global cloud infrastructure.

GetStream provides the `@stream-io/video-react-sdk`, which abstracts away the messy WebRTC ICE candidates, NAT traversals, and socket handling.

---

## 2. System Design: The End-to-End Flow

```text
[ Attendee Browser ]                    [ Host Browser ]
       |                                       |
       | 1. Arrives at Waiting Room            |
       |    (webinar/[id]/page.tsx)            |
       |                                       |
       |                                       | 2. Enters Dashboard Live Room
       |                                       |    (webinars/[id]/live/page.tsx)
       |                                       |
       | 3. Polls DB for Status                | 4. Requests Host Token
       |    (Every 10 seconds)                 |    -> /api/stream-token
       |                                       |
       |                                       | 5. Initializes StreamVideoClient
       |                                       | 6. Joins & Clicks "Go Live"
       |                                       |    -> DB Status shifts to 'LIVE'
       |                                       |
       | 7. Polling sees 'LIVE'                |
       | 8. Redirects to Live Viewer           |
       |    (webinar/[id]/live/page.tsx)       |
       |                                       |
       | 9. Requests Attendee Token            |
       |    -> /api/attendee-stream-token      |
       |                                       |
       | 10. Joins StreamVideoClient           |
       |     (View Only Mode)                  |====> Live Video Feed via GetStream Network
```

---

## 3. Phase 1: The Waiting Room Implementation

The Waiting Room is responsible for making sure attendees don't join before the Host is ready, and pushing them in automatically when the Host starts the broadcast.

**Key File:** `src/app/webinar/[webinarid]/_components/LandingPageClient.tsx`

### The Polling Mechanism
We use a technique called "Client-side Polling". Every 10 seconds, the attendee's browser asks the Database, *"Did the host start the stream yet?"*

```typescript
// Inside LandingPageClient.tsx
useEffect(() => {
  // We only poll if the webinar is SCHEDULED
  if (webinarStatus !== "SCHEDULED") return;

  const pollInterval = setInterval(async () => {
    try {
      // getWebinarStatus is a Next.js Server Action fetching the latest DB status
      const { status } = await getWebinarStatus(webinar.id);
      
      // If the status changed to LIVE, update React state!
      if (status !== "SCHEDULED" && status !== webinarStatus) {
        setWebinarStatus(status);
      }
    } catch (error) {
      console.error("Failed to poll webinar status:", error);
    }
  }, 10000); // 10,000ms = 10 seconds

  return () => clearInterval(pollInterval);
}, [webinar.id, webinarStatus]);
```

### The Redirect Logic
```typescript
// When the status shifts to LIVE, and the user is verified as registered:
if (webinarStatus === "LIVE" && registrationVerification.isVerified) {
  // Push them directly into the live WebRTC room
  router.push(`/webinar/${webinar.id}/live`);
}
```

---

## 4. Phase 2: Host Authentication & Token Generation

Before WebRTC can establish a connection, GetStream needs to know who is connecting and if they have permission. This is done via **JWT Tokens**.

We cannot generate tokens on the client (browser) because it requires our secret Stream API Key. So we use an API Route.

**Key File:** `src/app/api/stream-token/route.ts` (For Host)

```typescript
import { StreamClient } from '@stream-io/node-sdk';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;
const apiSecret = process.env.STREAM_SECRET_KEY;

export async function POST(req: Request) {
  // 1. Authenticate the host via Clerk
  const { userId } = auth(); 
  
  // 2. Initialize the backend Stream client with the SECRET KEY
  const streamClient = new StreamClient(apiKey, apiSecret);
  
  // 3. Generate a JWT token valid for exactly 1 hour
  const expirationTime = Math.floor(Date.now() / 1000) + 3600;
  const token = streamClient.createToken(userId, expirationTime);
  
  return NextResponse.json({ token });
}
```

---

## 5. Phase 3: The Host Client (Broadcasting)

When the Host enters the dashboard, they need to connect to their camera/mic and upload the stream.

**Key File:** `src/app/(protectedRoutes)/webinars/[webinarid]/live/_components/LiveRoomClient.tsx`

### Step 1: Connecting to GetStream
```typescript
const [client, setClient] = useState<StreamVideoClient | null>(null);
const [call, setCall] = useState<Call | null>(null);

useEffect(() => {
  const init = async () => {
    // Fetch the token we just created in Phase 2
    const { token } = await fetch('/api/stream-token').then(res => res.json());

    // Create the Video Client
    const streamClient = new StreamVideoClient({
      apiKey: process.env.NEXT_PUBLIC_STREAM_API_KEY,
      user: { id: hostId, name: hostName },
      token,
    });

    // Get or Create the specific room for this webinar
    // 'livestream' is a special call type optimized by GetStream for less publishers / more viewers
    const streamCall = streamClient.call("livestream", webinarId);
    
    // Join the call (starts sending local hardware data into the void)
    await streamCall.join({ create: true });

    setClient(streamClient);
    setCall(streamCall);
  };
  init();
}, []);
```

### Step 2: Going Live
Inside `HostStreamView.tsx`, we manage hardware toggles. Calling `goLive` is what opens the floodgates so Attendees can start receiving data.

```typescript
const handleGoLive = async () => {
  setIsPublishingToDB(true);
  try {
    // 1. Tell GetStream to officially start the broadcast
    await call.goLive();
    
    // 2. Tell our Database so attendees Waiting Room polling picks it up
    await updateWebinarStatus(webinar.id, "LIVE");
    
    setIsLive(true);
  } catch (error) {
    console.error("Go live failed", error);
  }
};

// Enable hardware
useEffect(() => {
  call.camera.enable();
  call.microphone.enable();
}, [call]);
```

---

## 6. Phase 4: The Attendee Client (Viewing)

Attendees are routed into `webinar/[id]/live/page.tsx`.

**Key File:** `src/app/webinar/[webinarid]/live/_components/AttendeeStreamView.tsx`

### Joining as a Viewer
They request their token from `/api/attendee-stream-token` and join the call. Notice the crucial difference: `create: false`. If they try to join early, it throws an error instead of creating an empty room.

```typescript
const streamCall = streamClient.call("livestream", webinarId);
await streamCall.join({ create: false });
```

### Rendering the Video
We use GetStream hooks to pull the video tracks from the cloud and render them to HTML `<video>` elements (abstracted via `<ParticipantView>`).

```typescript
// Get state hooks from the Call Context
const { useParticipants, useScreenShare } = useCallStateHooks();
const participants = useParticipants();

// Find the host (the only one publishing video)
const hostParticipant = participants.find((p) => p.userId !== attendeeId && p.videoStream);
// Find if a screen is being shared
const hasScreenShare = useScreenShare();

return (
  <div className="relative">
    {hasScreenShare ? (
      <>
        {/* Render the Screen Share as the large master view */}
        <ParticipantView participant={hasScreenShare.participant} />
        {/* Render the Host Camera as a Picture-in-Picture window */}
        <div className="absolute bottom-4 right-4 w-64">
           <ParticipantView participant={hostParticipant} />
        </div>
      </>
    ) : (
      /* If no screen share, host is full screen */
      <ParticipantView participant={hostParticipant} />
    )}
  </div>
)
```

---

## 7. Phase 5: Real-Time CTAs & System Events

During a webinar, the host clicks "Show Buy Now Button" and it instantly pops up on the Attendee's screen without needing database polling. 
This is achieved via **WebRTC Data Channels** (Custom Events).

### The Host Sends the Signal:
```typescript
// Inside HostStreamView.tsx
const triggerCTA = async () => {
  // Shoots a custom payload across the active streaming socket
  await call.sendCustomEvent({
    type: "CTA_TRIGGERED",
    ctaType: "BUY_NOW",
    productId: "123"
  });
};
```

### The Attendee Receives the Signal:
```typescript
// Inside AttendeeStreamView.tsx
useEffect(() => {
  if (!call) return;

  // Listen directly to the active socket connection for 'custom' events
  const unsubscribe = call.on("custom", (event) => {
    if (event.custom?.type === "CTA_TRIGGERED") {
      // Wow! Instantly update React state.
      setActiveCTA(event.custom.ctaType); 
    }
  });

  return () => unsubscribe();
}, [call]);
```
*Because this moves over the UDP socket connection instead of HTTP POST/GET, the latency is almost zero.*

---

## 8. Summary of Architecture

1. **State:** PostgreSQL/Prisma holds the authoritative state (`SCHEDULED`, `LIVE`, `ENDED`).
2. **Synchronization:** Polling bridges the gap between Database state and the active UI in the Waiting Room.
3. **Transport Engine:** WebRTC / GetStream SFU routes the heavy video/audio packets.
4. **Authorization:** Node.js API Routes generate short-lived JWT tokens signed by our secret key.
5. **Real-time UI:** Custom socket events bridge Host interactions directly to attendee screens without database overhead.

This structure allows the platform to scale to thousands of simultaneous viewers without overwhelming your main Next.js backend, as the heavy lifting of WebRTC is offloaded to the GetStream edge network.
