# IMPORTANT NOTES

- This fetcher only works for cards in retail products (booster packs and preconstructed decks) and promo packs.  It may not work properly for promo printings such as Secret Lair, MPR, GP promos, etc.

# To Run

```
node index.js <path_to_csv>
```

# Input Syntax

CSV file.  Required headings:

- `card_name`: Name of the card
- `card_number`: Collector number of the card.  Might be hard to find for old cards, can find it on F2F's website.  No leading zeroes.
- `set_name`: Full name of the set
- `set_code`: 3-letter set code, e.g. `WAR` for War of the Spark

Optional headings:

- `variant`: Whether the card is `Extended Art` or `Borderless`
- `extended_art_modifier` (required for F2F search for certain cards): Marketing modifier, e.g.:
    - `Scene` (Scene box)
    - `Field Notes` (Bloomburrow borderless)
    - `Double Exposure` (Duskmourn borderless)
- `foil`: type of foiling (regular foil = `foil`)
- `list`: `true` or `false`, if the card is "The List" printing (default false)
- `promo`: Type of promo (`prerelease` or `promo pack`)