# 4. Ismétlések kivágása — teljes terv

## Cél és bemenet

Készíts teljes vágási tervet az újramondott beszéd korábbi változatairól.
Ebben a lépésben a timeline-t ne módosítsd. A terv az utolsó megfogalmazást
tartsa meg; a korábbi részekből csak azt jelölje kivágásra, amit később
újramondtak. Törlési varázsszó nem szükséges.

Bemenet az eredeti `recording_index.json`, a hivatkozott szóidőbélyeges
átiratok és az elfogadott script. Ezt a tervet Resolve-művelet nélkül készítsd
el. Alkalmazd a scriptből hivatkozott
[vágói szerződést](../gomba-1-script-writer/templates/3-script-template.md).
A bemeneti dokumentumok, eredeti videók és átiratok változatlanok maradnak.

Alkalmazd a [közös problémánapló](../PROBLEM_LOG.md) szabályait.
Tartalmi vagy felvételi sorrendi bizonytalanságnál az érintett ismétléscsoport
minden változata maradjon vágatlanul, a csoport legyen `blocked`, a probléma
kerüljön az `unresolved` listába. A többi csoport elemzését folytasd;
a teljes terv végrehajtási kapuja továbbra is zárva marad.

## Elemzési egység és költségkeret

Egyszerre egy script-ID-t dolgozz fel. Az ID-k sorrendjét a scriptből vedd.
A `recording_index.json` `recordings` listájából válaszd ki az adott ID-hoz
tartozó összes rekordot, majd a rekordok `transcript_path`, `content_start` és
`content_end` mezői alapján olvasd ki a hivatkozott átiratok megfelelő
szóidőbélyeges részeit. Ne olvass be tartalmi elemzésre más script-ID-khez
tartozó beszédet. Ezt az agent a fájlok közvetlen olvasásával végzi; külön
helyi szűrőprogram nem kell.

Az adott ID minden felvételváltozatát együtt vizsgáld, rögzítési sorrendben,
akkor is, ha külön videófájlokban vannak. A cue-bemondásokat hagyd ki a
narráció összevetéséből. Az eredeti szóidőbélyegeket, `recording_id`-t és
forrásazonosítót őrizd meg, hogy a terv forrásidői a későbbi összeállításkor
feloldhatók legyenek. A beszéd nélküli képi részeket tartsd meg tartalmi elemzés
nélkül.
Ehhez nem szükséges klipenként új subagent.

A [parancsszótár](../gomba-1-script-writer/RECORDING_COMMANDS.md) `HIBA újra`
jelzése egyértelművé teszi, hogy közvetlenül előtte lévő beszédrész hibás és
újramondásra szánt. Keresd meg az utána következő újramondást, és annak
illesztéséből határozd meg a korábbi hibás tartomány vágási határát. Ne
követelj szó szerinti egyezést a scripttel. Ha az újramondás vagy a határ nem
azonosítható biztosan, vagy nem követi újramondás, tartsd meg a hibás részt;
ha van újramondás, azt is. Rögzítsd a hiányzó vagy bizonytalan javítást a
közös problémánaplóban, és hagyd a csoportot blokkolva.

## Ellenőrzés és felvételi sorrend

Ellenőrizd az `1.0` bemeneti sémákat, a script és a források tartalomlenyomatait,
valamint a forrásfájlokat és időtartományokat. Resolve-projektet, timeline-t
vagy timeline-klipet ebben a lépésben ne olvass és ne módosíts.

Az ismétléseket egy script-ID-n és cél-timeline-on belül keresd, külön fájlok
között is. Külön script-részek szándékosan ismételt magyarázatát ne vond össze.
Az utolsó változat meghatározásához:

1. Ugyanabban az eredeti fájlban a forrásidő szerinti sorrendet használd.
2. Külön fájloknál olvasd ki a média tényleges rögzítési idejét a metaadatokból,
   például `ffprobe` segítségével. Őrizd meg a felhasznált mezőt, eredeti értékét
   és az időzóna-kezelést. Az eltérő kamerák össze nem hasonlítható óráját vagy
   egymásnak ellentmondó metaadatait ne tekintsd bizonyított sorrendnek.
3. Használható rögzítési metaadat hiányában a felvételi fájlnevek egyértelmű
   sorszámát használd, numerikusan rendezve: 2 megelőzi a 10-et.
   Több számsorozat, egyező sorszám vagy eltérő kamera-számozás esetén ne találgass.
4. Másolási/módosítási dátum, a manifest listája, script-ID vagy klipnévbe tett
   technikai felvételazonosító nem helyettesíti a rögzítési sorrendet.
   Ha egyik elfogadott forrás sem dönt, a közös problémánapló szabályai
   szerint járj el; a pontosítást az elemzés végén kérd.

## Tartalmi összevetés és vágástervezés

1. Csoportonként rögzítési sorrendben dolgozd fel a beszédet. A varázsszavas
   azonosítók nem narrációk, nem vesznek részt az ismétléskeresésben.
2. Minden új megfogalmazást vess össze az addig megtartott beszéddel.
   Ismerd fel a teljes vagy részleges újrakezdést, szó szerinti ismétlést és
   ugyanazt a gondolatot javító átfogalmazást. Eltérő szószám esetén jelentés
   alapján keresd a megfelelést; egy közös szó vagy témabeli hasonlóság önmagában
   nem bizonyít ismétlést.
3. Csak az új változat által ténylegesen megismételt vagy helyettesített korábbi
   tartományt jelöld törlendőnek. A korábbi egyedi mondatkezdet és a máshol
   újra nem mondott érdemi tartalom maradjon meg. A legutolsó helyettesítő
   megfogalmazást ne töröld azért, mert korábban is elhangzott.
4. A következő újrakezdést már az így összeálló megtartott beszédhez illeszd.
   Ismételd addig, amíg a csoport összes újramondását feldolgoztad; a későbbi
   ismétlés korábban már megtartott rész végét is lecserélheti.
5. Ellenőrizd az összeálló szöveg értelmét, nyelvtanát és a vágási csatlakozásokat.
   Csak ténylegesen rögzített beszédet használj; ne írj át átiratot, ne generálj
   hiányzó szavakat, összefoglalót vagy új narrációt. Ha egy rész nem állapítható
   meg ismétlésként, őrizd meg és jelöld a gépi eredményben felülvizsgálandónak.

Kötelező értelmezési példák:

- `12345 345 5` → `12(345) 34(5) 5` → `12345`.
  Az első felvételből `12`, a másodikból `34`, a harmadikból `5` marad.
- „bemutatom a legjobb file tömörítő programot / a legjobb file tömörítő
  alkalmazást” → „bemutatom a legjobb file tömörítő alkalmazást”.
  A korábbi „bemutatom” megmarad, az újramondott folytatás legutolsó változata kerül mellé.

Az elemzéshez használhatod a `normal`, `restart`, `partial_sentence`, `duplicate`,
`filler`, `silence`, `unknown` beszédtípusokat. Ezek leíró címkék, nem önálló
törlési felhatalmazások: töltelékszót, csendet vagy félmondatot ebben a lépésben
csak akkor hagyhatsz ki, ha az igazolt újramondási tartomány része.
A beszédhiány nem ismétlés; B-rollt vagy animációt ne törölj szöveghiány miatt.

## Mentett terv és végrehajtási kapu

Mindig csak az éppen feldolgozott script-ID vágását tervezd meg. Az adott ID
tervét mentsd a jegyzék mappájában lévő `retake_plan.json` fájl `groups`
listájába, majd folytasd a következő ID elemzésével. Ne tarts több ID beszédét
egyidejűleg az elemzési kontextusban. Timeline-t ne módosíts; a teljes tervet
csak az összes csoport elkészülte után add át. A végrehajtás külön, felhasználó
által indított [5. lépésben](5-retake-execution.md) történik.

A terv sémája `1.0`, kötelező mezői:

- `schema_version`, `script_sha256`, `recording_index_sha256`: a pontos
  bemeneti állapot azonosítói.
- `status`: `ready_for_execution` vagy `needs_review`; csak minden csoport
  elkészülte és ellenőrzése után legyen `ready_for_execution`.
- `groups`: script-ID-nként `script_id`, a scriptből átvett timeline-név,
  `status` (`validated` vagy `blocked`), a felvételi sorrend és bizonyítéka,
  valamint az adott ID tervezett döntései. Minden script-ID-hoz legyen csoport.
- Minden törlési döntés: a korábbi rész `recording_id` és szóhivatkozásai,
  az eredeti kivágandó szöveg, a helyette megtartott újabb rész szóhivatkozásai
  és az ismétlési megfelelés indoka.
- Minden csoportban `retained_ranges`: a végeredményben megmaradó forrás-
  tartományok rendezett listája, az eredeti felvétel- és szóhivatkozásokkal;
  a megőrzendő képi részeknél a jegyzék szerinti forrástartománnyal.
- `unresolved`: még tisztázandó tételek.

Az átirat szóidőit oldd fel forrásidőkre. Ellenőrizd az ID-egyezést, a
forrástartományokat, a bizonyított újabb változatot, a törlések átfedéseit,
a megtartási sorrendet és a képi/hang-kivételeket. Resolve-klipkapcsolatot ne
keress és ne tárolj. Hiányzó vagy érvénytelen forráshivatkozásnál ne találgass;
az érintett csoport legyen `blocked`, a teljes terv pedig
`needs_review`.

Csak visszaolvasott és ellenőrzött, minden csoportban `validated` állapotú,
üres `unresolved` listájú terv jelölhető `ready_for_execution` állapotúnak.

A 4. lépés gépi kimenete a teljes `retake_plan.json`; bizonytalanságnál a
hivatkozott közös problémánapló is készül. Resolve-hoz ne nyúlj.
Az elemzés végén a közös problémánapló szerinti egyeztetéssel oldd fel a
bizonytalanságokat, majd frissítsd és ellenőrizd újra a tervet. Feloldatlan
tételnél a terv maradjon `needs_review`; ne add át végrehajthatóként.
Csak `ready_for_execution` tervnél add át a fájl útvonalát, és állj meg.
Mondd ki, hogy a Resolve-projekt és timeline még nem készült el, a terv pedig
nincs végrehajtva. Rövid review-listában emeld ki a kivágandó és megtartott
beszédrészeket, a take-sorrendet és a feloldatlan bizonytalanságokat. A
felhasználói review és külön indítás után indulhat a
[3. timeline-összeállítás](3-timeline-assembly.md); a vágási tervet azután,
újabb külön indításra hajtsa végre az [5. lépés](5-retake-execution.md).
