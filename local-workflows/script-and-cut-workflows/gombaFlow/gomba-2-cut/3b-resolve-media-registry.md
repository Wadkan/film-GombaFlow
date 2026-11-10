---
name: 3b-resolve-media-registry
description: "A Resolve-projekt és a Media Pool forrásklipjeinek rögzítése."
---

# Resolve médiaregiszter

A `review_timeline_resolve_media_registry.json` a kiválasztott script meglévő projektmappájában,
a `recording_index.json` mellett található. A felvételi jegyzék és a vágási
terv változatlan marad; a médiaregiszter kapcsolja a forrásokat a Resolve-hoz,
és a Rough Cut timeline is ugyanazokat a forrásazonosítókat használja.

## Adatok

- `schema_version`: `"1.0"`.
- `topic_id`: a `recording_index.json` témaazonosítója.
- `resolve_project_id` és `resolve_project_name`: a Resolve-ból kiolvasott
  egyedi projektazonosító és a projekt látható neve.
- `sources`: a projekt Media Pooljához rendelt források listája, forrásonként
  egyszer. Az egyes bejegyzések mezői:
    - `source_id`: a felvételi jegyzék `sha256:` kezdetű forrásazonosítója.
    - `source_path`: a felvételi jegyzék szerinti abszolút forrásútvonal.
    - `resolve_media_pool_item_id`: a Resolve Media Pool forrásklipjének
      egyedi azonosítója, nem a timeline-klip azonosítója.
    - `source_fps`: a forrásklip képkockasebessége pontos tört alakú szövegként,
      például `"30000/1001"`.

Ugyanaz a forrás több felvételrészt vagy különböző scripteket is kiszolgálhat;
ezek mind ugyanarra a forrásrekordra hivatkoznak. A regiszter a kiválasztott
Resolve-projektben érvényes Media Pool-azonosítókat tárolja.

## Ellenőrzés és mentés

1. Olvasd be a `recording_index.json` fájlt és a [3a médiaimport](3a-resolve-media-import.md)
   átadását. Ellenőrizd, hogy az átadott projekt ID-ja és neve egyezik a nyitott
   Resolve-projekttel, és minden egyedi jegyzékbeli forrás egyszer szerepel.
2. Forrásonként ellenőrizd az útvonalat és a SHA-256 azonosítót a felvételi
   jegyzékkel. A Media Poolban keresd meg az átadott `GetUniqueId()` értékű
   klipet, és ellenőrizd, hogy a fájlja ugyanahhoz a forráshashhez tartozik.
3. A forrás FPS-ét `ffprobe` segítségével, a videósáv `avg_frame_rate`
   mezőjéből olvasd ki pontos tört alakban. Hiányzó, nulla vagy érvénytelen
   értéknél jelezz akadályt; ne becsülj FPS-t, és ne végezz VFR-vizsgálatot.
4. Ha a médiaregiszter még nem létezik, készítsd el a fenti séma szerint.
   Ha létezik, ellenőrizd a sémát, téma- és projektazonosságot, valamint a már
   szereplő forrásadatok egyezését. Csak az új forrásokat add hozzá; az eddigi
   rekordokat őrizd meg. Eltérésnél ne írd át a regisztert, hanem jelezd.
5. Az összes ellenőrzés után mentsd el és olvasd vissza a teljes regisztert.
   Ellenőrizd, hogy minden átadott forrás szerepel a megfelelő adatokkal, majd
   add át a fájl útvonalát a következő lépésnek.

Ez a lépés nem importál médiát és nem módosít timeline-t, forrásfájlt,
`recording_index.json`-t vagy Gomba 1 registryt.
