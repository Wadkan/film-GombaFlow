# YouTube metaadatforrások és n8n workflow csomagok

Az `youtube-upload/` csomag megőrzi a YouTube-csatornák metaadat-forrásait,
a `meta.json` formátumot és az n8n import/export segédscripteket. A korábbi
metaadat-chat n8n workflow-kat kivezetjük; az egyeztetés és fájlkészítés
közvetlenül chatben történik az [`youtube-upload/CHAT_WORKFLOW.md`](youtube-upload/CHAT_WORKFLOW.md)
útmutató szerint.

- [`youtube-upload/`](youtube-upload/) — YouTube csatornaforrások és metaadatok.

## Docker mount

A YouTube csomag n8n-beli import/export műveletekhez továbbra is
`/data/youtube-upload` útvonalon érhető el.

Új csomag esetén: almappa itt, mount a compose-ban, és szükség szerint bővítsd a `N8N_RESTRICT_FILE_ACCESS_TO` listát az `n8n-docker/env.example` / `.env` fájlban.

## Export / import

Csomagonként, a csomag gyökeréből:

```sh
make -C n8n-workflows/youtube-upload export
make -C n8n-workflows/youtube-upload import
```

Az n8n stacket a gyökér `Makefile`-lal indítod (`make start-n8n`).
