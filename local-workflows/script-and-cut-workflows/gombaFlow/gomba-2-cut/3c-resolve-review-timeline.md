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
review timeline-t használd. Ha a megfelelő projektben már létezik a célnevű,
üres timeline, használd újra; ne hozz létre másodikat. Meglévő, nem üres
timeline-nál ne írj felül vagy duplikálj tartalmat; a workflow szerinti
pótfelvételi hozzáfűzés kivételével állj meg és jelezd. Korábbi assembly
újrafuttatásakor előbb kérj explicit userdöntést. Jóváhagyott újrafuttatásnál
a cél timeline csak akkor használható újra, ha a Resolve-ból visszaolvasva
üres; a régi assemblyből törölt klipet ne állítsd vissza. A második timeline-t
ne készítsd el.

## Pótfelvételi hozzáfűzés

A mentett assembly és az aktuális jegyzék összevetésével válaszd ki a még
nem elhelyezett új `recording_id` értékeket. Ellenőrizd a korábbi assembly
`completed` állapotát, változatlan scriptlenyomatát és ugyanannak a projektnek
és review timeline-nak az egyedi azonosítóját. A korábbi assembly-rekordokhoz
tartozó jegyzékadatok nem változhattak meg; az új rekordok a jóváhagyott
pótfelvételi manifestből származzanak. Eltérés vagy részleges korábbi művelet
nem kezelhető automatikus hozzáfűzésként.

Ha van új rekord, az első timeline-módosítás előtt mentsd és olvasd vissza
az assemblyt `incomplete` státusszal, a korábbi fizikai klip- és logikai
rekordkapcsolatok megőrzésével. Az új rekordok pontos listáját ugyanebben a
mentésben rögzítsd a `last_append_recording_ids` mezőben a kimeneti szerződés
szerint.
Csak a sikeres visszaolvasás után kezdj hozzáfűzni. Megszakítás után ez az
állapot kézi egyeztetést igényel; ne állítsd automatikusan `completed` értékre,
és ne ismételd meg a hozzáfűzést.

Az új logikai rekordokat a korábbi és új fizikai források alapján kezeld:
ha az új rekord forrása már szerepel egy teljes timeline-klipben, csak a
logikai leképezést és az új tartomány markereit add hozzá; ne helyezd be újra
a teljes fájlt. Új fizikai forrásnál egy teljes klipet helyezz az aktuális
sávok legutolsó klipvége után, és az ugyanabból a forrásból származó összes új
rekordot ehhez az egy kliphez rendeld. Ugyanazt a timeline-t és beállításait
használd. A korábbi klipekhez, hangokhoz és usermarkerekhez ne nyúlj, kivéve
az új rekordhoz szükséges, nem ütköző markerek hozzáadását; a user által
törölt régi klipet ne állítsd vissza.

A visszaellenőrzött új fizikai klipeket és logikai leképezéseket fűzd a
`review_timeline_assembly.json` `clips` és `recordings` listájához. Őrizd meg
a korábbi bejegyzéseket mint az eredeti elhelyezések kapcsolatait; ezek nem
írják felül a user azóta végzett timeline-módosításait. Frissítsd a
jegyzéklenyomatot és a hiányösszesítést; csak a sikeres Resolve-mentés és
minden új klip, leképezés és marker visszaellenőrzése után mentsd és olvasd
vissza `completed` státusszal az assemblyt. Ha nincs új
rekord, a `last_append_recording_ids` legyen üres lista; ne helyezz el és
ne markerezz újra semmit. Új timeline teljes összeállításánál e mező `null`.

## Teljes felvételek és markerek

1. A kiválasztott témához tartozó indexrekordokból gyűjtsd ki a fizikai
   forrásfájlokat, fájlonként egyedi `source_id` szerint. Felvételi sorrendben
   helyezz el minden ilyen fájlt pontosan egyszer, a teljes tényleges
   videotartományával, az azonosítóbemondásokkal együtt; a `recording_index`
   `source_start`–`source_end` mezői logikai rekordhatárok, nem timeline-klip
   határok. Az audio-only tail-t ne vedd bele, ha annak elhagyását a user
   kifejezetten jóváhagyta; más eltérő audio/video végpontnál állj meg és
   kérj döntést. A fájlok közötti sorrendet a média rögzítési ideje, ennek
   hiányában a fájl létrehozási dátuma, egy forráson belül a source time adja.
   A teljes eredeti kép és a meglévő hang maradjon szinkronban, egymáshoz
   kapcsolva; a teljes fizikai klipeket a fő review video- és hangsávra
   helyezd. Ezen a timeline-on a fizikai forrás fájlszinten marad egyetlen
   kép–hang egység, ezért a logikai `clip_type` nem osztja külön sávokra és
   nem vághatja szét. A `recordings` leképezésben őrizd meg az egyes logikai
   rekordok `clip_type` értékét; a B-roll és talking-head tartományok külön
   sávra rendezése a 3e Rough Cut feladata. A tényleges sávokat, teljes
   forrástartományokat és hangkapcsolatot olvasd vissza.
2. A timeline összes fizikai klipjének forrástartománya legyen teljes.
   Minden indexrekordot rendelj hozzá pontosan egy, azonos `source_id`-jú
   fizikai kliphez; több `recording_id` szándékosan hivatkozhat ugyanarra a
   `timeline_clip_id`-ra. A terv `retained_ranges` elemeinél ellenőrizd a
   `recording_id`, `source_id`, `source_start` és `source_end` mezőket, majd
   számítsd ki a logikai tartomány félig nyílt forrásképkocka-határait a
   médiaregiszter FPS-ével: a kezdést lefelé, a véghatárt felfelé kerekítsd.
   A Resolve-ból visszaolvasott teljes kliphatárok és a timeline időalapja
   alapján képezd a logikai tartomány timeline-képkocka-határait. E határokat
   írd a `recordings` leképezésbe. Ne készíts `AppendToTimeline()`-hívást
   indexrekordonként.
3. Minden logikai rekord tényleges tartományát a fizikai forrásklip
   videóelemén jelöld. Érvényes, nem kézi vágású megtartási tartományhoz a
   [markerindex](davinci_marker_index.md) szerinti piros `KEEP IN` / `KEEP OUT`
   párt, bizonytalan vagy kézi vágású tartományhoz sárga `REVIEW START` /
   `REVIEW END` párt használj. A kezdő marker az első, a záró marker az utolsó
   megtartott képkockára kerüljön. A videoklip `TimelineItem.AddMarker()`
   hívásával helyezd el, majd olvasd vissza `GetMarkers()`-szel. A kapcsolt
   hangra ne készíts külön markerpárt; a videó markerpárja a logikai
   kép–hang tartományt jelöli.
   Teljes fizikai klipre szóló jóváhagyott kihagyásnál használható az egyetlen
   sárga `OMIT TAKE`; részleges/logikai rekord kihagyását ne jelöld a teljes
   fizikai klipet lefedő markerrel. A marker megjegyzésében szerepeljen a
   `recording_id`; `script_id` csak akkor szerepeljen, ha a jegyzékben nem
   `null`. Az ismeretlen scriptmetaadatot ne találd ki.
4. A forrástartományon belüli azonosítatlan anyagot és bizonytalanságot őrizd
   meg teljesen, és a [markerindex](davinci_marker_index.md) szerinti sárga
   review markerpárral jelöld. Ha egy rekordhoz hiányzik érvényes megtartási
   vagy kihagyási döntés, ne következtess törlésre: az érintett logikai
   tartomány maradjon bent, kapjon review jelölést, és a bizonytalanságot a
   [közös problémanapló](../PROBLEM_LOG.md) szerint rögzítsd a script
   `problems.md` fájljába a review timeline nevével és markerhelyeivel.
   Eltérő vagy átfedő döntésnél a review jelölés élvez elsőbbséget az
   érintett tartományon; az azon kívüli, nem ütköző jelöléseket tartsd meg.
5. Olvasd vissza minden fizikai videoklip teljes forrástartományát, kapcsolt
   hangját, sávját és markerlistáját, majd ellenőrizd az összes logikai
   `recording_id` leképezést és markerpárt. A review timeline-on a teljes
   forrásklip maradjon meg; a Rough Cut csak később, a 3e-ben használja a
   logikai forrástartományokat. Az `OMIT TAKE` marker nem szerepelhet más,
   ugyanazon teljes klipet jelölő vágási markerekkel együtt. A cím- és
   képmarkereket ebben a lépésben ne hozd létre.

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
