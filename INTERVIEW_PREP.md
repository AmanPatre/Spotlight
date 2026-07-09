# Spotlight — Interview Preparation Guide
## All Likely Technical Questions + Model Answers

---

## CATEGORY 1: WebRTC & Streaming Architecture

**Q1: How does live streaming work in your project?**
> We use GetStream's Video SDK which is built on top of WebRTC with an SFU (Selective Forwarding Unit) architecture. The host's browser captures video/audio and sends it to GetStream's SFU server. The SFU then replicates and forwards that single stream to all connected attendees, instead of the host establishing individual peer-to-peer connections with each attendee. This means the host's bandwidth stays constant regardless of whether 1 or 10,000 people are watching.

**Q2: What is the difference between SFU and P2P WebRTC?**
> In pure P2P, the host would need to upload the same video feed for every individual attendee — 500 attendees means 500 upload streams, which would instantly crash any browser. In an SFU model, the host uploads once to the central server, and the server handles the distribution. GetStream abstracts all of this complexity.

**Q3: How does the attendee join the live stream — what is the code flow?**
> The attendee lands on `/webinar/[id]/live`, which renders `AttendeeLiveClient.tsx`. This component first checks localStorage for a `spotlight_attendee_${webinarId}` key to verify they have a valid ticket. It then calls `/api/attendee-stream-token` to get a signed JWT from GetStream's servers. That JWT is used to initialize the Video client with `videoClient.call("livestream", webinarId)` followed by `call.join()`. The attendee is then connected as a viewer to the SFU room.

**Q4: How did you secure the attendee stream token endpoint?**
> Originally the endpoint just took an `attendeeId` and blindly generated a token. We identified this as a security vulnerability — any hacker who knew the webinarId could forge a LocalStorage entry and gain access. We fixed this by requiring both `attendeeId` AND `webinarId` in the request body, then doing a `prismaClient.attendance.findUnique()` database query to verify a legitimate attendance record exists. If no record is found, we return a `403 Forbidden` before generating any token.

---

## CATEGORY 2: Real-Time Events & CTA System

**Q5: How does the CTA popup appear on all attendees' screens at the same time?**
> We deliberately avoided HTTP polling or WebSockets with a separate server for this. Instead, we piggyback on the existing WebRTC Data Channel that GetStream maintains. On the host side, `call.sendCustomEvent({ type: "show-cta", ... })` sends a JSON payload through the Data Channel tunnel. On the attendee side, `call.on("custom", (event) => { ... })` listens for incoming custom events and updates the React state to show the CTA banner. Because this uses the WebRTC tunnel instead of HTTP, it's sub-100ms — it feels instant.

**Q6: What is a WebRTC Data Channel?**
> A WebRTC connection can carry two types of data — Media Tracks (audio/video streams) and Data Channels (arbitrary binary or text data). Once a WebRTC connection is established, the Data Channel is a free, bidirectional, low-latency tunnel. GetStream exposes it through `call.sendCustomEvent()` and `call.on("custom")`. We use it for the CTA trigger instead of making a separate API call.

**Q7: Why not just use a REST API call to show the CTA banner?**
> Three reasons: First, latency — an HTTP request adds 100-500ms of round-trip time. For a Sales CTA, every millisecond counts. Second, it would require 500 individual or a polling mechanism to notify everyone. Third, we already have an open WebRTC Data Channel to all attendees — it's essentially free to use.

---

## CATEGORY 3: Razorpay Payments

**Q8: Explain your payment flow end to end.**
> Step 1 — The frontend calls our backend `/api/payment/razorpay/order`. The backend queries the DB for the actual price (never trust frontend price), converts it to paise (×100), and calls `razorpay.orders.create()`. The order ID is returned. Step 2 — The browser loads Razorpay's iframe (`rzp.open()`). The user enters their payment details directly into Razorpay's servers — our server never sees card data. Step 3 — After payment, Razorpay hands the browser a `razorpay_signature`. The browser sends this to our `/verify` endpoint. We recreate the HMAC-SHA256 hash using our secret key and compare. If it matches, the payment is real and we update the DB. Step 4 — As a safety net, Razorpay also fires a webhook to our `/api/payment/razorpay/webhook` in the background for cases where the browser crashes.

**Q9: What is HMAC-SHA256 and why is it used for payment verification?**
> HMAC stands for Hash-based Message Authentication Code. It takes two inputs — the data (`order_id + "|" + payment_id`) and a secret key (`RAZORPAY_KEY_SECRET`) — and mathematically scrambles them into a fixed-length hash string. Razorpay creates this hash on their server and sends it to us. Our server creates the same hash independently using the same data and our copy of the secret key. If the two outputs are identical, it is mathematically impossible for the data to have been tampered with or faked, because only we and Razorpay know the secret key.

**Q10: What is a Webhook and why did you implement one for payments?**
> A webhook is a server-to-server HTTP callback. You register your URL with Razorpay's dashboard, and Razorpay calls that URL the moment a payment event occurs — completely independent of what the user's browser is doing. We implemented it as a safety net for the "dead phone" scenario: if a user pays but their browser crashes before our client-side `/verify` code runs, the database would never be updated and they'd lose their purchase. The webhook guarantees the DB update happens regardless, because it runs on Razorpay's server, not the user's device.

**Q11: What is the Idempotency check in your webhook?**
> Razorpay's documentation warns that webhooks can sometimes fire more than once for the same event (due to network retries). Without protection, we could mark an attendee as CONVERTED twice, or worse, create duplicate database records. We prevent this using a `ProcessedWebhook` table. Before processing any incoming webhook event, we check if that event's unique ID already exists in the table. If it does, we return `200 OK` without doing anything. If not, we process normally and then add the event ID to the table.

**Q12: What is Razorpay Route and how does it work in your project?**
> Razorpay Route is a marketplace feature. Spotlight is a platform where external Hosts sell their products. When an attendee pays ₹5,000, that money shouldn't stay in Spotlight's bank account — it belongs to the Host. We implement this by adding a `transfers` array to the order creation options. This tells Razorpay to automatically route 100% of the captured payment to the Host's linked Razorpay account (`razorpayAccountId` stored in our DB) the moment it's captured.

---

## CATEGORY 4: VAPI AI Breakout Rooms

**Q13: How does the AI voice conversation work technically?**
> When the attendee enters `/webinar/[id]/call`, we first use `navigator.mediaDevices.getUserMedia()` to request microphone permission and capture the audio stream. When they click Join, we instantiate the VAPI SDK and call `vapi.start(assistantId, { metadata: { webinarId, attendeeId } })`. This opens a WebRTC audio tunnel directly between the attendee's browser and VAPI's cloud servers. On VAPI's side, the audio goes through STT (via Deepgram), then the LLM (via GPT/Claude) generates a response, and TTS (via ElevenLabs) converts it back to audio. The audio response streams back to the attendee's speakers in under 400ms.

**Q14: Why did you use `navigator.mediaDevices` instead of GetStream's SDK methods?**
> Because in the breakout room, we are no longer using GetStream. We left GetStream behind when the attendee navigated away from `/live`. GetStream's SDK helper methods like `call.microphone.enable()` are only available when inside a `<StreamCall>` context. In the VAPI room, we have no GetStream context, so we had to write native WebRTC browser API code to access the microphone directly.

**Q15: Will your system break if 500 attendees join the breakout room simultaneously?**
> No. The VAPI SDK runs entirely client-side in the attendee's browser. Our Next.js server's only involvement is running the single `prismaClient.attendance.findUnique()` database check to verify the ticket. That indexed query takes about 5ms. The actual WebRTC audio tunnel is drawn directly from the attendee's browser to VAPI's cloud — bypassing our server entirely. VAPI's infrastructure (built on AWS) automatically scales to handle thousands of parallel sessions.

---

## CATEGORY 5: Inngest Background Jobs

**Q16: Why did you use Inngest instead of just running the post-webinar logic in a regular API route?**
> Two critical reasons. First, Vercel has a 10-second timeout on Serverless functions. Our post-webinar pipeline takes 10+ minutes (it loops over attendees, fetches VAPI transcripts, calls Gemini AI, and sends emails). A regular API route would timeout and die halfway through. Second, Inngest gives us automatic retry logic. If the Gemini AI call fails for one attendee, Inngest retries just that `step.run()` block without re-running the entire pipeline from scratch.

**Q17: How does `step.sleep()` work? Isn't it blocking a server thread?**
> This is the clever part. Inngest's `step.sleep()` is NOT a regular `setTimeout`. When the code hits `step.sleep("5m")`, Inngest serializes the entire function's state — all variables, all completed steps — and saves it. The Vercel function terminates completely, freeing all resources. After 5 minutes, Inngest's scheduler wakes up and re-invokes the function, rehydrating it from the saved state and resuming exactly from where it left off. Zero server threads are blocked during the wait.

**Q18: How does the AI lead scoring work?**
> We loop over every active attendee and apply a decision tree. Converted buyers get score 10. Cart abandonments get 8. For BOOK_A_CALL webinars, if an attendee entered the VAPI room, we fetch their full call transcript from VAPI's API using `metadata.attendeeId` to identify their specific call. We then pass the transcript to Gemini 3.1 Flash Lite via Vercel's AI SDK `generateObject()`, which forces the model to respond in a strict Zod-validated schema: `{ summary: string, score: number(1-10) }`. This AI score is saved to the `CallDebrief` table in the database.

**Q19: Why do you embed `metadata: { webinarId, attendeeId }` when starting VAPI?**
> Because VAPI stores all calls centrally. When we later query `https://api.vapi.ai/call?assistantId=...`, VAPI returns ALL calls ever made with that assistant. We need to find the specific 1-on-1 call for a specific attendee in a specific webinar. By embedding the metadata at call-start time, we can use `calls.find(c => c.assistantOverrides.metadata.attendeeId === attendance.attendeeId)` to locate the exact call. Without this, we'd have no way to link a VAPI call back to a Spotlight attendee.

---

## CATEGORY 6: Architecture & Design Decisions

**Q20: Why did you use Server Actions instead of API Routes for most operations?**
> Server Actions eliminate the need for a separate HTTP fetch call. They run directly on the server as part of the React render cycle, have automatic CSRF protection, and allow us to use `revalidatePath()` for cache invalidation. We use them for all database mutations that originate from authenticated (host) users. We still use traditional API Routes for cases that need to be called from non-React contexts — like the Inngest engine, Razorpay webhooks, and GetStream token generation.

**Q21: What is the "Thundering Herd" problem and how does your project handle it?**
> When the host goes live, 500 attendees simultaneously hit `/api/attendee-stream-token` to get their WebRTC tokens. That's 500 database queries in one second. We handle this currently with PostgreSQL's indexed `findUnique` query, which is very fast (2-5ms per query) and Prisma's built-in connection pooling. For further scale (50,000+ users), the solution is a Redis cache layer: store attendance records in Redis on registration, and check Redis first before hitting PostgreSQL.

**Q22: Why did you use `window.open()` to launch the host into the broadcast room?**
> UX-driven decision. The host is likely monitoring multiple aspects of their webinar — their presentation slides, their script, the attendee dashboard. If we used `router.push()`, it would navigate away from the dashboard and they'd lose access to it. By opening the broadcast room in a new tab with `window.open()`, the host can keep their dashboard open in the original tab while broadcasting in the new tab.

**Q23: How is chat implemented?**
> Chat uses GetStream's Chat SDK (completely separate from the Video SDK), but it uses the same `webinarId` as the channel identifier. To connect to the chat channel, the attendee also needs a signed stream token — this is fetched from the same `/api/attendee-stream-token` endpoint that now requires database verification. The host's chat uses a Clerk-authenticated token from a separate `/api/stream-token` endpoint.

---

## CATEGORY 7: Security

**Q24: What security vulnerabilities did you identify and fix?**
> We identified that the `/api/attendee-stream-token` endpoint originally generated a valid WebRTC token for any `attendeeId` passed to it, without verifying the attendee had actually registered. A hacker who knew the webinarId could forge a localStorage entry and gain access to the live stream and chat. We fixed this by adding a Prisma `attendance.findUnique()` check using the composite key `{ attendeeId_webinarId }`. If no record exists, we return 403 Forbidden before generating any token.

**Q25: How do you prevent fake webhook calls to your payment webhook?**
> Every legitimate request from Razorpay includes an `x-razorpay-signature` header. This signature is an HMAC-SHA256 hash of the entire raw request body, generated using our `RAZORPAY_WEBHOOK_SECRET`. Our endpoint recreates this hash independently and compares. A hacker who found our webhook URL would need our Webhook Secret (stored in our .env) to generate a matching signature, which is impossible. Any request without a valid matching signature is immediately rejected with a 400 error.
