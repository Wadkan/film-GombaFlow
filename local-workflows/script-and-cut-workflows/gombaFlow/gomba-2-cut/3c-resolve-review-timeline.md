---
name: 3c-resolve-review-timeline
description: "A teljes felvételi timeline összeállítása és a megtartandó részek jelölése Resolve-ban."
---

# Resolve review timeline és markerek

## Bemenet

A kiválasztott `recording_index.json`, az `1.1` sémájú, `coverage_checked: true`
és `ready_for_execution` állapotú `retake_plan.json`, valamint a [médiaregiszter](3b-resolve-media-registry.md)
`resolve-media-registry.json` kimenete. A projektet és a forrásokat a
regiszter Resolve-azonosítóival használd; ne importálj újra médiát.
Ellenőrizd a terv script- és jegyzéklenyomatát, a `topic_id` és a nyitott
Resolve-projekt egyezését, a forráskapcsolatokat és az időtartományokat.
Hibás vagy hiányzó bemenetnél jelezd a konkrét akadályt.

A timeline-neveket a [timeline-összeállítás](3-timeline-assembly.md)
`Timeline-nevek` része adja. A script egyetlen logikai céljához tartozó első,
review timeline-t hozd létre. Meglévő, nem üres timeline-nál ne írj felül vagy
duplikálj tartalmat; állj meg és jelezd. A második timeline-t ne készítsd el.

## Teljes felvételek és markerek

1. Felvételi sorrendben helyezd el az adott `topic_id` minden azonosított
   felvételváltozatát: külön forrásoknál a média rögzítési ideje, ennek
   hiányában a fájl létrehozási dátuma szerint; egy forráson belül a
   forrásidő szerint. A jegyzék `source_start`–`source_end` tartományait
   használd, az azonosítóbemondásokkal együtt. Ha egy forrás több témát
   tartalmaz, csak a kiválasztott témához tartozó részeit helyezd el.
   A felvételek eredeti képét és hangját szinkronban őrizd meg.
2. A terv `retained_ranges` minden eleménél ellenőrizd a `recording_id`,
   `source_id`, `source_start` és `source_end` mezőket, majd rendeld a
   tartományt az első timeline megfelelő klippéldányához. A forrás saját,
   médiaregiszterbeli FPS-ével alakítsd a forrásmásodperceket forrásképkockákra.
   A klip forráskezdetéhez és timeline-kezdőképkockájához viszonyítva számítsd
   ki a marker klipen belüli képkockahelyét. Bizonytalan csoportnál a teljes
   `source_start`–`source_end` tartományt jelöld, az azonosítóbemondással együtt.
3. Minden nem üres, érvényes megtartási tartományhoz a
   [markerindex](davinci_marker_index.md) szerinti piros megtartási markerpárt
   helyezd el a megfelelő timeline-klipen `TimelineItem.AddMarker()` hívással.
   Üres `retained_ranges` esetén ne készíts piros markert; ellenőrizd, hogy a
   teljes kihagyást `approved_omissions` vagy igazolt törlési döntés fedi-e.
   Más esetben jelezd az adatellentmondást.
   Olvasd vissza a markereket `GetMarkers()`-szel, és ellenőrizd a színt,
   nevet és helyet.
   TODO KÉSŐBB LESZ IMPLEMENTALVA: A cím- és képmarkereket ebben a lépésben ne hozd létre.
4. Kézi vágásra jelölt vagy nem egyértelmű tartománynál ne találj ki vágási
   határt: az érintett felvétel maradjon teljesen meg. Ha azon ez a lépés már
   elhelyezett piros megtartási markereket, a sárga jelölés előtt távolítsd el
   az érintett felvételhez tartozókat. Az első review timeline-on
   a [markerindex](davinci_marker_index.md) szerinti sárga kezdő és záró markerrel
   jelöld a teljes bizonytalan rész elejét és végét. A markereket olvasd vissza.
   Tartalmi bizonytalanságnál ne hagyj félreérthető megtartási markerpárt;
   a felvételt őrizd meg, és folytasd a többi rész feldolgozását.

Ha bármely szükséges marker létrehozása, eltávolítása vagy visszaellenőrzése technikai okból
meghiúsul, azonnal állj meg, és ne jelents sikert. Ha lehetséges, mentsd a
Resolve-projekt addigi állapotát és a `timeline_assembly.json` kimenetet
`incomplete` státusszal. Jelezd az érintett klipet, script-ID-t, időtartományt
és a konkrét hibát; ne indíts automatikus újrapróbálkozást vagy duplikálást.

Mentsd a Resolve-projektet, és ellenőrizd a tényleges timeline-t és kliphatárokat.
A meglévő `timeline_assembly.json` átadásban rögzítsd a projekt- és
timeline-azonosítót, valamint a behelyezett felvételek forrás- és
timeline-kapcsolatait. A felhasználónak add át a review timeline nevét és a
bizonytalan részeket. A felhasználó ezután a Resolve-ban módosíthat, törölhet
vagy hozzáadhat markereket; a második timeline vágását ez a lépés nem indítja.
