# Brand marks

`adventist-mark.svg` and `adventist-disc.svg` are **traced reconstructions**, not
the official Seventh-day Adventist Church artwork. They were redrawn to match the
published logo closely enough to ship, but they have no authorisation behind them
and they are not pixel-faithful to the trademarked original.

When the conference supplies the official vector, drop it in at these same paths
and delete this note. Nothing else needs to change: every consumer references
`/brand/adventist-mark.svg` or `/brand/adventist-disc.svg` by path.

## Using them

Both files are `fill="currentColor"` throughout. Recolour them from CSS by setting
`color` on the element that renders them. Do not edit the files and do not commit
a second copy in another colour.

- `adventist-mark.svg` is the flame, open book and cross, transparent behind.
  This is the one that goes in the header and footer lockup, where it inherits
  the surrounding text colour.
- `adventist-disc.svg` is the same mark inside a filled circle. The circle is
  also `currentColor`, so on any surface close to the fill colour it disappears.
  In particular it must not be used on the Emperor `#4b207f` surfaces: an
  Emperor disc against that is 1.00:1, and even `--color-accent-700` `#301451`
  against it is only 1.35:1.

`public/icons/icon-maskable-512.png` is generated from `adventist-mark.svg`:
a solid `#4b207f` (Emperor) square bleeding to all four edges, with the mark
painted white at 60% of the width, centred, at 11.59:1. The bleed is
deliberate, since launchers crop maskable icons to a circle. Regenerate it if
the mark is replaced.

The ground was `#052252` (navy-900) until the palette change. The existing file
was recoloured in place rather than redrawn: it is a two-colour image, so each
pixel's blend fraction along the ground-to-white line was solved and re-applied
to Emperor, which moves the antialiased fringe with the ground instead of
leaving a navy edge around every curve of the mark.

`icon-192.png` and `icon-512.png` are a **black** mark on transparency, which
is a separate problem from the palette and is not fixed here: on a dark
launcher background they are close to invisible. They are placeholders the
committee owes real artwork for, and the maskable icon is the one that has a
ground to be wrong about.
