OLAMA
brew install ollama
brew services start ollama

ollama list                 # Telepített modellek
ollama pull MODELL          # Modell letöltése
ollama run MODELL           # Modell indítása / chat
ollama stop MODELL          # Modell leállítása
ollama rm MODELL            # Modell törlése
ollama ps                   # Futó modellek

LOCAL AI MODELLEK
ollama pull qwen3.5:9b
ollama pull qwen2.5-coder:7b
ollama pull gemma4:e4b

VIDEO
python3 -m venv ~/video-ai
source ~/video-ai/bin/activate
pip install -U 'faster-whisper==1.2.1' 'av==18.1.0'
# A Faster-Whisper 1.2.1 a PyAV 19-cel nem kompatibilis (metadata_errors).
pip install OpenTimelineIO
pip install OpenTimelineIO-Plugins
brew install ffmpeg
