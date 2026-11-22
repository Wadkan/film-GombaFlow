---
name: 3d-resolve-review-markers
description: "A felülvizsgált review timeline aktuális markereinek kiolvasása."
---

# Resolve review markerek kiolvasása

## Saját végrehajtási sorrend

Először olvasd el a [workflow](WORKFLOW.md) „Feldolgozási lépések”,
„Közös szerződés”, „Közös visszatérési státuszok” és „Fájlos
állapotátvétel” részeit, valamint a saját skillre vonatkozó bejegyzését.
A hívási kapcsolatokat, kapukat és státuszfeltételeket ezekből alkalmazd.

1. Ellenőrizd a bemeneteket és a Resolve-azonosítókat.
2. Olvasd ki az aktuális markereket, és ellenőrzés után mentsd a pillanatképet.

## Bemenet

Olvasd be a kiválasztott script mappájából a `recording_index.json`,
`review_timeline_assembly.json` és `review_timeline_resolve_media_registry.json`
fájlokat. Ellenőrizd a `topic_id`-t, a script- és indexlenyomatokat, valamint
a projekt- és timeline-azonosítók egyezését. Az assembly 1.1 vagy korábbi
1.0 sémájú lehet; más verziónál állj meg. Hibás vagy hiányzó kötelező
bemenetnél jelezd az akadályt.

A felhasználói review után minden Rough Cut-összeállításhoz olvasd ki újra a
Resolve aktuális markereit, meglévő pillanatkép esetén is. Ellenőrizd a nyitott
Resolve-projekt és a review timeline egyedi azonosítóját. A korábbi fájlt ne
tekintsd az aktuális markerállapot bizonyítékának.

Meglévő pillanatképnél ellenőrizd annak sémáját, téma-, projekt- és
timeline-azonosságát is. A `missing_parts` listáját és a benne mentett
döntéseket őrizd meg az új kiolvasás mentésekor; a klipeket és markereket
mindig az aktuális Resolve-állapotból olvasd. Sérült vagy eltérő kontextusú
korábbi fájlt ne írj felül.

## Kiolvasás

1. A Resolve-ból olvasd ki az első review timeline aktuális kezdőképkockáját,
   képkockasebességét, timeline-szintű markereit és az összes video- és
   hangsáv klippéldányait. A timeline és minden klippéldány `GetMarkers()`
   eredményét külön őrizd meg; ne a korábbi tervből következtess a markerekre.
2. Minden klippéldánynál olvasd ki a timeline-klip és Media Pool-klip
   azonosítóját, sávját, timeline- és forráshatárait, kapcsolt klipjeit és markereit.
   A `review_timeline_assembly.json` `clips` listája az 1.1 sémában fizikai
   forrásklippeket, a `recordings` lista logikai indexrekordokat tartalmaz.
   Egy fizikai kliphez több logikai rekord tartozhat; mindet rendeld hozzá a
   közös `timeline_clip_id` és a forrástartomány alapján. Az 1.0 sémájú régi
   assemblynél az egyes `clips` elemek adják a közvetlen kapcsolatot. A
   kapcsolt hangot a hozzá tartozó videokliphez rendeld. Nem egyértelmű
   hozzárendelésnél ne találgass: a tényleges klipet is rögzítsd, az ismeretlen
   mezők legyenek `null`, és az eset kerüljön az `unresolved` listába.
3. A [markerindex](davinci_marker_index.md) alapján jelöld `unresolved` tétellel
   a hiányzó, hibás vagy ütköző vágási jelölést és a nem egyértelműen kliphez
   rendelhető timeline-markert. Az érintett klip maradjon kézi review-ra;
   tartalmi bizonytalanság miatt ne állj meg, és ne módosíts markert. Egy
   kapcsolt hangklipet ne jelölj bizonytalannak pusztán azért, mert azon külön
   marker nincs; a hozzá tartozó videó jelölését használd. Ha a kapcsolt
   hangon is van vágási marker, az időalapokat figyelembe véve vesd össze a
   videó döntésével. Eltérő vagy nem egyértelműen összevethető döntésnél az
   egész kép–hang egységet jelöld `unresolved` tétellel, mindkét klip
   azonosítójával és az indokkal.
   A cím- és képmarkereket is olvasd ki, de vágási döntésként ne használd.
   Az összevetésben a `KEEP OUT` és `REVIEW END` a marker alatti utolsó
   megtartott képkockát jelöli. A záróhatárt a saját marker-időalapjában a
   marker képkockájához egyet adva képezd, mielőtt másik időalapra váltasz.
   A JSON-ban továbbra is az eredeti Resolve `frame_id` szerepeljen.

Az üres markerlista érvényes kiolvasási eredmény, nem API-hiba. Ha a projekt,
timeline, klip vagy markerek technikai okból nem olvashatók ki, állj meg és
jelezd a hibát; ne add át a részleges pillanatképet kész kimenetként.

A pillanatkép `unresolved` tételeit a workflow közös hibakezelése szerint
naplózd; a bejegyzésből az érintett klip vagy marker legyen visszakereshető.

## Kimenet: `review_timeline_markers.json` — 1.1

Mentsd a kiválasztott script mappájába. A meglévő fájlt csak a teljes új
kiolvasás és ellenőrzés sikerénél cseréld le; hiba esetén ne add át a régi
pillanatképet friss eredményként. A fájl a
kiolvasáskori Resolve-állapot pillanatképe. Mezői:

- `schema_version`: `"1.1"`; `topic_id`, `resolve_project_id`,
  `review_timeline_id`, `review_timeline_name`, `timeline_start_frame` és
  `timeline_frame_rate`: a kiválasztott scripthez tartozó Resolve-adatok.
- `timeline_markers`: minden timeline-szintű marker listája.
- `clips`: minden tényleges video- és hangsávbeli klippéldány listája:
  `timeline_clip_id`, `resolve_media_pool_item_id`, `track_type`, `track_index`,
  `timeline_start_frame`, `timeline_end_frame`, `source_start_frame`,
  `source_end_frame`, `linked_timeline_clip_ids` és `markers`. A videoklip
  bejegyzése `recordings` listában tartalmazza az összes hozzá tartozó logikai
  rekordot: `recording_id`, `source_id`, `script_id`, `script_order`,
  `source_start_frame`, `source_end_frame`, `timeline_start_frame` és
  `timeline_end_frame`. Több rekord ugyanahhoz a fizikai kliphez tartozhat;
  a kapcsolt hang bejegyzését a `linked_timeline_clip_ids` alapján rendeld
  hozzá, ne készíts második logikai felvételt belőle.
- Minden `timeline_markers` és `markers` elem: a Resolve-ból visszaolvasott
  `frame_id`, `name`, `color`, `duration`, `note` és `custom_data`. A `frame_id`
  eredeti értékét és a marker hatókörét őrizd meg; ne keverd össze a timeline-
  és klipmarkerek időalapját.
- `unresolved`: az érintett klip- vagy markerazonosítás és a konkrét bizonytalanság;
  ha nincs ilyen, üres lista.
- `missing_parts`: a review utáni lefedettség-ellenőrzés hiányai és döntései;
  korábbi fájlban a hiányzó mező üres listának számít. Elemenként stabil,
  újra nem kiosztható `issue_id` (`R1`, `R2`, …), `script_id`, a script
  érintett részének pontos `script_text` szövege, `status`
  (`awaiting_decision`, `omitted`, `awaiting_recording` vagy `resolved`),
  valamint `decision` (a user döntése és a `problems.md` tételére
  hivatkozás, döntés hiányában `null`). Ez nem a kiolvasott markerállapot
  része; frissítésének szabálya a workflow-ban kijelölt lefedettségi ellenőrzés.

A klip- és markerlistákat stabilan, sáv és képkocka szerint rendezd. Mentés
után olvasd vissza a teljes JSON-t és ellenőrizd. A 3e a mentett pillanatképet
használja; a mentés utáni Resolve-módosítások nem kerülnek automatikusan bele.

Ez a lépés nem hoz létre és nem módosít timeline-t, klipet vagy markert.
