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
  both Children's slots (Elvina Akinyi Kodiwo), the Divine Service
  Scripture Reading, Christian Education (Eld. Mark
  Rotich), and the evening's Scripture Reading (Benter Owino), offering
  (Eld. Sylvester Odhiambo) and Special Item. **This closed the "three
  Scripture Readings have no reader" item** — though the closing Sabbath's
  reading has since been vacated again, see below.
- **The opening Sabbath's Closing Song and Closing Prayer change hands**,
  from Alice Bonareri to Israel Jathniel and Timothy Anyona respectively.
  Alice Bonareri is now credited nowhere in the programme.
- **Bible Study was "Designated Speaker"** on all five weekdays, where v3
  said Pr. Musonera Jason. He is credited nowhere in the near-final
  version, on the Bible Studies or anywhere else, and his six free-text
  credits are gone. He never had a speaker record to remove. The
  placeholder is now filled — see the committee corrections below.
- **The closing Sabbath's Scripture Reading was Pr. Kenneth Ayuo**, where
  v3 gave it to Pr. Musonera Jason. It has since been vacated with the
  rest of his credits — see below.

## Committee corrections, 14th August 2026

- **The Children's slots are Elvina Akinyi Kodiwo.** The near-final
  version printed "Elvinah Achieng Kodiwo" on both. Corrected on the
  opening Sabbath's Children Sermon and Children's Corner. The children's
  sheet already spelled her given name "Elvina" (src/data/children.ts,
  Tr. Elvina Kodiwo) and is unchanged.
- **Pr. Kenneth Ayuo takes the five weekday Bible Studies**, and they are
  now his ONLY credit in the week. The "Designated Speaker" placeholder is
  gone from the data.
- **His four 09:00 subjects are now "Interactive Session"** — Spirit of
  Prophecy (Mon), Prophecy (Tue), Possibility Ministry (Wed) and
  Discipleship (Fri). The subjects keep their titles; the presenter chip
  carries "Interactive Session" instead of his name.
- **The closing Sabbath's Scripture Reading is UNCREDITED, and a reader
  is owed.** It was his fifth credit and the only one outside the 09:00
  slot. "Interactive Session" cannot stand as the reader of a two-minute
  Scripture Reading and naming a substitute would be inventing one, so
  the credit is empty until the committee says who reads. **Open.**
- **The guest choir is the Newlife Migori Adventist Church Choir.** Two
  strings were wrong and they were wrong differently. The home hero's
  photograph was captioned "Migori Central", which was the caption burnt
  into the supplied artwork and never a name the programme used. The
  programme itself printed the short "Newlife Migori Church Choir" on
  sixteen lines. Both are now the full form, so the site has ONE name for
  this choir rather than a hero and a schedule that disagree.
  **This overrides the transcription** on those sixteen lines: the
  near-final PDF prints the short form and the committee's name wins.
  Confirmed by the committee, asked and answered — the full name is
  wanted in the programme too, not only on the hero. Settled, not open.
  The hero captions are now the choir's name and nothing else — "Newlife
  Migori Adventist Church Choir" and "Taji Kenya". The caption row holds
  one 20px line and each caption is absolutely positioned in it, so a
  caption that wraps overflows its box as white type over the photograph.
  Measured in the caption's own font against its own box: the old "Camp
  Meeting 2026 Guest Choir · Migori Central" was 276.8px and already
  wrapped at 320; "Guest Choir · Newlife Migori Adventist Church Choir"
  was 294.3px and wrapped at 320 and 360; the bare name is 217px and
  clears 320 by 31px. See the note in src/lib/hero.ts.
- **Three Divine Service credits on the opening Sabbath change hands.**
  Pastoral Prayer from Eld. Omondi Oyoo to Eld. Ken Ochuka; Stewardship
  (Tithe and Offerings) from Pr. Elvis Onyango to Eld. Sylvester
  Odhiambo; Scripture Reading from Pr. Polycarp Nyangau to Eld. Robert
  Nyarango. The Evening Service's own Scripture Reading (Benter Owino) is
  untouched. The duty rota corroborates: Eld. Nyarango is the elder on
  that Sabbath's morning shift and Eld. Odhiambo the afternoon's.
  Eld. Omondi Oyoo is now credited on no session; he remains a host.
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

## The five host welcome letters

`src/data/host-letters.ts`, transcribed from `hosts-bios.txt`. One page
each at `/hosts/{id}`; the card in the hosts and elders section on
`/speakers` carries a sentence from each and links through.

**They are letters, not biographies**, and they are in their own field
rather than in `bio`. A biography is written about someone in the third
person; these are written by someone, in the first person, to the
congregation. `Host.bio` is still there and still empty on all five, for
a real biography if one ever arrives. `Speaker.bio` is untouched.

### Every change made to a signed letter

Nine words across five letters. **Eight are typo corrections. One is a
date correction and is authorised** — see below.

| Letter | Source | Set as | Why |
| --- | --- | --- | --- |
| Dr. Gerald Mochoge | "did u obey" | "did you obey" | typo |
| | "poweful" | "powerful" | typo |
| | "ungratefullness" | "ungratefulness" | typo |
| | "Gods word" | "God's word" | missing apostrophe |
| | "pastors,elders" | "pastors, elders" | missing space |
| | "yourself  did" | "yourself did" | doubled space |
| Pr. Elvis Onyango | **"15th to 23rd August 2026"** | **"15th to 22nd August 2026"** | **authorised date correction** |
| | "avenue.The Home" | "Avenue. The Home" | missing space; street name as the site sets it |
| Eld. Omondi Oyoo | "God&#39;s Word" | "God's Word" | HTML entity leaked into the source |
| Pr. Polycarp Nyangau | — | — | trailing spaces only |
| Eld. Ken Ochuka | — | — | trailing spaces only |

Eld. Oyoo's letter is also hard-wrapped mid-sentence throughout, an
artefact of however it was exported. Those breaks are joined back into
paragraphs; no words changed.

### The date correction, in full

**What the source said:** "I warmly welcome you to our 2026 Camp Meeting,
taking place from 15th to 23rd August 2026."

**What is rendered:** "…from 15th to 22nd August 2026."

**Authorisation:** the committee's instruction, which states the camp
runs 15 to 22 August and that Pr. Onyango's letter is wrong on this
point. Every other document agrees with the 22nd: the programme PDF, the
duty rotas, `eventInfo.endDate`. His is the only one that says the 23rd.

It is recorded here because **a signed letter must never be silently
edited**. Anyone comparing the page to what he sent will find the
difference, and this is where the answer is.

### The longer theme is NOT a correction

The same letter gives the theme as "Grounded in the Bible, Focused on the
Mission: Obey and Live; Disobey and Perish – The Choice Is Yours." That is
kept exactly as written. It is his own framing rather than an error, and
the site leading with the short "Obey and Live" elsewhere does not make
his sentence wrong. Same decision, and the same reasoning, as the note
above about Pr. Kenneth Ayuo's "OBEY AND LIVE, Disobey and Perish. The
Choice is Yours."

### Dr. Mochoge signs a different name from the one the site uses

His letter is signed **"Dr. Mochoge Nyarega / Snr pastor"**. The site
calls him **Dr. Gerald Mochoge**, which the committee settled and which
the programme PDF prints twice. Both are his. The signature is stored
separately from the display name and printed as he wrote it, because a
signature is the one part of a letter that is not the site's to restyle.
The page's title, its share card and its eyebrow all use the settled
form.

### Flagged rather than fixed

Each is a phrasing question rather than a misspelling, so none was
touched:

- **Dr. Mochoge**: "even so come lord amen" — lowercase "lord" and no
  sentence punctuation; and "him who is all together lovely", which is
  probably "altogether lovely" (Song of Solomon 5:16).
- **Pr. Nyangau**: "in Jesus name", with no possessive apostrophe.
- **Eld. Oyoo**: the full stop after "Beloved brothers and sisters in
  Christ" where a comma is conventional; and mixed spelling, "Honor" and
  "organizers" against "centre" and "programme", within one letter.
- **Pr. Onyango**: "Savior" (US) in a letter that is otherwise UK-spelled;
  "sabbath week" in lower case; and "Church- Newlife", whose hyphen has a
  space on one side only.
- **The em and en dashes are the writers' own** and are kept, which is
  the same exception to CLAUDE.md's "no em dashes in copy" that the
  speakers' biographies already carry: that rule governs copy this
  project writes, and a quoted letter is not that.

### The three scripture references

**Mark 6:31**, **Romans 12:10** and **Genesis 28:16**, all three in Eld.
Oyoo's letter and all three already in Book Chapter:Verse form in the
source, with no spacing variation between them. Nothing had to be
normalised. They are kept inline in his own sentences rather than pulled
out into blockquotes: lifting a quotation out of the sentence that
introduces it changes the shape of his writing, which is not a
typographic decision.

Quotation marks and apostrophes ARE normalised, to curly throughout. The
sources mix straight and curly inside a single letter.

## The gallery

31 photographs of previous camp meetings, converted from `camp-gallery/`
by `tools/assets/gallery-photos.mjs`, which also generates
`src/data/gallery.ts`.

| | |
| --- | --- |
| Source | 31 JPEG, 5.33 MB |
| Written | 31 WebP, **3.17 MB** (3,323,150 bytes) into `public/gallery/` |
| Saving | 41% |
| `public/` before | 2.75 MB |
| `public/` after | 5.92 MB |
| Precache before | 109 entries, 4,209 KiB |
| Precache with the gallery in it | 140 entries, 7,454 KiB |
| Precache as shipped | **109 entries, 4,209 KiB** — unchanged |

**None of them is precached**, which is the point: they are the only part
of the site nobody needs while standing in the churchyard, and precaching
them would more than double what every phone downloads before it opens
anything. The `/gallery` PAGE is still precached, so it opens offline
with its text and without its pictures.

Two things worth knowing:

- **The committee supplied no captions.** All 31 render with empty `alt`
  and the set carries one accessible name. A generated description of a
  photograph nobody here has described would be a guess read out to a
  screen reader as fact. Captions are a field on `GalleryImage` and one
  edit to the page whenever they arrive.
- **`camp-23` is the one file that grew**, 142 KB to 149 KB. It is a
  960x720 that was already small enough not to be resized, so WebP is
  re-encoding a JPEG at its native size with nothing to win. Left as
  WebP for consistency; it is 7 KB.
- **The filenames are Facebook ids** in the source
  (`484110649_962700029397235_…_n.jpg`) and are renamed `camp-01` upward
  in the sources' own sort order. A filename ends up in a URL, and there
  is no reason to publish somebody's CDN ids.

## The children's ministry programme

`src/data/children.ts`, transcribed from `children-program` — "NEWLIFE
SDA CHURCH, 2026 CHILDREN MINISTRY CAMP MEETING SCHEDULE". All three of
its tables are in the data: the day, the eleven classes with their
teachers and venues, and the coordinators. It has its own route,
`/children`, rather than sitting under `/ministries`.

**The sheet covers Monday to Friday only.** Not either Sabbath and not
Sunday, and nothing on it says what happens on those three days. The main
programme does — the Children's Corner on all seven days that have one,
and a Children Sermon on both Sabbaths — so the page says Monday to
Friday and links to `?ministry=children` for the rest rather than
implying this is the whole week.

Open, and each is one line from the committee:

1. **"Tr. Wnnie Zeph"** teaches the 8-year-olds' craft session. Almost
   certainly Winnie. Transcribed as printed.
2. **"Tr. Elknah Nyakundi"** teaches the 5-year-olds' craft session.
   Almost certainly Elkanah. Transcribed as printed.
3. **"Tr. Violet Mwango /"** — the nursery's afternoon cell ends in a
   trailing slash with no second name. Every other slash in the table
   separates two teachers, so a partner is missing rather than absent.
   **No name was invented**; the slot carries her alone.
4. **"Tr. Nyakoboke Oirere`"** carries a stray backtick in the source,
   dropped here as a typing slip rather than punctuation.
5. **Three teachers carry no honorific** where the teacher they share a
   cell with does: "Tr. Eunice Bolo / Elizabeth Salim", "Tr. Juddy Munga
   / Niger Omwanza", "Tr. Nyakoboke Oirere / Esinah Omariba". As printed.
6. **Venues are named two ways.** Four classes meet in "Tent A/B/C" or
   the "Devotion Tent" and seven in "N yrs Class". Both are as printed;
   whether the second is a room name or shorthand is not something the
   sheet says.
7. **Stewardship and Application, Q&A are one cell for every class**, and
   Bible and Craft are one cell for the oldest class and the nursery.
   Merged cells are carried as one longer slot rather than split into two
   identical rows: "Stewardship, Application and Q&A, 15:05–16:20". That
   spans the five-minute break the timetable puts at 15:55, which the
   sheet's own merge also does.

## The duty rota, and where its four sources disagree

`src/data/duty.ts` is built from the near-final PDF's per-day tables,
`Diaconete.txt`, `choristers-program` and `elders-program.docx`.

**The diaconate resolves completely.** Every name in the programme's
Deaconry column appears in `Diaconete.txt` labelled Deacon or Deaconess,
on all seven days that have a table, with no leftovers in either
direction. The split into Deacons and Deaconesses is therefore exact and
nothing falls back to a combined "Deaconry" heading.

Everything below is a real disagreement between sources. **None was
silently resolved; each is listed with the choice made and why.**

### Shift splits — the two that change what is shown

1. **Sunday's two elders.** The programme prints "Erick Ayieko, Salmon
   Osare" together on the Afternoon row. The elders' rota splits them:
   Erick Ayieko coordinates the morning, Salmon Osare the afternoon.
   **The programme is used.** Sunday morning is the Medical Camp and
   neither the diaconate nor the choristers are rostered for it, so a
   morning shift would have one name in it and three empty rows.
2. **Friday's two elders.** Same shape: the programme prints "Eld. Jared
   Manyara, Eld. Cosmas Makori" together on the Morning row, the elders'
   rota gives Jared Manyara the morning and Cosmas Makori the afternoon.
   **The programme is used**, so Friday afternoon shows the elders as not
   rostered. If the rota is right, Cosmas Makori belongs there.

### Names

3. **Monday's mid-morning prayer.** The programme credits **Eld. Jim
   Omollo**; the elders' rota calls the same slot's elder **Jim Okello**.
   The programme's spelling is in `program.ts`. Two different surnames,
   not a spelling variant, so one of the two is a different person.
4. **The closing Sabbath's welcome.** The elders' rota says "Pastor
   Gerald **Nyarega**" where the programme says "Pr. Gerald **Mochoge**".
   Both are his: his own welcome letter signs "Dr. Mochoge Nyarega". The
   committee has settled the site's form as **Dr. Gerald Mochoge**.
5. **Six choristers are spelled two ways**, programme against the
   choristers' rota. The programme's spelling is used in every case.

   | Programme (used) | Choristers' rota | Where |
   | --- | --- | --- |
   | Levin Omuga | Nevile Omuga | Monday morning |
   | Anne Okemwa | Ann Okemwa | Monday afternoon |
   | Jessica Isiaho | Jesicah Isiaho | Tuesday afternoon |
   | Agnes Maureene | Agness Maureene | Wednesday afternoon |
   | Donnah Achieng | Donna Achieng | Thursday afternoon |
   | Maxwell / Maxwel Omondi | Maxuel Omondi | Sunday pm, Wednesday am |

   "Levin" against "Nevile" is the one that is not a spelling variant.
   **Maxwell Omondi** is set that way in both places: the programme
   itself prints "Maxwell" on Sunday and "Maxwel" on Wednesday for what
   the voice part (tenor, both days) says is one person.
6. **Three elders are spelled two ways.** The programme is used:
   Chrispus Onkoba (rota: Crispus), Daniel Kittur (rota: Kitur), David
   Sing'ombe (rota: Singombe).

### Shift times

7. **Thursday afternoon starts at 2pm** in `Diaconete.txt` where every
   other weekday says 1pm. The panel's morning/afternoon boundary is
   13:00 throughout, taken from the rota's own "7AM-1PM / 1PM-6PM", so on
   Thursday it calls the 13:00 hour afternoon an hour early. It only
   affects which shift is marked "On now"; both are always shown.

### Not carried

8. **The choristers' rota gives voice parts** — Soprano, Alto, Tenor,
   Bass, and an empty Pianist column on every row. They are not in
   `duty.ts`. The panel's question is who is on duty, and a part beside
   each name would roughly double the widest column at 320px. Say the
   word and they go in; the data is transcribed and the source is in the
   repo's sibling folder.

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
  supplied photograph — is not among them. The choir is the **Newlife
  Migori Adventist Church Choir** (see the committee correction below),
  and **Taji Kenya** is named in five Heart of Worship lines and in the
  closing Sabbath's Special Songs. The full list v3 credits: Newlife
  Church Choir, Newlife Migori Church Choir, Taji Kenya (Gifted Ministry),
  Esiiro Choir, Adventist Women Ministries Choir, Young Adults Choir,
  Redemption Singers, Choristers Choir, Ambassadors Choir, Adventist Men's
  Ministries Choir, Newlife Choristers Choir.
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
9. **The closing Sabbath's Scripture Reading has no reader.** It was
    Pr. Kenneth Ayuo's and the committee has taken every session off him
    but the Bible Studies. Two minutes on the 22nd, uncredited. Who
    reads? (The five weekday Bible Studies' "Designated Speaker" question
    that stood here is CLOSED: they are Pr. Kenneth Ayuo.)
10. **Pr. Elvis Onyango has no speaker profile.** He is in the programme
    once — Thursday's Evangelism — and is carried as free text, because
    no biography was supplied for him. Anyone who finds him in the
    programme cannot click through. He does appear in the hosts section as
    an Associate Pastor, with a photograph. Pr. Polycarp Nyangau is in the
    same position, with the closing Sabbath's pastoral prayer.
11. **Every profile now carries a photograph.** Pr. Elkanah Mose and Pr.
    Kenneth Ayuo were the last two rendering as initials monograms and
    both have arrived, along with a replacement for Eld. Omondi Oyoo —
    see below. What is still owed is BIOGRAPHIES: Eld. Ken Ochuka and
    Allan Okoth have none, and Allan Okoth's is the emptiest page
    relative to how much of the programme he carries, the Children's
    Corner on all seven days that have one.
12. **The five welcome letters are published; five host BIOGRAPHIES are
    still owed.** All five cards in the hosts and elders section on
    `/speakers` — Dr. Gerald Mochoge, Pr. Elvis Onyango, Pr. Polycarp
    Nyangau, Eld. Ken Ochuka, Eld. Omondi Oyoo — carry a portrait, cut
    from the supplied studio artwork by `tools/assets/host-photos.mjs`,
    and now a sentence from each host's own letter linking to it in full
    at `/hosts/{id}`. See the section above.

    What is still absent is a biography. `hosts[].bio` is empty on all
    five and the letters are deliberately NOT in it: a letter is written
    by someone to the congregation, a biography is written about someone,
    and rendering "Dear brothers and sisters in Christ" under a portrait
    would present the one as the other. The field is declared and drawn
    for when they arrive.

    Eld. Ken Ochuka's are held once rather than twice: he is also a
    profiled speaker, so his portrait sits on the SPEAKER record and his
    host card reads through `speakerId` to reach it. A biography for him
    goes to the same place. Pr. Elvis Onyango's photograph is on his host
    record and is also the one the programme means on Thursday, where he
    is credited as free text.
13. **The Day 1 daily sheet disagrees with the near-final programme on two
    evening credits.** `Newlife Camp Meeting Daily Program 15 August
    2026.pdf` (Canva, authored 14 August, now shipped as
    `public/downloads/camp-meeting-day-1.pdf`) is a per-day reprint of the
    opening Sabbath. It matches the near-final version line for line
    except in the Evening Service, where:

    - **Benediction, 17:35–17:40, is credited to "Choristers".** The
      near-final version gives it to **Pr. Kennedy Mfune**, and
      `program.ts` follows the near-final version. A choir taking the
      benediction rather than the preacher who has just given the sermon
      would be unusual, so this looks like a slip in the day sheet — but
      it is what the day sheet prints.
    - **Special Item, 16:37–16:45, has an EMPTY presenter cell.** The
      near-final version credits **Newlife Church Choir**, which is what
      `program.ts` carries. The day sheet does print "Newlife Church
      Choir", but loose at the FOOT of the page below the table rather
      than in the row, so it is not certain the two belong together — it
      may equally be a standalone credit for the evening.

    **`program.ts` was not changed.** Both readings are the near-final
    version's, which is the signed-off source; the day sheet is a
    later-authored reprint and could be either a correction or a
    typesetting slip. Confirm which document wins before touching either
    session. If the day sheet is right, the two edits are
    `sabbath-15-ev-benediction` and `sabbath-15-ev-special-item`.

14. **`featured` flags are v2's.** They record which rows were red or bold
    in the printed programme, and that formatting cannot be read out of
    the extracted text reliably. If a later draft re-marked anything, the
    flags need a pass against the printed page.

Open items are renumbered when one is resolved. Refer to them by title,
not number.

## The three later portraits

Three files arrived after the speaker and host batches, and they are a
third KIND of source rather than more of either — clean cut-outs on the
poster's plum ground with **no caption burnt into them**. So they are cut
by `tools/assets/portrait-photos.mjs` rather than by
`speaker-photos.mjs`, whose whole crop model is one number meaning "where
this poster's caption begins".

| id | source | crop | output |
| --- | --- | --- | --- |
| `kenneth-ayuo` | 1254x1254, 1.6 MB | 725x966 at 352,100 | 540x720, 29.2 KB |
| `elkanah-mose` | 1122x1402, 2.0 MB | 842x1122 at 140,140 | 540x720, 79.6 KB |
| `omondi-oyoo` | 1122x1402, 1.6 MB | 842x1122 at 162,28 | 540x720, 25.6 KB |

- **Eld. Omondi Oyoo's REPLACES a file.** The path did not change; what
  is behind it did. The old crop came from the only landscape source in
  the hosts batch and was the largest of the five at 82.3 KB because of
  the fine gingham check he was wearing. The new one is a plain studio
  portrait at 25.6 KB, so the byte problem left with the shirt.
- **Pr. Elkanah Mose's is now the expensive one**, 79.6 KB against about
  27 for the other two, and for exactly the same reason: he is
  photographed in a fine windowpane check. Reported rather than hidden,
  as the old note in `host-photos.mjs` reports its predecessor.
- **Pr. Kenneth Ayuo's crop is a zoom**, and the second attempt. The
  first kept nearly the whole square and put his head at the same
  0.12-0.40 of the window as the other two, and he still read smaller —
  he is shot at three-quarter length where they are chest-up, so an equal
  head position left a third of his window as empty plum. The reasoning
  is in the script.

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
