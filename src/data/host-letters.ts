import type { HostLetter } from "./types";

/**
 * ── THE FIVE WELCOME LETTERS ─────────────────────────────────────────
 *
 * Transcribed from `hosts-bios.txt`. Each is a letter to the
 * congregation, written by its signatory in the first person. They are
 * not biographies, and `HostLetter` is a separate field from `bio` for
 * that reason — see types.ts.
 *
 * ── THE RULE THAT GOVERNS EVERY EDIT BELOW ───────────────────────────
 *
 * These are SIGNED. A signed letter that has been silently improved is
 * no longer that person's letter, so the brief is the same one the
 * speakers' biographies were transcribed under: correct clear typos,
 * change nothing else, and list every change. **DATA-NOTES.md carries the
 * complete list**, so the committee can check each one against what they
 * sent. Nine words changed across five letters.
 *
 * Flagged rather than fixed, because each is a phrasing question rather
 * than a misspelling: "even so come lord amen" and "all together lovely"
 * (Dr. Mochoge), "in Jesus name" (Pr. Nyangau), the full stop after
 * "Beloved brothers and sisters in Christ" and the mixed US/UK spelling
 * of "Honor"/"organizers" against "centre"/"programme" (Eld. Oyoo).
 * All are in DATA-NOTES.
 *
 * ── THE ONE CHANGE THAT IS NOT A TYPO ────────────────────────────────
 *
 * Pr. Elvis Onyango's letter says the camp runs "15th to 23rd August".
 * It runs to the 22nd, every other document says so, and the committee
 * authorised the correction. It is applied in the rendered letter and
 * recorded in DATA-NOTES with what the source said. A date in a signed
 * letter is exactly the kind of thing that must never change quietly.
 *
 * His longer form of the theme is NOT a correction and is kept as
 * written. It is his own framing, and the site leading with "Obey and
 * Live" elsewhere does not make his sentence wrong.
 *
 * ── PUNCTUATION ──────────────────────────────────────────────────────
 *
 * Quotation marks and apostrophes are set as curly throughout. The
 * sources mix straight and curly within a single letter, and this is
 * typography rather than wording. The em and en dashes are the writers'
 * own and are kept — the same decision DATA-NOTES records for the
 * speakers' biographies, and the same exception to CLAUDE.md's "no em
 * dashes in copy", which governs copy this project writes.
 */
export const hostLetters: Record<string, HostLetter> = {
  "gerald-mochoge": {
    // Corrected: "u" → "you"; "poweful" → "powerful"; "ungratefullness" →
    // "ungratefulness"; "Gods word" → "God's word"; "pastors,elders" →
    // "pastors, elders"; one doubled space.
    blocks: [
      { kind: "paragraph", text: "Praise God Newlife fraternity" },
      {
        kind: "paragraph",
        text: "Yet another year, it seems like just the other day when we celebrated camp meeting 2025. Behold, God has been faithful, here we are again, camp meeting 2026. Ask yourself did you obey to have come this far and did those that died disobey to have slept? Or is it by God’s grace and mercy we have come this far?",
      },
      { kind: "paragraph", text: "I suggest we come to Him with:" },
      {
        kind: "list",
        items: [
          "Hearts filled with Thanksgiving",
          "open hearts to learn and be filled with His fresh goodness for yet another year.",
          "gifts of offerings lest our empty hands show ungratefulness",
          "a willing mind to make right choices and",
          "an attitude to be willing to be sent and make impacts abroad.",
        ],
      },
      {
        kind: "paragraph",
        text: "We have a powerful team of speakers, teachers and evangelists ready to nourish us with God’s word. The call is a choice for us to obey and live or disobey and perish, God forbid.",
      },
      {
        kind: "paragraph",
        text: "Let us, one and all, families and prayer cells, make this year’s camp meeting not just a success but a blessing.",
      },
      {
        kind: "paragraph",
        text: "On behalf of the Newlife pastors, elders, leaders and church at large I take this earliest time to invite us to rejoice together as we lift him who is all together lovely, as we near His soon return, even so come lord amen.",
      },
    ],
    // As signed. The site calls him Dr. Gerald Mochoge; he signs himself
    // Dr. Mochoge Nyarega. Both are his, and a signature is not the
    // site's to restyle. DATA-NOTES.
    signature: { name: "Dr. Mochoge Nyarega", role: "Snr pastor" },
    pullQuote:
      "Let us, one and all, families and prayer cells, make this year’s camp meeting not just a success but a blessing.",
  },

  "elvis-onyango": {
    // Corrected: "23rd August" → "22nd August" (AUTHORISED, not a typo —
    // see the note at the top of this file); "avenue.The Home" →
    // "Avenue. The Home"; three lines' leading spaces.
    blocks: [
      { kind: "paragraph", text: "Dear brothers and sisters in Christ," },
      {
        kind: "paragraph",
        text: "Grace and peace to you in the name of our Lord and Savior, Jesus Christ.",
      },
      {
        kind: "paragraph",
        text: "On behalf of the Newlife Seventh-day Adventist Church family, I warmly welcome you to our 2026 Camp Meeting, taking place from 15th to 22nd August 2026.",
      },
      {
        kind: "paragraph",
        text: "We are delighted to host you under the timely theme, “Grounded in the Bible, Focused on the Mission: Obey and Live; Disobey and Perish – The Choice Is Yours.”",
      },
      {
        kind: "paragraph",
        text: "In these challenging times, God is calling His people to stand firmly upon His Word and faithfully proclaim His last-day message.",
      },
      {
        kind: "paragraph",
        text: "Throughout this camp meeting, we shall study the Scriptures, seek the guidance of the Holy Spirit, and renew our commitment to Christ’s mission.",
      },
      {
        kind: "paragraph",
        text: "The appeal remains clear: “Obey and Live; Disobey and Perish – The Choice Is Yours.”",
      },
      {
        kind: "paragraph",
        text: "As we worship together through Bible study, prayer, and fellowship, may our faith be strengthened, our lives transformed, and our hearts inspired to serve God with unwavering obedience.",
      },
      {
        kind: "paragraph",
        text: "To all our guest speakers, visitors, members, and friends, thank you for joining us. We pray that your time with us will be a season of spiritual revival, lasting friendships, and abundant blessings.",
      },
      {
        kind: "paragraph",
        text: "Welcome to Seventh-day Adventist Church- Newlife 5th Ngong Avenue. The Home of PCM, the Flying and Soaring Marines.",
      },
      {
        kind: "paragraph",
        text: "May the Lord richly bless you throughout this sacred and solemn sabbath week gathering.",
      },
    ],
    signature: { name: "Pr. Elvis Onyango", role: "Associate-Host pastor" },
    pullQuote:
      "We pray that your time with us will be a season of spiritual revival, lasting friendships, and abundant blessings.",
  },

  "polycarp-nyangau": {
    // Nothing corrected but trailing spaces. The shortest of the five, at
    // about 120 words.
    blocks: [
      {
        kind: "paragraph",
        text: "Hello, friends. I want to welcome you to the Newlife 5th Ngong Avenue SDA Church Camp Meeting 2026.",
      },
      {
        kind: "paragraph",
        text: "I want to trust that God has been faithful enough and kept us all the way from when we left here last year up to this day.",
      },
      {
        kind: "paragraph",
        text: "God is calling us this year once again that we can obey Him and live, or disobey Him and perish.",
      },
      {
        kind: "paragraph",
        text: "He has given us a choice to make, and how I pray that we can choose to obey Him and live.",
      },
      {
        kind: "paragraph",
        text: "His servants have come from far and wide to come and teach us on how to obey Him, and as they minister to us from now to the end, may God bless us all.",
      },
      { kind: "paragraph", text: "This is my wish to all of us in Jesus name." },
      { kind: "paragraph", text: "Amen." },
    ],
    signature: { name: "Pr. Polycarp Nyangau", role: "Associate Pastor" },
    pullQuote:
      "He has given us a choice to make, and how I pray that we can choose to obey Him and live.",
  },

  "omondi-oyoo": {
    // The longest by far, at nearly a thousand words, and the only one
    // with headings of its own. All five are kept as real headings.
    //
    // Corrected: one HTML entity, "God&#39;s" → "God’s", which is an
    // escape that leaked into the source text rather than anything he
    // typed. The source is also hard-wrapped mid-sentence throughout, and
    // those breaks are joined back into paragraphs.
    //
    // Left alone: the em dashes, which are his; "Honor" and "organizers"
    // against "centre" and "programme", which is his own mixed usage; and
    // the full stop after "Beloved brothers and sisters in Christ".
    blocks: [
      { kind: "paragraph", text: "Beloved brothers and sisters in Christ." },
      {
        kind: "paragraph",
        text: "It is with great joy and gratitude to God that, on behalf of the church leadership and the entire congregation, I warmly welcome each one of you to this year’s Church Camp Meeting.",
      },
      {
        kind: "paragraph",
        text: "First and foremost, let us thank God for giving us the opportunity to come together in His presence. Many things may have happened since our last gathering. Some of us have experienced victories, while others have faced challenges, disappointments, sickness, loss, or uncertainty. Yet here we are today—not by our own strength, but because of the grace and faithfulness of God.",
      },
      {
        kind: "paragraph",
        text: "The Bible tells us in Mark 6:31 that Jesus said to His disciples, “Come with me by yourselves to a quiet place and get some rest.” This camp meeting provides us with exactly such an opportunity—to step away from the demands and distractions of everyday life and draw closer to God.",
      },

      { kind: "heading", text: "A Time to Reconnect with God" },
      {
        kind: "paragraph",
        text: "This is more than a programme on our church calendar. It is an opportunity for spiritual renewal. I encourage each one of us to come with an open heart. Let us give God permission to speak to us through His Word, through prayer, through fellowship, and through the ministry of one another.",
      },
      {
        kind: "paragraph",
        text: "Perhaps someone has come seeking direction. Someone else may need healing. Another may be looking for renewed strength or a fresh sense of purpose. Whatever your need may be, God knows you, God sees you, and God cares for you.",
      },
      {
        kind: "paragraph",
        text: "Let us therefore make this camp meeting a place where we encounter Christ afresh.",
      },

      { kind: "heading", text: "A Time for Fellowship" },
      {
        kind: "paragraph",
        text: "One of the great blessings of a camp meeting is the opportunity to fellowship with one another. Let us therefore take time to know one another, encourage one another, pray for one another, and support one another. Let us put aside differences and remember that we are one family in Christ.",
      },
      {
        kind: "paragraph",
        text: "As Paul reminds us in Romans 12:10, “Be devoted to one another in love. Honor one another above yourselves.”",
      },
      {
        kind: "paragraph",
        text: "May our fellowship during this camp strengthen the bonds of unity and love within our church.",
      },

      { kind: "heading", text: "A Time for Transformation" },
      {
        kind: "paragraph",
        text: "My prayer is that none of us will leave this camp exactly as we came.",
      },
      {
        kind: "paragraph",
        text: "May the Word of God challenge us, correct us, encourage us, and transform us. May we return to our homes with renewed faith, renewed commitment, and renewed determination to serve God and His people.",
      },
      {
        kind: "paragraph",
        text: "To our pastors, elders, departmental leaders, speakers, musicians, youth, children, and every person who has worked behind the scenes to make this camp possible—we thank you for your dedication and sacrifice.",
      },
      {
        kind: "paragraph",
        text: "To those visiting us for the first time, you are most welcome. We are delighted to have you with us, and we pray that you will feel at home among us.",
      },
      {
        kind: "paragraph",
        text: "To our young people and children, this camp is also yours. Participate fully, ask questions, make friends, and most importantly, allow God to speak to your heart.",
      },

      { kind: "heading", text: "Let Us Make This Camp Special" },
      {
        kind: "paragraph",
        text: "As Head Elder, I would like to encourage everyone to observe the spirit of this camp. Let us be punctual. Let us participate actively. Let us respect one another. Let us care for our environment and facilities. Above all, let us maintain an atmosphere of prayer, worship, love, and Christian fellowship.",
      },
      {
        kind: "paragraph",
        text: "Let us not simply attend the meetings; let us encounter God.",
      },
      {
        kind: "paragraph",
        text: "Let us not simply listen to sermons; let us respond to God’s Word.",
      },
      {
        kind: "paragraph",
        text: "Let us not simply enjoy fellowship; let us build lasting relationships.",
      },
      {
        kind: "paragraph",
        text: "And when this camp comes to an end, may we be able to say, like Jacob in Genesis 28:16, “Surely the Lord is in this place.”",
      },

      { kind: "heading", text: "Conclusion" },
      {
        kind: "paragraph",
        text: "Dear brothers and sisters, on behalf of the church leadership, I once again welcome you all to this camp meeting.",
      },
      {
        kind: "paragraph",
        text: "May God bless our speakers, musicians, facilitators, cooks, organizers, and every person who will contribute to the success of this gathering.",
      },
      { kind: "paragraph", text: "May the Holy Spirit guide every session." },
      {
        kind: "paragraph",
        text: "May Christ be at the centre of everything we do.",
      },
      {
        kind: "paragraph",
        text: "May there be healing where there is brokenness, restoration where there is discouragement, reconciliation where there is division, and renewed faith where there is doubt.",
      },
      {
        kind: "paragraph",
        text: "And may we all return home spiritually refreshed, physically renewed, and more committed to the mission of Christ.",
      },
      {
        kind: "paragraph",
        text: "Welcome to camp meeting. Welcome to fellowship. Welcome to renewal. Welcome into the presence of God.",
      },
      {
        kind: "paragraph",
        text: "May God richly bless you all, and may He bless this camp meeting.",
      },
      { kind: "paragraph", text: "Thank you, and God bless you." },
    ],
    signature: { name: "Omondi Oyoo", role: "Head Elder" },
    pullQuote: "Let us not simply attend the meetings; let us encounter God.",
  },

  "ken-ochuka": {
    // Nothing corrected but trailing spaces. The em dash in the first
    // line is his.
    blocks: [
      {
        kind: "paragraph",
        text: "Welcome to Camp Meeting 2026—a sacred time of fellowship, worship, reflection, and renewal in the presence of our Lord.",
      },
      {
        kind: "paragraph",
        text: "The Feast of Tabernacles is an annual appointed gathering in which we are invited to rejoice before the Lord our God and celebrate His goodness, faithfulness, and abundant grace at the place He has chosen.",
      },
      {
        kind: "paragraph",
        text: "As we journey through this blessed week, may we be reminded of the great choice that has stood before humanity from the beginning: to obey and live, or to disobey and perish. Every day, through our thoughts, words, and actions, we are making choices that shape our walk with God and have eternal significance.",
      },
      {
        kind: "paragraph",
        text: "May this Camp Meeting draw our hearts closer to Christ. May His Word search our hearts, His Spirit renew our minds, and His presence awaken within us a deeper desire to walk faithfully in His ways.",
      },
      {
        kind: "paragraph",
        text: "Let us therefore choose the path of life. Let us surrender our will to God, trust His promises, and follow wherever He leads.",
      },
      { kind: "paragraph", text: "Trust and Obey!" },
      { kind: "paragraph", text: "Our Lord is coming again!" },
      {
        kind: "paragraph",
        text: "May we be found faithful, watchful, and ready to meet Him when He comes.",
      },
      { kind: "paragraph", text: "Even so, come, Lord Jesus. Amen." },
    ],
    signature: { name: "Eld. Ken Ochuka", role: "camp meeting chair" },
    pullQuote:
      "Let us therefore choose the path of life. Let us surrender our will to God, trust His promises, and follow wherever He leads.",
  },
};

/** The letter a host has written, if they have written one. */
export function hostLetter(hostId: string): HostLetter | undefined {
  return hostLetters[hostId];
}
