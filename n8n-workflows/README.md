# n8n workflow csomagok

Az n8n-hez tartozó, repóban verziózott workflow-családok egy helyen. Minden almappa egy önálló csomag (saját `workflows/`, `config/`, `Makefile`, dokumentáció).

- [`youtube-upload/`](youtube-upload/) — YouTube feltöltés és metaadat-chat (MVP). Részletes terv: [`docs/CHECKLIST.md`](../docs/CHECKLIST.md).

## Docker mount

A `n8n-docker/compose.yaml` minden csomaghoz külön bind mountot adhat. A YouTube csomag a konténerben továbbra is `/data/youtube-upload` alatt látszik (az n8n workflow-k és a `N8N_RESTRICT_FILE_ACCESS_TO` ezt az útvonalat használja).

Új csomag esetén: almappa itt, mount a compose-ban, és szükség szerint bővítsd a `N8N_RESTRICT_FILE_ACCESS_TO` listát az `n8n-docker/env.example` / `.env` fájlban.

## Export / import

Csomagonként, a csomag gyökeréből:

```sh
make -C n8n-workflows/youtube-upload export
make -C n8n-workflows/youtube-upload import
```

Az n8n stacket a gyökér `Makefile`-lal indítod (`make start-n8n`).
