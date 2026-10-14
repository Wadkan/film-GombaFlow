# n8n with Docker

Start from the repository root:

```sh
docker compose -f n8n-docker/compose.yaml up -d
```

Open http://localhost:5678 in your browser.

Stop:

```sh
docker compose -f n8n-docker/compose.yaml down
```

Data is stored in a Docker-managed volume and is preserved when you stop the service. Do not use `docker compose down -v` unless you want to delete it.
