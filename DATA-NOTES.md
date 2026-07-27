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

Open items are renumbered when one is resolved. Refer to them by title, not number.

## For future years
Replace `src/data/program.ts` and update `src/data/event.ts`. Do not touch `types.ts` or `index.ts`.
