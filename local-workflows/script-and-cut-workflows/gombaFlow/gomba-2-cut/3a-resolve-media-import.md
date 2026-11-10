---
name: 3a-resolve-media-import
description: "A felvételi jegyzék forrásainak egyszeri importja a Resolve Media Poolba."
---

# Resolve médiaimport

## Saját végrehajtási sorrend

Először olvasd el a [workflow](WORKFLOW.md) „Feldolgozási lépések”,
„Közös szerződés”, „Közös visszatérési státuszok” és „Fájlos
állapotátvétel” részeit, valamint a saját skillre vonatkozó bejegyzését.
A hívási kapcsolatokat, kapukat és státuszfeltételeket ezekből alkalmazd.

1. Ellenőrizd a projektet és a forrásokat.
2. Importáld vagy azonosítsd újra a forrásokat, majd ellenőrizd és mentsd a projektet.

## Bemenet és kapu

Bemenet a kiválasztott `recording_index.json`, az abban hivatkozott script és az
ellenőrzött, végrehajtható `retake_plan.json`. A fájl- és tervellenőrzést, valamint a
Resolve-projekt azonosságát a `cut_workflow_state.json` mentett választásával
és a workflow szabályaival ellenőrizd. Hiányzó projektválasztást ne pótolj.

Ha a kiválasztott projekt már nyitva van, ellenőrizd és használd ugyanazt a
projektet; ne ismételd meg a projektválasztást.

## Import

Az ellenőrzött állapotban a `media_import` mezőt előbb `incomplete`
állapottal, üres forráslistával és `error: null` értékkel mentsd és olvasd vissza.
Importot csak ezután indíts; korábbi siker ne maradjon friss eredményként.

1. A jegyzékből gyűjtsd ki az egyedi `source_id` értékeket és a hozzájuk
   tartozó abszolút forrásútvonalakat. Egy fájlt akkor is csak egyszer kezelj,
   ha több script-részhez vagy különböző scriptekhez tartozik. Ellenőrizd a fájlok
   SHA-256 azonosítóját a jegyzékhez.
2. A választott projekt Media Pooljában a gyökérmappát és almappáit is nézd át
   (`GetRootFolder`, `GetSubFolderList`, `GetClipList`). A klipek
   `GetClipProperty("File Path")` útvonala és a fájl ellenőrzött hash-e alapján
   keresd az eredeti teljes forrásklipet; névazonosság önmagában nem elég.
3. Az egyértelműen megtalált forrást használd újra. Több megfelelő klip,
   elérhetetlen forrás vagy bizonytalan egyezés esetén állj meg, és jelezd a
   konkrét problémát; ne importálj duplikátumot.
4. Csak a hiányzó forrásokat importáld az `ImportMedia` API-val, a forrásokhoz
   tartozó `{"FilePath": "..."}` elemek listájával. Ellenőrizd
   a visszakapott Media Pool-klip útvonalát, forráshashét és `GetUniqueId()`
   azonosítóját. A projektet natívan mentsd (`SaveProject`).

A workflow szerint mentsd és olvasd vissza az ellenőrzött importeredményt a
`cut_workflow_state.json` `media_import` mezőjében. Nem adsz át memóriaobjektumot.

Hiba vagy részleges import esetén a ténylegesen ellenőrzött forrásokat és a
hibát `incomplete` importeredményként mentsd ugyanebbe az állapotfájlba, és ha
lehetséges, mentsd az addigi Resolve-állapotot. Csak az állapotfájl útvonalát
és a konkrét akadályt jelezd. Újraindításkor ismét a Media Pool ellenőrzésével
kezdj, így a már importált források nem kerülnek be újra. Ne módosítsd az
eredeti médiafájlokat, és ne készíts vagy módosíts timeline-t.

Ne írj a Gomba 1 registrybe vagy a `recording_index.json` fájlba.
