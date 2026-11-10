---
name: 0-preflight
description: "Fájlalapú vágás előtti kapu: egy felvételi jegyzék és a hozzá tartozó script kiválasztása."
---

# Vágás előtti preflight

## Saját végrehajtási sorrend

Először olvasd el a [workflow](WORKFLOW.md) „Feldolgozási lépések”,
„Közös szerződés”, „Közös visszatérési státuszok” és „Fájlos
állapotátvétel” részeit, valamint a saját skillre vonatkozó bejegyzését.
A hívási kapcsolatokat, kapukat és státuszfeltételeket ezekből alkalmazd.

1. Ellenőrizd az indexeket és a scriptlenyomatokat.
2. Válaszd ki az egyetlen feldolgozandó scriptet.
3. Mentsd és olvasd vissza a workflow szerinti `cut_workflow_state.json` fájlt.

## Bemenet

- A beadott forrásanyag átírása és az abból készített, scriptmappánkénti
  `recording_index.json` fájlok.
- Az indexekben hivatkozott scriptek.

## Ellenőrzés és kiválasztás

1. Ellenőrizd, hogy minden index a hozzá tartozó meglévő scriptmappában van,
   és az index `script_sha256` értéke egyezik az aktuális scripttel.
2. Egyetlen index esetén automatikusan azt válaszd. Több indexnél sorold fel
   a témaazonosítót és scriptcímet, majd kérdezd meg, melyik scripttel
   folytassa most. Egyszerre csak egyet válassz.

Az ellenőrzött választást a kiválasztott scriptmappában lévő
`cut_workflow_state.json` fájlba mentsd a workflow sémája szerint. Csak ezt a
saját állapotot írhatod; a bemeneti fájlok változatlanok. Resolve-projektet ne listázz, válassz ki,
hozz létre vagy módosíts. A projektválasztás a terv elkészülte utáni
timeline-összeállításkor történik.

A forrás videó-, hang- és képfájlokat ne mozgasd, ne másold és ne módosítsd.
