# Történet — Claude Code limitbe futott? Próbáld helyi modellel

- Témaazonosító: `2-unlimited-claude-code-for`
- Bemeneti változatok és briefjóváhagyás: `0-brief.md` elfogadott; Ollama + Claude Code a fő út, kezdő vállalkozói közönség, Mac-demó, 6–8 perc. Forrás: `source-transcript.md`, Gomba 0 bejegyzés `20261025-ideas.md`.

## Saját történet

- Saját helyzet és példa: a fiktív Gomba Limited egy egyszerű ajánlati árrés-kalkulátort szeretne készíteni. A fejlesztés félbeszakad, amikor a Claude Code használati kerete elfogy; a csapat azt vizsgálja meg, hogy egy helyi modell használható-e ugyanebben a fejlesztői eszközben egy kicsi, ellenőrizhető feladatra.
- Kiinduló probléma → megoldás → eredmény: a felhőmodell kerete vagy díja korlátozhatja a munkát → telepítjük az Ollamát, kiválasztunk a demógéphez illeszkedő helyi modellt, és Claude Code-ot az Ollama-integrációhoz kapcsoljuk → a modell elkészíti a kalkulátor egy kis, futtatható változatát, amelyet kézi próbákkal ellenőrzünk. Ez terv, nem már kipróbált eredmény.
- Megtartott működés és forráshivatkozás: ugyanaz a Claude Code agent marad, a mögötte dolgozó modell helyére helyi Ollama-modell kerül; forrás: `[F2]` a briefben, transcript 00:44–01:43 és 04:32–05:36. A helyi modell nem Anthropic Claude.
- Átdolgozott elemek: a forrás MacBookján bemutatott kalkulátor helyett fiktív Gomba Limited ajánlati árrés-kalkulátora szerepel; a három út közül a helyi Ollama-út kap részletes bemutatást, a FreeLLMAPI és OpenCode csak rövid választási alternatíva. Nem állítunk automatikus költségmegtakarítást, korlátlan használatot vagy azonos modellminőséget.

## Hook

- Elmondandó szöveg: „Megállt a Claude Code, mert elfogyott a kereted? Megmutatom, hogyan kötheted össze az Ollamával futó helyi modellel — aztán kipróbáljuk, elkészít-e egy egyszerű ajánlati kalkulátort a Gomba Limitednek.”
- Pain point: fejlesztési feladat közben elfogyó Claude Code használati keret.
- Azonnali vállalás: megmutatom a helyi modellhez csatlakoztatást, majd egy kis kódolási feladaton ellenőrizzük, mire elég.
- Bemutatandó tartalom: a kalkulátor egyszerű, működő felülete és a Claude Code terminál; címkén: „Kereten túl?”; a képernyőn egy valós tesztinput és az abból számolt árrés. A hookot csak a tényleges saját próba után szabad kész eredményként felvenni.
- Ígéret ellenőrzésének alapja: a csatlakoztatás helyességét az Ollama hivatalos integrációs útmutatója `[F2]` támasztja alá; a kalkulátor elkészülését, futását és számolását a készítőnek kell ténylegesen kipróbálnia és ellenőriznie. Az idő, minőség és költség nincs előre igazolva.

## O — Mit mutatok meg?

- Outline bulletpointjai:
    - Megnézzük, mit jelent a Claude Code keretének elfogyása, és mi fut helyben.
    - Összekötjük a Claude Code-ot egy, a Macünkhöz választott Ollama-modellel.
    - Elkészítünk és kipróbálunk egy kis Gomba Limited árrés-kalkulátort.
    - Megmutatom, milyen kompromisszumokkal jár a helyi modell, és mikor érdemes másik utat választani.
- Sorrend és cím/hook összhang: a hook után azonnal ez a rövid outline jön; a keret elfogyása és a helyi modellel végzett, ellenőrizhető próba ugyanazt az ígéretet viszi tovább.
- Hyperframes-brief: `1-outline-hyperframes-brief.md`.

## Történetvezetés a közös struktúrában

- **H — Hook:** a keret elfogyásának konkrét helyzetéből azonnal vállaljuk a helyi modell és a kalkulátor kipróbálását.
- **O — Mit mutatok meg?:** röviden előre jelezzük a csatlakoztatás, demó és kompromisszumok sorrendjét.
- **C1 — A kész megoldás:** előbb a tervezett, ténylegesen elkészült kalkulátort mutatjuk be röviden; felvételkor csak igazolt demóállapot szerepelhet.
- **C2 — Előtte és utána:** a keret elfogyásakor megálló felhőalapú munkát vetjük össze a helyi modell próbájával; pénz- és időnyereséget mérés nélkül nem állítunk.
- **C3 — Szükséges szolgáltatások:** Claude Code mint agent, Ollama mint helyi modellfuttató, valamint az adott Mac és modell követelményei; FreeLLMAPI és OpenCode csak rövid alternatíva.
- **C4 — Megvalósítás:** telepítjük az Ollamát, kiválasztjuk a géphez illő modellt, összekötjük a Claude Code-dal, és minden szakasz után ellenőrizzük az állapotot.
- **C5 — Teszt és korlátok:** valós, mesterséges tesztadatokkal végigfuttatjuk a kalkulátort, ellenőrizzük az eredményt, és megmutatunk legalább egy hibás vagy szélső inputot. A futásidőt, minőséget, memóriát és esetleges hibákat a készítő rögzíti.
- **C6 — Mit oldottunk meg?:** összefoglaljuk, hogy a helyi modell alkalmas volt-e erre a kis példára, és mi maradt emberi ellenőrzésre.
- **CTA — Következő lépés:** a `VIDEO_STRUCTURE.md` rögzített CTA-szövege változtatás nélkül.

## Állítások és átadás

- Igazolást igénylő állítások:
    - Az Ollama és Claude Code helyi modell integrációja → brief `[F2]` és `[F3]`; futtatáskor a használt verziók rögzítendők.
    - A kiválasztott modell futtathatósága az adott Macen → modellméret, memóriaigény, kontextus és tényleges gépadatok ellenőrzendők a felvétel előtt.
    - A kalkulátor elkészülése és számolása → készítői funkcionális próba szükséges; a várt és tényleges eredményt külön kell jelölni.
    - Költség- és időösszevetés → mérés hiányában csak minőségi, korlátozott megfogalmazás.
- Nyitott akadályok: a konkrét demógép chipje és memóriája, a modellválasztás, valamint az árrés-kalkulátor tesztesetei még felvétel előtt rögzítendők. A 6–8 perces cél miatt a részletes FreeLLMAPI- és OpenCode-telepítés kimarad.
- Átadás: a történet, thumbnail- és outline-terv a felhasználó jóváhagyására vár.
