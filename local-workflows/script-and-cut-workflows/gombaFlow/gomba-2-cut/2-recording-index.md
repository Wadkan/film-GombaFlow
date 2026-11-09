# 2. Felvételek azonosítása és jegyzék

## Cél és bemenet

Agentként értelmezd a felvett azonosítóbemondásokat, és készíts visszakereshető
jegyzéket. Ebben a lépésben nem vágsz videót, nem hozol létre timeline-t,
nem választasz felvételt és nem távolítasz el ismétlést.

Olvasd be:

- Az [átírási lépés](1-transcription.md) `master_transcript.json` fájlját és
  minden benne hivatkozott videónkénti átiratot.
- A Gomba 1 `projects/registry.json` fájlját és az átírt felvételek
  bemondásaiban szereplő témaazonosítóknak megfelelő `3-script.md` fájlokat.
  A registry `topic_id` és `project_dir` mezői adják meg a script helyét.
- A scriptből hivatkozott
  [közös vágói szerződést](../gomba-1-script-writer/templates/3-script-template.md)
  és [parancsszótárat](../gomba-1-script-writer/RECORDING_COMMANDS.md).
- A manifest mellett lévő `recording_assignments.json` fájlt, ha van ilyen:
  a beszéd nélkül maradt anyagok felhasználói leírásait és hozzárendeléseit.

Egy bemeneti forrás több témaazonosítóhoz tartozó felvételt is tartalmazhat.
Az átiratok rekordjait témaazonosító és a hozzá tartozó script szerint külön
csoportosítsd. Minden csoporthoz külön jegyzék készül a már létező
`projects/<project_dir>/` scriptmappában; új mappát ne hozz létre. A jegyzék
az eredeti média- és átiratfájlok helyére hivatkozik, azokat ne mozgasd,
ne másold és ne módosítsd.

A varázsszó értékét kizárólag az adott script fejlécéből vedd át, ne az
aktuális központi konfigurációból. A bemeneti fájlok csak olvashatók.

## Bemenetellenőrzés

Ellenőrizd a támogatott `1.0` átiratsémát, a hivatkozott fájlok létezését,
a manifest és az átiratok forrásazonosítóinak/útvonalainak egyezését, valamint
az időbélyegek véges, forrásidőn belüli értékét. A szóidőbélyegek lehetnek
azonos kezdő- és végpontúak, de vágandó vagy megtartandó tartomány nem lehet üres.
A forrásfájl tartalomazonosítója továbbra is egyezzen az átíráskor rögzített SHA-256-tal.

A script tényleges felvehető részeiből olvasd ki a `script-id`, `timeline` és
`clip-type` attribútumokat, a fejezetazonosítót és a rövid leírást. Az átadási
összesítés ugyanarra a részre mutató sorait ne tekintsd újabb részeknek.
Ellenőrizd az ID-k egyediségét és az összesítés egyezését a törzzsel.
A script összes felvehető részének és átadási összesítésének timeline-ja
egyezzen a script fejlécében szereplő egyetlen cél-timeline-nal; eltérésnél
jelezz hibát, és ne találj ki hozzárendelést.
A `script_order` a törzsben szereplő sorrend, nem az ID számértéke.

Sérült bemenetnél állj meg konkrét hibával; hiányzó adatot ne találj ki.
A néma felvétel nem hibás vagy törlendő bemenet.

## Azonosítás

1. Az átiratok szóidőbélyegeivel keresd meg a scriptben rögzített varázsszó
   nyitó–záró párjait, szakaszhatárokon át is. Kis- és nagybetű, írásjel,
   illetve egyértelműen számként felismert/bemondott ID normalizálható, az
   eredeti szöveg módosítása nélkül. Hiányzó szót, ID-t vagy zárójelet ne pótolj.
2. Az azonosító parancs a parancsszótár alakjának feleljen meg. A bemondott
   timeline utáni szám egyezzen a script fejlécében szereplő témaazonosító
   kezdő számrészével; a script-ID egyezzen a megfelelő résszel. A timeline
   nevét a scriptből vedd át. A kliptípust
   az adott `agent-cue` attribútumából vedd át; ezt nem kell bemondani.
3. A rész a bemondástól a következő azonosítóbemondás kezdetéig vagy a
   forrásfájl végéig tart. Külön tárold a bemondás és az utána következő
   tartalom határait. Az első azonosító előtti anyagot is tartsd nyilván
   azonosítatlan tartományként, ne hagyd el csendben.
4. A képi kivételt részenként, a közös szerződés szerint alkalmazd. Ha a rész
   nem `talking head`, és csak azonosítóbemondást tartalmaz, azonosított marad:
   a megtartandó tartomány a bemondás alatti képet is tartalmazza.
   B-rollnál rögzítsd a kikapcsolandó, de megőrzendő hangot.
5. Egy fájl több azonosítója külön rekordokat eredményez. Azonos script-ID
   ismételt felvételei külön felvételazonosítót kapjanak, mind maradjon meg.
   A tartalmilag azonos videófájl-másolatokat azonos forrásként kezeld;
   az útvonalváltozatokat őrizd meg, ne gyárts belőlük új felvételt.
6. A felhasználói hozzárendeléseket ellenőrizd a scripthez, és ugyanebbe a
   jegyzékbe vedd fel, a szó szerinti leírást és annak eredetét megőrizve.
   Például az „API-kulcs bekötéséhez B-roll” leírást a megfelelő script-részhez
   rendeld. A usertől ne kérj ID-t. Hiányzó vagy többértelmű egyezésnél tartalmi
   pontosítást kérj, és a válaszig `needs_review` maradjon a rekord.

Hiányzó varázsszópár, ismeretlen parancs vagy bizonytalan határ esetén az
érintett tartományt őrizd meg `needs_review` státusszal, automatikus vágási
utasítás nélkül. Kézi hozzárendelés és bemondás ütközését ne döntsd el önállóan.
Egymást átfedő hozzárendeléseknél kérj pontosítást.

## Kimenet: `recording_index.json` — 1.0

A fenti kimeneti szabály szerinti scriptmappában készíts új
`recording_index.json` fájlt minden témaazonosítóhoz. Meglévő jegyzéket ne írj
felül automatikusan; az újrafeldolgozást egyeztesd. A felhasználó által jelzett
pótfelvétel hozzáadása a lent leírt kivétel. Az eredeti médiafájlok és
átiratszövegek változatlanok maradnak; a kimenet új értelmezési adatokat ad hozzá.

A gyökér mezői:

- `schema_version`: `"1.0"`.
- `topic_id`: a bemondással és a script fejlécével ellenőrzött témaazonosító.
- `script_path`, `script_sha256`, `script_version`: a ténylegesen olvasott script
  útvonala, tartalomlenyomata és benne rögzített változatreferenciája.
- `manifest_path`, `assignments_path`: abszolút bemeneti útvonalak;
  hozzárendelési fájl hiányában az utóbbi `null`.
- `additional_manifests`: pótfelvételekhez opcionális lista; elemenként az
  abszolút `manifest_path` és `assignments_path`, utóbbi hiányában `null`.
  Hiányzó lista üresnek számít; az eredeti `manifest_path` változatlan marad.
- `magic_word`: a scriptben tárolt érték.
- `script_parts`: a script összes része, a törzs sorrendjében; elemenként
  `script_id`, `chapter_id`, `script_order`, `timeline`, `clip_type`, `description`.
- `recordings`: az azonosított és még tisztázandó forrástartományok listája.

Minden `recordings` rekord mezői:

- `recording_id`: a jegyzékkészítő által kiosztott, jegyzéken belül egyedi
  felvételazonosító. A technikai kiosztási sorrend nem bizonyít felvételi időrendet.
- `source_id`, `source_path`, `transcript_path`: az eredeti bemenethez vezető
  kapcsolat; mindhárom fájlútvonal legyen abszolút, hogy a scriptmappába írt
  indexből is feloldható legyen. Másolatok esetén `source_aliases` listában
  az összes további útvonal.
- `source_start`, `source_end`: az azonosított rész teljes forrástartománya,
  a bemondással együtt. Minden tartomány másodpercben értendő, félig nyílt `[start, end)`.
- `cue`: a bemondás `start`, `end`, `original_text` mezői; kézi hozzárendelésnél `null`.
- `content_start`, `content_end`: a bemondás utáni tartalom tartománya;
  csak bemondásból álló résznél a két érték egyenlő is lehet.
- `retained_start`, `retained_end`: a timeline-összeállítás számára javasolt nem üres
  forrástartomány. Normál esetben a bemondás után kezdődik; a képi kivételnél
  annak kezdetén. Bizonytalan rekordnál mindkettő `null`.
- `script_id`, `chapter_id`, `script_order`, `timeline`, `clip_type`, `description`:
  a scriptből átvett adatok; még fel nem oldott mezőknél `null`.
- `cue_only`: csak azonosítóbemondás hallható-e az adott részben.
- `audio_enabled`: B-rollnál `false`, más azonosított típusnál `true`;
  ismeretlen típusnál `null`. Ez a későbbi timeline hangkapcsolója, nem forrástörlés.
- `assignment_origin`: `spoken_cue`, `user_description` vagy `unresolved`.
- `user_description`: a felhasználó eredeti leírása, egyébként `null`.
- `status`: `identified` vagy `needs_review`; `issue`: pontos probléma vagy `null`.

A felvételfájlok közötti rögzítési sorrend nem vezethető le a manifest
betűrendjéből. Az ismétlésvágási lépés ezt rögzítési metaadatból,
ennek hiányában egyértelmű fájlnévsorszámból állapítja meg; itt ne találd ki,
melyik felvétel volt az utolsó.

## Pótfelvétel hozzáadása

Csak a [vágási terv](4-retake-cleanup.md) mentett, felhasználó által jelzett
pótfelvételénél bővíts meglévő jegyzéket. A külön mappában átírt új manifestet
és esetleges hozzárendeléseit a fenti bemenetellenőrzés és azonosítás szerint
dolgozd fel, a kiválasztott scriptre és annak `topic_id` értékére szűrve. Az új
manifest átiratútvonalait az új manifest mappájához képest oldd fel.

A meglévő rekordokat és `recording_id` értékeket őrizd meg; kizárólag az új,
azonosított forrásrészeket add hozzá, egyedi új `recording_id` értékekkel.
Azonos `source_id` másolataiból ne hozz létre új felvételt. Az új manifest és
hozzárendelési fájl útvonalát egyszer rögzítsd az `additional_manifests`
listában. Az eredeti manifestet, átiratokat és forrásokat ne módosítsd.
A hozzáfűzést és a mentett JSON bájtjait azonos bemenetnél azonosan állítsd elő,
hogy megszakítás után a tervezett hash újra ellenőrizhető legyen.

Mentés előtt a bővített jegyzék tervezett pontos tartalmának SHA-256 értékét
add át a tervlépésnek a folytatási állapot rögzítéséhez. Csak a tervlépés
mentett `pending_index_update` állapota után írd le ugyanazt a jegyzéktartalmat.
Olvasd vissza, és az új hash-t add át a tervlépésnek. Az érintett script- és
forrásazonosság vagy a tervezett hash eltérésénél állj meg konkrét hibával.

## Átadás

Ellenőrizd, hogy minden eredeti felvétel és hozzárendelt tartomány
visszakereshető a jegyzékben, beleértve a néma és csak bemondásos részeket is.
A scriptből hiányzó felvételeket és beszédrészeket a
[vágási terv](4-retake-cleanup.md) ellenőrzi és naplózza.

Add át a jegyzék útvonalát. Csak a pontosítást igénylő tételeket kérdezd meg;
a sikeresen azonosított részeket ne sorold fel. Bizonytalan részeknél jelezd
a függőben lévő azonosítást, ne állítsd, hogy minden rész feldolgozható.
