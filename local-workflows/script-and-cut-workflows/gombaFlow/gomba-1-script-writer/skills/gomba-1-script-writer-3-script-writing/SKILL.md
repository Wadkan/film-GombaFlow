---
name: gomba-1-script-writer-3-script-writing
description: "Teljes magyar forgatási script kidolgozása vagy review alapján javítása. Használd a gomba-1-script-writer workflow 3. lépésében, kész fejezetterv és kiválasztott forrás alapján."
---

# 3. Teljes script

## Szerződés

- **Goal:** követhető műveletek és elmondható saját narráció egy scriptben.
- **Prerequisite:** aktuális brief, történet és fejezetterv, érvényes
  briefjóváhagyás és azonosítható bemeneti változatok.
- **Input:** [workflow](../../WORKFLOW.md), [videóstruktúra](../../VIDEO_STRUCTURE.md),
  [közös szabályok](../../CONTENT_RULES.md), saját `SKILL.md`,
  [hang- és stílusszabályok](../../../style.md),
  [script-template](../../templates/3-script-template.md),
  [összehasonlítás-template](../../templates/comparison-template.md),
  `<project>/0-brief.md`, `<project>/1-story.md`,
  `<project>/1-thumbnail-prompt.md`,
  `<project>/1-outline-hyperframes-brief.md`, `<project>/2-chapters.md`,
  `<project>/source-transcript.md`, a brief technikai forrásai;
  javításkor `<project>/4-review.md`. Az átirat nem igazolja a csak képen
  látható műveleteket.
- **Output:** kizárólag `<project>/3-script.md`, a script-template szerint.
  A változó útvonalak a workflow mappájához képest értendők.

## Végrehajtás

1. Olvasd be az inputokat, és alkalmazd a GombaFlow gyökérmappájának `style.md`
   szabályait. Javításkor a review alapján különítsd el a saját
   hatáskörű hibát a korábbi tervezési hibától; az utóbbit jelezd vissza.
2. Technikai oktató és történetmesélő forgatókönyvíróként, a workflow szerinti
   modellel, a fejezetterv azonosítóit megtartva dolgozd ki a template blokkjait.
3. Fejben kövesd végig az adat és az állapot útját. A néző minden szükséges
   műveletet a scriptből tudjon követni; a narráció a döntést magyarázza,
   ne pusztán a felület feliratát olvassa fel. Az O outline utáni törzsben,
   a hookot, az outline-t és a C6 összefoglalót kihagyva, hozzávetőleg
   30–40 másodpercenként mérlegelj természetes figyelemváltást: például egy
   új, a megoldást előrevivő példát, releváns kérdést vagy re-hookot. Ez
   irányadó ritmus, nem kötelező ütem: nagyon rövid fejezetben vagy egy
   folyamat folyamatos bemutatásakor ne erőltesd, ha nem segíti a megértést
   vagy az érdeklődést. A re-hook egy valódi, később megválaszolt kérdést vagy
   következő lépésre vonatkozó várakozást nyisson meg; ne kelts hamis tétet,
   és ne hagyd pusztán a ritmus kedvéért feloldatlanul.
4. A hookban nevezd meg a title-lel és thumbnaillel egyező pain pointot,
   és rögtön mondd ki, hogy megoldod, vagy megvizsgálod, megoldható-e.
   Közvetlenül utána vedd fel az O outline-t a brief bulletpointjaival,
   az eredeti sorrendet és jelentést megőrizve.
5. A konkrét konfigurációt, kódot vagy promptot a megfelelő lépéshez írd.
   Ne telepíts, ne futtass és ne hozz létre külön megvalósítási fájlokat.
   Hiányzó kritikus technikai információ esetén állj meg és jelezd a forráshiányt.
6. A fejezetterv összehasonlítását a közös template szerint vedd át; változtatás
   csak forrással indokolva történjen. A CTA-t a közös struktúrából vedd át.
7. Kösd az állításokat és technikai részleteket a brief forrásazonosítóihoz.
   A tervezett próba és a ténylegesen igazolt eredmény státuszát különítsd el.
8. Állítsd össze a nézői sorrendtől külön kezelt felvételi rendet, majd ellenőrizd
   a teljes történet és technikai lánc lefedését. A készítői előkészületi
   checklistet ne írd ide, és ne indíts review-t saját hatáskörben.
