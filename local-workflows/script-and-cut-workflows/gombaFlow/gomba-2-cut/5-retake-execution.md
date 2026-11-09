# 5. Vágási terv végrehajtása

## Külön indítás és bemenetellenőrzés

Ezt a lépést a felhasználó külön indítja a 4. lépés `ready_for_execution`
állapotú `retake_plan.json` fájljával, a 3. timeline-összeállítás után. Ne
indítsd automatikusan sem a terv, sem az összeállítás befejezése után. Olvasd
be a tervben hivatkozott scriptet, jegyzéket és `timeline_assembly.json` fájlt,
majd ellenőrizd a fájlok tartalomlenyomatait, a Gomba 1 registry
`resolve_project_name` értékével való egyezést, valamint hogy a terv forrás-
útvonalai és forrásidői megfelelnek az összeállításban szereplő klipeknek.

Ha a terv nem `ready_for_execution`, valamelyik hivatkozás hiányzik, vagy a
tervben hivatkozott forrásrész nem található a timeline-összeállításban, ne
vágj; jelezd a konkrét eltérést. A Resolve-projektet a registry-ben megadott `resolve_project_name`
alapján nyisd meg, a vágás után pedig natívan mentsd a Resolve-ban; `.drp`
exportot ne készíts.
Nem dokumentált kézi vágások automatikus visszafejtése nem része ennek a lépésnek.

## Timeline-műveletek és visszaellenőrzés

A végrehajtó a mentett terv szerinti műveleteket hajtsa végre, ne hozzon új
tartalmi vágási döntést a timeline módosítása közben. Eltérésnél álljon meg;
tervmódosítás csak újabb dokumentált tervezési és ellenőrzési körben történhet.
Az átirat szavait az eredeti forrásidővel illeszd a tényleges klipekhez.
Egy eredeti felvételből több megtartott tartomány is keletkezhet. A kép és
kapcsolt hang vágása szinkronban történjen, a kihagyások helye záródjon össze;
a többi script-rész sorrendje maradjon változatlan. A B-roll bemondás alatti
képe és kikapcsolt, megőrzött hangja továbbra is maradjon meg.

Ha a 3. lépés ideiglenes fájlsorrendet használt, az adott script-rész megtartott
beszédét a most igazolt rögzítési sorrendben állítsd össze. A vágóprogram
aktuális API-jából ellenőrizd a szükséges műveleteket; terv vagy JSON mentése
önmagában nem végrehajtott vágás. Ne használj markert a vágás helyettesítésére.

A vágás után olvasd vissza az összes érintett timeline-t. Ellenőrizd a
megtartott forrástartományokat, a hangkapcsolatot, a klipneveket és a végső
beszédet hallgatással is. Képkockára illesztéskor ne vágj le megtartandó szót.
Minden új klippéldányt kapcsolj vissza az eredeti jegyzékrekordhoz; a későbbi
klipek eltolódott timeline-pozícióit is rögzítsd.

## Kimenet: `retake_cleanup.json` — 1.0

A jegyzék mappájában új fájlt készíts; meglévő eredményt ne írj felül
automatikusan. Újrafuttatás előtt egyeztesd, melyik rögzített állapotból induljon.

- `schema_version`: `"1.0"`; `status`: `completed` vagy `incomplete`.
- Bemeneti referenciák: `timeline_assembly_path`, `timeline_assembly_sha256`,
  `recording_index_path`, `recording_index_sha256`, `script_sha256`,
  `resolve_project_name`.
- `retake_plan_path`, `retake_plan_sha256`: a ténylegesen végrehajtott,
  előzetesen ellenőrzött vágási terv hivatkozása és tartalomlenyomata.
- `ordering`: script-ID-nként a felvételazonosítók tényleges sorrendje,
  az alkalmazott metaadat vagy fájlnévsorszám és az azt alátámasztó eredeti adat.
- `decisions`: törölt korábbi tartományonként `script_id`, `recording_id`,
  `source_id`, `source_start`, `source_end`, `original_text`, a helyébe lépő
  felvételazonosító és forrástartomány, valamint a konkrét ismétlési megfelelés indoka.
- `final_clips`: minden megmaradt timeline-klippéldány a 3. lépés `clips`
  mezőivel, az aktuális időpontokkal és az eredeti jegyzékhez vezető kapcsolattal.
  A nem vágott, de eltolódott klipek is szerepeljenek.
- `unresolved`: pontosítandó sorrend vagy fel nem oldott tartalmi probléma;
  elemenként script-ID, érintett felvételazonosítók és konkrét indok.
- `error`: végrehajtási hiba vagy `null`. Részleges eszközhibánál az addig
  létrejött állapot is legyen visszakereshető, `incomplete` státusszal.

Feloldatlan `unresolved` tételnél a státusz `incomplete`; ne jelentkezz
teljesen késznek olyan csoporttal, amelyben még döntésre váró változatok maradtak.

A bemenetek változatlanok; a kimenet a friss timeline-kapcsolatok hiteles
pillanatképe. A későbbi agent ezt használja a 3. lépés elavult pozíciói helyett.
A felhasználónak rövid készjelzést adj, vagy csak a konkrét elakadást jelezd;
a sikeresen kivágott ismétléseket ne listázd.
