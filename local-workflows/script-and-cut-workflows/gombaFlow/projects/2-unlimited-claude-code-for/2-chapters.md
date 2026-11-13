# Fejezetterv — Claude Code limitbe futott? Próbáld helyi modellel

- Témaazonosító: `2-unlimited-claude-code-for`
- Bemeneti változatok és briefjóváhagyás: `0-brief.md` jóváhagyott, benne a 6–8 perces hossz, a kezdő vállalkozói célközönség és Mac-demó; `1-story.md`, `1-thumbnail-prompt.md`, `1-outline-hyperframes-brief.md` jóváhagyott. Forrás: `source-transcript.md`.

## Fejezetek nézői sorrendben

### H — Hook

- Cél és rövid tevékenységleírás: az első öt másodpercben megnevezem az elfogyott használati keretet, és rögtön vállalom a helyi modell bemutatását.
- Kapcsolódó történetelem: `1-story.md` Hook; keretkimerülés, helyi Ollama-modell és Gomba Limited kalkulátor.
- Kártya szövege: „Elfogyott a Claude Code kerete?”
- Átvezető szöveg: „Megállt a Claude Code, mert elfogyott a kereted? Megmutatom, hogyan kötheted össze az Ollamával futó helyi modellel — aztán kipróbáljuk egy egyszerű ajánlati kalkulátoron.”
- Tervezett lépések: kimondom a pain pointot; megmutatom a demóban készült kalkulátort és az ellenőrizendő eredményt.
- Kiinduló modell-/demóállapot: előre elkészített és kipróbált demóprojekt, Claude Code az Ollama-modellhez kapcsolva; ez csak a felvétel előtti tényleges próba után rögzíthető.
- Elvárt végállapot és ellenőrzési pont: a néző érti a problémát és a vállalást; képernyőn valóban futó, helyes kalkulátor látható, ha próba igazolta.
- Fontos magyarázat vagy korlát: a helyi modell nem Claude-modell, és a cím nem jelent korlátlan vagy azonos minőségű használatot.

### O — Mit mutatok meg?

- Cél és rövid tevékenységleírás: a hook után röviden felsorolom a négy fő lépést.
- Kapcsolódó történetelem: a történet O-szekciója és `1-outline-hyperframes-brief.md`.
- Kártya szövege: „A helyi modell útja”
- Átvezető szövege: „Először tisztázzuk, mi fut a gépünkön; utána összekötjük, kipróbáljuk, és végül megnézzük a kompromisszumokat.”
- Tervezett lépések:
    - Megnézzük, mit jelent a Claude Code keretének elfogyása, és mi fut helyben.
    - Összekötjük a Claude Code-ot egy, a Macünkhöz választott Ollama-modellel.
    - Elkészítünk és kipróbálunk egy kis Gomba Limited árrés-kalkulátort.
    - Megmutatom, milyen kompromisszumokkal jár a helyi modell, és mikor érdemes másik utat választani.
- Outline bulletpointjai: a fenti négy pont szó szerint megegyezik a `1-story.md` és `1-outline-hyperframes-brief.md` pontjaival.
- Kiinduló modell-/demóállapot: a néző az O outline-t hallja; a beállítás még nincs elmagyarázva.
- Elvárt végállapot és ellenőrzési pont: a néző ismeri a videó útvonalát; a Hyperframes-brief szövege és sorrendje megegyezik.
- Fontos magyarázat vagy korlát: nem másoljuk ide a részletes fejezettervet, és nem ígérünk több alternatíva részletes bemutatását.

### C1 — A kész megoldás

- Cél és rövid tevékenységleírás: röviden megmutatom a már elkészült kalkulátor tipikus inputját, a helyi modell futását és a látható outputot.
- Kapcsolódó történetelem: `1-story.md` Saját történet és Hook; transcript 05:30–06:30 mint a kódolási próba mintája.
- Kártya szövege: „A Gomba Limited kalkulátora”
- Átvezető szövege: „Ez az eredmény; mindjárt megnézzük, mi változik, amikor a keret elfogyása után helyi modellre váltunk.”
- Tervezett lépések: megadom a termék önköltségét és ajánlati árát; elindítom a kalkulátor kódolási feladatát; megmutatom a generált felületet és egy ellenőrzött számítást.
- Kiinduló modell-/demóállapot: előre elkészített, működő és tesztelt Gomba Limited demó; a kiválasztott modell és a Mac specifikációja a felvétel előtt rögzítendő.
- Elvárt végállapot és ellenőrzési pont: a kalkulátor képernyőn használható, az inputból számolt haszon és árrés kézi számítással egyezik. Ha a generált projekt nem fut, a kész megoldásként való bemutatást el kell halasztani.
- Fontos magyarázat vagy korlát: az eredmény csak az adott feladat és modell sikerét bizonyítja, nem általános kódminőséget.

### C2 — Előtte és utána

- Cél és rövid tevékenységleírás: párhuzamosan összevetem a felhőszolgáltatói kerethez kötött kódolást a helyi modellre irányított próbával.
- Kapcsolódó történetelem: a keret elfogyásából induló történet és a rövid, korlátozott demóeredmény.
- Kártya szövege: „Mi változik a helyi futtatással?”
- Átvezető szövege: „A különbség nem annyi, hogy ugyanaz az agy másik gépben lakik: a modellt, a költségviselést és a sebességet is cseréljük.”
- Tervezett lépések: öt rövid, egymás mellé rendezett szempontot mutatok a comparison-template sorrendjében.
- Kiinduló modell-/demóállapot: az előtte és utána állapotot a szolgáltatói keretmodell és a helyi Ollama-modell képviseli.
- Elvárt végállapot és ellenőrzési pont: minden összevetés tényszerű, nincs kitalált idő- vagy költségszám; az emberi ellenőrzés mindkét oldalon látható.
- Fontos magyarázat vagy korlát: nem állítjuk, hogy a helyi futtatás automatikusan gyorsabb, ingyenes vagy azonos minőségű.

## Összehasonlítás

- **Kézi lépések**
    - Előtte: fejlesztő a rendelkezésre álló felhőmodellt használja, és keretkimerüléskor vár, másik hozzáférést választ vagy abbahagyja a feladatot.
    - Utána: fejlesztő Ollamán keresztül helyi modellt választ és futtat; a projektet továbbra is ő készíti elő és ellenőrzi.
- **Időráfordítás**
    - Előtte: a feladat idejét a modell válaszideje és a használati keret is befolyásolja; itt nincs saját mérés.
    - Utána: telepítés és modellletöltés előkészítési időt kér, a generálás sebessége a géptől és modelltől függ; itt nincs saját mérés.
- **Hibalehetőség**
    - Előtte: kézi kódolási vagy felhőkapcsolati hiba maradhat.
    - Utána: a modell hibás kódot adhat, a gép kifuthat a memóriából, vagy az integráció nem indulhat el.
- **Költség**
    - Előtte: a választott Anthropic csomag vagy API-hozzáférés és annak kerete irányadó.
    - Utána: helyi inferenciánál nincs modellprovideri tokendíj, de van hardver-, áram- és letöltési költség; a Claude Code fiók-/hozzáférési feltételét külön ellenőrizni kell.
- **Emberi felügyelet**
    - Előtte: fejlesztő a modellt és kerethasználatot figyeli, majd felülvizsgálja a kódot.
    - Utána: fejlesztő a modellt helyben választja, felülvizsgálja a generált kódot és futtatja a teszteket.

### C3 — Szükséges szolgáltatások

- Cél és rövid tevékenységleírás: röviden elmagyarázom, melyik eszköz mire való, milyen hozzáférés és erőforrás kell.
- Kapcsolódó történetelem: `0-brief.md` fő útja és alternatívái; transcript 00:44–01:43, 06:30–11:39.
- Kártya szövege: „Agent, helyi modell, saját gép”
- Átvezető szövege: „Most, hogy különválasztottuk az agentet a modelltől, nézzük meg, mire lesz szükség a Macen.”
- Tervezett lépések: Claude Code-ot agentként, Ollamát modellfuttatóként és a letöltött helyi modellt külön szerepként mutatom meg; megemlítem, hogy a FreeLLMAPI külső szolgáltatói kvótákhoz kötött, az OpenCode pedig másik agent.
- Kiinduló modell-/demóállapot: az integrációt és modellszerepeket ismertető, aktuális hivatalos útmutatók rendelkezésre állnak.
- Elvárt végállapot és ellenőrzési pont: néző tudja, mi települ helyben, mi a modell és mi az agent; a konkrét verziókat, hozzáférési feltételeket és árakat felvétel előtt hivatalos forrásból ellenőriztük.
- Fontos magyarázat vagy korlát: Anthropic dokumentációja normál Claude Code-belépésnél előfizetéses vagy Console API-s azonosítást ír le; az Ollama-átirányítás pontos belépési útját és hozzáférési feltételét a kipróbált verziókon ellenőrizni kell. Ne mondjuk, hogy Claude Code-hoz soha nem kell fiók vagy előfizetés. Hivatkozás: [Anthropic setup](https://docs.anthropic.com/en/docs/claude-code/getting-started), [Ollama integration](https://registry.ollama.com/blog/claude).

### C4 — Megvalósítás

- Cél és rövid tevékenységleírás: a demó előkészítésétől a kalkulátor működő tesztjéig az adatút szerint építek, minden logikai blokk után ellenőrzéssel.
- Kapcsolódó történetelem: `1-story.md` Gomba Limited példája és az Ollama → helyi modell → Claude Code út.
- Kártya szövege: „Állítsuk össze a helyi fejlesztői utat”
- Átvezető szövege: „Előbb a géphez választunk modellt, csak utána kötjük rá a Claude Code-ot.”
- Tervezett lépések: négy alfejezetben előkészítem a gépet, felteszem és ellenőrzöm a modellt, kapcsolom az agenthez, majd elkészítem a kalkulátort.
- Kiinduló modell-/demóállapot: demó Mac, még tiszta vagy dokumentált telepítési állapot; modell a pontos hardveradatok után kiválasztva.
- Elvárt végállapot és ellenőrzési pont: Claude Code Ollama helyi modellre irányítva; a kalkulátor projekt fájljai létrejöttek és elindíthatók.
- Fontos magyarázat vagy korlát: pontos telepítési parancsot, modellcímkét, kontextusbeállítást és belépési eljárást a felvétel előtt hivatalos leírásból és saját próbából kell rögzíteni.

#### C4.1 — Mac és Ollama előkészítése

- Cél és rövid tevékenységleírás: ellenőrzöm a Mac chipjét, szabad tárhelyét és memóriáját, majd telepítem vagy elindítom az Ollamát.
- Kapcsolódó történetelem: a helyi gép vállalja a számítási munkát.
- Kártya szövege: „Elbírja a gép?”
- Átvezető szövege: „A megfelelő modell a géped erőforrásain múlik, ezért először ezeket ellenőrzöm.”
- Tervezett lépések: rögzítem a chipet és memóriát; ellenőrzöm a letöltési méretet és szabad helyet; az Ollama hivatalos telepítésével indítom az alkalmazást.
- Kiinduló modell-/demóállapot: Mac rendszeradatok még nem rögzítve.
- Elvárt végállapot és ellenőrzési pont: Ollama elindul, a Mac adatai és szabad hely láthatók.
- Fontos magyarázat vagy korlát: konkrét gépadat és Ollama-verzió nélkül telepítési narrációt nem véglegesítünk.

#### C4.2 — Helyi modell kiválasztása

- Cél és rövid tevékenységleírás: a kódolási feladathoz modellt választok úgy, hogy a szükséges memória és kontextus beleférjen a demógépbe.
- Kapcsolódó történetelem: a Claude Code az Anthropic modell helyett az Ollamában futó modellt használja.
- Kártya szövege: „Modell a rendelkezésre álló memóriához”
- Átvezető szövege: „A modell letöltése előtt összevetem a modelloldalon szereplő méretet a gépünk adataival.”
- Tervezett lépések: megnézem a hivatalos Ollama modelloldalt; letöltöm a kiválasztott modellt; ellenőrzöm, hogy az Ollama listázza és válaszol.
- Kiinduló modell-/demóállapot: Ollama telepítve; a Mac specifikációja rögzített.
- Elvárt végállapot és ellenőrzési pont: konkrét modellcímke, méret és kontextus dokumentálva; a modell helyben betöltődik és egyszerű prompttal válaszol.
- Fontos magyarázat vagy korlát: modellt és memóriaküszöböt nem választunk csak a forrásvideó RAM-táblázata alapján; az aktuális hivatalos modelladat és saját futtatás az irányadó.

#### C4.3 — Claude Code csatlakoztatása

- Cél és rövid tevékenységleírás: a Claude Code-ot az Ollama helyi modelljére irányítom.
- Kapcsolódó történetelem: a változatlan agent és a kicserélt modell.
- Kártya szövege: „Ugyanaz az agent, másik modell”
- Átvezető szövege: „A modell már helyben fut; most a Claude Code-ot is erre az útvonalra állítom.”
- Tervezett lépések: az Ollama hivatalos Claude-integrációs módszerét követem; a ténylegesen kipróbált integrációs parancsot használom; ellenőrzöm a kiválasztott modellt és az első választ. Valódi kulcs nem kerül kamerába.
- Kiinduló modell-/demóállapot: Ollama és helyi modell működik; Claude Code verziója és hozzáférési módja rögzítendő.
- Elvárt végállapot és ellenőrzési pont: Claude Code válasza az Ollama helyi modelljétől érkezik; a helyi modellszerep megfigyelhető a kliensben vagy Ollama állapotában.
- Fontos magyarázat vagy korlát: fiók, előfizetés, hitelesítés és hálózati hozzáférés hatását előre ki kell próbálni; a videó nem ígérheti biztosan, hogy semmilyen Claude Code-fiók nem kell.

#### C4.4 — Kalkulátor megépítése

- Cél és rövid tevékenységleírás: Claude Code-dal elkészítem a Gomba Limited egyszerű ajánlati árrés-kalkulátorát.
- Kapcsolódó történetelem: a Gomba Limited saját üzleti példája.
- Kártya szövege: „Egy kis, ellenőrizhető feladat”
- Átvezető szövege: „Most kap a helyi modell egy pontos, szűk feladatot; a generált kódot ezután mi futtatjuk és ellenőrizzük.”
- Tervezett lépések: előkészítek mesterséges bemeneteket és egyszerű projektvázat; megadom a feladatot; megvizsgálom a generált fájlokat; elindítom a programot.
- Kiinduló modell-/demóállapot: Claude Code a helyi modellen fut; a projektben nincs ügyfél- vagy titkos adat.
- Elvárt végállapot és ellenőrzési pont: az alkalmazás kéri az önköltséget és az ajánlati árat, majd megjeleníti a profitot és az árrést; a pontos képlet a teszttervben rögzítendő.
- Fontos magyarázat vagy korlát: a modell kódja nem tekinthető helyesnek addig, amíg futtatás és teszt nem igazolja.

### C5 — Teszt és korlátok

- Cél és rövid tevékenységleírás: teljes input → futás → output ciklussal ellenőrzöm a kalkulátort, majd megmutatok legalább egy határesetet és a korlátokat.
- Kapcsolódó történetelem: hookban és C1-ben vállalt próba.
- Kártya szövege: „Működik a számolás?”
- Átvezető szövege: „A kész felület önmagában nem bizonyíték; nézzük meg a számokat és egy hibás inputot is.”
- Tervezett lépések: mesterséges tesztadat; normál számolás; nulla vagy negatív érték határesetének ellenőrzése; modell válaszidejének rögzítése, ha ezt a készítő tényleg méri; maradó emberi kódellenőrzés megnevezése.
- Kiinduló modell-/demóállapot: C4.4-ben létrejött, elindítható kalkulátor; előre rögzített tesztesetek.
- Elvárt végállapot és ellenőrzési pont: normál inputnál a kézi képlettel azonos eredmény; hibás inputnál biztonságos, érthető visszajelzés; a mérések és hibák tényszerűen feljegyezve.
- Fontos magyarázat vagy korlát: a helyi modell lassabb lehet és gyengébben kódolhat; ezt csak a saját próbáról állíthatjuk. Helyi futásnál a prompt és kód nem megy a távoli modellproviderhez az Ollama helyi módjában, de ezt a konkrét telepítésen ellenőrizni kell.

### C6 — Mit oldottunk meg?

- Cél és rövid tevékenységleírás: röviden levonom a demó által alátámasztott következtetést, és megnevezem, mi marad emberi feladat.
- Kapcsolódó történetelem: Gomba Limited kalkulátor, teszt és korlátok.
- Kártya szövege: „Mire elég a helyi modell?”
- Átvezető szövege: „Egy próbánk van; ebből azt mondhatjuk el, amit ténylegesen ellenőriztünk.”
- Tervezett lépések: a saját próba eredményét, a megmaradó ellenőrzést és a fő korlátot összegzem.
- Kiinduló modell-/demóállapot: tesztkimenet és felvétel előtti rögzített megfigyelések rendelkezésre állnak.
- Elvárt végállapot és ellenőrzési pont: a következtetés nem általánosít egyetlen kalkulátoros demón túl; tényleges és várt eredmény elkülönül.
- Fontos magyarázat vagy korlát: ha a demó nem sikerül, a hook és az összefoglalás ígéretét módosítani kell, nem a tesztet elrejteni.

### CTA — Következő lépés

- Cél és rövid tevékenységleírás: a rögzített csatorna-CTA-val zárom a videót.
- Kapcsolódó történetelem: a közös videóstruktúra CTA-ja.
- Kártya szövege: „További gyakorlati automatizálásért”
- Átvezető szövege: nincs külön átvezetés; ez a záró egység.
- Tervezett lépések: változtatás nélkül elmondom a `VIDEO_STRUCTURE.md` rögzített CTA-ját.
- Kiinduló modell-/demóállapot: a néző hallotta a demó igazolt eredményét és korlátait.
- Elvárt végállapot és ellenőrzési pont: a CTA szövege betűhíven megegyezik a közös struktúrában szereplővel.
- Fontos magyarázat vagy korlát: a rögzített CTA-t nem szabad átírni.

## Átadás

- Teljes történet és adatút lefedése: a keretproblémától a helyi modellválasztáson és Claude Code-kapcsolaton át a működő kalkulátor tesztjéig minden fő lépés szerepel; C4 alfejezetei azonosítják a függőségeket és ellenőrzési pontokat.
- Nyitott akadályok: a konkrét Mac chipje és memóriája, kiválasztott modellcímke, Claude Code/Ollama verziók és helyi integráció hitelesítési útja, valamint a demó tényleges teszteredményei még a script véglegesítése előtt rögzítendők.
- Átadás: fejezetszerkezetileg teljes; scriptírás előtt a technikai előfeltételeket a felvételi környezeten kell igazolni. A teljes script csak ezekkel a konkrétumokkal lesz végrehajtható.
