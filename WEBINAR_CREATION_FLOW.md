# 🎬 Webinar Creation — Complete Code Walkthrough

This document explains **every single file**, every function, and every line of logic involved in creating a webinar on this platform — from the moment a user clicks "Create Webinar" to the moment the record is saved in the database.

---

## 📁 File Map — Everything Involved

```
src/
├── app/
│   └── (protectedRoutes)/
│       └── webinars/
│           ├── page.tsx                          ← The /webinars page (entry point)
│           └── _components/
│               ├── WebinarTabs.tsx               ← Displays all webinars in tabs
│               ├── WebinarCard.tsx               ← Individual webinar card UI
│               └── WebinarFilterButton.tsx       ← Sort dropdown
│
├── components/ui/ReusableComponent/
│   └── CreateWebinarButton/
│       ├── index.tsx                             ← Dialog shell + success screen
│       ├── MultiStepForm.tsx                     ← Step controller + submit logic
│       ├── BasicInfoStep.tsx                     ← Step 1: Name, date, time, video
│       ├── CTAStep.tsx                           ← Step 2: CTA label, tags, AI agent
│       ├── ProductInfoStep.tsx                   ← Step 3: Product title, price
│       └── AdditionalInfoStep.tsx                ← Step 4: Lock chat, coupon
│
├── store/
│   └── useWebinarStore.ts                        ← Global Zustand state (form data + validation)
│
├── actions/
│   ├── webinar.ts                                ← Server Action: creates webinar in DB
│   ├── auth.ts                                   ← Server Action: authenticates the user
│   └── vapi.ts                                   ← Fetches AI assistants from VAPI
│
├── lib/
│   └── type.ts                                   ← Validation logic for each form step
│
prisma/
└── schema.prisma                                 ← Database model for Webinar
```

---

## 🔄 The Flow — Step by Step

```
User clicks "Create Webinar"
         │
         ▼
   [index.tsx] opens Dialog
         │
         ▼
   [MultiStepForm.tsx] renders steps
         │
    ┌────┴──────────────────────────────────┐
    ▼                                       ▼
Step 1: BasicInfoStep           validates via useWebinarStore
Step 2: CTAStep                        (Zustand + lib/type.ts)
Step 3: ProductInfoStep
Step 4: AdditionalInfoStep
    │
    ▼
  "Complete" button → calls createWebinar() server action
    │
    ▼
  [actions/webinar.ts] authenticates, validates, saves to DB via Prisma
    │
    ▼
  Returns webinarId → success screen shows shareable link
```

---

## 🌐 ENTRY POINT — `/webinars/page.tsx`

**Path:** `src/app/(protectedRoutes)/webinars/page.tsx`

This is the server-side page that renders the `/webinars` route.

```tsx
const Page = async () => {
  // 1. Authenticate the user server-side using Clerk
  const checkUser = await onAuthenticateUser();
  if (!checkUser.user) redirect("/"); // redirect if not logged in

  // 2. Fetch all webinars for this presenter from the database
  const webinars = await getWebinarByPresenterId(checkUser?.user?.id);

  return (
    <div>
      {/* Header with the Create Webinar button */}
      <CreateWebinarButton>
        <Plus /> Create Webinar
      </CreateWebinarButton>

      {/* Grid of webinar cards, filterable by tab */}
      <WebinarTabs webinars={webinars ?? []} />
    </div>
  );
};
```

**Key points:**
- This is an **async Server Component** — it runs on the server, fetches data, and sends HTML to the browser.
- `onAuthenticateUser()` (from `actions/auth.ts`) uses **Clerk** to verify the session.
- `getWebinarByPresenterId()` (from `actions/webinar.ts`) runs a **Prisma query** to get webinars from the database.
- `<CreateWebinarButton>` — this is where the modal originates.

---

## 🔐 AUTHENTICATION — `actions/auth.ts`

**Path:** `src/actions/auth.ts`

```ts
"use server";

export async function onAuthenticateUser() {
  const user = await currentUser(); // Uses Clerk to get the signed-in user

  if (!user) return { status: 403, message: "User not found" };

  // Check if user already exists in our own database
  const userExists = await prismaClient.user.findUnique({
    where: { clerkId: user.id },
  });

  if (userExists) return { status: 200, user: userExists };

  // First login: create a new user record in the DB
  const newUser = await prismaClient.user.create({
    data: {
      clerkId: user.id,
      email: user.emailAddresses[0].emailAddress,
      name: user.fullName ?? user.username ?? "Unknown",
      profileImage: user.imageUrl,
    },
  });

  return { status: 201, user: newUser };
}
```

**Why this matters for webinar creation:**
- Every server action that creates/modifies data calls this first.
- It maps a **Clerk identity** (the auth provider) to a **database `User` record** (the app's own data).
- The returned `user.id` becomes the `presenterId` when creating a webinar.

---

## 🧠 STATE MANAGEMENT — `store/useWebinarStore.ts`

**Path:** `src/store/useWebinarStore.ts`

This is a **Zustand** global store. It holds all the form data across the 4 steps — so when you go from Step 1 to Step 2, nothing is lost.

### The Form Data Shape

```ts
export type WebinarFormState = {
  basicInfo: {
    webinarName?: string;
    description?: string;
    date?: Date;
    time?: string;
    videoUrl?: string | null;   // from UploadThing if pre-recorded
    isPreRecorded?: boolean;
  };

  cta: {
    ctaLabel?: string;          // e.g. "Let's Get Started"
    tags?: string[];            // ["marketing", "sales"]
    ctaType: CtaTypeEnum;       // "BUY_NOW" | "BOOK_A_CALL"
    aiAgent?: string;           // VAPI assistant ID (if BOOK_A_CALL)
  };

  additionalInfo: {
    lockChat?: boolean;         // Toggle to lock/unlock chat
    couponCode?: string;        // e.g. "PROMO2026"
    couponEnabled?: boolean;    // Whether coupon is active
  };

  productInfo: {
    productTitle?: string;      // e.g. "Premium Mastery Course"
    price?: number;             // Selling price
    currency?: string;          // "INR" | "USD" | "EUR" | "GBP"
    originalPrice?: number;     // MSRP (for showing a discount)
  };
};
```

### Key Store Functions

| Function | What it does |
|---|---|
| `updateBasicInfoField(field, value)` | Updates a field in basicInfo and re-validates |
| `updateCTAField(field, value)` | Updates a field in cta and re-validates |
| `updateProductInfoField(field, value)` | Updates a field in productInfo and re-validates |
| `updateAdditionalInfoField(field, value)` | Updates a field in additionalInfo and re-validates |
| `addTag(tag)` | Pushes a new string into `cta.tags[]` |
| `removeTag(tag)` | Filters out a tag from `cta.tags[]` |
| `validateStep(stepId)` | Runs the validator for a step, updates validation state, returns `true/false` |
| `getStepValidationErrors(stepId)` | Returns the current errors object for a step (used by step components to show red text) |
| `setModalOpen(open)` | Opens/closes the Dialog |
| `setComplete(complete)` | Switches the dialog to the success screen |
| `setSubmitting(submitting)` | Enables the loading spinner on the "Complete" button |

**How validation is wired:**
Every `updateXxxField()` function automatically re-runs the validator after each keystroke. This enables **live error clearing** — errors disappear as soon as the user fills in the required fields.

---

## ✅ VALIDATION LOGIC — `lib/type.ts`

**Path:** `src/lib/type.ts`

Four pure validation functions, one per step:

### `validateBasicInfo(data)`
```ts
// Required: webinarName, description, date, time
if (!data.webinarName?.trim()) errors.webinarName = "Webinar name is required";
if (!data.description?.trim()) errors.description = "Description is required";
if (!data.date) errors.date = "Date is required";
if (!data.time?.trim()) errors.time = "Time is required";
```

### `validateCTA(data)`
```ts
if (!data.ctaLabel?.trim()) errors.ctaLabel = "CTA label is required";
if (!data.ctaType) errors.ctaType = "Please select a CTA type";
// AI agent is only required when "Book a Call" is selected
if (data.ctaType === "BOOK_A_CALL" && !data.aiAgent?.trim())
  errors.aiAgent = "Select an AI agent for Book a Call";
```

### `validateProductInfo(data)`
```ts
if (!data.productTitle?.trim()) errors.productTitle = "Product title is required";
if (data.price === undefined || data.price < 0) errors.price = "Valid price is required";
if (!data.currency) errors.currency = "Currency is required";
```

### `validateAdditionalInfo(data)`
```ts
// Only required if coupon is enabled
if (data.couponEnabled && !data.couponCode?.trim())
  errors.couponCode = "Coupon code is required when enabled";
```

Each returns: `{ valid: boolean, errors: Record<string, string> }`

---

## 🪟 DIALOG CONTAINER — `CreateWebinarButton/index.tsx`

**Path:** `src/components/ui/ReusableComponent/CreateWebinarButton/index.tsx`

This component does two things:
1. **Renders the trigger button** that opens the modal.
2. **Switches between two views** inside the dialog: the multi-step form OR the success screen.

```tsx
const CreateWebinarButton = ({ children, className }) => {
  const { isModalOpen, setModalOpen, isComplete, setComplete } = useWebinarStore();
  const [webinarLink, setWebinarLink] = useState("");

  // Called by MultiStepForm after successful creation
  const handleComplete = (webinarId: string) => {
    setComplete(true); // triggers switch to success screen
    setWebinarLink(`${process.env.NEXT_PUBLIC_BASE_URL}/webinar/${webinarId}`);
  };

  // The 4 steps passed to MultiStepForm
  const steps = [
    { id: "basicInfo",      title: "Basic Information", component: <BasicInfoStep /> },
    { id: "cta",            title: "CTA",               component: <CTAStep /> },
    { id: "productInfo",    title: "Product Info",      component: <ProductInfoStep /> },
    { id: "additionalInfo", title: "Additional Info",   component: <AdditionalInfoStep /> },
  ];

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => {
      setModalOpen(open);
      if (!open) setComplete(false); // reset success screen when dialog closes
    }}>
      <DialogTrigger>
        {children || <><PlusIcon /> Create Webinar</>}
      </DialogTrigger>

      <DialogContent>
        {isComplete ? (
          // SUCCESS SCREEN: Shows link + Copy + Go to Dashboard
          <SuccessScreen webinarLink={webinarLink} />
        ) : (
          // FORM: The multi-step wizard
          <MultiStepForm steps={steps} onComplete={handleComplete} />
        )}
      </DialogContent>
    </Dialog>
  );
};
```

**Why `isComplete` is important:**
When the server action succeeds, `handleComplete(webinarId)` is called. This sets `isComplete = true` in Zustand, which causes the dialog to re-render and swap out the `<MultiStepForm>` for the success screen. The success screen shows the shareable public link and a copy button.

---

## 📋 STEP CONTROLLER — `MultiStepForm.tsx`

**Path:** `src/components/ui/ReusableComponent/CreateWebinarButton/MultiStepForm.tsx`

This is the **brain** of the form. It manages which step you're on, handles navigation, and calls the server action on the final step.

### State inside `MultiStepForm`

```ts
const [completedSteps, setCompletedSteps] = useState<string[]>([]);
const [currentStepIndex, setCurrentStepIndex] = useState(0);
const [validationError, setValidationError] = useState<string | null>(null);
```

### `handleNext()` — the most important function

```ts
const handleNext = async () => {
  setValidationError(null);

  // 1. Validate the current step using Zustand's validator
  const isValid = validateStep(currentStep.id as keyof typeof formData);

  if (!isValid) {
    setValidationError("Please fill in all the required fields");
    return; // Stop here — don't advance
  }

  // 2. Mark this step as completed (turns the circle green with a checkmark)
  if (!completedSteps.includes(currentStep.id)) {
    setCompletedSteps([...completedSteps, currentStep.id]);
  }

  // 3. If we're on the last step, submit to the server
  if (isLastStep) {
    try {
      setSubmitting(true); // shows spinner on button

      const result = await createWebinar(formData); // CALLS SERVER ACTION

      if (result.status === 200 && result.webinarId) {
        toast.success("Webinar Scheduled!");
        onComplete(result.webinarId); // switches dialog to success screen
      } else {
        toast.error(result.message || "An error occurred");
        setValidationError(result.message || "An error occurred");
      }

      router.refresh(); // refreshes the page so the new webinar appears in the list
    } catch (error) {
      toast.error("Failed to create webinar. Please try again.");
    } finally {
      setSubmitting(false); // hide spinner
    }
  } else {
    // 4. Not the last step — just go to the next one
    setCurrentStepIndex((prev) => prev + 1);
  }
};
```

### The Left Panel (Step Progress Indicator)

The left 1/3 of the form renders the step list with animated circles:
- **White filled circle + checkmark** = completed step
- **White circle (animated pulse)** = current step
- **Grey circle** = future step
- **Animated white line** fills in vertically as steps are completed

This uses **Framer Motion** (`AnimatePresence`, `motion.div`) for smooth transitions.

### The Right Panel

The right 2/3 renders the current step's component with a slide animation (x: 20 → 0, opacity: 0 → 1 on enter; x: -20, opacity: 0 on exit).

---

## 📝 STEP 1 — `BasicInfoStep.tsx`

**Path:** `src/components/ui/ReusableComponent/CreateWebinarButton/BasicInfoStep.tsx`

Collects: **Webinar Name**, **Description**, **Date**, **Time**, and optionally a **pre-recorded video**.

### Key behaviours

**Text inputs** — bind to store via `updateBasicInfoField`:
```tsx
<Input
  name="webinarName"
  value={webinarName || ""}
  onChange={(e) => updateBasicInfoField("webinarName", e.target.value)}
/>
```

**Date picker** — uses a Popover + Calendar (shadcn/ui):
```ts
const handleDateChange = (newDate: Date | undefined) => {
  if (newDate) {
    // Normalize to UTC midnight to avoid timezone issues in server actions
    const normalizedDate = new Date(Date.UTC(
      newDate.getFullYear(), newDate.getMonth(), newDate.getDate()
    ));
    updateBasicInfoField("date", normalizedDate);
  }
};
```
Past dates are **disabled** in the calendar component.

**Time picker** — uses the custom `<TimePicker>` component (renders hour and minute selects), bound with:
```tsx
<TimePicker
  value={time}
  onChange={(val) => updateBasicInfoField("time", val)}
/>
```

**Video upload** — uses UploadThing:
```tsx
<UploadButton
  endpoint="videoUploader"
  onClientUploadComplete={(res) => {
    updateBasicInfoField("videoUrl", res[0].url);
    updateBasicInfoField("isPreRecorded", true);
    toast.success("Video uploaded successfully!");
  }}
/>
```
When a video is uploaded, `isPreRecorded` becomes `true` and the webinar is treated as pre-recorded. A "Remove Video" button replaces the upload button.

**Error display** (pattern used across all steps):
```tsx
{errors.webinarName && (
  <p className="text-red-400 text-[10px]">{errors.webinarName}</p>
)}
```
`errors` comes from `getStepValidationErrors("basicInfo")` — the store returns the current error map.

---

## 📢 STEP 2 — `CTAStep.tsx`

**Path:** `src/components/ui/ReusableComponent/CreateWebinarButton/CTAStep.tsx`

Collects: **CTA Label**, **Tags**, **CTA Type** (Buy Now vs Book a Call), and conditionally either **Product details** or an **AI Agent**.

### CTA Type Toggle (Tab)

```tsx
<Tabs value={ctaType} onValueChange={handleSelectCTAType}>
  <TabsTrigger value="BOOK_A_CALL">Book a Call</TabsTrigger>
  <TabsTrigger value="BUY_NOW">Buy Now</TabsTrigger>
</Tabs>
```

When the user switches:
```ts
const handleSelectCTAType = (value: string) => {
  updateCTAField("ctaType", value as CtaTypeEnum);
  if (value === "BUY_NOW") {
    updateCTAField("aiAgent", ""); // clear AI agent if switching to Buy Now
  }
};
```

### AI Agent Dropdown (for BOOK_A_CALL)

This fetches VAPI assistants from the server when the step loads:
```ts
useEffect(() => {
  (async () => {
    const res = await getVapiAssistants();
    if (res.success && res.assistants) setAssistants(res.assistants);
  })();
}, []);
```
The `<Select>` then renders each assistant by name. The selected value is the assistant's **ID** (a UUID from VAPI), which gets stored as `aiAgentId` in the database.

### Tag system

```tsx
<Input
  placeholder="Add tags and press Enter"
  onKeyDown={(e) => {
    if (e.key === "Enter" && tagInput.trim()) {
      addTag(tagInput.trim()); // calls Zustand's addTag
      setTagInput("");
    }
  }}
/>
{tags.map((tag) => (
  <div key={tag}>
    {tag}
    <button onClick={() => removeTag(tag)}><X /></button>
  </div>
))}
```

### Conditional BUY_NOW fields

When `ctaType === "BUY_NOW"`, product name and price fields render inline:
```tsx
{ctaType === CtaTypeEnum.BUY_NOW && (
  <>
    <Input value={productTitle} onChange={(e) => updateProductInfoField("productTitle", ...)} />
    <Input type="number" value={price} onChange={(e) => updateProductInfoField("price", ...)} />
  </>
)}
```

---

## 🛒 STEP 3 — `ProductInfoStep.tsx`

**Path:** `src/components/ui/ReusableComponent/CreateWebinarButton/ProductInfoStep.tsx`

Collects: **Product/Offer Title**, **Selling Price**, **Currency**, and optionally **Original Price (MSRP)**.

```tsx
const handleChange = (e) => {
  const { name, value } = e.target;
  if (name === "price" || name === "originalPrice") {
    updateProductInfoField(name, parseFloat(value) || 0); // always stored as number
  } else {
    updateProductInfoField(name, value);
  }
};
```

**Currency selector** — a `<Select>` with INR, USD, EUR, GBP options:
```tsx
<Select
  value={currency || "INR"}
  onValueChange={(val) => updateProductInfoField("currency", val)}
>
  <SelectItem value="INR">INR (₹)</SelectItem>
  <SelectItem value="USD">USD ($)</SelectItem>
  ...
</Select>
```

**Pricing Strategy Tip** — an emerald-coloured info box explaining that setting an original price shows a "Discounted" badge in the AI breakout room (a psychological conversion booster).

---

## ⚙️ STEP 4 — `AdditionalInfoStep.tsx`

**Path:** `src/components/ui/ReusableComponent/CreateWebinarButton/AdditionalInfoStep.tsx`

Collects two toggles: **Lock Chat** and **Coupon System**.

```tsx
// Lock Chat toggle
<Switch
  checked={lockChat || false}
  onCheckedChange={(checked) => updateAdditionalInfoField("lockChat", checked)}
/>

// Coupon system toggle
<Switch
  checked={couponEnabled || false}
  onCheckedChange={(checked) => updateAdditionalInfoField("couponEnabled", checked)}
/>

// Coupon code input — only shown when couponEnabled is true
{couponEnabled && (
  <Input
    value={couponCode || ""}
    onChange={(e) => updateAdditionalInfoField("couponCode", e.target.value)}
    placeholder="PROMO2026"
  />
)}
```

Validation note: if `couponEnabled = true` but `couponCode` is empty, the validator blocks "Complete" and shows an error.

---

## 🚀 SERVER ACTION — `actions/webinar.ts` → `createWebinar()`

**Path:** `src/actions/webinar.ts`

This is the only function that **actually writes to the database**. It runs entirely on the server.

### Full logic breakdown

```ts
"use server";

export const createWebinar = async (formData: WebinarFormState) => {
  try {
    // STEP A: Authenticate the user
    const user = await onAuthenticateUser();
    if (!user.user) return { status: 401, message: "Unauthorized" };

    // STEP B: SaaS Gate — user must be on Pro plan
    const dbUser = await prismaClient.user.findUnique({
      where: { id: user.user.id },
      select: { isPro: true, proExpiresAt: true },
    });
    if (!dbUser?.isPro || !dbUser.proExpiresAt || dbUser.proExpiresAt < new Date()) {
      return { status: 403, message: "Active Pro Pass required." };
    }

    // STEP C: Server-side field validation (defence in depth)
    if (!formData.basicInfo.webinarName) return { status: 404, message: "Webinar name is required" };
    if (!formData.basicInfo.date)        return { status: 404, message: "Webinar date is required" };
    if (!formData.basicInfo.time)        return { status: 404, message: "Webinar time is required" };
    if (!formData.basicInfo.description) return { status: 404, message: "Webinar description is required" };

    // STEP D: Combine date + time into a single UTC DateTime
    const combinedDateTime = combineDateTime(formData.basicInfo.date, formData.basicInfo.time);

    // STEP E: Reject past dates
    if (combinedDateTime < new Date()) {
      return { status: 400, message: "Webinar date and time cannot be in the past" };
    }

    // STEP F: Write to the database via Prisma
    const webinar = await prismaClient.webinar.create({
      data: {
        title: formData.basicInfo.webinarName,
        description: formData.basicInfo.description || "",
        startTime: combinedDateTime,
        tags: formData.cta.tags || [],
        ctaLabel: formData.cta.ctaLabel,
        ctaType: formData.cta.ctaType,
        aiAgentId: formData.cta.aiAgent || null,
        lockChat: formData.additionalInfo.lockChat || false,
        couponCode: formData.additionalInfo.couponEnabled ? formData.additionalInfo.couponCode : null,
        couponEnabled: formData.additionalInfo.couponEnabled || false,
        presenterId: user.user.id,
        productTitle: formData.productInfo.productTitle,
        productName: formData.productInfo.productTitle,
        price: formData.productInfo.price ? Math.round(formData.productInfo.price) : 0,
        currency: formData.productInfo.currency,
        originalPrice: formData.productInfo.originalPrice,
        videoUrl: formData.basicInfo.videoUrl || null,
        isPreRecorded: formData.basicInfo.isPreRecorded || false,
      },
    });

    // STEP G: Invalidate the cached page so the new webinar shows immediately
    revalidatePath("/");

    // STEP H: Return success with the new webinar's ID
    return {
      status: 200,
      message: "Webinar created Successfully",
      webinarId: webinar.id,
      webinarLink: `/webinar/${webinar.id}`,
      managementLink: `/webinars/${webinar.id}`,
    };

  } catch (error) {
    return { status: 500, message: "Failed to create webinar. Please try again" };
  }
};
```

### `combineDateTime()` — Timezone handling

```ts
function combineDateTime(date: Date, timeStr: string): Date {
  const [hoursStr, minutesStr] = timeStr.split(":");
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr || "0", 10);

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();

  // date is UTC midnight. We treat the user's input as IST (UTC+5:30).
  // So we subtract 330 minutes (5h30m) to get the correct UTC value.
  const istAsUtcMs = Date.UTC(year, month, day, hours, minutes, 0, 0) - 330 * 60 * 1000;
  return new Date(istAsUtcMs);
}
```

This is essential because:
- The date picker normalises the picked date to UTC midnight.
- The time string (e.g. `"14:30"`) represents IST (Indian Standard Time).
- PostgreSQL stores datetimes in UTC, so we must convert properly.

---

## 🗄️ DATABASE MODEL — `prisma/schema.prisma`

The `Webinar` model in Prisma:

```prisma
model Webinar {
  id            String            @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title         String            @db.VarChar(255)
  description   String?
  startTime     DateTime                              // The combined date+time (UTC)
  endTime       DateTime?
  duration      Int               @default(0)
  webinarStatus WebinarStatusEnum @default(SCHEDULED) // starts as SCHEDULED
  presenterId   String            @db.Uuid            // FK to User
  tags          String[]
  ctaLabel      String?           @db.VarChar(50)
  ctaType       CtaTypeEnum                           // BUY_NOW | BOOK_A_CALL
  ctaUrl        String?
  couponCode    String?           @db.VarChar(50)
  couponEnabled Boolean           @default(false)
  lockChat      Boolean           @default(false)
  aiAgentId     String?           @db.Uuid            // VAPI assistant ID
  currency      String            @default("INR")
  originalPrice Float?
  price         Float             @default(0)
  productTitle  String?
  productName   String?
  isPreRecorded Boolean           @default(false)
  videoUrl      String?           @db.VarChar(500)
  attendances   Attendance[]
  presenter     User              @relation("PresenterWebinars", ...)

  @@index([presenterId])
  @@index([startTime])
}

enum WebinarStatusEnum {
  SCHEDULED     // Just created, hasn't started yet
  WAITING_ROOM  // Open for attendees to join, not started
  LIVE          // Currently live
  ENDED         // Webinar is over
  CANCELLED
}

enum CtaTypeEnum {
  BUY_NOW       // Shows product + price for purchase
  BOOK_A_CALL   // Triggers AI voice call via VAPI
}
```

---

## 🃏 DISPLAYING WEBINARS AFTER CREATION

### `WebinarTabs.tsx`
After creation, `router.refresh()` is called (in MultiStepForm) and `revalidatePath("/")` is called (in the server action). This causes the page to re-fetch and re-render with the new webinar.

`WebinarTabs` filters the list client-side:
- **All** → shows everything
- **Upcoming** → `SCHEDULED` with `startTime > 1 hour ago` or `WAITING_ROOM`
- **Live** → `LIVE`
- **Ended** → `ENDED` or `SCHEDULED` with `startTime <= 1 hour ago`

Sorting is driven by a `?sort=` URL search param read with `useSearchParams()`.

### `WebinarCard.tsx`
Each card links to `/webinars/${webinar.id}` (the management page) and shows title, description, date, time, and status badge.

---

## 🔑 Key Design Patterns to Know

| Pattern | Where | Why |
|---|---|---|
| **Zustand global store** | `useWebinarStore.ts` | Persists form state across steps without prop-drilling |
| **Live validation** | Every `updateXxxField()` call | Errors clear as user types — better UX than submit-only validation |
| **Defence in depth** | Both `lib/type.ts` AND `actions/webinar.ts` | Client validation for UX, server validation for security |
| **Server Actions (`"use server"`)** | `actions/webinar.ts` | No separate API route needed — Next.js calls the function directly |
| **`revalidatePath`** | End of `createWebinar()` | Clears Next.js's cache so the new webinar immediately appears |
| **Framer Motion** | `MultiStepForm.tsx` | Animated step transitions and progress indicator |
| **UploadThing** | `BasicInfoStep.tsx` | Handles video uploads for pre-recorded sessions |
| **Clerk** | `actions/auth.ts` | Sessions and authentication without rolling your own auth |
| **Prisma** | `actions/webinar.ts` | Type-safe database queries against PostgreSQL |

---

## 📦 NPM Packages Involved

| Package | Role |
|---|---|
| `zustand` | Client state management for the form |
| `@clerk/nextjs` | Authentication (currentUser, session) |
| `@prisma/client` | Database ORM |
| `framer-motion` | Step transition animations |
| `uploadthing` | Video file uploads |
| `date-fns` | Date formatting in the UI |
| `sonner` | Toast notifications |
| `lucide-react` | Icons |
| `next` | Framework (server actions, routing, caching) |
