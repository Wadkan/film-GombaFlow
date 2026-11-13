# Scriptreview — Claude Code limitbe futott? Próbáld helyi modellel

- Témaazonosító: `2-unlimited-claude-code-for`
- Ellenőrzött bemeneti változatok: jóváhagyott `0-brief.md`, `1-story.md`, `1-thumbnail-prompt.md`, `1-outline-hyperframes-brief.md`, `2-chapters.md`; forrás: `source-transcript.md`; script: `3-script.md` első változat.
- Döntés: **nem felelt meg**
- Rövid indoklás: a kötött struktúra, az outline, a CTA és a felvételi azonosítók rendben vannak. A scriptből viszont hiányzik néhány végrehajtható demódöntés és a C3 szükséges költség-/hozzáférés-magyarázata; a közös storytelling-stílus kötelező vállalkozói humora sem jelenik meg. Ezeket a 3. lépés scriptjében kell javítani.

## Lefedett ellenőrzések

- Ellenőrzés: Inputok aktualitása és template-megfelelés.
- Eredmény és bizonyíték: a brief, történet, thumbnail, Hyperframes-outline, fejezetterv, transcript, felvételi beállítás és parancsszótár mind léteznek és szerepelnek a script fejlécében. A `recording-config.json` értéke `serpenyő`, a script ezt rögzíti. A script tartalmaz minden felső szintű egységet a rögzített sorrendben.
- Kapcsolódó hiba ID: R1, R2

- Ellenőrzés: Forrásmegoldás és saját átdolgozás összhangja.
- Eredmény és bizonyíték: a transcript 00:44–01:43 és 04:32–05:36 szakaszai alapján a script megtartja a Claude Code agent + Ollama helyi modell megoldást, a forrásétól eltérő Gomba Limited kalkulátorral. Nem nevezi a helyi modellt Anthropic Claude-nak. Az OpenCode-ot külön agentként említi; a FreeLLMAPI részleteit a script nem kezeli bizonyítottnak.
- Kapcsolódó hiba ID: nincs

- Ellenőrzés: Kötött fejezetek, kártyák, átvezetések, összehasonlítás és CTA.
- Eredmény és bizonyíték: a `3-script.md` H, O, C1–C6 és CTA egységei a `VIDEO_STRUCTURE.md` sorrendjét követik. A title, thumbnail-felirat és hook ugyanazt a Claude Code-keretkimerülési pain pointot nevezi meg; a hook rögtön vállalja a helyi modell kipróbálását. Az O négy pontja az `1-story.md` és `1-outline-hyperframes-brief.md` szövegével és sorrendjével egyezik. A rögzített CTA szó szerint szerepel. A C2 öt összehasonlítási szempontot tartalmaz, saját mérési szám nélkül.
- Kapcsolódó hiba ID: nincs

- Ellenőrzés: Technikai teljesség, demóállapotok, teljes teszt és határeset terve.
- Eredmény és bizonyíték: C4.1–C4.3 tartalmazza az Ollama telepítését, `gemma4:e4b` letöltését, Claude Code telepítési parancsát, helyi API-változókat és `ollama ps` ellenőrzést. C4.4 promptja és C5 tesztje még nem rögzíti az alkalmazás konkrét fájl-/futtatási szerkezetét. A kontextus „elég és a gépen elfér” megfogalmazása nem ad beállítható értéket. A funkcionális próba későbbi feladatként helyesen van jelölve; az elmaradt saját teszt önmagában nem review-hiba.
- Kapcsolódó hiba ID: R1, R2

- Ellenőrzés: Ígéret, eredmény, költségek, felügyelet és bizonyítékstátusz.
- Eredmény és bizonyíték: a hook és C1/C6 eredményét a script saját projektben még nem igazoltnak jelöli; a tesztben szerepel normál bemenet, nulla és negatív bemenet, emberi kódellenőrzés. A C2 kvalitatív összehasonlítása nem talál ki megtakarítást. A C3 narráció viszont nem magyarázza el a helyi modell költségét és hozzáférési feltételeit; a kérdés csak nem felolvasandó produkciós megjegyzésben jelenik meg.
- Kapcsolódó hiba ID: R3

- Ellenőrzés: Lendület, ismétlések, túlmagyarázás és hangvétel.
- Eredmény és bizonyíték: a magyarázat logikusan jut a kész demótól az eszközökön át a megvalósításig. A Gomba Limited csak példaelnevezésként jelenik meg; a közös `style.md` bőséges, humorosan túlzó vállalkozói zsargont kér, ebből a narráció gyakorlatilag semmit nem használ. A C4.3 és C4.4 szövegében több „most”/„most jön” fordulat ismétli a következő lépés bejelentését.
- Kapcsolódó hiba ID: R4

- Ellenőrzés: Nézői/felvételi sorrend és adatvédelem.
- Eredmény és bizonyíték: nézői szerkezet helyes, a forgatási rend pedig előbb veszi fel a beállítást és teszteket, majd a kész megoldást és a talking head részeket. A script előírja, hogy ne jelenjen meg gépazonosító, valódi API-kulcs, ügyféladat vagy titok.
- Kapcsolódó hiba ID: nincs

- Ellenőrzés: Felvételi jelölések a `3-script-template.md` szabályai szerint.
- Eredmény és bizonyíték: a 16 `agent-cue` script-ID-ja egyedi, pozitív és a vágói átadással egyezik; minden `<spoken-cue>` a `serpenyő` varázsszót, a `timeline 2` témaszámot és az egyező script-ID-t használja. A timeline neve egységes és megegyezik a videócímmel; a `talking head` és `b-roll` kliptípusok a parancsszótárból valók. A tagelt blokkok külön kódblokkokban maradnak.
- Kapcsolódó hiba ID: nincs

## Javítandó tételek

- Hiba ID: R1
- Besorolás: blokkoló
- Dokumentum, fejezet, művelet vagy szakasz: `3-script.md`, C4.4 / script-ID 12 és C5 / script-ID 13.
- Megállapítás és bizonyíték: a generálási prompt egy „egyszerű, egyoldalas kalkulátort” kér, de nem határozza meg a konkrét fájlokat, technológiát és indítási módot. Csak „rövid indítást” kér a modelltől; emiatt a várható output és a néző által reprodukálható futtatás nincs előre rögzítve.
- Konkrét javítás: szűkítsd a feladatot egy önálló `index.html` fájlra beágyazott HTML/CSS/JavaScript-tel, külső csomag és hálózati függőség nélkül. Rögzítsd, hogyan nyitja meg a készítő macOS-en, és a tesztben ugyanazt a fájlt használja.
- Legkorábbi felelős lépés: 3 — `3-script.md`.

- Hiba ID: R2
- Besorolás: blokkoló
- Dokumentum, fejezet, művelet vagy szakasz: `3-script.md`, C4.2 / script-ID 8–9.
- Megállapítás és bizonyíték: a kontextusbeállítás csak annyit mond, hogy „kódolási feladathoz elegendő” és „a gépen is elfér”; nincs pontos érték vagy beállítási mód. Az Ollama Claude Code útmutatója legalább 32K kontextust javasol, az Ollama Launch útmutatója 64K-t ajánl; a script M2 Pro 16 GB gépre választ modellt, de nem rögzít ténylegesen kipróbált, oda illő értéket.
- Konkrét javítás: adj meg konkrét Ollama-verziót és kontextushosszt, a 16 GB-os gépen történő próba után. Írd le, hol állítja ezt a készítő, és hogyan ellenőrzi, hogy a választott modell a Claude Code-dal betölthető. Ha 32K vagy 64K nem fér el, válassz kisebb modellt vagy szűkítsd az ígéretet.
- Legkorábbi felelős lépés: 3 — `3-script.md`; a szükséges érték saját demópróbával igazolandó.

- Hiba ID: R3
- Besorolás: blokkoló
- Dokumentum, fejezet, művelet vagy szakasz: `3-script.md`, C3 / script-ID 5, és C2 / script-ID 4.
- Megállapítás és bizonyíték: a C3 narráció nem mondja el, hogy helyi inferenciánál nincs modellprovideri tokendíj, de a gép, áram és tárhely költsége megmarad; a Claude Code hozzáférési feltételeit sem mondja ki a nézőnek. Ez a különbség csak nem felolvasandó produkciós jegyzetben szerepel. A `VIDEO_STRUCTURE.md` C3 egysége előírja az ingyenes/fizetős, account/API-igény és fő korlát rövid ismertetését.
- Konkrét javítás: adj 1–2 felolvasható mondatot a C3-ba arról, hogy a konfigurált helyi végpont a modellkérést az Ollama helyi címére küldi, a helyi modell nem számol provideri tokenhasználatot, de a gép és áram költsége megmarad; külön jelezd az Anthropic-alapú bejelentkezés/API-hozzáférés és a helyi Ollama-token eltérését az aktuális konfigurációra hivatkozva.
- Legkorábbi felelős lépés: 3 — `3-script.md`.

- Hiba ID: R4
- Besorolás: blokkoló
- Dokumentum, fejezet, művelet vagy szakasz: `3-script.md`, narrációk összessége, különösen C1 / script-ID 3, C4.4 / script-ID 12 és C6 / script-ID 15.
- Megállapítás és bizonyíték: a közös `style.md` a Gomba Limited visszatérő, humoros vállalkozói kerete mellett bőséges és tudatosan túlzó multis/trendi zsargont kér. A script csak a Gomba Limited nevét említi, és nem ad felismerhető üzleti zsargonos, humoros fordulatot.
- Konkrét javítás: tegyél be néhány rövid, természetesen kimondható vállalkozói zsargonos poént a Gomba Limited helyzetébe, de a számítás és a technikai magyarázat maradjon egyértelmű. Ne zsúfold tele a telepítési parancsokat vagy az összehasonlító tényeket poénnal.
- Legkorábbi felelős lépés: 3 — `3-script.md`.

## Forgatás előtt ténylegesen ellenőrizendő

- C4.1 / S7 → Ollama telepítése és indítása M2 Pro 16 GB gépen; személyes azonosító ne kerüljön felvételre.
- C4.2 / S8–S9 → `gemma4:e4b` tényleges modellmérete, kontextusbeállítása, memória- és válaszideje az adott gépen.
- C4.3 / S10–S11 → Claude Code aktuális verziója; Node.js 18+; `ANTHROPIC_AUTH_TOKEN=ollama` és `ANTHROPIC_BASE_URL=http://localhost:11434`; az `ollama ps` igazolja, hogy a kódolási kérés alatt a helyi modell fut.
- C4.4–C5 / S12–S14 → az egyfájlos kalkulátor felépítése, futása, számítása és nulla/negatív input kezelése.
- C1/C6 / S3 és S15 → a bemutatott és elmondott eredmény igazodjon a tényleges teszthez; ne szerepeljen teszteletlen állítás.
- C2/C3 / S4–S6 → hozzáférési és költségállítások legyenek összhangban a tényleges helyi végponttal és az aktuális csomagfeltételekkel.

## Következő kapu

- A blokkoló R1–R4 tételek javítása után a `3-script.md` ismételt review-ja szükséges. Megfelelt review után a felhasználó külön elfogadja a scriptet; a 5. forgatás-előkészítési lista csak ezután készülhet.
