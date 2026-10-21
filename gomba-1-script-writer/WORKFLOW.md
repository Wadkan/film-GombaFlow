# Workflow — gomba-1-script-writer

## Cél és hatókör

A workflow közös neve és a hozzá tartozó skillek névelőtagja:
`gomba-1-script-writer`.

Bemenet: a felhasználó által kiválasztott egyetlen ötlet a
[gomba-0-idea-collector workflow](../gomba-0-idea-collector/WORKFLOW.md)
eredményeiből, a hozzá tartozó részletes, pontozott témarekorddal és forrásokkal.

Végső kimenetek:

- Forgatáshoz használható, teljes szöveges script.
- Külön, a végleges scriptből levezetett forgatás előtti felkészülési lista.
- A teljességet és a forgathatóság tervezési feltételeit dokumentáló ellenőrzés.

Ebben a folyamatban kizárólag szöveges tervek készülnek; a workflow technikai
műveleteket nem hajt végre, és nem készít grafikát, designt vagy videófelvételt,
nem vág és nem publikál. A script azonban tartalmazza a bemutatáshoz szükséges
telepítési, konfigurációs, programozási, demóépítési és futtatási lépéseket is,
hogy végrehajtás és bemutatás közben minden szempontból követhető legyen.
A külön felkészülési lista azt gyűjti össze, amit már a forgatás előtt el kell végezni.
A „működő modell” a bemutatandó megoldás, az egyes fejezetekben szükséges
demóállapotok és a várt eredmények szöveges terve, nem itt elkészített alkalmazás.
A tényleges működés forgatás előtti kipróbálása a felkészülési lista feladata lesz.

A caption ebben a workflowban videófejezetet jelent, nem időzített feliratot.

## Dokumentumok felelőssége

- **Workflow:** sorrend, célok, előfeltételek, input/output fájlok, felelősségek,
  továbblépési és újrafuttatási szabályok.
- **Template:** az adott kimenet kötelező szerkezete és mezői; az elvárt formátum
  egyetlen hiteles forrása.
- **Skill:** a végrehajtás „hogyanja”, a kutatási és szövegalkotási módszer.
  Hivatkozik a workflowra és a template-re; nem másolja be a template szerkezetét.

Ez a dokumentum a skillek szerződését határozza meg, nem a részletes
skillutasításokat. A lent felsorolt további fájlok tervezett fájlok:
a workflow létrehozása nem jelenti, hogy azok már léteznek vagy végrehajthatók.

## Útvonalak és névkonvenció

Eltérő jelölés nélkül minden útvonal ehhez a mappához képest relatív.

- `<topic-id>`: a kiválasztott témarekord `id` mezőjével egyező, egyedi projektazonosító.
- `<project>`: `projects/<topic-id>`.
- `<selected-topic-path>`: a felhasználó által kiválasztott eredeti, pontozott
  témarekord pontos fájlútvonala. Nem találjuk ki és nem helyettesítjük indexkivonattal.
- A skillnevek közös előtag után, végrehajtási sorrendben, **0-tól** számozottak.
- A lépések template-jei és projektkimenetei ugyanazt a sorszámot követik.
- A `WORKFLOW.md` közös dokumentum, nem végrehajtási lépés.
- A nevekben szereplő „script” a forgatókönyvet jelenti; futtatható segédprogram
  létrehozása nem része ennek a tervnek.

## Tervezett fájllista és struktúra

```text
gomba-1-script-writer/
  WORKFLOW.md
  skills/
    gomba-1-script-writer-0-idea-intake/
      SKILL.md
    gomba-1-script-writer-1-story-hook/
      SKILL.md
    gomba-1-script-writer-2-chapter-planning/
      SKILL.md
    gomba-1-script-writer-3-script-writing/
      SKILL.md
    gomba-1-script-writer-4-script-review/
      SKILL.md
    gomba-1-script-writer-5-shoot-preparation/
      SKILL.md
  templates/
    0-brief-template.md
    1-story-template.md
    2-chapters-template.md
    3-script-template.md
    4-review-template.md
    5-preparation-template.md
  projects/
    <topic-id>/
      0-brief.md
      1-story.md
      2-chapters.md
      3-script.md
      4-review.md
      5-preparation.md
```

Ez a szakasz a workflow külön fájllistája. A template-ek azonos sorszámú
projektkimenetet szabályoznak, amelynek írója az azonos sorszámú skill.

A template-ek rövidek legyenek: kötelező címek, mezők és szükség esetén egy-egy
rövid kitöltési megjegyzés. Ne tartalmazzanak a skillt helyettesítő módszertant.

## Közös előfeltételek

- A felhasználó kiválasztott egy ötletet és megadta a részletes rekord útvonalát.
- Az adott lépés skillje, template-je és összes kötelező bemenete létezik.
- A videó végén legyen záró reklám: **gombaflow.eu**.
- A még nem tisztázott stílust, célközönséget, videóhosszt és tartalmi korlátokat
  a brief elfogadása előtt a felhasználóval kell egyeztetni.
- A történet- és scriptalkotást erős, történetmesélésre alkalmas modellel kell
  futtatni. Az agent szerepe: technikai oktató és történetmesélő forgatókönyvíró,
  aki a megadott saját hangon, technikailag követhető történetet készít.
- A konkrét modell kiválasztása a futtató konfigurációja; a workflow nem rögzít
  gyorsan elavuló modellnevet. Nem történhet észrevétlen modellhelyettesítés.

Hiányzó input, elérhetetlen szükséges forrás vagy tisztázatlan kritikus állítás
esetén a lépés megáll és jelzi a konkrét akadályt. Nem találhat ki forrástartalmat,
nem jelölhet kipróbálatlan demót ellenőrzötten működőnek.

## Végrehajtás és automatizálás

Minden indítás explicit megadja:

- A workflow közös nevét és a futtatandó skill pontos nevét.
- A skill `SKILL.md` fájljának és ennek a workflow-nak az útvonalát.
- A projektazonosítót és a projektkönyvtárat.
- A lépéshez tartozó konkrét input-, template- és outputútvonalakat.
- A szükséges előző jóváhagyásokat.

A `skills/` itt projektbeli tárolási hely; automatikus CLI-skillfelismerést nem
feltételezünk. A futtatónak biztosítania kell az explicit betöltést, vagy a választott
CLI által támogatott skillregisztrációt.

Az alábbi lépések **Olvas** listáján felül minden skill kötelezően olvassa ezt a
workflow-t és a saját `SKILL.md` fájlját. Csak az **Ír** listáján szereplő
projektkimenetet hozhatja létre vagy frissítheti.

## 0. Ötletátvétel és brief

**Skill:** `gomba-1-script-writer-0-idea-intake`

**Goal:** az egyetlen kiválasztott ötletből egyértelmű, jóváhagyható videóbrief.

**Prerequisite:**

- Kiválasztott téma és olvasható, részletes pontozott témarekord.
- A brief template rendelkezésre áll.

**Olvas:**

- `<selected-topic-path>`
- `../gomba-0-idea-collector/templates/topic-template.json`
- `templates/0-brief-template.md`
- A kiválasztott rekordban hivatkozott releváns források.

**Ír:**

- `<project>/0-brief.md`

**Felelősség:**

- Rögzíti a témaazonosítót, az eredeti rekord pontos útvonalát és a felhasznált
  források elérhetőségét, hogy a későbbi lépések ugyanarra az anyagra épüljenek.
- Rögzíti a problémát, célközönséget, ígéretet, tervezett videóhosszt és scope-ot.
- Rögzíti a felhasználóval egyeztetett hangvételt és saját fordulatokat.
- Tisztázza a forrásvideó és a további bizonyítékok szerepét.
- Nem választ helyetted másik ötletet, nem pontoz és nem módosítja a collectort.

**Továbblépés:** a brief hiánytalan, a kritikus kérdések tisztázottak,
és a felhasználó elfogadta.

## 1. Saját történet és hook

**Skill:** `gomba-1-script-writer-1-story-hook`

**Goal:** saját hangú, önálló történet és a videó ígéretét megalapozó nyitás.

**Prerequisite:** elfogadott, aktuális brief.

**Olvas:**

- `<project>/0-brief.md`
- `templates/1-story-template.md`
- A briefben rögzített forrásvideó és releváns forrásanyagok.

**Ír:**

- `<project>/1-story.md`

**Felelősség:**

- A forrás témájához kapcsolódó, de eltérő történetet tervez, nem a forrás
  szövegének vagy jelenetsorának másolatát.
- A teljes fejlesztési/bemutatási folyamatot érthető történeti ívre fűzi fel.
- Megtervezi a hook rövid elmondandó szövegét és azt, mit mutasson a felvétel:
  a működő terméket, a problémát vagy a jelenlegi nehézséget.
- A hook lehet kérdés, például: „Vajon ezt is lehet automatizálni?” vagy
  „Vajon már ezt is tudja az AI?”; nem kötelező minden videóban kérdésnek lennie.
- A saját hang állandó elemeit, így a záró reklám helyét is figyelembe veszi.

**Továbblépés:** a történet a brief ígéretét teljesíti, saját nézőpontot ad,
és a hook nem ígér a tervezett bemutatónál többet.

## 2. Fejezetek, kártyaszövegek és átvezetések

**Skill:** `gomba-1-script-writer-2-chapter-planning`

**Goal:** a történetet követő, teljes és forgatókönyvvé bontható fejezetsorrend.

**Prerequisite:** aktuális brief és történetterv.

**Olvas:**

- `<project>/0-brief.md`
- `<project>/1-story.md`
- `templates/2-chapters-template.md`

**Ír:**

- `<project>/2-chapters.md`

**Felelősség:**

- Minden fejezetnek stabil azonosítót, nevet, célt és rövid „mit fogok csinálni”
  leírást ad.
- Minden fejezet elé megtervezi a kártya szöveges tartalmát és az átvezetést.
- Rögzíti a bemutatandó modell kiinduló és elvárt fejezetvégi állapotát.
- Nem készít grafikai tervet, elrendezést, animációt vagy designutasítást.

**Továbblépés:** a fejezetsorrend lefedi a teljes történetet; minden fejezethez
tartozik kártyaszöveg, átvezetés és bemutatási cél.

## 3. Teljes forgatókönyv

**Skill:** `gomba-1-script-writer-3-script-writing`

**Goal:** egy dokumentumból követhető, teljes, saját hangú forgatási script.

**Prerequisite:** aktuális brief, történet és teljes fejezetterv.

**Olvas:**

- `<project>/0-brief.md`
- `<project>/1-story.md`
- `<project>/2-chapters.md`
- `templates/3-script-template.md`
- A briefben rögzített, a technikai lépésekhez szükséges forrásanyagok.
- Javítási körben: `<project>/4-review.md`

**Ír:**

- `<project>/3-script.md`

**Felelősség:**

- Kidolgozza a hook elmondandó szövegét és a hozzá tartozó felvétel tartalmát.
- Minden fejezetnél kidolgozza a nevet, rövid tevékenységleírást,
  kártyaszöveget, átvezetést, lépésenkénti útmutatót és narrációt.
- Egyértelművé teszi, mit mondasz, mit csinálsz és mit mutatsz a felvételen.
- A bemutatáshoz szükséges telepítési, konfigurációs, programozási, demóépítési
  és futtatási lépéseket is követhetően leírja.
- Elmagyarázza, hol mire kell figyelni, és mi miért fontos.
- Leírja a bemutatandó működő modellt, az adott demóállapotot és a várt,
  látható eredményt; a nem ellenőrzött feltételezéseket megjelöli.
- Tartalmazza a történet lezárását és a **gombaflow.eu** záró reklámot.
- Nem keveri a scriptbe a neked szóló, forgatás előtti felkészülési listát.

**Továbblépés:** nincs hiányzó fejezet, kidolgozatlan narráció vagy kritikus,
eldöntetlen technikai lépés. A végrehajtás még nem minősül kipróbáltnak.

## 4. Scriptellenőrzés és véglegesítés

**Skill:** `gomba-1-script-writer-4-script-review`

**Goal:** a script teljességének, belső összhangjának és tervezési szintű
forgathatóságának ellenőrzése.

**Prerequisite:** teljes script és annak aktuális előzményei.

**Olvas:**

- `<project>/0-brief.md`
- `<project>/1-story.md`
- `<project>/2-chapters.md`
- `<project>/3-script.md`
- `templates/0-brief-template.md`
- `templates/1-story-template.md`
- `templates/2-chapters-template.md`
- `templates/3-script-template.md`
- `templates/4-review-template.md`
- A briefben rögzített, az állítások ellenőrzéséhez szükséges forrásanyagok.

**Ír:**

- `<project>/4-review.md`

**Felelősség:**

- Ellenőrzi a template-megfelelést, az összes felhasználói igény lefedését,
  a saját hangot, a hookot, a fejezetsorrendet, átvezetéseket és záró reklámot.
- Ellenőrzi a technikai lépések, narráció és tervezett demóállapotok összhangját.
- Vizsgálja, hogy a történet fenntartja-e az érdeklődést, nem válik-e unalmassá,
  nincs-e benne felesleges ismétlés vagy nem lényegi elemek túlmagyarázása.
- Konkrét rövidítési és összevonási javaslatokat ad úgy, hogy a követhetőséghez
  szükséges technikai lépések és magyarázatok ne vesszenek el.
- Elkülöníti a szöveges tervezéssel igazolható megfelelést a forgatás előtt
  tényleges kipróbálást igénylő feltételektől.
- Egyértelmű megfelelt/nem felelt meg döntést ad; a hibákat konkrét
  fejezetazonosítóhoz és javítandó kimenethez köti.
- Nem írja át más skill kimenetét. Scriptjavításkor a 3. lépés fut újra;
  korábbi tervezési hiba esetén a legkorábbi érintett lépés.

**Továbblépés:** az aktuális scriptre vonatkozó ellenőrzés megfelelt,
majd a felhasználó jóváhagyta a scriptet. A jóváhagyás nem helyettesíti
a demók későbbi kipróbálását.

## 5. Forgatás előtti felkészülési lista

**Skill:** `gomba-1-script-writer-5-shoot-preparation`

**Goal:** a már teljes és elfogadott scope alapján külön megmondani a készítőnek,
mivel kell előkészülnie a forgatásra.

**Prerequisite:** aktuális, megfelelt ellenőrzés és felhasználó által jóváhagyott script.

**Olvas:**

- `<project>/0-brief.md`
- `<project>/3-script.md`
- `<project>/4-review.md`
- `templates/5-preparation-template.md`
- A briefben hivatkozott releváns technikai források, szükség esetén az eszközök
  hivatalos telepítési és hozzáférési dokumentációja.

**Ír:**

- `<project>/5-preparation.md`

**Felelősség:**

- A teljes scriptből gyűjti ki a szükséges eszközöket és telepítéseket.
- Felsorolja, hová kell regisztrálni, mihez kell API-kulcs, milyen hozzáférés
  vagy előfizetés szükséges; tényleges titkokat nem kér be és nem ment el.
- Fejezetazonosítóhoz rendeli az előfeltételeket, a közös elemeket nem duplikálja.
- Felsorolja az előkészítendő példaadatokat, demóállapotokat és a működés
  forgatás előtti kipróbálásának ellenőrzési pontjait.
- Nem talál ki új scope-ot, nem módosítja a scriptet és nem hajtja végre
  a telepítést vagy az ellenőrzéseket.
- Ha előkészíthetetlen vagy ellentmondásos scriptlépést talál, jelzi az akadályt;
  a folyamat visszatér az érintett korábbi lépéshez.

**Befejezés:** a lista a teljes script minden technikai előfeltételét lefedi,
nincs feloldatlan tervezési akadály, és a felhasználó elfogadta az átadást.
A kimenet forgatásra felkészítő terv, nem igazolás az elvégzett felkészülésről.

## Jóváhagyás, változtatás és újrafuttatás

- Kötelező emberi kapuk: brief elfogadása a 0. lépés után; script elfogadása
  a megfelelt 4. lépés után; végső átadás elfogadása az 5. lépés után.
- A köztes lépések automatikusan követhetik egymást, ha minden előfeltétel teljesül.
- A jóváhagyás mindig az adott kimenet aktuális változatára érvényes.
  A CLI-koordinátor vagy n8n tartja nyilván a kapukat és a bemenetek változását;
  régi fájl puszta létezése nem jelent érvényes jóváhagyást.
- Módosult kimenet után a rá épülő későbbi kimenetek elavultnak számítanak.
  Ezeket újra kell előállítani és ellenőrizni, szükség esetén újra jóváhagyatni.
- Template-változás az érintett kimenettől indítja újra az ellenőrzési láncot.
- Egy futás csak a saját projektjén és a skill számára engedélyezett kimeneten
  dolgozhat. Ugyanazon projekt párhuzamos írása nem engedélyezett.
- A skillek nem törölnek és nem mozgatnak fájlokat, nem módosítják a
  forrásrekordot, a collector indexét, backlogját vagy publikálási állapotát.
- Jóváhagyott output átírása csak kifejezett újrafuttatás részeként történhet;
  kézi módosítással ütközéskor a futás megáll és felhasználói döntést kér.

## A workflow-n kívüli feladatok

A grafika, design, videóvágás, tényleges felirat és időbélyegek, thumbnail,
platformmetaadatok, közösségi változatok, feltöltés és ütemezés külön folyamatok.
Ezek nem bővíthetik észrevétlenül ennek a scriptíró workflow-nak a scope-ját.
