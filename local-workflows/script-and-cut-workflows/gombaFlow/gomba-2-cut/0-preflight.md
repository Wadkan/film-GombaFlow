---
name: 0-preflight
description: "Rövid ellenőrzés a felvételek átírása után: a bemondott timeline-nevek egyeztetése a script céljaival, még a jegyzékkészítés előtt."
---

# Timeline-preflight

## Bemenet

- A sikeres átírás `master_transcript.json` fájlja és az abban hivatkozott átiratok.
- A feldolgozandó, elfogadott `3-script.md`.
- A scriptben rögzített felvételi varázsszó és a hivatkozott parancsszótár.

## Ellenőrzés

1. Olvasd ki a scriptben engedélyezett cél-timeline-neveket.
2. Az átiratokból keresd ki a felismert azonosító-bemondások timeline-mezőit.
   A hibás, hiányos vagy bizonytalan bemondást ne értelmezd találgatással.
3. Vesd össze a talált timeline-okat a script céljaival.

## Eredmény és kapu

- Egyetlen, scriptben szereplő timeline és egyértelmű bemondások esetén jelezd röviden: `READY`, majd add meg a timeline-nevet.
- Több talált timeline, scriptben nem szereplő timeline vagy bizonytalan bemondás esetén sorold fel röviden az érintett neveket, jelezd a problémát a felhasználónak, és állj meg a jegyzékkészítés előtt. Várd meg a felhasználó hozzárendelését vagy javítását.
- Ne válaszd ki önállóan a cél-timeline-t, ne olvassz össze timeline-okat, és ne hozz létre új timeline-t.
- A preflight csak ellenőriz és tájékoztat; nem módosít fájlt vagy timeline-t.
