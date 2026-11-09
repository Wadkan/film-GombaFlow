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
4. [Teljes ismétlésvágási terv](4-retake-cleanup.md).
   Az index és az átiratok alapján ID-nként elkészíti és ellenőrzi a teljes
   `retake_plan.json` tervet. A hiányzó felvételrészeket a script saját
   `problems.md` fájljába írja, és a felhasználói döntésig nem adja át a tervet
   végrehajtásra. Resolve-projektet és timeline-t nem nyit meg.
   A kész tervet a felhasználó review-zza; az agent itt megáll.
5. A review és külön felhasználói indítás után [timeline-összeállítás](3-timeline-assembly.md):
   ekkor választ vagy hoz létre Resolve-projektet, majd a jegyzék alapján,
   script-sorrendben elhelyezi a felvételeket a script cél-timeline-ján. Az ismétlések
   ekkor még megmaradnak.
6. [Vágási terv végrehajtása](5-retake-execution.md): a timeline-összeállítás
   után, külön felhasználói indításra végrehajtja a tervben rögzített vágásokat,
   és elkészíti a `retake_cleanup.json` eredményt.

Az indexek elkészülte után a preflight kiválaszt egyetlen scriptet, majd a 4. tervlépésnek átadja annak scriptmappáját és indexét. A terv elkészülte után
az agent átadja a fájl útvonalát és rövid review-ellenőrzést ad, de nem indítja
el a timeline-összeállítást. A felhasználó külön indítja a 3. Resolve-lépést;
az ott választott vagy létrehozott projektet használja az 5. vágási lépés is,
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
kivétele vonatkozik. A B-roll hangja kikapcsolva, megőrizve marad.

Egy lépés csak saját kimenetét készíti el; a bemeneti sémát és a szükséges
adatokat a végrehajtás előtt ellenőrzi. Hiányzó vagy bizonytalan hozzárendelést
nem találhat ki. A Markdown-lépések megírása nem jelenti egy konkrét videóprojekt
feldolgozását; siker csak a tényleges műveletek visszaellenőrzése után jelenthető.
