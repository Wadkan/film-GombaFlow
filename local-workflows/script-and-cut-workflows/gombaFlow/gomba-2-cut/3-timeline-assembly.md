---
name: 3-timeline-assembly
description: "Az ellenőrzött vágási terv alapján a felvételek elhelyezése a Resolve cél-timeline-ján és a review timeline összeállítása."
---

# 3. Timeline összeállítása

## Saját végrehajtási sorrend

Először olvasd el a [workflow](WORKFLOW.md) „Feldolgozási lépések”,
„Közös szerződés”, „Közös visszatérési státuszok” és „Fájlos
állapotátvétel” részeit, valamint a saját skillre vonatkozó bejegyzését.
A hívási kapcsolatokat, kapukat és státuszfeltételeket ezekből alkalmazd.

1. Ellenőrizd a tervet és a bemeneteket.
2. Válaszd ki a Resolve-projektet, majd ellenőrizd az elkészült review timeline-t.

## Cél és bemenet

Ellenőrzött, végrehajtható vágási tervből dolgozz.
Olvasd be a scriptmappa `cut_workflow_state.json` fájlját, és ellenőrizd
a scriptválasztást a workflow szerint.

A [jegyzékkészítés](2-recording-index.md) `recording_index.json` kimenete és az
abban hivatkozott, elfogadott `3-script.md` alapján ténylegesen helyezd el a
felvett részeket a script egyetlen cél-timeline-ján. Az eredeti videókat és átiratokat
ne módosítsd. Ebben a lépésben minden azonosított felvételváltozat megmarad;
az ismétlésekre javasolt megtartási tartományokat a terv rögzíti; a végleges
megtartást a review timeline markerei adják, amelyekből a 3e lépés építi a
Rough Cut timeline-t.

Alkalmazd a scriptből hivatkozott
[vágói szerződést](../gomba-1-script-writer/templates/3-script-template.md) és
[parancsszótárat](../gomba-1-script-writer/RECORDING_COMMANDS.md).
A varázsszót az adott scriptben tárolt értékkel kezeld.

## Timeline-nevek

A `topic_id` a kiválasztott `recording_index.json` témaazonosítója. A scriptben
megadott közös cél-timeline a forgatókönyvhöz tartozó logikai cél; a Resolve-ban
az ehhez tartozó munkaváltozatok neve:

- `<topic_id> - 1. Full Takes - Marker Review`: az első, felülvizsgálati timeline.
- `<topic_id> - 2. Rough Cut`: a későbbi, markerek alapján összeállított vágat.

## Végrehajtás előtti ellenőrzések

Mielőtt Resolve-projektet nyitnál vagy hoznál létre, ellenőrizd, hogy a `retake_plan.json`
`1.1` sémájú, `ready_for_execution` állapotú, `coverage_checked` értéke `true`,
és a benne lévő script/index hash-ek egyeznek. Korábbi vagy hiányellenőrzés
nélküli tervet ne fogadj el; azt az aktuális tervlépésben kell újra elkészíteni.
Ellenőrizd a scriptet, indexet, forrásokat és tartományokat is; bármely hibánál
állj meg Resolve-művelet nélkül.

- A jegyzék sémája `1.0`, a script tartalomlenyomata és részenkénti adatai
  megegyeznek az aktuálisan olvasott scripttel. Az ID-k és a felvételazonosítók
  érvényesek és egyediek a saját tartományukban.
- A script és a jegyzék minden része ugyanarra, a script fejlécében megadott
  egyetlen cél-timeline-ra mutat. Eltérésnél állj meg konkrét hibával.
- A források léteznek, tartalomazonosítójuk változatlan; minden megtartandó
  tartomány nem üres és a forrás időtartamán belül van.
- A jegyzékben ne maradjon `needs_review` rekord. Ilyenkor a 2. lépésben kell
  tisztázni a hozzárendelést, és utána újraindítani ezt a lépést; a bizonytalan
  felvételt ne minősítsd hiányzónak és ne hagyd el csendben.

Miután az összes fájl- és tervellenőrzés sikeres, olvasd ki a Resolve
projektlistáját, és keresd meg a kiválasztott `topic_id` nevű projektet.
Ha a `cut_workflow_state.json` már tartalmaz projektválasztást, annak nevét és
azonosítóját ellenőrizd a Resolve-ban, és ugyanazt használd; ne kérj új választást.
Az alábbi választás csak még nem rögzített projektnél szükséges.

- Ha létezik pontos névegyezés, csak ezt az egy projektet ajánld fel
  alapértelmezett választásként; a többi projektet ne listázd.
- Ha nincs ilyen projekt, listázd a meglévő Resolve-projekteket, és ajánld fel
  alapértelmezettként egy új projekt létrehozását pontosan a `topic_id` névvel.
  A felhasználó listából választhasson meglévőt, vagy fogadja el az új név
  javaslatát; szabad szöveges projektnevet ne kérj.

Nyisd meg vagy hozd létre a választott projektet, és olvasd ki a Resolve-ból
az egyedi projektazonosítóját és látható nevét. Natívan mentsd; `.drp`
exportot ne készíts. Az azonosítót és nevet még médiaimport előtt mentsd a
`cut_workflow_state.json` fájl `resolve_project` mezőjébe, és olvasd vissza.
A végső `review_timeline_assembly.json` ugyanezt a projektet azonosítsa.

- A cél-vágóprojekt egyértelmű, a médiakezeléshez és timeline-műveletekhez
  rendelkezésre áll működő kapcsolat. A használt eszköz aktuális API-leírásából
  ellenőrizd a médiaimportot, forrástartományt, klipelhelyezést, klipnevet,
  hang engedélyezését és a visszaolvasható klippéldány-azonosítót.
- Az első timeline fenti neve használható. Meglévő, nem üres cél-timeline
  vagy korábbi `review_timeline_assembly.json` esetén állj meg újrafuttatási döntésre;
  kivétel a workflow szerint engedélyezett pótfelvételi hozzáfűzés.
  Ne törölj felhasználói vágást és ne duplikáld automatikusan a tartalmat.

Elérhetetlen eszköznél vagy hibás bemenetnél konkrét akadályt jelezz. JSON vagy
vágási terv elkészítése önmagában nem jelenti a timeline összeállítását.

Az alábbi elhelyezési és kimeneti szabályok a review timeline-ra vonatkoznak;
a felvételeket ne helyezd el még egyszer külön menetben.

## Elhelyezés

1. Az első timeline felvételeinek elhelyezését és a markerezést a
   [Resolve review timeline](3c-resolve-review-timeline.md) szerint végezd.
   A felvételek rögzítési sorrendet követnek, nem script-sorrendet.
2. A média eredeti video- és hangsávját őrizd meg. A képet és a hozzá tartozó
   hangot szinkronban helyezd el, egymáshoz kapcsolva. A részek ebben a menetben
   egymás után kerülnek; átfedést, áttűnést vagy önálló új narrációt ne találj ki.
3. A teljes felvételek forrástartományát a review timeline lépése határozza meg,
   az azonosítóbemondásokkal együtt. Több B-roll-ID egy fájlban külön klip legyen.
4. A B-roll képét és meglévő hangját a talking headtől külön video-, illetve
   hangsávon, egymással szinkronban helyezd el. Az eredeti hangot hagyd
   változatlanul; korábbi B-roll rekord `audio_enabled: false` értéke alapján
   se némíts. Hang nélküli forráshoz ne hozz létre mesterséges hangot. A
   tényleges sávokat és hangállapotot olvasd vissza.
5. A megjelenített klipnév: `S{script_id} · {recording_id} · {clip_type} · {description}`.
   Az értékek a jegyzékből származnak. A markereket a review timeline lépése szerint kezeld.
6. A forrásmásodperceket a vágóprogram által megkövetelt időalapra alakítsd;
   ne kezeld a másodpercértéket képkockaszámként. A tényleges forrás- és
   timeline-határokat olvasd vissza és mentsd el. Ellenőrizd, hogy a képkockás
   határillesztés nem vág le megtartandó beszédet vagy B-roll-képet.

## Kimenet: `review_timeline_assembly.json` — 1.0

A jegyzék mappájába mentsd a létrejött elhelyezéseket. A bemeneti jegyzék
változatlan marad; ez a kimenet adja hozzá a tényleges timeline-kapcsolatokat.

A gyökér mezői:

- `schema_version`: `"1.0"`.
- `recording_index_path`, `recording_index_sha256`, `script_sha256`: a felhasznált
  bemenetek visszakereshető referenciái.
- `resolve_project_id`, `resolve_project_name`: a használt Resolve-projektből
  visszaolvasott egyedi azonosító és látható név.
- `status`: `completed` vagy `incomplete`.
- `timelines`: a script egyetlen cél-timeline-ját tartalmazó lista;
  az elem `timeline_id`, `timeline_name`, `frame_rate` és `start_frame` mezői
  a vágóprogramból visszaolvasva.
- `clips`: minden ténylegesen elhelyezett klippéldány kapcsolata.
- `missing_parts`: a script azon részei, amelyekhez nincs azonosított felvétel,
  a terv `approved_omissions` listája szerinti jóváhagyott kihagyások nélkül;
  elemenként `script_id`, `chapter_id`, `timeline`, `description`.
- `error`: végrehajtási hiba vagy `null`.

Minden `clips` bejegyzés:

- `recording_id`, `source_id`, `source_path`, `script_id`, `script_order`:
  az eredeti jegyzékhez vezető kapcsolat.
- `timeline_id`, `timeline_clip_id`, `video_track`, `audio_tracks`:
  tényleges vágóprogrambeli azonosítók és sávok. Hang nélküli forrásnál
  az `audio_tracks` üres lista.
- `clip_name`, `clip_type`, `audio_enabled`: alkalmazott és visszaolvasott értékek.
- `source_start`, `source_end`: a tényleges megtartott forrásrész másodpercben.
- `timeline_start_frame`, `timeline_end_frame`: tényleges timeline-képkockák,
  félig nyílt tartományként, az adott timeline időalapjában.
- `take_order_basis`: `source_time`, `verified_recording_order` vagy
  `file_creation_date`. A sorrendet alátámasztó adatot a `take_order_evidence`
  mezőben rögzítsd.

Minden jegyzékbeli azonosított felvételhez legyen elhelyezés. Az elhelyezett
részek sorrendjét, forrástartományait, nevét és hangállapotát a timeline
visszaolvasásával ellenőrizd; pótfelvételi hozzáfűzéskor a 3c erre vonatkozó
szabálya szerinti új elhelyezéseket ellenőrizd. Eszközhiba esetén az addig létrejött klipeket is
rögzítsd `incomplete` kimenetben; ne jelents sikert, és ne indíts automatikus
újrapróbálkozást, amely megduplázhatná őket.

## Felhasználói eredmény

Váratlan, a tervben nem jóváhagyott hiánynál a közös problémánapló szerint a
script saját `problems.md` fájljába írd az érintett részeket, és a felhasználónak
csak a napló útvonalát és az akadályt jelezd; a hiányzó részeket ne listázd a
chatben. Ilyenkor a kimenet `incomplete`, és a tervet újra kell ellenőrizni.
Ha nincs ilyen hiány, röviden jelezd, hogy az összeállítás kész. A jóváhagyott
kihagyásokat ne jelentsd újra hiányként. Végrehajtási akadályt hibaként jelezz,
ne hiányzó felvételként.

A `review_timeline_assembly.json` a visszaellenőrzött timeline-kapcsolatokat
tartalmazza. A felhasználónak nem kell vágásnaplót készítenie.
A későbbi, nem dokumentált kézi vágások automatikus egyeztetése nem része
ennek a lépésnek.
