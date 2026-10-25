# n8n workflow-k

Az általános n8n import/export eszközök és workflow exportok ebben a
könyvtárban vannak.

## Elrendezés

- `Makefile` — általános `export` és `import` célok.
- `config/` — n8n URL/OAuth konfiguráció.
- `scripts/` — általános n8n workflow import/export scriptek.
- `workflows/` — exportált n8n workflow JSON-ok.

## Docker mount

Az `n8n-docker/compose.yaml` a teljes könyvtárat `/data/n8n-workflows` útvonalon
mountolja.

## Export / import

Repo gyökérből:

```sh
make -C n8n-workflows export
make -C n8n-workflows import
```

Az n8n stacket a gyökér `Makefile`-lal indítod (`make start-n8n`).
