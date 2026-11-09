# 3. Timeline összeállítása

## Cél és bemenet

A [jegyzékkészítés](2-recording-index.md) `recording_index.json` kimenete és az
abban hivatkozott, elfogadott `3-script.md` alapján ténylegesen helyezd el a
felvett részeket a vágóprogram timeline-jain. Az eredeti videókat és átiratokat
ne módosítsd. Ebben a lépésben minden azonosított felvételváltozat megmarad;
az ismétlések felismerése és kivágása a 4. lépés feladata.

Alkalmazd a scriptből hivatkozott
[vágói szerződést](../gomba-1-script-writer/templates/3-script-template.md) és
[parancsszótárat](../gomba-1-script-writer/RECORDING_COMMANDS.md).
A varázsszót az adott scriptben tárolt értékkel kezeld.

## Végrehajtás előtti ellenőrzések

- A jegyzék sémája `1.0`, a script tartalomlenyomata és részenkénti adatai
  megegyeznek az aktuálisan olvasott scripttel. Az ID-k és a felvételazonosítók
  érvényesek és egyediek a saját tartományukban.
- A Gomba 1 `projects/registry.json` kiválasztott `topic_id` rekordjában
  szereplő `resolve_project_name` megegyezik a preflight átadásával. Ezen a
  néven töltsd be a projektet a Resolve projektkönyvtárából.
- A források léteznek, tartalomazonosítójuk változatlan; minden megtartandó
  tartomány nem üres és a forrás időtartamán belül van.
- A jegyzékben ne maradjon `needs_review` rekord. Ilyenkor a 2. lépésben kell
  tisztázni a hozzárendelést, és utána újraindítani ezt a lépést; a bizonytalan
  felvételt ne minősítsd hiányzónak és ne hagyd el csendben.
- A cél-vágóprojekt egyértelmű, a médiakezeléshez és timeline-műveletekhez
  rendelkezésre áll működő kapcsolat. A Resolve-ban a registry-ből beolvasott
  `resolve_project_name` nevű projektet töltsd be, a módosítások után pedig
  a Resolve natív mentését használd; `.drp` exportot ne készíts. A használt eszköz aktuális API-leírásából
  ellenőrizd a médiaimportot, forrástartományt, klipelhelyezést, klipnevet,
  hang engedélyezését és a visszaolvasható klippéldány-azonosítót.
- A script szerinti timeline-nevek használhatók. Meglévő, nem üres cél-timeline
  vagy korábbi `timeline_assembly.json` esetén állj meg újrafuttatási döntésre;
  ne törölj felhasználói vágást és ne duplikáld automatikusan a tartalmat.

Elérhetetlen eszköznél vagy hibás bemenetnél konkrét akadályt jelezz. JSON vagy
vágási terv elkészítése önmagában nem jelenti a timeline összeállítását.

## Elhelyezés

1. A script törzséből származó `script_order` alapján járd be a részeket,
   cél-timeline-onként megtartva ezt a sorrendet. Ne a script-ID számértéke,
   fájlnév vagy fájldátum határozza meg a különböző script-részek sorrendjét.
2. Minden rész összes azonosított felvételét helyezd egymás után a megfelelő
   timeline-ra. Egy forrásban a felvételek sorrendje a forrásidő szerinti.
   Külön források igazolt rögzítési sorrendjét használd, ha rendelkezésre áll;
   enélkül a jegyzék listájának sorrendje csak ideiglenes elhelyezési sorrend.
   Ezt `provisional_index_order` értékkel rögzítsd, és ne állítsd, hogy ebből
   eldönthető az utolsó ismétlés. Itt egyik felvételt se dobd el.
3. A média eredeti video- és hangsávját őrizd meg. A képet és a hozzá tartozó
   hangot szinkronban helyezd el, egymáshoz kapcsolva. A részek ebben a menetben
   egymás után kerülnek; átfedést, áttűnést vagy önálló új narrációt ne találj ki.
4. A jegyzék `retained_start`–`retained_end` tartományát használd.
   Normál esetben ez kihagyja az azonosítóbemondást mindkét varázsszóval együtt.
   A csak bemondásos, nem talking head rész kivételénél a bemondás alatti kép
   megmarad. Több B-roll-ID egy fájlban külön klip legyen.
5. B-rollnál a meglévő hangot kapcsold ki, ne töröld. Az `audio_enabled`
   állapotot a jegyzékből alkalmazd, és a vágóprogramból olvasd vissza.
   Hang nélküli forráshoz ne hozz létre mesterséges hangot.
6. A megjelenített klipnév: `S{script_id} · {recording_id} · {clip_type} · {description}`.
   Az értékek a jegyzékből származnak. Az azonosításhoz ne készíts markert.
7. A forrásmásodperceket a vágóprogram által megkövetelt időalapra alakítsd;
   ne kezeld a másodpercértéket képkockaszámként. A tényleges forrás- és
   timeline-határokat olvasd vissza és mentsd el. Ellenőrizd, hogy a képkockás
   határillesztés nem vág le megtartandó beszédet vagy B-roll-képet.

## Kimenet: `timeline_assembly.json` — 1.0

A jegyzék mappájába mentsd a létrejött elhelyezéseket. A bemeneti jegyzék
változatlan marad; ez a kimenet adja hozzá a tényleges timeline-kapcsolatokat.

A gyökér mezői:

- `schema_version`: `"1.0"`.
- `recording_index_path`, `recording_index_sha256`, `script_sha256`: a felhasznált
  bemenetek visszakereshető referenciái.
- `resolve_project_name`: a registry-ből átvett, használt Resolve-projektnév.
- `status`: `completed` vagy `incomplete`.
- `timelines`: elemenként `timeline_id`, `timeline_name`, `frame_rate`,
  `start_frame`; a vágóprogramból visszaolvasva.
- `clips`: minden ténylegesen elhelyezett klippéldány kapcsolata.
- `missing_parts`: a script azon részei, amelyekhez nincs azonosított felvétel;
  elemenként `script_id`, `chapter_id`, `timeline`, `description`.
- `error`: végrehajtási hiba vagy `null`.

Minden `clips` bejegyzés:

- `recording_id`, `source_id`, `source_path`, `script_id`, `script_order`:
  az eredeti jegyzékhez vezető kapcsolat.
- `timeline_id`, `timeline_clip_id`, `video_track`, `audio_tracks`:
  tényleges vágóprogrambeli azonosítók és sávok. Hang nélküli forrásnál
  az `audio_tracks` üres lista.
- `clip_name`, `clip_type`, `audio_enabled`: alkalmazott és visszaolvasott értékek.
- `source_start`, `source_end`: a tényleges megtartott forrásrész másodpercben.
- `timeline_start_frame`, `timeline_end_frame`: tényleges timeline-képkockák,
  félig nyílt tartományként, az adott timeline időalapjában.
- `take_order_basis`: `source_time`, `verified_recording_order` vagy
  `provisional_index_order`. Igazolt sorrendnél `take_order_evidence` mezőben
  az azt alátámasztó adat is szerepeljen.

Minden jegyzékbeli azonosított felvételhez legyen elhelyezés. Az elhelyezett
részek sorrendjét, forrástartományait, nevét és hangállapotát a timeline
visszaolvasásával ellenőrizd. Eszközhiba esetén az addig létrejött klipeket is
rögzítsd `incomplete` kimenetben; ne jelents sikert, és ne indíts automatikus
újrapróbálkozást, amely megduplázhatná őket.

## Felhasználói eredmény

Sikeres összeállítás után kizárólag a `missing_parts` tartalmát listázd
közérthető részleírással. A behelyezett részeket és ismétléseiket ne sorold fel.
Ha nincs hiány, röviden jelezd, hogy az összeállítás kész, nincs hiányzó rész.
Végrehajtási akadályt hibaként jelezz, ne hiányzó felvételként.

A gépi átadás a `timeline_assembly.json` útvonala; a 4. lépés ezt és az eredeti
jegyzéket/átiratokat használja. A felhasználónak nem kell vágásnaplót készítenie.
A későbbi, nem dokumentált kézi vágások automatikus egyeztetése nem része
ennek a lépésnek.
