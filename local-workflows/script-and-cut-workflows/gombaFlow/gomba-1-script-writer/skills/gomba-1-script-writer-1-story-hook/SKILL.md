---
name: gomba-1-script-writer-1-story-hook
description: "Kiválasztott videó saját történetté és hookká átdolgozása magyarul. Használd a gomba-1-script-writer workflow 1. lépésében, elfogadott brief alapján."
---

# 1. Átdolgozott történet

## Szerződés

- **Goal:** a meglévő megoldásra épülő önálló történet és nyitás.
- **Prerequisite:** a futtató által igazolt, aktuális briefjóváhagyás és
  azonosítható bemeneti változatok.
- **Input:** [workflow](../../WORKFLOW.md), [videóstruktúra](../../VIDEO_STRUCTURE.md),
  [közös szabályok](../../CONTENT_RULES.md), saját `SKILL.md`,
  [story-template](../../templates/1-story-template.md),
  [thumbnail-prompt-template](../../templates/1-thumbnail-prompt-template.md),
  [outline-Hyperframes-brief-template](../../templates/1-outline-hyperframes-brief-template.md),
  `<project>/0-brief.md`, `<project>/source-transcript.md`, a briefben
  azonosított forrásvideó és releváns források. Az átirat a beszéd és
  időbélyegek forrása, a csak képen látható technikai részleteké nem.
- **Output:** `<project>/1-story.md`, `<project>/1-thumbnail-prompt.md` és
  `<project>/1-outline-hyperframes-brief.md`, a megfelelő template-ek szerint.
  A változó útvonalak a workflow mappájához képest értendők.

## Végrehajtás

1. A szerződés dokumentumaiból határold le, mi a megoldás változatlan magja,
   és mi a brief által engedélyezett átdolgozás.
2. Készíts egy javasolt videócímet a brief alapján, és azonosíts egy konkrét
   pain pointot. A cím és a thumbnail ugyanazt a pain pointot mutassa.
   Ne keverd össze a
   videócímeket a `VIDEO_STRUCTURE.md` kötött fejezetcímeivel és CTA-jával.
   Azonosítsd a cím ígéretét. A hook első mondata nevezze meg ugyanezt a pain
   pointot, és rögtön vállalja, hogy megoldja, vagy megvizsgálja, megoldható-e
   egyáltalán. A bemutatási terv azonnal és láthatóan igazolja vissza az
   ígéretet. Ha a brief és a források alapján ez nem tehető meg, szűkítsd a
   címet; ne állíts nem bizonyított eredményt.
3. Készíts külön thumbnail promptot a saját template szerint. Tartalmazza a
   javasolt videócím pontos szövegét, egy rövid, néhány szavas képfeliratot,
   valamint legfeljebb két egyszerű ötletet arról, mit csináljon a készítő a
   képen. A végső prompt ezek közül egy ötletet használjon, és a felhasználó
   (készítő) szerepeljen a képen.
4. A brief hangvételével dolgozz, technikai oktató és történetmesélő
   forgatókönyvíró szerepben, a workflow szerinti modellkövetelménnyel.
5. Alakíts ki saját helyzetet és példát ugyanarra a problémára. Vezesd végig
   a problémától a megoldáson át a bizonyítható eredményig; a technikai
   függőségeket tartsd meg, ne a forrás narrációját fordítsd le.
6. Írj egy kidolgozott hookot és annak bemutatási tervét. Közvetlenül utána
   készíts rövid, nézőnek szóló bulletpointos outline-t arról, mit mutatsz be;
   a részletes fejezettervet ne másold ide.
7. A történetet rendeld a közös struktúra egységeihez, a kötött fejezetcímek
   és a CTA újradefiniálása nélkül. Ne adj alternatív formátumokat
   teljesítménytesztre.
8. Készítsd el a külön Hyperframes-briefet az outline bulletpointjaival, a
   cím és pain point megadásával, valamint az egyenkénti, sorrendtartó
   animálás rövid utasításával. Ez szöveges brief, ne generálj animációt.
9. Töltsd ki mindhárom template-et; a videócím kerüljön a történet címébe,
   thumbnail promptba és Hyperframes-briefbe. A hook „Ígéret ellenőrzésének
   alapja” mezője nevezze meg, hogyan igazolja vissza az ígéretet. Vesd össze
   a címet, thumbnailt, hookot és outline-t a brief ígéretével, scope-jával
   és a forrás megoldásával. Ellentmondásnál jelezd a legkorábbi javítandó
   bemenetet, ne írd át a briefet.
