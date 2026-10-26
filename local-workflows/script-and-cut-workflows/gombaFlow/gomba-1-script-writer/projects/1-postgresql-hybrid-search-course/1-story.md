# Történet — PostgreSQL-alapú hibrid keresés üzleti tartalmakhoz

- Témaazonosító: `1-postgresql-hybrid-search-course`
- Bemeneti változatok és briefjóváhagyás: `0-brief.md` 2026-10-26-án újrafuttatott változata; `source-transcript.md`; F5 repository `main` állapota ellenőrizve 2026-10-26-án; a felhasználó chatben elfogadta az eredeti briefet és engedélyezte a tényjavítást, valamint az újragenerálást.

## Saját történet

- Saját helyzet és példa: egy értékesítő egy termékkatalógusban próbál megtalálni egy olyan megoldást, amely megfelel az ügyfél leírt igényének. Az ügyfél a funkciót hétköznapi szavakkal írja körül, miközben a termékadatlap más, pontosabb szakmai kifejezéseket használ. Ez szemléltető üzleti helyzet, nem a forrásprojektben tesztelt vállalati katalógus.
- Kiinduló probléma → megoldás → eredmény: az egyszerű kulcsszavas keresés nem mindig találja meg a jelentésben illeszkedő tartalmat; a külön keresőrendszer szinkronizálási feladatot hozhat. A történet megmutatja, hogyan állítható egymás mellé a PostgreSQL BM25-alapú kulcsszavas és vektoros keresése, majd hogyan egyesíthetők a rangsorok RRF-fel. A forrás WikiSearch alkalmazásán ellenőrizzük, hogy a módok az adott tesztkérdésekre milyen eredményt adnak; általános pontosságjavulást nem ígérünk.
- Megtartott működés és forráshivatkozás: a PostgreSQL-ben tartott szöveges és vektoros reprezentáció; külön lexical/BM25 és szemantikus keresés; a két lista RRF-es fúziója; a keresési eredmények webes megjelenítése. F1 00:00–00:48, 00:05:01–00:07:17, 00:43:33–00:44:00 és 00:54:10–00:57:07; F3; F5 `README.md`, `settings.py`, `embed.py` és `sql/search_*.sql`.
- Átdolgozott elemek: új, értékesítői katalógushelyzet és magyar üzleti magyarázat ad keretet. A tényleges technikai demó a forrásban bemutatott WikiSearch és Simple English Wikipedia-adatkészlet marad; nem állítjuk, hogy ezzel valódi termékkatalógust vagy vállalati dokumentumtárat építettünk.

## Hook

- Elmondandó szöveg: „Az ügyfél pontosan tudja, milyen termékre van szüksége, de nem ismeri a katalógus szakmai kifejezését. Ilyenkor a kereső könnyen nem azt mutatja, amit keres. Megnézzük, mit talál a kulcsszavas, a jelentésalapú és a kettőt kombináló keresés ugyanarra a kérdésre — PostgreSQL-ben.”
- Bemutatandó tartalom: rövid, kétoldalas szemléltetés: bal oldalon hétköznapi vevői igény és egy hipotetikus katalógusmező szakmai elnevezése; jobb oldalon a forrásvideóban látható WikiSearch három keresési módja és azok találatai. A katalóguspélda csak felvezető analógia; nem szabad kitalált eredményt a saját demó találataként mutatni. Saját, ellenőrzött WikiSearch-próba még szükséges.
- Ígéret ellenőrzésének alapja: a módszerek működését és a példalekérdezések forrásbeli találatait F1/F2 támasztja alá, különösen 00:10–00:48 és 00:54:10–00:57:07; a három mód összehasonlítása szerepel F3-ban és F5 `recording/README.txt` fájljában is. A saját felvételi eredményt később valódi próba alapján kell rögzíteni; a forráskód önmagában nem igazolja a futtatási eredményt.

## Történetvezetés a közös struktúrában

- **H — Hook:** az értékesítő igénye és a katalógus nyelvezete közötti eltérés felveti, miért nem elég az egyszerű szóegyezés. Az ígéret a három keresési mód összevetése, nem egy előre garantált győztes.
- **C1 — A kész megoldás:** a forrás WikiSearch-felülete röviden megmutatja ugyanazon keresőben a kulcsszavas, szemantikus és hibrid találatokat. A narráció jelzi, hogy ez demonstrációs Wikipedia-adatkészlet, nem vállalati katalógus.
- **C2 — Előtte és utána:** előtte a felhasználó pontos egyező kifejezést próbál kitalálni, illetve külön rendszerek közötti adatmásolásra lehet szükség; utána a három lekérdezési mód ugyanazon PostgreSQL-projekten hasonlítható össze. Idő- vagy hibacsökkenést mérés nélkül nem állítunk.
- **C3 — Szükséges szolgáltatások:** röviden elhelyezzük PostgreSQL, `pg_textsearch`, `pgvector`, `pgvectorscale`, a Python/FastAPI API és a TigerCloud szerepét; a konkrét verziókat, árakat és hozzáférési követelményeket csak ellenőrzött forrás alapján lehet majd megadni.
- **C4 — Megvalósítás:** a történet az adat útját követi: Wikipedia-adatok betöltése; BM25 index és kulcsszavas rangsor; helyben, CPU-n készített, rögzített 384 dimenziós MiniLM embeddingek és szemantikus keresés; RRF-fúzió és API; új cikk tranzakciós mentése. Minden szakasz után látható köztes adat vagy ellenőrzés szükséges. A pontos lépéseket F5 README-je, SQL-je és `recording/README.txt` fájlja támasztja alá.
- **C5 — Teszt és korlátok:** azonos lekérdezéseket futtatunk mindhárom módban, egy újonnan felvitt cikket is megkeresünk, és legalább egy sikertelen vagy részleges esetet ellenőrzünk. A transcript a forrás saját példáit támasztja alá, üzleti hatást nem; a 242 000 kulcsszavas és körülbelül 25 000 vektoros cikk közötti lefedettségkülönbség, a költség és a működési feltételek látható korlátként szerepeljenek.
- **C6 — Mit oldottunk meg?:** összefoglaljuk, hogy a PostgreSQL-projektben háromféle rangsorolási mód áll rendelkezésre, és hogy a megfelelő választást saját keresési adatokon és lekérdezéseken kell ellenőrizni. A forrásdemó működése nem igazolja a néző termékadatainak eredményét.
- **CTA — Következő lépés:** a közös `VIDEO_STRUCTURE.md` rögzített zárószövege változatlanul marad; előtte röviden visszakötünk ahhoz, hogy a néző a saját adatain tesztelje a keresési módokat.

## Állítások és átadás

- Igazolást igénylő állítások:
  - BM25, szemantikus és hibrid keresés működése, RRF és a forrásdemó találatai → F1 időbélyegek és F3; saját eredményként csak saját funkcionális próba után mondható ki.
  - A használt kiterjesztések, verziók, adatbetöltés, embedding modell/szolgáltató, API-konfiguráció és telepítési mód → a forrás projektfájljainak ellenőrzése még szükséges; F1 egyes műveleteket csak elmondásként rögzít.
  - Költség, sebesség, skálázhatóság vagy javuló relevancia → az adott futtatási környezeten mért vagy hivatalos forrásból ellenőrzött adat nélkül nem állítható.
- Nyitott akadályok: nincs blokkoló forráshiány. A repo `main` változó ág, ezért a konkrét parancsokat és aktuális szolgáltatási feltételeket felvétel előtt újra ellenőrizni kell; a saját keresési és hibateszt eredmények még nincsenek meg.
- Átadás: a történeti vázlat és hook az újrafuttatott briefhez igazodik. A bemutatott WikiSearch-eredményeket felvétel előtt ténylegesen futtatni és rögzíteni kell.
