/*
  # Allow 'declined' as a booking status

  `bookings_status_check` permitted only 'pending', 'confirmed' and 'cancelled',
  but the `FTT — Email Approval` n8n workflow writes 'declined' when the admin
  clicks Decline in the booking email. Postgres rejected that UPDATE while the
  workflow carried on — it emailed the customer a decline and rendered a success
  page, and the booking stayed 'pending' with nobody aware of it. The companion
  `decline_reason` column existed all along and was never reachable.

  Widening rather than remapping keeps the two outcomes distinct, which they are:

    - `declined`  — we turned the request down (no vehicle, date unworkable).
                    Carries `decline_reason` and sends the customer a decline email.
    - `cancelled` — the booking was called off after the fact, usually by the
                    customer. No automated email; the conversation already happened.

  1. Changes
    - `bookings.status` CHECK widened to include 'declined'.

  2. Safety
    - Purely additive. Every existing value stays valid, so no row is rewritten
      and no backfill is needed.
*/

ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'declined', 'cancelled'));
