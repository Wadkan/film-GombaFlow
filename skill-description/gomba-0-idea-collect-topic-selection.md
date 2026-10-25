# Gomba 0 — Videóötlet-keresés és témaválasztás

## Cél

Egy hívásra kutass megvalósított automatizálási videóötleteket, válaszd ki
a legjobb jelölteket, és mentsd őket egy ember által olvasható fájlba.
Egy másik, felhasználó által meghívott skill a megadott ID alapján egyetlen
témát ad át a scriptírónak. Nincs külön scoring agent, index vagy backlog.

## Skillek és használat

A skillek a [`gomba-0-idea-collector/skills/`](../gomba-0-idea-collector/skills/) alatt vannak (mint a script-writer fázisban):

1. [gomba-0-idea-collect-search-ideas](../gomba-0-idea-collector/skills/gomba-0-idea-collect-search-ideas/SKILL.md)
   — kutatás, összehasonlítás, jelöltek kiválasztása és fájlba mentés.
   Hívás: `/gomba-0-idea-collect-search-ideas`
   Opcionálisan adj témaszűkítést, például „ügyfélszolgálati automatizálás”.
2. [gomba-0-idea-collect-select-topic](../gomba-0-idea-collector/skills/gomba-0-idea-collect-select-topic/SKILL.md)
   — a felhasználó által kiválasztott ID átadása.
   Hívás: `/gomba-0-idea-collect-select-topic <topic-id>`

Az első skill nem választ a felhasználó helyett végleges témát.
A második nem kutat, nem rangsorol újra és nem indít scriptírást.
A rendszer csak hívásra fut; rendszeres futtatásához külső ütemezés kell.

## Fájlok és szerződés

Az alábbi útvonalak a repository gyökeréhez képest értendők.

- Témarekord formátuma:
  [topic-template.json](../gomba-0-idea-collector/templates/topic-template.json).
- Kutatási futásonként egy új, magyar nyelvű eredmény:
  `skill-description/gomba-0-idea-collector/results/<run-id>-ideas.md`.
- A kiválasztandó jelöltek számát kizárólag a kereső skill állítja be;
  ezt a workflow és a többi skill nem ismétli meg.
- A kiválasztott egyetlen teljes rekord:
  `skill-description/gomba-1-script-writer/projects/<topic-id>/selected-topic.json`.
- Következő fázis:
  [scriptíró workflow](../gomba-1-script-writer/WORKFLOW.md), 0. ötletátvétel.

`<run-id>`: a futtatás kezdő időpontja UTC-ben, `YYYYMMDDTHHmmssSSSZ`
alakban; ütközésnél új, egyedi időbélyeg kell, meglévő fájl nem írható felül.
`<topic-id>`: `<run-id>-<rovid-angol-slug>`, kizárólag kisbetűs ASCII
betűkkel, számokkal és kötőjelekkel a slugban. A teljes ID a
`^[0-9]{8}T[0-9]{9}Z-[a-z0-9]+(?:-[a-z0-9]+)*$` mintát követi.
Az ID mentés után változatlan, nem pusztán a rangsorbeli helyezés.

A JSON minden template-mezőt megőriz. Ismeretlen szöveg `""`, ismeretlen
lista `[]`; hiányzó számszerű állítást ne találj ki. Az evidence jelző csak
ellenőrzött bizonyítéknál `true`; a `false` nem bizonyítja a hiányt.
Az ismeretlen technológiai lehetőségeket a `editorial.notes` jelezze.
A `scores` mezői `null` értékűek maradnak: nincs mesterségesen pontos
viralitási vagy ROI-pontozás. A sorrendet rövid, bizonyítékalapú
szerkesztői indoklás adja, nem a korábbi `final_score`.

## Kutatási és választási elvek

- A GombaFlow freelancer márka célja egyszerre a szakértői hitelesség,
  nézettség és potenciális üzleti ügyfélszerzés. A rangsorolt jelöltek
  szerkesztői célmegoszlása 70% edukáció (AI, n8n, NLP, üzleti
  automatizáció, API-integráció és webalapú rendszerek) és 30%
  ügyfélszerzés (KKV-k manuális folyamatai, költség- és időterhei).
  Öt jelöltnél ez jellemzően 3–4 és 1–2 témát jelent; kevés megfelelő
  jelöltnél a bizonyíték minősége az első, az arányeltérést jelezni kell.
- Előny az egy témával elérhető edukáció és konkrét üzleti relevancia együtt.
- Valós vállalkozói pain pointot és piaci érdeklődést keress; érdeklődési
  vagy trendállítást csak ellenőrizhető forrással támaszd alá. Ne következtess
  garantált YouTube-nézettségre, és ne adj szubjektív nézettségi pontszámot.
- Gyorsan reprodukálható, létező megoldásokat és workflow-kat részesíts
  előnyben. A demóötlet lehet a kiválasztás gyakorlati szempontja, de becsült
  előkészítési időt vagy új, nem ellenőrizhető rekordmezőt ne adj hozzá.
- Már megvalósított AI, local/private AI, n8n és automatizálási use case-ek.
  Bizonyíték: publikus demó, repository, workflow template, implementációs
  tutorial vagy dokumentált üzleti case study.
- Források: YouTube, GitHub, Reddit, n8n Community és Templates, LinkedIn,
  Product Hunt, Hacker News, technikai/implementációs blogok és vendor case study-k.
  A keresési találat önmagában nem ellenőrzött bizonyíték.
- Előny: Ollama, local/private AI, agentek, több rendszer integrációja,
  CRM, email, sales, support, dokumentumfeldolgozás, tudáskezelés,
  működés- és riportautomatizálás.
- Célközönség: KKV-tulajdonosok és cégvezetők. Érték: idő- vagy
  költségmegtakarítás, kevesebb kézi munka, jobb termelékenység,
  ügyfélkiszolgálás vagy sales; reális tanácsadói/implementációs lehetőség.
- Az edukációs jelöltek is kapcsolódjanak valós, bemutatható technológiához;
  ne legyenek puszta eszközismertetők. Az ügyfélszerző jelöltek nevezzenek
  meg konkrét KKV-problémát és a megoldás üzleti értékét.
- Kizárt: AI-hír, trend- vagy fundinghír, eszközlista, promptgyűjtemény,
  prompt engineering, ChatGPT-trükk, hype és meg nem valósított ötlet.
- A kiválasztott listába csak konkrét fő forrásvideóval és a megoldást igazoló,
  hozzáférhető videóval, átirattal vagy érdemi leírással rendelkező téma
  kerülhet, hogy a scriptíró ténylegesen át tudja venni.
  A nem videós források bizonyítékot és további jelölteket adhatnak.
- Első a konkrét üzleti relevancia és bizonyított működés, utána a
  bemutathatóság és az implementációs/megbízási lehetőség.
  A local AI és n8n előny, nem mesterségesen ráerőltetett követelmény.
- Ne ígérj garantált nézettséget, ROI-t vagy igazolatlan időmegtakarítást.
  A vendor állítását ne kezeld független mérésként.
- Ugyanaz a megoldás több linkről egy jelölt. A korábbi eredményekben és
  a már kiválasztott rekordokban szereplő azonos megoldást alapértelmezetten
  ne ajánld újra; újraajánlás csak kifejezett felhasználói kérésre történjen.

## Kapuk és hibák

Normál kimenet a kereső skillben beállított számú, különböző és ellenőrzött
jelölt. Ha ennél kevesebb található, csak a megfelelőket mentsd el,
és egyértelműen jelezd a hiányt. Nulla megfelelő jelöltnél ne készíts
sikeresnek látszó ajánlati listát.
Webhozzáférés nélkül ne helyettesítsd a kutatást emlékezetből írt ötletekkel.

A mentés után ellenőrizni kell a JSON-ok parse-olhatóságát, mezőit,
egyedi és biztonságos ID-it, a táblázattal való egyezést és a fájl létezését.
A válasz csak a ténylegesen elmentett fájlra hivatkozhat.

A kiválasztás kizárólag egy mentett teljes rekord pontos ID-egyezésével
történhet. Hiányzó, hibás vagy többértelmű ID-nél nincs fájlírás, hanem
konkrét hiba és pontosítás kell. Meglévő, eltérő kiválasztott rekordot
nem szabad felülírni. A már azonos tartalommal mentett rekord új hívása
nem hoz létre másolatot.

A skillek nem törölnek vagy mozgatnak eredményeket, nem módosítják a másik
skill kimenetét és a már létező scriptíró anyagokat. A kiválasztás nem
brief-jóváhagyás, és nem bizonyítja a videó közönségsikerét.
