# Program Data — Source Notes

Transcribed from `Draft_Program_v2_CAMPMEETING_2026_JULY.pdf`. The data is 1:1 with the PDF except where noted. These are issues in the source document that the program committee should confirm before launch. None were silently "fixed" in the data beyond obvious typo normalization.

## Normalizations applied
- All times converted to 24h `HH:MM` (`"11.00 – 11,10am"` → `11:00–11:10`).
- "Theme song" / "Theme Song" casing unified.
- Sabbath 15th Divine Service "Hymn of Praise" has no presenter in the PDF; on the 22nd it's credited to Choristers. Left as printed for each day.

## Resolved with the committee
- **Social links** (was open item 7). The cover art shows Facebook and YouTube icons without URLs; the five live URLs were read off newlifesdanairobi.org in July 2026 and are in `event.ts`.
- **Friday 21st has no evening service** (was open item 2). Confirmed: Mid Morning ends at 12:30 with the theme song and there is no vespers or sundown service. Friday afternoon *and* evening are Sabbath preparation. The block is therefore labelled "Afternoon and Evening" rather than "Afternoon Program", and its `allBlockActivity` note records the confirmation. The absence of a Friday benediction is a consequence of the same decision, not a transcription gap.

## Issues to confirm with the committee
1. **Friday 21st page header reads "CAMP MEETING 2025"** — every other page says 2026. Assumed typo; data uses 2026-08-21.
2. **Sunday 16th morning is just "Medical camp"** with no times. Modeled as an untimed all-block activity. If registration times exist, add them.
3. **Sabbath 22nd afternoon has a gap** — Music ends 15:00, Hand of Fellowship starts 16:00. Nothing scheduled 15:00–16:00. As printed.
4. **Sabbath 15th afternoon ends 16:00 and evening starts 16:00**; on all other days evening starts 16:30. As printed, but worth confirming.
5. **Speaker names**: "Pr. Kennedy Mfune", "Eld. Ken Ochuka", "Allan Okoth", "Dr. Priskillah Munda" transcribed exactly as printed. Confirm spellings before publishing profiles.
6. **Sunday 16th Special Item credits both choirs; Monday–Thursday evening Special Items also credit both choirs** — as printed.
7. **Four speakers are on no session in the programme.** Janet Oyiende (Ambassadors), Pr. John Clement (Ambassadors), Eld. Isaac Oenga (Morning Devotion) and Eld. Barrack Bosire (Teens) were supplied as poster artwork with those roles, but `Draft_Program_v2` predates their appointment and credits none of them anywhere. Their profiles are published and their pages read "Sessions to be confirmed"; `programSpeakers` keeps them out of the programme's speaker filter so no facet offers a search that returns nothing. **No session and no ministry tag was invented to fill the gap** — the committee owes the sessions. Note that Morning Devotion and Teens are not existing ministry tags either, so adding these sessions may mean adding tags to `types.ts`.
8. **Two speaker spellings disagree with their own artwork.**
   - The health presenter's poster caption reads "Dr. Preskilla Munda" and the supplied file is `preskillamunda.jpg`; the programme PDF prints "Priskillah". The data keeps **Priskillah**, because the PDF is the signed source, and the id `priskillah-munda` is stable and already in URLs.
   - The Ambassadors speaker's poster caption reads "**Janet Oyende Kariuki**" — a different surname spelling and a third name. The data carries **Janet Oyiende** under the id `janet-oyiende`. Confirm the full name and the spelling before this goes to print anywhere.
9. **Honorifics for the four new speakers come from the poster cards**, not from the programme: "Pr." for John Clement, "Eld." for Isaac Oenga and Barrack Bosire, none shown for Janet Oyiende. Confirm.
10. **Eld. Ken Ochuka has no photograph.** He is the one speaker still rendering as an initials monogram.

## About the supplied speaker artwork

None of the seven files is a photograph. Each is a 1:1 social poster card: the person cut out onto the plum ground with their role and name burnt into the lower fifth. `tools/assets/speaker-photos.mjs` crops each to a 3:4 portrait above that caption and writes `public/speakers/<id>.webp`; the crop numbers and the per-photo `object-position` live in that script and in `src/data/event.ts`. **What is actually wanted from the committee is the source photographs**, which would need no crop, would not be pre-tinted to the poster's plum, and would let the portraits be lit consistently with each other.

Open items are renumbered when one is resolved. Refer to them by title, not number.

## For future years
Replace `src/data/program.ts` and update `src/data/event.ts`. Do not touch `types.ts` or `index.ts`.
