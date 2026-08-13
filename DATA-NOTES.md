# Program Data — Source Notes

**The source is now `camp meeting 2026 program.pdf`, the Near Final
Version.** It supersedes `Draft_Program v3 CAMPMEETING 2026.pdf`, which
superseded v2. The data is 1:1 with the near-final PDF except where noted.
These are issues in the source document that the program committee should
confirm before launch. None were silently "fixed" in the data beyond
obvious typo normalization.

Every row of all eight days was re-read against the near-final PDF.
Per-day counts, PDF rows against data sessions:

| Day | Morning | Mid Morning | Divine | Afternoon | Evening | Total |
| --- | --- | --- | --- | --- | --- | --- |
| Sabbath 15th | 12 | — | 16 | 3 | 11 | **42** |
| Sunday 16th | Medical Camp | — | — | 2 | 11 | **13** + 1 all-block |
| Monday 17th | 8 | 11 | — | 3 | 11 | **33** |
| Tuesday 18th | 8 | 11 | — | 3 | 11 | **33** |
| Wednesday 19th | 8 | 11 | — | 3 | 11 | **33** |
| Thursday 20th | 8 | 11 | — | 3 | 11 | **33** |
| Friday 21st | 8 | 10 | — | Sabbath Preparation | none | **18** + 1 all-block |
| Sabbath 22nd | 13 | — | 16 | 4 | none | **33** |

238 timed sessions and 2 all-block activities. `node
tools/data/verify-program.mjs --full` prints the data in this shape to be
read against the printed page, and fails if two sessions ever share an id.

## What the near-final version changed

- **Named individuals lead Worship in Giving.** v3 credited the offering
  to a choir or to nobody; the near-final version puts a person in front
  of the choir on nine of the ten offerings that have one, printed as
  "Cheryl Majiwa-Taji Kenya, Gifted Ministry". Person and choirs are
  split into separate credits.
- **The opening Sabbath is filled in.** Nine cells that were empty in v3
  now name someone: the offering (Pr. Elvis Onyango), the offertory songs,
  both Children's slots (Elvinah Achieng Kodiwo), the Divine Service
  Scripture Reading (Pr. Polycarp Nyangau), Christian Education (Eld. Mark
  Rotich), and the evening's Scripture Reading (Benter Owino), offering
  (Eld. Sylvester Odhiambo) and Special Item. **This closes the "three
  Scripture Readings have no reader" item entirely** — every reading in
  the programme is now credited.
- **The opening Sabbath's Closing Song and Closing Prayer change hands**,
  from Alice Bonareri to Israel Jathniel and Timothy Anyona respectively.
  Alice Bonareri is now credited nowhere in the programme.
- **Bible Study is "Designated Speaker"** on all five weekdays, where v3
  said Pr. Musonera Jason. He is credited nowhere in the near-final
  version, on the Bible Studies or anywhere else, and his six free-text
  credits are gone. He never had a speaker record to remove.
- **The closing Sabbath's Scripture Reading is Pr. Kenneth Ayuo**, where
  v3 gave it to Pr. Musonera Jason. It is his fifth session, and the first
  outside the 09:00 weekday slot.
- **The closing Sabbath's Stewardship gains Pr. Elkanah Mose**, and its
  welcome and farewell name the senior pastor.
- **Sunday's Medical Camp is fully specified.** Four named providers with
  about twenty services between them, terms per provider, and an on-site
  ambulance. See below.

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

## The Medical Camp

Sunday's morning block is still untimed, and it is no longer bare. The
near-final version prints a four-column table of providers, which is
carried in `allBlockActivity.providers` on that block — a `name` and one
or more `serviceGroups`, each with the `terms` it is offered on.

| Provider | Terms | Services |
| --- | --- | --- |
| Westlands Specialists Hospital | Every day, free | 9, from dental to TB screening |
| | At a discounted rate | PAP smear at 1,500/- |
| Aga Khan University Hospital | Free | 4, including the Thursday blood donation drive |
| | At a discounted fee | PAP smear at 1,400/- |
| Gertrude's Children's Hospital | Free | 4, BP / blood sugar / BMI / paediatric |
| Mbagathi Eye Unit | Free, Wednesday and Thursday only | 4 eye services |

Two readings were made here rather than transcribed, and both are worth a
line of confirmation:

- **The ambulance is carried camp-wide.** "An ambulance will be available
  on site, in case of an emergency" is printed at the foot of the
  Westlands column, but it names no provider and it is the one line
  anybody needs at speed, so it sits in `standingNotes` rather than under
  Westlands. Say the word and it moves.
- **The camp is on Sunday's page and describes most of the week.**
  Westlands is "every day", Mbagathi is Wednesday and Thursday only, and
  the blood drive is Thursday. So this is not a Sunday morning activity
  that happens to be printed on Sunday; it is the week's medical
  provision, printed once. It stays on Sunday's block, where the source
  puts it, with a note saying so.

Service names are set in sentence case. The source is inconsistent about
it — Aga Khan's cervical screening is title-cased and Westlands' is not —
and one of the two had to give. Fees are left in the source's own
"1,400/-".

## Resolved by the near-final version, or by the committee

- **"Taji Kenya, Gifted Ministry" is two choirs, not one.** Carried as one
  credit through v3 on the reading that the two always printed adjacent
  and in that order. The near-final version breaks the pattern: the
  opening Sabbath's offertory reads **"Gifted Ministry and Taji Kenya"** —
  reversed, and joined by "and", which is `program.ts`'s own test for two
  parties. Split in all six places. It also means someone searching
  "Gifted Ministry" now finds the sessions it sings on, where before the
  name existed only inside another choir's parenthesis. One line reverses
  it if the committee says otherwise.
- **Every Scripture Reading has a reader.** The opening Sabbath's two were
  the last uncredited ones and are now Pr. Polycarp Nyangau (Divine
  Service) and Benter Owino (evening).
- **The head elder is Eld. Omondi Oyoo.** Confirmed by the committee.
  Every document that prints his given name prints it wrong: the
  programme PDF says "George Oyoo" on the opening Sabbath's pastoral
  prayer, and `elders-program.docx` says "George Oyoo" twice more. His own
  welcome letter is signed "Head Elder / Omondi Oyoo", which agrees with
  the correction. The name, the host id and the portrait filename all
  moved together; the source artwork keeps the filename the committee sent
  it under.
- **"Mochoge" or "Mochige", and Pr. or Dr.** Both settled by the
  committee: **Dr. Gerald Mochoge**, used everywhere including the closing
  Sabbath's welcome and farewell, where the programme itself prints "Pr.".
  His welcome letter signs off "Dr. Mochoge Nyarega / Snr pastor", so the
  doctorate and the office are his own.
- **The camp runs 15 to 22 August.** Pr. Elvis Onyango's welcome letter
  says "15th to 23rd August"; that is wrong and the letter is the only
  document that says it. Nothing in the data moved.
- **The theme is "Obey and Live".** Pr. Onyango's letter gives a longer
  form, "Grounded in the Bible, Focused on the Mission: Obey and Live;
  Disobey and Perish – The Choice Is Yours." The site leads with the short
  form and keeps it.
- **Friday 21st's page header no longer reads "CAMP MEETING 2025".** The
  near-final version prints 2026 on every page.

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

## The biographies, and every character that changed

Eight were supplied. They are the speakers' own words. The brief was to
correct clear typos and normalise obvious spacing and to change nothing
else — not to rewrite anyone's voice, not to convert first person to
third, not to shorten. **This is the complete list of edits**, so the
committee can check each one against what they sent.

| Speaker | Changed | From → To |
| --- | --- | --- |
| Preskilla Munda | 1 spelling | adolscents → adolescents |
| Elkanah Mose | 2 headings dropped | "Biographical Sketch", "Camp Meeting Theme & Focus" |
| Isaac Oenga | 1 spelling, 2 spacing | Isaack → Isaac; andmarried → and married; doubled space after "sons" |
| Kenneth Ayuo | 1 spacing | God.Come → God. Come |
| John Clement | 1 signature dropped, 1 label merged | "Pr J.M Clement" removed; "Message:" joined to the line it introduces |
| Janet Oyende-Kariuki | 3 form labels dropped | "FULL NAME:", "CHURCH OF SERVICE:", "Bio :" |
| Kennedy Mfune | 2 spellings, 5 spacing | decardes → decades; were → where; mfune → Mfune; four doubled/missing spaces; "Rwanda ,am" → "Rwanda, am" |
| Barrack Bosire | nothing but trailing spaces | — |

**Flagged rather than fixed.** Each is a phrasing question, not a
misspelling, so none was touched:

- **Kennedy Mfune's is the one that needs you back.** About 110 words with
  almost no sentence punctuation, and it changes from third person to
  first halfway through ("...as the Spiritual Director in 2010 moved to
  Kenya while in Kenya I served..."). Punctuating it into sentences would
  be writing it rather than transcribing it. Also unresolved in it:
  "jukat karen Campus" (JKUAT Karen?), "Naps", and "Nu vision". His last
  clause — "Four Hebrew boys and one Shunammite girl" — is deliberate and
  must not be tidied.
- **Kenneth Ayuo's has an orphan sentence.** "To help us make Achoice."
  sits outside the quotation marks that close his biography, so it reads
  as a note rather than as his last line. It is not in the data. Say where
  it belongs and it goes in.
- **Isaac Oenga**: "Mr. Oenga is married to Agnes together God has blessed
  them with..." is a run-on; and "Bsc"/"Msc" are set that way rather than
  BSc/MSc.
- **John Clement**: "we're spoilt of choices" and "develop strong,
  Christ-centered walk with God" (no article).
- **Three long dashes** — one in Preskilla Munda's ("stronger—emotionally
  grounded"), two in Janet Oyende-Kariuki's — are the writers' own
  punctuation and are kept. Note this is the one place on the site where
  CLAUDE.md's "no em dashes in copy" does not hold: that rule governs
  copy this project writes, and a quoted biography is not that. Say the
  word and they become commas.
- **"OBEY AND LIVE, Disobey and Perish. The Choice is Yours."** is kept
  exactly as Pr. Ayuo wrote it and is deliberately not normalised against
  `eventInfo.theme`, which is "Obey and Live".
- **Janet Oyende-Kariuki's church of service**, Nairobi Central SDA
  Church, was on the supplied form but `Speaker` has no field for it. It
  is recorded in a comment in `event.ts` rather than written into a
  sentence she did not write. Add a field if it should show.

## Issues to confirm with the committee

1. **"Choristers", "Choristers Choir" and "Newlife Choristers Choir"** are
   all printed in v3 and are probably the same choir. Transcribed as
   printed rather than merged, so a reader sees three names for one group
   in the Heart of Worship lines.
2. **"Elkana" or "Elkanah" Mose.** The near-final version still prints
   "Elkana" on Monday and Thursday and "Elkanah" on the other four days —
   unchanged from v3, so three drafts have now printed it both ways. The
   data uses **Elkanah**, the majority spelling and the one in his own
   biography.
3. **Sunday 16th morning is still untimed.** The Medical Camp now carries
   full detail (see above) but no clock times of any kind. If there are
   registration or opening hours, add them.
4. **Sabbath 22nd afternoon still has an hour's gap** — Music ends 15:00,
   Hand of Fellowship starts 16:00. Three drafts have now printed it
   empty, so it is likely intended, but it is still unlabelled.
5. **Both Sabbaths have a one-minute hole at 11:29–11:30**, between the
   Scripture Reading and the Hymn of Praise. Almost certainly a typo for
   11:29, and too small to show in the UI, but it is what is printed.
6. **Sabbath 15th afternoon ends 16:00 and evening starts 16:00**; on all
   other days evening starts 16:30. As printed, but worth confirming.
7. **The elders' rota assigns a Friday and a closing-Sabbath evening
   service that the programme does not have.** `elders-program.docx` gives
   a Divine hour (evening) pair for the 21st (Paul Rabala, Boaz Munga) and
   for the 22nd (Pastor Elvis Onyango, Raphael Onsongo). The programme has
   no Friday evening service — three drafts now — and the closing Sabbath
   ends with the farewell. Either the rota is ahead of the programme or it
   is stale. **Nothing was added to the programme from it.**
8. **Eld. Barrack Bosire is on no session.** He was supplied as poster
    artwork for "Teens" and the programme credits him nowhere. His profile publishes
    and reads "Sessions to be confirmed"; `programSpeakers` keeps him out
    of the programme's speaker filter so no facet offers a search that
    returns nothing. **No session and no ministry tag was invented to fill
    the gap.** Janet Oyende-Kariuki and Pr. John Clement are in the same
    position for Ambassadors; note the Ambassadors Choir sings on Thursday
    but no person is credited with the ministry.
9. **"Designated Speaker" takes the five weekday Bible Studies.** It is
    transcribed rather than dropped, because unlike v3's "Participant" it
    is printed for a reader to see rather than left as a note to the
    typesetter. But it is plainly a placeholder for a person, and the
    Bible Study is a 40-minute session on five consecutive mornings. Who
    is it?
10. **Pr. Elvis Onyango has no speaker profile.** He is in the programme
    twice — Thursday's Evangelism and the opening Sabbath's Stewardship —
    and is carried as free text, because no biography was supplied for
    him. Anyone who finds him in the programme cannot click through. He
    does appear in the hosts section as an Associate Pastor, with a
    photograph. Pr. Polycarp Nyangau is in the same position, with three
    credits.
11. **Two speakers have no photograph**: Pr. Elkanah Mose and Pr.
    Kenneth Ayuo. Both render as initials. Eld. Ken Ochuka's photograph
    arrived with the hosts drop and his profile now carries it; he and
    Allan Okoth still have no biography, and Allan Okoth's is the
    emptiest page relative to how much of the programme he carries, the
    Children's Corner on all seven days that have one.
12. **Four host biographies are owed, and what arrived instead were
    welcome letters.** All five cards in the hosts and elders section on
    `/speakers` — Dr. Gerald Mochoge, Pr. Elvis Onyango, Pr. Polycarp
    Nyangau, Eld. Ken Ochuka, Eld. Omondi Oyoo — carry a portrait, cut
    from the supplied studio artwork by `tools/assets/host-photos.mjs`.

    `hosts-bios.txt` supplies five pieces of writing, one per host, and
    **none of them is a biography**: each is a letter of welcome to the
    camp, three paragraphs to two pages, addressed to the reader rather
    than about its writer. They would not read as a biography under a
    portrait, and none is in `hosts[].bio`. **This is unpublished content
    the committee has actually written, and there is nowhere on the site
    it currently goes** — a "Welcome" section on /about would be the
    obvious home. Say the word.

    Dr. Gerald Mochoge's `bio` is the one exception and is the only host
    biography this project wrote rather than transcribed: one sentence
    naming his office, because the committee asked for his senior
    pastoral role to be stated. It is not in his voice and is not
    presented as being.

    Eld. Ken Ochuka's are held once rather than twice: he is also a
    profiled speaker, so his portrait sits on the SPEAKER record and his
    host card reads through `speakerId` to reach it. A biography for him
    goes to the same place. Pr. Elvis Onyango's photograph is on his host
    record and is also the one the programme means on Thursday, where he
    is credited as free text.
13. **`featured` flags are v2's.** They record which rows were red or bold
    in the printed programme, and that formatting cannot be read out of
    the extracted text reliably. If a later draft re-marked anything, the
    flags need a pass against the printed page.

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
