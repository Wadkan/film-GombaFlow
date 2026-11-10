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

1. Ellenőrizd a bemeneteket és a review timeline-t.
2. A markerpillanatkép alapján készítsd el, ellenőrizd és mentsd a Rough Cutot.

## Külön indítás és bemenetellenőrzés

Olvasd be a `retake_plan.json` tervet, a hivatkozott
scriptet és `recording_index.json` jegyzéket, valamint a `review_timeline_assembly.json`
és `review_timeline_resolve_media_registry.json` fájlokat. Ellenőrizd a fájlok lenyomatait,
témaazonosságát és a forrás–Media Pool–timeline-klip kapcsolatokat. A terv az
eredeti javaslat; a megtartásról a mentett markerpillanatkép dönt.

Ha a terv nem `1.1` sémájú, a hiányellenőrzés nem teljes, nem
`ready_for_execution`, valamelyik kötelező bemenet hiányzik, vagy a
tervben hivatkozott forrásrész nem található a timeline-összeállításban, ne
építs timeline-t; jelezd a konkrét eltérést. A Resolve-projektet a `review_timeline_assembly.json`
`resolve_project_name` értéke alapján nyisd meg, majd ellenőrizd a visszaolvasott
projektazonosítót az ott tárolt `resolve_project_id` értékkel. Eltérésnél ne
építs timeline-t. A `review_timeline_assembly.json` azonosítójával ellenőrizd az első
review timeline-t.
Az első timeline-t az összeállítás során nem módosíthatod. Meglévő nem üres
Rough Cut timeline vagy eredményfájl esetén ne írj felül és ne duplikálj;
állj meg és jelezd.

## Timeline-műveletek és visszaellenőrzés

A `review_timeline_markers.json` a review timeline aktuális, minden összeállítás
előtt újra kiolvasott markerpillanatképe. A visszaolvasott
fájlból dolgozz, újabb Resolve-markerkiolvasás nélkül.
Üres markerlista tartalmi bizonytalanság; API-olvasási hiba esetén állj meg.
A pillanatkép `unresolved` tételeinél a 3d-ben érintettként megjelölt klipeket
tartsd meg kézi review-ra.
A [markerindex](davinci_marker_index.md) szerinti név és szín együtt számít:

- Piros `KEEP IN` / `KEEP OUT` pár: mindkét marker alatti képkocka és a köztük
  lévő rész megmarad; több érvényes pár több megtartandó részt jelent.
- Sárga `OMIT TAKE`: csak akkor hagyd ki a teljes klipet, ha egyetlen ilyen
  marker a teljes kliphosszt lefedi, és nincs vele ütköző vágási jelölés.
- Sárga `REVIEW START` / `REVIEW END` pár: a bizonytalan klipet teljesen
  tartsd meg kézi vágáshoz.
- Hiányzó, hibás, pár nélküli vagy ütköző jelölés: az érintett klipet teljesen
  tartsd meg kézi vágáshoz. Ne következtess törlésre hiányzó markerből.

Ha a pillanatkép timeline-szintű vágási markert is tartalmaz, rendeld azt
az érintett kliphez a visszaolvasott timeline-határok alapján. Nem egyértelmű
hozzárendelésnél az összes érintett klip maradjon meg kézi review-ra. A kék
`TITLE` és pink `IMAGE OVERLAY` markereket ebben a lépésben még ne használd.

A pillanatkép videoklipjeit a kapcsolt hangklipjeikkel együtt, egy-egy
felvételként kezeld; külön marker nélküli kapcsolt hangból ne következtess
bizonytalanságra. A videó markerei szerinti megtartási tartományokat a
kapcsolt hangra is azonos forrástartománnyal és szinkronban alkalmazd; érvényes
`OMIT TAKE` a videót és minden kapcsolt hangját együtt hagyja ki. Ha a
kapcsolt hangon lévő vágási marker eltérő vagy nem egyértelműen összevethető
döntést jelent, az egész kép–hang egységet tartsd meg, a videón jelöld sárga
review markerpárral, és rögzítsd a `problems.md` fájlban. A `recordings` elemeket
csoportosítsd `script_id` szerint, majd a `script_parts`
listán `script_order` szerint haladj. Az egyértelműen hozzá nem rendelhető
klipet se hagyd ki: teljesen tartsd meg, az első timeline szerinti relatív
sorrendben ideiglenesen a sor végére helyezve, review jelöléssel. Egy
script-részen belül a felvételeket
az első timeline-on elfoglalt sorrendben, a klipen belüli megtartási részeket
forrásidő szerint állítsd össze. Bizonytalan sorrendnél a teljes érintett
felvételek maradjanak meg, és kapjanak review jelölést.

A mentett pillanatkép markerét először a saját klip- vagy timeline-időalapjában
értelmezd. A zárómarker az utolsó megtartott képkockán áll; ehhez egyet adva
képezd a félig nyílt `[start, end)` tartományt. Csak ezután válts a visszaolvasott
kliphatárok, a forrásklip regiszterbeli FPS-e és a timeline időalapja között.
Eltérő FPS-nél a forráskezdést lefelé, a kizáró véghatárt felfelé kerekítsd,
hogy megtartandó képkocka ne vesszen el. A félig nyílt forrástartományt a
telepített Resolve API által elvárt `startFrame` / `endFrame` formára alakítsd;
az API záróhatárának értelmezését ne feltételezd. Az eredeti, regiszterbeli Media Pool-klipeket
használd újra, ne importáld a fájlokat újra. A kép és hozzá tartozó hang
maradjon szinkronban. A B-roll képe és meglévő hangja a talking headtől külön
video-, illetve hangsávra kerüljön; a hangot hagyd változatlanul. Korábbi
B-roll rekord `audio_enabled: false` értéke alapján se némíts, és hang nélküli
forráshoz ne hozz létre mesterséges hangot.

Hozd létre a `<topic_id> - 2. Rough Cut` üres timeline-t, állítsd be aktuális
timeline-nak, és a Resolve-ból visszaolvasott timeline-ID-val ellenőrizd a
beállítást. A script-sorrendbe rendezett megtartandó szakaszokat egyetlen
`MediaPool.AppendToTimeline()` hívással add hozzá. A klipadatok `trackIndex`
és `recordFrame` mezőivel biztosítsd a külön sávokat és a teljes timeline
script-sorrendjét. Egy tartomány képéhez és meglévő hangjához azonos
`recordFrame` tartozzon; szükség esetén külön `mediaType` videó- és
hangbejegyzést használj ugyanabban a hívásban. Ha az API külön klippéldányként
helyezte el őket, a Rough Cut `SetClipsLinked()` műveletével kapcsold össze,
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

Mentsd a Resolve-projektet, és a Rough Cuton ellenőrizd a megtartott
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
- `final_clips`: minden tényleges Rough Cut klippéldány a 3. lépés `clips`
  mezőivel, a visszaolvasott új timeline-pozíciókkal és a forráskapcsolattal.
- `unresolved`: pontosítandó sorrend vagy fel nem oldott tartalmi probléma;
  elemenként script-ID, érintett felvételazonosítók és konkrét indok.
- `error`: végrehajtási hiba vagy `null`. Részleges eszközhibánál az addig
  létrejött állapot is legyen visszakereshető, `incomplete` státusszal.

A markerbizonytalanság miatt vágatlanul megtartott `unresolved` tétel
önmagában nem teszi a végrehajtást `incomplete` állapotúvá. A kézi vágás
szükségességét és a problémalista útvonalát jelezd; tényleges végrehajtási hiba esetén
a státusz `incomplete`.

A bemenetek változatlanok; a kimenet a friss timeline-kapcsolatok hiteles
pillanatképe. A későbbi agent ezt használja a 3. lépés elavult pozíciói helyett.
A felhasználónak rövid készjelzést adj a szükséges kézi vágás és a problémalista
útvonalának jelzésével, vagy a konkrét végrehajtási hibát jelezd.
