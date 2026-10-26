# Workflow — gomba-0-idea-collector

## Feladat

A cél népszerű, gyorsan reprodukálható technikai megoldások megtalálása, amelyekből saját YouTube-videókat készíthetek.

## Kutatási feltételek

- **Forrás:** kizárólag YouTube.
- **Publikálás:** elmúlt 7 nap, minimum életkor nélkül.
- **Nézettség:** legalább 5000 megtekintés.
- **Videóhossz:** legfeljebb 25 perces forrásvideókat keress; a belőlük készülő saját videó legfeljebb 15 perces legyen.
- **Rangsorolás:** nézettség szerint csökkenő sorrendben.
- **Témák:** AI, n8n, NLP, AI-agentek, üzleti automatizáció, API-integrációk, webalapú üzleti rendszerek.
- **Fókusz:** valós vállalkozói pain pointokra fejlesztők által bemutatott konkrét technikai megoldások.
- **Kötelező:** tényleges implementáció, működő demo vagy gyakorlati workflow-bemutató.
- **Kizárandó:** AI-hírek, véleményvideók, elméleti tartalmak és demonstráció nélküli termékbemutatók.

## Reprodukálhatóság értékelése

Minden videóhoz rendelj 1–5 pontot a saját, működő demonstráció elkészítésének becsült előkészületi ideje alapján:

- **5:** Maximum 30 perc – kész workflow vagy API.
- **4:** 30–60 perc – minimális saját fejlesztés.
- **3:** 1–3 óra – mérsékelt fejlesztés.
- **2:** 3–8 óra – komplex implementáció.
- **1:** 8+ óra – jelentős fejlesztés vagy infrastruktúra.

A becslés tapasztalt fejlesztőre vonatkozzon, AI-kódolási segítséggel. Részesítsd előnyben a lokális, Docker- és n8n-alapú megoldásokat. Ha nincs elegendő információ, a pontszám legyen `null`.

## Elvárt kimenet

**TOP 10 videó**, mindegyikhez:

- Cím, URL, publikálási dátum, nézettség.
- Megoldott üzleti probléma (pain point).
- Bemutatott technológia és megoldás.
- Reprodukálhatóság (1–5), becsült idő, rövid indoklás.

## Eredményfájl létrehozása

A kutatás kész eredményét külön Markdown-fájlba mentsd a
`skill-description/gomba-0-idea-collector/results/` mappába. A fájlnév
formátuma `YYYYMMDD-ideas.md`, ahol a dátum a kutatás napja, például
`20261025-ideas.md`. A dátum a fájl nevében és az eredmény címében is
szerepeljen. Meglévő fájlt ne írj felül; azonos napi ismételt futásnál
használj sorszámot, például `20261025-ideas-2.md`. Ha a mappa hiányzik,
hozd létre.

A Gomba 0 lista sorszámai rangsorok, nem Gomba 1 ID-k. A Gomba 1 transcript
CLI a kiválasztott videóhoz rendelt ID-t az adott ötletbe írja, még a letöltés
előtt; az ID forrása a Gomba 1 registry.
