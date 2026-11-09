# Gomba 2 — vágás

## Cél

A saját felvételek azonosítása az elfogadott `3-script.md` alapján, majd
script szerinti timeline összeállítása és az ismétlések kivágása.

## Feldolgozási lépések

1. [Felvételek átírása](1-transcription.md): videómappa bekérése, rekurzív
   Faster-Whisper feldolgozás a [scripttel](scripts/transcribe_recordings.py).
   Kimenet: videónként szóidőbélyeges átirat és `master_transcript.json`;
   szükség esetén felhasználói leírások a `recording_assignments.json` fájlban.
2. [Timeline-preflight](0-preflight.md): az átiratban
   talált timeline-nevek összevetése a megadott script céljaival. Több
   vagy ismeretlen timeline esetén tájékoztatja a felhasználót és megáll;
   önállóan nem választ és nem hoz létre timeline-t.
3. [Felvételek azonosítása és jegyzék](2-recording-index.md): varázsszavas
   azonosítók és természetes nyelvű hozzárendelések értelmezése.
   Kimenet: `recording_index.json`, a forrásokhoz és a scripthez visszavezethető adatokkal.
4. [Timeline összeállítása](3-timeline-assembly.md).
   A jegyzék alapján a script sorrendjében helyezi el a részeket a megadott
   timeline-okon, klipnevekkel és a bemondásokra vonatkozó képi/hangszabályokkal.
   Az ismétlések ekkor egymás után megmaradnak. A felhasználónak csak a scriptben
   szereplő, de a felvételekből hiányzó részeket listázza.
5. [Teljes ismétlésvágási terv](4-retake-cleanup.md).
   ID-nként elemzi az átiratokat, majd elkészíti és ellenőrzi az összes
   timeline-on szereplő ID teljes `retake_plan.json` tervét. Timeline-t nem
   módosít; a felhasználó külön indítja a következő lépést.
6. [Vágási terv végrehajtása](5-retake-execution.md).
   Külön felhasználói indításra ellenőrzi a teljes tervet, végrehajtja a benne
   rögzített vágásokat, és elkészíti a `retake_cleanup.json` eredményt.

Az átírás után a preflight fut, és csak sikeres ellenőrzés után indul a
jegyzékkészítés. A 4. lépés előbb összeállítja a script szerinti timeline-t az
összes felvételváltozattal, és rögzíti a forrás–klip kapcsolatokat. Ezután az 5. lépés a jegyzék alapján ID-nként olvassa a releváns átiratrészeket; nem kér
külön helyi szűrőprogramot, és nem elemzi egyszerre a teljes film beszédét. A 6.
lépés csak a teljes terv külön felhasználói indítása után módosít timeline-t.

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
