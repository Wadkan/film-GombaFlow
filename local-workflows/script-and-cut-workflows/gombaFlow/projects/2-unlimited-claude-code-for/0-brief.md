# Brief — Claude Code helyi modellel, Ollama segítségével

- Projektazonosító: `2-unlimited-claude-code-for`
- Kiválasztott videóbejegyzés: `20261025-ideas.md` — “Unlimited Claude Code For Free (Runs On Your Computer)”, https://www.youtube.com/watch?v=K8lVHiFnN2A
- Bemeneti változatok: a felhasználó által megadott `source-transcript.md`; Gomba 1 ID `2-unlimited-claude-code-for`.
- Kiválasztott forrásvideó: Sharbel A., “Unlimited Claude Code For Free (Runs On Your Computer)”, https://www.youtube.com/watch?v=K8lVHiFnN2A
- Elemzés alapja és korlátai: a teljes, időbélyeges angol transcript és az alábbi hivatalos Ollama- és OpenCode-dokumentáció. A YouTube-videó képi része közvetlenül nem volt hozzáférhető, ezért a képernyőn látott részleteket a transcript önmagában nem igazolja. A transcript egyes termék- és modellneveit félrehallotta; a helyes Claude Code/Ollama parancsot és jelenlegi integrációt hivatalos Ollama-forrásból ellenőriztem. A FreeLLMAPI leírás- és repository-linkje nem szerepel az elérhető inputban, ezért annak telepítési részletei nem tekinthetők ellenőrzöttnek.

## Videóbrief

- Üzleti probléma: Claude Code használatának díja vagy használati kerete akadályozhatja a megszakítás nélküli kódolási munkát; a helyi futtatásnál viszont a költség helyett a saját gép erőforrása, sebessége és a modell képessége a korlát.
- Célközönség és előismeret: kezdő vagy középhaladó, vállalkozói/alkotói közönség, aki érdeklődik az AI-kódolás iránt, de nem feltétlenül ismeri a modellek és a kódoló agentek különbségét. **Javaslat:** Macen bemutatni; a konkrét chip- és memóriakövetelményt felvétel előtt azonosítani kell.
- Ígéret: bemutatjuk, hogyan csatlakoztatható a Claude Code egy Ollamával helyben futtatott modellhez, és hogyan próbálható ki egy kicsi, ellenőrizhető kódolási feladaton. Ez nem Claude-modell helyi futtatása és nem garantál ingyenes, korlátlan vagy az előfizetésessel azonos minőségű használatot.
- Scope és kizárások: fő demó az Ollama + Claude Code helyi modell út. Röviden megkülönböztetjük a FreeLLMAPI felhőszolgáltatói kvótákra épülő útját és az OpenCode-ot, mint külön agentet, de azok beállítását és működését nem építjük végig. Nem ígérünk teljesítményparitást, minden gépre megfelelő modellt vagy költségmentességet (áram, hardver, letöltés, külső szolgáltatások). Nem kérünk és nem mutatunk valódi API-kulcsot vagy bizalmas kódot.
- Tervezett videóhossz: **6–8 perc**, felhasználói döntés.
- Hangvétel és saját fordulatok: gyakorlatias, magyarázó, természetes magyar beszéd; visszatérő fiktív példa a Gomba Limited, könnyed vállalkozói zsargonnal és annak humoros túlzásával. A zsargon nem fedheti el a technikai döntéseket.

## A forrás megoldása és az átdolgozás

- Input → fő feldolgozási lépések → output: fejlesztői gép és helyi modell → Ollama telepítése, a géphez illő kódolómodell kiválasztása, Claude Code-hoz csatlakoztatása → próbakódolási feladat és futtatható eredmény ellenőrzése.
- Fő eszközök és korlátok:
    - [F1] Forrásvideó transcript — a beszélt állítások és időbélyegek; a képi konfigurációkat nem igazolja.
    - [F2] [Ollama — Claude Code with Anthropic API compatibility](https://registry.ollama.com/blog/claude) — hivatalosan dokumentálja a helyi Ollama-modell és Claude Code összekapcsolását, a beállítási útmutatót és a `claude --model` futtatási példát.
    - [F3] [Ollama Launch](https://ollama.com/blog/launch) — hivatalosan dokumentálja az `ollama launch claude` integrációt és modellválasztást.
    - [F4] [Ollama Qwen3-Coder modellek](https://ollama.com/library/qwen3-coder) — modellméretet és futtatási adatokat ad; a tényleges választást a demógép memóriájához, kontextushosszához és képességigényéhez kell igazítani.
    - [F5] [OpenCode hivatalos termékoldal](https://opencode.ai/product) — alátámasztja, hogy az OpenCode külön, nyílt forrású agent, többféle modellel.
- Megtartjuk: a modell (az „agy”) és az agent eszköz (a „keret”) különbségét; a helyi futtatás adatkezelési előnyét; a memória-, sebesség- és minőségi kompromisszumot; a valódi kódolási feladaton végzett funkcionális próbát.
- Átdolgozzuk: a fő út egyetlen reprodukálható Mac-demó lesz a Gomba Limited fiktív projektjén. A „free/unlimited” címígéretet pontosítjuk: a helyi modell nem Anthropic Claude, a gép erőforrásai és ideje korlátot jelentenek. A forrásban felsorolt modellajánlásokat nem vesszük át ellenőrzés nélkül; aktuális, hivatalos modelladat és a demógép specifikációja alapján választunk.

## Forrásjegyzék

- **F1 — Transcript:** `projects/2-unlimited-claude-code-for/source-transcript.md`; teljes átirat 00:00–12:14. Igazolja a beszélt lépéseket, a három útvonal említését és a bemutatott próba narrációját. Korlát: automatikus átiratként több név hibás, a képernyőn látható lépésekre nem bizonyíték.
- **F2 — Ollama Claude Code integráció:** https://registry.ollama.com/blog/claude. Igazolja az integráció támogatását, a konfigurációt és a helyi modellel indítást. Korlát: a kompatibilitás nem bizonyítja minden modell azonos működését vagy az előfizetéses Claude minőségét.
- **F3 — Ollama Launch:** https://ollama.com/blog/launch. Igazolja az `ollama launch claude` kényelmi parancsot és az integrációt. Korlát: a szükséges alkalmazásverzió és modellkövetelmény a felvétel előtt ellenőrizendő.
- **F4 — Qwen3-Coder modelloldal:** https://ollama.com/library/qwen3-coder. Igazolja az elérhető modellváltozatok és méretek adatait. Korlát: a gép tényleges kompatibilitását és demóminőségét külön ki kell próbálni.
- **F5 — OpenCode termékoldal:** https://opencode.ai/product. Igazolja, hogy az OpenCode külön agent és többféle modellel használható. Korlát: a FreeLLMAPI-vel való összevetést nem támasztja alá.

## Tisztázás és átadás

- Egyeztetett döntések: Ollama + Claude Code a fő demó, FreeLLMAPI és OpenCode rövid alternatíva; kezdő vállalkozók a célközönség; Mac a demóplatform; 6–8 perces célhossz. A felhasználó 2026-11-12-én jóváhagyta a brief javasolt fókuszát és közönségét, a videóhosszt 6–8 percre módosítva.
- Nyitott kérdések: a konkrét Mac chipje és memóriája felvétel előtt rögzítendő; az alternatívák részletes technikai adatai a későbbi lépésekhez csak hivatalos dokumentációval vehetők át.
- Átadás: brief elfogadva; az 1. lépés megkezdhető.
- Emberi jóváhagyás referenciája: felhasználói választás ebben a beszélgetésben, 2026-11-12.
