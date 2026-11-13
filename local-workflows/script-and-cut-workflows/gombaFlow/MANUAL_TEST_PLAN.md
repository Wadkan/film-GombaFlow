# GombaFlow — MVP manuális tesztterv

Cél: egy egyszerű témát végigvinni az ötletgyűjtéstől a Resolve Rough Cutig.
A fő ellenőrzés a tényleges Resolve-timeline, lejátszással és képkockánkénti
átnézéssel; a JSON-fájlok megléte önmagában nem siker.

Állapot: **TODO — még nem futtatott terv.** Csak sikeresen ellenőrzött pontot pipálj ki.
Hibánál a pont maradjon nyitva; az eredményt és a következő teendőt lent rögzítsd.

## 1. Előkészítés és egyetlen teszteset

- [ ] Válassz a Gomba 0 eredményéből egy könnyen bemutatható témát, például egy egyszerű API-hívást és válaszának megjelenítését. Egy téma, egy scriptprojekt, egy Resolve-tesztprojekt legyen.
- [ ] A Gomba 1-ben rövid magyar script készüljön, a kötelező fejezetek megtartásával. A demó egy bemenettel és egy látható eredménnyel működjön.
- [ ] Rögzítsd a tesztadatokat: scriptmappa, felvételmappa, topic-ID, Resolve-projektnév és Resolve-verzió. A projektazonosítót a registry ossza ki; ne találj ki külön teszt-ID-t.
- [ ] Ellenőrizd a transcript CLI függőségeit a gyökér `cli-commands.md` alapján, valamint a Resolve-kapcsolat működését. A teszt külön Resolve-projektben fusson.
- [ ] Készíts rövid felvételt minden szükséges script-részhez; összesen néhány perc elég. A scriptben szereplő varázsszót és `timeline … script …` bemondásokat használd.
- [ ] Egy talking head résznél mondj szándékosan hibás értéket, majd `[varázsszó] HIBA újra [varázsszó]` után mondd újra helyesen a teljes érintett mondatot, ugyanazzal a script-ID-val.
- [ ] Legyen egy rövid `b-roll` képernyőfelvétel saját script-ID-val, látható művelettel és hallható teszthanggal. Így a külön kép- és hangsáv is ellenőrizhető.
- [ ] Legalább két script-részt a nézői sorrendhez képest fordított sorrendben vegyél fel. Jegyezd fel a felvételi sorrendet és az elvárt végső sorrendet.

## 2. Gomba 0–1 — rövid teljesfolyamat-próba

A hivatkozott lépésfájlok szerint haladj; a Gomba 1 jóváhagyási kapuit tartsd meg.

- [ ] **[gomba-0-idea-collector](gomba-0-idea-collector/WORKFLOW.md):** külön eredményfájl készül; a kiválasztott videó YouTube-forrása, dátuma, nézettsége, hossza és reprodukálhatósága ellenőrizhető, megfelel a workflow szűrőinek.
- [ ] **[0-idea-intake](gomba-1-script-writer/0-idea-intake.md):** a `make gomba1-transcript` után a kiválasztott videóhoz tartozó `source-transcript.md` és `0-brief.md` készül; a registry és az ötletbe írt topic-ID egyezik. A briefet fogadd el.
- [ ] **[1-story-hook](gomba-1-script-writer/1-story-hook.md):** elkészül az `1-story.md`, `1-thumbnail-prompt.md` és `1-outline-hyperframes-brief.md`; a cím, hook és outline ugyanazt az egyszerű demót ígéri.
- [ ] **[2-chapter-planning](gomba-1-script-writer/2-chapter-planning.md):** a `2-chapters.md` tartalmazza a kötelező szerkezetet és a demó elvárt eredményét.
- [ ] **[3a-script-writing](gomba-1-script-writer/3a-script-writing.md):** a `3-script.md` követhető; a script-ID-k egyediek, a bemondások és kliptípusok helyesek, a vágói átadás teljes.
- [ ] **[4-script-review](gomba-1-script-writer/4-script-review.md):** a `4-review.md` megfelelt döntést ad; javítás esetén az érintett lépést és review-t újra elvégzed. A végleges scriptet fogadd el.
- [ ] **[5-shoot-preparation](gomba-1-script-writer/5-shoot-preparation.md):** az `5-preparation.md` alapján a demó és a felvétel előkészíthető; a tényleges demópróba sikerül. Ezután készítsd el az 1. pont felvételeit.

## 3. Gomba 2 — előkészítés, Resolve-módosítás nélkül

Indítsd a [gomba-2-cut-orchestrator](gomba-2-cut/orchestrator.md) `prepare`
szakaszát a teszt felvételmappájával. A belső skilleket ne indítsd el mellé külön.

- [ ] **[1-transcription](gomba-2-cut/1-transcription.md):** a `transcripts/master_transcript.json` minden videót felsorol; a szóidőbélyeges átiratban az azonosítók, hibajelzés és javított mondat visszakereshetők.
- [ ] **[2-recording-index](gomba-2-cut/2-recording-index.md):** a megfelelő scriptmappában készül `recording_index.json`; minden szükséges script-részhez a helyes forrás és kliptípus tartozik, az újramondás sem vész el.
- [ ] **[0-preflight](gomba-2-cut/0-preflight.md):** a `cut_workflow_state.json` a teszt scriptjére és jegyzékére mutat; Resolve-projektet még nem választ vagy hoz létre.
- [ ] **[2a-retake-plan](gomba-2-cut/2a-retake-plan.md):** a `retake_plan.json` `1.1` sémájú, teljes lefedettségű és `ready_for_execution`; a hibás mondat helyett a javítottat tartaná meg. A B-roll képe és hangja megmarad.
- [ ] **Orchestrator-kapu:** kész terv után `plan_review` megállás történik. Nézd át a tervet; Resolve-timeline még nincs, a `review` szakasz csak külön indításodra indul.

## 4. Resolve — első, teljes review timeline

A terv átnézése után külön indítsd a `review` szakaszt.

- [ ] **[3-timeline-assembly](gomba-2-cut/3-timeline-assembly.md), prepare:** a választott tesztprojekt neve és visszaolvasott azonosítója kerül az állapotfájlba; a belső sorrend `3a → 3b → 3c → verify`.
- [ ] **[3a-resolve-media-import](gomba-2-cut/3a-resolve-media-import.md):** minden forrás egyszer szerepel a Media Poolban, online és lejátszható; a `media_import` mentett állapota teljes.
- [ ] **[3b-resolve-media-registry](gomba-2-cut/3b-resolve-media-registry.md):** a `review_timeline_resolve_media_registry.json` forrásútvonalai, Media Pool-ID-i és FPS-adatai a tényleges médiához tartoznak.
- [ ] **[3c-resolve-review-timeline](gomba-2-cut/3c-resolve-review-timeline.md):** létrejön a `<topic_id> - 1. Full Takes - Marker Review`; a teljes felvételek felvételi sorrendben szerepelnek, a hibás mondat, bemondások és újramondás még megvannak.
- [ ] **3c, kép–hang:** a kapcsolt kép és hang szinkronban van; a B-roll képe és eredeti hangja külön sávokon van a talking headhez képest, a hang hallható és változatlan.
- [ ] **3c, markerek:** a videoklipek piros `KEEP IN` / `KEEP OUT`, sárga review-pár vagy igazolt teljes kihagyásnál sárga `OMIT TAKE` jelölést kapnak. A piros pár a javított mondatot határolja; a zárómarker az utolsó megtartandó képkockán áll.
- [ ] **3-timeline-assembly, verify:** a `review_timeline_assembly.json` tényleges projekt-, timeline- és klipazonosítókat tartalmaz, az összeállítás teljes; az orchestrator `timeline_review` kapunál megáll, Rough Cut még nincs.

## 5. Kézi marker-review és Resolve Rough Cut — fő teszt

- [ ] A review timeline-on egy jól látható, nem beszédközepi piros markerhatárt mozdíts el néhány képkockával. Jegyezd fel a pontos új kezdő és utolsó képkockát; ez igazolja, hogy a Rough Cut a kézi review-t követi.
- [ ] Egy másik rövid klipről távolítsd el a vágási markereket. Elvárt eredmény: a teljes kép–hang egység megmarad kézi review-ra, nem törlődik.
- [ ] A timeline átnézése után külön indítsd az orchestrator `rough-cut` szakaszát; a belső sorrend `3e prepare → 3d → 3e build`, külön markerkiolvasó-indítás nélkül.
- [ ] **[3d-resolve-review-markers](gomba-2-cut/3d-resolve-review-markers.md):** a friss `review_timeline_markers.json` tartalmazza az elmozdított marker helyét és a jelöletlen klip bizonytalanságát; a projekt- és timeline-ID egyezik. A kiolvasás nem változtatja meg a review timeline-t.
- [ ] **[3e-resolve-rough-cut-timeline](gomba-2-cut/3e-resolve-rough-cut-timeline.md), sorrend:** létrejön a `<topic_id> - 2. Rough Cut`; az első timeline változatlan marad, a második script szerinti sorrendben épül fel, a fordítva felvett részek is a helyükre kerülnek.
- [ ] **3e, vágás:** a pirosan jelölt résznél csak a javított mondat marad; a hibás próbálkozás, hibajelzés és azonosítóbemondás eltűnik az egyértelműen vágható talking head részből. A kézzel módosított határ érvényesül az eredeti terv helyett.
- [ ] **3e, képkockahatár:** léptess az ellenőrzött vágás első és utolsó képkockájára. Mindkét marker alatti kép megmarad, a tartományon kívüli szomszédos kép kimarad; nincs egyképkockás csonkolás vagy ráhagyás.
- [ ] **3e, megőrzés:** a jelöletlen klip teljesen megmarad kapcsolt hangjával, sárga `REVIEW START` / `REVIEW END` párral; a scriptmappa `problems.md` fájljában a megfelelő forrásra és timeline-ra hivatkozó kézi vágási teendő szerepel.
- [ ] **3e, lejátszás és mentés:** hallgasd és nézd végig a teljes Rough Cutot. A vágott mondatok érthetők, a kép–hang szinkron és a B-roll külön sávjai megmaradnak. Mentés és a projekt újranyitása után ugyanaz a két timeline és vágás látszik.
- [ ] **3e, átadás:** a `rough_cut_timeline_cleanup.json` `1.1` sémájú, `completed` állapotú, a tényleges klipekre mutat; a jelöletlen klip problémája dokumentált. Az orchestrator `COMPLETED_WITH_ISSUES` eredménnyel és `completed` megállási okkal zár.

## 6. Rövid újraindítási próba és lezárás

- [ ] A kész Rough Cutra ugyanazzal a céllal indíts új összeállítást, felülírás engedélyezése nélkül: álljon meg újrafuttatási döntésre, ne duplikáljon, ne írjon felül és ne importálja újra a médiát.
- [ ] Ellenőrizd, hogy az eredeti videók és átiratok változatlanok, és a teszt nem érintett más Resolve-projektet.
- [ ] **PASS:** minden fenti pont teljesült, a szándékosan jelöletlen klip megőrzése és naplózása is. A kézi vágási teendő elvárt teszteredmény; technikai hiba vagy váratlan anyagvesztés esetén **FAIL**.

MVP-határ: egyetlen projekt és egy végigfutás. Több témás batch, pótfelvételi
folytatás, eltérő FPS-ek mátrixa, export, címgrafika és képelhelyezés külön kör.

## Futási jegyzet — TODO

- Dátum / tesztelő: TODO
- Scriptmappa / felvételmappa / topic-ID: TODO
- Resolve-verzió / projektnév / projekt-ID: TODO
- Felvételi sorrend → elvárt script-sorrend: TODO
- Módosított marker: klip, eredeti hely → új hely: TODO
- Jelöletlen tesztklip: TODO
- Eredmény: TODO — PASS / FAIL
- Hiba vagy következő teendő: TODO — skill, forrás/klip, elvárt és tényleges működés, bizonyíték útvonala.
