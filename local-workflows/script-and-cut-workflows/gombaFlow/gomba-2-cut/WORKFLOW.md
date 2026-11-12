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

### Összetett és közvetlen skillhívások

Az összetett skillek belső hívási sorrendje:

- Az 5. számozott lépésben a szülő `prepare` fázisa, az ott felsorolt belső
  lépések sorrendben, majd a szülő `verify` fázisa következik.
- A 6–7. számozott lépésben a szülő `prepare` fázisa, a belső markerkiolvasás,
  majd a szülő `build` fázisa következik. A kiolvasás az aktuális hívásban
  történik, korábbi pillanatkép nem helyettesíti.
- A tervlépés mentett pótfelvételi folytatásában: átírás az új mappából →
  jegyzékkészítő hozzáfűzés → preflight → tervellenőrzés, ugyanahhoz a
  kiválasztott scripthez.

Ez a sorrend az orchestrált és a közvetlen skillhívásokra egyaránt kötelező.
A közvetlenül indított összetett skill hívója ugyanennek az indexnek
a receptjét hajtja végre. A belső lépés nem külön felhasználói feladat, és
egy receptben csak egyszer fut. A fázis megadása nélküli szülőhívás a teljes
receptet jelenti; fázishívás kizárólag az adott fázist végezheti el. A hívó
vagy a teljes receptet bízza egy végrehajtóra, vagy fázisonként vezérli;
a két módszert ugyanabban a hívásban ne keverje.

Fázishívásnál a három közös státusz csak az adott fázisra vonatkozik, nem a
szülő teljes készültségére. A szülő összesített eredménye csak az összes
kötelező fázis és belső lépés sikere után kész. Bármely `BLOCKED` vagy hibás
visszatérés megszakítja a teljes receptet. Dokumentált probléma esetén az
összesített eredmény is `COMPLETED_WITH_ISSUES` marad, akkor is, ha az utolsó
fázis önmagában hibamentes. A végrehajtó a userkapunál vagy blokkolásnál adja
vissza a vezérlést, nem vár háttérben és nem figyeli automatikusan a fájlokat.

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

A közös belépő az [orchestrator](orchestrator.md); saját vezérlési és
folytatási szabályai ott találhatók.
Közvetlen skillhívás sem indít automatikusan teljes előkészítést vagy másik
szakaszt. Az index által előírt belső hívások a meghívott feladathoz tartoznak.

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

A usernek szóló rövid tájékoztatás ettől külön történik: a végrehajtó a
felhasználói csatornán jelzi a következő lépést vagy szükséges választ,
a hívó válaszába nem másol naplót, eredményt vagy kérdésszöveget.
Hiányzó, ismeretlen vagy többértelmű visszatérésnél a hívó blokkol; kész
JSON jelenlétéből nem következtethet sikeres státuszra.

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

### gomba-2-cut-orchestrator

- Bemenet: a user által indított szakasz, annak célútvonalai és folytatáskor
  a meglévő `cut_workflow_state.json`; a szakaszválasztás és a vezérlés
  szabályai az [orchestratorban](orchestrator.md#indítható-szakaszok) vannak.
- Kimenet: a meglévő `cut_workflow_state.json` `orchestration` mezője,
  amint a scriptválasztás megtörtént. A tartalmi kimeneteket a végrehajtók írják.
- `COMPLETED`: a kért szakasz minden lépése kész, a szakaszvégi megállás mentett.
- `COMPLETED_WITH_ISSUES`: a szakasz kész, valamelyik lépés dokumentált
  nem blokkoló problémával zárult.
- `BLOCKED`: választás vagy szükséges userválasz hiányzik, egy lépés blokkolt,
  érvénytelenül tért vissza, vagy a végrehajtási/mentési környezet nem működik.

### 1-transcription

- Bemenet: `<felvételmappa>` videófájljai; szükség esetén
  `<scriptmappa>/3-script.md` és a felhasználó leírása.
  Azonosítási folytatásnál a kész `master_transcript.json`, hivatkozott
  átiratai és a meglévő `recording_assignments.json` is bemenet.
- Kimenet: `<felvételmappa>/transcripts/master_transcript.json`,
  `<felvételmappa>/transcripts/recording_*.json`; szükség esetén
  `<felvételmappa>/transcripts/recording_assignments.json`.
- `COMPLETED`: teljes átírás és szükséges hozzárendelések elkészültek.
- `COMPLETED_WITH_ISSUES`: teljes eredmény mellett dokumentált, biztonságosan
  továbbvihető probléma maradt.
- `BLOCKED`: szükséges bemenet vagy userválasz hiányzik, meglévő kimenet,
  átírási hiba vagy hibás eredmény akadályozza a munkát.
  Az igazolt, teljes manifestből végzett azonosítási folytatás nem tiltott
  újrafuttatás; meglévő mappa önmagában ebben a módban nem akadály.

### 2-recording-index

- Bemenet: `<felvételmappa>/transcripts/master_transcript.json`, az abban
  hivatkozott `recording_*.json` átiratok, `../projects/registry.json`, az
  érintett `<scriptmappa>/3-script.md` fájlok; ha létezik,
  `<felvételmappa>/transcripts/recording_assignments.json`. Javításkor a
  meglévő `<scriptmappa>/recording_index.json` és az érintett `problems.md`;
  ha létezik, a `<scriptmappa>/cut_workflow_state.json` is.
  Pótfelvételnél a meglévő `<scriptmappa>/retake_plan.json` és
  `<scriptmappa>/cut_workflow_state.json` is kötelező bemenet.
  Review utáni pótfelvételnél a `review_timeline_markers.json` mentett
  újrafelvételi döntése is bemenet.
- Kimenet: scriptmappánként `<scriptmappa>/recording_index.json`;
  azonosítójavításnál a meglévő `cut_workflow_state.json` javítási mezői;
  pótfelvételnél a `retake_plan.json` jegyzékmentési mezői és a meglévő
  `cut_workflow_state.json` jegyzéklenyomata is frissül; szükség
  esetén `<scriptmappa>/problems.md`. Ismeretlen scriptnél a
  `<felvételmappa>/transcripts/problems.md` használható.
- `COMPLETED`: a jegyzékek elkészültek és ellenőrzöttek.
- `COMPLETED_WITH_ISSUES`: a továbbvihető bizonytalanság dokumentált.
- `BLOCKED`: sérült bemenet, szükséges pontosítás vagy azonosítójavítás vár.

Továbbvihető probléma csak a szükséges téma- és script-hozzárendelések
egyértelműsége mellett engedélyezett. A további végrehajtáshoz szükséges
azonosítatlan vagy `needs_review` rekord nem jelent kész hozzárendelést.

### 0-preflight

- Bemenet: az érintett `<scriptmappa>/recording_index.json` és a benne
  hivatkozott `<scriptmappa>/3-script.md` fájlok. Orchestrált hívásnál a lent
  leírt scriptválasztási kapu után egy konkrét indexútvonal érkezik.
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
  Pótfelvételi hozzáfűzésnél a korábbi `review_timeline_assembly.json` és
  a mentett újrafelvételi userdöntés is kötelező.
- Kimenet: a `cut_workflow_state.json` projektválasztási mezői,
  Resolve-projekt és review timeline; a scriptmappában
  `review_timeline_assembly.json`, szükség esetén `problems.md`.
- `COMPLETED`: a review timeline teljes és ellenőrzött.
- `COMPLETED_WITH_ISSUES`: az eredmény kész, a megőrzött problémák dokumentáltak.
- `BLOCKED`: projektválasztás, újrafuttatási döntés, hibás bemenet vagy hiba vár.

Fázishívásnál a `prepare` készfeltétele az összes indulási ellenőrzés és a
mentett, visszaellenőrzött projektválasztás. Review timeline-t még nem követel.
A `verify` a teljes assemblyt és Resolve-eredményt ellenőrzi a skill kimeneti
szabályai szerint; nem importál és nem helyez el újra semmit. A teljes hívás
készfeltétele a fenti, teljes review timeline-ra vonatkozó feltétel.

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
  Pótfelvételi hozzáfűzésnél a korábbi `review_timeline_assembly.json` és
  a mentett újrafelvételi userdöntés is bemenet.
- Kimenet: review timeline, `<scriptmappa>/review_timeline_assembly.json`,
  szükség esetén `<scriptmappa>/problems.md`.
- `COMPLETED`: az elhelyezés és a jelölések ellenőrzöttek.
- `COMPLETED_WITH_ISSUES`: a bizonytalan anyag megőrzött, jelölt és naplózott.
- `BLOCKED`: hibás bemenet, nem engedélyezett meglévő timeline vagy technikai
  végrehajtási hiba.

Közvetlen hívásának lezárásakor is a 6. számozott pont kézi review-kapuját
kell jeleznie. Összetett hívásban ezt megelőzheti a szülő végső, csak
visszaellenőrzést végző fázisa; további timeline-művelet nem indulhat.

A user külön indított pótfelvételi folytatása engedélyezi a meglévő review
timeline hozzáfűzését, ha a pótfelvételi döntés a tervben vagy a
markerpillanatképben mentett, a bővített jegyzék és újraellenőrzött terv kész,
és a korábbi teljes assembly rendelkezésre áll. Ebben az esetben a
timeline-összeállítás meglévő eredmény miatti újrafuttatási kapuja nem kér újabb
döntést; a 3a és 3b után a 3c csak az új rekordokat fűzi hozzá.
A timeline-ID megmarad, a folytatáshoz továbbra is user review szükséges.

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
  `<scriptmappa>/review_timeline_resolve_media_registry.json`; a `build` fázisnak
  ezenfelül az aktuális hívásban létrehozott
  `<scriptmappa>/review_timeline_markers.json` is kötelező.
- Kimenet: Rough Cut timeline, `<scriptmappa>/rough_cut_timeline_cleanup.json`
  és szükség esetén `<scriptmappa>/problems.md`; a
  `review_timeline_markers.json` `missing_parts` mezője is frissül.
  A `retake_plan.json` ebben a lépésben csak olvasható.
- `COMPLETED`: a timeline elkészült és visszaellenőrzött.
- `COMPLETED_WITH_ISSUES`: a bizonytalan anyag megőrzött, jelölt és dokumentált.
- `BLOCKED`: szükséges adat hiányzik, döntés vagy újrafuttatás vár, illetve
  technikai hiba akadályozza az összeállítást.

Fázishívásnál a `prepare` készfeltétele a pillanatkép előtti bemenetek,
a projekt, review timeline és a meglévő eredmény miatti kapu ellenőrzése.
A `build` készfeltétele a lefedettségi kapu teljesülése és az ellenőrzött
Rough Cut. A teljes hívásnak az összes fázis és a friss kiolvasás sikere szükséges.

A review utáni kliphiányok teljes összegyűjtése és mentése után a 3e
addig nem hozhat létre Rough Cutot, amíg a markerpillanatkép `missing_parts`
listájában `awaiting_decision` vagy `awaiting_recording` tétel van.
A user a problémalistában szereplő hiányokról kihagyással vagy újrafelvétellel
dönthet; a tájékoztatás a közös hibakezelés szerint történik.
Review utáni pótfelvételnél a markerpillanatkép `awaiting_recording`
tételének userdöntése engedélyezi a jegyzékbővítést; emiatt a vágási tervbe
ne másolj hiányt vagy kihagyási döntést. A pótfelvétel normál feldolgozásánál
a terv indexlenyomata és vágási tartományai a meglévő szabályok szerint frissülnek.
A meglévő átírási, jegyzékbővítési és tervellenőrzési folyamat,
majd a külön indítási és újrafuttatási kapuk betartásával a review timeline
frissítése és user review-ja szükséges. Csak ezután indítható újra a 3e
a friss 3d-pillanatképből. A korábbi hiánydöntéseket a 3d megőrzi,
a lefedettséget és a döntéseket a 3e ellenőrzi újra.

## Fájlos állapotátvétel

A meglévő kimeneti JSON-fájlokat használd. Egyetlen további állapotfájl van:
`<scriptmappa>/cut_workflow_state.json`. Nem tartalmaz átiratot, vágási tervet
vagy eseménytörténetet. A futás célja a scriptmappa vagy ennek az állapotfájlnak
az útvonala; a scriptválasztás utáni hívások bemeneteként ezt kell megadni.
A választás előtti célfeloldás szabálya az alábbi scriptválasztási kapu.

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
- `orchestration`: az orchestrator opcionális saját mezője; hiánya `null`.
  Sémája és kezelése az [orchestratorban](orchestrator.md#futásállapot-és-folytatás)
  található. A többi skill változatlanul őrzi meg, nem értelmezi és nem írja.
  A fájl sémája `1.0` marad; közvetlen skillhíváshoz ez a mező nem kötelező.

A preflight a választási mezőket, a projektválasztás a `resolve_project`, az
import a `media_import`, az orchestrator az `orchestration` mezőt írja;
más mezőt őrizzen meg. Meglévő állapotnál
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

### Scriptválasztási kapu

Konkrét index, scriptmappa vagy állapotfájl bemenetén a cél már ismert;
a hozzá tartozó index és manifest kapcsolatát kell ellenőrizni. Ha még nincs
ilyen cél, a hívó a konkrét manifestből indul. A jegyzékkészítés
után a közös `../projects/registry.json` által megadott projektmappákban keresse
az ehhez a manifesthez tartozó indexeket; csak a téma-, script- és
manifestreferenciákat olvassa be, ne az átiratok vagy a felvételek tartalmát.
Az abszolút manifestútvonal egyezzen az index `manifest_path` értékével vagy
pótfelvételnél az `additional_manifests` megfelelő elemével. Más manifesthez
tartozó index nem jelölt. Egyetlen jelölt hiánya vagy a célhoz tartozó
téma/script/manifest kapcsolat ellentmondása blokkol.

- Megadott cél-scriptnél annak az indexét ellenőrizze, másikra ne váltson.
- Egyetlen jelöltnél automatikusan azt válassza. Többnél a témaazonosító és
  scriptcím alapján kérdezze meg, melyikkel dolgozzon, majd várjon a válaszra.
- A választás után egyetlen abszolút indexútvonalat adjon a preflightnak.
  Ezzel a kimeneti állapotfájl helye már a hívás előtt egyértelmű; a skill
  státuszválaszában nem kell útvonalat vagy választási adatot visszaadni.
- Közvetlen preflight-hívásnál ugyanezt a kaput a skill saját felhasználói
  kontextusában kell alkalmazni. Konkrét, már kiválasztott indexnél ne
  kérdezzen újra. Az index és a script ellenőrzése minden esetben kötelező.

Korábbi állapotfájl jelenléte vagy módosítási ideje nem választási bizonyíték.
A preflight kizárólag a kiválasztott scriptmappában menti az állapotot;
a hívó sikeres státusz után onnan olvassa vissza a választást.

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
