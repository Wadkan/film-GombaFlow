# Melyik folyamatot hogyan indítsd?

Rövid belépési pontok a film-GombaFlow repóhoz. A parancsokat a repó gyökeréből futtasd; a workflow skilljeit a helyi agent chatben indítsd.

## YouTube-metaadatok

- Agentben: indítsd a `youtube-meta-update` folyamatot, és add meg a videó adatait/linkjét. A folyamat egyezteti és elmenti a metaadatokat.
- Terminálos kapcsolatpróba: `python3 local-workflows/youtube-meta-update/youtube_meta_update.py check local-workflows/youtube-meta-update/examples/connection-check.json`
- Jóváhagyott metaadat előellenőrzése: `python3 local-workflows/youtube-meta-update/youtube_meta_update.py preflight <meta.json>`
- Jóváhagyott metaadat éles alkalmazása: `python3 local-workflows/youtube-meta-update/youtube_meta_update.py update <meta.json>`

## GombaFlow videóötletek és script

- Ötletgyűjtéshez: indítsd a `local-workflows/script-and-cut-workflows/gombaFlow/gomba-0-idea-collector/WORKFLOW.md` workflow-t az agentben.
- Kiválasztott ötlet átiratához és briefjéhez: az agentben indítsd a [0-idea-intake.md](../local-workflows/script-and-cut-workflows/gombaFlow/gomba-1-script-writer/0-idea-intake.md) skillt. A helyi átirat bekéréséhez futtasd: `make gomba1-transcript`.
- További scriptlépések, mindig az előző kimenet jóváhagyása után:
    - Történet: [1-story-hook.md](../local-workflows/script-and-cut-workflows/gombaFlow/gomba-1-script-writer/1-story-hook.md)
    - Fejezetterv: [2-chapter-planning.md](../local-workflows/script-and-cut-workflows/gombaFlow/gomba-1-script-writer/2-chapter-planning.md)
    - Script: [3a-script-writing.md](../local-workflows/script-and-cut-workflows/gombaFlow/gomba-1-script-writer/3a-script-writing.md)
    - Script review: [4-script-review.md](../local-workflows/script-and-cut-workflows/gombaFlow/gomba-1-script-writer/4-script-review.md)
    - Forgatási felkészülés: [5-shoot-preparation.md](../local-workflows/script-and-cut-workflows/gombaFlow/gomba-1-script-writer/5-shoot-preparation.md)

## n8n

- Indítás: `make start-n8n`
- Helyi belépési adatok: `~/.config/film-gombaflow/local-n8n-login.json` (`url`, `email`, `password` mezők; fájljogosultság: `600`). Ha az agenttől kéred az indítást, sikeres indítás után írja ki neked az URL-t, a felhasználónevet és a jelszót ebben a helyi chatben. A jelszó nem kerül a repóba.
- Leállítás: `make stop-n8n`
- Workflow-k import/export: `make -C n8n-workflows import` vagy `make -C n8n-workflows export`

Részletek: [YouTube-metaadat frissítő](../local-workflows/youtube-meta-update/README.md), [Gomba 1 workflow](../local-workflows/script-and-cut-workflows/gombaFlow/gomba-1-script-writer/WORKFLOW.md), [n8n workflow-k](../n8n-workflows/README.md).
