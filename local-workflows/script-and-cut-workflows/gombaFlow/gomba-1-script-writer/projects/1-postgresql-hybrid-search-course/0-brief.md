# Brief — PostgreSQL-alapú hibrid keresés üzleti tartalmakhoz

- Projektazonosító: `1-postgresql-hybrid-search-course`
- Kiválasztott videóbejegyzés: `local-workflows/script-and-cut/gombaFlow/gomba-0-idea-collector/results/20261025-ideas.md`, 6. bejegyzés: PostgreSQL Hybrid Search Course – Keyword (BM25) + Vector Retrieval; https://www.youtube.com/watch?v=kT7nXO32L-Q
- Bemeneti változatok: registry: `projects/registry.json` (a `kT7nXO32L-Q` bejegyzés szerint `transcript_ready: true`); Gomba 0 lista: `20261025-ideas.md`; transcript: `projects/1-postgresql-hybrid-search-course/source-transcript.md`; F5 repository, README és kód a `main` ágon (ellenőrzés dátuma: 2026-10-26); workflow és a 0. brief-template aktuális változata.
- Kiválasztott forrásvideó: PostgreSQL Hybrid Search Course – Keyword (BM25) + Vector Retrieval, Bo Karns / freeCodeCamp.org; https://www.youtube.com/watch?v=kT7nXO32L-Q
- Elemzés alapja és korlátai: a forrásvideó angol átirata, a Gomba 0 bejegyzés, a freeCodeCamp leíró cikke és az eredeti [F5] projekt repository README-je és kódja. A videó teljes képi anyagát nem ellenőriztem; képernyőn látható műveleteknél a forráskódot és a felvétel előtti saját reprodukciót tekintem hitelesnek.

## Videóbrief

- Üzleti probléma: a hagyományos kulcsszavas keresés nem feltétlenül találja meg azokat a dokumentumokat vagy termékeket, amelyek a felhasználó szándékára válaszolnak, ha a kérdés más szavakkal van megfogalmazva. Külön keresőrendszer fenntartása pedig adatmásolást és szinkronizálást igényel. A Gomba 0 bejegyzés ezt a témát jelöli; a konkrét üzleti példa még jóváhagyandó.
- Célközönség és előismeret: javaslat: fejlesztők és technikai döntéshozók, akik ismerik az alap SQL-t, és szeretnék eldönteni, mikor elég a PostgreSQL-be épített keresés. A forrás maga alap SQL- és Python-ismeretet feltételez.
- Ígéret: bemutatjuk egy PostgreSQL-alapú WikiSearch alkalmazásban a kulcsszavas BM25, a szemantikus vektoros és a hibrid keresést, majd azonos lekérdezésekkel megvizsgáljuk, melyik milyen találatokat ad. Nem ígérünk általános minőségi vagy sebességjavulást; azt a saját adatokon végzett tesztnek kell igazolnia.
- Scope és kizárások: a forrásban szereplő alkalmazás és keresési adatút saját magyar nyelvű magyarázata; BM25 és vektoros keresés, RRF-fúzió, API/felület, dokumentumbeszúrás és végponttól végpontig tartó próba. A forrás Simple English Wikipédiát és részleges embedding-lefedettséget használ. Nem építünk produkciós ügyfélrendszert, nem állítjuk, hogy a szemantikus keresés minden releváns dokumentumot lefed, és nem végzünk teljesítmény- vagy formátum-összehasonlító kísérletet.
- Tervezett videóhossz: javaslat: 25–35 perc a forrás körülbelül egyórás anyagának tömör, üzleti keresési példára fókuszáló feldolgozásához. Jóváhagyandó.
- Hangvétel és saját fordulatok: elfogadva: gyakorlatias, pontos, magyarázó; először egy természetes nyelvű keresési eset és a látható találatok, utána az adatút és a megvalósítás. Saját történetként a termékkatalógus-keresés szemléltető analógia; a technikai demó a WikiSearch marad.

## A forrás megoldása és az átdolgozás

- Input → fő feldolgozási lépések → output: keresőkifejezés → külön kulcsszavas/BM25 és szemantikus vektoros találati lista → RRF-fel összevont hibrid rangsor → FastAPI-n keresztül megjelenített keresési eredmények. Új cikk felvételekor embedding készül, majd a szöveg és vektor egy adatbázis-tranzakcióban kerül mentésre.
- Fő eszközök és korlátok:
  - PostgreSQL, `pg_textsearch` BM25-höz, `pgvector` és `pgvectorscale` vektoros kereséshez.
  - Python, FastAPI és Psycopg az API-hoz; a forrás TigerCloudot használ, és helyi futtatási lehetőséget is említ.
  - A transcript szerint a kulcsszavas korpusz körülbelül 242 000 Simple English Wikipedia-cikket tartalmaz, a szemantikus keresés pedig körülbelül 25 000 cikken fut. Ez korlátozza a két mód közvetlen összevetését.
  - Az alapbeállítás helyben futtatja a rögzített `sentence-transformers/all-MiniLM-L6-v2` modellt CPU-n; 384 dimenziós embeddingeket készít, külső embedding API-kulcs nélkül. Az opcionális `text-embedding-3-small` alternatíva API-kulcsot és usage-alapú díjat igényel, és külön vektoroszlopot/indexet kíván.
  - A repository Python 3.11/3.12-t és PostgreSQL 17-et céloz; a `pg_textsearch` 1.5.1 a dokumentált verziócél. A hosztolt Tiger Cloud szolgáltatás költsége és aktuális elérhetősége fiók- és szolgáltatásfüggő, felvétel előtt ellenőrizendő.
  - A benchmarkrész harmadik fél konkrét mérését ismerteti; nem bizonyítja ennek az alkalmazásnak vagy más adatoknak a teljesítményét.
- Megtartjuk: az egy adatbázisban tárolt tartalom és keresési indexek gondolatát; a kulcsszavas, szemantikus és hibrid mód eltérő szerepét; azonos tesztlekérdezéseket; a tényleges írási és keresési próbát; a költség, lefedettség és emberi mérlegelés korlátait.
- Átdolgozzuk: a magyarázatot magyar, vállalati dokumentum- és termékkeresési problémához kötjük, miközben a bemutatott forrásprojektet és annak Wikipédiás adatait világosan megnevezzük. Saját ügyféladatot vagy nem ellenőrzött produkciós állítást nem használunk. Konkrét saját példát a felhasználó jóváhagyása után rögzítünk.

## Forrásjegyzék

- **F1** — `local-workflows/gomba-1-script-writer/projects/1-postgresql-hybrid-search-course/source-transcript.md`; helyi átirat, 00:00–01:00:18. A kimondott koncepciókat, eszközöket, részleges adatszámokat, demóleírásokat és korlátokat támasztja alá. Nem bizonyít képernyőn látható technikai részleteket.
- **F2** — https://www.youtube.com/watch?v=kT7nXO32L-Q; forrásvideó, az átirattal elérhető. A videó képi részleteinek ellenőrzése ebben a briefkörben nem történt meg.
- **F3** — https://www.freecodecamp.org/news/build-a-hybrid-search-engine-in-postgresql-bm25-vector-retrieval/; freeCodeCamp cikk a videó projektről. A leírás szerint a rendszer `pg_textsearch`, `pgvector`, `pgvectorscale`, Python/FastAPI/Psycopg és RRF elemeket használ; 240 000 Simple English Wikipedia-cikket és 384 dimenziós embeddingeket említ. A cikk nem helyettesíti az eredeti projektkód és az aktuális költségek ellenőrzését.
- **F4** — https://github.com/timescale/docs/blob/latest/use-timescale/extensions/pg-textsearch.md; hivatalos Tiger Data dokumentáció a `pg_textsearch` és hibrid keresési mintákról. A briefben nem használjuk az aktuális telepítési vagy verzióállítások végleges forrásaként; ezek a későbbi script előkészítésekor ellenőrzendők.
- **F5** — https://github.com/beaucarnes/wikisearch; a kiválasztott videó eredeti nyilvános projektje. A README, `settings.py`, `embed.py`, `load.py`, SQL-fájlok, `app.py` és `recording/README.txt` alapján ellenőrzött a helyi modell, rögzített adatkészlet, adatút, alkalmazásvégpontok és forgatási parancsok. A változó `main` ág felvétel előtt újraellenőrzendő.

## Tisztázás és átadás

- Egyeztetett döntések: a felhasználó kérésére az 1-es registry-bejegyzéssel indulunk; transcript elkészült és registry szerint kész.
- Nyitott kérdések: nincsenek. A célközönséget, a 25–35 perces hosszjavaslatot, a WikiSearch-demót és a gyakorlatias, magyarázó hangot a felhasználó elfogadta; az üzleti katalóguspélda szemléltető analógia marad.
- Átadás: a brief újrafuttatva és a forráskóddal egyeztetve; helyi embeddingmodell, opcionális fizetős API-alternatíva, futtatási verziók és a repository forrásként rögzítve. A hosztolt szolgáltatás konkrét ára és aktuális fiókbeállítása csak felvétel előtt ellenőrizhető.
- Emberi jóváhagyás referenciája: 2026-10-26 — eredeti briefjóváhagyás („elfogadom”), majd a tényjavítás és függő anyagok újragenerálásának kifejezett engedélye („Igen, javítsd és folytasd”).
