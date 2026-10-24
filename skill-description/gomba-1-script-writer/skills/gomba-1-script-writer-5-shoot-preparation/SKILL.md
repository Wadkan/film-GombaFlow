---
name: gomba-1-script-writer-5-shoot-preparation
description: 'Külön forgatás előtti felkészülési lista készítése a teljes, elfogadott scriptből. Használd a gomba-1-script-writer workflow 5. lépésében telepítés-, hozzáférés- és demóelőkészítés tervezéséhez.'
---

# 5. Forgatás előtti felkészülés

## Szerződés

- **Goal:** a készítő pontosan tudja, mivel készüljön elő a forgatásra.
- **Prerequisite:** aktuális, megfelelt review, a futtató által igazolt emberi
  scriptjóváhagyás és azonosítható bemeneti változatok.
- **Input:** [workflow](../../WORKFLOW.md), [videóstruktúra](../../VIDEO_STRUCTURE.md),
  [közös szabályok](../../CONTENT_RULES.md), saját `SKILL.md`,
  [felkészülés-template](../../templates/5-preparation-template.md),
  `<project>/0-brief.md`, `<project>/3-script.md`, `<project>/4-review.md`,
  a brief technikai forrásai, szükség esetén hivatalos eszközdokumentáció.
- **Output:** kizárólag `<project>/5-preparation.md`, a felkészülés-template szerint.
  A változó útvonalak a workflow mappájához képest értendők.

## Végrehajtás

1. A megadott változatok alapján ellenőrizd, hogy a review és az emberi
   jóváhagyás ugyanarra az aktuális scriptre vonatkozik. Enélkül ne lépj tovább.
2. A teljes scriptet műveletenként járd be, és gyűjtsd ki az előfeltételeket.
   Azonos eszközt vagy hozzáférést egyszer sorolj fel, az összes érintett
   fejezetazonosítóval és a szükséges előkészítési sorrenddel.
3. A hozzáférés létrehozási helyét és lényeges korlátait a megadott forrásból
   vagy hivatalos dokumentációból azonosítsd. A kulcs szükségességét rögzítsd,
   az értékét ne kérd be. Az időérzékeny díjhoz adj forrást és ellenőrzési dátumot.
4. A scriptből vezesd le a reprodukálható adatokat, demóállapotokat,
   funkcionális próbákat és a felvételhez szükséges bizonyítékokat.
   Semmit ne jelölj elvégzettnek pusztán azért, mert letervezted.
5. A közös felvételi szabályokat a konkrét fejezetekhez rendeld. A talking head
   véglegesítéséhez szükséges bizonyítékok megszerzése legyen előfeltétel.
6. Ellenőrizd, maradt-e lefedetlen scriptfüggőség. Ellentmondás esetén
   jelezd a javítandó korábbi lépést, ne változtasd meg a scope-ot vagy scriptet.
   A teljes listát végső elfogadásra add át, telepítés és tényleges teszt nélkül.
