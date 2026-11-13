# Forgatás előtti felkészülés — Claude Code limitbe futott? Próbáld helyi modellel

- Témaazonosító: `2-unlimited-claude-code-for`
- Bemeneti változatok: `0-brief.md`, `3-script.md` első változat; `4-review.md` nem felelt meg; a felhasználó 2026-11-13-án kifejezetten elfogadta a scriptet, és kérte a továbblépést javítás nélkül.
- Emberi scriptjóváhagyás: felhasználói üzenet ebben a beszélgetésben, 2026-11-13. Ez az elfogadás a felhasználó döntése; a `4-review.md` nem-megfelelt döntését nem módosítja.

Ez készítői lista, nem a nézőnek felolvasandó script. Az alábbi feladatok tervezettek, semmi nincs elvégzettnek jelölve.

## Eszközök és hozzáférések

- Igény ID: E1
- Eszköz/szolgáltatás és szerep: Ollama — helyi Gemma 4 E4B modell letöltése és helyi futtatása.
- Telepítés/regisztráció helye, szükséges verzió: https://ollama.com/download; macOS alkalmazás; a telepítéskori aktuális stabil verziót feljegyezni. Modell: `gemma4:e4b`, https://ollama.com/library/gemma4.
- API-kulcs, jogosultság, előfizetés igénye: helyi inferenciához provider API-kulcs nem kell; a script a `ANTHROPIC_AUTH_TOKEN=ollama` értéket helyi kompatibilitási tokenként használja, nem valódi titokként.
- Költség/limit és forrás, ellenőrzési dátum: modellletöltés és helyi használat előtt ellenőrizd a letöltési méretet, tárhelyet és Ollama aktuális feltételeit; villamosenergia- és saját hardverköltség van. Ár/limit adatot ne állíts a felvételben forrásellenőrzés nélkül. Forrás: Ollama modelloldal; ellenőrzési dátum: 2026-11-13.
- Fejezet-ID-k: C1, C2, C3, C4.1, C4.2, C4.3, C4.4, C5, C6.

- Igény ID: E2
- Eszköz/szolgáltatás és szerep: Claude Code — agent, amely fájlokat olvas és módosít.
- Telepítés/regisztráció helye, szükséges verzió: Anthropic hivatalos telepítési útmutató: https://docs.anthropic.com/en/docs/claude-code/getting-started; Node.js 18+; Claude Code aktuális verziójának rögzítése.
- API-kulcs, jogosultság, előfizetés igénye: a normál belépési mód Anthropic-előfizetést vagy Console API-hozzáférést használhat. A helyi Ollama kompatibilitási beállítás mellett ténylegesen próbáld ki, kér-e külön Anthropic-bejelentkezést; valódi kulcsot ne kérj be és ne mutass kamerán.
- Költség/limit és forrás, ellenőrzési dátum: aktuális hozzáférési és ár-feltételeket felvételkor ellenőrizd az Anthropic hivatalos útmutatójában; ebben a listában nincs rögzített ár. https://docs.anthropic.com/en/docs/claude-code/getting-started; ellenőrzési dátum: 2026-11-13.
- Fejezet-ID-k: C2, C3, C4.3, C4.4, C5.

- Igény ID: E3
- Eszköz/szolgáltatás és szerep: MacBook Pro, Apple M2 Pro, 16 GB memória — demógép.
- Telepítés/regisztráció helye, szükséges verzió: azonosított gép; a forgatás előtt ellenőrizd az elérhető tárhelyet, macOS-verziót és az Ollama/Claude Code verziókat.
- API-kulcs, jogosultság, előfizetés igénye: nincs külön hozzáférés; ne vedd fel a gép sorozatszámát, UUID-ját vagy más azonosítóját.
- Költség/limit és forrás, ellenőrzési dátum: saját gép és áram; a 16 GB megoszlik a rendszer, Ollama és modell között, ezért a memória-alkalmasság próba nélkül nem garantált. Gépadat felvétele: 2026-11-12.
- Fejezet-ID-k: H, C1, C2, C4.1, C4.2, C4.3, C4.4, C5, C6.

## Előkészítési sorrend

- [ ] Szabad tárhely, macOS-verzió és személyes azonosítókat nem mutató képernyő ellenőrzése → E3, C4.1; előfeltétel: demógép rendelkezésre áll; kész állapot: chip, memória, OS és szabad tárhely feljegyezve.
- [ ] Ollama telepítése és elindítása → E1/E3, C4.1; előfeltétel: elegendő tárhely; kész állapot: Ollama fut és aktuális verziója feljegyezve.
- [ ] `gemma4:e4b` modellméretének és kontextusbeállításának ellenőrzése, majd modellletöltés → E1/E3, C4.2; előfeltétel: Ollama fut; kész állapot: letöltés befejeződött, modell egyszerű prompttal válaszol, a tényleges memóriahasználat feljegyezve.
- [ ] Claude Code telepítése és Node.js 18+ ellenőrzése → E2, C4.3; előfeltétel: Ollama-modell elindul; kész állapot: `claude --version` választ ad.
- [ ] Ugyanabban a shellben helyi API-környezet beállítása, majd Claude Code indítása: `ANTHROPIC_AUTH_TOKEN=ollama`, `ANTHROPIC_BASE_URL=http://localhost:11434`, `claude --model gemma4:e4b` → E1/E2, C4.3; előfeltétel: Ollama fut, Claude Code telepítve; kész állapot: Claude Code válaszol, és az `ollama ps` a kérés alatt `gemma4:e4b`-t mutat.
- [ ] Kalkulátor-projekt létrehozása és statikus fájl indítási módjának rögzítése → E2/E3, C4.4; előfeltétel: a helyi Claude Code-út igazolt; kész állapot: projektfájlok, indítási lépés és kódellenőrzés készen áll.
- [ ] A R1–R4 review-javítások kihagyásának elfogadása mellett a nyitott kockázatok tudatosítása → C4.2–C4.4, C3; kész állapot: a demó tesztjei a saját projektben elvégezve. A scriptreview R1 fájl-/technológiadöntést, R2 pontos kontextusértéket, R3 hozzáférési/költségnarrációt, R4 stíluselemeket jelöl továbbra is megoldatlanul.

## Példaadatok és demóállapotok

- Fejezet-ID: C1
- Maszkolt/szintetikus adat: önköltség `80 000 Ft`, ajánlati ár `100 000 Ft`.
- Előkészítendő állapot: kalkulátor megnyitható, számítás kézzel ellenőrizve.
- Felvételhez szükséges látható eredmény: `20 000 Ft` profit és `20%` árrés; eltérő eredmény esetén ne vedd fel működő kimenetként.

- Fejezet-ID: C4.4, C5
- Maszkolt/szintetikus adat: nulla és negatív ármező-bemenetek; nincs ügyféladat.
- Előkészítendő állapot: kalkulátor validációval; a konkrét fájl- és futtatási módot a script nem rögzíti, ezt a demó előtt tisztázni kell.
- Felvételhez szükséges látható eredmény: nulla vagy negatív értékre egyértelmű hiba, hibás százalékszámítás nélkül.

- Fejezet-ID: C4.2, C4.3, C5
- Maszkolt/szintetikus adat: kódoló agentnek adott egyszerű árrésszámító prompt.
- Előkészítendő állapot: a `gemma4:e4b` a helyi Ollama-végponton fut, API-tokenje kizárólag a szó szerinti helyi `ollama` érték.
- Felvételhez szükséges látható eredmény: az `ollama ps` a Claude Code-válasz alatt mutatja a modellt; a válaszidőt csak mérés után számszerűsítsd.

## Saját technikai próbák és állításellenőrzés

- [ ] C4.1–C4.3 → Ollama és Claude Code telepítése, helyi környezetváltozók, `ollama ps`; elvárt: a kódolási kérés közben a helyi `gemma4:e4b` modell fut; külön rögzítsd, kér-e a kliens külső azonosítást.
- [ ] C4.2 → `gemma4:e4b` kontextus- és memóriahasználata az M2 Pro 16 GB gépen; elvárt: modell betölt és Claude Code-feladatra válaszol. A pontos kontextusértéket még meg kell választani és rögzíteni.
- [ ] C4.4–C5 → normál, nulla és negatív bemenet; elvárt: a helyes profit/árrés, hibás bemeneteknél validáció.
- [ ] C2/C3 → hasonlítsd össze a helyi modellt a választott Claude-hozzáféréssel; minden idő-/költségszámhoz legyen dátumozott forrás vagy saját mérés; különítsd el a helyi tokenhasználatot a Claude Code hozzáférési feltételeitől.

## Felvételi készültség

- [ ] H és C1 → csak sikeres integrációs és kalkulátorteszt után vedd fel az elfogyó keretre adott hookot és a kész megoldás bemutatóját.
- [ ] C2/C3 → a csomag/API-hozzáférés és költségek aktuális feltételeit ellenőrizd, és a scriptben rögzített állításokat igazítsd hozzájuk.
- [ ] C4.2–C4.4 → rögzítsd a modellverziót, kontextust, telepítési lépést, appfájlokat és indítási parancsot; a jelenlegi script ezek közül többet nyitva hagy.
- [ ] C5/C6, majd talking head H/C2/C3/C6/CTA → előbb legyenek meg a teszteredmények, képernyőfelvételek és korlátozások; az összefoglaló, hook és CTA felvételi állításait ezek után véglegesítsd.

## Átadás

- Scriptfüggőségek lefedése: E1–E3 lefedi a scriptben említett eszközöket, helyi modellt, Mac hardvert, mesterséges adatokat és funkcionális próbákat.
- Nyitott akadályok: a script `4-review.md` szerint nem felelt meg. A felhasználó kérésére az R1–R4 javítása nélkül továbbléptem; a `gemma4:e4b` kontextus, a kalkulátor pontos megvalósítása/futtatása és a C3 narráció tényei forgatás előtt tisztázandók.
- Átadás: a felkészülési lista elfogadásra kész; sem telepítés, sem tényleges demópróba nem történt.
