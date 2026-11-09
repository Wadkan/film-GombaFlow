---
name: 0-preflight
description: "Rövid ellenőrzés a felvételek átírása után: a bemondott témaazonosító-szám ellenőrzése a scripthez, még a jegyzékkészítés előtt."
---

# Timeline-preflight

## Bemenet

- A sikeres átírás `master_transcript.json` fájlja és az abban hivatkozott átiratok.
- A feldolgozandó, elfogadott `3-script.md`.
- A scriptben rögzített felvételi varázsszó és a hivatkozott parancsszótár.

## Ellenőrzés

1. Olvasd ki a script fejlécének témaazonosítójából a kezdő számrészt.
2. Az átiratokból gyűjtsd ki az érvényes azonosító-bemondásokban a `timeline`
   után szereplő számokat.
   A hibás, hiányos vagy bizonytalan bemondást ne értelmezd találgatással.
3. Vesd össze a talált számokat a script témaazonosítójának számrészével.

## Eredmény és kapu

- Egyetlen, script témaazonosítójával egyező szám és egyértelmű bemondások esetén jelezd röviden: `READY`.
- Több különböző szám, eltérő szám vagy bizonytalan bemondás esetén sorold fel a talált értékeket, tájékoztasd a felhasználót, és állj meg a jegyzékkészítés előtt. Várd meg a javítást.
- Ne válaszd ki önállóan a cél-timeline-t, ne olvassz össze timeline-okat, és ne hozz létre új timeline-t.
- A preflight csak ellenőriz és tájékoztat; nem módosít fájlt vagy timeline-t.
