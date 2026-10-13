NOTES:

self hosted:
-with docker
-vps

ai agent:
-brain (model)
-memory (context, documents, vector db, memory of previous interactions)
-tools (interacting with outside worls)

!!! if no intergration exist, use API

SYSTEM PROMPT
-role (it can use)
-instructions
-tools
-context
-restrictions

implement isolated workfwlos and test the mon their own
THEN make one workflow call another


---

SET UP LOCAL N8N IN DOCKER

OLLAMA LOCAL

N8N DOCKER
services:
  n8n:
    image: n8nio/n8n:latest
    ports:
      - "127.0.0.1:5678:5678"
    environment:
      - TZ=Europe/Vienna
      - GENERIC_TIMEZONE=Europe/Vienna
      - N8N_HOST=localhost
      - N8N_EDITOR_BASE_URL=http://localhost:5678/
    volumes:
      - ./data:/home/node/.n8n
    restart: unless-stopped

docker compose up -d


TRY
✅ A n8n hivatalos workflow gyűjteményéből is tudsz böngészni és importálni workflow-kat lokális használatra.
✅ Exportált workflow-k Gitben tárolhatók és gépek között vihetők.

