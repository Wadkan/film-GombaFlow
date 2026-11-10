---
name: 3d-resolve-review-markers
description: "A felülvizsgált review timeline aktuális markereinek kiolvasása."
---

# Resolve review markerek kiolvasása

## Bemenet

Olvasd be a kiválasztott script mappájából a `recording_index.json`,
`review_timeline_assembly.json` és `review_timeline_resolve_media_registry.json`
fájlokat. Ellenőrizd a `topic_id`-t, a script- és indexlenyomatokat, valamint
a projekt- és timeline-azonosítók egyezését. Hibás vagy hiányzó kötelező
bemenetnél állj meg és jelezd az akadályt.

A felhasználói review után minden Rough Cut-összeállításhoz olvasd ki újra a
Resolve aktuális markereit, meglévő pillanatkép esetén is. Ellenőrizd a nyitott
Resolve-projekt és a review timeline egyedi azonosítóját. A korábbi fájlt ne
tekintsd az aktuális markerállapot bizonyítékának.

## Kiolvasás

1. A Resolve-ból olvasd ki az első review timeline aktuális kezdőképkockáját,
   képkockasebességét, timeline-szintű markereit és az összes video- és
   hangsáv klippéldányait. A timeline és minden klippéldány `GetMarkers()`
   eredményét külön őrizd meg; ne a korábbi tervből következtess a markerekre.
2. Minden klippéldánynál olvasd ki a timeline-klip és Media Pool-klip
   azonosítóját, sávját, timeline- és forráshatárait, kapcsolt klipjeit és markereit.
   A `review_timeline_assembly.json` és a jegyzék alapján rendeld hozzá a
   `recording_id`, `source_id` és `script_id` értékeket. A kapcsolt hangot a
   hozzá tartozó videokliphez rendeld. Nem egyértelmű
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

## Kimenet: `review_timeline_markers.json` — 1.0

Mentsd a kiválasztott script mappájába. A meglévő fájlt csak a teljes új
kiolvasás és ellenőrzés sikerénél cseréld le; hiba esetén ne add át a régi
pillanatképet friss eredményként. A fájl a
kiolvasáskori Resolve-állapot pillanatképe. Mezői:

- `schema_version`: `"1.0"`; `topic_id`, `resolve_project_id`,
  `review_timeline_id`, `review_timeline_name`, `timeline_start_frame` és
  `timeline_frame_rate`: a kiválasztott scripthez tartozó Resolve-adatok.
- `timeline_markers`: minden timeline-szintű marker listája.
- `clips`: minden tényleges video- és hangsávbeli klippéldány listája:
  `timeline_clip_id`, `resolve_media_pool_item_id`, `track_type`, `track_index`,
  `timeline_start_frame`, `timeline_end_frame`, `source_start_frame`,
  `source_end_frame`, `recording_id`, `source_id`, `script_id`,
  `linked_timeline_clip_ids` és `markers`.
- Minden `timeline_markers` és `markers` elem: a Resolve-ból visszaolvasott
  `frame_id`, `name`, `color`, `duration`, `note` és `custom_data`. A `frame_id`
  eredeti értékét és a marker hatókörét őrizd meg; ne keverd össze a timeline-
  és klipmarkerek időalapját.
- `unresolved`: az érintett klip- vagy markerazonosítás és a konkrét bizonytalanság;
  ha nincs ilyen, üres lista.

A klip- és markerlistákat stabilan, sáv és képkocka szerint rendezd. Mentés
után olvasd vissza a teljes JSON-t és ellenőrizd. A 3e a mentett pillanatképet
használja; a mentés utáni Resolve-módosítások nem kerülnek automatikusan bele.

Ez a lépés nem hoz létre és nem módosít timeline-t, klipet vagy markert, és nem
indítja el a Rough Cut összeállítását. A fájl útvonalát add át a hívónak.
