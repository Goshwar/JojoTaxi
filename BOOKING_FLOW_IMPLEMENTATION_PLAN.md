# Booking Flow Implementation Plan — FUNtastic Taxi & Tours

**Companion documents:** `CLAUDE.md` (architecture & conventions) · `GITHUB_ISSUES_GUIDE.md` (tracking protocol)
**Tracking:** GitHub issues [#17](https://github.com/Goshwar/JojoTaxi/issues/17)–[#21](https://github.com/Goshwar/JojoTaxi/issues/21)
**Branch:** `claude/booking-process-routing-18mdvv`
**Status:** Phases 1–4 implemented and pushed. Phase 5 (#21) open — n8n/product decision, deliberately out of scope here.

> ### Scope
> This plan covers the path a booking takes **from the customer pressing Confirm to a
> dispatcher acting on it**. It does not touch pricing, SEO, or the public marketing
> pages. Where it changes the live Supabase project or a live n8n workflow, that is
> called out explicitly and separately — those are not code changes and do not ship
> with a deploy.

---

## 1. What we were doing

The audit started by reading the flow end to end and comparing each step against the
**live** `Tours` schema, not the migrations folder — which, per #13, does not describe
the deployed database.

### Capture: correct

`BookingModal` serves both `/booking` (`mode="page"`) and the site-wide modal
(`mode="modal"`). Step 1 picks the service and everything downstream branches on it.
The insert wrote the real column names, set `booking_type` correctly, and left the
unused side NULL. Three live rows confirmed intact. The `FTT — New Booking Received`
workflow branches on the same `booking_type` and builds the right admin email for each.

**Nothing was wrong with how bookings were being written.** Everything after the insert
was.

### Delivery: four defects

| # | Defect | Effect | Issue |
|---|---|---|---|
| 1 | `/admin/bookings` typed against the never-applied `20260422025600` migration | Every booking rendered with a blank name, `— → —`, and no date | [#17](https://github.com/Goshwar/JojoTaxi/issues/17) |
| 2 | No routing by `booking_type`; neither service's own fields displayed | No flight number, no tour type, no pickup address anywhere on screen | [#17](https://github.com/Goshwar/JojoTaxi/issues/17) |
| 3 | Status webhook wired in `.env.example` and active in n8n, but **no caller** | Confirming in the admin panel told the customer nothing | [#18](https://github.com/Goshwar/JojoTaxi/issues/18) |
| 4 | `FTT — Email Approval` writes `status='declined'`, rejected by the CHECK constraint | Customer emailed a decline, green success page, booking still `pending` | [#19](https://github.com/Goshwar/JojoTaxi/issues/19) |

Plus one cosmetic: `/thank-you` read `sessionStorage.orderId` while both forms wrote
`bookingRef`, so the reference never printed ([#20](https://github.com/Goshwar/JojoTaxi/issues/20)).

And one security finding raised but **not** fixed here ([#21](https://github.com/Goshwar/JojoTaxi/issues/21)).

### The common cause

Three of the four are the same failure: **the shape of a booking was written down in
more than one place, and the copies drifted.** The form knew the live column names; the
admin list knew the migration's; `BookingWidget.tsx` held a third, unreferenced copy of
the whole submit path. Nothing forced them to agree, so nothing kept them agreeing.

---

## 2. How it should be

One module owns the description of a booking. Everything that names a `bookings`
column imports it from there, so a rename is a compile error rather than a blank cell
in production.

`booking_type` is the discriminator, and it decides which columns are populated:

- **Airport transfer** — `transfer_direction`, `flight_number`, `airline`, `pickup_location`, `dropoff_location`, `luggage_count`
- **Island tour** — `tour_type`, `hotel_address`, `duration_preference`, `accessibility_needs`

The unused side must be **NULL, not `''`** — `bookings_tour_type_check` and
`bookings_duration_preference_check` reject an empty string, so a transfer that sent
`tour_type: ''` fails the insert outright. The payload builder branches for that
reason, not for tidiness.

A booking reaches staff by two independent paths, and both must keep working:

1. **Supabase** — the anon INSERT is the record. It is the only step allowed to fail the customer's submit.
2. **n8n** — fire-and-forget. A booking already in Postgres is a booking; a bad minute on Render must not lose it.

Status changes have the same shape: write the status **and** post to the status
webhook, so the decision reaches the customer whichever surface it was made on.

---

## 3. Phase 1 — One description of a booking (#17)

### 3.1 `src/lib/bookings.ts` (new)

The single source of truth. Exports:

| Export | Purpose |
|---|---|
| `Booking` | The live row shape, all 25 columns, correct nullability |
| `BookingType`, `BookingStatus`, `TourType`, `TransferDirection`, `DurationPreference` | Mirror each CHECK constraint |
| `NotifiableStatus` | `confirmed \| declined` — the outcomes the customer is emailed about |
| `BOOKING_TYPE_LABELS`, `TOUR_TYPE_LABELS`, `DURATION_LABELS`, `TRANSFER_DIRECTION_LABELS` | Display strings, one place |
| `bookingRoute(b)` | The one-line "where is this going" summary, branched per type |
| `makeBookingRef()` | `FTT-YYYYMMDD-NNNN` |
| `buildBookingPayload(type, contact, details, ref?)` | The insert row, branched so the unused side is NULL |
| `notifyNewBooking(payload)` | POST → `VITE_N8N_WEBHOOK_URL` |
| `notifyBookingStatus(booking, status, reason?)` | POST → `VITE_N8N_STATUS_WEBHOOK_URL` |

### 3.2 `BookingModal.tsx`

Replace the inline ref generation, the hand-built `base`/`payload` branch and the raw
`fetch` with `makeBookingRef()`, `buildBookingPayload()` and `notifyNewBooking()`. The
form's own `FormState` stays local — it models the wizard, not the table.

### 3.3 `src/components/ui/BookingWidget.tsx` — delete

543 lines, not imported anywhere (`grep -rn "BookingWidget" src/` returns only itself),
carrying its own copy of validation, ref generation, payload construction, the insert
and the webhook post. A second place to drift, with no first use.

**Verify:** `tsc` clean · `eslint` clean · `vite build` passes · both payload shapes
accepted by the live CHECK constraints in a `BEGIN … ROLLBACK` transaction.

---

## 4. Phase 2 — Route bookings by service in the admin (#17)

### 4.1 `AdminBookings.tsx` — correct the reads

Typed as `Booking` from the shared module. The six wrong column names go away by
construction.

### 4.2 Service tabs

`All Bookings` · `Airport Transfers` · `Island Tours`, filtering server-side
(`.eq('booking_type', service)`) rather than in the browser, and each carrying a
**pending count** so an unworked tour cannot hide behind a page of transfers.

### 4.3 Type-specific detail rendering

`detailFields(b)` returns the labelled cells that apply to *this* booking:

```
airport_transfer → Direction · Flight Number · Airline · Pickup · Drop-off · Luggage
island_tour      → Tour · Hotel / Pickup · Duration · Accessibility Needs
```

Shared fields (email, phone, passengers, special requests, submitted) render for both.
Each row also carries a service badge so the type is legible in the collapsed list.

### 4.4 Index

`bookings_type_status_created_idx (booking_type, status, created_at DESC)` — exactly
the shape of the list query.

**Verify:** every field a dispatcher needs is on screen for both types; filters compose
(service × status); `vite build` passes.

---

## 5. Phase 3 — Close the notification gap (#18)

`AdminBookings.setStatus()` calls `notifyBookingStatus()` after a successful write.

Fire-and-forget, matching the new-booking webhook: the Supabase write is the record,
and a Render outage must not make a completed status change look failed.

Only `confirmed` and `declined` notify — which is exactly what the status workflow's
switch branches on. `cancelled` and a correction back to `pending` stay silent by
construction; `NotifiableStatus` is the type that enforces it.

**Verify:** payload checked field-by-field against the live workflow's node expressions
(`body.customer_email`, `body.customer_name`, `body.booking_type_label`, `body.decline_reason`).

---

## 6. Phase 4 — Make `declined` a real status (#19)

### 6.1 The decision

Two options were put to the owner. **Widening the constraint was chosen**, keeping two
genuinely different outcomes apart:

- **`declined`** — we turned the request down. Carries `decline_reason`, emails the customer.
- **`cancelled`** — called off after the fact, usually by the customer. No automated email; that conversation already happened.

This choice also meant **no live n8n workflow needed editing** — the existing
`'declined'` write became valid as-is. The alternative (remap n8n to `'cancelled'`)
would have required touching an active production workflow to collapse a distinction
worth keeping.

### 6.2 `supabase/migrations/20260826141500_allow_declined_booking_status.sql`

```sql
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled'));
```

Purely additive — every existing value stays valid, no row is rewritten, no backfill.

> **Live-database change.** Applied to the `Tours` project directly, not by a deploy.
> A fresh project reproduces it from the migration.

### 6.3 Admin actions

`Confirm` · `Decline` (prompts for the reason, stores `decline_reason`) · `Cancel`
(quiet, no email) · `Mark Pending`. Four status filter tabs.

**Verify:** the exact UPDATE the n8n node issues now succeeds where it previously
raised `23514`, tested in a rolled-back transaction. All 3 existing rows intact.

---

## 7. Phase 5 — Webhook authentication (#21) — **open, not implemented**

`ftt-email-approval` is an unauthenticated `GET` that takes `booking_ref`, `action`,
`email` and `name` from the query string. Anyone holding a link can flip that booking;
the notification recipient comes from the URL rather than the row; and because it is a
GET, a mail-scanner prefetch can confirm a booking with no human involved.

Deliberately **not** bundled into this work — it is an n8n and product decision
(HMAC token vs. interstitial confirm page vs. dropping one-click for the now-notifying
admin panel), not a frontend change. Options are enumerated in
[#21](https://github.com/Goshwar/JojoTaxi/issues/21).

---

## 8. Execution order & dependencies

```
Phase 1 (shared module) ─┬─► Phase 2 (admin routing)
                         ├─► Phase 3 (status notifications)
                         └─► Phase 4 (declined status) ──► needs Phase 3's notify call
Phase 5 is independent and can be scheduled any time.
```

Phases 1–3 shipped as one commit (they are one deliverable: a booking that arrives
usable). Phase 4 shipped separately because it carries a live-database change and
followed an owner decision.

---

## 9. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Widening a CHECK constraint on a live table | Additive only; every existing value stays valid, so no rewrite and no lock beyond the catalog update. Verified row count and statuses before and after. |
| A test insert polluting production data | Every schema probe run inside `BEGIN … ROLLBACK`; row count re-checked afterwards (3 → 3). |
| Status vocabularies diverging again (DB vs n8n) | `NotifiableStatus` makes the notifiable set a type, so a fifth status cannot silently start emailing people. |
| The admin and form drifting apart again | Single module; a column rename is now a compile error, not a blank cell. |
| Webhook failure losing a booking | Both webhooks fire-and-forget; the Supabase write is the record and the only step allowed to fail the submit. |
| `''` reaching a constrained column | `buildBookingPayload` branches per type; both shapes verified against the live constraints. |

---

## 10. Definition of done

A phase is complete only when: `npm run build` and `npm run lint` pass · the
phase-specific verification above passes · verification evidence is posted as an issue
comment (per `GITHUB_ISSUES_GUIDE.md`) · the issue is closed via PR (`Closes #n`) or
`issue_write` with `state_reason: completed`.

**Current state:** Phases 1–4 implemented, verified and pushed to
`claude/booking-process-routing-18mdvv`. `tsc` and `eslint` are clean on all changed
files; `vite build` passes. Two pre-existing errors remain in `ContactForm.tsx` and
`Home.tsx`, untouched by this work and unrelated to it.
