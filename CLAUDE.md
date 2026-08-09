# Camp Meeting 2026 — Newlife SDA Nairobi

Official digital companion for Camp Meeting, 15th–22nd August 2026, Newlife SDA Church, 5th Ngong Avenue, Nairobi. Greenfield build, separate from newlifesdanairobi.org, but it inherits that site's brand colors. Benchmark: modern conference sites (Apple Events, Stripe Sessions, Figma Config), executed with SDA reverence and restraint. Calm, elegant, fast. No decorative religious icons, no gradient soup, no oversized shadows.

## Stack (pin exact versions in package.json)
Next.js 15, React 19, TypeScript strict, Tailwind CSS v4 (CSS-first config in `src/app/globals.css`), shadcn/ui, Framer Motion, Lucide, next-themes, pnpm. Deploy on Vercel. Static generation everywhere; no traditional backend. The app router lives under `src/` (`src/app/`), not at the repo root.

## Non-negotiables
- All program content comes from `src/data/` (already written and validated: `types.ts`, `program.ts`, `event.ts`, `index.ts`). Never hardcode schedule content in components. Future years swap data files only.
- Read `DATA-NOTES.md` before touching schedule UI. It lists source-PDF issues awaiting committee sign-off (Friday has no evening service, Sunday morning is an untimed Medical Camp block, closing Sabbath has a 15:00–16:00 gap). The UI must handle untimed all-block activities and gaps gracefully.
- Brand hexes in `globals.css` marked APPROX must be replaced with exact values extracted from the newlifesdanairobi.org theme CSS before Phase 1 completes.
- Time logic uses Africa/Nairobi wall-clock via `getCurrentSession()` in `src/data/index.ts`. Never use the viewer's local timezone for "happening now".
- Accessibility floor: keyboard focus visible, prefers-reduced-motion respected, WCAG AA contrast, semantic landmarks. Lighthouse target 100 across the board.
- Forms (prayer requests, contact) go through Web3Forms or Formspree. Prayer requests are sensitive: no analytics on that page, nothing from the request persisted client-side, clear confidentiality note (the church already promises confidentiality on its main site).
- Bookmarks: session ids in localStorage (ids are stable, format `{dayId}-{slug}`). Nothing else in localStorage.

## Working conventions
- Phase-gated delivery. Small bounded sessions, roughly 500 lines per session. Commit after every chunk.
- pnpm with exact pinned versions. No em dashes in copy. No prop drilling: co-locate state or use context per feature.
- Feature folders: `src/features/schedule/`, `src/features/speakers/`, `src/features/livestream/`, etc. Shared UI in `src/components/ui/` (shadcn) and `src/components/`.

## Phases
Phase 0 — Scaffold. create-next-app, Tailwind v4, shadcn init, next-themes, drop in `src/data/` and `globals.css`, verify `pnpm build` and typecheck. Gate: clean build, tokens render.

Phase 1 — Design system. Replace APPROX hexes with extracted brand values. Choose display + body typefaces via next/font (decide deliberately; document the choice). Base primitives: Button, Card, Badge, Input, Skeleton, EmptyState, ErrorState. Gate: a /styleguide route showing every primitive in light and dark.

Phase 2 — Shell. Responsive nav (desktop bar + mobile sheet), footer with verified contact/social from `event.ts`, dark-mode toggle, page transition wrapper honoring reduced motion. Gate: shell at AA contrast, keyboard-navigable.

Phase 3 — Schedule (the core feature, likely 2–3 sessions).
- Today view: current-session indicator polling `getCurrentSession()` every 30s, next-up card, day timeline.
- Full program: day tabs, block grouping, session cards with presenter chips.
- Search + filters: text search over `allSessions`, filter by day, ministry tag, speaker. URL-driven state so filtered views are shareable.
- Bookmarks: toggle per session, "My schedule" view from localStorage.
- Countdown hero before 2026-08-15, switches to live mode during the event, archive mode after 2026-08-22.
Gate: RSC for static parts, no layout shift, filters shareable by URL.

Phase 4 — Content pages. Speakers (from `speakers.ts`), ministry pages (Children, Youth, Family Life, Health), About, Contact with Google Maps embed, FAQ, Downloads (program PDF). Gate: every page statically generated.

Phase 5 — Livestream + forms + gallery. YouTube embed (channel: youtube.com/c/NewlifeSDAChurchNairobi), announcements section, prayer request + contact forms via Web3Forms, Cloudinary-backed gallery with lazy loading. Gate: forms deliver, livestream page works on mobile data.

Phase 6 — PWA + SEO + polish. Offline PWA (precache shell + program data; the schedule must work offline on the campground), metadata, Open Graph, JSON-LD Event structured data from `eventInfo` + `program`, sitemap, full Lighthouse pass. Gate: 100/100/100/100 on the deployed preview.

## Open items (do not guess; confirm with committee)
- Exact brand hexes from the live site.
- Event theme text for the hero. The main site shows "The Good News in the Great Controversy" in a pastor's letter, but that letter references February dates and a different pastor, so it may be stale. Confirm the August 2026 theme before it goes in the hero.
- Friday evening/vespers service existence, Sunday morning Medical Camp times, closing Sabbath 15:00–16:00 gap.
- Speaker photos for Pr. Elkanah Mose and Pr. Kenneth Ayuo. Eld. Ken Ochuka's arrived with the hosts drop, as did all five hosts and elders portraits; biographies for those five are still owed. Names are no longer open: Draft Program v3 and the supplied biographies settled "Dr. Preskilla Munda" and "Janet Oyende-Kariuki". See DATA-NOTES.md for the current list of what is owed.
