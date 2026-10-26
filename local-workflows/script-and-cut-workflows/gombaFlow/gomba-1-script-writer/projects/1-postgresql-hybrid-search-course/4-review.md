# Scriptreview — PostgreSQL-alapú hibrid keresés üzleti tartalmakhoz

- Témaazonosító: `1-postgresql-hybrid-search-course`
- Ellenőrzött bemeneti változatok: brief `31c1dae9`, történet `3fe9bd2d`, fejezetterv `04e3a84a`, script `f948eb9e` SHA-256 prefix; transcript `06782a5b`; a 0–2. anyagok 2026-10-26-i, forráskódhoz igazított változatai. A brief és történet korábbi chatbeli jóváhagyást kapott; a felhasználó a vizsgált scriptet elfogadta, majd a workflow teszteléséhez kifejezetten felülbírálta az R1 javítási kapuját.
- Döntés: megfelelt — felhasználói workflow-teszt kivétellel
- Rövid indoklás: a felhasználó kifejezetten kérte az R1 javítása nélküli továbblépést. Ez a workflow tesztelésére adott kivétel, nem technikai igazolás: a script továbbra sem demonstrálja, mi történik, ha az új cikk embeddingje hiányzik vagy annak létrehozása hibázik.

## Lefedett ellenőrzések

- **Inputok aktualitása és template-megfelelés — megfelelt.** A script mindegyik kötött egységet tartalmazza: H, C1–C6 és CTA, továbbá a C4.1–C4.7 alfejezeteket. A fejezetsorban rövid leírás, kártya, átvezetés, felvételi előfeltétel, demóállapot és eredménystátusz szerepel; a műveleti lépésekhez narráció, képernyőtartalom, ellenőrzés és forrás tartozik. Lásd `3-script.md` 8–103. és 505–524. sorát, valamint a script-template-et. A felvételi sorrend táblázat helyett felsorolás, összhangban a repo AGENTS.md táblázattilalmával.
- **Forrásmegoldás és saját átdolgozás összhangja — megfelelt.** Az üzleti katalógus analógiaként van megjelölve, a technikai demo Simple English Wikipedia. A forráskódhoz igazított script helyi, CPU-s MiniLM modellt és opcionális OpenAI-alternatívát mond; a modell revízióját, 384 dimenziót, a részleges embedding-lefedettséget, az RRF rangsor-fúziót és a tokenes írási végpontot is jelzi. A saját találatcímeket és méréseket nem találja ki. Hivatkozások: brief F5; `3-script.md` C1, C3, C4.4–C4.7; F5 `settings.py`, `embed.py`, `sql/search_hybrid.sql`, `app.py` és `recording/README.txt`.
- **Kötött fejezetek, kártyák, átvezetések, összehasonlítás és CTA — megfelelt.** A C2 az öt kötelező összehasonlítási dimenziót tartalmazza, minőségi, nem mért állításokkal. A rögzített CTA szó szerint szerepel a `VIDEO_STRUCTURE.md` szerint. A H és C1 ugyanazt a keresési esetet használja, de a H ígéretet ad, C1 pedig a kész felület tényleges bemutatását tervezi; a szerepük elkülönül.
- **Technikai teljesség, demóállapotok, teljes teszt és határeset terve — workflow-kivétellel elfogadva.** A setup, extension- és adatellenőrzés, BM25, embedding, RRF, UI/API, beszúrás és unit/DB smoke teszt részletes. A C5-ben szerepel üres/érvénytelen keresés és hitelesítés nélküli írási kérés; a C4.7 külön megkülönbözteti a sikeres cikkmentést az interaktív rollback bemutatótól. A fejezetterv C5-je viszont a hiányzó vagy sikertelen embedding hibás esetének ellenőrzését írja elő (`2-chapters.md` 163–176. sor), amit a script nem demonstrál (`3-script.md` 291–309. és 418–466. sor). A felhasználó ezt az eltérést kifejezetten elfogadta a workflow további lépéseinek teszteléséhez; ez nem jelenti az eset ellenőrzését.
- **Ígéret, eredmény, költségek, felügyelet és bizonyítékstátusz — megfelelt.** A saját futtatásból származó címeket, időket, fiókárat és tesztkimenetet felvétel előtti ellenőrzéshez köti. Nem állít mért ROI-t, sebesség- vagy relevanciaelőnyt; a promo kreditet sem kezeli általános ingyenességként. Lásd `3-script.md` C1–C3, C5, C6 és „Átadás review-ra”.
- **Lendület, ismétlések, túlmagyarázás és hangvétel — megfelelt, rövidítési javaslattal.** A technikai rész hosszú, de a 25–35 perces célhoz az import, indexelés és CPU-s embedding várakozásának vágása szerepel. A találati listák több helyen visszatérnek (C1, C4.5–C4.6, C5); a vágásban a C1 maradjon rövid ízelítő, az RRF rész magyarázza a rangsort, C5 pedig csak az ellenőrzési kimenetet és hibás eseteket mutassa.
- **Nézői/felvételi sorrend és adatvédelem — megfelelt.** Előbb építés és próba, majd eredményfelvétel és talking head következik. A `.env` és admin token kitakarását, token nélküli tesztkérést, mesterséges adatot és localhost korlátait kifejezetten jelzi (`3-script.md` C4.1, C4.6–C5).

## Elfogadott eltérés

- **R1 — a felhasználó workflow-teszt kivételként elfogadta; technikai hiányként rögzítve**
    - Hely: `3-script.md`, C4.7 és C5; kapcsolódó terv: `2-chapters.md`, C5.
    - Megállapítás: a fejezetterv hibás esetként embeddinghiányt vagy embeddingkészítési hibát nevez meg, és ehhez kapcsolja a tranzakció viselkedésének ellenőrzését. A script csak sikeres `demo_insert.py` mentést, külön `record_transaction.py` rollbacket, hiányzó embedding számlálást, HTTP 422 validációt és token nélküli 401/503 választ tartalmaz. Nem ellenőrzi az embeddinghiba esetén elvárt adatbázis-állapotot.
    - Bizonyíték: `2-chapters.md` 172–176. sor; `3-script.md` 381–405., 418–466. sor. A rollback demonstráció saját leírása szerint sem a sikeres `/articles` mentést vonja vissza.
    - Felhasználói döntés: „most ez nem gond, elfogadom ahogy van”; a workflow tesztjéhez a felhasználó kérte a review sikeresre állítását és a továbblépést.
    - Ha később technikai teljességre van szükség, a javasolt javítás: a scriptbe biztonságos, reprodukálható embeddinghibás beszúrási próba és annak DB/HTTP ellenőrzése kerüljön; ha ez nem reprodukálható, a fejezetterv hibás esetét és a scriptet kell összhangba hozni.

## Forgatás előtt ténylegesen ellenőrizendő

- **C1:** mindhárom mód saját futtatása; aktuális találatok, coverage és elapsed értékek.
- **C4.1–C4.2:** az aktuális extension-verziók, DB-kapcsolat, teljes 241 787 forrásrekord és a rögzített adatcsomag ellenőrzése.
- **C4.3–C4.6:** BM25/vektorindexek, teljes embedding-kohorsz, RRF query plan, UI/API válaszok és minden tényleges rangsor.
- **C4.7–C5:** mesterséges cikk mentése és visszakeresése; hibás embeddinges eset vagy a módosított, bemutatható hibás eset; unit tesztek, valós DB smoke, 422/401/503 válaszok és rollback.
- **C2–C3:** kiválasztott környezethez tartozó aktuális hosztolási költség és szolgáltatási feltételek. Ezeket ez a review nem mérte vagy ellenőrizte.

## Következő kapu

- A felhasználó által kért workflow-teszt kivételével az 5. felkészülési lista következik. Ez az override nem jelenti a helyi demo, a költség vagy a saját keresési eredmények ellenőrzését; ezeket forgatás előtt kell elvégezni. A review nem futtatott technikai tesztet.
