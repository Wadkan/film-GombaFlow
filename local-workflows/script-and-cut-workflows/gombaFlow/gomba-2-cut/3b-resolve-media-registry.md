---
name: 3b-resolve-media-registry
description: "A Resolve-projekt és a Media Pool forrásklipjeinek jegyzékszerződése."
---

# Resolve médiaregiszter — szerződés

A `resolve-media-registry.json` a kiválasztott script meglévő projektmappájában,
a `recording_index.json` mellett található. A felvételi jegyzék és a vágási
terv változatlan marad; a médiaregiszter kapcsolja a forrásokat a Resolve-hoz.

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

Ugyanaz a forrás több felvételrészt vagy cél-timeline-t is kiszolgálhat;
ezek mind ugyanarra a forrásrekordra hivatkoznak. A regiszter a kiválasztott
Resolve-projektben érvényes Media Pool-azonosítókat tárolja.

Ez a lépés kizárólag az adatszerződést rögzíti. A források importját, a
regiszter feltöltését és a terv szerinti timeline-vágást külön lépések végzik.
