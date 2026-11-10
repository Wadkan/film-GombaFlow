## Kitöltési és review-szabályok — nem része a generált scriptnek

Ez a blokk a scriptíró és a review közös szabályforrása. A kész kimenet a
„Forgatási script” címtől kezdődik; ezt a szabályblokkot és a kitöltési
utasításokat ne másold bele.

### Használható tagtípusok

Ez a központi lista a teljes tagkészlet. Más tagtípust ne vezess be.

- `<agent-cue>` — a vágói `timeline`, `script-id` és `clip-type` attribútumok;
  benne az egyetlen bemondandó `<spoken-cue>`. A felolvasó nézet ezt, majd a
  narrációt mutatja; az attribútumokat nem olvassa fel.
- `<spoken-cue>` — a varázsszóval keretezett azonosítóutasítás; a benne mondott
  timeline utáni szám a fejléc témaazonosítójának kezdő számrésze legyen;
  a script-ID egyezzen az `agent-cue` attribútumával.
- `<narration>` — a felolvasandó szöveg a spoken cue után; a cue-t ne ismételje.
- `<screen-action>` — a képernyőművelet és az eközben látható eredmény egyetlen
  blokkban; előadói utasítás, nem felolvasandó szöveg.
- `<production-note>` — opcionális, nem felolvasandó háttér-, ellenőrzési vagy
  technikai megjegyzés; csak szükség esetén szerepeljen.

### Felvételi jelölések

- Generáláskor olvasd be a [központi beállítás](../../../../recording-config.json)
  `magic_word` értékét. Hiányzó vagy üres értéknél jelezz akadályt.
  A script fejlécében rögzítsd a tényleges értéket; minden bemondás ezt használja.
  A vágó az adott scriptből olvassa, így egy későbbi központi változtatás
  nem értelmezi át a már elkészült scripthez tartozó felvételeket.
- A parancsok jelentését és hatókörét a
  [parancsszótár](../RECORDING_COMMANDS.md) adja. Minden azonosításban a
  felhasználó a témaazonosító kezdő számrészét mondja be a timeline címe helyett,
  majd az egyedi script-ID-t. A timeline címe továbbra is szerepeljen a scriptben.
  Egy script egy cél-timeline-t jelöl: a fejlécben szereplő timeline neve minden
  felvehető rész és a vágói átadás timeline-adatával egyezzen.
- Minden külön felvehető rész kapjon a teljes scripten belül egyedi, pozitív
  egész script-ID-t. Ez külön azonosító a fejezet-ID mellett. Javításkor a már
  kiosztott ID-k maradjanak meg; új rész szabad ID-t kapjon, újraszámozás nélkül.
  A scriptíró osztja ki őket a részek létrehozásakor. A fejezet-ID-t a
  `2-chapters.md` megfelelő fejezetéből veszi át. A teljes script közös
  cél-timeline-jának neve az elfogadott cím vagy a teljes scriptre külön
  egyeztetett név.
- A részenkénti `agent-cue` `clip-type` attribútumát a parancsszótár kliptípusai
  közül töltsd ki. Ez nem felolvasandó metaadat.
  A vágói átadás a részhez már rögzített ID-kat, timeline-t és kliptípust vegye át,
  rövid leírását pedig a rész művelete és mutatott tartalma alapján fogalmazza meg.
- A tagelt blokkok XML-ként olvashatók legyenek: szövegben az `&` és `<`,
  attribútumban az idézőjel is megfelelő XML-entitással szerepeljen.
  Ez tárolási jelölés; a felolvasandó szövegben a témaazonosító száma hangzik el
  a timeline címe helyett.
- A felvételi blokkokban a fenti tagtípusokat használd; a bemondás előzze meg az
  általa azonosított tartalmat. A tagelt blokkokat a generált Markdownban
  kódblokkokban őrizd meg, hogy láthatók maradjanak.
- Review-ban ellenőrizd a fejlécben tárolt varázsszó és a bemondások egyezését,
  a témaazonosító számának helyes bemondását, az egyetlen közös timeline címét
  és minden részben, valamint a vágói átadásban való egyezését, az egyedi
  script-ID-kat, a szótár szerinti kliptípust,
  az átadási adatok és a részek egyezését, a tagpárokat és a tartalmak
  helyes elkülönítését. Az elfogadott scriptet a saját rögzített értékéhez
  ellenőrizd; a központi érték későbbi változása önmagában nem hiba.

Kitöltött példa, `serpenyő` beállítás esetén:

```xml
<agent-cue timeline="Film címe" script-id="15" clip-type="talking head">
<spoken-cue>serpenyő timeline 1 script 15 serpenyő</spoken-cue>
</agent-cue>

<narration>
Most megmutatom a kész megoldást.
</narration>

<screen-action>
Válts a böngészőre, futtasd a megadott keresést, és mutasd a tényleges találati sort.
</screen-action>

<production-note>
A találatok a tényleges futástól függenek; ne használj előre rögzített vagy kitalált eredményt.
</production-note>
```

---

### Vágói átadási szerződés

A scriptíró az alábbi kimeneti átadási blokkban a tényleges scriptváltozatot
és a részek azonosítóit adja át. A felvételfájlokat és a feldolgozási jegyzéket
csak a későbbi vágói feldolgozás rendeli hozzá; a scriptíró ezekhez nem talál ki adatot.
A vágó az átadási blokkból hivatkozott jelen szerződést alkalmazza.

- **Eredeti forrás:** minden felvételfájl kapjon stabil forrásazonosítót és hozzá
  társított, változatlan Faster-Whisper átiratot szavankénti forrásidőbélyegekkel.
  Az átirat őrizze meg a teljes bemondott utasítást a varázsszavakkal együtt.
  A timeline-vágás ne módosítsa az eredeti forrást vagy annak átiratát.
- **Jegyzék:** minden azonosított felvételrészhez rögzítse a scriptváltozatot,
  script-ID-t, külön felvételazonosítót, forrásazonosítót, videó- és átiratútvonalat,
  az eredeti utasítás szó szerinti szövegét és kezdő–vég idejét, a tartalom
  forrásbeli kezdő–vég idejét, a cél-timeline-t és a feldolgozás státuszát.
  A kliptípust a script megfelelő részének `agent-cue` `clip-type` attribútumából vegye át.
  Ugyanazon script-ID újrafelvételei külön felvételazonosítókat kapjanak.
- **Felismerés és vágás:** csak a két felismert varázsszó közé zárt,
  parancsszótárnak megfelelő utasítást dolgozza fel. Az ID a scriptben létezzen;
  a bemondott `timeline` utáni szám egyezzen a script `Témaazonosító` mezőjének
  kezdő számrészével. A cél timeline nevét a scriptből vegye át;
  hiányzó pár, ismeretlen ID vagy bizonytalan hozzárendelés esetén az érintett
  részt jelölje tisztázandónak, automatikus kivágás és elhelyezés nélkül.
  A forrásidőbélyegekből határozza meg a tartalom határait a parancsszótár szerint.
  A jegyzékbe mentés után a cél-timeline-ra helyezett változatból a teljes
  utasításblokkot távolítsa el, mindkét varázsszóval együtt, az alábbi képi kivétellel.
- **Csak azonosítóbemondást tartalmazó képi rész:** ha a script szerinti
  `clip-type` nem `talking head`, és az adott azonosított részben az egyetlen
  beszéd az érvényes azonosítóbemondás, a rész azonosítottnak számít, nem hiánynak.
  Az azonosító alatti képet is tartsa meg: a klip a bemondás kezdetétől a
  következő azonosítóbemondás kezdetéig vagy a fájl végéig tartson. Ezt a
  feltételt részenként vizsgálja, ne a teljes felvételfájlra egyszerre.
  Több B-roll-ID egy felvételben külön klipeket eredményezzen, a hozzájuk tartozó
  bemondás alatti képpel együtt.
- **B-roll sáv és hang:** a `b-roll` képét és meglévő hangját a talking head
  képétől és hangjától külön sávokra helyezze, egymással szinkronban. Az eredeti
  hangot őrizze meg, ne némítsa vagy módosítsa. Hang nélküli forráshoz ne
  hozzon létre mesterséges hangot.
- **Timeline-kapcsolat:** minden behelyezett klippéldányhoz őrizze meg a
  jegyzékrekord kapcsolatát, a vágó által visszakereshető klippéldány-azonosítót,
  a timeline-t, a sávot, a timeline-beli tartományt és a megtartott forrástartományt.
  Daraboláskor minden új példányhoz külön kapcsolat kell; áthelyezéskor és
  további vágáskor a megfeleltetést frissíteni kell. Az AI a jegyzék és az
  aktuális timeline alapján azonosítson; az eredeti átiratot ellenőrzéshez
  vagy újraértelmezéshez olvassa, ne következtesse újra a klip azonosságát pusztán szövegből.
- **Olvasható klipnév:** a timeline-klip megjelenített nevében szerepeljen
  ebben a sorrendben a script-ID, a felvételazonosító, a kliptípus és egy rövid
  tartalmi leírás, például `S15 · T2 · b-roll · keresési eredmény`.
  A kliptípus a parancsszótár szerinti, scriptben rögzített érték legyen.
  A felvételazonosítót a vágó osztja ki a felvételrészek jegyzékbe vételekor;
  az `S15` a script 15-ös része, a `T2` annak második rögzített felvétele.
  A klipnév segíti az emberi tájékozódást;
  a tartós gépi kapcsolatot a jegyzék tartja fenn. Az azonosítóhoz marker nem kell.

---

# Forgatási script — [téma címe]

- Témaazonosító: [a projekthez már kiosztott topic-id, például 1-rovid-cim]
- Bemeneti változatok és briefjóváhagyás: [futtatói referenciák]
- Javítási kör review-referenciája: [referencia / első változat]
- Felvételi varázsszó: [a beolvasott magic_word tényleges értéke]
- Alapértelmezett timeline: [a teljes végső film elfogadott címe]

## Script nézői sorrendben

Minden fejezethez és alfejezethez ismételd az alábbi blokkot.
A kötött címek és CTA forrása a [videóstruktúra](../VIDEO_STRUCTURE.md).
A fejezetterv azonosítói maradjanak meg. A hookot közvetlenül az O — Mit
mutatok meg? outline kövesse; az animációs brief a
`<project>/1-outline-hyperframes-brief.md` fájlban található. Az O egység
bulletpointjai a briefben megadott sorrendben jelenjenek meg.

### [ID] — [cím]

```xml
<production-note>
- Rövid leírás: [mit fogok csinálni]
- Kártyaszöveg: [kész szöveg]
- Felvétel jellege és előfeltétele: [képernyő/talking head; szükséges igazolt állapot]
- Működő modell/demó: [kiinduló állapot → bemutatandó eredmény]
- Eredmény státusza: [tervezett / forrásban igazolt / saját projektben igazolt,
  a bizonyíték megjelölésével]
</production-note>
```

#### Lépésről lépésre

Minden műveletre ismételd; nem technikai egységnél a bemutatás lépéseit írd le.
Kód, prompt vagy konfiguráció szükség esetén a művelet alatt kódblokkba kerüljön.
Minden külön felvehető részhez használd a következő tagelt blokkot. A fejezet
első megfelelő narrációja tartalmazza a kész átvezető mondatot is.

#### Felvehető rész — [egyedi script-ID]

```xml
<agent-cue timeline="[cél-timeline neve]" script-id="[egyedi script-ID]" clip-type="[típus a RECORDING_COMMANDS.md szótárából]">
<spoken-cue>[varázsszó] timeline [a témaazonosító kezdő számrésze] script [egyedi script-ID] [varázsszó]</spoken-cue>
</agent-cue>

<narration>
[kész, elmondható narráció, szükség esetén az átvezetéssel]
</narration>

<screen-action>
[A végrehajtandó képernyőművelet és az eközben látható eredmény, egyetlen leírásban]
</screen-action>

<production-note>
[Lényegi magyarázat vagy buktató; elvárt eredmény és ellenőrzés; forrás.]
</production-note>
```

Az összehasonlítási egységben a [comparison-template.md](comparison-template.md)
kitöltött tartalmát használd; ne hozz létre másik összehasonlítási formátumot.

## Felvételi rend

A konkrét fejezeteket a [közös felvételi szabályok](../CONTENT_RULES.md)
szerint rendeld felvételi sorrendbe. Ez nem készítői előkészítési checklist.

```xml
<production-note>
- Sorrend: [sorszám]
- Fejezet-/alfejezet-ID és script-ID-k: [azonosítók]
- Felvétel: [képernyő vagy talking head tartalma]
- Milyen igazolt eredmény után vehető fel: [előfeltétel]
</production-note>
```

## Vágói átadás

Az alábbi blokkban minden felvehető részt egyszer sorolj fel. A szerződés
hivatkozását a generált script helyéhez képest add meg.

```xml
<production-note>
Átadási szerződés: [a script-template Vágói átadási szerződés blokkjának relatív útvonala]
Scriptváltozat: [a futtató által megadott, visszakereshető változatreferencia]
Részek:
- Script-ID: [a scriptíró által az adott felvehető részhez kiosztott ID]
  Fejezet-ID: [a rész szülőfejezetének ID-ja, a 2-chapters.md-ből átvéve]
  Timeline: [a rész agent-cue timeline attribútumával egyező cél]
  Kliptípus: [a rész agent-cue clip-type attribútumából átvéve]
  Leírás: [az adott rész művelete és mutatott tartalma alapján röviden]
</production-note>
```

## Átadás review-ra

- Ellenőrzendő állítások és saját technikai próbák: [ID → állítás/próba, elvárt bizonyíték]
- Nyitott tervezési akadályok: [nincs / mi és melyik lépés javítandó]
- Átadás: [review-ra kész / akadályozott, indokkal]
