# Gomba 2 – vágási workflow-teszt

## [`orchestrator.md`](local-workflows/script-and-cut-workflows/gombaFlow/gomba-2-cut/orchestrator.md)

- [ ] TODO Az előkészítés elkészíti az átiratot, a jegyzéket és a tervet, majd megáll tervellenőrzésre.
- [ ] TODO A külön indított review elkészíti a Full Takes timeline-t, majd megáll kézi markerellenőrzésre.
- [ ] TODO A külön indított Rough Cut frissen kiolvassa a markereket, összeállítja a vágást és menti a futás eredményét.

## [`1-transcription.md`](local-workflows/script-and-cut-workflows/gombaFlow/gomba-2-cut/1-transcription.md)

- [ ] TODO A felvételmappa és almappái videónkénti, szóidőbélyeges átiratot kapnak. A teljes lista a `master_transcript.json` fájlban szerepel.
- [ ] TODO A hang vagy felismert beszéd nélküli videók is szerepelnek a listában. A felhasználó leírása alapján tisztázott script-hozzárendelés a `recording_assignments.json` fájlba kerül.

## [`2-recording-index.md`](local-workflows/script-and-cut-workflows/gombaFlow/gomba-2-cut/2-recording-index.md)

- [ ] TODO A script varázsszavával keretezett bemondás alapján azonosítja a témát és a script-részt. A kliptípust a scriptből veszi.
- [ ] TODO Egy videó több bemondása külön rekordot kap. A bemondás és a tartalom határai külön szerepelnek, minden újramondás megmarad.
- [ ] TODO A kézzel hozzárendelt és az azonosítatlan anyag is visszakereshető a témánkénti `recording_index.json` fájlban.
- [ ] TODO A hibás azonosítót a `problems.md` naplózza. A jóváhagyott javítás vagy pótfelvétel bekerül a jegyzékbe.

## [`0-preflight.md`](local-workflows/script-and-cut-workflows/gombaFlow/gomba-2-cut/0-preflight.md)

- [ ] TODO Ellenőrzi, hogy a jegyzék az aktuális scripthez tartozik. Több választható scriptnél döntést kér.
- [ ] TODO A választott script és jegyzék bekerül a `cut_workflow_state.json` fájlba. A Resolve-projekt választása a timeline-összeállításkor történik.

## [`2a-retake-plan.md`](local-workflows/script-and-cut-workflows/gombaFlow/gomba-2-cut/2a-retake-plan.md)

- [ ] TODO Felismeri a teljes és részleges újramondásokat. Az utolsó változatot és a korábbi egyedi szöveget tartja meg a tervben.
- [ ] TODO Az azonosítóbemondást és a `HIBA újra` blokkot a varázsszavakkal együtt jelöli kivágásra. A hibás beszédhez igazolt újramondás kell.
- [ ] TODO Csend vagy töltelékszó csak igazolt újramondási tartomány részeként kap vágási jelölést. A csak azonosítóbemondást tartalmazó képi rész képe és meglévő hangja megmarad.
- [ ] TODO A bizonytalan részek teljesen megmaradnak kézi vágáshoz. A terv a megtartandó tartományokat a `retake_plan.json` fájlba menti.
- [ ] TODO A hiányzó script-részeket és teljes narrációs mondatokat naplózza. Igazolt hiánynál kihagyási döntés vagy ellenőrzött pótfelvétel kell a továbblépéshez.

## [`3-timeline-assembly.md`](local-workflows/script-and-cut-workflows/gombaFlow/gomba-2-cut/3-timeline-assembly.md)

- [ ] TODO Ellenőrzött, végrehajtható terv alapján megnyitja vagy létrehozza a jóváhagyott Resolve-projektet, és menti a választást.
- [ ] TODO A médiaimport, a médiaregiszter és a Full Takes elkészülte után visszaellenőrzi a tényleges kliphatárokat, sávokat, hangkapcsolatokat és markereket.

## [`3a-resolve-media-import.md`](local-workflows/script-and-cut-workflows/gombaFlow/gomba-2-cut/3a-resolve-media-import.md)

- [ ] TODO A Media Pool már meglévő, azonos forrásklipjeit újrahasználja. A hiányzó eredeti felvételeket a kijelölt mappába importálja, forrásonként egyszer.
- [ ] TODO A mentett importeredményben a ténylegesen ellenőrzött Media Pool-klipek szerepelnek. Részleges importnál a hiba is megjelenik.

## [`3b-resolve-media-registry.md`](local-workflows/script-and-cut-workflows/gombaFlow/gomba-2-cut/3b-resolve-media-registry.md)

- [ ] TODO A `review_timeline_resolve_media_registry.json` forrásonként összeköti az eredeti fájlt az ellenőrzött Media Pool-klippel és rögzíti a pontos képkockasebességet.
- [ ] TODO Pótfelvételnél az új források bekerülnek, a korábbi bejegyzések megmaradnak.

## [`3c-resolve-review-timeline.md`](local-workflows/script-and-cut-workflows/gombaFlow/gomba-2-cut/3c-resolve-review-timeline.md)

- [ ] TODO A Full Takes timeline felvételi sorrendben, forrásonként egyszer mutatja a teljes klipet, szinkronban kapcsolt eredeti hanggal.
- [ ] TODO Egy fizikai klipen belül külön leképezi az azonosított részeket a `review_timeline_assembly.json` fájlban.
- [ ] TODO A videóklipen piros `KEEP IN` / `KEEP OUT` határolja a megtartást, sárga `REVIEW START` / `REVIEW END` a bizonytalan részt. A teljes klip jóváhagyott kihagyását `OMIT TAKE` jelölheti.
- [ ] TODO A bemondások és ismétlések hallhatók a vágatlan review timeline-on. Pótfelvételnél az új anyag a meglévő timeline-hoz kerül.

## [`3d-resolve-review-markers.md`](local-workflows/script-and-cut-workflows/gombaFlow/gomba-2-cut/3d-resolve-review-markers.md)

- [ ] TODO Frissen menti a tényleges klip- és timeline-markereket, a kézi módosításokkal és törlésekkel együtt a `review_timeline_markers.json` fájlba.
- [ ] TODO A markereket a felvételrészekhez és a kapcsolt hanghoz rendeli. A hiányos vagy ütköző jelölést naplózza, a Resolve-markereket érintetlenül hagyja.

## [`3e-resolve-rough-cut-timeline.md`](local-workflows/script-and-cut-workflows/gombaFlow/gomba-2-cut/3e-resolve-rough-cut-timeline.md)

- [ ] TODO A review után újra ellenőrzi, hogy minden szükséges script-részhez tartozik-e klip. Az igazolt hiány döntésig vagy pótlásig megállítja az összeállítást.
- [ ] TODO Új Rough Cut timeline-on a friss piros markerpárok közti képet és hangot tartja meg, mindkét határképkockával. Így maradnak ki a megjelölt korábbi próbálkozások és bemondások.
- [ ] TODO A jóváhagyott `OMIT TAKE` klip kimarad. A bizonytalan vagy jelöletlen rész megmarad sárga review-markerpárral és naplóbejegyzéssel.
- [ ] TODO A megtartott részek script-sorrendbe kerülnek. A talking head a V1/A1, a B-roll a V2/A2 sávra kerül, eredeti hangszinkronnal.
- [ ] TODO A Full Takes megmarad. A mentett Rough Cut határait és hangját visszaellenőrzi, az eredményt a `rough_cut_timeline_cleanup.json` fájlba menti.
