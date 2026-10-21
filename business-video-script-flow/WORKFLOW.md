# Workflow

Ez a workflow a repository canonical JSON sémájára épül.

Canonical JSON schema helye:

/templates/topic-template.json

Ez az egyetlen hivatalos témaséma, amelyet minden agent használ.

---

1. Discovery Agent

Feladat:
Bizonyított, már megvalósított AI, local AI, n8n és automatizálási use case-ek felkutatása.

Olvas:
- Workflow dokumentum
- /templates/topic-template.json

Ír:
- /research/discovered/*.json

Felelősség:
- Új témák létrehozása a canonical JSON séma alapján
- Kizárólag kutatási adatok kitöltése
- Nem pontoz
- Nem rangsorol
- Nem módosít más agent által létrehozott fájlt

---

2. Scoring Agent

Feladat:
A Discovery Agent által létrehozott témák üzleti és tartalmi értékelése.

Olvas:
- Workflow dokumentum
- /templates/topic-template.json
- /research/discovered/*.json

Ír:
- /research/scored/*.json

Felelősség:
- scores kitöltése
- editorial kitöltése
- Nem módosíthatja a Discovery Agent eredeti fájljait
- Nem törölhet fájlokat
- Nem mozgathat fájlokat

---

3. Index Builder Agent

Feladat:
Könnyen kereshető és gyorsan feldolgozható témaindex karbantartása.

Megvalósító prompt:
- `index-builder-agent-prompt.md`

Olvas:
- /research/scored/*.json

Ír:
- /indexes/topic-index.json

Felelősség:
- Minden pontozott témáról egy index rekord létrehozása vagy frissítése
- Nem módosítja az eredeti scored fájlokat

Index rekord minta:

{
  "id": "topic-001",
  "title": "AI Customer Support with Local LLM",
  "final_score": 87,
  "created_at": "2026-10-19",
  "tags": ["ollama", "n8n", "support"],
  "backlog_reason": "Bizonyított automatizálás, amely kézzelfogható ügyfélszolgálati időmegtakarítást mutat be.",
  "backlog": false,
  "published": false
}

Az index mezői a pontozott rekordból származnak: `id`, `title`, `created_at`,
`technology.tags`, `scores.final_score` és `editorial.why_selected`.
Az `editorial.why_selected` rövidített változata kerül a `backlog_reason` mezőbe.

---

4. Backlog Builder Agent

Feladat:
Az aktuálisan legjobb videóötletek kiválasztása.

Olvas:
- /indexes/topic-index.json

Ír:
- /backlog/BACKLOG.md

Felelősség:
- final_score alapján rendez
- már published témákat kizárja
- legjobb témákból backlogot készít
- nem olvassa végig az összes részletes JSON fájlt

---

5. Publishing Workflow

Felelős: a videó publikálásáért felelős emberi operátor.

Amint a videó nyilvánosan megjelent, az operátor az érintett téma rekordján:

Frissítendő:
- /indexes/topic-index.json

Módosítás:

published = true

A téma ezután többé nem kerülhet vissza a backlogba. A backlog builder a
következő futásakor kihagyja.

---

Alapszabályok

- A canonical séma egyetlen forrása:
  /templates/topic-template.json

- A részletes témaadatok helye:
  /research/discovered/
  /research/scored/

- A gyors kereséshez és priorizáláshoz használt index:
  /indexes/topic-index.json

- Az ember által olvasott munkalista:
  /backlog/BACKLOG.md

- Agent nem törölhet fájlokat.

- Agent nem mozgathat fájlokat.

- Agent csak új fájlt hozhat létre vagy a saját felelősségi körébe tartozó outputot frissítheti.

- A /indexes/topic-index.json tekintendő a backlog és publikálási állapotok hivatalos nyilvántartásának.

- A /research könyvtár történeti adatbázisként szolgál.