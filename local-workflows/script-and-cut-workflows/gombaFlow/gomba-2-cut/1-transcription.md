---
name: 1-transcription
description: "A videómappában található eredeti felvételek rekurzív átírása helyi Faster-Whisperrel, szóidőbélyegekkel."
---

# 1. Felvételek átírása

## Saját végrehajtási sorrend

Először olvasd el a [workflow](WORKFLOW.md) „Feldolgozási lépések”,
„Közös szerződés”, „Közös visszatérési státuszok” és „Fájlos
állapotátvétel” részeit, valamint a saját skillre vonatkozó bejegyzését.
A hívási kapcsolatokat, kapukat és státuszfeltételeket ezekből alkalmazd.

1. Ellenőrizd a bemenetet és futtasd az átírást.
2. Azonosítsd a beszéd nélkül maradt anyagokat, és ellenőrizd az eredményt.

## Cél és bemenet

A felhasználó saját, eredeti videófájljainak átírása a helyi Faster-Whisperrel.
Bemenet az eredeti felvételek gyökérmappája. Ha a felhasználó az útvonalat már
megadta, azt használd; különben kérdezd meg, és várd meg a választ, mielőtt
feldolgozást indítasz. A kimeneti
mappára ne kérdezz rá: automatikusan a gyökérmappa `transcripts` almappája.
Az MP4, MOV, MKV, WEBM, M4V, AVI, MTS és M2TS fájlok az összes almappából is
feldolgozásra kerülnek. Szimbolikus linkek nem részei a feldolgozásnak.
A relatív útvonal szerinti feldolgozási
sorrend nem jelent timeline- vagy felvételi sorrendet.

Előfeltétel: Python 3.11+, telepített `faster-whisper` és PATH-ból elérhető
`ffprobe`. A meglévő helyi Python-környezet használható. A modell első használata
letöltést igényelhet; a `--model` letöltött modell útvonala is lehet.

## Futtatás

A repo gyökeréből, a felhasználó által megadott mappával:

```bash
~/video-ai/bin/python local-workflows/script-and-cut-workflows/gombaFlow/gomba-2-cut/scripts/transcribe_recordings.py \
  --input-dir /path/to/recordings \
  --language hu
```

A [script](scripts/transcribe_recordings.py) végzi az átírást; az agent nem írja
újra vagy javítja kézzel az átiratot. A művelet átírás, nem fordítás. Nem értelmez
varázsszavakat, nem készít vágási jegyzéket és nem végez vágást.
A CLI `--input-dir` nélkül is indítható: ilyenkor maga kéri be a videók útvonalát,
és csak a válasz után indul el.

## Kimeneti szerződés — 1.0

- `master_transcript.json`: `schema_version` és `recordings` lista.
  Minden bejegyzés: `source_id`, `source_path`, `transcript_path`, `status`.
  Az átiratútvonal a manifest mappájához képest relatív.
- `recording_0001.json`, …: videónként külön átirat. A sorszám tárolási fájlnév,
  nem script-ID vagy felvételazonosító.
- Az átirat mezői: `schema_version`, `source_id`, abszolút `source_path`,
  `file_name`, `duration`, `time_base`, `language`, `status`, `segments`.
- A `source_id` az eredeti videófájl SHA-256 tartalomazonosítója; átnevezéskor
  változatlan, a média módosításakor új. Azonos tartalmú másolatok azonos
  forrásazonosítót kapnak, az útvonalaik külön megmaradnak.
- A `time_base` értéke `source_seconds`: minden időbélyeg az adott eredeti
  videó elejéhez viszonyított, másodpercben megadott szám, kerekítés nélkül.
- Minden szakasz: `start`, `end`, eredeti `text`, valamint `words` lista;
  minden szó: `start`, `end`, eredeti `text`.
- Státuszok: `transcribed`, `no_audio`, `no_detected_speech`. Az utóbbi kettő
  esetén is megmarad a videó rekordja; nem dobható el B-roll vagy más néma anyag.

## Megőrzés és kapu

A forrásvideók változatlanok maradnak. Meglévő kimeneti mappát a script nem ír
felül. Meglévő `transcripts` mappánál állj meg és jelezd az akadályt; ne kérj
másik kimeneti útvonalat és ne töröld a korábbi eredményt. Feldolgozás közben a forrásokat
ne módosítsd; észlelt változásnál a script hibát jelez.

Csak a teljes batch sikere után jön létre a manifest. Hiba esetén a már
elkészült részátiratok megmaradhatnak, de manifest nélkül nem adhatók tovább
kész bemenetként. Nincs automatikus újrapróbálkozás vagy részleges sikerjelentés.

## Beszéd nélkül maradt felvételek azonosítása

Sikeres átírás után a CLI felsorolja a `no_audio` és `no_detected_speech`
státuszú fájlokat. Az agent ezeket a manifest alapján teljes útvonallal listázza
a felhasználónak, és kérdezze meg természetes nyelven, mire valók, például:
„Ez az API-kulcs bekötéséhez B-roll.” Ne kérjen script-ID-t vagy más technikai
azonosítót a felhasználótól. Várja meg a választ;
ne minősítse automatikusan B-rollnak a felvételeket. A `no_detected_speech`
nem bizonyítja, hogy a felvételen valóban nincs beszéd.

A válaszokat külön `transcripts/recording_assignments.json` fájlba mentse:
`schema_version: "1.0"`, `assignments` lista. Minden hozzárendelés mezői:
`source_id`, `source_path`, `start`, `end`, `script_id`, `timeline`, `clip_type`,
`description`, `user_description`, `status`.
A `user_description` a felhasználó szó szerinti leírása. A script-ID-t,
timeline-t és kliptípust az agent az elfogadott `3-script.md` és a leírás
összevetésével rendeli hozzá; a kliptípust a közös szótár szerint választja.
A hozzárendeléshez kérje el a script útvonalát, ha még nincs megadva.
Egyértelmű egyezésnél `status: "identified"`; több lehetséges hely vagy hiányzó
egyezés esetén `status: "needs_review"`, és az el nem döntött mezők értéke `null`.
Ilyenkor a tartalmi különbségre kérdezzen vissza közérthetően, ne ID-t kérjen
és ne találgasson. A `description` az azonosított rész rövid tartalmi leírása.
A forrásazonosító és útvonal az eredeti manifestből származzon;
az idők az eredeti videó másodpercei. Teljes fájl hozzárendelésénél a tartomány
0-tól a videó `duration` értékéig tart; részletekre bontást a felhasználó adhat meg.
Az eredeti átiratokat ne írja át.

A jegyzékkészítő lépés ezt a fájlt kötelezően vegye át, ellenőrizze a scripthez,
és őrizze meg a felhasználói hozzárendelés eredetét. A csak azonosítóbemondást
tartalmazó felvétel `transcribed`, és a következő lépésben azonosítható; nem
hiányos pusztán azért, mert nincs utána narráció.

Felhasználói válaszra várva jelezd, hogy az átírás elkészült, de az azonosítás
még függőben van. Hiba esetén csak a konkrét akadályt jelezd.
