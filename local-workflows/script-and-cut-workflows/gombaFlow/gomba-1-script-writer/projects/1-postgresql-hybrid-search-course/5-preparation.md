# Forgatás előtti felkészülés — PostgreSQL-alapú hibrid keresés üzleti tartalmakhoz

- Témaazonosító: `1-postgresql-hybrid-search-course`
- Bemeneti változatok: brief `31c1dae9`, script `f948eb9e`, review `1cd1e2ec` SHA-256 prefix; a script 2026-10-26-i, a 4-review felhasználói workflow-teszt kivétellel „megfelelt” állapotú.
- Emberi scriptjóváhagyás: a felhasználó a jelen chatben elfogadta a scriptet változatlanul, és kifejezetten kérte a review R1 javítási kapujának felülbírálását a workflow további teszteléséhez.

Ez készítői lista, nem a nézőnek felolvasandó script. A feladatok még nincsenek elvégezve; minden jelölőnégyzet üres.

## Eszközök és hozzáférések

- **E1 — Fejlesztői gép és forráskód**
  - Szerep: a külön `beaucarnes/wikisearch` bemutatóprojekt klónozása és futtatása.
  - Előkészítés és verzió: Git, Python 3.11 vagy 3.12, parancssor, webböngésző; `git clone https://github.com/beaucarnes/wikisearch.git`. A `main` változó ág, ezért a felvétel napján ellenőrizd és jegyezd fel a használt commitot. Repo-állapot ellenőrizve: 2026-10-26.
  - Jogosultság/költség: GitHub elérés és kimenő internet a repo, Python csomagok, adat és modell letöltéséhez; külön licencdíj nincs igazolva.
  - Fejezetek: C1, C4.1–C5.

- **E2 — PostgreSQL környezet és keresési extensionök**
  - Szerep: cikkek, BM25 indexek és vektorok tárolása, SQL/API próba.
  - Előkészítés és verzió: a script PostgreSQL 17-et céloz; `pg_textsearch` legalább 1.5.1, továbbá `vector` és `vectorscale` legyen elérhető. Válassz Tiger Cloud szolgáltatást vagy a repo által dokumentált helyi PostgreSQL környezetet; az extension-elérhetőséget a konkrét szolgáltatásban ellenőrizd.
  - Hozzáférés: a saját adatbázishoz tartozó `DATABASE_URL`; hosztolt környezethez szolgáltatói fiók és a szükséges adatbázis-jogosultság. Tiger Cloud URI-nál tartsd meg az `sslmode=require` paramétert; helyi PostgreSQL esetén a kapcsolat paramétereit a helyi konfigurációhoz igazítsd. Az URI maradjon titkos, `.env` fájlban.
  - Költség és limit: a Tiger Data hivatalos ára 2026-10-26-án Performance csomagnál $30/hó induló compute és $0.177/GB-hó storage; Scale csomagnál $36/hó és $0.212/GB-hó. Az elszámolás órás compute- és tényleges tárhelyhasználatú; a compute régiónként eltérhet, a kiegészítők további díjasak lehetnek. A weboldal új felhasználóknak 30 napos Performance próbát jelez, de jogosultságodat és a szolgáltatás aktuális fiókárát a Tiger Console-ban ellenőrizd. Forrás: [Tiger Data hivatalos árlista](https://www.tigerdata.com/pricing), ellenőrizve 2026-10-26-án.
  - Helyi futtatás költsége: nincs igazolt szolgáltatói díj, de a saját gép erőforrás- és tárhelyhasználatával számolj.
  - Fejezetek: C1–C5.

- **E3 — Helyi konfiguráció és admin jogosultság**
  - Szerep: DB-kapcsolat és az autentikált `POST /articles` demo.
  - Előkészítés: a `.env.example` másolata `.env`-be; `DATABASE_URL` beállítása. `ADMIN_TOKEN` csak az írási demóhoz kell; helyben generáld a repo README parancsával (`python -c 'import secrets; print(secrets.token_urlsafe(32))'`).
  - Biztonság: token- vagy URI-értéket ne küldj chatbe, ne tedd Gitbe, ne jelenítsd meg a terminálfelvételen. Szerkesztés előtt állítsd le a felvételt; rögzítés előtt zárd be a titkos értékeket tartalmazó ablakot. A `cp -n` meglévő `.env`-et nem ír felül.
  - Fejezetek: C4.1, C4.6–C5.

- **E4 — Lokális embeddingmodell és gépi erőforrás**
  - Szerep: a szemantikus kereséshez a cikk- és queryvektorok készítése.
  - Előkészítés: `sentence-transformers/all-MiniLM-L6-v2`, revízió `c9745ed1d9f207416be6d2e6f8de32d1f16199bf`, CPU, 384 dimenzió; a `sentence-transformers` csomag és a Hugging Face modell letöltési hozzáférése kell. A repo a cím és a törzs első 1 500 karakteréből készít dokumentumembeddinget.
  - API-kulcs/költség: az alapbeállításhoz nem kell embedding API-kulcs és nincs külső embedding API-használati díj; a helyi gép számítási idejét és erőforrását igényli.
  - Opcionális változat: az OpenAI `text-embedding-3-small` nincs benne a most elfogadott forgatókönyv futtatási útjában. Ha később erre váltasz, API-kulcs és használati díj kell, továbbá külön, a modellhez illő vektoroszlop/index és egységes új vektorhalmaz. Most ne hozz létre hozzá kulcsot.
  - Fejezetek: C3–C5.

- **E5 — Mesterséges példaadatok és tesztkörnyezet**
  - Szerep: a rögzített Wikipedia-adat, a keresési esetek és az új rekord demója.
  - Előkészítés: dedikált, tesztelésre szánt adatbázis; a loader az ellenőrzőösszeggel védett 2023-as Simple English Wikipedia snapshotot tölti be. Teljes állapotnál 241 787 pozitív forrás ID és a `Volcano`, `Bioluminescence` cím szükséges. A vektoros kohorsz legfeljebb 25 002 cikk lehet.
  - Szintetikus cikk: a repo `demo_insert.py` segédje a `quokkatapir search demo` rekordot adja hozzá; egyszer futtasd, mert újrafuttatáskor új negatív ID-jű rekordot hoz létre. A `record_transaction.py` külön rollback demonstráció; rollback után az adatbázis sequence-e ettől még előreléphet.
  - Fejezetek: C1, C4.2–C5.

## Előkészítési sorrend

- [ ] Válassz helyi vagy Tiger Cloud PostgreSQL-t (**E2**, C3–C4.1); ellenőrizd a régiót, extension-elérhetőséget, fiók díját/trialját és a teljes felvételi próba várható költségét. A próba után állítsd le vagy töröld a már nem használt hosztolt szolgáltatást a fiókban.
- [ ] Jegyezd fel a GitHub repo felvételhez használt commitját, klónozd a projektet és aktiválj Python 3.11/3.12 virtuális környezetet (**E1**, C4.1). Telepítsd a `requirements.txt` függőségeit.
- [ ] Készítsd el helyben a `.env`-et és állítsd be a DB URI-t; szükség esetén generáld az admin tokent (**E2–E3**, C4.1, C4.6–C4.7). Előbb ellenőrizd, hogy nincs képernyőn vagy shell historyban titok.
- [ ] Ellenőrizd a DB-verziót, a kapcsolatot és az extensionöket; futtasd a sémát és a teljes adatbetöltést (**E2, E5**, C4.1–C4.2). Jegyezd fel a rekord- és címellenőrzés tényleges eredményét.
- [ ] Hozd létre a natív baseline-t, BM25 oszlopot és indexet, majd a 384 dimenziós vektoroszlopot (**E2, E4**, C4.3–C4.4). Ne folytasd az indexeléssel, ha a szükséges schema vagy load lépés nem fejeződött be.
- [ ] Futtasd le a `python embed.py --limit 25000` feladatot végéig, majd ellenőrizd a `missing_embeddings = 0` állapotot a kijelölt kohorszon; ezután készítsd el a DiskANN indexet és futtasd az `ANALYZE`-t (**E4–E5**, C4.4).
- [ ] Futtasd le a kijelölt keresési próbákat, indítsd a localhost UI-t/API-t, végezd el egyszer a mesterséges cikk beszúrását, és ellenőrizd a visszakeresést (**E1–E5**, C1, C4.5–C4.7). A hosszú munkák felvétele előtt fejeződjenek be.
- [ ] Telepítsd a fejlesztői tesztfüggőségeket, futtasd a unit tesztet és a valós DB smoke tesztet; végezd el a HTTP határeseteket és rollback demót (**E1–E5**, C5). A tényleges státuszokat és kimeneteket változtatás nélkül jegyezd fel.
- [ ] Készíts felvételi jegyzetet a queryk tényleges címeivel, lefedettségével, elapsed értékeivel, extension-verziókkal, tesztkimenetekkel és a fiókban látott költségfeltétellel (**E1–E5**, H, C1–C6).

## Példaadatok és demóállapotok

- **H/C1:** a bemenet `animals that make their own light`; ugyanaz a query Keyword, Semantic és Hybrid módban. Előfeltétel: app működik, teljes korpusz betöltve, embedding/index kész. Rögzítsd a tényleges címeket, coverage-et és elapsed értékeket; ne írj előre győztest.
- **C4.2:** forrásadat a rögzített snapshotból; a teljes load várt ellenőrzése 241 787 pozitív forrásrekord, benne `Volcano` és `Bioluminescence`.
- **C4.3:** native `ts_rank` baseline, majd BM25; valódi SQL-kimenet és query plan. Ne ígérj indexhasználatot, ha a planner más tervet választ.
- **C4.4:** MiniLM lokális modellel készült 384 dimenziós vektorok; a dokumentált kohorszra ellenőrizd a hiányzó embeddingek számát. Nyilvános képernyőn ne szerepeljen személyes adat vagy kulcs.
- **C4.5:** `Apollo 13` query keyword, semantic és hybrid módban; hybrid `--explain`; az RRF terv és a rangsor a tényleges outputból kerüljön felvételre.
- **C4.6:** localhoston `/health` és `/search`; `semantic_weight=0.7` lekérdezés parse-olható JSON-válasszal.
- **C4.7:** egyetlen mesterséges `quokkatapir` beszúrás és utána keresés mindhárom módban. Tokenes érték ne látszódjon; a rangsorhelyet ne ígérd előre.
- **C5:** üres és ismeretlen módú keresésnél HTTP 422; token nélküli cikkbeszúrásnál a konfigurációtól függően 401 vagy 503; `Auth check` cikk ne maradjon az adatbázisban. `record_transaction.py` rollbacket mutat, de nem a `/articles` útvonal embeddinghibáját.
- **Elfogadott workflow-kivétel:** a felhasználó elfogadta, hogy az embedding előállításának sikertelenségét a script nem demonstrálja. Ezt ne jelöld megtörtént próbának vagy bizonyított tranzakciós viselkedésnek.

## Saját technikai próbák és állításellenőrzés

- [ ] **C1:** `animals that make their own light` mindhárom keresési módban; elvárt jel: valós válasz, rögzített találatok és összehasonlítható lefedettség.
- [ ] **C4.1–C4.2:** verzió-, kapcsolat-, extension-, rekord- és adatkészlet-ellenőrzés; elvárt jel: a tényleges DB által visszaadott verziók, sikeres kapcsolat és teljes import.
- [ ] **C4.3–C4.5:** BM25 találat/terv, 0 hiányzó embedding, szemantikus query, RRF query plan és `Apollo 13` három módja; elvárt jel: futtatásból mentett SQL- és query output.
- [ ] **C4.6–C4.7:** UI/API válaszok, súlyozott API query, szintetikus cikk 201 mentése és visszakeresése; elvárt jel: HTTP/JSON output és adatbázisbeli rekord.
- [ ] **C5:** `python -m unittest discover -s tests -v`, `python smoke.py`, HTTP 422/401/503 esetek, az `Auth check` hiánya és külön rollback; elvárt jel: valós tesztkimenetek és a DB állapotának ellenőrzése.
- [ ] **C2–C3:** a külön keresőszolgáltatással szembeni szinkronizációs összehasonlítás architekturális, nem mért megtakarítás; a Tiger Cloud pontos díja és próbára való jogosultsága a szolgáltatói fiókban ellenőrzendő. Elvárt jel: mért adat híján nincs ROI-, pontosság- vagy sebességállítás.
- [ ] **R1 elfogadott kivétel:** a hiányzó/sikertelen embedding új cikk beszúrására gyakorolt hatását nem tesztelem a most elfogadott forgatókönyvben; a bemutatóhoz ezt nem állítom bizonyítottnak.

## Felvételi készültség

A nézői sorrend H → C1 → C2 → C3 → C4 → C5 → C6 → CTA, a rögzítési sorrend pedig a script „Felvételi rend” része. A C3, C2, H és C6 végleges talking head felvételét csak a projekt és a tesztek valós eredményeinek megszerzése után vedd fel.

- [ ] **C4.1–C4.7:** telepítés, DB, teljes import, indexek, embeddingek, API és egyetlen demo rekord sikeresen előkészítve; képernyőn nincs token/URI.
- [ ] **C5:** unit és DB smoke teszt, HTTP határesetek, rollback demo lefutott; tényleges kimenet rögzítve. R1 kivételről ne hangozzon el igazolatlan állítás.
- [ ] **C1:** a demo működik, a három keresési mód eredményei, lefedettsége és futásideje felvételi jegyzetben van.
- [ ] **C2–C3:** a kiválasztott adatbázis-szolgáltatás és költségfeltételek felvétel napján ellenőrizve; publikus árlista és account-költség nincs összemosva.
- [ ] **H, C6, CTA:** a végleges szöveg a működő demóval és ténylegesen ellenőrzött állításokkal összhangban van.

## Átadás

- Scriptfüggőségek lefedése: E1–E5 lefedi a C1–C5 futtatását, a C2–C3 költség- és szolgáltatásellenőrzését, valamint a H/C6/CTA bizonyíték-előfeltételét. A felhasználó által elfogadott R1 kivétel külön jelölve marad.
- Nyitott akadályok: nincs feloldatlan workflow-kapu a kifejezett, workflow-teszt célú felhasználói kivétel után. A tényleges szolgáltatás, adatbázis, keresési kimenetek, tesztek és account-költség még nincsenek előkészítve vagy igazolva.
- Átadás: felhasználói végső elfogadásra kész felkészülési lista; a tervezett műveletek és ellenőrzések nincsenek elvégezve.
