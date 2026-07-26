# Phase 6 — Google Business Profile & Off-Site Checklist

**For:** FUNtastic Taxi & Tours · **Tracks:** issue #6 · **Companion to:** `SEO_GEO_AUDIT.md`, `IMPLEMENTATION_PLAN.md`

This is owner work, not code. Phases 1–5 made the website findable and quotable; this phase makes the *business* findable. For "taxi near me", "St. Lucia airport transfer" and the equivalent questions asked of ChatGPT or Gemini, a verified Google Business Profile outweighs everything in the codebase — it is the single highest-leverage item remaining.

Work top to bottom. Section 1 must be exact before anything else starts.

---

## 1. Fix the details before you create anything

Every listing must carry **byte-identical** business details. Inconsistent name/phone/address ("NAP") is the most common reason a local business fails to rank — Google can't tell whether two listings are one business or two.

Copy-paste this block everywhere. Do not reword it per site.

| Field | Exact value to use |
|-------|--------------------|
| Business name | `FUNtastic Taxi and Tours` |
| Phone | `+1 758 486 0790` |
| Email | `funtastictaxitours@gmail.com` |
| Website | `https://funtastictaxitours.com` |
| City / region | Castries, Saint Lucia |
| Hours | Open 24 hours, 7 days |

**Two rules that matter more than they look:**

- [ ] **Do not put keywords in the business name.** "FUNtastic Taxi and Tours — St. Lucia Airport Transfers" violates Google's guidelines and is a common cause of suspension or a competitor-filed edit. The name field is the name. Keywords go in categories and services.
- [ ] Use the **same phone number** everywhere, in the same format, and make sure it's the one that actually gets answered. Google validates against it.

---

## 2. Google Business Profile — create and verify

Start at [business.google.com](https://business.google.com). Search your business name first: a listing may already exist, created automatically or by a customer. **Claim an existing listing rather than creating a duplicate** — duplicates split your reviews and can get both suppressed.

### 2.1 Core setup
- [ ] Claim or create the listing
- [ ] **Primary category: `Taxi service`.** This one choice does more for ranking than any other field — it decides which searches you're eligible for at all.
- [ ] Additional categories (add all that apply): `Airport shuttle service`, `Tour operator`, `Car service`, `Limousine service`
- [ ] Set as a **service-area business, not a storefront.** You drive to customers; you don't have a shop they visit. Hide the street address and define service areas instead.
- [ ] Service areas: **Castries, Gros Islet, Rodney Bay, Soufrière, Vieux Fort, Marigot Bay, Canaries, Anse La Raye, Laborie, Choiseul** — these mirror the `areaServed` values already in the site's schema (`src/lib/schema.ts`), so the two sources agree.
- [ ] Hours: **Open 24 hours**, all seven days (matches the site and schema)
- [ ] Phone, website, and email exactly as section 1

### 2.2 Verification
- [ ] Complete verification — for a Caribbean service-area business this is usually **video verification**, not a postcard

Prepare before you start the video, because you can't pause it. Have ready: a vehicle with any signage or plates visible, your phone/tablet showing the booking system or customer messages, any operator licence or permit, and yourself. Film continuously — the recording must show it's one unbroken take.

- [ ] If verification is rejected, don't recreate the listing. Appeal with the same profile; a duplicate makes it worse.

---

## 3. Fill the profile out completely

A complete profile ranks better and converts better. Aim for 100%.

- [ ] **Description (750 chars).** Lead with what you do and where, in plain language. Draft:

  > FUNtastic Taxi and Tours provides licensed private taxi, airport transfer and island tour services across Saint Lucia, 24 hours a day. We meet arrivals at Hewanorra International Airport (UVF) and George F. L. Charles Airport (SLU) with flight monitoring and meet-and-greet, and run fixed-price transfers to Rodney Bay, Soufrière, Marigot Bay, Castries and every resort on the island. We also offer private island tours to the Pitons, Sulphur Springs and Diamond Botanical Gardens, hourly charters, wedding transport and evening service. All prices are per vehicle, not per person, with no hidden fees.

- [ ] **Services.** Add each one and link it to the matching page — these now exist because of Phase 5:

  | Service | Link |
  |---|---|
  | Airport Transfer | `/services` |
  | UVF to Rodney Bay Transfer | `/airport-transfers/uvf-to-rodney-bay` |
  | UVF to Soufrière Transfer | `/airport-transfers/uvf-to-soufriere` |
  | UVF to Marigot Bay Transfer | `/airport-transfers/uvf-to-marigot-bay` |
  | Soufrière & Pitons Day Tour | `/tours/soufriere-pitons-day-tour` |
  | Sulphur Springs Tour | `/tours/sulphur-springs-tour` |
  | Hotel Transfer / Wedding Transfer / Hourly Charter / Night Out | `/services` |

- [ ] **Booking link:** `https://funtastictaxitours.com/booking`
- [ ] **Attributes:** identify everything true — woman/family-owned if applicable, "online appointments", "on-site services", languages spoken, accessibility, payment types (cash, credit, debit)
- [ ] **Opening date** of the business, if you have it

### 3.1 Photos — do not skip this
Listings with photos get meaningfully more calls and direction requests. You already have usable images in `public/Images/`.

- [ ] Logo and cover photo
- [ ] **At least 10 photos**: vehicles inside and out, drivers (with permission), airport pickup, the Pitons, Marigot Bay, waterfalls, customers enjoying tours (with permission)
- [ ] Geotag nothing artificially and use real photos only — stock imagery is easy to spot and undermines trust
- [ ] Add a few new photos monthly; recency is a freshness signal

### 3.2 Q&A — seed it yourself
Anyone can answer questions on your listing, including competitors. Post the questions *and* answers yourself first, from your own account. Use the real answers already on `/faq`:

- [ ] "How much is a taxi from Hewanorra Airport to Rodney Bay?"
- [ ] "Do you monitor flights for delays?"
- [ ] "Do you offer meet and greet at the airport?"
- [ ] "Are prices per person or per vehicle?"
- [ ] "How far in advance should I book?"

---

## 4. Reviews — the compounding asset

Review count, rating, recency and *keywords inside review text* all feed local ranking. They also feed AI answers: when an assistant recommends an operator, it leans heavily on review signals.

- [ ] Get your **review short link** from the profile ("Ask for reviews")
- [ ] Add it to your booking confirmation and to the WhatsApp message sent after drop-off
- [ ] Ask **at drop-off, in person**, then send the link — the ask converts far better than the message alone
- [ ] Suggested wording:

  > Thanks for riding with FUNtastic! If you have 30 seconds, a Google review really helps our small local business: [link]

- [ ] **Reply to every review**, positive and negative, within a few days. Replies are public, are read by future customers, and show Google the listing is active.
- [ ] In replies, use natural language that includes what you do: "Glad the airport transfer to Rodney Bay went smoothly" — never copy-paste the same reply.
- [ ] **Never buy reviews or review your own business.** Google detects clustered fake reviews and removes the listing, not just the reviews. A slow honest curve beats a fast fake one.
- [ ] Target: **10 reviews in the first month**, then a steady trickle. Steady beats spiky.

---

## 5. Google Posts — cheap and underused

- [ ] Post roughly **weekly**. Options: seasonal availability (carnival, Christmas), a tour highlight, a route reminder, an offer.
- [ ] Every post gets a CTA button → `https://funtastictaxitours.com/booking`
- [ ] Posts expire; the habit matters more than any single post

---

## 6. Bing Places — small effort, outsized effect

**Bing powers ChatGPT's web results.** For the AI-discoverability goal, this is disproportionately important relative to Bing's search share.

- [ ] Create a listing at [bingplaces.com](https://www.bingplaces.com)
- [ ] Use **"Import from Google My Business"** — it copies everything and keeps NAP identical automatically
- [ ] Verify (phone or email)

---

## 7. TripAdvisor — the AI citation source ✅ listing exists

TripAdvisor is the single most-cited source when AI assistants recommend Caribbean transport operators.

**Live listing:** [FUNtastic Taxi & Tours, Castries](https://www.tripadvisor.com/Attraction_Review-g147343-d33249587-Reviews-FUNtastic_Taxi_Tours-Castries_Castries_Quarter_St_Lucia.html)

Already wired into the site: it is in the `sameAs` structured data on every page, in `llms.txt`, and linked from `/reviews`.

Remaining on TripAdvisor itself:
- [ ] Confirm the listing's NAP matches section 1 exactly, and that the website field points to `https://funtastictaxitours.com`
- [ ] Add photos — same set as the Google profile
- [ ] Add tour listings matching the Phase 5 pages
- [ ] **Split your review asks:** transfer customers → Google, tour customers → TripAdvisor. Spreading them builds both profiles instead of one.
- [ ] Reply to reviews here as well as on Google

---

## 8. Search Console & Bing Webmaster Tools — stop flying blind

Until this is done, nobody can tell whether any of Phases 1–5 worked.

- [ ] Verify `funtastictaxitours.com` in [Google Search Console](https://search.google.com/search-console). **Use the DNS (domain) method** — it covers every subdomain and both www and non-www.
- [ ] Submit the sitemap: `https://funtastictaxitours.com/sitemap.xml`
- [ ] Use **URL Inspection → Request indexing** on the five new Phase 5 pages to speed up discovery
- [ ] Repeat verification and sitemap submission at [Bing Webmaster Tools](https://www.bing.com/webmasters) (it can import from Search Console)
- [ ] Record a **baseline** now: impressions, clicks, average position. Without it there's nothing to compare against later.

### What to watch, and when
| When | Check |
|---|---|
| Week 1 | Coverage report — are all 11 pages indexed? Any "Discovered, not indexed"? |
| Week 2 | Rich results report — is FAQ eligibility showing? Any structured data errors? |
| Monthly | Top queries. Are you appearing for route terms like "UVF to Rodney Bay taxi"? |
| Monthly | GBP insights — calls, direction requests, website clicks, search terms used |

Expect **4–8 weeks** before rankings move meaningfully, and longer for a new GBP listing to gain traction. Local SEO is slow; consistency beats intensity.

---

## 9. Feed the results back into the code

Profile URLs live in `BUSINESS_PROFILES` in `src/lib/site.ts`, which feeds both the `sameAs` structured data and `llms.txt`. Each verified profile added there strengthens how confidently Google and AI engines identify you as one real, verifiable business.

- [x] TripAdvisor — added
- [x] WhatsApp — added
- [ ] Send me the **Google Business Profile URL** once verified
- [ ] Send me any **social profiles** (Facebook, Instagram)
- [ ] Each is a one-line addition to `BUSINESS_PROFILES`
- [ ] Also still outstanding from Phase 5: **drive time/distance for the Soufrière and Marigot Bay corridors**, and **tour pricing**, if you want those published

---

## Priority order if time is short

1. **Google Business Profile** — created, verified, categories set, 10 photos, first reviews coming in
2. **Search Console** — verified, sitemap submitted, baseline recorded
3. **Bing Places** — 15 minutes via Google import; matters for ChatGPT
4. ~~TripAdvisor listing~~ ✅ done — now just photos, tour listings and review flow
5. Everything else

## Things that will actively hurt you

- Keywords stuffed into the business name → suspension risk
- A second, duplicate listing → split reviews, suppressed rankings
- Bought or self-written reviews → listing removal
- A phone number that differs by one character across listings → Google reads it as a different business
- Letting the profile go stale — no posts, no photos, unanswered reviews
