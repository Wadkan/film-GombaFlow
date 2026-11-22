---
name: 3e-resolve-rough-cut-timeline
description: "A felülvizsgált markerek szerinti Rough Cut timeline összeállítása."
---

# 3e. Resolve Rough Cut összeállítása

## Saját végrehajtási sorrend

Először olvasd el a [workflow](WORKFLOW.md) „Feldolgozási lépések”,
„Közös szerződés”, „Közös visszatérési státuszok” és „Fájlos
állapotátvétel” részeit, valamint a saját skillre vonatkozó bejegyzését.
A hívási kapcsolatokat, kapukat és státuszfeltételeket ezekből alkalmazd.

1. A `prepare` fázisban ellenőrizd a pillanatkép előtti bemeneteket és a review timeline-t.
2. A `build` fázisban a friss markerpillanatképen ellenőrizd a script-részek lefedettségét,
   és rögzítsd az esetleges hiányokat és döntéseket.
3. A markerpillanatkép alapján készítsd el, ellenőrizd és mentsd a Rough Cutot.

A fázisok közötti előkészítő hívást a workflow saját bejegyzése és receptje
határozza meg. Fázis megadása nélkül a teljes receptet alkalmazd, közvetlen
indításnál is. A `prepare` még nem követel markerpillanatképet és nem épít;
a `build` csak a recept aktuális, sikeres kiolvasása után kezdődhet.

## `prepare` fázis

## Külön indítás és bemenetellenőrzés

Olvasd be a `retake_plan.json` tervet, a hivatkozott
scriptet és `recording_index.json` jegyzéket, valamint a `review_timeline_assembly.json`
és `review_timeline_resolve_media_registry.json` fájlokat. Ellenőrizd a fájlok lenyomatait,
témaazonosságát és a forrás–Media Pool–timeline-klip kapcsolatokat. A terv az
eredeti javaslat; a megtartásról a mentett markerpillanatkép dönt.

Ha a terv nem `1.1` sémájú, a hiányellenőrzés nem teljes, nem
`ready_for_execution`, valamelyik kötelező bemenet hiányzik, vagy a terv
forrásrésze nem található az assembly `recordings` leképezéseiben és az ahhoz
hivatkozott teljes fizikai klipben, ne építs timeline-t; jelezd a konkrét
eltérést. Az 1.0 assemblynél a régi `clips` rekordot használd mindkét
kapcsolatra. A Resolve-projektet a `review_timeline_assembly.json`
`resolve_project_name` értéke alapján nyisd meg, majd ellenőrizd a visszaolvasott
projektazonosítót az ott tárolt `resolve_project_id` értékkel. Eltérésnél ne
építs timeline-t. A `review_timeline_assembly.json` azonosítójával ellenőrizd az első
review timeline-t.
Az első timeline-t az összeállítás során nem módosíthatod. Meglévő nem üres
Rough Cut timeline vagy eredményfájl esetén ne írj felül és ne duplikálj;
állj meg és jelezd.

## `build` fázis — timeline-műveletek és visszaellenőrzés

Friss végrehajtási kontextusban is olvasd be a kötelező bemeneteket, és
ismét ellenőrizd a `prepare` fázis fájl-, projekt-, timeline- és újrafuttatási
feltételeit. A korábbi fázis sikere nem helyettesíti az aktuális ellenőrzést.
Ez nem indít újabb markerkiolvasást és nem változtat projektválasztást.

A `review_timeline_markers.json` a review timeline aktuális, minden összeállítás
előtt újra kiolvasott markerpillanatképe. A visszaolvasott
fájlból dolgozz, újabb Resolve-markerkiolvasás nélkül.
Üres markerlista tartalmi bizonytalanság; API-olvasási hiba esetén állj meg.

### Review utáni lefedettség

A Rough Cut létrehozása előtt a jegyzék `script_parts` listáján végighaladva
ellenőrizd, hogy a friss pillanatkép klipjének `recordings` leképezése
tartalmaz-e minden szükséges script-részhez legalább egy, egyértelműen
hozzárendelt `recording_id`-t és érvényes forrástartományt. A teljes fizikai
forrásklip puszta jelenléte nem bizonyítja az összes script-rész lefedettségét.
A tervben már jóváhagyott teljes script-rész-kihagyást ne jelentsd új hiánynak;
részleges kihagyás nem mentesíti a teljes részt. Egy teljes forrásklip
érvényes `OMIT TAKE` markere vágási döntés, nem hiányzó klip. Hiányzó vagy
hibás markerből se következtess kliphiányra. Ha egy azonosítatlan logikai
rekord vagy fizikai klip hozzátartozhat a részhez, kezeld bizonytalanságként a
meglévő megőrzési szabályok szerint.

Az összes igazolt kliphiányt a pillanatkép `missing_parts` listájában
rögzítsd a markerpillanatkép sémája szerint, és a közös hibakezelés alapján
naplózd. Új, döntés nélküli hiánynál a státusz `awaiting_decision`.
A pontos szöveg talking headnél a script narrációja, képi résznél a
`screen-action`; a naplóban a review timeline neve is szerepeljen.
Azonos esethez a korábbi azonosítót és döntést használd. Más script-részre
vagy megváltozott scriptbeli szövegre korábbi döntést ne alkalmazz.

A user kihagyási döntése `omitted`, az újrafelvételi döntés
`awaiting_recording` állapotot jelent; a döntést a pillanatképben és a
problémanaplóban rögzítsd. Az eredeti vágási tervet ne módosítsd.
Az ellenőrzés és a döntések mentése után olvasd vissza a pillanatképet.
Újraindításkor az aktuális klipek alapján értékeld újra a listát: a ténylegesen
pótolt rész legyen `resolved`, a továbbra is hiányzó rész korábbi döntése
maradjon meg. Újra eltűnt résznél érvényes kihagyási döntés nélkül ismét
`awaiting_decision` vagy a korábbi újrafelvételi döntés alapján
`awaiting_recording` legyen az állapot. Pusztán az eredeti forrásfájl megléte
nem igazolja a pótlást.

### Markerek értelmezése

A pillanatkép `unresolved` tételeinél a 3d-ben érintettként megjelölt klipeket
tartsd meg kézi review-ra.
A [markerindex](davinci_marker_index.md) szerinti név és szín együtt számít:

- Piros `KEEP IN` / `KEEP OUT` pár: a hozzá rendelt logikai
  `recording_id` tartományból mindkét marker alatti képkocka és a köztük lévő
  rész megmarad; több érvényes pár több megtartandó részt jelent.
- Sárga `OMIT TAKE`: csak akkor hagyd ki a teljes fizikai klipet, ha egyetlen
  ilyen marker a teljes kliphosszt lefedi, nincs vele ütköző jelölés, és a
  terv az egész fizikai forrás kihagyását igazolja. Részleges logikai rekord
  kihagyását a terv `approved_omissions` adata alapján kezeld: csak az érintett
  logikai rekordot hagyd ki, az egész fizikai klipet ne.
- Sárga `REVIEW START` / `REVIEW END` pár: a hozzá rendelt logikai
  `recording_id` forrástartományát teljesen tartsd meg kézi vágáshoz.
- Hiányzó, hibás, pár nélküli vagy ütköző jelölés: az érintett logikai
  tartományt tartsd meg kézi vágáshoz. Ne következtess törlésre hiányzó
  markerből.

Az assembly 1.1 sémájában a `clips` a teljes fizikai forrásklippeket, a
`recordings` pedig azok logikai forrástartományait kapcsolja össze.
Markerértelmezéskor marker megjegyzésének `recording_id`-ja, a leképezés
`timeline_clip_id`-ja és a visszaolvasott forrás-/timeline-határok együtt
határozzák meg a döntést. A review timeline fizikai klipjét soha ne vágd meg.
Az 1.0 assembly olvasásakor minden `clips` elem egyaránt fizikai klip és
logikai rekord. A 3d új kimenete `review_timeline_markers.json` 1.1 sémájú;
az 1.0 pillanatképnél a klip egyetlen logikai rekordját a régi mezők
azonosítják.

Ha a pillanatkép timeline-szintű vágási markert is tartalmaz, rendeld azt
az érintett kliphez a visszaolvasott timeline-határok alapján. Nem egyértelmű
hozzárendelésnél az összes érintett klip maradjon meg kézi review-ra. A kék
`TITLE` és pink `IMAGE OVERLAY` markereket ebben a lépésben még ne használd.

A pillanatkép videoklipjeit a kapcsolt hangklipjeikkel együtt kezeld; külön
marker nélküli kapcsolt hangból ne következtess bizonytalanságra. A videó
markerei szerinti logikai forrástartományokat a kapcsolt hangra is azonos
forráshatárral és szinkronban alkalmazd. Ha a kapcsolt hangon lévő vágási
marker eltérő vagy nem egyértelműen összevethető döntést jelent, az érintett
logikai tartományt tartsd meg, a videón jelöld sárga review markerpárral, és
rögzítsd a `problems.md` fájlban. Az assembly `recordings` elemeit
csoportosítsd `script_id` szerint, majd a `script_parts`
listán `script_order` szerint haladj. Az egyértelműen hozzá nem rendelhető
fizikai klipet se hagyd ki: teljesen tartsd meg, az első timeline szerinti
relatív sorrendben ideiglenesen a sor végére helyezve, review jelöléssel. Egy
script-részen belül a felvételeket
az első timeline-on elfoglalt sorrendben, a klipen belüli megtartási részeket
forrásidő szerint állítsd össze. A forrásfájl klip- és Media Pool-azonosítója
az assembly fizikai `clips` bejegyzéséből származzon; a script- és
`recording_id` kapcsolat az illeszkedő `recordings` bejegyzésből. Bizonytalan
sorrendnél az érintett logikai tartományok maradjanak meg, és kapjanak review
jelölést.

A mentett pillanatkép markerét először a saját klip- vagy timeline-időalapjában
értelmezd. A zárómarker az utolsó megtartott képkockán áll; ehhez egyet adva
képezd a félig nyílt `[start, end)` tartományt. Csak ezután válts a visszaolvasott
kliphatárok, a forrásklip regiszterbeli FPS-e és a timeline időalapja között.
Eltérő FPS-nél a forráskezdést lefelé, a kizáró véghatárt felfelé kerekítsd,
hogy megtartandó képkocka ne vesszen el. A félig nyílt forrástartományt a
telepített Resolve API által elvárt `startFrame` / `endFrame` formára alakítsd;
az API záróhatárának értelmezését ne feltételezd. A telepített Resolve API
`AppendClipInfo.endFrame` mezője az utolsó hozzáadott forrásképkocka, ezért a
félig nyílt `[start, end)` tartományhoz `startFrame=start`, `endFrame=end-1`
értékeket adj át. Az API `trackIndex` értéke 1-alapú, `mediaType` értéke
`1` videóhoz és `2` hanghoz.

Az eredeti, regiszterbeli Media Pool-klipeket használd újra, ne importáld a
fájlokat újra. A cél-sávokat a hozzáadás előtt ellenőrizd a
`Timeline.GetTrackCount()` eredményével. Ha a tervezett sáv nem létezik,
hozd létre `Timeline.AddTrack()` hívással, majd olvasd vissza a sávszámot;
hiányzó sávra ne hívd meg az `AppendToTimeline()`-t, mert az API a klipet
alapértelmezett sávra helyezheti. A `clip_type` alapján a talking head
V1/A1-re, a B-roll V2/A2-re kerüljön. A kép és hozzá tartozó hang azonos
`recordFrame`-mel, egymással szinkronban kerüljön be; a meglévő hangot hagyd
változatlanul.

A `recordFrame` pozíciókat egyetlen kumulatív, félig nyílt timeline-sorozatból
számítsd, ne kerekítsd egymástól függetlenül az abszolút kezdő- és végpontokat.
Az ismeretlen logikai klip a script-sorrend végére kerüljön. Az append után
olvasd vissza a tényleges `GetStart()`, `GetEnd()`, `GetDuration()` és
forráshatárokat; a következő klip célpozíciója csak a megelőző klip
visszaellenőrzött végpontjával lehet folytonos. A pozíció-, időtartam- vagy
forráshatár-eltérést ne javítsd automatikus újrapróbálással.

Ha a kép és hang külön TimelineItemként jött létre, a
`Timeline.SetClipsLinked([videoItem, audioItem], True)` metódussal kapcsold
őket össze, majd mindkét elem `GetLinkedItems()` eredményével ellenőrizd a
kétirányú kapcsolatot. A `SetClipsLinked()` a Timeline metódusa, nem a Projecté.
Marker hozzáadásakor a videó TimelineItem kliprelatív képkockaszámát használd;
a kezdő marker `0`, a záró marker `GetDuration()-1`.

A Resolve projektet a `ProjectManager.SaveProject()` hívással mentsd, és
ellenőrizd annak igaz visszatérési értékét. A `Project.Save()` nem Resolve
Scripting API metódus. A mentés és minden visszaolvasás sikere nélkül ne jelents
teljes vagy `COMPLETED_WITH_ISSUES` eredményt. Korábbi B-roll rekord
`audio_enabled: false` értéke alapján se némíts, és hang nélküli
forráshoz ne hozz létre mesterséges hangot.

Hozd létre a `<topic_id> - 2. Rough Cut` üres timeline-t, állítsd be aktuális
timeline-nak, és a Resolve-ból visszaolvasott timeline-ID-val ellenőrizd a
beállítást. Ellenőrizd és hozd létre a hiányzó cél-sávokat a fenti szabály
szerint. A script-sorrendbe rendezett megtartandó szakaszokat egyetlen
`MediaPool.AppendToTimeline()` hívással add hozzá. A klipadatok `trackIndex`
és `recordFrame` mezőivel biztosítsd a külön sávokat és a teljes timeline
script-sorrendjét. Egy tartomány képéhez és meglévő hangjához azonos
`recordFrame` tartozzon; szükség esetén külön `mediaType` videó- és
hangbejegyzést használj ugyanabban a hívásban. Ha az API külön klippéldányként
helyezte el őket, a `Timeline.SetClipsLinked()` műveletével kapcsold össze,
és olvasd vissza a kapcsolatot. A visszakapott klipek számát, sorrendjét,
tényleges sávjait, forrás- és timeline-határait olvasd vissza; ellenőrizd,
hogy a tényleges első és utolsó képkocka megfelel a markerhatároknak. Eltérés,
részleges vagy
sikertelen API-hívásnál állj meg, és ne indíts automatikus újrapróbálást.
Ha nincs megtartandó szakasz, ne hívj üres listával `AppendToTimeline()`-t;
az üres Rough Cut tényét jelezd; a kihagyások részletei a kimeneti fájlban
maradjanak, ne sorold fel őket a chatben.

Minden kézi vágáshoz teljesen megtartott egység videoklipjének elejére és végére
helyezd el a markerindex szerinti sárga `REVIEW START` / `REVIEW END` párt a
Rough Cuton, az első és utolsó megtartott képkockára. Az `OMIT TAKE` markerrel együtt
kihagyott klip és markere nem kerül a Rough Cutra. A létrehozott markereket
olvasd vissza, és ellenőrizd a nevüket, színüket és helyüket. Technikai
olvasási, létrehozási vagy visszaellenőrzési hiba esetén állj meg, mentsd a
részleges állapotot `incomplete` státusszal, és jelezd a konkrét hibát.

A bizonytalanul vágható, ezért a Rough Cut timeline-on teljesen megtartott
tartományokat rögzítsd az adott script mappájának `problems.md` fájljában a
[központi problémánapló](../PROBLEM_LOG.md) `Kézi vágást igénylő részek`
fejléce alatt. Minden bejegyzéshez add meg a script-ID-t, a bizonytalanság okát,
a forrásfájl útvonalát és forrásidő-tartományát, valamint a Rough Cut timeline
nevét és a `REVIEW START` / `REVIEW END` markerek helyét. A tartomány maradjon
bent; a naplózás nem helyettesíti a timeline-markereket.

Mentsd a Resolve-projektet a `ProjectManager.SaveProject()` metódussal, és a Rough Cuton ellenőrizd a megtartott
forrástartományokat, hangkapcsolatot, klipneveket és a végső beszédet
hallgatással is. Minden új klippéldányt kapcsolj vissza az eredeti
jegyzékrekordhoz. A második timeline létrehozása után csak azon dolgozz; a
további elhelyezések és vágások alapja a Rough Cut aktuális markerállapota.

## Kimenet: `rough_cut_timeline_cleanup.json` — 1.1

A jegyzék mappájában új fájlt készíts; meglévő eredményt ne írj felül
automatikusan. Újrafuttatás előtt egyeztesd, melyik rögzített állapotból induljon.

- `schema_version`: `"1.1"`; `status`: `completed` vagy `incomplete`.
- Bemeneti referenciák: `timeline_assembly_path`, `timeline_assembly_sha256`
  a `review_timeline_assembly.json` útvonala és lenyomata, valamint
  `recording_index_path`, `recording_index_sha256`, `script_sha256`,
  `resolve_project_id`, `resolve_project_name`.
- `retake_plan_path`, `retake_plan_sha256`: az ellenőrzött eredeti terv
  hivatkozása és tartalomlenyomata.
- `review_timeline_markers_path`, `review_timeline_markers_sha256`: a
  felhasznált markerpillanatkép útvonala és lenyomata.
- `review_timeline_id`, `rough_cut_timeline_id`: a Resolve-ból visszaolvasott
  timeline-azonosítók; a Rough Cut még nem létrejötténél az utóbbi `null`.
- `ordering`: script-ID-nként a felvételazonosítók tényleges sorrendje és a
  felhasznált sorrendi alap.
- `decisions`: a review-zott markerállapot alapján kihagyott és megtartott
  tartományok `script_id`, `recording_id`, `source_id`, forráshatár és a
  döntést alátámasztó markernevek, színek és helyek szerint.
- `final_clips`: minden tényleges Rough Cut klippéldány logikai
  `recording_id`-val és `source_id`-val, az eredeti review fizikai klip
  `review_timeline_clip_id` értékével, a tényleges Rough Cut
  `timeline_clip_id`-val, forrástartománnyal, sávokkal, hangkapcsolattal és
  visszaolvasott új timeline-pozíciókkal.
- `unresolved`: pontosítandó sorrend vagy fel nem oldott tartalmi probléma;
  elemenként script-ID, érintett felvételazonosítók és konkrét indok.
- `error`: végrehajtási hiba vagy `null`. Részleges eszközhibánál az addig
  létrejött állapot is legyen visszakereshető, `incomplete` státusszal.

A markerbizonytalanság miatt vágatlanul megtartott `unresolved` tétel
önmagában nem teszi a végrehajtást `incomplete` állapotúvá. A kézi vágás
szükségességét és a problémalista útvonalát jelezd; tényleges végrehajtási hiba esetén
a státusz `incomplete`.

A bemenetek közül csak a markerpillanatkép `missing_parts` mezője frissülhet;
a kimeneti `review_timeline_markers_sha256` a visszaolvasott, végleges fájl
lenyomata legyen. A kimenet a friss timeline-kapcsolatok hiteles
pillanatképe. A későbbi agent ezt használja a 3. lépés elavult pozíciói helyett.
A felhasználónak rövid készjelzést adj a szükséges kézi vágás és a problémalista
útvonalának jelzésével, vagy a konkrét végrehajtási hibát jelezd.
