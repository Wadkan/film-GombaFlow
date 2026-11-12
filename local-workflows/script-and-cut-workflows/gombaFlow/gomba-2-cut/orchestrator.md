---
name: gomba-2-cut-orchestrator
description: "A Gomba 2 vágási workflow user által indított szakaszának vezérlése fájlalapú folytatással és review-kapukkal."
---

# Gomba 2 orchestrator

## Saját végrehajtási sorrend

1. Olvasd el a [workflow](WORKFLOW.md) „Feldolgozási lépések”, „Közös
   szerződés”, „Közös visszatérési státuszok” és „Fájlos állapotátvétel” részeit.
   A hívások, fázisok, kapuk és státuszok egyetlen forrása ez az index.
2. Azonosítsd a kért szakaszt és a célt. Folytatáskor a mentett állapotból
   határozd meg a végrehajtási helyet az alábbi folytatási szabály szerint.
   Hiányzó bemenetet kérj be; az indítás nem jelent későbbi review-jóváhagyást.
3. A recept aktuális lépésénél olvasd el annak workflow-bejegyzését,
   készítsd elő a hívást, és mentsd/visszaolvasd a futásmutatót, ha már van
   scriptválasztás. Egy időben egy lépés fusson.
4. Végeztess el egy lépést vagy fázist elkülönített végrehajtóval az alábbi
   szerződés szerint. A státuszt a workflow szerint értelmezd, az alábbi
   futásállapot-kezelés szerint mentsd. Csak a workflow-ban engedélyezett
   következő lépést indítsd.
5. Megálláskor zárd le a futást az itt rögzített megállási okkal és rövid userjelzéssel.
   Ne hagyj futó végrehajtót vagy háttérben várakozó ciklust.

## Indítható szakaszok

A user megadja a szakaszt és a célt; a szakasz a kérésből is egyértelműen
azonosítható. Hiányzó vagy
többértelmű választásnál pontosítást kell kérni, nem a legutóbbi fájlból dönteni.
Egy futás egy szakaszt végez, a végén visszaadja a vezérlést a usernek.

### Előkészítés — `prepare`

- Bemenet új feldolgozásnál a felvételmappa. Folytatásnál konkrét manifest,
  jegyzék vagy scriptmappa is megadható a lent rögzített folytatási szabállyal.
- Az 1–4. számozott lépést végzi. A scriptválasztási kaput a preflight
  hívása előtt alkalmazza a workflow „Scriptválasztási kapu” része szerint.
- Kész terv után mindig teljes megállás (`plan_review`). Röviden jelezd a
  `retake_plan.json` útvonalát, a terv átnézését és azt, hogy a folytatáshoz
  külön a `review` szakaszt vagy a timeline-összeállítást kell indítani.
  Resolve-projekt ekkor még nem készül, és a terv nincs végrehajtva.

### Review timeline — `review`

- Bemenet az egyértelmű scriptmappa vagy `cut_workflow_state.json`, valamint
  a terv átnézése utáni külön userindítás. A terv megléte nem indítás.
- Az 5. számozott workflow-lépés teljes receptjét hajtja végre.
- A timeline elkészülte után teljes megállás (`timeline_review`). A user
  Resolve-ban nézze át a timeline-t és módosítsa a markereket, ha szükséges.
  Jelezd a timeline nevét, az eredményfájlt és azt, hogy review után külön a
  `rough-cut` szakaszt vagy a Rough Cut-összeállítást kell indítania.
  Az utolsó visszaellenőrzés nem lépheti át ezt a kaput.

### Rough Cut — `rough-cut`

- Bemenet az egyértelmű scriptmappa vagy `cut_workflow_state.json`, valamint
  a timeline-review utáni külön userindítás. A usernek markerkiolvasót nem kell indítania.
- A 6–7. számozott workflow-lépés teljes receptjét hajtja végre. A belső
  markerkiolvasáshoz nem kér újabb engedélyt a szakasz indításán túl.
- Siker után a futás véget ér (`completed`). Röviden jelezd az eredményfájlt
  és szükség esetén a napló alapján szükséges kézi vágást; új szakaszt ne indíts.

## Végrehajtó hívása

A környezet ténylegesen elérhető elkülönített agent-/skillvégrehajtóját
használd, friss kontextussal, a teljes szülőbeszélgetés örökítése nélkül.
A workflow-ban fázisokra bontott receptet fázisonként vezéreld; a fázis helyett
ne hívd meg még egyszer a teljes szülőskillt. A fázisokra nem bontott,
belső hívásokat tartalmazó skill teljes hívásként fut. Ha nincs ilyen
végrehajtási lehetőség, jelezd
a környezeti akadályt, és alkalmazd a workflow hibamegállását; ne állítsd,
hogy elkülönítetten futtattál egy skillt.

Egy hívás csak ezeket kapja:

- az aktuális skill Markdown-fájljának és a workflow-nak az útvonalát;
- az aktuális lépést/fázist és a rá vonatkozó workflow-részek megnevezését;
- a konkrét bemeneti útvonalakat, a már kiválasztott célt és az aktuális
  userkérésből az ehhez szükséges döntést vagy folytatási célt;
- azt az utasítást, hogy a saját részletes bemeneteit fájlból olvassa,
  a saját eredményeit oda mentse, és a hívónak csak a workflow-státuszt adja vissza.

A szükséges userkérdést vagy rövid tájékoztatást a workflow közös kommunikációs
szabálya szerint juttasd el. Interaktív lépés saját felhasználói kontextusban
is végrehajtható, ha az elkülönített végrehajtó nem tud közvetlenül kérdezni;
a tartalmi elemzés ettől még ne kerüljön az orchestrator kontextusába.

## Kontextus és mentés

Csak a célútvonalakat, a szakaszt, az aktuális lépést, a visszatérési státuszt
és a szükséges kis vezérlési mezőket tartsd az orchestrator kontextusában.
A mentett fájlokból célzottan a választási, készültségi és hibaállapotot
olvasd; az átiratot, a vágási döntéseket, klip- és markerlistákat a végrehajtó
dolgozza fel. Ne kérj tőle összefoglalót, eredményobjektumot vagy teljes naplót.

A feladat végén a hívónak csak a workflow szerinti összesített státuszt
add vissza, a usernek szóló rövid jelzést ettől külön küldd el.

## Futásállapot és folytatás

A meglévő `<scriptmappa>/cut_workflow_state.json` fájl `orchestration`
mezője csak az aktuális végrehajtási helyet tárolja:

- `stage`: a fenti szakaszazonosító.
- `step`: az aktuális skill `name` értéke; fázisnál `/prepare`, `/verify`
  vagy `/build` utótaggal. Csak az adott szakasz receptjében szereplő lépés lehet.
- `input_paths`: az aktuális feldolgozás kis útvonalobjektuma:
  `recording_dir` és `manifest_path`, abszolút útvonal vagy `null`, ha nem
  alkalmazható. Pótfelvételnél az új mappát és manifestet jelenti, nem az
  eredeti batchét. A még el nem készült manifest útvonala nem sikerbizonyíték.
- `last_status`: a lépés közös visszatérési státusza, indítás előtt `null`.
- `has_issues`: logikai érték; az aktuális szakaszban már dokumentált
  nem blokkoló probléma volt-e. Nem tartalmazza a problémák másolatát.
- `stop_reason`: futás közben `null`; megálláskor `skill_blocked`,
  `invalid_status`, `interrupted`, `plan_review`, `timeline_review` vagy `completed`.

Csak az orchestrator írja ezt a mezőt. A belső végrehajtók a saját kimenetüket
mentik, a futásmutatót megőrzik. Az orchestrator ezért fázisonként vezérli az
összetett hívásokat; a közvetlen, teljes skillhívás ugyanazt a receptet követi,
de nem állítja át egy korábbi orchestratorfutás mutatóját.

Az első sikeres preflight előtt a futás helye csak az aktuális hívásban ismert.
Ha a cél-scriptnek már van ellenőrzött állapotfájlja, az új szakasz elejétől
mentsd a futásmutatót és az aktuális `input_paths` értékét is. A korábbi batch
útvonalával ne írd felül egy megkezdett pótfelvételi menet bemenetét.
A választás előtt nincs scriptmappához kötött futásállapot. Ha ekkor szakad
meg a futás, a user a manifesttel és szükség esetén a céllal indíthatja újra;
a választást nem szabad régi chatből vagy állapotfájlok versenyeztetéséből kitalálni.
Az addigi lépések összesített problémajelzését a hívó vigye tovább a
`has_issues` kezdeti értékébe. Az első mentett futásmutatót csak a választási
állapot sikeres visszaolvasása után hozza létre; a preflightot emiatt ne ismételje meg.
Utána minden lépés indítása előtt mentsd és olvasd vissza az aktuális
`stage`, `step`, `last_status: null`, `stop_reason: null` állapotot, a szakasz
`has_issues` értékének megőrzésével. Csak ezután hívd a végrehajtót. A válasz
után az állapotfájlt újra olvasd be, hogy a végrehajtó mentett mezőit ne írd
felül egy korábbi példánnyal; mentsd a státuszt és az esetleges megállási okot,
majd olvasd vissza. Mentési hiba esetén ne indíts következő lépést.
`COMPLETED_WITH_ISSUES` után a `has_issues` igaz marad. Szakaszvégén a mutató
az utolsó lépésen marad a megfelelő megállási okkal; következő szakaszt nem
ütemez előre. Új, külön indított szakasz `has_issues` értéke `false`-ról indul.

`BLOCKED` után `skill_blocked`, hibás vagy hiányzó válasznál `invalid_status`
kerüljön a megállási okba; utóbbinál a mentett `last_status` legyen `BLOCKED`,
ne az érvénytelen válasz. Ha a hívás megszakadt és a státusz `null` maradt,
folytatáskor `interrupted` állapotot rögzíts; ne tekintsd a lépést késznek.
Az ok részleteit a meglévő kimenet vagy problémalista tartalmazza. Ha maga
az állapot nem menthető, a usernek ezt jelezd; ne állítsd, hogy sikerült naplózni.

Folytatást csak új userkérésre indíts. Olvasd vissza az állapotot, az aktuális
lépéshez szükséges kimenetek metaadatait és az érintett mentett userdöntéseket.
A végrehajtó ellenőrzi a teljes bemeneteket és szükség esetén a függő
tranzakciókat; a futásmutató önmagában nem készültségi bizonyíték.
Az `orchestration` hiánya vagy `null` értéke nem hiba: ilyenkor csak a user
által egyértelműen megadott belépési pontból indulj, a meglévő bemenetek
ellenőrzése után. Nem null mezőnél minden felsorolt mezőt, típust és a
recepthez tartozást ellenőrizd; sérült mutatót ne nullázz automatikusan.
Korábbi mutatóban az `input_paths` hiánya megengedett, de csak akkor
folytass, ha az aktuális kérés vagy a skill saját mentett folytatási állapota
egyértelműen megadja a szükséges bemenetet. Különben kérj útvonalat;
ne válaszd automatikusan a régi index eredeti manifestjét.
Sikeres utolsó státusz és `stop_reason: null` esetén a recept következő
lépése folytatható annak saját előfeltételeivel; a kész lépést ne játszd újra.
Ha ez már a szakasz utolsó lépése volt, csak a szakaszvégi megállást mentsd;
a mentés előtti megszakítás nem engedélyezi a következő szakasz elindítását.
Az alábbi Rough Cut-kivétel ilyenkor is érvényes.

- Kész manifestnél a státuszokból és a hozzárendelések készültségéből,
  átiratszöveg olvasása nélkül válassz: függő userazonosításnál az átírási
  skill saját azonosítási folytatása, teljes eredménynél a jegyzékkészítés
  következik. A kész manifest önmagában nem igazolja az azonosítás lezárását.
- Kész indexszel a scriptválasztási kapu és a preflight lehet a belépés;
  meglévő tervhez is érvényes scriptválasztás szükséges. Jelzett
  azonosítójavításnál a workflow javítási útvonalát kövesd. A megadott kész
  bemenetet a fogadó skill ellenőrzi; meglévő átiratot vagy jegyzéket ne
  készíts újra automatikusan. Bizonytalan belépési pontnál kérj pontosítást.
- Függő hiánydöntést, azonosítójavítást és pótfelvételt az érintett skill
  mentett állapotából folytass, a korábbi döntéseket megőrizve. A workflow
  javítási és pótfelvételi útvonalainak kapui ilyenkor is érvényesek.
  Review utáni kész pótfelvételnél az előkészítési szakaszt indítsd az új
  mappával, a kiválasztott scripttel és a markerpillanatkép mentett döntésével;
  a review utáni hiánydöntést ne másold a tervbe. A későbbi review-kapuk
  megmaradnak. Ez a belépés elsőbbséget élvez a régi futásmutatóval szemben;
  ez sem review-jóváhagyás, sem technikai hibára adott újrapróbálási engedély.
- Idempotens, fájlalapú lépés csak saját folytatási szabálya szerint indulhat
  újra. Részleges médiaimport a Media Pool visszaellenőrzésével folytatható;
  bizonytalan vagy részleges timeline-építés kézi egyeztetést igényel.
  Nem szabad a futásmutatót előreléptetni pusztán egy kimeneti fájl megléte miatt.
- Megszakított vagy blokkolt Rough Cut-hívás folytatásakor a teljes összetett
  hívást az elejéről kezdd, új markerkiolvasással. Meglévő részleges Rough Cut
  vagy eredményfájl esetén előbb az újrafuttatási kapu következik.
- `plan_review` vagy `timeline_review` után a „folytasd” önmagában nem
  review-jóváhagyás. A user egyértelműen indítsa a következő szakaszt a
  review után. Kész eredmény esetén ne ismételd meg a lezárt szakaszt.

Az orchestrator nem pótolja az állapotot a beszélgetés emlékezetéből,
nem ad saját felmentést kapu alól, és nem indít automatikus hibajavító ciklust.
