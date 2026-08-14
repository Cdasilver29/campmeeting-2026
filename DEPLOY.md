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

## During camp meeting: adding a recording

The recordings listed on `/livestream` are maintained by hand, one line
per video. **This is the only content edit anyone should need to make
during the week.**

There are **two streams a day**, morning and afternoon, so the week is
sixteen videos: eight days times two. The page lays all sixteen out in
programme order and marks the ones that are not up yet, so a reader
always gets an answer.

There is no YouTube API, no key and no quota, and that is deliberate: for
sixteen videos a year, an API key to rotate plus a rebuild trigger so a
static site notices a video posted after its last deploy is more moving
parts than the typing it saves. Do not add one.

### The one line

Open `src/features/livestream/config.ts`, find `recordings`, and add an
entry:

```ts
export const recordings: Recording[] = [
  { dayId: "sabbath-15", part: "morning", videoId: "dQw4w9WgXcQ" },
];
```

| field | what to put in it |
| --- | --- |
| `dayId` | the programme day this is a recording of, from `src/data/program.ts`: `sabbath-15`, `sunday-16`, `monday-17`, `tuesday-18`, `wednesday-19`, `thursday-20`, `friday-21`, `sabbath-22` |
| `part` | `"morning"` or `"afternoon"`. Which of the day's two streams this is. Nothing else is a valid value |
| `videoId` | the **11 characters after `v=`** in the watch URL, not the URL. From `https://www.youtube.com/watch?v=dQw4w9WgXcQ` take `dQw4w9WgXcQ`. A `youtu.be/dQw4w9WgXcQ` share link has the same id after the slash |
| `label` | **optional.** What the recording is, where that is more than "morning" already says: "Divine Service". Leave it off and the row reads "Morning", which is true of the whole stream. Do not invent a description of a video you have not watched |

**Strip the `?si=...`.** YouTube's share button appends one — it is a
tracking token belonging to whoever copied the link, not part of the
video id. `https://youtu.be/dQw4w9WgXcQ?si=Ab12Cd34` is the id
`dQw4w9WgXcQ` and nothing after the `?`.

Commit and push. Vercel builds on push and the page is live in a couple of
minutes.

### Five things that are already handled, so do not do them by hand

- **Order.** Paste at the end of the array. The page is laid out from the
  programme, day 1 to day 8, and each line is slotted into its own day and
  part, so where it sits in the file does not matter.
- **The days with nothing posted.** All sixteen slots are always drawn.
  A day you have not uploaded yet shows as "Not posted yet" on its own,
  and turns into a link the moment you add its line. Nothing needs
  removing or un-commenting.
- **The day's name.** "Sabbath 15th August 2026" is read from
  `program.ts`, so it cannot disagree with the schedule.
- **The link to the programme.** Each day links to `/schedule/<dayId>` on
  its own.
- **The cover pictures.** YouTube's own thumbnail for each video, from the
  id. Nothing to upload.

### If the build fails after you add a line

Two causes, and both failures are deliberate.

A mistyped `dayId`:

```
Error: Recording "dQw4w9WgXcQ" has dayId "sabath-15", which is not a
day in src/data/program.ts. Valid ids: sabbath-15, sunday-16, ...
```

A wrong day id would otherwise ship a "see that day's programme" link that
404s, from the page whose whole job that week is catching people up. The
message lists every valid id; fix the spelling and push again.

Or the same day and part written twice:

```
Error: Two recordings are both "sabbath-15" / "morning": dQw4w9WgXcQ
and MT1z3LU1IL4. Each day has one morning stream and one afternoon
stream, so one of these has the wrong day or the wrong part.
```

One slot cannot hold two videos. Without this the second line would
silently replace the first and a published stream would quietly vanish
from the page. Fix whichever line has the wrong day or part.

### A day that streamed in more than two parts

Do not add a third entry — there is no slot for it. Put the extra video on
the church's channel, which the page links to, and raise it with whoever
maintains the site if it needs to be listed.

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
