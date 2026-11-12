---
name: 3c-resolve-review-timeline
description: "A teljes felvételi timeline összeállítása és a megtartandó részek jelölése Resolve-ban."
---

# Resolve review timeline és markerek

## Saját végrehajtási sorrend

Először olvasd el a [workflow](WORKFLOW.md) „Feldolgozási lépések”,
„Közös szerződés”, „Közös visszatérési státuszok” és „Fájlos
állapotátvétel” részeit, valamint a saját skillre vonatkozó bejegyzését.
A hívási kapcsolatokat, kapukat és státuszfeltételeket ezekből alkalmazd.

1. Ellenőrizd a tervet, a projektet és a forrásokat.
2. Helyezd el a felvételeket és markereket, majd ellenőrizd és mentsd az eredményt.

## Bemenet

A kiválasztott `recording_index.json`, az `1.1` sémájú, `coverage_checked: true`
és `ready_for_execution` állapotú `retake_plan.json`, valamint a [médiaregiszter](3b-resolve-media-registry.md)
`review_timeline_resolve_media_registry.json` kimenete. A projektet és a forrásokat a
regiszter Resolve-azonosítóival használd; ne importálj újra médiát.
Ellenőrizd a terv script- és jegyzéklenyomatát, a `topic_id` és a nyitott
Resolve-projekt egyezését, a forráskapcsolatokat és az időtartományokat.
Hibás vagy hiányzó bemenetnél jelezd a konkrét akadályt.

A timeline-neveket a [timeline-összeállítás](3-timeline-assembly.md)
`Timeline-nevek` része adja. A script egyetlen logikai céljához tartozó első,
review timeline-t hozd létre. Meglévő, nem üres timeline-nál ne írj felül vagy
duplikálj tartalmat; a workflow szerinti pótfelvételi hozzáfűzés kivételével
állj meg és jelezd. A második timeline-t ne készítsd el.

## Pótfelvételi hozzáfűzés

A mentett assembly és az aktuális jegyzék összevetésével válaszd ki a még
nem elhelyezett új `recording_id` értékeket. Ellenőrizd a korábbi assembly
`completed` állapotát, változatlan scriptlenyomatát és ugyanannak a projektnek
és review timeline-nak az egyedi azonosítóját. A korábbi assembly-rekordokhoz
tartozó jegyzékadatok nem változhattak meg; az új rekordok a jóváhagyott
pótfelvételi manifestből származzanak. Eltérés vagy részleges korábbi művelet
nem kezelhető automatikus hozzáfűzésként.

Ha van új rekord, az első timeline-módosítás előtt mentsd és olvasd vissza
az assemblyt `incomplete` státusszal, a korábbi bejegyzések megőrzésével.
Az új rekordok pontos listáját ugyanebben a mentésben rögzítsd a
`last_append_recording_ids` mezőben a kimeneti szerződés szerint.
Csak a sikeres visszaolvasás után kezdj hozzáfűzni. Megszakítás után ez az
állapot kézi egyeztetést igényel; ne állítsd automatikusan `completed` értékre,
és ne ismételd meg a hozzáfűzést.

Csak az új rekordokat helyezd el, az aktuális timeline összes sávjának
legutolsó klipvége után, egymás közt a lenti felvételi sorrendben. Ugyanazt a
timeline-t és annak beállításait használd. A lenti elhelyezési, markerezési és
visszaellenőrzési szabályokat ebben a módban csak az új klipekre alkalmazd.
A korábbi klipekhez, kapcsolt hangokhoz és usermarkerekhez ne nyúlj; a user
által törölt régi klipet az assembly alapján ne helyezd vissza.

A visszaellenőrzött új elhelyezéseket fűzd a meglévő
`review_timeline_assembly.json` `clips` listájához. Őrizd meg a korábbi
bejegyzéseket mint az eredeti elhelyezések kapcsolatait; ezek nem írják felül
a user azóta végzett timeline-módosításait. Frissítsd a jegyzéklenyomatot és
a hiányösszesítést; csak a sikeres Resolve-mentés és minden új elhelyezés és
marker visszaellenőrzése után mentsd és olvasd vissza `completed` státusszal
az assemblyt. Ha nincs új
rekord, a `last_append_recording_ids` legyen üres lista; ne helyezz el és
ne markerezz újra semmit. Új timeline teljes összeállításánál e mező `null`.

## Teljes felvételek és markerek

1. Felvételi sorrendben helyezd el az adott `topic_id` minden azonosított
   felvételváltozatát: külön forrásoknál a média rögzítési ideje, ennek
   hiányában a fájl létrehozási dátuma szerint; egy forráson belül a
   forrásidő szerint. A jegyzék `source_start`–`source_end` tartományait
   használd, az azonosítóbemondásokkal együtt. Ha egy forrás több témát
   tartalmaz, csak a kiválasztott témához tartozó részeit helyezd el.
   A felvételek eredeti képét és hangját szinkronban őrizd meg. A B-roll képe
   és meglévő hangja a talking headtől külön video-, illetve hangsávra kerüljön;
   a hangot ne némítsd vagy módosítsd. A külön sávokon is őrizd meg a teljes
   timeline felvételi sorrendjét, és a tényleges sávokat olvasd vissza. A
   videót és a hozzá tartozó összes meglévő hangklipet kapcsold össze a
   Resolve-ban, majd olvasd vissza a kapcsolatot. Sikertelen kapcsolás vagy
   technikai visszaolvasási hiba esetén állj meg és jelezd.
2. A terv `retained_ranges` minden eleménél ellenőrizd a `recording_id`,
   `source_id`, `source_start` és `source_end` mezőket, majd rendeld a
   tartományt az első timeline megfelelő klippéldányához. A forrás saját,
   médiaregiszterbeli FPS-ével alakítsd a forrásmásodperceket félig nyílt
   forrásképkocka-tartománnyá: a kezdetet lefelé, a véghatárt felfelé kerekítsd.
   A Resolve-ból visszaolvasott forrás- és timeline-kliphatárokkal, valamint
   a két időalappal rendeld a tartományt a megfelelő timeline-képkockákhoz.
   A [markerindex](davinci_marker_index.md) szerint a kezdő marker az első,
   a záró marker az utolsó megtartott képkockára kerüljön, ne a kizáró
   véghatárra. Bizonytalan csoportnál a teljes
   `source_start`–`source_end` tartományt jelöld, az azonosítóbemondással együtt.
3. A nem kézi vágásra jelölt csoportok minden nem üres, érvényes megtartási tartományához a
   [markerindex](davinci_marker_index.md) szerinti piros megtartási markerpárt
   helyezd el a megfelelő videoklipen `TimelineItem.AddMarker()` hívással. A
   kapcsolt hangra ne készíts külön vágási markert; a videó jelölése az egész
   kép–hang egységre vonatkozik.
   Felvételenként is vizsgáld a teljes kihagyást, akkor is, ha ugyanazon
   script-ID más take-jeinek vannak megtartási tartományai. Ha az elhelyezett
   klip teljes kihagyását a terv igazolt törlési döntése vagy rá vonatkozó
   `approved_omissions` bejegyzése bizonyítja, a markerindex szerinti egyetlen
   sárga `OMIT TAKE` tartománymarkert helyezd el rajta. A marker a klip
   kezdetén induljon, időtartama a teljes, Resolve-ból visszaolvasott kliphossz
   legyen. A marker megjegyzésébe írd a script-ID-t, `recording_id`-t és az
   elhagyás rövid angol indokát. A klip a review timeline-on teljesen megmarad.
   A megtartási tartomány hiánya önmagában nem bizonyít teljes kihagyást;
   bizonyíték nélkül a 4. pont szerinti review jelölést használd.
   Olvasd vissza a markereket `GetMarkers()`-szel, és ellenőrizd a színt,
   nevet és helyet.
   TODO KÉSŐBB LESZ IMPLEMENTALVA: A cím- és képmarkereket ebben a lépésben ne hozd létre.
4. Kézi vágásra jelölt vagy nem egyértelmű tartománynál ne találj ki vágási
   határt: az érintett felvétel maradjon teljesen meg. Ha azon ez a lépés már
   elhelyezett piros megtartási vagy `OMIT TAKE` markereket, a review jelölés előtt távolítsd el
   az érintett felvételhez tartozókat. Az első review timeline-on
   a [markerindex](davinci_marker_index.md) szerinti sárga kezdő és záró markerrel
   jelöld a teljes bizonytalan rész elejét és végét. A markereket olvasd vissza.
   Tartalmi bizonytalanságnál ne hagyj félreérthető megtartási markerpárt;
   a felvételt őrizd meg, és folytasd a többi rész feldolgozását.
   A bizonytalanságot a [közös problémánapló](../PROBLEM_LOG.md) szerint a
   script saját `problems.md` fájljának `Kézi vágást igénylő részek` fejléce
   alá is rögzítsd a review timeline nevével és markerhelyeivel.
5. Olvasd vissza az összes elhelyezett videoklip markereit és kapcsolt hangjait.
   Egyetlen kép–hang egység sem maradhat jelölés nélkül: a videoklipen
   ellenőrzött megtartási pár, teljes klipet lefedő
   `OMIT TAKE` vagy teljes bizonytalan klipet jelölő review pár szükséges.
   Hiányzó vagy ütköző tartalmi döntésnél alkalmazd a 4. pontot; az `OMIT TAKE`
   és más vágási jelölés együtt nem érvényes. Ellenőrizd a neveket, színeket,
   markerpárokat és az `OMIT TAKE` teljes időtartamát is.

Ha bármely szükséges marker létrehozása, eltávolítása vagy visszaellenőrzése technikai okból
meghiúsul, azonnal állj meg, és ne jelents sikert. Ha lehetséges, mentsd a
Resolve-projekt addigi állapotát és a `review_timeline_assembly.json` kimenetet
`incomplete` státusszal; a konkrét hibát, érintett klipet, script-ID-t és
időtartományt a kimenet `error` mezőjében rögzítsd. A felhasználót a
workflow közös hibakezelése szerint tájékoztasd; ne indíts automatikus
újrapróbálkozást vagy duplikálást.

Mentsd a Resolve-projektet, és ellenőrizd a tényleges timeline-t és kliphatárokat.
A meglévő `review_timeline_assembly.json` átadásban rögzítsd a projekt- és
timeline-azonosítót, valamint a behelyezett felvételek forrás- és
timeline-kapcsolatait. A felhasználónak jelezd a review timeline nevét és,
ha probléma merült fel, a problémalista útvonalát.
A következő kézi teendőt és a folytatás feltételét a workflow review-kapuja
szerint mondd ki; a szükséges userjelzést ne helyettesítse a kész státusz.
