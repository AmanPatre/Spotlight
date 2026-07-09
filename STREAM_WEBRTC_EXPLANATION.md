# 🎥 Spotlight: Streaming & WebRTC Architecture (0 to Hero)

This document breaks down exactly how the Spotlight webinar platform handles everything from the "Waiting Room" to the "Live Broadcast" using WebRTC, from 0 to 100%.

## 1. The Powering Engine: GetStream.io
We don't build raw WebRTC servers from scratch. Building live video infrastructure (handling packet loss, varied internet speeds, scaling to 1000s of users) is overwhelmingly complex. 
Instead, this project uses **GetStream.io** (`@stream-io/video-react-sdk`). GetStream acts as the SFU (Selective Forwarding Unit)—meaning it takes the host's video feed and intelligently distributs it to all attendees with sub-second latency.

---

## 2. Phase 1: The Waiting Room (`LandingPageClient.tsx`)

Before a host goes live, attendees arrive at the waiting room (the `webinar/[webinarid]` route).

### How it Works:
1. **Countdown Timer:** The UI runs a simple JavaScript `setInterval` counting down to the `startTime`.
2. **Status Polling (The Magic):** The client runs a `useEffect` that calls the database (`getWebinarStatus`) every **10 seconds**.
   ```typescript
   // LandingPageClient.tsx
   const poll = async () => {
     const data = await getWebinarStatus(webinarId);
     if (data.status !== webinarStatus) {
       setWebinarStatus(data.status); // e.g., switches to "LIVE"
     }
   };
   setInterval(poll, 10000);
   ```
3. **The Redirection:** Once the polling detects the status is `LIVE` *and* the user is registered (ID stored in `localStorage`), the router automatically pushes them into the livestream URL (`/webinar/[id]/live`).

---

## 3. Phase 2: The Host Goes Live (`LiveRoomClient.tsx`)

When the Presenter enters their dashboard room (`(protectedRoutes)/webinars/[webinarid]/live`), they are setting up the broadcast.

### Step-by-Step Initialization:
1. **Token Generation:** The host fetches a secure authentication token from our backend API (`/api/stream-token`).
2. **Client Creation:** A new `StreamVideoClient` is created holding the API Key, User data, and Token.
3. **Room Creation:** We call `.getOrCreate()` on a `livestream` call type using the `webinarId`. This ensures the room exists.
4. **Device Setup:** Inside `HostStreamView.tsx`, a `useEffect` automatically turns on the host's camera and mic:
   ```typescript
   await call.camera.enable();
   await call.microphone.enable();
   ```
5. **Going Live:** An auto-go-live effect runs. `call.goLive()` is triggered, signaling GetStream servers that the broadcast is officially open. The database status is also updated to `LIVE`.

---

## 4. Phase 3: Attendees Join (`AttendeeLiveClient.tsx`)

When attendees are pushed from the waiting room into `webinar/[webinarid]/live`, they hit the attendee viewer client.

### Step-by-Step Connection:
1. **Verification:** It first checks `localStorage` to prove the attendee actually registered.
2. **Token Fetch:** It fetches an attendee-specific token from `/api/attendee-stream-token`.
3. **Joining as a Viewer:** 
   ```typescript
   // AttendeeStreamView.tsx
   await streamCall.join({ create: false });
   ```
   *Note: `create: false` ensures attendees can't accidentally create the room if the host hasn't showed up yet. If the room isn't ready, GetStream throws an error and the frontend shows "Waiting for Host".*

---

## 5. Phase 4: The Live UI (Screen Share & PiP)

Once connected, `AttendeeStreamView.tsx` handles rendering the video feeds.

### The Hooks
We use GetStream's reactive state hooks to know exactly what's happening in the room:
```typescript
const { useParticipants, useIsCallLive } = useCallStateHooks();
const participants = useParticipants();
// Find the host who is broadcasting video
const hostParticipant = participants.find((p) => p.userId !== attendeeId && p.videoStream);
// Find if anyone is sharing their screen
const activeScreenShare = screenSharingParticipants[0];
```

### Picture-in-Picture (PiP) Logic
If the host starts sharing their screen, the UI dynamically changes:
1. The **Master View** becomes the `screenShareTrack` (forced with CSS `object-fit: contain` so it isn't cropped).
2. The **Host Camera** shrinks into a floating window in the bottom right corner (Google Meet style).
   ```tsx
   <div className="absolute bottom-6 right-6 w-48 ... z-30">
     <ParticipantView participant={hostParticipant} />
   </div>
   ```

---

## 6. Phase 5: Live CTA Pops (Custom Real-time Events)

One of the coolest features is how the Host triggers a "Buy Now" button on everyone's screen simultaneously without polling.

We use **GetStream Custom Events** built into the WebRTC socket connection.

### How the Host Sends it:
Inside the Host's control panel, clicking a CTA sends an event down the socket:
```typescript
await call.sendCustomEvent({
  type: "CTA_TRIGGERED",
  ctaType: "BUY_NOW",
  ctaMetadata: { price: 99, productTitle: "Course" }
});
```

### How the Attendee Receives it:
In `AttendeeStreamView.tsx`, there is an event listener listening to the raw socket:
```typescript
const unsubscribe = call.on("custom", (event) => {
  if (event.custom?.type === "CTA_TRIGGERED") {
    setActiveCTA(event.custom.ctaType); // Shows the overlay instantly!
  }
});
```
This guarantees sub-second synchronization between what the host says and the button appearing on screen.

---

## 7. Phase 6: Ending the Stream

When the host clicks "End Stream" (`handleEndStream`):
1. `call.stopLive()` is fired. This cuts the WebRTC feeds immediately.
2. The Database status is updated to `ENDED`.
3. The attendees' `AttendeeStreamView.tsx` detects the end via the socket:
   ```typescript
   call.on("call.ended", () => setWebinarEnded(true));
   ```
4. The attendee UI instantly drops the video player and shows the *"The Broadcast has ended"* blackout screen with post-webinar actions (like booking a consultation). 
