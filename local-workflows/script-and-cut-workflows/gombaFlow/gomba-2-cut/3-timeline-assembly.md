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

1. A `prepare` fázisban ellenőrizd a tervet és a bemeneteket, majd válaszd ki
   és mentsd a Resolve-projektet.
2. A `verify` fázisban olvasd vissza és ellenőrizd az elkészült eredményt.

A fázisok közé illesztett belső hívásokat és a teljes hívás készfeltételét a
workflow saját bejegyzése és receptje határozza meg. Fázis megadása nélkül
a teljes receptet alkalmazd, közvetlen indításnál is. Egy `prepare` fázis
sikere még nem jelenti a review timeline elkészültét.

## `prepare` fázis

## Cél és bemenet

Ellenőrzött, végrehajtható vágási tervből dolgozz.
Olvasd be a scriptmappa `cut_workflow_state.json` fájlját, és ellenőrizd
a scriptválasztást a workflow szerint.

A `recording_index.json` és az abban hivatkozott, elfogadott `3-script.md`
alapján készülő teljes recept eredménye a script egyetlen céljához tartozó
review timeline. Az eredeti videókat és átiratokat ne módosítsd.
Ezen a timeline-on minden azonosított felvételváltozat megmarad;
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

## `verify` fázis

A mentett `review_timeline_assembly.json` és a tényleges Resolve-timeline
visszaolvasásával ellenőrizd az alábbi szabályokat. Ehhez már teljes,
`completed` állapotú assembly szükséges, az aktuális script- és
jegyzéklenyomatokkal, valamint a mentett projektválasztással egyező projektben.
Ne importálj médiát, ne helyezz el klipet vagy markert, és ne írj át korábbi
elhelyezési adatot. Eltérésnél jelezd és naplózd a konkrét akadályt; ne javítsd
automatikusan a timeline-t, és ne jelentsd késznek a teljes hívást.

Pótfelvételi hozzáfűzés után a `last_append_recording_ids` listában mentett
új rekordok tényleges elhelyezését, sávjait, hangkapcsolatait és markereit
ellenőrizd. A régi assembly-bejegyzések történeti kapcsolatok: a user által
azóta törölt, áthelyezett vagy átmarkerezett régi klip nem hozzáfűzési hiba.
A teljes jegyzék és az assembly közötti rekordkapcsolatot továbbra is
ellenőrizd, de a korábbi klip visszaállítását vagy újramarkerezését ne követeld.
Új timeline-nál az összes elhelyezést ellenőrizd. A listát kizárólag a kész
assemblyből olvasd, ne az orchestrator memóriájából vedd át.

### Ellenőrzendő elhelyezés

1. A felvételek és markerek feleljenek meg a review timeline elhelyezési
   szerződésének. A felvételek rögzítési sorrendet kövessenek, ne script-sorrendet.
2. A média eredeti képe és meglévő hangja szinkronban, egymáshoz kapcsolva
   legyen elhelyezve. A részek egymás után következzenek, kitalált átfedés,
   áttűnés vagy önálló új narráció nélkül.
3. A teljes felvételek forrástartományai az azonosítóbemondásokat is
   tartalmazzák. Több B-roll-ID egy fájlban külön klipként szerepeljen.
4. A B-roll képe és meglévő hangja a talking headtől külön video-, illetve
   hangsávon, egymással szinkronban legyen. Az eredeti hang maradjon
   változatlan, korábbi `audio_enabled: false` érték esetén is. Hang nélküli
   forráshoz ne tartozzon mesterséges hang. Olvasd vissza a sávokat és hangállapotot.
5. A megjelenített klipnév: `S{script_id} · {recording_id} · {clip_type} · {description}`.
   Az értékek a jegyzékből származzanak; a vágási markerek legyenek visszaellenőrzöttek.
6. A forrásmásodpercek megfelelő időalapú képkockahatárokra legyenek átszámítva.
   A tényleges forrás- és timeline-határokat olvasd vissza, és vesd össze
   a mentett elhelyezésekkel. Ellenőrizd, hogy a képkockás
   határillesztés nem vág le megtartandó beszédet vagy B-roll-képet.

### Kimeneti szerződés: `review_timeline_assembly.json` — 1.0

A jegyzék mappájába mentett elhelyezéseket ellenőrizd. A bemeneti jegyzék
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
- `last_append_recording_ids`: opcionális; az utolsó pótfelvételi menetben
  hozzáfűzött új rekordok egyedi ID-listája. Hozzáfűzésnél kötelező, új rekord
  nélküli menetnél üres lista. Új timeline-nál `null`; korábbi fájlban a hiányzó
  mezőt `null` értékként kezeld. Ez az ellenőrzés hatóköre, nem újrafuttatási engedély.

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

Minden jegyzékbeli azonosított felvételhez legyen mentett elhelyezési kapcsolat. Az elhelyezett
részek sorrendjét, forrástartományait, nevét és hangállapotát a timeline
visszaolvasásával ellenőrizd; pótfelvételi hozzáfűzéskor a 3c erre vonatkozó
szabálya szerinti új elhelyezéseket ellenőrizd. Eszközhiba esetén az addig létrejött klipeket is
rögzítsd `incomplete` kimenetben; ne jelents sikert, és ne indíts automatikus
újrapróbálkozást, amely megduplázhatná őket.

### Felhasználói eredmény

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
