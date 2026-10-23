# Workflow — gomba-1-script-writer

## Cél és hatókör

A `gomba-1-script-writer` a [collector](../gomba-film-workflows/gomba-0-idea-collect-topic-selection.md)
top 3 ajánlatából a felhasználó által kiválasztott **egyetlen forrásvideót** dolgozza át saját,
magyar, forgatáshoz követhető anyaggá. Nem keres új témát, nem pontoz újra,
és nem kísérletezik tartalomformátumok teljesítményével.

Kimenet: teljes script, ellenőrzési jelentés és külön forgatás előtti
felkészülési lista. Csak szöveges tervezés történik, technikai végrehajtás,
grafika, design, felvétel, vágás és publikálás nem. A script viszont a szükséges
telepítést, konfigurációt, kódot, demóépítést és futtatást is követhetően leírja.
A „működő modell” itt a bemutatandó megoldás és demóállapotok terve;
a tényleges kipróbálás a készítő feladata.

## Közös források és felelősségek

- **Ez a workflow:** sorrend, goal, prerequisite, pontos input/output és kapuk.
- **[VIDEO_STRUCTURE.md](VIDEO_STRUCTURE.md):** állandó fejezetcímek,
  tartalmi szerkezet és CTA; ezek egyetlen közös szabályforrása.
- **[CONTENT_RULES.md](CONTENT_RULES.md):** technikai, állításkezelési,
  szerkesztési és felvételi követelmények.
- **Template-ek:** az adott kimenet kötelező formátumának egyetlen hiteles forrásai.
- **Skillek:** kizárólag a „hogyan”; a fenti dokumentumokra és template-ekre
  hivatkoznak, nem másolják vagy definiálják újra őket.
- **[research_result.md](research_result.md):** háttérkutatás, nem futtatási
  utasítás. Hasznos következtetéseit a közös dokumentumok rögzítik.
  A kutatás teljesítménytesztelési javaslatai nem részei a workflow-nak.

Minden skill olvassa ezt a workflow-t, saját `SKILL.md` fájlját, a két közös
szabálydokumentumot és a saját template-jét. A teljes kutatást nem kell újraolvasnia.
Külön stílusfájl nem bemenet; a hangvételt a brief rögzíti.

## Útvonalak és fájllista

Minden útvonal ehhez a mappához képest relatív.
`<project>` = `projects/<topic-id>`, ahol az azonosító a kiválasztott rekord `id` mezője.
`<selected-topic-path>` alapértelmezetten `<project>/selected-topic.json`,
amelyet a collector kiválasztó skillje ment. Ez teljes témarekord, nem
top 3 kivonat. Korábbi teljes témarekord pontos útvonala is megadható;
számszerű pontozás nem előfeltétel, a kiválasztás nem bizonyít közönségsikert.

```text
gomba-1-script-writer/
  WORKFLOW.md
  VIDEO_STRUCTURE.md
  CONTENT_RULES.md
  research_result.md
  templates/
    comparison-template.md
    0-brief-template.md
    1-story-template.md
    2-chapters-template.md
    3-script-template.md
    4-review-template.md
    5-preparation-template.md
  skills/
    gomba-1-script-writer-0-idea-intake/SKILL.md
    gomba-1-script-writer-1-story-hook/SKILL.md
    gomba-1-script-writer-2-chapter-planning/SKILL.md
    gomba-1-script-writer-3-script-writing/SKILL.md
    gomba-1-script-writer-4-script-review/SKILL.md
    gomba-1-script-writer-5-shoot-preparation/SKILL.md
  projects/
    <topic-id>/
      selected-topic.json
      0-brief.md
      1-story.md
      2-chapters.md
      3-script.md
      4-review.md
      5-preparation.md
```

A számozott template-ek és skillek a fenti útvonalakon találhatók.
Minden számozott template az azonos sorszámú projektkimenet formátumát adja meg.
A közös összehasonlítás formátuma a `templates/comparison-template.md`;
a fejezet- és scripttemplate erre hivatkozzon, ne másolja.
A template kitöltési utasításait ne másold a kész kimenetbe: a szögletes zárójelű
helyőrzőket helyettesítsd, az ismételhető blokkokat a szükséges számban töltsd ki.
Nem releváns mezőnél rövid indok kell. A kimenet magyar, a kód és technikai
azonosítók eredeti alakja megmarad.

## Lépések

A közös olvasmányokon felüli **Olvas** és az egyetlen engedélyezett **Ír**
kimenet lépésenként alább szerepel. Minden lépés előfeltétele az összes felsorolt
kötelező bemenet, saját skill és template létezése.

### 0. Ötletátvétel — `gomba-1-script-writer-0-idea-intake`

- **Goal:** jóváhagyható brief a már kiválasztott videó átdolgozásához.
- **Prerequisite:** egy felhasználó által kiválasztott téma, részletes rekord és elérhető forrásvideó
  vagy annak megfelelő, az elemzés korlátait jelző átirata/leírása.
- **Olvas:** `<selected-topic-path>`,
  `../gomba-0-idea-collector/templates/topic-template.json`,
  `templates/0-brief-template.md`, a rekord releváns forrásai.
- **Ír:** `<project>/0-brief.md`.
- **Rögzíti:** rekordútvonal, forrásvideó URL és hozzáférhető forrásanyag,
  a forrás működése és fő lépései, probléma, ígéret, közönség, scope, videóhossz,
  hangvétel és saját fordulatok; mit tartunk meg és mit alakítunk át.
- **Kapu:** kritikus kérdések tisztázva, brief felhasználó által elfogadva.

### 1. Átdolgozott történet — `gomba-1-script-writer-1-story-hook`

- **Goal:** a forrás megoldásának saját történetbe illesztett, nem másolt változata.
- **Prerequisite:** elfogadott, aktuális brief.
- **Olvas:** `<project>/0-brief.md`, `templates/1-story-template.md`,
  a briefben azonosított forrásvideó és releváns források.
- **Ír:** `<project>/1-story.md`.
- **Rögzíti:** saját példa és történeti ív, hook szövege és bemutatandó tartalma,
  a forrásból megtartott és átdolgozott elemek. Nem talál ki új, kísérleti scope-ot.
- **Kapu:** az átdolgozás a forrás megoldására épül, az ígéret nem túlzó.

### 2. Fejezetterv — `gomba-1-script-writer-2-chapter-planning`

- **Goal:** az állandó videóstruktúra kitöltése az adott átdolgozással.
- **Prerequisite:** aktuális brief és történet.
- **Olvas:** `<project>/0-brief.md`, `<project>/1-story.md`,
  `templates/2-chapters-template.md`, `templates/comparison-template.md`.
- **Ír:** `<project>/2-chapters.md`.
- **Rögzíti:** stabil fejezetazonosítók, kötött címek, rövid „mit csinálok”
  leírások, fejezet előtti kártyaszövegek és átvezetések,
  előtte–utána összehasonlítás, induló és elvárt demóállapotok.
- **Kapu:** a közös szerkezet teljes, a megvalósítás a megoldás adatútját követi.

### 3. Teljes script — `gomba-1-script-writer-3-script-writing`

- **Goal:** a forrás saját változatának végrehajtás és bemutatás közben követhető scriptje.
- **Prerequisite:** aktuális brief, történet és fejezetterv.
- **Olvas:** `<project>/0-brief.md`, `<project>/1-story.md`,
  `<project>/2-chapters.md`, `templates/3-script-template.md`,
  `templates/comparison-template.md`, a brief technikai forrásai;
  javítási körben `<project>/4-review.md`.
- **Ír:** `<project>/3-script.md`.
- **Rögzíti:** fejezetenként narráció, lépésenkénti műveletek, mutatott tartalom,
  kártya és átvezetés, mire figyelj és miért, reprodukálható technikai részletek,
  demóállapot és várt eredmény; a felvételi sorrendet is azonosíthatóvá teszi.
- **Kapu:** teljes szöveg, nincs hiányzó kritikus lépés; a tervezett és ténylegesen
  igazolt eredmény megkülönböztethető. Nem tartalmazza a külön készítői checklistet.

### 4. Review — `gomba-1-script-writer-4-script-review`

- **Goal:** forráshű megoldás, önálló szöveg, követhető és nem unalmas bemutató.
- **Prerequisite:** teljes script és aktuális előzményei.
- **Olvas:** `<project>/0-brief.md`, `<project>/1-story.md`,
  `<project>/2-chapters.md`, `<project>/3-script.md`,
  `templates/0-brief-template.md`, `templates/1-story-template.md`,
  `templates/2-chapters-template.md`, `templates/3-script-template.md`,
  `templates/4-review-template.md`, `templates/comparison-template.md`,
  a briefben azonosított, állítások ellenőrzéséhez szükséges források.
- **Ír:** `<project>/4-review.md`.
- **Ellenőrzi:** formátum, forrás–átdolgozás összhang, fejezetek, CTA,
  technikai teljesség, ígéret–eredmény, ismétlés, túlmagyarázás és lendület.
  Konkrét rövidítési/összevonási javaslatot ad, lényegi lépések elvesztése nélkül.
- **Kapu:** megfelelt/nem felelt meg döntés; hiba esetén fejezetazonosítóval
  visszairányít a legkorábbi érintett lépéshez. Nem ír át más kimenetet.
  Megfelelt review után a felhasználó elfogadja a scriptet.

### 5. Felkészülési lista — `gomba-1-script-writer-5-shoot-preparation`

- **Goal:** külön készítői lista a teljes script szerinti forgatás előkészítéséhez.
- **Prerequisite:** aktuális, megfelelt review és elfogadott script.
- **Olvas:** `<project>/0-brief.md`, `<project>/3-script.md`,
  `<project>/4-review.md`, `templates/5-preparation-template.md`,
  a brief technikai forrásai és szükség esetén hivatalos eszközdokumentáció.
- **Ír:** `<project>/5-preparation.md`.
- **Rögzíti:** telepítések, regisztrációk, API-kulcsigény, jogosultságok,
  költséges hozzáférések, példaadatok, demóállapotok és technikai próbák;
  közös elemek egyszer, fejezetazonosítókhoz rendelve.
  A projekt és állítások ellenőrzése megelőzi az összefoglaló talking head felvételét.
- **Kapu:** teljes scope lefedve, nincs feloldatlan akadály, felhasználó elfogadja.
  A lista nem igazolja a felkészülés tényleges elvégzését.

## Futtatás, változtatás és korlátok

- A CLI-agentet helyi n8n vagy CLI-koordinátor indíthatja. Explicit megadja
  a skill nevét/útvonalát, workflow-t, projektet, input/template/output útvonalakat
  és aktuális jóváhagyásokat. A `skills/` automatikus felismerését nem feltételezzük.
- A futtató azonosítható bemeneti változatokat is ad; a kimenet ezeket rögzíti.
  A skill egy lépést végez el, a következőt nem indítja és nem ad emberi
  jóváhagyást. Válaszában a kimenet útvonalát, a teljesült/nem teljesült kaput
  és az esetleges akadályt jelzi; akadálynál nem jelöl késznek hiányos kimenetet.
- Történethez és scripthez erős storytellingmodell kell, technikai oktató és
  forgatókönyvíró szereppel; észrevétlen modellhelyettesítés nélkül.
- Hiányzó kritikus inputnál vagy bizonyítéknál megállás és konkrét hibajelzés kell.
  Nincs kitalált forrástartalom, titokbekérés vagy titokmentés.
- Minden skill csak a saját projektkimenetét írhatja; nincs törlés, mozgatás,
  párhuzamos projektírás vagy collector-/index-/publikálásiállapot-módosítás.
- Megváltozott input, közös szabály vagy template után az érintett lépéstől
  a függő kimeneteket újra kell készíteni és jóváhagyatni. A koordinátor követi
  az aktuális változatokat; régi fájl létezése nem jelent érvényes kaput.
- Jóváhagyott output csak kifejezett újrafuttatásban írható át.
  Ütköző kézi módosításnál megállás és felhasználói döntés szükséges.
- A/B-teszt, retentionmérés, formátumversenyeztetés és új sikerkutatás nincs.
  A bemutatott automatizálás funkcionális tesztjének megtervezése kötelező.
