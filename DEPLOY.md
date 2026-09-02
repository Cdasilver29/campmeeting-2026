# Deploying to Vercel

Camp Meeting 2026 is a fully static Next.js 15 site. Every route is
prerendered at build time, so the environment that matters is the **build**
environment. There is no server to configure and no runtime secret.

---

## Framework and commands

Vercel detects Next.js and pnpm on its own; these are the values it should
land on, and what to set by hand if it does not.

| setting | value |
| --- | --- |
| Framework preset | Next.js |
| Node.js version | 22.x (`package.json` requires `>=20.9.0`) |
| Package manager | pnpm 10.20.0 (from `packageManager` in `package.json`) |
| Install command | `pnpm install --frozen-lockfile` |
| Build command | `pnpm build` (`next build --turbopack`) |
| Output directory | `.next` (default, do not override) |
| Root directory | repository root |

`pnpm-lock.yaml` and `pnpm-workspace.yaml` are both committed and both
matter. The workspace file pins `browserslist` so the service worker does
not end up with two copies of `serwist`; a build that ignores it produces a
worker whose offline fallback silently does nothing.

There is no `vercel.json` and nothing here needs one.

---

## Environment variables

Set these in **Project Settings, Environment Variables**. All of them are
read during `next build`, so a change to any of them needs a redeploy to
take effect. None of them is a runtime variable, and none of them is a
secret.

### `NEXT_PUBLIC_WEB3FORMS_KEY` — REQUIRED at build time

**The build fails without it.** Not the form, the build.
`src/features/forms/lib/web3forms.ts` throws at module scope when the
variable is missing, and `/contact` is prerendered, so the error surfaces
as a prerender failure and `next build` exits 1:

```
Error occurred prerendering page "/contact".
Error: NEXT_PUBLIC_WEB3FORMS_KEY is not set. Copy .env.example to
.env.local and set it to a real Web3Forms access key — the contact form
cannot submit without it.
Export encountered an error on /contact/page: /contact, exiting the build.
```

That is deliberate. The alternative is shipping a form that looks fine
and quietly cannot submit.

- **Purpose:** the Web3Forms access key the contact form posts to. Prayer
  requests are a topic on that form rather than a page of their own, so
  they arrive through the same key with their own subject line. There is
  no `/prayer-requests` route and no second key to set.
- **Value:** the access key from https://web3forms.com, tied to the
  delivery address the committee wants submissions to reach.
- **Public by design.** It is an alias for an email address, not a
  credential, which is why it carries the `NEXT_PUBLIC_` prefix and ships
  in the client bundle. Web3Forms rejects server-side submissions on the
  free plan and this site has no backend to proxy through.
- **Environments:** Production, Preview, and Development. Every one of them
  runs a build.

### `NEXT_PUBLIC_SITE_URL` — Production only, build time

- **Purpose:** the origin that canonical URLs, Open Graph URLs, the
  sitemap and the JSON-LD Event data are resolved against. See
  `src/lib/site-url.ts`.
- **Value:** the live origin with protocol and no trailing slash, for
  example `https://campmeeting.newlifesdanairobi.org`.
- **Set it on Production only. Leave it unset on Preview.** Unset, the
  build falls back to Vercel's own deployment URL, so a preview describes
  itself instead of claiming to be the live site. Pointing every preview at
  the production domain is how a preview ends up in a search index under
  the live site's canonical.
- Optional in the sense that the build succeeds without it. The cards and
  the sitemap will then carry the preview hostname.

### `NEXT_PUBLIC_ENABLE_CLOCK_OVERRIDE` — Preview only, build time

- **Purpose:** enables the `?now=` URL parameter, which pins the clock so
  the countdown, live and archive states of the site can be opened side by
  side without waiting for August. For example
  `?now=2026-08-17T11:55` renders the schedule as it will look during the
  Monday mid-morning service.
- **Value:** the exact string `true`. Anything else, including `1`, `yes`
  and an empty value, leaves the override off.
- **Set it on Preview deployments only. Never on Production.** On the live
  site any visitor could pin the clock and see a schedule that is not the
  real one. Absent, which is the default, the parameter does nothing.
- A bare `?now=2026-08-17T11:55` is read as Africa/Nairobi wall clock, the
  same frame the whole programme uses. Add an offset or a `Z` to give an
  absolute instant instead.

### Provided by Vercel, nothing to set

- `VERCEL_GIT_COMMIT_SHA` becomes the service worker's precache revision,
  so each deploy invalidates the last one's cached HTML. Without it the
  build falls back to `git rev-parse HEAD`, then to a timestamp.
- `VERCEL_URL` / `NEXT_PUBLIC_VERCEL_URL` are the fallback for
  `NEXT_PUBLIC_SITE_URL` described above.

---

## Summary: what to set in the dashboard

| variable | Production | Preview | required for the build to succeed |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | set | set | **yes, build fails without it** |
| `NEXT_PUBLIC_SITE_URL` | set | leave unset | no |
| `NEXT_PUBLIC_ENABLE_CLOCK_OVERRIDE` | leave unset | `true` | no |

---

## During camp meeting

Nothing. There is no daily content edit during the week any more — the
section below says so twice because both halves of `/livestream` used to
have one, and one of them used to be a real job.

### Watching live: nothing to do

**No daily action. Nothing to type, before a service or during one.**

The player embeds the church's YouTube channel, which resolves whatever is
broadcasting at the moment a visitor presses play. It needs no video id, no
switch-over between the morning and the afternoon service, and no undoing
when a service ends. If a stream is on the channel, it is on the page.

There was briefly a routine here for entering two video ids a day. It is
gone: a wrong id took a live broadcast off the site, because pinning an id
overrides the channel embed even when it points at nothing. Do not
reintroduce it.

### Catching up: nothing to do either

**The recordings are no longer edited during the week.**

There used to be a routine here for adding two video ids a day to
`src/features/livestream/config.ts`, so the week filled in under the
player as it went. That array is gone. `/livestream` is now purely
"is something on right now", and every recording lives at `/archive`,
which is written once from the committee's programme document after the
event rather than typed in session by session during it.

So during camp meeting week there is nothing to do to either half of
`/livestream`. See the next section for what happens afterwards.

---

## After camp meeting: writing the year into the archive

`/archive` holds one entry per camp meeting year, newest first. 2026 is
held session by session; 2020 to 2025 are held as one YouTube playlist
each.

### Adding next year

**Two file changes, and nothing else.**

1. Write `src/data/archive/year-2027.ts` in the shape of
   `year-2026.ts`: a `year`, a `showcaseThemeId`, and `themes`,
   each theme holding its videos in chronological order.
2. Add it to the array in `src/data/archive/index.ts`.

That is the whole change. Everything else follows from the data:

- the year selector gains a 2027 tab, first and selected by default
- the "Latest" pill moves to it
- the page's header line, its share card and its metadata description
  recount themselves
- the home page's moving showcase switches to 2027's showcase theme
- `/archive` is already in `siteRoutes`, so the sitemap and the
  service worker precache need no edit

Nothing in the codebase names 2026. If you find yourself editing a
component to add a year, something has been written down that should have
been derived — fix that instead.

### Getting the video ids

Ids come out of the committee's programme document, which carries one
YouTube link per session. Strip the `?si=...` a YouTube share button
appends: that is a share-tracking token belonging to whoever copied the
link, not part of the id. `https://youtu.be/K1LhA34MNmw?si=-6-FV7` is
the id `K1LhA34MNmw`. An id beginning with a hyphen, like
`-5LBJ9QHyJw`, is normal — the id alphabet includes `-` and `_`.

### Check every id before committing. This is not optional.

```
https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json
```

A real id returns the title and the channel; a wrong one 404s. Read the
CHANNEL back, not just the status — that is the check that catches an id
that resolves to a real video on somebody else's channel. All 54 of
2026's ids were put through this and all 54 came back on "Seventh-day
Adventist Church Newlife, Nairobi".

A mistyped id took a live broadcast off this site during the 2026 week.
That is why this is a rule and not a suggestion.

### A session with no recording

List it anyway, with no `videoId`. The card renders as "Recording not
available". 2026 has one: the Family Life Session (0-10yrs) on 18 August.

Do not drop the row — that would report the week as one session shorter
than it was — and do not invent an id, which is the failure above.

### Two ways the build will stop you

Both throw at module scope in `src/data/archive/index.ts`, which
surfaces during `next build` as a prerender failure, so a bad edit never
reaches production:

- **the same year listed twice.** A year is one entry; a year held as
  both a playlist and a set of themes carries both fields on that one
  entry.
- **a `showcaseThemeId` naming a theme that does not exist.** Without
  this check the home page's showcase would simply be empty, which is the
  kind of failure nobody notices.

### Swapping program.ts does not touch any of this

When 2027's programme replaces `src/data/program.ts`, the archive is
unaffected, and that is structural rather than lucky. Nothing under
`src/data/archive/` or `src/features/archive/` imports from
`program.ts`, `event.ts` or any schedule helper. Archive entries carry
an ISO **date** rather than a programme `dayId`, and speaker **names**
as plain strings rather than speaker ids, so a finished year means the
same thing with no other file present.

The old arrangement did not have this property: recordings were keyed by
`dayId` from `program.ts`, so next year's swap would have taken 2026's
recordings with it. Do not reintroduce that coupling — if you find
yourself wanting a `dayId` in an archive file, use the date.

---

## Local

```
cp .env.example .env.local     # then put the real Web3Forms key in it
pnpm install
pnpm build
pnpm start
```

`.env.local` is gitignored. `pnpm dev` needs the same key for the same
reason.

---

## Known build-log noise

`next build` prints an ESLint plugin resolution failure:

```
ESLint: Failed to load plugin 'react-hooks' declared in
' » eslint-config-next/core-web-vitals' ... Cannot find module
'eslint-plugin-react-hooks'
```

`eslint.config.mjs` uses `FlatCompat`, which resolves plugin names from
the project root, and pnpm's non-hoisted layout keeps
`eslint-plugin-react-hooks` inside `eslint-config-next`'s own directory
rather than at the root. **It does not fail the build**, verified: the
build continues past linting and completes. `pnpm lint` on its own does
exit non-zero for the same reason. Left as found; fixing it means adding a
dependency.
