---
name: 3a-resolve-media-import
description: "A felvételi jegyzék forrásainak egyszeri importja a Resolve Media Poolba."
---

# Resolve médiaimport

## Bemenet és kapu

Bemenet a kiválasztott `recording_index.json`, az abban hivatkozott script és az
ellenőrzött, végrehajtható `retake_plan.json`. A fájl- és tervellenőrzést, valamint a
Resolve-projekt választását a [timeline-összeállítás](3-timeline-assembly.md)
végrehajtás előtti szabályai szerint végezd. Csak a terv elkészülte és külön
felhasználói indítás után nyiss vagy hozz létre Resolve-projektet.

Ha a 3. timeline-összeállítás már átadta a kiválasztott, megnyitott projekt
azonosítóját, ellenőrizd és használd ugyanazt a projektet; ne ismételd meg a
projektválasztást. A szülőlépés indítása erre az importlépésre is vonatkozik.

## Import

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

Hiba vagy részleges import esetén jelezd, mely források kerültek be, és mentsd
az addigi Resolve-állapotot. Újraindításkor ismét a Media Pool ellenőrzésével
kezdj, így a már importált források nem kerülnek be újra. Ne módosítsd az
eredeti médiafájlokat, és ne készíts vagy módosíts timeline-t.

## Átadás

A hívónak add át a Resolve-ból visszaolvasott `resolve_project_id` és
`resolve_project_name` értékét, valamint forrásonként a `source_id`,
`source_path` és `resolve_media_pool_item_id` adatokat. Az utóbbi a Media Pool
klipjének `GetUniqueId()` értéke. A [médiaregiszter](3b-resolve-media-registry.md)
külön lépése tölti ki és menti a teljes regisztert, beleértve a forrás FPS-ét.
Ne írj a Gomba 1 registrybe vagy a `recording_index.json` fájlba.
