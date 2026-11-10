---
name: 2a-retake-plan
description: "A korábbi ismétlésekhez végrehajtható kivágási terv készítése a szóidőbélyeges átiratok és az elfogadott script alapján."
---

# 2a. Ismétlések kivágási terve

## Cél és bemenet

Készíts teljes vágási tervet az újramondott beszéd korábbi változatairól.
Ebben a lépésben a timeline-t ne módosítsd. A terv az utolsó megfogalmazást
tartsa meg; a korábbi részekből csak azt jelölje kivágásra, amit később
újramondtak. Törlési varázsszó nem szükséges.

Bemenet az eredeti `recording_index.json`, a hivatkozott szóidőbélyeges
átiratok és az elfogadott script. Ezt a tervet Resolve-művelet nélkül készítsd
el. Alkalmazd a scriptből hivatkozott
[vágói szerződést](../gomba-1-script-writer/templates/3-script-template.md).
Az eredeti videók és átiratok változatlanok maradnak. A felvételi jegyzéket
csak a felhasználó által jelzett pótfelvétellel, az alábbi folytatásban bővítsd.

Alkalmazd a [közös problémánapló](../PROBLEM_LOG.md) szabályait.
Tartalmi vagy felvételi sorrendi bizonytalanságnál az érintett ismétléscsoport
minden változata maradjon vágatlanul. A csoportot jelöld kézi vágásra, és a
problémát vedd fel az `unresolved` listába. A többi csoport elemzését folytasd;
ez a bizonytalanság ne akadályozza a terv végrehajtását, és ne kérj hozzá
azonnali felhasználói döntést.

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
ha van újramondás, azt is. A teljes érintett ismétléscsoport maradjon vágatlanul;
a hiányzó vagy bizonytalan javítást rögzítsd a közös problémánaplóban és
jelöld kézi vágásra.

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
   Ha egyik elfogadott forrás sem dönt, minden változat maradjon vágatlanul;
   az index szerinti sorrendet használd ideiglenesen, jelöld
   `provisional_index_order` értékkel, és rögzítsd a bizonytalanságot.

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

## Hiányzó felvételrészek ellenőrzése

Az ismétlések tervezése után, a terv végrehajthatónak jelölése előtt:

1. A `recording_index.json` `script_parts` listáján a script sorrendjében haladj
   végig. Ellenőrizd, hogy minden script-ID-hoz van-e azonosított felvétel.
   Egy felvételt nem helyettesít a scriptben szereplő leírás. Ha egy
   azonosítatlan vagy `needs_review` tartomány hozzátartozhat, ne állítsd
   bizonyítottnak a hiányt; jelöld azonosításra várónak. Egyértelműen hiányzó
   felvételnél az adott csoport a döntésig `blocked`, `retained_ranges` listája
   üres; ne találj ki forrást vagy szóidőt.
2. A felvett `talking head` részek `<narration>` szövegét vesd össze a terv
   szerint megtartandó szóidőbélyeges átiratrészekkel. Az átfogalmazott,
   azonos jelentésű mondat megfelel; szó szerinti egyezést ne követelj.
   Ha egy teljes scriptmondat hiányzik, rögzítsd a script-ID-ját és a scriptben
   szereplő pontos szövegét. A képi, beszéd nélkül felvett részeknél csak a
   felvétel meglétét vizsgáld; a narráció hiánya nem hiba.
3. A teljesen hiányzó felvételeket és mondatokat a script saját `problems.md`
   fájljának a közös problémánapló szerinti hiányzó felvételrészek címe alá
   írd, script-ID-val kezdődő tételekben. Minden hiányhoz azonnal oszd ki és
   írd a folytatási szabály szerinti stabil `H1`, `H2`, … azonosítót is.
   Teljesen hiányzó talking head résznél
   a script felolvasandó szövegét idézd szó szerint; képi résznél a kapcsolódó
   `screen-action` szövegét. A nem megbízható átirat miatti bizonytalanságot
   `ellenőrizendő` jelzéssel különböztesd meg a hiányzóként azonosított résztől;
   önmagában emiatt ne blokkolj, az érintett csoport minden felvételét tartsd
   meg és `manual_review_required: true` értékkel jelöld kézi review-ra. Az
   érintett csoport korábbi törlési döntéseit vesd el, és a `retained_ranges`
   listába minden felvétel teljes `source_start`–`source_end` tartományát írd,
   az azonosítóbemondással együtt. Így a review timeline megőrizheti a teljes
   bizonytalan felvételt.
4. Gyűjtsd össze az összes hiányt a terv `missing_items` listájába ugyanazzal
   a hiányazonosítóval, `awaiting_decision` állapottal, majd a terv legyen
   `needs_review`. A chatben
   csak a hibafájl útvonalát és a döntés szükségességét jelezd; a hiányzó ID-kat
   és szövegeket kizárólag a fájlban listázd. A felhasználó részenként dönthet
   a kihagyásról vagy új felvételről; az átirat hibáját is jelezheti.
5. A felhasználó döntését a problémánapló szabályai szerint rögzítsd. Kihagyás
   esetén a terv `approved_omissions` listájában őrizd meg a hiányazonosítót,
   a script-ID-t, a kihagyott scriptbeli szöveget és a döntés hivatkozását. Teljes script-rész
   kihagyásánál a csoport `validated`, a felvételi sorrend és `retained_ranges`
   listája üres, sorrendi bizonyítéka `null`, `manual_review_required` értéke
   `false`. Új felvétel esetén a terv maradjon
   `needs_review`, amíg az új átirat és frissített jegyzék alapján az érintett
   részt újra nem ellenőrizted. A megváltozott jegyzéklenyomattal készíts
   aktuális tervet. Átirathiba esetén ne módosítsd az eredeti átiratot, és ne
   generálj beszédet; a nem biztosan vágható felvétel maradjon meg kézi review-ra.

Az ismétlésvágás tartalmi bizonytalansága továbbra sem blokkolja a tervet, ha
az érintett felvételek teljesen megmaradnak. A hiányzó felvételrész miatti
felhasználói döntés külön végrehajtási feltétel.

## Folytatás hiányzó felvétel után

A skill újraindításakor először olvasd be a meglévő `retake_plan.json` fájlt.
Ha annak állapota `needs_review`, a `missing_items` alapján folytasd; ne kezdd
újra a kész csoportokat, és ne kérdezd újra a már rögzített döntéseket.
Először oldd fel az esetleges `pending_index_update` állapotot az alábbi
szabály szerint, majd ellenőrizd a script és a jegyzék lenyomatát; váratlan
eltérésnél állj meg és jelezz.

Korábbi `1.1` tervnél, ha még nincs `missing_items`, a `problems.md` és a terv
hiánytételeiből egyértelműen azonosítható hiányokhoz készíts állapotot, a már
rögzített döntések megőrzésével. Ha a tétel vagy döntés nem azonosítható
egyértelműen, jelezd az akadályt, ne találgass. Hiány nélkül a lista üres.

- Hiányonként adj stabil `H1`, `H2`, … azonosítót, amelyet későbbi futásokban
  ne változtass meg vagy használj fel más hiányhoz; a már lezárt tételek ID-ja
  sem használható újra. A `problems.md` tétele a
  script-ID-val kezdődjön, és tartalmazza a hiányazonosítót és a pontos szöveget.
- Egy válasz több hiányra is vonatkozhat. Kihagyáskor rögzítsd az
  `approved_omissions` bejegyzést és a hiány `omitted` állapotát. Az „újra
  felveszem” döntés `awaiting_recording`; ha a felhasználó megadja a kész
  pótfelvétel külön mappáját, `recording_received`, a mappa útvonalával.
  A döntéseket a problémánaplóba is jegyezd be, és a tervet az átírás előtt
  mentsd el.
- A már kész pótfelvételeket a többi hiány döntésétől függetlenül dolgozd fel.
  Ha ezután egy hiány még döntésre vagy felvételre vár, mentsd a tervet
  `needs_review` állapottal, a chatben csak a problémalista útvonalát és a
  szükséges következő lépést jelezd, majd várj.
- A megadott külön mappát a meglévő [átírással](1-transcription.md) dolgozd fel,
  majd mentsd a létrejött manifest útvonalát és a `transcribed` állapotot. Ha
  a feldolgozás megszakadt, a már létező manifestet csak akkor használd újra,
  ha a mappa, forrásútvonalak és forráshashek alapján igazolhatóan ehhez a
  pótfelvételhez tartozik. Meglévő átiratot ne írj felül.
- A [jegyzékkészítés](2-recording-index.md) pótfelvételi lépésével csak az új
  rekordokat add a kiválasztott script jegyzékéhez. Ha a manifest és az
  ellenőrzött forrásai már szerepelnek a jegyzékben, ne fűzd hozzá újra; folytasd
  az érintett hiányok újraellenőrzésével. A jegyzék mentése előtt
  ments `pending_index_update` állapotot a tervbe a régi és a tervezett új
  jegyzék-SHA-256-tal és a manifest útvonalával; a terv legyen `needs_review`,
  a `coverage_checked` pedig `false`. Mentés után ellenőrizd az új
  hash-t, vezesd át a `recording_index_sha256` mezőbe, majd töröld a függő
  állapotot. Megszakítás után a régi hash esetén a mentés még hátravan; az
  újra előállított jegyzék hash-e egyezzen a tervezettel. A tervezett új hash
  esetén csak az átvezetés maradt hátra. Más hash-nél állj meg.
- Az érintett csoportokat és hiányokat ellenőrizd újra. A hiány csak a tényleges
  lefedettség igazolása után legyen `resolved`; ha továbbra is hiányzik, maradjon
  `awaiting_recording`. A korábbi kihagyási döntéseket őrizd meg. A problémalista
  megfelelő tételéhez fűzd hozzá az eredményt. A `resolved` és `omitted` hiányok
  ne maradjanak döntésre váróként az `unresolved` listában. Az érintett részek
  ellenőrzése után a korábban változatlan csoportok eredményével együtt újra
  állapítsd meg a `coverage_checked` értékét.

Ha a felhasználó átirathibát jelez, a felvételt őrizd meg kézi review-ra, és a
döntést rögzítsd; beszédet ne találj ki. Egyik folytatási lépés se módosítson
Resolve-timeline-t. Csak akkor legyen a terv `ready_for_execution`, ha minden
hiány `omitted` vagy `resolved`, és a többi meglévő tervkapu is teljesül.

## Mentett terv és végrehajtási kapu

Mindig csak az éppen feldolgozott script-ID vágását tervezd meg. Az adott ID
tervét mentsd a jegyzék mappájában lévő `retake_plan.json` fájl `groups`
listájába, majd folytasd a következő ID elemzésével. Ne tarts több ID beszédét
egyidejűleg az elemzési kontextusban. Timeline-t ne módosíts; a teljes tervet
csak az összes csoport elkészülte után add át. A végrehajtás külön, felhasználó
által indított [3e lépésben](3e-resolve-rough-cut-timeline.md) történik.

A terv sémája `1.1`, kötelező mezői:

- `schema_version`: `"1.1"`; `script_sha256` és `recording_index_sha256` a
  pontos bemeneti állapot azonosítói.
- `coverage_checked`: csak akkor `true`, ha minden script-rész hiányellenőrzése
  elkészült a fenti szabályok szerint; különben `false`.
- `status`: `ready_for_execution` vagy `needs_review`; csak minden csoport
  elkészülte és ellenőrzése után legyen `ready_for_execution`.
- `groups`: script-ID-nként `script_id`, a scriptből átvett timeline-név,
  `status` (`validated` vagy `blocked`), `manual_review_required` logikai érték,
  a felvételi sorrend és bizonyítéka, valamint az adott ID tervezett döntései.
  Minden script-ID-hoz legyen csoport. A kézi vágásra jelölt csoport is lehet
  `validated`, ha az összes forrástartománya ellenőrzött és megmarad.
  A `manual_review_required` ennél `true`, egyébként `false`.
- Minden törlési döntés: a korábbi rész `recording_id` és szóhivatkozásai,
  az eredeti kivágandó szöveg, a helyette megtartott újabb rész szóhivatkozásai
  és az ismétlési megfelelés indoka.
- Minden csoportban `retained_ranges`: a végeredményben megmaradó forrás-
  tartományok rendezett listája. Minden elem tartalmazza a `recording_id`,
  `source_id`, `source_start` és `source_end` mezőket; a beszédnél az eredeti
  szóhivatkozásokat is. Az időhatárok forrásmásodpercben, félig nyílt
  `[source_start, source_end)` tartományok. Megőrzendő képi anyagnál a jegyzék
  szerinti forrástartományt használd. Kézi vágásra jelölt csoportnál minden
  érintett felvétel teljes `source_start`–`source_end` tartománya szerepeljen,
  törlési döntés nélkül. Üres lista csak ellenőrzött, teljesen kihagyott résznél
  érvényes; ezt a csoport döntése és az `approved_omissions` bejegyzése
  igazolja. Üres listát ne használj bizonytalanság jelölésére.
- `unresolved`: kézi vágásra vagy tényleges bemeneti hiba miatt tisztázásra
  váró tételek, valamint döntésre váró hiányzó felvételrészek, az érintett
  script-ID-vel és indokkal.
- `missing_items`: a hiányok listája; elemenként stabil `issue_id`, `script_id`,
  a pontos `script_text`, `status`, valamint ha rendelkezésre áll,
  `recording_dir`, `manifest_path` és a döntés hivatkozása. A `status` értéke
  `awaiting_decision`, `awaiting_recording`, `recording_received`, `transcribed`,
  `resolved` vagy `omitted`. Hiány nélkül üres lista.
- `approved_omissions`: a felhasználó által jóváhagyott kihagyások listája;
  elemenként `issue_id`, script-ID, a kihagyott scriptbeli szöveg és a döntés hivatkozása.
  Ha nincs jóváhagyott kihagyás, üres lista.
- `pending_index_update`: folyamatban lévő pótfelvételi jegyzékmentésnél a
  `manifest_path`, `before_sha256` és `after_sha256`; egyébként `null`. Korábbi
  `1.1` tervben a hiányzó mezőt `null` értékként kezeld.

Az átirat szóidőit oldd fel forrásidőkre. Ellenőrizd az ID-egyezést, a
forrástartományokat, a bizonyított újabb változatot, a törlések átfedéseit,
a megtartási sorrendet és a képi/hang-kivételeket. Resolve-klipkapcsolatot ne
keress és ne tárolj. Hiányzó vagy érvénytelen forráshivatkozásnál ne találgass;
az érintett csoport legyen `blocked`, a teljes terv pedig
`needs_review`.

Csak visszaolvasott és ellenőrzött, minden csoportban `validated` állapotú terv
jelölhető `ready_for_execution` állapotúnak, ha `coverage_checked` értéke is
`true`. Az `unresolved` tartalmazhat kézi
vágásra jelölt csoportot, ha annak minden változata ellenőrzötten megmarad.
Felhasználói döntésre váró hiányzó felvételrész, illetve hiányzó vagy érvénytelen
forrásadat viszont továbbra is blokkolja a tervet.

A 2a. lépés gépi kimenete a teljes `retake_plan.json`; bizonytalanságnál a
hivatkozott közös problémánapló is készül. Resolve-hoz ne nyúlj.
Az elemzés végén jelezd a kézi vágásra váró csoportokat és a problémánapló
útvonalát; az ismétlésvágási bizonytalanság tisztázására ne várj. Döntésre
váró hiányzó felvételrésznél, illetve hiányzó vagy érvénytelen forrásadatnál a
terv maradjon `needs_review`; ne add át végrehajthatóként.
Csak `ready_for_execution` tervnél add át a fájl útvonalát, és állj meg.
Mondd ki, hogy a Resolve-projekt és timeline még nem készült el, a terv pedig
nincs végrehajtva. A vágási döntések felhasználói review-ja a Resolve-ban,
az első timeline markerein történik; külön fájlalapú tervreview-t ne kérj.
A felhasználó külön indítása után a
[3. timeline-összeállítás](3-timeline-assembly.md) és a
[3c review timeline](3c-resolve-review-timeline.md) következik; a 3c a
`retained_ranges` alapján helyezi el a piros markerpárokat. A felhasználó a
markereket ezután Resolve-ban review-zhatja.
