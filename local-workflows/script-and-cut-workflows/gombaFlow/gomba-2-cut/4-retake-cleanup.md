# 4. Ismétlések kivágása — teljes terv

## Cél és bemenet

Készíts teljes vágási tervet az újramondott beszéd korábbi változatairól.
Ebben a lépésben a timeline-t ne módosítsd. A terv az utolsó megfogalmazást
tartsa meg; a korábbi részekből csak azt jelölje kivágásra, amit később
újramondtak. Törlési varázsszó nem szükséges.

Bemenet a [3. lépés](3-timeline-assembly.md) `completed` állapotú
`timeline_assembly.json` fájlja, az eredeti `recording_index.json`, a hivatkozott
szóidőbélyeges átiratok és az elfogadott script. Alkalmazd a scriptből hivatkozott
[vágói szerződést](../gomba-1-script-writer/templates/3-script-template.md).
A bemeneti dokumentumok, eredeti videók és átiratok változatlanok maradnak.

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
narráció összevetéséből. Az eredeti szóidőbélyegeket és a `recording_id`
kapcsolatot őrizd meg, hogy a vágási tervet a megfelelő timeline-klipre tudd
alkalmazni. A beszéd nélküli képi részeket tartsd meg tartalmi elemzés nélkül.
Ehhez nem szükséges klipenként új subagent.

## Ellenőrzés és felvételi sorrend

Ellenőrizd az `1.0` bemeneti sémákat, a script és a források tartalomlenyomatait,
a projekt azonosságát és a timeline-klipkapcsolatokat. Olvasd vissza az aktuális
timeline-t; ha az eltér a 3. lépés rögzített eredményétől, ne alkalmazz elavult
pozíciókra tervet. Jelezd az eltérést, és várj tisztázásra. Nem dokumentált
kézi vágások automatikus visszafejtése nem része ennek a lépésnek.

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
   Ha egyik elfogadott forrás sem dönt, a kérdéses ismétléscsoporthoz kérj
   közérthető pontosítást; addig minden változata maradjon meg.

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

- `schema_version`, `project_id`, `script_sha256`, `recording_index_sha256`,
  `timeline_assembly_sha256`: a pontos bemeneti állapot azonosítói.
- `status`: `ready_for_execution` vagy `needs_review`; csak minden csoport
  elkészülte és ellenőrzése után legyen `ready_for_execution`.
- `groups`: script-ID-nként `script_id`, `timeline_id`, `status` (`validated`
  vagy `blocked`), a timeline kiinduló állapotának lenyomata, a felvételi
  sorrend és bizonyítéka, valamint az adott ID tervezett döntései. Minden
  timeline-on szereplő script-ID-hoz legyen egy csoport.
- Minden törlési döntés: a korábbi rész `recording_id` és szóhivatkozásai,
  az eredeti kivágandó szöveg, a helyette megtartott újabb rész szóhivatkozásai
  és az ismétlési megfelelés indoka.
- Minden csoportban `retained_ranges`: a végeredményben megmaradó tartományok
  rendezett listája, az eredeti felvétel- és szóhivatkozásokkal; a megőrzendő
  képi részeknél a jegyzék szerinti forrástartománnyal.
- `unresolved`: még tisztázandó tételek.

A tervbe írt szóhivatkozásokat az átirat szóidőiből oldd fel forrásidőkre és
tényleges timeline-klippekre. Ellenőrizd az ID-egyezést, a forrástartományokat,
a bizonyított újabb változatot, a törlések átfedéseit, a megtartási sorrendet és
a képi/hang-kivételeket. A terv tartalmazza a feloldott forrásidőket és a
klippéldány-hivatkozásokat is. Hiányzó vagy érvénytelen hivatkozásnál ne
találgass; az érintett csoport legyen `blocked`, a teljes terv pedig
`needs_review`.

Csak visszaolvasott és ellenőrzött, minden csoportban `validated` állapotú,
üres `unresolved` listájú terv jelölhető `ready_for_execution` állapotúnak.

A 4. lépés kimenete kizárólag a teljes `retake_plan.json`; a timeline-hoz nem
nyúl. A terv elkészülte után add át a fájl útvonalát, és várd meg, amíg a
felhasználó külön elindítja az 5. lépést.
