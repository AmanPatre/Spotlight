# 🧪 Spotlight — End-to-End Testing Guide
> Tests everything built in Phases 1–3. Use two browser windows side-by-side.

---

## ⚙️ Prerequisites

1. Dev server is running → `npm run dev` → open `http://localhost:3000`
2. You are **signed in** via Clerk (Google/GitHub/Email)
3. Your `.env` has valid `NEXT_PUBLIC_STREAM_API_KEY` and `STREAM_SECRET_KEY`

---

## 🟩 PHASE 1 — Webinar Detail Page

### Test 1.1 — Create a Webinar
1. Go to `http://localhost:3000/webinars`
2. Click **"Create Webinar"** button (top right)
3. Fill in the multi-step form:
   - **Title**: "My Test Webinar"
   - **Date/Time**: any future date
   - **Description**: anything
   - **CTA Type**: "Buy Now" or "Book a Call"
4. Click **"Create"** / submit
5. ✅ **Expected**: Redirected to `/webinars/[id]` — webinar detail page with status badge showing **SCHEDULED**

---

### Test 1.2 — Status Controls
On the Webinar Detail page (`/webinars/[id]`):

1. Click **"Open Waiting Room"**
   - ✅ Status badge changes to **WAITING_ROOM** (yellow/amber)
2. Click **"Go Live"**
   - ✅ Status badge changes to **LIVE** (red pulsing dot)
   - ✅ A **"Go to Live Room →"** button appears
3. Click **"End Webinar"**
   - ✅ Status badge changes to **ENDED** (grey)

> ⚠️ Reset: Change status back to **LIVE** before testing Phase 2.

---

### Test 1.3 — Overview Tab
On the Webinar Detail page:
1. Click the **"Overview"** tab
   - ✅ Shows description, tags, CTA type badge
2. Click the **"Pipeline"** tab
   - ✅ Shows the lead pipeline with 0 attendees initially
3. Copy the **attendee link** (the share icon in the header)
   - ✅ Shows `http://localhost:3000/webinar/[id]` copied toast

---

## 🟦 PHASE 2 — Host Live Room

### Test 2.1 — Enter Host Live Room
> Make sure webinar status is **LIVE** first (Test 1.2, step 2)

1. On the Webinar Detail page, click **"Go to Live Room →"**
   - URL: `http://localhost:3000/webinars/[id]/live`
2. Browser asks for **camera & microphone permission** → Click **Allow**
3. ✅ **Expected**:
   - Your webcam video appears in the main area
   - **"LIVE"** red badge in the top-left
   - Right sidebar: **Live Chat** panel
   - Bottom panels: **Device Controls** + **CTA Controls**

---

### Test 2.2 — Device Controls
In the host live room:
1. Click the **Camera toggle** (video icon button)
   - ✅ Your video turns off/on
2. Click the **Mic toggle** (microphone icon button)
   - ✅ Mic indicator changes
3. Click **"Stop Sharing Screen"** (if visible) to confirm screen share option exists

---

### Test 2.3 — Host Chat
In the host live room:
1. Type a message in the **Live Chat** panel (right sidebar)
2. Press Enter / click Send
   - ✅ Message appears in the chat from your name

---

## 🟪 PHASE 3 — Attendee Registration & Live View

> ⚠️ **Use a different browser or Incognito window** for attendee steps.
> Keep the host live room open in your main browser.

---

### Test 3.1 — Attendee Registration
1. Open **Incognito/Private window**
2. Go to `http://localhost:3000/webinar/[YOUR_WEBINAR_ID]`
   - (Copy the ID from the URL in your main browser, or from the share link)
3. ✅ **Expected**: Public landing page with webinar title, date, presenter name
4. Fill in the registration form:
   - **Name**: "Test Attendee"
   - **Email**: any email (e.g. `test@test.com`)
5. Click **"Register"**
   - ✅ Toast: "Successfully registered!"
   - ✅ Page shows a **"Join Live"** or redirects automatically

---

### Test 3.2 — Guard (Unregistered Access)
1. In the incognito window, open a **new tab**
2. Go directly to `http://localhost:3000/webinar/[id]/live`
   - ✅ **Expected**: Automatically redirected back to `/webinar/[id]` (the registration page)
   - This confirms the localStorage auth gate works

---

### Test 3.3 — Attendee Joins Live
1. After registering (Test 3.1), navigate to `http://localhost:3000/webinar/[id]/live`
   - ✅ **Expected**:
     - Loading spinner briefly appears ("Joining live broadcast...")
     - Host's video stream appears in the main area
     - **"LIVE"** red badge visible
     - Right sidebar: **Live Chat** panel

> ⚠️ If the host camera isn't showing, make sure:
> - Host live room tab is still open and camera is ON
> - Both are using the same `webinarId`

---

### Test 3.4 — Attendee Chat
In the attendee (incognito) window:
1. Type a message in the **Live Chat** panel
2. Press Enter / Send
   - ✅ Message appears in chat with the attendee's name
3. Switch to the **host window** — the message should appear in the host's chat too
   - ✅ **Real-time bidirectional chat confirmed**

---

### Test 3.5 — CTA Trigger (Host → Attendee)
1. In the **host** window, scroll to the **CTA Controls** panel
2. Click **"Drop Buy Now"**
   - ✅ Host sees a success toast: "Buy Now CTA sent to all attendees!"
3. Switch to the **attendee** (incognito) window
   - ✅ A **CTA Banner slides up** from the bottom: "Buy Now — Claim Offer"
4. Click **"Claim Offer"** in the attendee window
   - ✅ Toast: "Awesome! Offer claimed — check your email."
   - ✅ Banner dismisses
5. Go to **host window** → Webinar Detail → **Pipeline tab**
   - ✅ The test attendee should now appear under **"Added to Cart"** / "Bought" section

---

### Test 3.6 — Pipeline Verification
1. Open your Webinar Detail page: `http://localhost:3000/webinars/[id]`
2. Click the **"Pipeline"** tab
3. ✅ **Expected attendance counts**:
   - **Registered**: 1 (test@test.com registered)
   - **Attended**: 1 (they joined the live view)
   - **Added to Cart**: 1 (they clicked "Claim Offer" on the Buy Now CTA)

---

## 🔴 Common Issues & Fixes

| Problem | Fix |
|---|---|
| Camera doesn't appear in host room | Refresh page, re-allow browser camera permission |
| Attendee gets 401/403 from Stream | Check `NEXT_PUBLIC_STREAM_API_KEY` and `STREAM_SECRET_KEY` in `.env` |
| Attendee redirected to registration | Clear `localStorage` for localhost or use a fresh incognito window |
| Chat doesn't load | Wait 3-5 seconds — Stream Chat takes a moment to connect |
| Video not showing in attendee view | Ensure host room tab is still active (don't close it) |
| "Call type not found" error | Go to Stream dashboard → Call Types → create a `livestream` type |

---

## ✅ Quick Smoke Test Checklist

```
[ ] Webinar created successfully
[ ] Status changes: SCHEDULED → WAITING_ROOM → LIVE → ENDED
[ ] Host live room loads with webcam
[ ] Host camera/mic toggle works
[ ] Host can send chat messages
[ ] Attendee landing page loads (public, no login)
[ ] Attendee registration works
[ ] Unregistered access to /live redirects to registration
[ ] Registered attendee joins live and sees host's video
[ ] Attendee can send chat messages visible to host
[ ] Host drops "Buy Now" CTA → appears on attendee screen
[ ] Attendee clicks CTA → Pipeline tab reflects the conversion
```

---

*All 12 checks passing = Phases 1–3 complete ✅*
