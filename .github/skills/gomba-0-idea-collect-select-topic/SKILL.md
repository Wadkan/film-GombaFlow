---
name: gomba-0-idea-collect-select-topic
description: 'Egy korábban elmentett Gomba videóötlet kiválasztása pontos téma-ID alapján, és az egyetlen teljes rekord mentése a scriptíró fázis számára. Használd, amikor a felhasználó megadja a választott ötlet ID-ját. Nem kutat és nem ír briefet.'
argument-hint: '<topic-id>'
disable-model-invocation: true
---

# Kiválasztott téma átadása

## Bemenet és kimenet

- Olvasd a [workflow-t](../../../gomba-film-workflows/gomba-0-idea-collect-topic-selection.md)
  és a [tématemplate-et](../../../gomba-0-idea-collector/templates/topic-template.json).
- Kötelező bemenet a felhasználó által megadott pontos `<topic-id>`.
- Forrás: `gomba-0-idea-collector/results/*-ideas.md`.
- Egyetlen engedélyezett kimenet:
  `gomba-1-script-writer/projects/<topic-id>/selected-topic.json`.
  Minden útvonal a repository gyökerétől értendő.

## Végrehajtás

1. Ellenőrizd a megadott ID-t a workflow mintája szerint, mielőtt útvonalat
   képeznél belőle. Hiányzó ID-nél kérd a pontos azonosítót; ne válassz
   automatikusan első helyezettet. Hibás ID-t ne alakíts át csendben.
2. A mentett eredmények `json` kódblokkjait JSON-ként értelmezve keresd meg
   az `id` mező pontos egyezését. A táblázat, cím vagy részleges szövegegyezés
   nem elég. Nulla találatnál jelezz hibát és mutasd az elérhető ID-ket.
   Több találatnál jelezd a többértelműséget, ne válassz önkényesen.
   A keresést érintő hibás JSON-t konkrét fájlhoz kötve jelezd, ne ugord át
   csendben.
3. Ellenőrizd a teljes rekord template-mezőit, a `shortlisted` státuszt
   és az egyértelmű fő forrásvideót a `source.url` és `assets.video_urls`
   mezőkben. Hiányos rekordnál ne írj hiányos átadást.
4. Készítsd elő ugyanazt a teljes rekordot, kizárólag a `status` mezőt
   változtatva `"selected"` értékre. Ne értékeld újra és ne egészítsd ki
   új kutatással; ne másold át a másik két jelöltet.
5. Ha a célfájl már létezik, hasonlítsd össze JSON-tartalom szerint.
   Azonos tartalomnál jelezd a meglévő átadást, ne írj új másolatot.
   Eltérő tartalomnál állj meg, és kérj felhasználói döntést; ne írj felül.
6. Új átadásnál hozd létre a projektmappát és mentsd az egyetlen JSON-fájlt.
   A forrásfájlt és a projekt más fájljait ne módosítsd.
   Ellenőrizd a mentett JSON parse-olhatóságát, ID-ját és a forrással való
   egyezést a szándékos státuszváltáson kívül.
7. Válaszolj a kiválasztott ID-val, címmel és a mentett fájl linkjével.
   Add meg a következő lépést:
   [ötletátvétel](../../../gomba-1-script-writer/skills/gomba-1-script-writer-0-idea-intake/SKILL.md),
   ahol `<selected-topic-path>` ez a mentett fájl, a projekt pedig a
   tartalmazó mappa.

Ne készíts briefet, ne indíts következő skillt, és ne tekintsd ezt
a scriptíró brief emberi jóváhagyásának.
