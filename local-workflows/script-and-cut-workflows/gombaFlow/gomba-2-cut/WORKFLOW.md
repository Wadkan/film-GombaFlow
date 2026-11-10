# Gomba 2 — vágás

## Cél

A saját felvételek azonosítása az elfogadott `3-script.md` alapján, majd
script szerinti timeline összeállítása és az ismétlések kivágása.

## Feldolgozási lépések

1. [Felvételek átírása](1-transcription.md): videómappa bekérése, rekurzív
   Faster-Whisper feldolgozás a [scripttel](scripts/transcribe_recordings.py).
   Kimenet: videónként szóidőbélyeges átirat és `master_transcript.json`;
   szükség esetén felhasználói leírások a `recording_assignments.json` fájlban.
2. [Felvételek azonosítása és jegyzék](2-recording-index.md): az átírt
   anyagot témaazonosító szerint csoportosítja, és minden csoporthoz az ahhoz
   tartozó meglévő scriptmappába ír egy `recording_index.json` fájlt.
3. [Vágás előtti preflight](0-preflight.md): egy indexnél azzal folytat;
   többnél megkérdezi, melyikkel dolgozzon. Ez csak fájlalapú scriptválasztás;
   Resolve-projektet nem választ és nem hoz létre.
4. [Ismétlések kivágási terve](2a-retake-plan.md).
   Az index és az átiratok alapján ID-nként elkészíti és ellenőrzi a teljes
   `retake_plan.json` tervet. A `retained_ranges` adatokat a 3c a review
   timeline piros markerpárjainak előkészítéséhez használja. A hiányzó felvételrészeket a script saját
   `problems.md` fájljába írja, és a felhasználói döntésig nem adja át a tervet
   végrehajtásra. Resolve-projektet és timeline-t nem nyit meg.
   A kész terv után a futás mindig megáll. A felhasználó átnézi az eredményt,
   majd külön indítja a következő szakaszt.
5. A terv elkészülte és külön felhasználói indítás után [timeline-összeállítás](3-timeline-assembly.md):
   ekkor választ vagy hoz létre Resolve-projektet, majd sorrendben végrehajtja
   a [3a médiaimportot](3a-resolve-media-import.md), a
   [3b médiaregiszter mentését](3b-resolve-media-registry.md) és a
   [3c review timeline](3c-resolve-review-timeline.md) lépést. A 3c az elkészült
   médiaregisztert használva felvételi sorrendben helyezi el a felvételeket és
   markereiket az első timeline-on. Az ismétlések ekkor még megmaradnak.
6. A felhasználó Resolve-ban átnézi az első timeline-t, és szükség esetén
   módosítja a markereket. A folytatáshoz külön indítja a
   [3e Rough Cut összeállítást](3e-resolve-rough-cut-timeline.md).
7. A 3e előkészítéseként a [3d markerkiolvasás](3d-resolve-review-markers.md)
   minden alkalommal frissen kiolvassa és menti a markereket; a 3e ezek alapján
   készíti el a második timeline-t és a `rough_cut_timeline_cleanup.json` fájlt.
   A mentés utáni Resolve-módosítások nem kerülnek automatikusan a pillanatképbe.

Hibás azonosító javítása után is mindig a preflight következik. Pótfelvételnél
az átírás és a jegyzékbővítés a mentett terv folytatásához tartozik.
Az eredeti médiafájlokat a lépések nem mozgatják, másolják vagy módosítják.

## Közös szerződés

A felvételi jelölések és a vágói átadás szabályforrása a
[script-template](../gomba-1-script-writer/templates/3-script-template.md),
a parancsok és kliptípusok forrása a
[parancsszótár](../gomba-1-script-writer/RECORDING_COMMANDS.md).
A varázsszó tényleges értékét a feldolgozott projekt scriptjéből kell olvasni.

Az eredeti videók és átiratok változatlanok maradnak. A jegyzék tartja fenn a
forrásrész–script-rész–timeline-klip kapcsolatot. A B-roll és más néma képi
anyag megmarad; a csak azonosítóbemondást tartalmazó képi részre a szerződés
kivétele vonatkozik. A B-roll képe és meglévő hangja a talking headtől külön
sávokra kerül, az eredeti hang módosítása nélkül.

Egy lépés csak saját kimenetét és a közös állapot neki kijelölt mezőit írja;
a pótfelvételi jegyzékmentés tervmezőit az alábbi tranzakció kezeli.
A bemeneti sémát és a szükséges
adatokat a végrehajtás előtt ellenőrzi. Hiányzó vagy bizonytalan hozzárendelést
nem találhat ki. A Markdown-lépések megírása nem jelenti egy konkrét videóprojekt
feldolgozását; siker csak a tényleges műveletek visszaellenőrzése után jelenthető.

Minden skill indításkor olvassa el a „Feldolgozási lépések”, „Közös szerződés”,
„Közös visszatérési státuszok” és „Fájlos állapotátvétel” részeket,
valamint a saját bejegyzését. A hívási sorrend, kapuk, fájlkapcsolatok és
státuszfeltételek egyetlen forrása ez a workflow.

### Közös hibakezelés és tájékoztatás

- A biztonságosan továbbvihető tartalmi bizonytalanságot ne találd ki: az
  érintett anyagot őrizd meg, a problémát rögzítsd a scriptmappa
  `problems.md` fájljában, és folytasd a többi feldolgozható anyaggal.
  A bejegyzésből derüljön ki az érintett rész, az ok, a forráshely, ha ismert,
  a szükséges teendő és annak állapota. A részletes formátumra és a meglévő
  fejezetekre a hivatkozott közös problémánapló szabályai érvényesek.
- Folytatáskor olvasd vissza a meglévő naplót, az ugyanarra az esetre
  vonatkozó bejegyzést frissítsd, a felhasználói döntéseket és stabil
  azonosítókat őrizd meg; ne hozz létre ismétlődő tételt. Ha a scriptmappa
  még nem azonosítható, az érintett skill workflow-bejegyzése szerinti
  manifest melletti naplót használd; ne válassz találomra scriptmappát.
  A módosított naplót mentés után olvasd vissza; naplózandó probléma nélkül
  ne követeld a napló létezését.
- Megállapított hiány esetén az összes ellenőrizhető érintett részt vizsgáld
  végig, a hiányokat naplózd, majd az adott skill kapuja szerint várj a
  felhasználó döntésére. A nem blokkoló bizonytalanság ne váljon automatikusan
  megállapított hiánnyá.
- Technikai, környezeti, olvasási vagy mentési hibánál azonnal szakítsd meg
  a feldolgozást. Ha biztonságosan lehetséges, mentsd a részállapotot és a
  hiba részleteit a skill kimenetébe vagy a problémanaplóba; ne indíts újabb
  feldolgozást vagy automatikus újrapróbálást. Sikertelen kötelező
  naplóírás vagy visszaolvasás is blokkol, és nem jelenthető kész eredmény.
- A felhasználónak röviden az eredményt vagy akadályt, a következő szükséges
  lépést és a ténylegesen mentett fájl útvonalát jelezd. A fájlba írt
  tételeket ne sorold fel a chatben. Ha a hiba miatt nem sikerült fájlt
  menteni, a konkrét akadályt és a mentés sikertelenségét jelezd.

## Közös visszatérési státuszok

- `COMPLETED`: a skill ellenőrzötten befejezte a feladatát.
- `COMPLETED_WITH_ISSUES`: befejezte a feladatát; a biztonságosan továbbvihető
  problémákat dokumentálta, az érintett anyagot megőrizte.
- `BLOCKED`: kötelező userdöntés vagy kézi lépés hiányzik, vagy olyan bemeneti,
  környezeti, eszköz- vagy végrehajtási hiba történt, amely akadályozza a munkát.

A skill a hívónak kizárólag az alkalmazható státuszt adja vissza;
a részletes eredményeket az alább rögzített fájlokból kell visszaolvasni.
A státusz nem a JSON-fájlok saját `status` mezője.

Egy szakaszon belül a kész vagy dokumentált nem blokkoló problémával kész
lépés után a következő indulhat. `BLOCKED` esetén megáll a folyamat, és az
érintett skill jelzi a teendőt vagy a konkrét hibát. A külön userindítási kapuk
sikeres státusz után is érvényesek; kézi skillindításnál is ugyanazok a
feltételek érvényesek.

## Skillenkénti bemenet, kimenet és státusz

`<felvételmappa>` a felhasználó által megadott gyökérmappa; `<scriptmappa>` a
kiválasztott script projektmappája. A forrásfájlok neve és útvonala a jegyzékben
szerepel. A Resolve-projekt és timeline a Resolve-ban tárolt állapot, nem JSON-fájl.
A feladat részletei, sémái és ellenőrzései a megfelelő skillben vannak.

### 1-transcription

- Bemenet: `<felvételmappa>` videófájljai; szükség esetén
  `<scriptmappa>/3-script.md` és a felhasználó leírása.
- Kimenet: `<felvételmappa>/transcripts/master_transcript.json`,
  `<felvételmappa>/transcripts/recording_*.json`; szükség esetén
  `<felvételmappa>/transcripts/recording_assignments.json`.
- `COMPLETED`: teljes átírás és szükséges hozzárendelések elkészültek.
- `COMPLETED_WITH_ISSUES`: teljes eredmény mellett dokumentált, biztonságosan
  továbbvihető probléma maradt.
- `BLOCKED`: szükséges bemenet vagy userválasz hiányzik, meglévő kimenet,
  átírási hiba vagy hibás eredmény akadályozza a munkát.

### 2-recording-index

- Bemenet: `<felvételmappa>/transcripts/master_transcript.json`, az abban
  hivatkozott `recording_*.json` átiratok, `../projects/registry.json`, az
  érintett `<scriptmappa>/3-script.md` fájlok; ha létezik,
  `<felvételmappa>/transcripts/recording_assignments.json`. Javításkor a
  meglévő `<scriptmappa>/recording_index.json` és az érintett `problems.md`;
  ha létezik, a `<scriptmappa>/cut_workflow_state.json` is.
  Pótfelvételnél a meglévő `<scriptmappa>/retake_plan.json` és
  `<scriptmappa>/cut_workflow_state.json` is kötelező bemenet.
- Kimenet: scriptmappánként `<scriptmappa>/recording_index.json`;
  azonosítójavításnál a meglévő `cut_workflow_state.json` javítási mezői;
  pótfelvételnél a `retake_plan.json` jegyzékmentési mezői és a meglévő
  `cut_workflow_state.json` jegyzéklenyomata is frissül; szükség
  esetén `<scriptmappa>/problems.md`. Ismeretlen scriptnél a
  `<felvételmappa>/transcripts/problems.md` használható.
- `COMPLETED`: a jegyzékek elkészültek és ellenőrzöttek.
- `COMPLETED_WITH_ISSUES`: a továbbvihető bizonytalanság dokumentált.
- `BLOCKED`: sérült bemenet, szükséges pontosítás vagy azonosítójavítás vár.

### 0-preflight

- Bemenet: az érintett `<scriptmappa>/recording_index.json` és a benne
  hivatkozott `<scriptmappa>/3-script.md` fájlok.
- Kimenet: `<scriptmappa>/cut_workflow_state.json` scriptválasztási mezői.
- `COMPLETED`: egy érvényes scriptet kiválasztott, állapotát mentette és visszaolvasta.
- `COMPLETED_WITH_ISSUES`: csak dokumentált, továbbvihető probléma mellett.
- `BLOCKED`: hiányzó vagy érvénytelen bemenet, illetve függő scriptválasztás.

### 2a-retake-plan

- Bemenet: `<scriptmappa>/cut_workflow_state.json`,
  `<scriptmappa>/recording_index.json`, `<scriptmappa>/3-script.md`
  és a jegyzékben hivatkozott `recording_*.json` fájlok; folytatáskor a meglévő
  `<scriptmappa>/retake_plan.json` és szükség esetén `<scriptmappa>/problems.md`.
- Kimenet: `<scriptmappa>/retake_plan.json` és szükség esetén
  `<scriptmappa>/problems.md`.
- `COMPLETED`: a teljes, visszaellenőrzött terv végrehajtható.
- `COMPLETED_WITH_ISSUES`: végrehajtható terv, dokumentált és teljesen megőrzött
  bizonytalan anyaggal.
- `BLOCKED`: hiányzó felvételről döntés vagy pótfelvétel vár, illetve érvénytelen
  forrás vagy más végrehajtási akadály áll fenn.

### 3-timeline-assembly

- Bemenet: `<scriptmappa>/retake_plan.json`, `<scriptmappa>/recording_index.json`,
  `<scriptmappa>/3-script.md`, a jegyzékben hivatkozott eredeti forrásfájlok,
  `<scriptmappa>/cut_workflow_state.json` és a külön userindítás.
- Kimenet: a `cut_workflow_state.json` projektválasztási mezői,
  Resolve-projekt és review timeline; a scriptmappában
  `review_timeline_assembly.json`, szükség esetén `problems.md`.
- `COMPLETED`: a review timeline teljes és ellenőrzött.
- `COMPLETED_WITH_ISSUES`: az eredmény kész, a megőrzött problémák dokumentáltak.
- `BLOCKED`: projektválasztás, újrafuttatási döntés, hibás bemenet vagy hiba vár.

### 3a-resolve-media-import

- Bemenet: `<scriptmappa>/recording_index.json`, `<scriptmappa>/3-script.md`,
  `<scriptmappa>/retake_plan.json`, a jegyzékben hivatkozott eredeti
  forrásfájlok és `<scriptmappa>/cut_workflow_state.json`.
- Kimenet: mentett Resolve Media Pool és a
  `<scriptmappa>/cut_workflow_state.json` `media_import` mezője.
- `COMPLETED`: minden forrás egyértelműen azonosított, a projekt és az
  importeredmény mentett és visszaellenőrzött.
- `COMPLETED_WITH_ISSUES`: csak dokumentált, továbbvihető probléma mellett.
- `BLOCKED`: bizonytalan egyezés, hiányzó forrás, import- vagy mentési hiba.

### 3b-resolve-media-registry

- Bemenet: `<scriptmappa>/recording_index.json`, a jegyzékben hivatkozott
  eredeti forrásfájlok, `<scriptmappa>/cut_workflow_state.json` és a benne
  azonosított Resolve-projekt Media Poolja.
- Kimenet: `<scriptmappa>/review_timeline_resolve_media_registry.json`.
- `COMPLETED`: minden forrás és FPS ellenőrzött, a regiszter visszaolvasott.
- `COMPLETED_WITH_ISSUES`: csak dokumentált, továbbvihető probléma mellett.
- `BLOCKED`: hibás projekt-, forrás- vagy FPS-adat, illetve mentési hiba.

### 3c-resolve-review-timeline

- Bemenet: `<scriptmappa>/recording_index.json`, `<scriptmappa>/retake_plan.json`,
  `<scriptmappa>/review_timeline_resolve_media_registry.json` és a kiválasztott
  Resolve-projekt.
- Kimenet: review timeline, `<scriptmappa>/review_timeline_assembly.json`,
  szükség esetén `<scriptmappa>/problems.md`.
- `COMPLETED`: az elhelyezés és a jelölések ellenőrzöttek.
- `COMPLETED_WITH_ISSUES`: a bizonytalan anyag megőrzött, jelölt és naplózott.
- `BLOCKED`: hibás bemenet, meglévő timeline vagy technikai végrehajtási hiba.

### 3d-resolve-review-markers

- Bemenet: `<scriptmappa>/recording_index.json`,
  `<scriptmappa>/review_timeline_assembly.json`,
  `<scriptmappa>/review_timeline_resolve_media_registry.json` és a review-zott
  Resolve-timeline.
- Kimenet: frissen kiolvasott `<scriptmappa>/review_timeline_markers.json`.
- Tartalmi bizonytalanság esetén kimenet továbbá a scriptmappa `problems.md`
  fájlja a közös hibakezelés szerint.
- `COMPLETED`: a teljes pillanatkép visszaellenőrzött.
- `COMPLETED_WITH_ISSUES`: a tartalmi bizonytalanságok rögzítettek.
- `BLOCKED`: hibás bemenet, projektazonosítási vagy kiolvasási hiba.

### 3e-resolve-rough-cut-timeline

- Bemenet: `<scriptmappa>/retake_plan.json`, `<scriptmappa>/recording_index.json`,
  `<scriptmappa>/3-script.md`, `<scriptmappa>/review_timeline_assembly.json`,
  `<scriptmappa>/review_timeline_resolve_media_registry.json` és az aktuálisan
  létrehozott `<scriptmappa>/review_timeline_markers.json`.
- Kimenet: Rough Cut timeline, `<scriptmappa>/rough_cut_timeline_cleanup.json`
  és szükség esetén `<scriptmappa>/problems.md`.
- `COMPLETED`: a timeline elkészült és visszaellenőrzött.
- `COMPLETED_WITH_ISSUES`: a bizonytalan anyag megőrzött, jelölt és dokumentált.
- `BLOCKED`: szükséges adat hiányzik, döntés vagy újrafuttatás vár, illetve
  technikai hiba akadályozza az összeállítást.

## Fájlos állapotátvétel

A meglévő kimeneti JSON-fájlokat használd. Egyetlen további állapotfájl van:
`<scriptmappa>/cut_workflow_state.json`. Nem tartalmaz átiratot, vágási tervet
vagy eseménytörténetet. A futás célja a scriptmappa vagy ennek az állapotfájlnak
az útvonala; ezt a hívás bemeneteként kell megadni. Ha csak több jelölt scriptmappa
ismert, ne válassz korábbi állapotfájl vagy módosítási dátum alapján; kérj
célpontosítást. A preflight során történt választást mindig mentsd.

TODO: az orchestrator bevezetésekor rögzíteni kell, hogyan azonosítja a futás
az aktuális preflight-választást több scriptmappa mellett, kizárólag státuszos
visszatéréssel. Addig az egyértelmű célmappa vagy állapotfájl a hívás bemenete.

Az állapot sémája `1.0`, mezői:

- `schema_version`: `"1.0"`.
- `topic_id`, abszolút `script_path`, `script_sha256`, abszolút
  `recording_index_path`, `recording_index_sha256`: az ellenőrzött választás.
- `resolve_project`: kezdetben `null`; projektválasztás után `id` és `name`,
  a Resolve-ból visszaolvasva.
- `media_import`: kezdetben `null`; import után `status` (`completed` vagy
  `incomplete`), `sources` lista és `error` (`null` vagy konkrét hiba).
  Forrásonként `source_id`, `source_path`, `resolve_media_pool_item_id`;
  részleges importnál csak a ténylegesen ellenőrzött források szerepeljenek.

- `index_correction`: kezdetben `null`; jóváhagyott azonosítójavításkor
  `before_sha256`, `after_sha256`, `affected_script_ids`, `problem_log_paths`
  és `status` (`pending` vagy `committed`). Csak a legutóbbi, még fel nem dolgozott
  javítást tárolja; új javítást ennek lezárása után lehet indítani.

A preflight a választási mezőket, a projektválasztás a `resolve_project`, az
import a `media_import` mezőt írja; más mezőt őrizzen meg. Meglévő állapotnál
ellenőrizd a sémát, a scriptmappát, témát, útvonalakat és lenyomatokat. Váratlan
eltérésnél állj meg, ne nullázd vagy írd felül a korábbi állapotot. Projektváltás
vagy meglévő eredmény újrafuttatása továbbra is userdöntéshez kötött.

Mentés után mindig olvasd vissza a fájlt. Hiányzó, sérült vagy érvénytelen
állapot, illetve mentési hiba blokkol; korábbi chatből ne pótolj adatot. A
mentett projekt- és médiaazonosítókat használat előtt ellenőrizd a Resolve-ban.
A projektválasztás még import előtt mentendő; import csak ellenőrzött választási
állapotból indulhat. A médiaregiszter csak `media_import.status: completed`
eredményt fogadhat el, minden jegyzékbeli forrás egyszeri lefedésével.

A fájlalapú script- és jegyzékellenőrzést a tervkészítés előtt is végezd el.
Pótfelvételi vagy azonosítójavítási jegyzékfrissítés közben előbb a lent leírt függő tranzakciót
rendezd, utána ellenőrizd a végleges lenyomatokat. Az állapotfájl sem review-
jóváhagyást, sem automatikus továbblépési engedélyt nem jelent.

### Pótfelvétel mentése adatátadás nélkül

A meglévő `retake_plan.json.pending_index_update` a tranzakció állapota;
külön köztes fájl vagy memóriabeli hash-átadás nem kell. A jegyzékbővítés csak
az alábbi mentési mezőket módosíthatja a tervben, más tervdöntést nem.

1. A script, régi jegyzék és új manifest ellenőrzése után állítsd elő a bővített
   jegyzék pontos tartalmát és SHA-256 értékét. A tervbe mentsd a
   `pending_index_update` mezőt (`manifest_path`, `before_sha256`, `after_sha256`),
   a `status` legyen `needs_review`, a `coverage_checked` pedig `false`.
2. Csak visszaolvasott függő állapot után mentsd ugyanazt a jegyzéktartalmat.
   Olvasd vissza és ellenőrizd az `after_sha256` értéket.
3. Vezesd át a jegyzék hash-ét a terv és a meglévő `cut_workflow_state.json`
   `recording_index_sha256` mezőjébe, olvasd vissza mindkettőt, majd töröld
   a terv függő állapotát. A terv a tartalmi újraellenőrzésig maradjon
   `needs_review`, `coverage_checked: false` állapotú.

Megszakítás után a mentett régi hash-nél a jegyzékmentés még hátravan; az
újra előállított tartalom hash-ének egyeznie kell a tervezettel. Az új hash-nél
csak az átvezetés és a lezárás maradt hátra. A terv és az állapotfájl hash-e
csak a mentett régi vagy új érték lehet; más eltérés blokkol. A függő mezőt
csak mindkét fájl sikeres visszaellenőrzése után töröld. Már hozzáadott manifestet
és forrást ne fűzz hozzá újra.

### Engedélyezett azonosítójavítás hash-frissítése

Meglévő állapothoz tartozó jegyzék javításakor a következő szabályt alkalmazd.
Csak az állapot `recording_index_path` mezőjével azonos jegyzék hash-ét írd át;
más script javítása nem változtatja meg az aktuális választást vagy annak hash-ét.
Az első preflight előtt, még állapotfájl nélkül javított jegyzék hash-ét a
preflight az ellenőrzött aktuális tartalomból rögzíti.

1. Olvasd vissza a user kitöltött `problems.md` javítását; ellenőrizd a régi
   jegyzék hash-ét az állapothoz és a script változatlanságát. Csak az engedélyezett
   azonosítójavításokat alkalmazd. Mentés előtt az állapot `index_correction`
   mezőjébe írd a régi és a tervezett pontos új jegyzék SHA-256 értékét, az
   érintett régi és új script-ID-kat, a javítási naplók abszolút útvonalait és
   `status: pending` értéket. Olvasd vissza.
2. Mentsd és olvasd vissza a javított jegyzéket; kizárólag a tervezett új hash
   fogadható el. Frissítsd az állapot `recording_index_sha256` mezőjét, és jelöld
   a javítást `committed` állapotúnak. Más választási vagy projektmezőt ne írj át.
3. A következő preflight ezt az egyező, naplóval igazolt új hash-t fogadja el;
   váratlan eltérés továbbra is blokkol. A tervkészítés a `committed` bejegyzésből
   ismeri fel a jogos jegyzékváltozást: meglévő tervnél `needs_review` és
   `coverage_checked: false` állapotot ment, újraelemzi az érintett csoportokat,
   majd újraellenőrzi a teljes lefedettséget. Csak ezután vezeti át a terv hash-ét
   és törli az `index_correction` mezőt `null` értékre; a régi terv nem válik
   automatikusan végrehajthatóvá.

Megszakításkor `pending` és régi jegyzékhash mellett a naplóból újra előállított
javításnak pontosan a mentett új hash-t kell adnia; új jegyzékhash mellett csak
az állapot átvezetése maradt hátra. `committed` esetén ne alkalmazd újra a
javítást; a terv újraellenőrzésével folytasd. A terv lezárása után, de a mező
törlése előtt történt megszakításnál az új hash-hez tartozó, visszaellenőrzött
kész terv alapján zárható a bejegyzés. Más hash, eltérő script vagy nem igazolható
userjavítás blokkol. Pótfelvételi és javítási tranzakció ne fusson egyszerre.
