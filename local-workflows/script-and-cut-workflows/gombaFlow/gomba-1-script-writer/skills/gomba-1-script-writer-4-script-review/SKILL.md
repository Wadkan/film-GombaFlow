---
name: gomba-1-script-writer-4-script-review
description: 'Forgatási script tartalmi és technikai review-ja, ismétlések és túlmagyarázás feltárásával. Használd a gomba-1-script-writer workflow 4. lépéséhez, nem nézettségi vagy A/B-teszthez.'
---

# 4. Scriptreview

## Szerződés

- **Goal:** indokolt döntés a script tervezési szintű megfelelőségéről.
- **Prerequisite:** teljes script, aktuális előzmények és azonosítható bemeneti
  változatok; a review nem helyettesíti az emberi scriptjóváhagyást.
- **Input:** [workflow](../../WORKFLOW.md), [videóstruktúra](../../VIDEO_STRUCTURE.md),
  [közös szabályok](../../CONTENT_RULES.md), saját `SKILL.md`,
  `<project>/0-brief.md`, `<project>/1-story.md`, `<project>/2-chapters.md`,
  `<project>/3-script.md`, a brief releváns ellenőrzési forrásai;
  `<project>/source-transcript.md`;
  [brief-template](../../templates/0-brief-template.md),
  [story-template](../../templates/1-story-template.md),
  [fejezet-template](../../templates/2-chapters-template.md),
  [script-template](../../templates/3-script-template.md),
  [review-template](../../templates/4-review-template.md),
  [összehasonlítás-template](../../templates/comparison-template.md).
- **Output:** kizárólag `<project>/4-review.md`, a review-template szerint.
  A változó útvonalak a workflow mappájához képest értendők.

## Végrehajtás

1. Olvasd be az inputokat; az ellenőrzést a tényleges bemeneti változatokhoz
   kösd. Hiányzó vagy elavult anyagnál ne adj megfelelt döntést.
2. Hasonlítsd össze a dokumentumokat saját template-jükkel és a közös
   követelményekkel; a review-template ellenőrzési csoportjain haladj végig.
3. Kövesd végig a jóváhagyott transcriptet és egyéb forrásokat a saját
   történeten át a műveletekig és várt eredményig vezető láncban. Az átirat
   csak beszédet és időzítést igazol; képi technikai bizonyítékként ne kezeld.
   A hiányzó kritikus lépést konkrétan nevezd meg.
4. Olvasd végig a narrációt nézőként is. Jelöld, mely részt rövidítenéd vagy
   vonnád össze és miért; az unalmasságot szöveges jelekkel indokold,
   ne állíts mért közönségreakciót. A kötött felső szintű szerkezet maradjon.
5. Minden hibát köss fejezethez, forráshelyhez és a legkorábbi felelős lépéshez.
   Válaszd külön a kaput blokkoló hibát, az opcionális finomítást és a későbbi
   tényleges demópróbát; az utóbbi hiánya önmagában nem tervezési hiba.
6. A template döntési szabálya szerint készíts jelentést. Ne javítsd át
   a scriptet, ne hajts végre technikai tesztet, és ne adj emberi jóváhagyást.
