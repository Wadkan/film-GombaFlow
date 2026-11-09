---
name: 0-preflight
description: "Fájlalapú vágás előtti kapu: egy felvételi jegyzék és a hozzá tartozó script kiválasztása."
---

# Vágás előtti preflight

## Bemenet

- A beadott forrásanyag átírása és az abból készített, scriptmappánkénti
  `recording_index.json` fájlok.
- A Gomba 1 `projects/registry.json` és az indexekben hivatkozott scriptek.

## Ellenőrzés és kiválasztás

1. Ellenőrizd, hogy minden index a hozzá tartozó meglévő scriptmappában van,
   és az index `script_sha256` értéke egyezik az aktuális scripttel.
2. Egyetlen index esetén automatikusan azt válaszd. Több indexnél sorold fel
   a témaazonosítót és scriptcímet, majd kérdezd meg, melyik scripttel
   folytassa most. Egyszerre csak egyet válassz.

Ez a preflight csak fájlokat olvas. Resolve-projektet ne listázz, válassz ki,
hozz létre vagy módosíts. A projektválasztás a terv review-ja utáni
timeline-összeállításkor történik.

A forrás videó-, hang- és képfájlokat ne mozgasd, ne másold és ne módosítsd.

## Átadás

- Egyetlen kiválasztott `topic_id` és `recording_index.json` útvonala.
- A hozzá tartozó scriptútvonal.

Az átadás a vágási terv lépéséhez vezet. A timeline-összeállítás csak a terv
elkészülte és felhasználói review-ja után, külön indításra kezdődhet.
