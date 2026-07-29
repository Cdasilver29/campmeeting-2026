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
  In particular it must not be used on the navy `#052252` surfaces: a `#013366`
  disc against that is 1.23:1.

`public/icons/icon-maskable-512.png` is generated from `adventist-mark.svg`:
a solid `#052252` square bleeding to all four edges, with the mark painted white
at 60% of the width, centred. The bleed is deliberate, since launchers crop
maskable icons to a circle. Regenerate it if the mark is replaced.
