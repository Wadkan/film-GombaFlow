---
name: gomba-1-script-writer-0-idea-intake
description: 'Felhasználó által kiválasztott, megvalósított automatizálási videó átvétele és magyar brief készítése. Használd a gomba-1-script-writer workflow 0. lépéséhez, meglévő ötlet és forrásvideó feldolgozásakor.'
---

# 0. Ötletátvétel

## Szerződés

- **Goal:** a kiválasztott megoldás saját változatához jóváhagyható brief.
- **Prerequisite:** a futtató megadja a kiválasztott videóbejegyzést, projektet és bemeneti
  változatokat; az alapanyag a workflow szerint hozzáférhető.
- **Input:** [workflow](../../WORKFLOW.md), [videóstruktúra](../../VIDEO_STRUCTURE.md),
  [közös szabályok](../../CONTENT_RULES.md), saját `SKILL.md`,
  [brief-template](../../templates/0-brief-template.md),
  `<selected-topic-path>` a Gomba 0 dátumozott `results/YYYYMMDD-ideas.md`
  fájljának kiválasztott videóbejegyzésével, valamint a videó releváns forrásai.
- **Output:** kizárólag `<project>/0-brief.md`, a brief-template szerint.
  A változó útvonalak a workflow mappájához képest értendők.

## Végrehajtás

1. Olvasd be a szerződés dokumentumait. Egyeztesd a felhasználó által
   kiválasztott videót a projekttel és a megadott forrásanyaggal.
2. Azonosítsd a kiválasztott forrásvideót. Több jelölt közül ne válassz
   önállóan; tisztázd, melyiket dolgozzuk át. Ne végezz új népszerűségi
   kutatást; a kiválasztást ne tekintsd bizonyított közönségsikernek.
3. A hozzáférhető anyagból bontsd ki a megoldás inputját, feldolgozását,
   outputját, fő technikai lépéseit és korlátait. A forrásjegyzékbe kerüljön
   pontos URL/útvonal, elérhető időbélyeg vagy szakasz és hozzáférési korlát.
4. Válaszd külön a megtartandó megoldást és a saját példára, hangvételre
   vonatkozó átdolgozást. Ne találj ki új funkciót vagy hiányzó technikai tényt.
5. A még hiányzó szerkesztői döntéseket egy körben egyeztesd a felhasználóval.
   Kritikus hiánynál a workflow szerinti akadályjelzéssel állj meg.
6. Töltsd ki a template-et; egyeztesd a kiválasztott bejegyzéssel és a forrásokkal.
   A briefet jóváhagyásra add át, ne állítsd, hogy a felhasználó már elfogadta.
