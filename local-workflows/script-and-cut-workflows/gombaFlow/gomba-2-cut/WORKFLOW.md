# Gomba 2 — vágás

## Cél

A saját felvételek azonosítása az elfogadott `3-script.md` alapján, majd
script szerinti timeline összeállítása és az ismétlések kivágása.

## Feldolgozási lépések

1. [Felvételek átírása](1-transcription.md): videómappa bekérése, rekurzív
   Faster-Whisper feldolgozás a [scripttel](scripts/transcribe_recordings.py).
   Kimenet: videónként szóidőbélyeges átirat és `master_transcript.json`;
   szükség esetén felhasználói leírások a `recording_assignments.json` fájlban.
2. [Felvételek azonosítása és jegyzék](2-recording-index.md): varázsszavas
   azonosítók és természetes nyelvű hozzárendelések értelmezése.
   Kimenet: `recording_index.json`, a forrásokhoz és a scripthez visszavezethető adatokkal.
3. [Timeline összeállítása](3-timeline-assembly.md).
   A jegyzék alapján a script sorrendjében helyezi el a részeket a megadott
   timeline-okon, klipnevekkel és a bemondásokra vonatkozó képi/hangszabályokkal.
   Az ismétlések ekkor egymás után megmaradnak. A felhasználónak csak a scriptben
   szereplő, de a felvételekből hiányzó részeket listázza.
4. [Ismétlések kivágása](4-retake-cleanup.md).
   Az utolsó megfogalmazást tartja meg; a korábbi részekből csak az újramondott
   tartományokat vágja ki, több ismétlésen át, értelmileg összefüggő szöveget hagyva.
   A felvételi sorrend alapja a média rögzítési metaadata, ennek hiányában
   a felvételi fájlnevek egyértelmű sorszáma.

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
