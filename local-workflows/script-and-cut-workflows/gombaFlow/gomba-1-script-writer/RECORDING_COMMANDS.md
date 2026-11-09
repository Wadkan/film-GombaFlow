# Felvételi parancsok

A felvételen a parancsot ugyanaz a varázsszó nyitja és zárja. A két varázsszó
és a közéjük mondott parancs a vágói utasítás része, nem a nézőnek szánt tartalom.
A varázsszó értékét a készülő script a központi `local-workflows/recording-config.json`
`magic_word` mezőjéből veszi át és saját változatában rögzíti.

## Azonosítás: `timeline` és `script`

- **Cél:** a következő felvett rész cél-timeline-jának és egyedi script-ID-jának
  megadása.
- **Kötelező adatok:** a script fejlécében szereplő témaazonosító kezdő
  számrésze és a scriptben szereplő egyedi részazonosító. A felhasználó a
  témaazonosító számát mondja be; külön azonosítót ne
  ossz ki.
- **Hatókör:** a záró varázsszó után kezdődik, és a felvételi fájl végéig vagy
  ugyanabban a fájlban a következő azonosító parancsig tart. Külön lezáró azonosító nem szükséges.
- **Példa:** `serpenyő timeline 1 script 15 serpenyő`.

## Kliptípusok

A script részenkénti `agent-cue` `clip-type` attribútumában és a timeline-klip nevében az
alábbi angol értékek használhatók. Ezek tartalmi típusok, nem önálló bemondandó
parancsok, a kliptípust nem kell felolvasni. A scriptíró a rész bemutatási tervéből választ típust; a vágó ezt
a script-ID alapján veszi át a jegyzékbe és a klipnévbe.

- `talking head`: a készítő kamerába beszélő felvétele.
- `b-roll`: a magyarázatot szemléltető kiegészítő kép, például képernyőfelvétel
  vagy demórészlet.
- `animation`: animált grafika vagy mozgó szemléltetés.

Eltérő típushoz a szótár egyeztetett bővítése szükséges. Ha egy részhez több
különböző típusú klip készül, ezeket külön script-ID-val jelöld.
