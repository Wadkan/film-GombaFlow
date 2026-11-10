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

Egy lépés csak saját kimenetét készíti el; a bemeneti sémát és a szükséges
adatokat a végrehajtás előtt ellenőrzi. Hiányzó vagy bizonytalan hozzárendelést
nem találhat ki. A Markdown-lépések megírása nem jelenti egy konkrét videóprojekt
feldolgozását; siker csak a tényleges műveletek visszaellenőrzése után jelenthető.

Minden skill indításkor olvassa el a „Feldolgozási lépések”, „Közös szerződés”,
„Közös visszatérési státuszok” és „TODO — Fájlos állapotátvétel” részeket,
valamint a saját bejegyzését. A hívási sorrend, kapuk, fájlkapcsolatok és
státuszfeltételek egyetlen forrása ez a workflow.

## Közös visszatérési státuszok

- `COMPLETED`: a skill ellenőrzötten befejezte a feladatát.
- `COMPLETED_WITH_ISSUES`: befejezte a feladatát; a biztonságosan továbbvihető
  problémákat dokumentálta, az érintett anyagot megőrizte.
- `BLOCKED`: kötelező userdöntés vagy kézi lépés hiányzik, vagy olyan bemeneti,
  környezeti, eszköz- vagy végrehajtási hiba történt, amely akadályozza a munkát.

A skill a hívónak kizárólag az alkalmazható státuszt adja vissza; a még nyitott
pótfelvételi kivételt a „TODO — Fájlos állapotátvétel” rész rögzíti.
A státusz nem a JSON-fájlok saját `status` mezője. A részletes
adatok a fájlokban maradnak. A felhasználó rövid tájékoztatást kap az akadályról
vagy a következő kézi teendőről és a szükséges fájl útvonaláról; a fájlba írt
tételeket ne listázd a chatben. Technikai hiba esetén azonnal állj meg.

Egy szakaszon belül a kész vagy dokumentált nem blokkoló problémával kész
lépés után a következő indulhat. `BLOCKED` esetén megáll a folyamat, és az
érintett skill jelzi a teendőt vagy a konkrét hibát. A külön userindítási kapuk
sikeres státusz után is érvényesek; kézi skillindításnál is ugyanazok a
feltételek érvényesek. A user mindig kapjon rövid tájékoztatást a következő
lépésről és a szükséges kézi műveletről.

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
  meglévő `<scriptmappa>/recording_index.json` és az érintett `problems.md`.
- Kimenet: scriptmappánként `<scriptmappa>/recording_index.json`; szükség
  esetén `<scriptmappa>/problems.md`. Ismeretlen scriptnél a
  `<felvételmappa>/transcripts/problems.md` használható.
- `COMPLETED`: a jegyzékek elkészültek és ellenőrzöttek.
- `COMPLETED_WITH_ISSUES`: a továbbvihető bizonytalanság dokumentált.
- `BLOCKED`: sérült bemenet, szükséges pontosítás vagy azonosítójavítás vár.

### 0-preflight

- Bemenet: az érintett `<scriptmappa>/recording_index.json` és a benne
  hivatkozott `<scriptmappa>/3-script.md` fájlok.
- Kimenet: új fájl nincs; a kiválasztott `topic_id` és fájlok állapotának
  mentése a „TODO — Fájlos állapotátvétel” részben rögzített nyitott feladat.
- `COMPLETED`: egy érvényes scriptet kiválasztott.
- `COMPLETED_WITH_ISSUES`: csak dokumentált, továbbvihető probléma mellett.
- `BLOCKED`: hiányzó vagy érvénytelen bemenet, illetve függő scriptválasztás.

### 2a-retake-plan

- Bemenet: `<scriptmappa>/recording_index.json`, `<scriptmappa>/3-script.md`
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
  `<scriptmappa>/3-script.md`, a jegyzékben hivatkozott eredeti forrásfájlok és
  a külön userindítás.
- Kimenet: Resolve-projekt és review timeline; a scriptmappában
  `review_timeline_assembly.json`, szükség esetén `problems.md`.
- `COMPLETED`: a review timeline teljes és ellenőrzött.
- `COMPLETED_WITH_ISSUES`: az eredmény kész, a megőrzött problémák dokumentáltak.
- `BLOCKED`: projektválasztás, újrafuttatási döntés, hibás bemenet vagy hiba vár.

### 3a-resolve-media-import

- Bemenet: `<scriptmappa>/recording_index.json`, `<scriptmappa>/3-script.md`,
  `<scriptmappa>/retake_plan.json`, a jegyzékben hivatkozott eredeti
  forrásfájlok és a kiválasztott Resolve-projekt.
- Kimenet: mentett Resolve Media Pool; önálló kimeneti fájl jelenleg nincs.
- `COMPLETED`: minden forrás egyértelműen azonosított és a projekt mentett.
- `COMPLETED_WITH_ISSUES`: csak dokumentált, továbbvihető probléma mellett.
- `BLOCKED`: bizonytalan egyezés, hiányzó forrás, import- vagy mentési hiba.

### 3b-resolve-media-registry

- Bemenet: `<scriptmappa>/recording_index.json`, a jegyzékben hivatkozott
  eredeti forrásfájlok és a kiválasztott Resolve-projekt Media Poolja.
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

## TODO — Fájlos állapotátvétel

- TODO: a preflight kiválasztott `topic_id`, `recording_index.json` és
  `3-script.md` útvonalait mentett állapotból lehessen visszaolvasni.
  Jelenleg nincs ilyen fájl; új skillfutásban ne következtess a kiválasztásra.
- TODO: a kiválasztott Resolve-projekt azonosítóját és nevét a médiaimport
  előtt tartósan rögzíteni kell, hogy a médiaregiszter önálló futásban is
  ellenőrizhesse. Jelenleg nincs import előtti külön kiválasztási állapotfájl.
- TODO: a pótfelvételi jegyzékmentés két hash-egyeztetését fájlos tranzakcióra
  kell cserélni. Addig ez a státusz-only visszatérés egyetlen adatátadási
  kivétele: a `2-recording-index` mentés előtt a tervezett jegyzék pontos
  SHA-256 értékét egyezteti a `2a-retake-plan` lépéssel; csak a tervben mentett
  `pending_index_update` után mentheti ugyanazt a tartalmat. Visszaolvasás után
  az új hash egyeztetése zárja a tranzakciót. A régi/tervezett hash-ek és a
  megszakítás utáni helyreállítás szabályait továbbra is a terv írja le.

E TODO-k lezárásáig az érintett állapotokat önálló, kizárólag státusszal
visszatérő skillfutások között nem lehet biztonságosan továbbvinni.
Hiányzó állapotnál állj meg; a teljes automatikus lánc elkészültét ne állítsd.
