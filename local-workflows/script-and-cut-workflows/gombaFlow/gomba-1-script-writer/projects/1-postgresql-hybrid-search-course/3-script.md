# Forgatási script — PostgreSQL-alapú hibrid keresés üzleti tartalmakhoz

- Témaazonosító: `1-postgresql-hybrid-search-course`
- Tervezett hossz: 25–35 perc, a telepítési, importálási, indexelési és embedding-várakozások vágásával; a műveletek és az ellenőrzések eredményei maradjanak láthatók.
- Bemeneti változatok és briefjóváhagyás: 0., 1. és 2. anyag 2026-10-26-i újrafuttatott változatai; a brief és történet chatben jóváhagyva, a felhasználó engedélyezte a forráskód miatti javítást és újragenerálást; F1 transcript; F5 `beaucarnes/wikisearch` repository `main` állapota ellenőrizve 2026-10-26-án.
- Javítási kör review-referenciája: első változat.

## Script nézői sorrendben

### H — Hook

- Rövid leírás: a hétköznapi vásárlói megfogalmazást szembeállítom a katalógus szaknyelvével, és megígérem a három keresési mód kipróbálását.
- Kártyaszöveg: „A kereső érti, mire gondol a vevő?”
- Átvezetés: „Nézzük meg, mit ad ugyanarra a kérdésre a kulcsszavas, a jelentésalapú és a kombinált keresés.”
- Felvétel jellege és előfeltétele: talking head és rövid képernyőbetét; előfeltétel a teljes WikiSearch demó és a három módban felvett tényleges találatlista.
- Működő modell/demó: hipotetikus termékkatalógus-helyzet → a WikiSearch-en végzett, tényleges keresési próba.
- Eredmény státusza: a történeti analógia tervezett; a keresési módok repo-kóddal alátámasztottak (F5), a saját képernyőfelvétel még nem készült.

#### Lépésről lépésre

1. **Művelet:** elmondom a nyitást: „Az ügyfél pontosan tudja, milyen termékre van szüksége, de nem ismeri a katalógus szakmai kifejezését. Ilyenkor a kereső könnyen nem azt mutatja, amit keres. Megnézzük, mit talál a kulcsszavas, a jelentésalapú és a kettőt kombináló keresés ugyanarra a kérdésre — PostgreSQL-ben.”
    - **Mutatom:** talking head után egy példakérdés és egy kitalált katalógusmező rövid felirata; majd a tényleges WikiSearch felület három módjának találatai.
    - **Mondom:** a fenti nyitószöveget.
    - **Figyelj / miért fontos:** a katalógushelyzet csak analógia; a demóadat Simple English Wikipedia, nem vállalati termékkatalógus.
    - **Elvárt eredmény és ellenőrzés:** a néző érti a problémát, és látja, hogy ugyanarra a `animals that make their own light` kérdésre három saját, rögzített keresési futás következik. A felvételen szereplő címek és sorrend a tényleges futásból jön.
    - **Forrás:** F1 00:00:10–00:00:48; F5 `recording/README.txt` 00:00–00:20 és `test-queries.txt`.

### C1 — A kész megoldás

- Rövid leírás: röviden demonstrálom a három keresési módot konfigurációmagyarázat nélkül.
- Kártyaszöveg: „Egy kereső, három rangsorolási mód”
- Átvezetés: „Mielőtt felépítjük, nézzük meg röviden, milyen munka változik az egyszerű kereséshez képest.”
- Felvétel jellege és előfeltétele: képernyő; a kész alkalmazásnak, teljes importnak és embedding-feladatnak be kell fejeződnie, `/health` lefedettség ellenőrizve.
- Működő modell/demó: query `animals that make their own light` → Keyword, Semantic, Hybrid → tényleges eredmények, találati lefedettség és API futásideje.
- Eredmény státusza: repo szerint a három mód és UI létezik (F5 README és `app.py`); saját top találatok még nincsenek lefuttatva és rögzítve.

#### Lépésről lépésre

1. **Művelet:** rögzítem a teljes alkalmazás előnézetét. A böngészőben beírom a `animals that make their own light` kérdést, és külön felvételi take-ben a Keyword, Semantic, majd Hybrid módot választom és elindítom a keresést.
    - **Mutatom:** az egyes módok kijelölését, a visszaérkező aktuális címeket, a lefedettség- és elapsed mezőket, valamint a forrásmegjelölést.
    - **Mondom:** „Ugyanazt a természetes nyelvű kérdést futtatom mindhárom módon. Itt a tényleges találatok látszanak. Nem állítom előre, hogy melyiknek kell nyernie; a választ a keresett adatok és a mérce határozza meg.”
    - **Figyelj / miért fontos:** ne kerüljön be vágóképre előre kitalált cím, mesterséges rang vagy képernyőn nem látható futásidő. Ha a módok nem ugyanannyi cikkből keresnek, a lefedettséget is mutassuk.
    - **Elvárt eredmény és ellenőrzés:** mindhárom kérés sikeres; a futásból származó találatokat felvételi jegyzet rögzíti, majd a vágás során szó szerint ezek maradnak a képen.
    - **Forrás:** F5 `recording/README.txt` 00:00–00:20 és 52:20; F5 `app.py` `/health` és `/search`; saját felvételi próba szükséges.

### C2 — Előtte és utána

- Rövid leírás: az öt kötött dimenzióval összevetem külön keresőrendszer és a repo egy adatbázisos demonstrációjának következményeit.
- Kártyaszöveg: „Kevesebb külön szinkronizálás, saját üzemeltetési döntések”
- Átvezetés: „Ehhez több összetevő dolgozik együtt; nézzük meg, melyik mit csinál.”
- Felvétel jellege és előfeltétele: talking head és egyszerű képernyőszöveg; a szövegek az alábbiak, nincs megtakarítási mérés.
- Működő modell/demó: architekturális előtte-utána magyarázat → PostgreSQL-es oktatódemo; nem vállalati előtte-utána mérés.
- Eredmény státusza: a projekt adatútja a forráskódban ellenőrzött (F5); TCO, idő- és hibamérés nincs.

#### Lépésről lépésre

1. **Művelet:** a következő rövid pontokat egymás mellett jelenítem meg és olvasom fel.
    - **Mutatom:** a közös összehasonlítás öt sorát; nem készítek másik összehasonlító struktúrát.
    - **Mondom:**
        - **Kézi lépések** — Előtte: „Külön keresőrendszernél az adatváltozásokat külön adatúton is át kell vezetni.” Utána: „Ebben a demóban az adat, a BM25 index és a vektorok ugyanabban a PostgreSQL-ben vannak; az embedding-folyamatot továbbra is fenn kell tartani.”
        - **Időráfordítás** — Előtte: „A szinkronizáció és az esetleges hibakeresés idejét itt nem mértük.” Utána: „A WikiSearch építési idejét sem állítom általános megtakarításnak; mérni a saját környezetben kell.”
        - **Hibalehetőség** — Előtte: „A másolt adat késhet, vagy a frissítési esemény hibázhat.” Utána: „A külön indexmásolat szétcsúszása elmaradhat, de az embedding hiánya, az indexépítés és a keresési minőség továbbra is ellenőrzendő.”
        - **Költség** — Előtte: „Külön keresőszolgáltatás, tárhely és üzemeltetés költségével is számolni kell.” Utána: „A Tiger Cloud vagy a saját PostgreSQL, a helyi számítás és az emberi ellenőrzés költségét kell nézni; konkrét TCO-t nem mértünk.”
        - **Emberi felügyelet** — Előtte: „Figyelni kell az adatmásolásra, frissítésre és eltérésekre.” Utána: „A találatokat, lefedettséget, hibákat és szolgáltatási költségeket továbbra is ember ellenőrzi.”
    - **Figyelj / miért fontos:** a „kevesebb külön szinkronizálás” architekturális következmény, nem mért idő- vagy hibacsökkenés. A helyi alapmodell nem használ embedding API-t, de CPU-időt és gépi erőforrást igen.
    - **Elvárt eredmény és ellenőrzés:** minden állítás forrásból levezetett vagy kifejezetten mérés nélkülinek jelzett; nincs ROI-, sebesség- vagy pontosságígéret.
    - **Forrás:** F1 00:04:09–00:05:01 és 00:55:53–00:56:59; F5 `README.md` „Retrieval choices” és `settings.py`.

### C3 — Szükséges szolgáltatások

- Rövid leírás: elhelyezem a komponensek szerepét és azt, mi kell a reprodukcióhoz.
- Kártyaszöveg: „Adatbázis, keresési bővítmények, helyi embedding”
- Átvezetés: „A szükséges elemek tiszták; most előkészítem a környezetet és az adatot.”
- Felvétel jellege és előfeltétele: talking head és rövid, maszkolt konfigurációs képernyő; árakat felvétel napján kell ellenőrizni a szolgáltatói fiókban.
- Működő modell/demó: PostgreSQL szolgáltatás + kiterjesztések + Python API + helyi MiniLM modell.
- Eredmény státusza: repo README és függőség-/kódleírás alapján ellenőrzött (F5); fiók konkrét díja és elérhetősége nincs ellenőrizve.

#### Lépésről lépésre

1. **Művelet:** egyenként megnevezem az összetevőket.
    - **Mutatom:** rövid feliratokat: PostgreSQL 17; `pg_textsearch` 1.5.1+; `pgvector`; `pgvectorscale`; Python 3.11/3.12; FastAPI/Psycopg; `sentence-transformers/all-MiniLM-L6-v2`.
    - **Mondom:** „A PostgreSQL tárolja a cikkeket, a BM25 indexet és a vektorokat. A `pg_textsearch` adja a korpuszstatisztikás kulcsszavas rangsort, a pgvector és a pgvectorscale a vektoros keresést. A FastAPI köti a lekérdezéseket a felülethez. Az alap embeddingmodell helyben, CPU-n fut, ezért ehhez nem kell külső embedding API-kulcs.”
    - **Figyelj / miért fontos:** az alternatív OpenAI `text-embedding-3-small` külön kulcsot, usage díjat, kompatibilis külön vektoroszlopot és indexet igényel. Ne keverd össze a két modell vektorait.
    - **Elvárt eredmény és ellenőrzés:** a néző érti a komponensek szerepét; nincs titok a képernyőn.
    - **Forrás:** F5 `README.md` „Version target”, „Quick start”, „Alternative embeddings”; `settings.py`; F1 00:01:32–00:01:44.

2. **Művelet:** röviden tisztázom a költségkeretet.
    - **Mutatom:** a repo README szolgáltatási figyelmeztetését és a fiók ellenőrzésére emlékeztető feliratot, nem személyes fiókadatot.
    - **Mondom:** „A helyi MiniLM-futtatás nem számláz embedding API-hívásokat, de használja a gép CPU-ját és idejét. A hosztolt PostgreSQL-nek lehet költsége; a repo leírásában szereplő promóciós kreditet nem szabad úgy értelmezni, hogy a szolgáltatás minden körülmények között ingyenes. Az aktuális díjat és feltételeket a saját fiókban kell ellenőrizni.”
    - **Figyelj / miért fontos:** a fiók aktuális szolgáltatási díja időérzékeny; csak felvétel napján ellenőrzött összeg hangozhat el. Ha nem tudjuk ellenőrizni, ne mondjunk számot.
    - **Elvárt eredmény és ellenőrzés:** nincs ellenőrizetlen ár- vagy ingyenességi állítás.
    - **Forrás:** F5 `README.md` „Course offer”, „Quick start” és „Alternative embeddings”; saját fiókellenőrzés szükséges.

### C4 — Megvalósítás

- Rövid leírás: a repo kódját követve haladok környezettől a betöltött cikkeken át a három keresési módig, majd egy új rekord írásáig.
- Kártyaszöveg: „Építsük fel a keresési adatutat”
- Átvezetés: „Az adatbázis most már tartalmazza az adatot és az indexeket; következhet a teljes keresési próba.”
- Felvétel jellege és előfeltétele: képernyőfelvétel több rövid take-ben. A teljes importot és CPU embeddinget előre be kell fejezni; a felvételben a hosszú várakozás kivágható, de nem szabad befejezettnek mutatni egy félbemaradt munkát.
- Működő modell/demó: tiszta tanítóadatbázis → rögzített Simple English Wikipedia-import → BM25/vektor indexek → FastAPI UI és query API → egy mesterséges új cikk.
- Eredmény státusza: a fájlok és parancsok F5 repositoryban dokumentáltak; a felhasználó gépén még nincs futtatva.

#### Lépésről lépésre

#### C4.1 — Környezet és adatbázis ellenőrzése

1. **Művelet:** klónozom a projektet és létrehozom a virtuális környezetet. A parancsokat a repository szülőmappájában, egyenként futtatom:

    ```bash
    git clone https://github.com/beaucarnes/wikisearch.git
    cd wikisearch
    python3 -m venv .venv
    source .venv/bin/activate
    python -m pip install -r requirements.txt
    ```

    - **Mutatom:** a klónozott projektet és a `.venv` aktiválását; a csomagletöltés idejét kivágom.
    - **Mondom:** „Ehhez Python 3.11 vagy 3.12 kell. A csomagokat a repo rögzített requirements fájljából telepítem.”
    - **Figyelj / miért fontos:** PowerShellben az aktiválás `.venv\Scripts\Activate.ps1`; telepítési kimenetet nem kell felolvasni. Ez külön bemutató repo, nem a GombaFlow alkalmazás része.
    - **Elvárt eredmény és ellenőrzés:** aktív `.venv`; a `python --version` 3.11 vagy 3.12-t mutat; install hiba esetén nem folytatom kész állapotot színlelve.
    - **Forrás:** F5 `README.md` „Quick start”.

2. **Művelet:** titok nélkül létrehozom a `.env`-et, és beállítom a PostgreSQL URI-t.

    ```bash
    cp -n .env.example .env
    ```

    A privát szerkesztőablakban `DATABASE_URL`-t a saját szolgáltatás URI-jára állítom, megtartva az `sslmode=require` paramétert. Csak akkor állítok `ADMIN_TOKEN`-t, ha a későbbi írási demót is felveszem:

    ```bash
    python -c 'import secrets; print(secrets.token_urlsafe(32))'
    ```

    - **Mutatom:** a felvételt megállítom a szerkesztés előtt, a `.env` fájlt nem mutatom, majd bezárom, mielőtt folytatom a felvételt.
    - **Mondom:** „A kapcsolat URI-ja és az admin token titok. A generált token csak helyi, védett `.env` fájlba kerül; videóba, chatbe vagy repositoryba nem.”
    - **Figyelj / miért fontos:** a `cp -n` nem ír felül meglévő konfigurációt. Soha ne olvassuk fel vagy mutassuk a valódi értékeket.
    - **Elvárt eredmény és ellenőrzés:** `.env` jelen van; adatbáziskapcsolat ellenőrizhető; token csak akkor beállítva, ha szükséges. A `.env` nem kerül commitba.
    - **Forrás:** F5 `README.md` „Quick start”, `.env.example`, `settings.py`; saját titokkezelési szabály.

3. **Művelet:** ellenőrzöm a szervert és az extensionök elérhető verzióit. A Tiger Cloud SQL Editorban vagy a repo szerint futtatom a `recording/11_discover.sql` fájlt:

    ```sql
    SELECT version();
    SELECT name, default_version, installed_version
    FROM pg_available_extensions
    WHERE name IN ('pg_textsearch', 'vector', 'vectorscale');
    SELECT version, installed
    FROM pg_available_extension_versions
    WHERE name = 'pg_textsearch'
    ORDER BY version;
    ```

    Majd ellenőrzöm a `.env` kapcsolatot:

    ```bash
    python db.py recording/13_connection.sql
    ```

    - **Mutatom:** a PostgreSQL-verziót, az extensionek elérhető és telepített verzióit, majd a sikeres kapcsolatjelzést. Kapcsolati URI nem látható.
    - **Mondom:** „A tananyag PostgreSQL 17-et céloz, a `pg_textsearch`-ből legalább 1.5.1 kell. Újabb verziót nem fokozok vissza; ha hiányzik a szükséges bővítmény, itt megállok és a szolgáltatás verzióját rendezem.”
    - **Figyelj / miért fontos:** Cloud környezetben ne szerkesszünk kézzel szerverkonfigurációt. Az aktuális extension elérhetőség szolgáltatásonként változhat.
    - **Elvárt eredmény és ellenőrzés:** PostgreSQL 17; `pg_textsearch` 1.5.1 vagy kompatibilis későbbi; `vector` és `vectorscale` elérhetők; a connection check sikeres.
    - **Forrás:** F5 `recording/README.txt` 11:15–13:20; F5 `README.md` „Version target”.

4. **Művelet:** engedélyezem a szükséges extensionöket a `sql/00_extensions.sql` fájllal:

    ```sql
    CREATE EXTENSION IF NOT EXISTS pg_textsearch;
    CREATE EXTENSION IF NOT EXISTS vectorscale CASCADE;
    SELECT extname, extversion
    FROM pg_extension
    WHERE extname IN ('pg_textsearch', 'vector', 'vectorscale');
    ```

    A fájl verzióvédő blokkja ellenőrzi a `pg_textsearch` alsó verzióhatárát, majd angol szövegkonfigurációt állít be.
    - **Mutatom:** kiterjesztésnevek és visszaadott verziók; a titkok nem szerepelnek a SQL-ben.
    - **Mondom:** „A verzióellenőrzés itt szándékos. Ha guard hibát ad, nem ugrom át: a beállított szolgáltatás nem felel meg a tananyag kiindulópontjának.”
    - **Figyelj / miért fontos:** extension engedélyezés és frissítés eltérő művelet. Újabb telepített verziót nem downgrade-elünk.
    - **Elvárt eredmény és ellenőrzés:** a három extension megjelenik a lekérdezésben; a verzióguard nem hibázik.
    - **Forrás:** F5 `sql/00_extensions.sql`, `recording/README.txt` 11:35–12:00.

#### C4.2 — Wikipedia-adatok betöltése és lefedettség

5. **Művelet:** létrehozom a táblát és szekvenciát:

    ```bash
    python db.py sql/01_schema.sql
    ```

    - **Mutatom:** a sikeres `CREATE TABLE` és `CREATE SEQUENCE` eredményt.
    - **Mondom:** „Először az adatmodellt készítem elő: cikkazonosító, URL, cím, törzs és szószám. Az embedding oszlop később kerül hozzá.”
    - **Figyelj / miért fontos:** a repo dedikált tanítóadatbázist javasol; az újrafuttatás nem migrál inkompatibilis meglévő sémát.
    - **Elvárt eredmény és ellenőrzés:** `articles` tábla és `demo_article_id` sequence létrejött.
    - **Forrás:** F5 `sql/01_schema.sql` és `README.md` „Quick start”.

6. **Művelet:** betöltöm a forrásadatokat:

    ```bash
    python load.py
    ```

    - **Mutatom:** a tényleges letöltés/import előrehaladását, majd a `Read / inserted / total` sort. Ha az adatbázis már teljes, megmutatom a valós nulla beszúrásos újrafuttatást.
    - **Mondom:** „A loader a rögzített 2023-as Simple English Wikipedia pillanatképet használja, és ellenőrzőösszeggel védi a letöltést. Nem töltünk be egy tetszőleges, változó állapotú adatcsomagot.”
    - **Figyelj / miért fontos:** a teljes letöltés és betöltés gép- és hálózatfüggő. A script folyamatát egyelőre előre elvégzem; a videóban csak valós folyamatállapotot mutatok, nem hamisított progress sort.
    - **Elvárt eredmény és ellenőrzés:** loader befejeződik; a teljes korpusz ellenőrzése külön SQL-lel történik.
    - **Forrás:** F5 `load.py` rögzített revision, fájlnév és SHA-256; `recording/README.txt` 16:00–17:40.

7. **Művelet:** ellenőrzöm a forrásrekord-számot és a demohoz használt címeket:

    ```bash
    python db.py recording/17_counts.sql
    python db.py recording/17_articles.sql
    ```

    - **Mutatom:** a pozitív forrás ID-k számát, a `Volcano` és `Bioluminescence` meglétét, valamint az átiratban említett demo címeket.
    - **Mondom:** „A teljes rögzített snapshot 241 787 forrásrekordot tartalmaz. A negatív ID-ket később hozzáadott demo-cikkek kapják, ezért a forrásrekordok számát külön számoljuk.”
    - **Figyelj / miért fontos:** 1 000 soros próbaimport nem alkalmas teljes korpuszra tervezett rangsorok bemutatására; előbb a `/health` és a rekordellenőrzés igazolja az adatállapotot.
    - **Elvárt eredmény és ellenőrzés:** 241 787 pozitív forrásrekord teljes load esetén, `Volcano` és `Bioluminescence` létezik. Eltérésnél nem folytatom összehasonlító felvétellel.
    - **Forrás:** F5 `recording/README.txt` 17:00–17:40; `load.py`.

#### C4.3 — BM25 index és kulcsszavas rangsor

8. **Művelet:** rövid natív PostgreSQL baseline-t készítek, hogy legyen mihez képest értelmezni a BM25-t. A repo `recording/19_gin_index.sql` és `19_native_query.sql` fájljait futtatom:

    ```bash
    python db.py recording/19_gin_index.sql
    python db.py recording/19_native_query.sql
    ```

    - **Mutatom:** a GIN index létrehozását, majd az aktuális címeket és `ts_rank` értékeket. Ha all-terms lekérdezés nulla sort ad, ezt tényszerűen mondom el.
    - **Mondom:** „A natív full-text baseline először azt keresi, hogy a feldolgozott query-kifejezések szerepelnek-e a cikkben, majd a találatokat rangsorolja. Ezt tekintjük az összehasonlítás egyik alapvonalának.”
    - **Figyelj / miért fontos:** nem ígérek előre konkrét cikket; a tokenizer és a teljes kifejezés-egyezés befolyásolja, mely rekordok jutnak át.
    - **Elvárt eredmény és ellenőrzés:** index sikeresen létrejön; a valós query-válasz és a címek rögzítve vannak.
    - **Forrás:** F5 `recording/README.txt` 19:00–19:20; `recording/19_*.sql`.

9. **Művelet:** elmagyarázom a BM25 indexet és lefuttatom a forrás lekérdezését:

    ```bash
    python db.py recording/23_bm25_index.sql
    python db.py recording/24_bm25_query.sql
    python db.py recording/25_bm25_plan.sql
    ```

    - **Mutatom:** az indexdefinícióban a `USING bm25`, `text_config='english'`, majd a lekérdezésben a `<@>` operátort és a `to_bm25query()` indexnevet. A query outputját és a valós tervet tartom képen.
    - **Mondom:** „A BM25 a kifejezés gyakoriságát, a dokumentumhosszt és a teljes korpusz szógyakoriságát veszi figyelembe. A visszaadott pontszám itt negatív, ezért az alacsonyabb érték kerül előre. A pontszám csak ugyanazon index és korpusz keretében értelmezhető.”
    - **Figyelj / miért fontos:** a query plan a tényleges PostgreSQL-terv; nem nevezek meg benne olyan indexutat vagy időeredményt, amit az adott futás nem mutat. Az ismételt mérés meleg cache-hatást tartalmazhat.
    - **Elvárt eredmény és ellenőrzés:** BM25 találatok és pontszámok jelennek meg; a tervben a tényleges indexhozzáférés vagy a planner választása látható.
    - **Forrás:** F1 00:05:01–00:07:17 és 00:08:14–00:08:24; F5 `recording/README.txt` 23:00–25:00 és `sql/03_first_bm25.sql`.

10. **Művelet:** a cím és törzs közös keresőmezőjét hozom létre:

```bash
python db.py recording/29_search_column.sql
python db.py recording/29_search_index.sql
```

- **Mutatom:** az `ALTER TABLE` műveletet és a `search_text` mezőre épülő index létrejöttét.
- **Mondom:** „A felület címben és törzsben is keres. Ezért a későbbi app-lekérdezések a repo `search_text` mezőjét és annak BM25 indexét használják.”
- **Figyelj / miért fontos:** a teljes korpuszon az oszlopmódosítás és indexépítés eltarthat; megvárom a kész eredményt, majd kivágom a várakozást. Index létrejötte előtt nem indítom a queryt.
- **Elvárt eredmény és ellenőrzés:** a mező, majd az `articles_search_bm25` index készen van.
- **Forrás:** F5 `recording/README.txt` 29:00–29:25; `sql/search_keyword.sql`.

#### C4.4 — Embeddingek és szemantikus keresés

11. **Művelet:** létrehozom az embedding oszlopot:

```bash
python db.py sql/06_vectors.sql
```

A lekérdezés az alábbi oszlopot adja hozzá:

```sql
ALTER TABLE articles ADD COLUMN IF NOT EXISTS embedding vector(384);
```

- **Mutatom:** az oszlop létrejöttét, és a repo `settings.py` modellnevét, a `c9745ed1d9f207416be6d2e6f8de32d1f16199bf` rögzített revíziót, valamint a 384 dimenziós vektorbeállítást.
- **Mondom:** „A repo rögzített `all-MiniLM-L6-v2` modellje 384 dimenziós vektort készít. A cím és a törzs első 1 500 karaktere kerül a dokumentum embedding inputjába; a query ugyanazzal a modellel készül.”
- **Figyelj / miért fontos:** meglévő embeddinghalmaz közben nem váltunk modellre vagy előfeldolgozásra; a dimenziók egyezése önmagában nem tesz kompatibilissé két külön modellvektort.
- **Elvárt eredmény és ellenőrzés:** `embedding vector(384)` oszlop rendelkezésre áll.
- **Forrás:** F5 `sql/06_vectors.sql`, `settings.py` (`MODEL_NAME`, `MODEL_REVISION`, `DIMENSIONS`, `document_text`).

12. **Művelet:** helyben kiszámítom a rögzített cikkhalmaz embeddingjeit:

```bash
python embed.py --limit 25000
```

- **Mutatom:** a hiányzó embeddingek számát, a modell betöltését és egy tényleges batch progress sort. A folyamatot terminálban befejezem, a felvételben a hosszú számítási szünetet megvágom.
- **Mondom:** „A script a 25 000 leghosszabb cikket választja ki még a hiányzók szűrése előtt, és a két demo címet is hozzáveszi, ha benne vannak a snapshotban. Így egy újrafuttatás nem tolja arrébb és nem növeli észrevétlenül a kohorszt. A modell lokálisan fut; a gép terhelése és ideje változó.”
- **Figyelj / miért fontos:** a batch-ek külön tranzakcióban mentődnek; a script kapcsolatmegszakításkor idempotensen folytathatja a hiányzó vektorokat. Ne mutassunk személyes adatot, kulcs itt nincs.
- **Elvárt eredmény és ellenőrzés:** a folyamat valódi `Embedding job complete.` vagy „already embedded” üzenettel ér véget; megállt vagy hibás futásnál nem folytatok sikeres állításokkal.
- **Forrás:** F5 `embed.py`, `settings.py`, `recording/README.txt` 39:40–41:00.

13. **Művelet:** ellenőrzöm a hiányzó embeddingeket és létrehozom a vektorindexet:

```bash
python db.py recording/41_vector_counts.sql
python db.py recording/41_vector_index.sql
```

- **Mutatom:** a `saved` és `missing_embeddings` értéket; csak 0 hiányzó érték után a DiskANN index létrehozását és `ANALYZE`-t.
- **Mondom:** „A vektoros keresést csak akkor hasonlítom a többi módhoz, amikor a kijelölt kohorsz teljes. A részleges embeddingkészlet más lefedettséget adna.”
- **Figyelj / miért fontos:** indexépítés időt vehet igénybe; a terminálban megvárom a `CREATE INDEX` és `ANALYZE` végét.
- **Elvárt eredmény és ellenőrzés:** `missing_embeddings = 0`, DiskANN index sikeres.
- **Forrás:** F5 `recording/README.txt` 41:00–41:20; `sql/07_vector_index.sql`.

14. **Művelet:** futtatok egy szemantikus keresést:

```bash
python query.py 'animals that make their own light' --mode semantic
```

- **Mutatom:** a valódi találati címeket és az embedding-alapú rangsorukat.
- **Mondom:** „A query itt természetes nyelven írja körül a témát. Az eredmény a vektoros kohorszra korlátozódik, ezért a lefedettséget mindig együtt kell néznünk a találatokkal.”
- **Figyelj / miért fontos:** a forrásvideó említ egy hasonló keresési példát, de a saját alkalmazásunk eredménycímeit csak a mostani futásból vesszük.
- **Elvárt eredmény és ellenőrzés:** a futás választ ad vagy tényszerű üres eredményt jelez; a sorok a felvételi jegyzetbe kerülnek.
- **Forrás:** F1 00:00:10–00:00:33; F5 `recording/README.txt` 43:00.

#### C4.5 — Hibrid rangsor és RRF

15. **Művelet:** futtatom a hibrid lekérdezés tervét:

```bash
python query.py 'Apollo 13' --mode hybrid --explain
```

- **Mutatom:** a valós tervben a keyword és vector candidate szakaszokat, azok tényleges sorszámát, majd a csoportosítást és limitet.
- **Mondom:** „Előbb külön lekérjük a BM25- és vektortalálatok jelöltjeit, utána rangsorokból készítünk közös listát. A default beállítás a két listából legfeljebb 20 jelöltet vesz, az RRF k értéke 60, a súlyok alapból fele-fele.”
- **Figyelj / miért fontos:** RRF a ranghelyeket egyesíti `weight / (60 + rank)` hozzájárulással. Nem ígéri, hogy minden queryre a hibrid lesz a legjobb. A jelöltek lekérése közvetlen `ORDER BY` + `LIMIT` előtt történik a repo queryben.
- **Elvárt eredmény és ellenőrzés:** tervben a két jelöltút és fúzió megfigyelhető; tényleges sorok/plan node-ok alapján magyarázok, nem kitalált sorszámokból.
- **Forrás:** F1 00:43:33–00:44:00; F5 `sql/search_hybrid.sql`, `README.md` „Retrieval choices”, `recording/README.txt` 47:20.

16. **Művelet:** ugyanazzal az `Apollo 13` queryvel külön futtatom mindhárom módot:

```bash
python query.py 'Apollo 13' --mode keyword
python query.py 'Apollo 13' --mode semantic
python query.py 'Apollo 13' --mode hybrid
```

- **Mutatom:** mindhárom parancs külön outputját; az első találatok címét felírom helyi felvételi jegyzetbe.
- **Mondom:** „Most azonos queryt adok a három rangsorolónak. A képernyőn látható címek és sorrend a mostani valós futás eredménye; egy másik korpuszban vagy verzióban eltérhet.”
- **Figyelj / miért fontos:** `Apollo 13` pontos névhez a kulcsszavas mód természetes baseline; a semantic és hybrid kimenetét ettől még nem minősítem eredmény nélkül.
- **Elvárt eredmény és ellenőrzés:** három teljes válasz; a címek és futásidők rögzítve. Ha a rekord-kohorsz vagy index nem teljes, a comparison take-et újra kell készíteni.
- **Forrás:** F5 `test-queries.txt`, `recording/README.txt` 47:40–49:00; saját futtatás szükséges.

#### C4.6 — API és keresési felület

17. **Művelet:** elindítom a helyi webalkalmazást, ha nincs már egy példány futtatva:

```bash
uvicorn app:app --host 127.0.0.1 --port 8000
```

Böngészőben a `http://127.0.0.1:8000` címet nyitom meg. Ha a porton már fut egy korábbi rehearsal szerver, azt használom; nem indítok második példányt.

- **Mutatom:** a felületet, a Keyword/Semantic/Hybrid választót, a coverage mezőket és a forrásláblécet.
- **Mondom:** „Az API mindhárom módot külön kezeli. A `/health` visszaadja a rekord- és embedding-számot, valamint a `pg_textsearch` verziót; a `/search` pedig a query eredményeit.”
- **Figyelj / miért fontos:** ez localhost tanítóapp. A `127.0.0.1` cím nem nyilvános deploy, és éles rendszerhez további hozzáférés-, TLS- és kapacitásvédelem kell.
- **Elvárt eredmény és ellenőrzés:** a felület megnyílik; mindhárom mód keresést futtat; Network tabon a `/search` válasz értelmes `mode`, `results`, coverage és elapsed mezőkkel látszik.
- **Forrás:** F5 `app.py` `/`, `/health`, `/search`; `recording/README.txt` 52:00–52:20.

18. **Művelet:** megmutatok egy súlyozott API-lekérdezést:

```bash
curl -sS -G http://127.0.0.1:8000/search \
  --data-urlencode 'q=Apollo 13' \
  --data-urlencode 'mode=hybrid' \
  --data-urlencode 'semantic_weight=0.7' | python -m json.tool
```

- **Mutatom:** JSON-válaszból `mode` és tényleges címek; Uvicorn logban nincs secret.
- **Mondom:** „Itt a szemantikus hozzájárulás nagyobb súlyú, de az eredmény továbbra is adat- és queryfüggő. Ez egy paraméterezhető rangsor, nem minőségi garancia.”
- **Figyelj / miért fontos:** az admin token nem része a keresési kérésnek; terminal historyban ne szerepeljen valódi token.
- **Elvárt eredmény és ellenőrzés:** HTTP kérés sikeres, JSON parse-olható, a visszakapott címek a tényleges futásból jönnek.
- **Forrás:** F5 `app.py`, `recording/README.txt` 52:40.

#### C4.7 — Új cikk mentése mindkét keresési módhoz

19. **Művelet:** egyszer futtatom az autentikált demo cikk beszúrást:

```bash
python demo_insert.py
```

A segédscript `quokkatapir search demo` című, `example.com` URL-jű, mesterséges szövegű rekordot küld az API-nak. A `.env`-ből olvassa az `ADMIN_TOKEN`-t.

- **Mutatom:** a sikeres 201-es választ és az alkalmazásban a `quokkatapir` keresést három módban, külön take-ekben.
- **Mondom:** „Az új cikk először megkapja a helyi embeddingjét, aztán a szöveg és vektor egy adatbázis-tranzakcióban mentődik. A válasz csak commit után jelez sikert. Most visszakeresem ugyanazt a mesterséges cikket.”
- **Figyelj / miért fontos:** a forrás segédje minden sikeres futásnál új negatív ID-jű sort ad hozzá. Felvételkor csak egyszer futtasd; újrafuttatás duplikált demo rekordokat hoz. A valódi token ne legyen látható.
- **Elvárt eredmény és ellenőrzés:** 201 response, negatív ID és rekord megjelenik a keresési válaszban; a ranghelyet előre nem ígérem.
- **Forrás:** F5 `demo_insert.py`, `app.py` `POST /articles`, `recording/README.txt` 53:40; F1 00:55:28–00:56:59.

20. **Művelet:** külön, visszagörgethető tranzakciódemóval megmutatom a rollbacket:

```bash
python record_transaction.py
```

- **Mutatom:** előtte a script Entert kér; az átmeneti, egyedi cikk megjelenik a BM25 keresésben; második Enterre rollbackel; utána nincs találat, és a script igazolja, hogy a rekord hiányzik.
- **Mondom:** „A rekord csak a nyitott tranzakción belül látható; rollback után eltűnik. Ez a bemutató a tranzakciós indexviselkedést szemlélteti, nem a sikeres `/articles` commitot vonja vissza.”
- **Figyelj / miért fontos:** a terminálban hagyom futni az interaktív scriptet; egyetlen külön sessiont használ. A demo terméke nem kerül véglegesen az adatbázisba, de a sequence értéke rollback után is előreléphet.
- **Elvárt eredmény és ellenőrzés:** a program kiírja, hogy a rekord eltűnt és nem commitolódott.
- **Forrás:** F5 `record_transaction.py`, `README.md` „Recording the course”.

### C5 — Teszt és korlátok

- Rövid leírás: teljes kérés–válasz utat, új rekordot, hibás inputot és hozzáférési korlátot ellenőrzök.
- Kártyaszöveg: „Keresés, beszúrás, hibás eset”
- Átvezetés: „A teszt alapján most már el tudjuk mondani, mit oldottunk meg, és mi maradt a felhasználó feladata.”
- Felvétel jellege és előfeltétele: képernyő; működő DB, API, completed embeddings és valós smoke-check. A suite eredményét saját futásból mutatom.
- Működő modell/demó: query → API → SQL → result; cikkbeszúrás → embedding → transaction → kereshetőség; hibás query és hiányzó admin hitelesítés.
- Eredmény státusza: tesztek repo által leírtak (F5 README/recording file); a GombaFlow gépén nem futtattam őket. Felvétel előtt végre kell hajtani és a valódi kimenetet megmutatni.

#### Lépésről lépésre

21. **Művelet:** lefuttatom a repo egység- és adatbázis smoke tesztjeit a projekt virtuális környezetében:

```bash
python -m pip install -r requirements-dev.txt
python -m unittest discover -s tests -v
python smoke.py
```

- **Mutatom:** a unit teszt tényleges összegzését és a valós adatbázis smoke teszt valódi eredményét; telepítési kimenetet kivágom.
- **Mondom:** „A unit suite az API és SQL segédviselkedését ellenőrzi. A smoke próba valós adatbázison fut és rollback-only fixture-t használ. Csak az itt ténylegesen sikeres tesztet nevezem sikeresnek.”
- **Figyelj / miért fontos:** ha hiányzik a `httpx`, a repo a `requirements-dev.txt`-t írja elő. A `smoke.py` csak teljes séma és indexek után futtatható. Hiba esetén megállok, kivizsgálom, és nem veszek fel sikerállítást.
- **Elvárt eredmény és ellenőrzés:** rögzített, nem szerkesztett tesztösszegzés; smoke valós futásának végeredménye látható.
- **Forrás:** F5 `README.md` „Validation and troubleshooting”, `recording/README.txt` 54:00–54:20.

22. **Művelet:** hibás lekérdezést és hitelesítés nélküli írási kérést küldök:

```bash
curl -sS -i 'http://127.0.0.1:8000/search?q=&mode=keyword'
curl -sS -i 'http://127.0.0.1:8000/search?q=jazz&mode=invalid'
curl -sS -i -X POST http://127.0.0.1:8000/articles \
  -H 'Content-Type: application/json' \
  -d '{"title":"Auth check","body":"Do not insert without a token","url":"https://example.com"}'
```

- **Mutatom:** az első két kérés HTTP 422 válaszát; az írási kérésnél 401-et, ha írás engedélyezett és hiányzik a header, vagy 503-at, ha nincs konfigurált aktív `ADMIN_TOKEN`.
- **Mondom:** „Az API nem fogad el üres queryt vagy ismeretlen módot. Az új cikk írásához admin token kell. Ezeket a kéréseket szándékosan token nélkül küldöm.”
- **Figyelj / miért fontos:** a token értéke soha ne szerepeljen a curl parancsban vagy képernyőn. Váratlan 2xx válasznál a felvételt leállítom és ellenőrzöm a konfigurációt.
- **Elvárt eredmény és ellenőrzés:** valódi 422/401 vagy 503 státuszkódok; az adatbázisban nincs `Auth check` rekord.
- **Forrás:** F5 `app.py` validáció és `recording/README.txt` 54:40.

23. **Művelet:** megmutatom az adatbázis írás- és indexállapotának read-only áttekintését:

```bash
python db.py sql/08_operations.sql
```

- **Mutatom:** indexhasználati és compaction állapot; a maintenance parancsok kommentben maradnak.
- **Mondom:** „Ez csak megfigyelés. Nem indítok force merge-et vagy REINDEX-et a demo közben.”
- **Figyelj / miért fontos:** az indexkarbantartás módosító, üzemeltetési művelet; nem szükséges a keresési demohoz.
- **Elvárt eredmény és ellenőrzés:** read-only eredménykészlet; nincs háttérben indított indexmódosítás.
- **Forrás:** F5 `sql/08_operations.sql`, `recording/README.txt` 55:25.

24. **Művelet:** összefoglalom a tényleges teszt és az adatlefedettség alapján maradó korlátokat.

- **Mutatom:** a `/health` számait, a három keresési mód jegyzett találatait, az edge case státuszkódjait és a fiók költségellenőrzésének státuszát.
- **Mondom:** „A kulcsszavas keresés az összes betöltött cikkből keres; a szemantikus mód csak a kiválasztott, legfeljebb 25 002 rekordos kohorszból. A hibrid mód e két rangsor jelöltjeit fuzionálja. Ez a demó nem bizonyítja, hogy a hibrid minden céges dokumentumtárban jobb találatot ad, és nem bizonyít általános sebességelőnyt.”
- **Figyelj / miért fontos:** a benchmark szekció a forrásvideóban szereplő harmadik fél tesztjét mutatja; ez nem a WikiSearch saját benchmarkja. A tananyagban elhangzott szolgáltatási promóció sem azonos a jelenlegi account árával.
- **Elvárt eredmény és ellenőrzés:** minden záróállítás egy saját futással, forráskód-részlettel vagy kifejezetten jelzett hiánnyal van ellátva.
- **Forrás:** F1 00:57:07–00:58:44; F5 `README.md` „Retrieval choices”, „Validation and troubleshooting”.

### C6 — Mit oldottunk meg?

- Rövid leírás: összefoglalom, mire képes a bemutatott app, és mi marad a felhasználónak saját adaton ellenőrizni.
- Kártyaszöveg: „Három mód, saját adaton ellenőrizve”
- Átvezetés: „Ha ezt a megközelítést továbbvinnéd, itt a következő lépés.”
- Felvétel jellege és előfeltétele: talking head és az ellenőrzött demó rövid betétje; az előző fejezet összes teszteredménye rendelkezésre áll.
- Működő modell/demó: az elkészült WikiSearch demó → három keresési mód, egy sikeres írási példa és ellenőrzött korlátok.
- Eredmény státusza: saját eredmény csak a próba után; forrásrepo dokumentálja a tervezett funkciókat.

#### Lépésről lépésre

25. **Művelet:** lezárom az eredeti ígéretet azzal, amit ténylegesen láttunk.

- **Mutatom:** röviden a működő keresési felületet, a mesterséges demo cikk eredményét és a lefedettségi számot.
- **Mondom:** „A WikiSearch ugyanabban a PostgreSQL adatbázisban mutat BM25 kulcsszavas, szemantikus és hibrid keresést. A próbakérdéseinknél láttuk a tényleges eredményeket; hogy a te adataidon melyik működik jobban, saját lekérdezésekkel kell ellenőrizni.”
- **Figyelj / miért fontos:** a `te tényleges eredményeid` kifejezést csak akkor mondom, ha a felvétel előtt a saját adatbázisban lefutott; a mintabázisról beszélek.
- **Elvárt eredmény és ellenőrzés:** az összegzés nem tesz általános pontosság-, költség- vagy sebességállítást.
- **Forrás:** F5 `README.md` „Retrieval choices”; saját, dokumentált próba.

### CTA — Következő lépés

- Rövid leírás: elmondom a közös, rögzített csatornazárást.
- Kártyaszöveg: „Következő lépés”
- Átvezetés: „Ha nem szeretnél lemaradni, iratkozz fel a YouTube-csatornámra! Ha pedig inkább kényelmesen velem végeztetnéd el a munkát, vagy konzultációt kérnél, keress a gombaflow.eu oldalon!”
- Felvétel jellege és előfeltétele: talking head; az összefoglalás kész.
- Működő modell/demó: a videó igazolt eredménye és fő korlátja → rögzített CTA.
- Eredmény státusza: szöveg forrása a közös struktúra; szó szerinti CTA.

#### Lépésről lépésre

26. **Művelet:** a fenti CTA-t egy take-ben mondom el.

- **Mutatom:** talking head; nincs új technikai állítás vagy extra felirat.
- **Mondom:** „Ha nem szeretnél lemaradni, iratkozz fel a YouTube-csatornámra! Ha pedig inkább kényelmesen velem végeztetnéd el a munkát, vagy konzultációt kérnél, keress a gombaflow.eu oldalon!”
- **Figyelj / miért fontos:** a szöveget a `VIDEO_STRUCTURE.md` adja; ne tegyünk mellé másik CTA-t.
- **Elvárt eredmény és ellenőrzés:** zárószöveg szó szerint egyezik a közös struktúrával.
- **Forrás:** `VIDEO_STRUCTURE.md` — Rögzített CTA.

## Felvételi rend

- **1. sorrend — C4.1–C4.7, majd C5:** előbb az alkalmazást építem fel, lefuttatom a teljes importot, embeddinget, kereséseket és hibapróbát. Előfeltétel: a teljes adatút és service-verzió ellenőrzött.
- **2. sorrend — C1:** a kész alkalmazással rögzítem a nyitó demo képernyőanyagát. Előfeltétel: `/health` számai, queryk és aktuális találatok jegyzetelve.
- **3. sorrend — C4 képernyőfelvételei:** rövid, külön take-ekben rögzítem a reprodukálható építési lépéseket és a köztes állapotokat. A hosszú install, import, index és CPU embedding várakozása kivágható; hibás vagy befejezetlen eredményt tilos elrejteni.
- **4. sorrend — C5:** a unit teszt, DB smoke, HTTP edge case és rollback demonstráció felvétele. Előfeltétel: a tesztek tényleges kimenete és a DB visszaállítható állapota.
- **5. sorrend — C3 és C2:** a szolgáltatásokat, költségeket és összehasonlítást a ténylegesen kiválasztott környezet, modell és ellenőrzött fiókár alapján rögzítem.
- **6. sorrend — H, C6, CTA:** csak a működő demó és igazolt teszteredmény után veszem fel a végleges nyitást, összefoglalást és CTA-t.

## Átadás review-ra

- Ellenőrzendő állítások és saját technikai próbák:
    - **C1:** mindhárom módban futtatott `animals that make their own light`; tényleges címek, coverage és elapsed adatok.
    - **C4.1–C4.2:** aktuális extension-verziók, sikeres connection, 241 787 source-row count és rögzített adatkészlet.
    - **C4.3–C4.5:** BM25 indexterv és 0-hiányos embedding-kohorsz; azonos `Apollo 13` query három módon; RRF-terv; minden szám a saját terminálból.
    - **C4.6–C4.7:** HTTP válaszok, UI eredmény, `quokkatapir` egyszeri írása és visszakereshetősége; valódi token végig maszkolva.
    - **C5:** `python -m unittest discover -s tests -v`, `python smoke.py`, 422/401/503 edge case és rollback eredmények.
    - **C2–C3:** aktuális Tiger Cloud szolgáltatási ár és kredittermék feltételei a fiókban; az alap MiniLM nem használ külső embedding API-t.
- Nyitott tervezési akadályok: nincs blokkoló technikai forráshiány. A repo `main` változó, ezért a parancsokat/függőségeket és a cloud fiók feltételeit a tényleges felvételi napon újra ellenőrizni kell. A saját projektet és teszteket még nem futtattam.
- Átadás: review-ra kész forgatókönyv; a felvétel előtt megjelölt saját futtatási bizonyítékokat és aktuális költségellenőrzést el kell végezni. A tényleges demóadat és minden sikerállítás csak ezek után kerülhet a végső videóba.
