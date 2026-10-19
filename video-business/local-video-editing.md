WORKFLOW
video -> Faster Whisper
transcript -> Ollama
Ollama -> JSON cut list (JSON könnyebben validálható)
JSON -> XML - OTIO export
XML -> DaVinci

Videos
 ↓
Batch Faster Whisper
 ↓
Analysis Prompt
 ↓
Timeline Prompt
 ↓
OTIO
 ↓
DaVinci


PROMPT
Tartsd meg a legjobb take-et.
Dobd a hibás újrakezdéseket.
Dobd a félbemaradt mondatokat.
Ne törölj speech nélküli B-roll clipet.


JSON to XML CONVERTER
OpenTimelineIO (OTIO)
Media reference
+
In point
+
Out point
+
Timeline sorrend



Bulk workflow


PROMPTS
Transcript Cleaner
filler words jelölése
újrakezdések felismerése
félbehagyott mondatok jelölése

2 - Timeline Builder
- jó take-ek kiválasztása
- ismétlések markerelése
- B-roll megtartása
- timeline sorrend meghatározása

Timeline Builder
Cél: végső timeline összeállítása.

---

Video
  ↓
Faster-Whisper
  ↓
Transcript
  ↓
Ollama
  ↓
Edit Decisions (JSON)
  ↓
OTIO
  ↓
DaVinci XML / Timeline
  ↓
DaVinci Resolve

