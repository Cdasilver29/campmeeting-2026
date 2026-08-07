# Program Data — Source Notes

Transcribed from `Draft_Program v3 CAMPMEETING 2026.pdf`, which supersedes
`Draft_Program_v2_CAMPMEETING_2026_JULY.pdf`. The data is 1:1 with the PDF
except where noted. These are issues in the source document that the
program committee should confirm before launch. None were silently "fixed"
in the data beyond obvious typo normalization.

## What v3 changed

- **A presenter on nearly every slot.** v2 left the third column blank on
  most of the week; v3 fills it. This is the bulk of the change.
- **Both Sabbath Divine Services retimed and reordered.** The Pastoral
  Prayer moves ahead of the offering and the Scripture Reading drops from
  fifth in the block to eleventh. Every time from 10:45 onwards moved with
  it, and the block now ends at 12:35 rather than 12:30.
- **Sabbath 22nd gains Prayers and Morning Devotion, 07:15–08:00.** The
  only session v3 adds. It is 45 minutes; the weekday equivalent is an
  hour.
- **The four Health sessions gained titles**, which is what the new
  `subtitle` field on `Session` exists for. Each is still called "Health"
  in the timetable.
- **Thursday's Evangelism is now "Evangelism - One Voice 2027."**
- **Friday's 09:50 slot changed subject**, from Publishing to Stewardship.
- **Nine guest choirs are named** where v2 said "Choirs" or nothing.

## Normalizations applied

- All times converted to 24h `HH:MM` (`"11.00 – 11,10am"` → `11:00–11:10`).
- "Theme song" / "Theme Song" casing unified. "Choristers & Choirs" set as
  "Choristers and Choirs", matching the same credit elsewhere on the page.
- **"Participant" is never transcribed.** It is v3's yellow-highlighted
  to-be-confirmed marker, not a person. Where the committee supplied the
  name it is in the data; where it did not, the session carries no
  presenter. Four cells hold the marker *and* a real credit — Monday and
  Thursday evening's offering, Friday's mid-morning offering, Tuesday's
  mid-morning Special Item — and there the marker is dropped and the
  credit kept.
- **A presenter cell is split into separate credits only when both halves
  name a party.** "Alice Bonareri and Choristers" becomes two chips;
  "Choristers and Choirs", "Online Panel and Various Classes" and "Various
  Divisions and Speakers" stay one, because "Choirs", "Various Classes"
  and "Speakers" are not names.
- **"Taji Kenya, Gifted Ministry" is carried as one credit,** "Taji Kenya
  (Gifted Ministry)". The two always appear adjacent and in that order,
  and "Gifted Ministry" is not a choir name on its own. Reading, not
  transcription — see the open item below.
- **Friday's "dventist Men's Ministries Choir"** is set as "Adventist
  Men's Ministries Choir". The PDF drops the leading A in both places it
  prints the name; it is a font problem in the source, not a spelling.
- **Tuesday's Health subtitle**: "Brokennes" → "Brokenness".
- **Thursday's Health arc** is printed without brackets and with the arrow
  typed "-→"; set like the other three.
- **Session ids are v2's wherever v3 kept the slot**, including where v3
  renamed the item. Ids are in localStorage bookmarks. Three slugs no
  longer describe their own contents and this is deliberate:
  `{sabbath}-offertory` is now "Stewardship (Tithe and Offerings)",
  `{sabbath}-childrens-corner` is now "Children Sermon", and
  `friday-21-publishing` is now "Stewardship". The last is the weakest of
  the three — it is a change of subject rather than a rename — so if the
  committee would rather the id matched, say so and it can be migrated.

## Resolved by v3

- **Friday 21st has no evening service.** Confirmed twice now: v3 also
  ends Friday at 12:30 with the theme song, with the afternoon and evening
  given to Sabbath preparation, and no benediction. Not a gap.
- **The guest choirs' names** (was an open item raised by the
  photography). v3 prints them, and "Migori Central" — the caption on the
  supplied photograph — is not among them. The choir is **Newlife Migori
  Church Choir**, and **Taji Kenya** is named in five Heart of Worship
  lines and in the closing Sabbath's Special Songs. The full list v3
  credits: Newlife Church Choir, Newlife Migori Church Choir, Taji Kenya
  (Gifted Ministry), Esiiro Choir, Adventist Women Ministries Choir, Young
  Adults Choir, Redemption Singers, Choristers Choir, Ambassadors Choir,
  Adventist Men's Ministries Choir, Newlife Choristers Choir.
- **Speaker spellings.** v3 prints "Dr. Preskilla Munda" on all four
  Health sessions, agreeing with her poster card and her supplied
  biography against v2's "Priskillah". Her own biography gives the full
  name as "Preskilla Ochieng-Munda".
- **Janet Oyende-Kariuki**'s name is settled by her own supplied
  biography, which gives "FULL NAME: Janet Oyende-Kariuki" — resolving
  both halves of the question at once, the surname spelling and whether
  the third name is printed.
- **One of the four speakers who were on no session.** Eld. Isaac Oenga
  now leads the morning devotion on all six days that have one. The other
  three are still unplaced — see the open item below. Two further records
  were added for presenters v3 names for the first time, Pr. Kenneth Ayuo
  and Pr. Elkanah Mose, and both are in the programme from the day they
  were created.

## Issues to confirm with the committee

1. **"Taji Kenya, Gifted Ministry" — one choir or two?** Carried as one
   credit. If Gifted Ministry is a separate choir it needs splitting in
   six places.
2. **"Choristers", "Choristers Choir" and "Newlife Choristers Choir"** are
   all printed in v3 and are probably the same choir. Transcribed as
   printed rather than merged, so a reader sees three names for one group
   in the Heart of Worship lines.
3. **"Elkana" or "Elkanah" Mose.** v3 prints "Elkana" on Monday and
   Thursday and "Elkanah" on the other four days. The data uses
   **Elkanah**, the majority spelling and the one in his own biography.
4. **Sunday 16th morning is still just "Medical camp"** with no times.
   Modeled as an untimed all-block activity. If registration times exist,
   add them.
5. **Sabbath 22nd afternoon still has an hour's gap** — Music ends 15:00,
   Hand of Fellowship starts 16:00. Two drafts have now printed it empty,
   so it is likely intended, but it is still unlabelled.
6. **Both Sabbaths have a one-minute hole at 11:29–11:30**, between the
   Scripture Reading and the Hymn of Praise. Almost certainly a typo for
   11:29, and too small to show in the UI, but it is what is printed.
7. **Sabbath 15th afternoon ends 16:00 and evening starts 16:00**; on all
   other days evening starts 16:30. As printed, but worth confirming.
8. **Friday 21st page header still reads "CAMP MEETING 2025"** — every
   other page says 2026. Assumed typo; data uses 2026-08-21.
9. **Three Scripture Readings have no reader.** Both of Sabbath 15th's
   (Divine Service and evening) and Sabbath 22nd's evening — which does
   not exist, so in practice it is the two on the opening Sabbath. Sabbath
   22nd's Divine Service reading **is** credited, to Pr. Musonera Jason.
   Every weekday reading is now filled.
10. **Eld. Barrack Bosire is on no session.** He was supplied as poster
    artwork for "Teens" and v3 credits him nowhere. His profile publishes
    and reads "Sessions to be confirmed"; `programSpeakers` keeps him out
    of the programme's speaker filter so no facet offers a search that
    returns nothing. **No session and no ministry tag was invented to fill
    the gap.** Janet Oyende-Kariuki and Pr. John Clement are in the same
    position for Ambassadors; note the Ambassadors Choir sings on Thursday
    but no person is credited with the ministry.
11. **Pr. Musonera Jason and Pr. Elvis Onyango have no speaker profile.**
    Both present in the programme — Jason on all five weekday Bible
    Studies and the closing Sabbath's Scripture Reading, Onyango on
    Thursday's Evangelism — and both are carried as free text, because
    neither a photograph nor a biography was supplied for them. Anyone who
    finds them in the programme cannot click through. Pr. Onyango does
    appear in the hosts section as an Associate Pastor.
12. **Three speakers have no photograph**: Eld. Ken Ochuka, Pr. Elkanah
    Mose and Pr. Kenneth Ayuo. All three render as initials.
13. **`featured` flags are v2's.** They record which rows were red or bold
    in the printed programme, and that formatting cannot be read out of
    the v3 text reliably. If v3 re-marked anything, the flags need a pass
    against the printed page.

Open items are renumbered when one is resolved. Refer to them by title,
not number.

## About the supplied speaker artwork

None of the seven files is a photograph. Each is a 1:1 social poster card:
the person cut out onto the plum ground with their role and name burnt
into the lower fifth. `tools/assets/speaker-photos.mjs` crops each to a 3:4
portrait above that caption and writes `public/speakers/<id>.webp`; the
crop numbers and the per-photo `object-position` live in that script and in
`src/data/event.ts`. **What is actually wanted from the committee is the
source photographs**, which would need no crop, would not be pre-tinted to
the poster's plum, and would let the portraits be lit consistently with
each other.

## For future years

Replace `src/data/program.ts` and update `src/data/event.ts`. Do not touch
`types.ts` or `index.ts`.
