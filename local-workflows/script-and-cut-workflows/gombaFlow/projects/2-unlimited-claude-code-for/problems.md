## Azonosítatlan bemondás előtti tartományok

- Felhasználói pontosítás: a bemondás előtti 00:00–00:01.65 tartomány a mov01.mov fájlban néma. Az eredeti forrástartomány megőrizve a recording indexben, script-hozzárendelés nélkül.
- Felhasználói pontosítás: a bemondás előtti 00:00–00:00.14 tartomány a mov02.mov fájlban néma. Az eredeti forrástartomány megőrizve a recording indexben, script-hozzárendelés nélkül.

## Bizonytalan retake utasítás

- Felhasználói pontosítás: a script-ID 3 felvételén hallható, 00:56.43–00:58.65, 01:06.75–01:09.47 és 01:21.07–01:23.69 közötti hiányos/hibás bemondásokat `HIBA újra` retake-parancsnak kell tekinteni. A jegyzékben az érintett script-ID 3 rekord a cue utáni tartalmat megtartja; ezeket az intervallumokat nem jelöli kivágásra.

## Hiányzó felvételrészek

- 5 — H1: nincs azonosított felvétel; nincs hozzá forrás. Scriptbeli szöveg: „Claude Code az eszköz, amely kezeli a kódot; Ollama futtatja a modellt a gépeden. A helyi végpont használatakor nincs modellprovideri tokendíj, de a gép, az áram és a modellletöltés költsége megmarad. A Claude Code hozzáférési feltételei a használt belépési módtól és verziótól függenek: ezt a saját konfiguráción ellenőrizzük, és nem ígérünk ingyenes Anthropic-hozzáférést. A helyi modell nem Anthropic Claude, és nem garantál azonos minőséget.” Állapot: döntésre vár.
- 6 — H2: nincs azonosított felvétel; nincs hozzá forrás. Scriptbeli szöveg: „A másik két út máshol fut. A FreeLLMAPI külső szolgáltatók API-kereteit tereli egy közös végpontra, ezért a kód elhagyja a gépet, és az egyes szolgáltatók keretei érvényesek. Az OpenCode pedig másik kódoló agent, nem Claude Code. Most a helyi Ollama-utat építjük végig; a másik kettő nem része a demónak.” Állapot: döntésre vár.
- 7 — H3: nincs azonosított felvétel; nincs hozzá forrás. Scriptbeli szöveg: „Mutasd a gép chipjét és memóriáját a Rendszerbeállításokban, de személyes gépazonosítókat ne. Ezután mutasd az Ollama hivatalos letöltési oldalát, telepítsd az alkalmazást a szokásos macOS telepítővel, nyisd meg, és ellenőrizd, hogy az Ollama fut. Az install UI verziót a felvétel előtt pontosítsd.” Állapot: döntésre vár.
- 8 — H4: nincs azonosított felvétel; nincs hozzá forrás. Scriptbeli szöveg: „Nyisd meg az Ollama hivatalos Gemma 4 oldalát; mutasd a `gemma4:e4b` változatot és a feltüntetett letöltési mérettartományt. Hozz létre egy `Modelfile`-t a következő tartalommal, így a kontextusérték rögzített és újraellenőrizhető:

```text
FROM gemma4:e4b
PARAMETER num_ctx 32768
```

Futtasd: `ollama create gomba-gemma -f Modelfile`, majd `ollama run gomba-gemma`. A 32 768-as kontextus célbeállítás, nem igazolt eredmény: csak akkor folytasd a felvételt ezzel a modellel, ha a Macen a modell betöltődik, válaszol és a Claude Code-feladat közben sem fut memóriahibába. Ha nem, csökkentsd a kontextust vagy válassz kisebb modellt, rögzítsd a tényleges értéket, majd próbáld újra.” Állapot: döntésre vár.

- 9 — H5: nincs azonosított felvétel; nincs hozzá forrás. Scriptbeli szöveg: „Ellenőrizd a verziót az `ollama --version` paranccsal, majd a `ollama show gomba-gemma --modelfile` kimenetében igazold a `PARAMETER num_ctx 32768` beállítást. Indítsd a létrehozott modellt az `ollama run gomba-gemma` paranccsal, és adj neki egy rövid, ártalmatlan promptot, például: „Írj egy JavaScript függvényt, amely kiszámolja az árrést.” Mutasd a tényleges választ. Rögzítsd a verziót és azt, hogy a modell válaszolt-e; válaszidőt csak akkor mondj, ha ténylegesen megméred.” Állapot: döntésre vár.
- 10 — H6: nincs azonosított felvétel; nincs hozzá forrás. Scriptbeli szöveg: „Ha Claude Code még nincs telepítve, ellenőrizd a Node.js verziót (`node --version`), majd az Anthropic által dokumentált telepítést használd: `npm install -g @anthropic-ai/claude-code`. Ezután ugyanabban a terminálablakban állítsd be az Ollama helyi API-címét és az Ollama által dokumentált teszttokent:

```sh
export ANTHROPIC_AUTH_TOKEN=ollama
export ANTHROPIC_BASE_URL=http://localhost:11434
claude --model gomba-gemma
```

Az `ollama` itt nem valódi kulcs, és csak a helyi Ollama-végponthoz tartozik. Claude Code-ban ellenőrizd, hogy elindult; valódi kulcs ne kerüljön felvételre.” Állapot: döntésre vár.

- 11 — H7: nincs azonosított felvétel; nincs hozzá forrás. Scriptbeli szöveg: „Claude Code-ban adj egy rövid, ártalmatlan promptot. Amíg válaszol, egy másik terminálablakban futtasd az `ollama ps` parancsot, és mutasd meg, hogy a `gomba-gemma` helyben fut. Ne kérdezd magát a modellt arról, hogy melyik modell: a választ a helyi folyamatlistával ellenőrizd.” Állapot: döntésre vár.
- 12 — H8: nincs azonosított felvétel; nincs hozzá forrás. Scriptbeli szöveg: „A Claude Code munkamappájában kérd: „Kizárólag egy önálló `index.html` fájlt készíts beágyazott HTML/CSS/JavaScript-tel, külső csomag és hálózati függőség nélkül. Legyen két mező: önköltség és ajánlati ár. Számítsd ki a profitot = ajánlati ár − önköltség, az árrést = profit / ajánlati ár × 100%. Nulla vagy negatív bemenetnél mutass érthető hibát, és ne számolj százalékot. Ne hozz létre más fájlt.” Ellenőrizd, hogy csak az `index.html` változott, olvasd át, majd nyisd meg macOS-en a Finderből dupla kattintással vagy futtasd: `open index.html`. Ne használj fejlesztői szervert vagy telepítést.” Állapot: döntésre vár.
- 13 — H9: nincs azonosított felvétel; nincs hozzá forrás. Scriptbeli szöveg: „A kalkulátorban add meg a 80 000 és 100 000 értéket; ellenőrizd a 20 000 Ft profitot és a 20%-os árrést kézzel. Ezután írd be az ajánlati ár mezőbe a nullát, és mutasd a tényleges validációt. Próbálj negatív költséget is, ha a felület külön kezeli. Csak a valósan megjelenő értékeket mutasd.” Állapot: döntésre vár.
- 14 — H10: nincs azonosított felvétel; nincs hozzá forrás. Scriptbeli szöveg: „Ez a próba azt mutatja meg, hogy ezen a gépen és ezzel a modellel elkészült-e ez a kis kalkulátor. Nem bizonyítja, hogy a helyi modell minden fejlesztési feladatra elég. Cserébe a modell helyben fut, a számítás a saját gépedet terheli, és a válaszidő meg a kód minősége is függ a géptől és a feladattól.” Állapot: döntésre vár.
- 15 — H11: nincs azonosított felvétel; nincs hozzá forrás. Scriptbeli szöveg: „Egy próbánk van; ebből azt mondhatjuk el, amit ténylegesen ellenőriztünk. A Gomba Limited kalkulátoránál [a felvétel előtt mondd el a ténylegesen igazolt eredményt]. A helyi modellnél a gép végzi a számítást, ezért a modell mérete, a memória és a válaszidő számít. A kódot itt is nekünk kell átnézni és tesztelni. Ha több modellválasztás kell, a FreeLLMAPI felhőszolgáltatói keretekkel dolgozik; ha egyszerűbb másik eszköz kell, az OpenCode külön agent. Ezekről ma nem készítettünk összehasonlító próbát.” Állapot: döntésre vár.
- 16 — H12: nincs azonosított felvétel; nincs hozzá forrás. Scriptbeli szöveg: „Ha nem szeretnél lemaradni, iratkozz fel a YouTube-csatornámra! Ha pedig inkább kényelmesen velem végeztetnéd el a munkát, vagy konzultációt kérnél, keress a gombaflow.eu oldalon!” Állapot: döntésre vár.

## Kézi vágást igénylő részek

- 3 — A `HIBA újra` jelzések forrása a T004 felvétel (/Users/wadkan/Projects/film-GombaFlow/local-workflows/script-and-cut-workflows/gombaFlow/projects/2-unlimited-claude-code-for/test_records/mov01.mov), 00:56.43–01:23.69. A hibás próbálkozások vágási határai és az újramondások illesztése nem mindenütt bizonyítható; a teljes forrás 00:43.99–01:39.72 maradjon meg. Timeline: „Claude Code limitbe futott? Próbáld helyi modellel”; markerhelyek az első review timeline elkészülte előtt ismeretlenek. Teendő: kézi összevetés a review timeline-on. Állapot: nyitott, nem blokkolja a terv többi csoportját.
- 4 — A cue az index szerint „Sárpenyő, Timeline 2, Script 4, Sárpenyő”, ami eltér a script „serpenyő” varázsszavától; nincs ellenőrzött azonosítójavítás. Forrás: /Users/wadkan/Projects/film-GombaFlow/local-workflows/script-and-cut-workflows/gombaFlow/projects/2-unlimited-claude-code-for/test_records/mov02.mov 00:00.00–00:24.80. A teljes forrás, cue-val együtt maradjon meg. Timeline: „Claude Code limitbe futott? Próbáld helyi modellel”; markerhelyek a review timeline elkészülte előtt ismeretlenek. Teendő: kézi cue-ellenőrzés. Állapot: nyitott, nem blokkolja önmagában a terv többi csoportját.
- 1 — Az indexben T001 néven szereplő, user által csendesnek igazolt, scripthez nem rendelt előtag (/Users/wadkan/Projects/film-GombaFlow/local-workflows/script-and-cut-workflows/gombaFlow/projects/2-unlimited-claude-code-for/test_records/mov01.mov 00:00.00–00:01.65) képi relevanciája ismeretlen. Hozzárendelést ne találjunk ki; az anyag maradjon meg.
- 4 — Az indexben T005 néven szereplő, user által csendesnek igazolt, scripthez nem rendelt előtag (/Users/wadkan/Projects/film-GombaFlow/local-workflows/script-and-cut-workflows/gombaFlow/projects/2-unlimited-claude-code-for/test_records/mov02.mov 00:00.00–00:00.14) képi relevanciája ismeretlen. Hozzárendelést ne találjunk ki; az anyag maradjon meg.
