---
name: 0-preflight
description: "Vágás előtti könnyű kapu: egy timeline kiválasztása és a Resolve-projekt nevének rögzítése a registry-ben."
---

# Vágás előtti preflight

## Bemenet

- A beadott forrásanyag átírása és az abból készített, scriptmappánkénti
  `recording_index.json` fájlok.
- A Gomba 1 `projects/registry.json` és az indexekben hivatkozott scriptek.
- Resolve Studio projektlista és projektkezelő API.

## Ellenőrzés és kiválasztás

1. Ellenőrizd, hogy minden index a hozzá tartozó meglévő scriptmappában van,
   és az index `script_sha256` értéke egyezik az aktuális scripttel.
2. Egyetlen index esetén automatikusan azt válaszd. Több indexnél sorold fel
   a témaazonosítót és scriptcímet, majd kérdezd meg, melyik timeline-nal
   folytassa most. Egyszerre csak egyet válassz.
3. A Gomba-projekteket a felhasználó `davinciGomba` Resolve-projektkönyvtárában
   kezeld. Kérdezd meg, hogy a projektlistában látható meglévő projektet
   használja-e, vagy hozzon létre újat.
4. Meglévő projektnél csak a Gomba 1 registry rekordjaiban szereplő,
   `resolve_project_name` értékkel rendelkező Resolve-projekteket listázd, és
   ezek közül kérd a felhasználótól a célprojekt kiválasztását. Új projektnél a kiválasztott
   script címe legyen az alapértelmezett projektnév: mutasd meg, és kérj
   jóváhagyást vagy módosított nevet. A név legyen egyedi a projektkönyvtárban.
5. Mentsd a kiválasztott vagy létrehozott projekt Resolve-ban látható nevét a
   Gomba 1 `projects/registry.json` kiválasztott `topic_id` rekordjának
   `resolve_project_name` mezőjébe. Ne tárolj projektfájl-útvonalat vagy másik
   Resolve-azonosítót.

## Resolve-projekt használata

A projektet a Resolve projektkezelőjéből töltsd be a registry-ben tárolt
`resolve_project_name` alapján. Minden timeline-módosítást a Resolve natív
projektjében végezz, majd a Resolve projektmentését használd. `.drp` exportot
ne készíts.

A forrás videó-, hang- és képfájlokat ne mozgasd, ne másold és ne módosítsd.

## Átadás

- Egyetlen kiválasztott `topic_id` és `recording_index.json` útvonala.
- A hozzá tartozó scriptútvonal.
- A registry-be elmentett `resolve_project_name`.

Csak sikeres átadás után indulhat a timeline-összeállítás. A preflight nem
választ timeline-t a felhasználó helyett, és nem készít timeline-t.
