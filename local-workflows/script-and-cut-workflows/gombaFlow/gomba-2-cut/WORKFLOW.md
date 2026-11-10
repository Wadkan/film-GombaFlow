# Gomba 2 — vágás

## Cél

A saját felvételek azonosítása az elfogadott `3-script.md` alapján, majd
script szerinti timeline összeállítása és az ismétlések kivágása.

## Feldolgozási lépések

1. [Felvételek átírása](1-transcription.md): videómappa bekérése, rekurzív
   Faster-Whisper feldolgozás a [scripttel](scripts/transcribe_recordings.py).
   Kimenet: videónként szóidőbélyeges átirat és `master_transcript.json`;
   szükség esetén felhasználói leírások a `recording_assignments.json` fájlban.
2. [Felvételek azonosítása és jegyzék](2-recording-index.md): az átírt
   anyagot témaazonosító szerint csoportosítja, és minden csoporthoz az ahhoz
   tartozó meglévő scriptmappába ír egy `recording_index.json` fájlt.
3. [Vágás előtti preflight](0-preflight.md): egy indexnél azzal folytat;
   többnél megkérdezi, melyikkel dolgozzon. Ez csak fájlalapú scriptválasztás;
   Resolve-projektet nem választ és nem hoz létre.
4. [Ismétlések kivágási terve](2a-retake-plan.md).
   Az index és az átiratok alapján ID-nként elkészíti és ellenőrzi a teljes
   `retake_plan.json` tervet. A `retained_ranges` adatokat a 3c a review
   timeline piros markerpárjainak előkészítéséhez használja. A hiányzó felvételrészeket a script saját
   `problems.md` fájljába írja, és a felhasználói döntésig nem adja át a tervet
   végrehajtásra. Resolve-projektet és timeline-t nem nyit meg.
   A kész terv útvonalát az agent átadja, majd itt megáll; fájlalapú
   tervreview-t nem kér.
5. A terv elkészülte és külön felhasználói indítás után [timeline-összeállítás](3-timeline-assembly.md):
   ekkor választ vagy hoz létre Resolve-projektet, majd sorrendben végrehajtja
   a [3a médiaimportot](3a-resolve-media-import.md), a
   [3b médiaregiszter mentését](3b-resolve-media-registry.md) és a
   [3c review timeline](3c-resolve-review-timeline.md) lépést. A 3c az elkészült
   médiaregisztert használva felvételi sorrendben helyezi el a felvételeket és
   markereiket az első timeline-on. Az ismétlések ekkor még megmaradnak.
6. [Review markerek kiolvasása](3d-resolve-review-markers.md): a user review
   után a Resolve aktuális markereit a script mappájának
   `review_timeline_markers.json` pillanatképébe menti.
7. [Rough Cut összeállítása](3e-resolve-rough-cut-timeline.md): az első timeline
   user review-ja után, külön felhasználói indításra a markerpillanatkép
   frissességét ellenőrzi, és az aktuális markerek alapján elkészíti a második
   timeline-t és a `rough_cut_timeline_cleanup.json` kimenetet.

Az indexek elkészülte után a preflight kiválaszt egyetlen scriptet, majd a 2a tervlépésnek átadja annak scriptmappáját és indexét. A terv elkészülte után
az agent átadja a fájl útvonalát, de nem indítja
el a timeline-összeállítást. A felhasználó külön indítja a 3. Resolve-lépést;
az ott választott vagy létrehozott projektet használja a 3e vágási lépés is,
natív Resolve-mentéssel. Az eredeti médiafájlokat egyik lépés sem mozgatja,
másolja vagy módosítja; a jegyzékek csak hivatkoznak rájuk.

## Közös szerződés

A felvételi jelölések és a vágói átadás szabályforrása a
[script-template](../gomba-1-script-writer/templates/3-script-template.md),
a parancsok és kliptípusok forrása a
[parancsszótár](../gomba-1-script-writer/RECORDING_COMMANDS.md).
A varázsszó tényleges értékét a feldolgozott projekt scriptjéből kell olvasni.

Az eredeti videók és átiratok változatlanok maradnak. A jegyzék tartja fenn a
forrásrész–script-rész–timeline-klip kapcsolatot. A B-roll és más néma képi
anyag megmarad; a csak azonosítóbemondást tartalmazó képi részre a szerződés
kivétele vonatkozik. A B-roll képe és meglévő hangja a talking headtől külön
sávokra kerül, az eredeti hang módosítása nélkül.

Egy lépés csak saját kimenetét készíti el; a bemeneti sémát és a szükséges
adatokat a végrehajtás előtt ellenőrzi. Hiányzó vagy bizonytalan hozzárendelést
nem találhat ki. A Markdown-lépések megírása nem jelenti egy konkrét videóprojekt
feldolgozását; siker csak a tényleges műveletek visszaellenőrzése után jelenthető.
