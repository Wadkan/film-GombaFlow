# 2. Felvételek azonosítása és jegyzék

## Cél és bemenet

Agentként értelmezd a felvett azonosítóbemondásokat, és készíts visszakereshető
jegyzéket. Ebben a lépésben nem vágsz videót, nem hozol létre timeline-t,
nem választasz felvételt és nem távolítasz el ismétlést.

Előfeltétel a sikeres [timeline-preflight](0-preflight.md).
Ha az átírás óta a forrásanyag változott, futtasd újra a preflightot; fel nem
oldott eltérésnél ne készíts jegyzéket.

Olvasd be:

- Az [átírási lépés](1-transcription.md) `master_transcript.json` fájlját és
  minden benne hivatkozott videónkénti átiratot.
- Az elfogadott projekt `3-script.md` fájlját. Ha nincs megadva az útvonala,
  kérdezd meg, és várd meg a választ.
- A scriptből hivatkozott
  [közös vágói szerződést](../gomba-1-script-writer/templates/3-script-template.md)
  és [parancsszótárat](../gomba-1-script-writer/RECORDING_COMMANDS.md).
- A manifest mellett lévő `recording_assignments.json` fájlt, ha van ilyen:
  a beszéd nélkül maradt anyagok felhasználói leírásait és hozzárendeléseit.

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

A manifest mappájában készíts új JSON-fájlt. Meglévő jegyzéket ne írj felül
automatikusan; az újrafeldolgozást egyeztesd. A bemenetek és az eredeti
átiratszöveg változatlanok maradnak; a kimenet új értelmezési adatokat ad hozzá.

A gyökér mezői:

- `schema_version`: `"1.0"`.
- `script_path`, `script_sha256`, `script_version`: a ténylegesen olvasott script
  útvonala, tartalomlenyomata és benne rögzített változatreferenciája.
- `manifest_path`, `assignments_path`: abszolút bemeneti útvonalak;
  hozzárendelési fájl hiányában az utóbbi `null`.
- `magic_word`: a scriptben tárolt érték.
- `script_parts`: a script összes része, a törzs sorrendjében; elemenként
  `script_id`, `chapter_id`, `script_order`, `timeline`, `clip_type`, `description`.
- `recordings`: az azonosított és még tisztázandó forrástartományok listája.

Minden `recordings` rekord mezői:

- `recording_id`: a jegyzékkészítő által kiosztott, jegyzéken belül egyedi
  felvételazonosító. A technikai kiosztási sorrend nem bizonyít felvételi időrendet.
- `source_id`, `source_path`, `transcript_path`: az eredeti bemenethez vezető
  kapcsolat. Másolatok esetén `source_aliases` listában az összes további útvonal.
- `source_start`, `source_end`: az azonosított rész teljes forrástartománya,
  a bemondással együtt. Minden tartomány másodpercben értendő, félig nyílt `[start, end)`.
- `cue`: a bemondás `start`, `end`, `original_text` mezői; kézi hozzárendelésnél `null`.
- `content_start`, `content_end`: a bemondás utáni tartalom tartománya;
  csak bemondásból álló résznél a két érték egyenlő is lehet.
- `retained_start`, `retained_end`: a 3. lépés számára javasolt nem üres
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
betűrendjéből. A [4. lépés](4-retake-cleanup.md) ezt rögzítési metaadatból,
ennek hiányában egyértelmű fájlnévsorszámból állapítja meg; itt ne találd ki,
melyik felvétel volt az utolsó.

## Átadás

Ellenőrizd, hogy minden eredeti felvétel és hozzárendelt tartomány
visszakereshető a jegyzékben, beleértve a néma és csak bemondásos részeket is.
A scriptből hiányzó felvételek listázása a 3. lépés feladata.

Add át a jegyzék útvonalát. Csak a pontosítást igénylő tételeket kérdezd meg;
a sikeresen azonosított részeket ne sorold fel. Bizonytalan részeknél jelezd
a függőben lévő azonosítást, ne állítsd, hogy minden rész feldolgozható.
