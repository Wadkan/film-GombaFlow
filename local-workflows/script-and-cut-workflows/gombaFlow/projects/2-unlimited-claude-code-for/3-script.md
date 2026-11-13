# Forgatási script — Claude Code limitbe futott? Próbáld helyi modellel

- Témaazonosító: `2-unlimited-claude-code-for`
- Bemeneti változatok és briefjóváhagyás: `0-brief.md` jóváhagyva; `1-story.md`, `1-thumbnail-prompt.md`, `1-outline-hyperframes-brief.md` jóváhagyva; `2-chapters.md` jóváhagyva; transcript `source-transcript.md`.
- Javítási kör review-referenciája: első változat.
- Felvételi varázsszó: `serpenyő`
- Alapértelmezett timeline: `Claude Code limitbe futott? Próbáld helyi modellel`
- Demógép: Apple M2 Pro, 16 GB memória (a rendelkezésre álló Mac gépadatokból; azonosítók nélkül).
- Tervezett modell: `gemma4:e4b` — az Ollama modelloldala 6,6–9,5 GB körüli méretet jelez; a tényleges betöltést és Claude Code-eszközhasználatot a felvétel előtt igazolni kell.
- Fontos státusz: a script és a kalkulátor demója nincs kipróbálva. Minden képernyőn látható eredmény csak a saját felvétel előtti ellenőrzés után mondható igazoltnak.

## Script nézői sorrendben

### H — Hook

```xml
<production-note>
- Rövid leírás: megnevezem a keret elfogyásának problémáját, és rögtön vállalom a helyi modell kipróbálását.
- Kártyaszöveg: Elfogyott a Claude Code kerete?
- Felvétel jellege és előfeltétele: talking head; a kalkulátor és a modell sikeres próbája után vehető fel.
- Működő modell/demó: előkészített helyi Claude Code + Ollama demó → egyszerű kalkulátor eredménye.
- Eredmény státusza: tervezett, saját projektben még nem igazolt.
</production-note>
```

#### Felvehető rész — 1

```xml
<agent-cue timeline="Claude Code limitbe futott? Próbáld helyi modellel" script-id="1" clip-type="talking head">
<spoken-cue>serpenyő timeline 2 script 1 serpenyő</spoken-cue>
</agent-cue>

<narration>
Elfogyott a Claude Code kereted? Megnézzük, segít-e egy helyi modell.
</narration>

<screen-action>
Kamerába mondom a hookot, majd röviden bevágom az előre elkészített Gomba Limited árrés-kalkulátort. Csak az ellenőrzött próba eredménye látszódjon.
</screen-action>

<production-note>
Az első mondat az első öt másodpercben nevezi meg a cím és thumbnail pain pointját, és rögtön vállalja a megoldhatóság vizsgálatát.
</production-note>
```

### O — Mit mutatok meg?

```xml
<production-note>
- Rövid leírás: a nézői sorrendben felsorolom a videó négy fő lépését.
- Kártyaszöveg: A helyi modell útja
- Felvétel jellege és előfeltétele: b-roll vagy képernyőfelvétel; az animációs brief az 1-outline-Hyperframes-brief.md fájlban van.
- Működő modell/demó: nem mutat be külön eredményt.
- Eredmény státusza: outline-szöveg elfogadott a briefben, demó tervezett.
</production-note>
```

#### Felvehető rész — 2

```xml
<agent-cue timeline="Claude Code limitbe futott? Próbáld helyi modellel" script-id="2" clip-type="b-roll">
<spoken-cue>serpenyő timeline 2 script 2 serpenyő</spoken-cue>
</agent-cue>

<narration>
Megnézzük, mit jelent a Claude Code keretének elfogyása, és mi fut helyben. Összekötjük a Claude Code-ot egy, a Macünkhöz választott Ollama-modellel. Elkészítünk és kipróbálunk egy kis Gomba Limited árrés-kalkulátort. Megmutatom, milyen kompromisszumokkal jár a helyi modell, és mikor érdemes másik utat választani.
</narration>

<screen-action>
Mutassuk egymás után az outline négy pontját a Hyperframes brief szövegével, változatlan sorrendben.
</screen-action>

<production-note>
Az outline szövege megegyezik az 1-story.md és az 1-outline-hyperframes-brief.md pontjaival.
</production-note>
```

### C1 — A kész megoldás

```xml
<production-note>
- Rövid leírás: konfiguráció nélkül mutatom be a kész, működő kalkulátort és egy tényleges számítást.
- Kártyaszöveg: A Gomba Limited kalkulátora
- Felvétel jellege és előfeltétele: b-roll; a projektnek és az eredménynek előzőleg sikeresen kell működnie.
- Működő modell/demó: helyi Gemma 4 E4B-vel készült kalkulátor → futó felület és ellenőrzött számítás.
- Eredmény státusza: tervezett, saját projektben még nem igazolt.
</production-note>
```

#### Felvehető rész — 3

```xml
<agent-cue timeline="Claude Code limitbe futott? Próbáld helyi modellel" script-id="3" clip-type="b-roll">
<spoken-cue>serpenyő timeline 2 script 3 serpenyő</spoken-cue>
</agent-cue>

<narration>
Ez az eredmény; mindjárt megnézzük, mi változik, amikor a keret elfogyása után helyi modellre váltunk. Ez a Gomba Limited egyszerű ajánlati kalkulátora. Megadom az önköltséget és az ajánlati árat, az alkalmazás pedig kiszámolja a különbséget és az árrést. Ezt most egy helyi modellel készítjük el. A példa azt mutatja meg, hogy ez a modell mire volt képes ezen a feladaton; nem általános minőségi garancia.
</narration>

<screen-action>
A már előre elkészített alkalmazásban adj meg egy tesztpéldát: önköltség 80 000 Ft, ajánlati ár 100 000 Ft. Mutasd a kalkulátor tényleges válaszát. Ha a felület 20 000 Ft profitot és 20 százalékos árrést jelez, azt a képernyőn is ellenőrizd; eltérő eredményt ne narrálj helyesnek.
</screen-action>

<production-note>
A várt képlet: profit = ajánlati ár − önköltség; árrés = profit / ajánlati ár. A felületet és a számítást előzetesen kézzel ellenőrizni kell. A működő változat még nem készült el.
</production-note>
```

### C2 — Előtte és utána

```xml
<production-note>
- Rövid leírás: öt rövid, párhuzamos szempontban összevetem a felhőmodellt a helyi modellel.
- Kártyaszöveg: Mi változik a helyi futtatással?
- Felvétel jellege és előfeltétele: b-roll vagy képernyőfelvétel; csak minőségi összevetéshez nem kell mérés.
- Működő modell/demó: felhőalapú Anthropic-hozzáférés → helyi Ollama modell; a konkrét kódolási teljesítményt nem rangsorolom.
- Eredmény státusza: különbségek a működési modellből adódnak; sebesség és teljesítmény nincs mérve.
</production-note>
```

#### Felvehető rész — 4

```xml
<agent-cue timeline="Claude Code limitbe futott? Próbáld helyi modellel" script-id="4" clip-type="b-roll">
<spoken-cue>serpenyő timeline 2 script 4 serpenyő</spoken-cue>
</agent-cue>

<narration>
A különbség nem annyi, hogy ugyanaz az agy másik gépben lakik: a modellt, a költségviselést és a sebességet is cseréljük. A modell és az agent két külön dolog. Az előfizetéses vagy API-s Claude-használatnál Anthropic modellje válaszol. Itt ugyanazt a Claude Code eszközt Ollamán keresztül egy másik, helyben futó modellhez irányítjuk. Így változik az adat útja és a számítás terhe is.
</narration>

<screen-action>
Jelenítsd meg egymás után az öt rövid összevetést: kézi lépések — várakozás a keret visszaállására vagy helyi modell választása; időráfordítás — nincs saját mérés, a helyi előkészítés plusz idő, a generálás gépfüggő; hibalehetőség — kézi vagy felhőhiba, illetve hibás modellkód vagy memóriahiány; költség — választott csomag/API vagy helyi hardver és áram; felügyelet — mindkét esetben kódellenőrzés és teszt. Ne jeleníts meg számot saját mérés nélkül.
</screen-action>

<production-note>
Az „előtte és utána” a választott felhőszolgáltatói út és a helyi modell minőségi összevetése. Ne állítsunk konkrét idő- vagy költségmegtakarítást. Anthropic setup: https://docs.anthropic.com/en/docs/claude-code/getting-started.
</production-note>
```

### C3 — Szükséges szolgáltatások

```xml
<production-note>
- Rövid leírás: elmagyarázom, melyik összetevő mit csinál, és milyen hozzáférési feltételeket kell ellenőrizni.
- Kártyaszöveg: Agent, modell, saját gép
- Felvétel jellege és előfeltétele: talking head vagy rövid b-roll; az aktuális verziók és hozzáférési feltételek felvétel előtt ellenőrizendők.
- Működő modell/demó: Claude Code agent + Ollama + helyi Gemma 4 E4B.
- Eredmény státusza: Ollama-integráció forrásban dokumentált; a konkrét telepítés még nincs igazolva.
</production-note>
```

#### Felvehető rész — 5

```xml
<agent-cue timeline="Claude Code limitbe futott? Próbáld helyi modellel" script-id="5" clip-type="talking head">
<spoken-cue>serpenyő timeline 2 script 5 serpenyő</spoken-cue>
</agent-cue>

<narration>
Most, hogy különválasztottuk az agentet a modelltől, nézzük meg, mire lesz szükség a Macen. Claude Code az eszköz, amely a kódot kezeli. Ollama futtatja a modellt a gépeden. A modell pedig a kódolási feladatokra válaszol. A Claude Code-ot az Anthropic eredetileg saját szolgáltatásával kínálja, de az Ollama dokumentálja, hogyan irányítható kompatibilis helyi modellre. A helyi út nem Anthropic Claude, és nem jár automatikusan ugyanazzal a minőséggel.
</narration>

<screen-action>
Mutasd az Ollama hivatalos Claude Code-oldalán az integrációs példát és a `ollama launch claude` parancsot, majd válts az Ollama Gemma 4 modelloldalára. Ne mutass bejelentkezési adatot vagy valódi kulcsot.
</screen-action>

<production-note>
Forrás: [F2] https://registry.ollama.com/blog/claude és [F3] https://ollama.com/blog/launch. Anthropic normál Claude Code hitelesítése csomagot vagy Console API-hozzáférést használ; a helyi Ollama-út belépési módját az aktuális Claude Code/Ollama verziókkal előzetesen ellenőrizd. [F6] https://docs.anthropic.com/en/docs/claude-code/getting-started.
</production-note>
```

#### Felvehető rész — 6

```xml
<agent-cue timeline="Claude Code limitbe futott? Próbáld helyi modellel" script-id="6" clip-type="talking head">
<spoken-cue>serpenyő timeline 2 script 6 serpenyő</spoken-cue>
</agent-cue>

<narration>
A másik két út máshol fut. A FreeLLMAPI külső szolgáltatók API-kereteit tereli egy közös végpontra, ezért a kód elhagyja a gépet, és az egyes szolgáltatók keretei érvényesek. Az OpenCode pedig másik kódoló agent, nem Claude Code. Most a helyi Ollama-utat építjük végig; a másik kettő nem része a demónak.
</narration>

<screen-action>
Mutass rövid címkéket: „Ollama: helyi modell”, „FreeLLMAPI: külső API-keretek”, „OpenCode: másik agent”. Ne jeleníts meg nem ellenőrzött FreeLLMAPI telepítési parancsot.
</screen-action>

<production-note>
Az OpenCode különálló, nyílt forrású agent: https://opencode.ai/product. A FreeLLMAPI működését a transcript írja le, de a konkrét forrásrepository és aktuális feltételek nincsenek ellenőrizve; ne mondj konkrét szolgáltatószámot, kvótát vagy titkosítási állítást.
</production-note>
```

### C4 — Megvalósítás

```xml
<production-note>
- Rövid leírás: az adatút sorrendjében előkészítem a Macet, betöltöm a modellt, Claude Code-hoz kapcsolom, majd felépítem a kalkulátort.
- Kártyaszöveg: Állítsuk össze a helyi fejlesztői utat
- Felvétel jellege és előfeltétele: b-roll; az egész folyamatot előbb próbagépen vagy tiszta demókörnyezetben végig kell ellenőrizni.
- Működő modell/demó: Apple M2 Pro, 16 GB → Ollama és Gemma 4 E4B → Claude Code → kalkulátor.
- Eredmény státusza: terv; nincs letöltés, telepítés vagy futtatási próba végrehajtva.
</production-note>
```

#### C4.1 — Mac és Ollama előkészítése

##### Felvehető rész — 7

```xml
<agent-cue timeline="Claude Code limitbe futott? Próbáld helyi modellel" script-id="7" clip-type="b-roll">
<spoken-cue>serpenyő timeline 2 script 7 serpenyő</spoken-cue>
</agent-cue>

<narration>
Előbb a géphez választunk modellt, csak utána kötjük rá a Claude Code-ot. A megfelelő modell a géped erőforrásain múlik, ezért először ezeket ellenőrzöm. Az én bemutatógépem M2 Pro chipes MacBook Pro, 16 gigabájt memóriával. A gép teljes memóriáját az operációs rendszer és az alkalmazások is használják, ezért nem a névleges modellméret az egyetlen szempont. Most az Ollamát a hivatalos oldalról telepítem, majd ellenőrzöm, hogy elindul.
</narration>

<screen-action>
Mutasd a gép chipjét és memóriáját a Rendszerbeállításokban, de személyes gépazonosítókat ne. Ezután mutasd az Ollama hivatalos letöltési oldalát, telepítsd az alkalmazást a szokásos macOS telepítővel, nyisd meg, és ellenőrizd, hogy az Ollama fut. Az install UI verziót a felvétel előtt pontosítsd.
</screen-action>

<production-note>
Ne futtass vakon shellből másolt install scriptet, ha az app telepítője elérhető. A pontos kattintások és verziók a felvétel előtt ellenőrzendők az ollama.com/download oldalon. Ez nem mérés vagy telepítés ezen a munkameneten belül.
</production-note>
```

#### C4.2 — Helyi modell kiválasztása

##### Felvehető rész — 8

```xml
<agent-cue timeline="Claude Code limitbe futott? Próbáld helyi modellel" script-id="8" clip-type="b-roll">
<spoken-cue>serpenyő timeline 2 script 8 serpenyő</spoken-cue>
</agent-cue>

<narration>
A megfelelő modell a géped erőforrásain múlik, ezért először ezeket ellenőrzöm. A 16 gigabájtos gépre nem a 12 milliárd paraméteres változattal kezdek: annak a fájlmérete is közel nyolc gigabájt, és ezen felül hely kell a kontextusnak meg a rendszernek. A Gemma 4 E4B kisebb változatát választom ki próbaalapnak. A modellsúly még nem jelenti azt, hogy a teljes munkamenet biztosan kényelmesen belefér.
</narration>

<screen-action>
Nyisd meg az Ollama hivatalos Gemma 4 oldalát; mutasd a `gemma4:e4b` változatot és a feltüntetett letöltési mérettartományt. Az Ollama termináljában futtasd: `ollama run gemma4:e4b`. Várd meg a modell letöltését és első válaszát, majd állíts be a kódolási feladathoz elegendő kontextust, amely a gépen is elfér. Ha verziófüggően eltér a modellcímke vagy a beállítás, a felvétel előtt frissítsd ezt a részt.
</screen-action>

<production-note>
Forrás: [F7] https://ollama.com/library/gemma4 — az oldal a Gemma 4 változatok méretét és coding/agentic célokat sorolja fel. A felvétel előtt ellenőrizd a tényleges változatot, tárhelyet, kontextushosszt és memóriaterhelést M2 Pro 16 GB gépen.
</production-note>
```

##### Felvehető rész — 9

```xml
<agent-cue timeline="Claude Code limitbe futott? Próbáld helyi modellel" script-id="9" clip-type="b-roll">
<spoken-cue>serpenyő timeline 2 script 9 serpenyő</spoken-cue>
</agent-cue>

<narration>
A modell letöltése előtt összevetem a modelloldalon szereplő méretet a gépünk adataival. Mielőtt rákötöm a kódoló agentet, külön ellenőrzöm, hogy a modell tényleg betöltődik és válaszol. Ha ez a lépés lassú, memóriahibát ad vagy nem indul, ezen a gépen kisebb modellt kell választanom.
</narration>

<screen-action>
Az Ollama modellnézetben indíts egy rövid, ártalmatlan promptot, például: „Írj egy JavaScript függvényt, amely kiszámolja az árrést.” Mutasd a tényleges választ és azt, hogy az Ollama modell fut. Rögzítsd a tényleges válaszidőt csak akkor, ha a felvételen számmal is állítod.
</screen-action>

<production-note>
Ez a lépés a betöltést és egyszerű szöveges választ ellenőrzi, nem bizonyítja még a Claude Code tool-calling képességét vagy kódminőséget. Ha a modellválasz hibás vagy a gép terhelése túl magas, állj meg és válassz kisebb modellt.
</production-note>
```

#### C4.3 — Claude Code csatlakoztatása

##### Felvehető rész — 10

````xml
<agent-cue timeline="Claude Code limitbe futott? Próbáld helyi modellel" script-id="10" clip-type="b-roll">
<spoken-cue>serpenyő timeline 2 script 10 serpenyő</spoken-cue>
</agent-cue>

<narration>
A modell már helyben fut; most a Claude Code-ot is erre az útvonalra állítom. Ha még nincs telepítve, az Anthropic hivatalos útmutatója szerint telepítem, majd az Ollama által dokumentált helyi API-címre irányítom. A Claude Code marad az eszköz; a válaszokat a Gemma adja.
</narration>

<screen-action>
Ha Claude Code még nincs telepítve, ellenőrizd a Node.js verziót (`node --version`), majd az Anthropic által dokumentált telepítést használd: `npm install -g @anthropic-ai/claude-code`. Ezután ugyanabban a terminálablakban állítsd be az Ollama helyi API-címét és az Ollama által dokumentált teszttokent:

```sh
export ANTHROPIC_AUTH_TOKEN=ollama
export ANTHROPIC_BASE_URL=http://localhost:11434
claude --model gemma4:e4b
```

Az `ollama` itt nem valódi kulcs, és csak a helyi Ollama-végponthoz tartozik. Claude Code-ban ellenőrizd, hogy elindult; valódi kulcs ne kerüljön felvételre.
</screen-action>

<production-note>
Forrás: [F2] https://registry.ollama.com/blog/claude dokumentálja az `ANTHROPIC_AUTH_TOKEN=ollama`, `ANTHROPIC_BASE_URL=http://localhost:11434` és `claude --model` helyi útvonalat; [F6] https://docs.anthropic.com/en/docs/claude-code/getting-started a Node.js és Claude Code telepítését. A `gemma4:e4b` címkét add át a `--model` paraméternek. Ha a futás Anthropic felhőbejelentkezést vagy külső API-t kér, állj meg, és ne állítsd, hogy helyi a modellút.
</production-note>
````

##### Felvehető rész — 11

```xml
<agent-cue timeline="Claude Code limitbe futott? Próbáld helyi modellel" script-id="11" clip-type="b-roll">
<spoken-cue>serpenyő timeline 2 script 11 serpenyő</spoken-cue>
</agent-cue>

<narration>
Egy rövid kérdéssel ellenőrzöm, hogy az agent válaszol-e. Ez még nem bizonyítja, hogy jól tud fájlokat módosítani, ezért a következő lépésben egy szűk feladatot adok neki a Gomba Limited projektjében.
</narration>

<screen-action>
Claude Code-ban adj egy rövid, ártalmatlan promptot. Amíg válaszol, egy másik terminálablakban futtasd az `ollama ps` parancsot, és mutasd meg, hogy a `gemma4:e4b` helyben fut. Ne kérdezd magát a modellt arról, hogy melyik modell: a választ a helyi folyamatlistával ellenőrizd.
</screen-action>

<production-note>
Az `ollama ps` a futó Ollama-modellt ellenőrzi. Ha nem látszik a `gemma4:e4b`, ne állítsd, hogy a Claude Code-kérés biztosan helyi modellen futott.
</production-note>
```

#### C4.4 — Kalkulátor megépítése

##### Felvehető rész — 12

```xml
<agent-cue timeline="Claude Code limitbe futott? Próbáld helyi modellel" script-id="12" clip-type="b-roll">
<spoken-cue>serpenyő timeline 2 script 12 serpenyő</spoken-cue>
</agent-cue>

<narration>
Most kap a helyi modell egy pontos, szűk feladatot; a generált kódot ezután mi futtatjuk és ellenőrizzük. Most jön a Gomba Limited kis feladata. Egy egyszerű, egyoldalas kalkulátort kérek: önköltség és ajánlati ár alapján számolja ki a profitot és az árrést. A profit az árbevétel mínusz az önköltség; az árrés a profit osztva az ajánlati árral. A nulla árat kezelje hibás bemenetként.
</narration>

<screen-action>
A Claude Code munkamappájában kérd: „Készíts egyszerű, helyben futó egyoldalas ajánlati kalkulátort. Két pénzmező legyen: önköltség és ajánlati ár. Számítsd ki a profitot = ajánlati ár − önköltség, és az árrést = profit / ajánlati ár × 100%. Nulla vagy negatív érték esetén mutass érthető validációs hibát, és ne számolj százalékot. Adj rövid indítást.” Figyeld meg a fájlmódosításokat, olvasd át a generált kódot, és csak utána indítsd el a javasolt parancsot.
</screen-action>

<production-note>
Valódi ügyféladat vagy titok ne kerüljön a projektbe. A kódot még futtatás előtt nézd át; ha a Claude Code váratlan jogosultságot vagy fájlműveletet kér, ne fogadd el automatikusan.
</production-note>
```

### C5 — Teszt és korlátok

```xml
<production-note>
- Rövid leírás: a kalkulátor teljes ciklusát normál és határeset-bemenettel ellenőrzöm.
- Kártyaszöveg: Működik a számolás?
- Felvétel jellege és előfeltétele: b-roll; az alkalmazás és tesztek sikeresen lefutottak.
- Működő modell/demó: input → helyi futás → profit és árrés → validációs hibajelzés.
- Eredmény státusza: tervezett, felvétel előtt kézzel igazolandó.
</production-note>
```

#### Felvehető rész — 13

```xml
<agent-cue timeline="Claude Code limitbe futott? Próbáld helyi modellel" script-id="13" clip-type="b-roll">
<spoken-cue>serpenyő timeline 2 script 13 serpenyő</spoken-cue>
</agent-cue>

<narration>
A kész felület önmagában nem bizonyíték; nézzük meg a számokat és egy hibás inputot is. Ellenőrizzük a normál esetet. Nyolcvanezer forint önköltség és százezer forintos ajánlati ár mellett a profit húszezer forint, az árrés húsz százalék. Utána nullás ajánlati árral is próbálkozom: ilyenkor az alkalmazásnak hibát kell jeleznie, nem végtelen vagy hibás százalékot.
</narration>

<screen-action>
A kalkulátorban add meg a 80 000 és 100 000 értéket; ellenőrizd a 20 000 Ft profitot és a 20%-os árrést kézzel. Ezután írd be az ajánlati ár mezőbe a nullát, és mutasd a tényleges validációt. Próbálj negatív költséget is, ha a felület külön kezeli. Csak a valósan megjelenő értékeket mutasd.
</screen-action>

<production-note>
Ha valamelyik eredmény hibás, előbb javítsd és teszteld újra a demót; hibás állapotot ne állíts be működőnek. Ne állíts megtakarított időt, tokenszámot vagy dollárösszeget mérés nélkül.
</production-note>
```

#### Felvehető rész — 14

```xml
<agent-cue timeline="Claude Code limitbe futott? Próbáld helyi modellel" script-id="14" clip-type="talking head">
<spoken-cue>serpenyő timeline 2 script 14 serpenyő</spoken-cue>
</agent-cue>

<narration>
Ez a próba azt mutatja meg, hogy ezen a gépen és ezzel a modellel elkészült-e ez a kis kalkulátor. Nem bizonyítja, hogy a helyi modell minden fejlesztési feladatra elég. Cserébe a modell helyben fut, a számítás a saját gépedet terheli, és a válaszidő meg a kód minősége is függ a géptől és a feladattól.
</narration>

<screen-action>
Kamerába mondd a korlátokat; közben tartsd képen a ténylegesen tesztelt alkalmazást. Ha a próba nem sikerült, ezt mondd ki, és ne használd a C1-ben kész megoldásként.
</screen-action>

<production-note>
Az állításokat a saját teszt eredményéhez igazítsd. A helyi adattovábbításról csak az aktuális konfiguráció ellenőrzése után beszélj.
</production-note>
```

### C6 — Mit oldottunk meg?

```xml
<production-note>
- Rövid leírás: összegzem a próba eredményét és a megmaradó emberi ellenőrzést.
- Kártyaszöveg: Mire elég a helyi modell?
- Felvétel jellege és előfeltétele: talking head; tesztkimenet és hibák rögzítve.
- Működő modell/demó: a kipróbált gép, modell és kalkulátor valós eredménye.
- Eredmény státusza: tervezett szöveg; a tényleges felvétel előtt töltsd ki a megfigyelésekkel.
</production-note>
```

#### Felvehető rész — 15

```xml
<agent-cue timeline="Claude Code limitbe futott? Próbáld helyi modellel" script-id="15" clip-type="talking head">
<spoken-cue>serpenyő timeline 2 script 15 serpenyő</spoken-cue>
</agent-cue>

<narration>
Egy próbánk van; ebből azt mondhatjuk el, amit ténylegesen ellenőriztünk. A Gomba Limited kalkulátoránál [a felvétel előtt mondd el a ténylegesen igazolt eredményt]. A helyi modellnél a gép végzi a számítást, ezért a modell mérete, a memória és a válaszidő számít. A kódot itt is nekünk kell átnézni és tesztelni. Ha több modellválasztás kell, a FreeLLMAPI felhőszolgáltatói keretekkel dolgozik; ha egyszerűbb másik eszköz kell, az OpenCode külön agent. Ezekről ma nem készítettünk összehasonlító próbát.
</narration>

<screen-action>
Kamerába mondd az összefoglalót; röviden mutasd a kalkulátor tényleges, tesztelt állapotát és a három útválasztó címkét. A szögletes zárójelű helyet töltsd ki vagy távolítsd el a saját próba után.
</screen-action>

<production-note>
Az eredményről szóló mondat csak a mérések és tesztek után véglegesíthető. A többi útvonalat ne nevezd egyenértékűnek vagy korlátlannak.
</production-note>
```

### CTA — Következő lépés

```xml
<production-note>
- Rövid leírás: a rögzített csatorna-CTA-val zárom a videót.
- Kártyaszöveg: További gyakorlati automatizálásért
- Felvétel jellege és előfeltétele: talking head; a C6 után.
- Működő modell/demó: nem igényel demót.
- Eredmény státusza: rögzített szöveg.
</production-note>
```

#### Felvehető rész — 16

```xml
<agent-cue timeline="Claude Code limitbe futott? Próbáld helyi modellel" script-id="16" clip-type="talking head">
<spoken-cue>serpenyő timeline 2 script 16 serpenyő</spoken-cue>
</agent-cue>

<narration>
Ha nem szeretnél lemaradni, iratkozz fel a YouTube-csatornámra! Ha pedig inkább kényelmesen velem végeztetnéd el a munkát, vagy konzultációt kérnél, keress a gombaflow.eu oldalon!
</narration>

<screen-action>
Mondd el a rögzített CTA-t kamerába.
</screen-action>

<production-note>
A szöveg a VIDEO_STRUCTURE.md rögzített CTA-ja, változtatás nélkül.
</production-note>
```

## Felvételi rend

```xml
<production-note>
- Sorrend: 1
- Fejezet-/alfejezet-ID és script-ID-k: C4.1, C4.2, C4.3, C4.4 — 7, 8, 9, 10, 11, 12
- Felvétel: Ollama telepítése és indítása, modellletöltés és próba, Claude Code-csatlakozás, kalkulátor felépítése.
- Milyen igazolt eredmény után vehető fel: a folyamatot a Mac M2 Pro 16 GB gépen végig kell próbálni; a modellnek be kell töltődnie, a helyi útvonalat ellenőrizni kell, az alkalmazásnak futnia kell.
</production-note>

<production-note>
- Sorrend: 2
- Fejezet-/alfejezet-ID és script-ID-k: C5 — 13, 14
- Felvétel: normál számítás, nullás és negatív bemenet, tényleges korlátok.
- Milyen igazolt eredmény után vehető fel: normál és határeset-tesztek eredményeit kézzel ellenőrizni és feljegyezni.
</production-note>

<production-note>
- Sorrend: 3
- Fejezet-/alfejezet-ID és script-ID-k: C1 — 3
- Felvétel: kész kalkulátor bemutatója.
- Milyen igazolt eredmény után vehető fel: a C5 tesztek sikeresek; az alkalmazás és a bemutatott eredmény megfelel a scriptnek.
</production-note>

<production-note>
- Sorrend: 4
- Fejezet-/alfejezet-ID és script-ID-k: H — 1; O — 2; C2 — 4; C3 — 5, 6; C6 — 15; CTA — 16
- Felvétel: hook és outline, összehasonlítás, eszközmagyarázat, összegzés és zárás.
- Milyen igazolt eredmény után vehető fel: a hook, C1, C2, C3 és C6 állításai a tényleges teszteredményhez és aktuális forrásokhoz igazítva.
</production-note>
```

## Vágói átadás

```xml
<production-note>
Átadási szerződés: ../../gomba-1-script-writer/templates/3-script-template.md — „Vágói átadási szerződés” szakasz
Scriptváltozat: 3-script.md első változat
Részek:
- Script-ID: 1
  Fejezet-ID: H
  Timeline: Claude Code limitbe futott? Próbáld helyi modellel
  Kliptípus: talking head
  Leírás: keret elfogyásának hookja
- Script-ID: 2
  Fejezet-ID: O
  Timeline: Claude Code limitbe futott? Próbáld helyi modellel
  Kliptípus: b-roll
  Leírás: rövid outline
- Script-ID: 3
  Fejezet-ID: C1
  Timeline: Claude Code limitbe futott? Próbáld helyi modellel
  Kliptípus: b-roll
  Leírás: Gomba Limited kalkulátor demo
- Script-ID: 4
  Fejezet-ID: C2
  Timeline: Claude Code limitbe futott? Próbáld helyi modellel
  Kliptípus: b-roll
  Leírás: előtte és utána összevetés
- Script-ID: 5
  Fejezet-ID: C3
  Timeline: Claude Code limitbe futott? Próbáld helyi modellel
  Kliptípus: talking head
  Leírás: agent és helyi modell szerepe
- Script-ID: 6
  Fejezet-ID: C3
  Timeline: Claude Code limitbe futott? Próbáld helyi modellel
  Kliptípus: talking head
  Leírás: FreeLLMAPI és OpenCode rövid említése
- Script-ID: 7
  Fejezet-ID: C4.1
  Timeline: Claude Code limitbe futott? Próbáld helyi modellel
  Kliptípus: b-roll
  Leírás: Mac és Ollama előkészítése
- Script-ID: 8
  Fejezet-ID: C4.2
  Timeline: Claude Code limitbe futott? Próbáld helyi modellel
  Kliptípus: b-roll
  Leírás: Gemma 4 E4B kiválasztása és letöltése
- Script-ID: 9
  Fejezet-ID: C4.2
  Timeline: Claude Code limitbe futott? Próbáld helyi modellel
  Kliptípus: b-roll
  Leírás: helyi modell egyszerű prompttesztje
- Script-ID: 10
  Fejezet-ID: C4.3
  Timeline: Claude Code limitbe futott? Próbáld helyi modellel
  Kliptípus: b-roll
  Leírás: Ollama Claude Code-integráció indítása
- Script-ID: 11
  Fejezet-ID: C4.3
  Timeline: Claude Code limitbe futott? Próbáld helyi modellel
  Kliptípus: b-roll
  Leírás: integráció válaszának ellenőrzése
- Script-ID: 12
  Fejezet-ID: C4.4
  Timeline: Claude Code limitbe futott? Próbáld helyi modellel
  Kliptípus: b-roll
  Leírás: ajánlati árrés-kalkulátor létrehozása
- Script-ID: 13
  Fejezet-ID: C5
  Timeline: Claude Code limitbe futott? Próbáld helyi modellel
  Kliptípus: b-roll
  Leírás: számítás és határesetek tesztje
- Script-ID: 14
  Fejezet-ID: C5
  Timeline: Claude Code limitbe futott? Próbáld helyi modellel
  Kliptípus: talking head
  Leírás: helyi modell korlátainak összegzése
- Script-ID: 15
  Fejezet-ID: C6
  Timeline: Claude Code limitbe futott? Próbáld helyi modellel
  Kliptípus: talking head
  Leírás: igazolt eredmény és emberi ellenőrzés
- Script-ID: 16
  Fejezet-ID: CTA
  Timeline: Claude Code limitbe futott? Próbáld helyi modellel
  Kliptípus: talking head
  Leírás: rögzített csatorna-CTA
</production-note>
```

## Átadás review-ra

- Ellenőrzendő állítások és saját technikai próbák:
    - **S1 / C4.1:** Ollama települ és indul Apple M2 Pro 16 GB gépen; képernyőn ne látszódjon gépazonosító.
    - **S2 / C4.2:** `gemma4:e4b` betölt, elegendő memóriával és dokumentált kontextusbeállítással fut.
    - **S3 / C4.3:** az aktuális `ollama launch claude --model gemma4:e4b` út tényleg a helyi modellt használja; fiók-, hozzáférési és API-feltételek tisztázva.
    - **S4 / C4.4–C5:** kalkulátor létrejön; 80 000 Ft és 100 000 Ft inputra 20 000 Ft profitot és 20% árrést ad; nulla és negatív input érthető hibát jelez.
    - **S5 / C1, C6:** bemutatott demó és összegző mondatok csak a ténylegesen rögzített teszteredményt állítják.
- Nyitott tervezési akadályok: a helyi modell és agent integráció nincs ténylegesen kipróbálva; felvétel előtt ellenőrizni kell a pontos Ollama/Claude Code verziót, context-window beállítást, hozzáférési módot és a kalkulátor összes tesztjét. Ha az integráció nem helyi vagy a 16 GB memória kevés, a modell-/telepítési részt frissíteni kell.
- Átadás: review-ra kész szöveg, technikai demója még nincs igazolva.
