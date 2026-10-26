# Fejezetterv — PostgreSQL-alapú hibrid keresés üzleti tartalmakhoz

- Témaazonosító: `1-postgresql-hybrid-search-course`
- Bemeneti változatok és briefjóváhagyás: `0-brief.md` és `1-story.md` 2026-10-26-án újragenerált változata; F5 repo `main` ellenőrizve 2026-10-26-án; a felhasználó elfogadta az eredeti briefet és történetet, majd engedélyezte a forráskód miatti tényjavítást és a függő anyagok újragenerálását.

## Fejezetek nézői sorrendben

### H — Hook

- Cél és rövid tevékenységleírás: felvetem, mi történik, ha a kereső felhasználó ismeri a kívánt eredményt, de nem a dokumentumban szereplő szakkifejezést.
- Kapcsolódó történetelem: `1-story.md` — Saját helyzet és példa; Hook.
- Kártya szövege: „A kereső érti, mire gondol a vevő?”
- Átvezető szöveg: „Nézzük meg, mit ad ugyanarra a kérdésre a kulcsszavas, a jelentésalapú és a kombinált keresés.”
- Tervezett lépések:
  1. Röviden felvázolom az értékesítő és a termékkatalógus példáját.
  2. Megnevezem a három összevetendő keresési módot.
  3. Jelzem, hogy a technikai bemutató WikiSearch-demó, nem vállalati katalógus.
- Kiinduló modell-/demóállapot: még nincs bemutatva a keresési felület vagy az eredmény; a példa hipotetikus.
- Elvárt végállapot és ellenőrzési pont: a néző érti a problémát és a videó ellenőrizhető ígéretét; nincs állítás arról, hogy a hibrid mód minden esetben jobb.
- Fontos magyarázat vagy korlát: a termékkatalógus csak történeti analógia; nem a bemutató adatforrása.

### C1 — A kész megoldás

- Cél és rövid tevékenységleírás: konfigurációmagyarázat nélkül megmutatom a három keresési mód közötti különbséget a WikiSearch forrásdemóján, majd jelzem, mit kell a saját újrajátszott demóban igazolni.
- Kapcsolódó történetelem: `1-story.md` — C1.
- Kártya szövege: „Egy kereső, három rangsorolási mód”
- Átvezető szöveg: „Mielőtt felépítjük, nézzük meg röviden, milyen munka változik az egyszerű kereséshez képest.”
- Tervezett lépések:
- 1. A repo felvételi README-je szerinti `animals that make their own light` lekérdezést futtatom kulcsszavas, szemantikus és hibrid módban.
  2. Megmutatom az aktuális találatokat, lefedettséget és tényleges futásidőt.
  3. A sorrendet és címeket saját futtatás előtt nem ígérem meg.
- Kiinduló modell-/demóállapot: WikiSearch, teljes Simple English Wikipedia-adatkészlet és embeddingek betöltve; a `/health` lefedettség ellenőrizve.
- Elvárt végállapot és ellenőrzési pont: a néző látja, hogy eltérő keresési módok eltérő eredményeket adhatnak; saját reprodukciókor mindhárom mód futása ellenőrzött.
- Fontos magyarázat vagy korlát: F5 szerint a teljes forrásszám 241 787, a szemantikus kohorsz legfeljebb 25 002 (a 25 000 leghosszabb cikk plusz két demo cím). A három mód eredményeit befolyásolja az eltérő lefedettség; saját találati sorrend még nincs igazolva.

### C2 — Előtte és utána

- Cél és rövid tevékenységleírás: párhuzamos, rövid állításokkal elhelyezem az egyrendszeres keresés előnyét és az együtt járó technikai, költség- és felügyeleti feladatokat.
- Kapcsolódó történetelem: `1-story.md` — C2.
- Kártya szövege: „Kevesebb szinkronizálás, több saját döntés”
- Átvezető szöveg: „Ehhez több összetevő dolgozik együtt; nézzük meg, melyik mit csinál.”
- Tervezett lépések:
  1. A „Kézi lépések” sorban megmutatom, hogy a külön keresőrendszer használata adatmásolást és szinkronizálási folyamatot igényelhet; az egyrendszeres demóban ez a külön másolási út nincs.
  2. Az „Időráfordítás” sorban minőségi összevetést adok, mérési szám nélkül.
  3. A „Hibalehetőség” sorban összevetem a másolt adatok késését az embedding-, index- és lefedettségi hibákkal.
  4. A „Költség” és „Emberi felügyelet” sorokban jelzem a hosting/API-költség és a szolgáltatási feltételek ellenőrzésének szükségességét.
- Kiinduló modell-/demóállapot: két architekturális lehetőség elvi szinten; nincs saját mérés vagy TCO-szám.
- Elvárt végállapot és ellenőrzési pont: a néző érti, hogy egy adatbázisban tartott kereső csökkentheti a külön keresőszolgáltatás szinkronizációs igényét, miközben új konfigurációs és minőségi ellenőrzési feladatok maradnak.
- Fontos magyarázat vagy korlát: a külön szolgáltatás nélküli adatút a forrás megoldásának jellemzője; az idő-, költség- és hibacsökkenés nem mért eredmény.

### C3 — Szükséges szolgáltatások

- Cél és rövid tevékenységleírás: felsorolom a megoldás összetevőit és szerepüket, az installáció részleteit a megvalósításra hagyva.
- Kapcsolódó történetelem: `1-story.md` — C3.
- Kártya szövege: „Adatbázis, keresési bővítmények, API”
- Átvezető szöveg: „Most, hogy tudjuk, mi mire való, először az adatot és az adatbázist készítjük elő.”
- Tervezett lépések:
  1. PostgreSQL: rekordok, szöveg és vektorok tárolása.
  2. `pg_textsearch`: BM25-alapú kulcsszavas rangsorolás.
  3. `pgvector` és `pgvectorscale`: vektorok tárolása és szemantikus keresés.
  4. Python, FastAPI és Psycopg: az API és alkalmazáskapcsolat.
  5. TigerCloud vagy a dokumentált helyi környezet adja a PostgreSQL-szolgáltatást; az alap MiniLM helyben fut, külső embedding API-kulcs nélkül; a választható OpenAI-modellhez külön kulcs és díj tartozik.
- Kiinduló modell-/demóállapot: F5 szerint Python 3.11/3.12, PostgreSQL 17, `pg_textsearch` legalább 1.5.1, `pgvector`, `pgvectorscale`, FastAPI/Psycopg és helyi `sentence-transformers/all-MiniLM-L6-v2` CPU-modell kell. A Cloud-szolgáltatás ára a fiókban ellenőrzendő; az opcionális OpenAI-modellhez külön API-kulcs és használati díj jár.
- Elvárt végállapot és ellenőrzési pont: minden összetevő szerepe érthető, és a C4 indulása előtt ismert, milyen futtatási módot és szolgáltatásokat választunk.
- Fontos magyarázat vagy korlát: ne nevezzük ingyenesnek vagy költségmentesnek; ár és hozzáférési feltétel csak ellenőrzött, dátumozott forrás alapján kerüljön a scriptbe.

### C4 — Megvalósítás

- Cél és rövid tevékenységleírás: az adat betöltésétől a találatok megjelenítéséig követem a függőségeket, minden logikai blokk után látható ellenőrzéssel.
- Kapcsolódó történetelem: `1-story.md` — C4.
- Kártya szövege: „Építsük fel a keresési adatutat”
- Átvezető szöveg: „Az adatbázis most már tartalmazza a szükséges adatokat és indexeket; következhet a teljes keresési próba.”
- Tervezett lépések:

#### C4.1 — Környezet és adatbázis ellenőrzése

- Cél és rövid tevékenységleírás: elindítom a forrásprojekt által előírt adatbázist és ellenőrzöm az elérhetőségét.
- Kapcsolódó történetelem: `1-story.md` — C4.
- Kártya szövege: „Elérhető az adatbázis?”
- Átvezető szöveg: „Ha a megfelelő környezet fut, betölthetjük a keresendő cikkeket.”
- Tervezett lépések: a repo klónozása; Python 3.11/3.12 virtuális környezet és csomagok telepítése; titkok nélkül `.env` konfigurálása; szerver és extension-verzió vizsgálata; `00_extensions.sql` futtatása.
- Kiinduló modell-/demóállapot: repo elérhető; Tiger Cloud PostgreSQL szolgáltatás vagy a repo által dokumentált helyi PostgreSQL áll rendelkezésre.
- Műveletek: Quick start szerint virtuális környezet létrehozása, requirements telepítése, `.env` létrehozása; adatbázis URI biztonságos beállítása; a szerver, `pg_textsearch`, `vector`, `vectorscale` elérhetőségének ellenőrzése; `sql/00_extensions.sql` futtatása.
- Elvárt végállapot és ellenőrzési pont: PostgreSQL 17-es szolgáltatás és `pg_textsearch` 1.5.1 vagy kompatibilis későbbi verzió; a szükséges extensionök létrehozva és kiírva.
- Fontos korlát: ne downgrade-eljünk újabb extensiont; Cloudon ne módosítsunk kézzel szerverkonfigurációt. A szolgáltatás elérhetősége és ára fiókfüggő.

#### C4.2 — Wikipedia-adatok betöltése és lefedettség

- Cél és rövid tevékenységleírás: betöltöm a forrásadatot és megkülönböztetem a szöveges, illetve embeddinggel lefedett rekordokat.
- Kapcsolódó történetelem: `1-story.md` — C4.
- Kártya szövege: „Milyen adatokon keresünk?”
- Átvezető szöveg: „Az adatok bent vannak; először a kifejezéseket indexeljük.”
- Tervezett lépések: `python db.py sql/01_schema.sql`, majd `python load.py`; a forrás loader rögzített, ellenőrzőösszeggel védett Simple English Wikipedia pillanatképet tölt; a forrásrekordok és demócímek ellenőrzése.
- Kiinduló modell-/demóállapot: extensionök beállítva; dedikált, tiszta tanítóadatbázis.
- Műveletek: séma létrehozása; `python load.py` futtatása; a `recording/17_counts.sql` és `17_articles.sql` ellenőrzése.
- Elvárt végállapot és ellenőrzési pont: teljes importnál 241 787 pozitív ID-jű forrásrekord; a `Volcano` és `Bioluminescence` címek léteznek.
- Fontos korlát: a két keresési mód eltérő cikkhalmazon futhat, ezért az eredmények összevetését a lefedettség is befolyásolja.

#### C4.3 — BM25 index és kulcsszavas rangsor

- Cél és rövid tevékenységleírás: felépítem és kipróbálom a BM25-alapú kulcsszavas keresést.
- Kapcsolódó történetelem: `1-story.md` — C4.
- Kártya szövege: „Kulcsszó és relevancia”
- Átvezető szöveg: „Most már a jelentés alapján is kereshetünk.”
- Tervezett lépések: a rövid natív `ts_rank` baseline után BM25 index létrehozása; azonos query futtatása; tényleges eredmény és `EXPLAIN (ANALYZE, BUFFERS)` terv megtekintése.
- Kiinduló modell-/demóállapot: cikkek betöltve, bővítmények elérhetők.
- Műveletek: a `recording/23_bm25_index.sql`, `24_bm25_query.sql` és `25_bm25_plan.sql` szerint létrehozom az indexet, futtatom a queryt, majd ellenőrzöm az aktuális tervet. Ezután a `29_search_column.sql` és `29_search_index.sql` állítja elő a közös title+body keresőmezőt.
- Elvárt végállapot és ellenőrzési pont: a kulcsszavas lekérdezés rendezett találatokat ad, és az index jelenléte ellenőrizhető.
- Fontos korlát: az operátor negatív pontszámot ad, alacsonyabb érték kerül előre. A BM25 pontszám index- és korpuszkontextushoz kötött; kis adathalmazon a planner szekvenciális tervet választhat.

#### C4.4 — Embeddingek és szemantikus keresés

- Cél és rövid tevékenységleírás: létrehozom vagy ellenőrzöm a szemantikus kereséshez szükséges vektorokat, majd futtatok egy lekérdezést.
- Kapcsolódó történetelem: `1-story.md` — C4.
- Kártya szövege: „Keresés a jelentés alapján”
- Átvezető szöveg: „A két lista külön is működik; most egyesítsük a rangjukat.”
- Tervezett lépések: embedding-konfiguráció azonosítása; generálás vagy meglévő vektorok ellenőrzése; hiányzók számlálása; szemantikus lekérdezés futtatása.
- Kiinduló modell-/demóállapot: a `vector(384)` oszlop készen áll; rögzített MiniLM-revízió helyben, CPU-n fut, ugyanaz a modell szolgál dokumentumhoz és lekérdezéshez; embedding API-kulcs nem szükséges.
- Műveletek: `python db.py sql/06_vectors.sql`; `python embed.py --limit 25000`; a teljesülési üzenet után `recording/41_vector_counts.sql`; majd `recording/41_vector_index.sql` (vagy a rövid Quick startban `sql/07_vector_index.sql`); utána szemantikus query.
- Elvárt végállapot és ellenőrzési pont: a rögzített kohorszban 0 hiányzó embedding; a DiskANN index létrejön és az `ANALYZE` lefut.
- Fontos korlát: a kohorsz legfeljebb 25 002 cím; a helyi CPU-futás időigénye gépfüggő. Az opcionális OpenAI modellt csak külön, új oszlop/index és teljesen konzisztens új vektorhalmaz mellett lehet használni.

#### C4.5 — Hibrid rangsor és RRF

- Cél és rövid tevékenységleírás: egyesítem a BM25- és szemantikus találati listát, majd összevetem az eredményeket.
- Kapcsolódó történetelem: `1-story.md` — C4.
- Kártya szövege: „A két rangsor egyesítése”
- Átvezető szöveg: „A rangsor már megvan; tegyük elérhetővé az alkalmazásból.”
- Tervezett lépések: RRF-lekérdezés végrehajtása; azonos bemenet használata; három mód eredményeinek rögzítése.
- Kiinduló modell-/demóállapot: BM25- és szemantikus keresés külön-külön működik.
- Műveletek: a projekt SQL-lekérdezésében egyesítem a két rangsort Reciprocal Rank Fusionnel; ugyanazzal a bemenettel összehasonlítom a három mód találati listáját.
- Elvárt végállapot és ellenőrzési pont: a hibrid végpont/lekérdezés listát ad; a kulcsszavas, szemantikus és hibrid mód eredményei ugyanazon teszt esetén egymás mellé tehetők.
- Fontos korlát: az RRF rangsorokat fuzionál; nem garantálja, hogy minden lekérdezésnél relevánsabb eredmény születik.

#### C4.6 — API és keresési felület

- Cél és rövid tevékenységleírás: összekapcsolom a keresési lekérdezéseket az API-val és a felülettel.
- Kapcsolódó történetelem: `1-story.md` — C4.
- Kártya szövege: „Keresés az alkalmazásból”
- Átvezető szöveg: „A keresést már elérjük; nézzük meg, hogyan kerül be egy új cikk.”
- Tervezett lépések: API és felület indítása a projektleírás szerint; mindhárom keresési mód meghívása; válasz és megjelenítés ellenőrzése.
- Kiinduló modell-/demóállapot: adatbetöltés, indexek és lekérdezési módok rendelkezésre állnak.
- Műveletek: a forrásalkalmazás FastAPI-végpontját és felületét elindítom; megvizsgálom, hogyan választ módot a kérés, és miként jelenik meg az eredmény.
- Elvárt végállapot és ellenőrzési pont: a felület mindhárom módra kérés–válasz útvonalat biztosít, a kapott eredmény az API-válaszban és felületen ellenőrizhető.
- Fontos korlát: ez localhost tanítóalkalmazás, nem nyilvános deploy-konfiguráció; éles használat authot, rate limitet, TLS-t és kapacitástervezést igényelne, ami kívül esik a videó scope-ján.

#### C4.7 — Új cikk mentése mindkét keresési módhoz

- Cél és rövid tevékenységleírás: hozzáadok egy mesterséges mintacikket, és követem, hogyan válik mindkét keresési mód számára elérhetővé.
- Kapcsolódó történetelem: `1-story.md` — C4; `1-story.md` — C5.
- Kártya szövege: „Új tartalom, két keresési út”
- Átvezető szöveg: „Ezzel a teljes adatút készen áll a végponttól végpontig tartó próbára.”
- Tervezett lépések: demo beszúró futtatása; tranzakció és visszakereshetőség ellenőrzése; titok maszkolása.
- Kiinduló modell-/demóállapot: az API aktív; mesterséges, nem személyes bemeneti cikk és maszkolt admin hozzáférés rendelkezésre áll.
- Műveletek: a forrásban lévő demo beszúróval elküldöm a címet, szöveget és URL-t; ellenőrzöm, hogy az embedding létrehozása után a cikk és vektor adatbázis-tranzakcióban mentődik; ezután megkeresem mindhárom módban.
- Elvárt végállapot és ellenőrzési pont: a tranzakció sikeresen commitol, a rekord megjelenik az adatbázisban és kereshetővé válik; a módonkénti rang helye a tényleges futtatásból kerül a scriptbe.
- Fontos korlát: a valós admin token nem jelenhet meg; ha a vektorgenerálás hibázik, a forrás szerint ne kerüljön be részleges cikk.

- Kiinduló modell-/demóállapot összesítve: a forrásprojekt lépéseit követő PostgreSQL környezet, adatbetöltés, indexek, embedding-lefedettség és API; ezek a felvételig ténylegesen felépítendők és ellenőrizendők.
- Elvárt végállapot és ellenőrzési pont összesítve: a felület egy azonosított bemenetre mindhárom keresési módban ellenőrizhető választ ad, és a cikkbeszúrás kereshetősége is igazolt.
- Fontos magyarázat vagy korlát: pontos bemenetek és parancsok a F5 repositoryból jönnek; mutable `main` ágat felvétel előtt újra kell ellenőrizni.

### C5 — Teszt és korlátok

- Cél és rövid tevékenységleírás: végigfuttatom a teljes adatútat, ellenőrzöm a tipikus és hibás esetet, majd külön megmutatom a lefedettség és az üzemeltetés korlátait.
- Kapcsolódó történetelem: `1-story.md` — C5.
- Kártya szövege: „Keresés, beszúrás, hibás eset”
- Átvezető szöveg: „A teszt alapján most már el tudjuk mondani, mit oldottunk meg, és mi maradt a felhasználó feladata.”
- Tervezett lépések:
  1. Ugyanazt a lekérdezést futtatom BM25-, szemantikus és hibrid módban, és rögzítem a találatokat.
  2. Lefuttatom az új cikk teljes beszúrási és visszakeresési útját.
  3. Hibás esetként a hiányzó vagy sikertelen embeddinget ellenőrzöm; a tranzakciós viselkedést a forráskód alapján igazolom.
  4. Jelzem, hogy az embeddingek csak a cikkek egy részére állnak rendelkezésre.
  5. Megadom a szolgáltatás/API/hosting költségeket csak aktuálisan ellenőrzött konfiguráció alapján; mérési adat nélkül nincs sebességígéret.
- Kiinduló modell-/demóállapot: teljes, elindított alkalmazás; mesterséges tesztcikk; előre rögzített keresőkifejezés; ismert szolgáltatási konfiguráció.
- Elvárt végállapot és ellenőrzési pont: keresés és beszúrás sikeressége, hibás eset rollbackje, eredménylisták és hiányzó vektorok dokumentáltak. Minden saját eredmény a tényleges felvételi próba után kerülhet narrációba.
- Fontos magyarázat vagy korlát: a forrásban elhangzott sikert nem állítjuk be a saját projektünk mérésének; benchmarkot csak a módszertannal együtt, nem saját app eredményeként említünk.

### C6 — Mit oldottunk meg?

- Cél és rövid tevékenységleírás: visszakötöm az ígéretet a tesztben látott eredményhez, és megnevezem, mikor kell saját adaton másik keresési döntés hozni.
- Kapcsolódó történetelem: `1-story.md` — C6.
- Kártya szövege: „Három mód, saját adaton ellenőrizve”
- Átvezető szöveg: „Ha ezt a megközelítést továbbvinnéd, itt a következő lépés.”
- Tervezett lépések:
  1. Egy mondatban összefoglalom a három mód funkcióját.
  2. Megnevezem a megmaradó feladatokat: index- és embedding-lefedettség, relevanciaértékelés, költség és üzemeltetés ellenőrzése.
  3. Nem ismétlem el újra a teljes építési folyamatot.
- Kiinduló modell-/demóállapot: a tesztek tényleges eredménye és a rögzített korlátok rendelkezésre állnak.
- Elvárt végállapot és ellenőrzési pont: az összefoglalás nem állít többet annál, amit a saját próba bizonyít; a felhasználó tudja, hogy saját dokumentumokon kell validálnia a relevanciát.
- Fontos magyarázat vagy korlát: a forrásdemó nem bizonyít ügyféladatokon elért minőséget vagy sebességet.

### CTA — Következő lépés

- Cél és rövid tevékenységleírás: a rögzített csatorna-CTA-t változtatás nélkül elmondom.
- Kapcsolódó történetelem: `1-story.md` — CTA.
- Kártya szövege: „Következő lépés”
- Átvezető szöveg: „Ha nem szeretnél lemaradni, iratkozz fel a YouTube-csatornámra! Ha pedig inkább kényelmesen velem végeztetnéd el a munkát, vagy konzultációt kérnél, keress a gombaflow.eu oldalon!”
- Tervezett lépések: a fenti rögzített szöveg egyetlen lezáró egységként hangzik el.
- Kiinduló modell-/demóállapot: a videó eredménye és fő korlátja már elhangzott.
- Elvárt végállapot és ellenőrzési pont: a CTA szó szerint egyezik a `VIDEO_STRUCTURE.md` szövegével.
- Fontos magyarázat vagy korlát: ne adjunk hozzá másik CTA-t vagy új ígéretet.

## Összehasonlítás

### Kézi lépések

- Előtte: külön keresőrendszer esetén a változó cikkeket külön adatút másolhatja át.
- Utána: a bemutatott megoldás a szöveget és keresési indexeket PostgreSQL-ben tartja; az embeddingkészítést és adatfrissítést továbbra is működtetni kell.

### Időráfordítás

- Előtte: a szinkronizáció és hibakeresés idejéről nincs mérés.
- Utána: a demó nem mér rendszerépítési vagy keresési időt; saját környezetben kell megmérni.

### Hibalehetőség

- Előtte: a másolt adat késhet vagy a frissítési esemény hibázhat.
- Utána: egy adatbázison belül kisebb lehet a külön indexmásolatok szétcsúszása, de az embeddinghiba, részleges lefedettség és indexépítés kockázata megmarad.

### Költség

- Előtte: külön keresőszolgáltatás, tárhely és emberi üzemeltetés költségeit kell számolni.
- Utána: adatbázis/hosting, embedding API és emberi ellenőrzés költségét kell számolni; konkrét összehasonlító összeg nincs.

### Emberi felügyelet

- Előtte: valakinek figyelnie kell az adatmásolást, frissítést és eltéréseket.
- Utána: valakinek továbbra is értékelnie kell a találatokat, lefedettséget, hibákat és a szolgáltatási költséget.

## Átadás

- Teljes történet és adatút lefedése: H, C1, C2, C3, C4.1–C4.7, C5, C6 és CTA lefedi az elfogadott történetet, az adatbetöltéstől a keresési módokon és API-n át a beszúrásig és ellenőrzésig.
- Nyitott akadályok: nincs blokkoló forráshiány; saját keresési eredmények, futásidők, aktuális cloud-költség és teljes end-to-end próba a forgatás előtt még igazolandó.
- Átadás: fejezetterv újragenerálva a repository részletes adatai alapján; scriptírásra kész, az eredmények és aktuális szolgáltatásfeltételek felvételi ellenőrzéshez kötve.
