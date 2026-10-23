
# Áttekintő terv: YouTube-feltöltés n8n-nel (MVP)

## Alapelvek
- **A már futó n8n marad.** Egy helyi n8n fut Rancher Desktopon, az `n8n-docker/` stackből, két workflow-val és egy közös értesítő segéd-workflow-val. Nem készül második compose, és nem kerül `docker-compose.yml` a repó gyökerébe. A Rancher Desktopban a Docker-kompatibilis motort (dockerd/moby) kell választani, hogy a `docker compose` működjön.
- **Minden webes, saját fejlesztés nélkül:**
  - a chat az n8n beépített chat-oldala,
  - a feltöltést egy n8n-űrlap indítja,
  - a `meta.md`-t szövegszerkesztőben szerkeszted.
- **A Telegram csak értesít,** bejövő üzenetet nem figyel, ezért tunnel nem kell.
- **A feltöltés mindig kézzel indul,** minden más automatikus.
- **Amit online el lehet érni, azt nem mentjük el külön.** A playlisteket a workflow mindig élőben kéri le.
- **Az end screen kézi lépés,** Playwright ebben a körben nincs.
- **Az n8n indítása és leállítása a meglévő Makefile-okban marad** (`make start-n8n`, `make stop-n8n`). Az export és az import a `youtube-upload/Makefile`-ban van.

## A repó tartalma

Meglévő stack, ez marad: `n8n-docker/` (`compose.yaml`, `env.example`, `Makefile`). A gyökér `Makefile` csak ide delegál.

Új mappa, `youtube-upload/`:

- `workflows/`: az exportált workflow-k JSON-ban.
- `scripts/`: az export és az import.
- `Makefile`: `export` és `import`.
- `config/settings.json`: az alapértelmezett mappa, a Telegram chat ID, az időzóna, az alapértelmezett megjelenési idő.
- `prompts/style.md`: a skilled, a stílusod és a SEO-szabályaid (AI-keresőkre és klasszikus keresőkre).
- `rules/rules.md`: amit az ügynök tanul, például „bringás videó → Bringa playlist”.
- `examples/meta.json` és `examples/upload-state.json`: a formátum példája. A valódi fájlokat a workflow a videómappába írja.

A videók nincsenek a repóban. Helyi mappában vannak. A `VIDEOS_ROOT` az `n8n-docker/.env`-ben van, mert a compose a mellette lévő `.env`-ből helyettesíti az útvonalat. A titkos kulcsok is ott maradnak. Külön `youtube-upload/.env` nem kell. A valódi `.env` továbbra is az `n8n-docker/.gitignore` alatt van.

Az env változó önmagában nem teszi láthatóvá a mappát. Az `n8n-docker/compose.yaml` n8n szolgáltatására bind mount kell: a `${VIDEOS_ROOT}` írhatóan csatolva, mert a `meta.json` és az `upload-state.json` oda kerül. Ugyanígy csatolni kell a `youtube-upload/` mappát, hogy a workflow olvassa a `settings.json`-t, a `style.md`-t és a `rules.md`-t, és írja a `rules.md`-t. Ezek a konténerbeli útvonalak kerülnek az `N8N_RESTRICT_FILE_ACCESS_TO` értékébe. Az `N8N_DEFAULT_BINARY_DATA_MODE=filesystem` és az `N8N_ENCRYPTION_KEY` az `n8n-docker/env.example` kiegészítése. A `GENERIC_TIMEZONE=Europe/Vienna` már be van állítva.

## Egy videó mappája
`YYYY-MM-DD_videonev/`, benne:
- `video.mp4` és `thumbnail.jpg`
- `meta.md`: ezt te szerkeszted.
- `meta.json`: ezt az ügynök írja. A `status` értéke `draft`, a jóváhagyásod után `ready`. Ebben van a cím, a leírás, a címkék, a playlist és a `youtube_scheduled_at`.
- `upload-state.json`: ezt csak a feltöltő írja.
  - `status`: `uploading`, `uploaded` vagy `failed`
  - `steps`: lépésenkénti állapot
  - `videoId` és `videoUrl`
  - `uploadedAt`: pontos időbélyeg
  - `attempts` és `error`
  - Ha egy feltöltés órák óta `uploading` állapotban áll, `failed`-nek számít.

## Megvalósítási sorrend
1. [ ] TODO **Repó alapjai, a meglévő stackhez igazítva.** Új compose nem készül. Az `n8n-docker/compose.yaml` kiegészítése a videókötetettel és a `youtube-upload/` csatolásával. Az `n8n-docker/env.example` kiegészítése: `VIDEOS_ROOT`, `N8N_RESTRICT_FILE_ACCESS_TO`, `N8N_DEFAULT_BINARY_DATA_MODE=filesystem`, `N8N_ENCRYPTION_KEY`. A `youtube-upload/Makefile` csak az `export` és az `import`.
2. [ ] TODO **Export- és importszkript** a `youtube-upload/workflows/` mappába, a `youtube-upload/Makefile` `export` és `import` céljaival. A futó konténer a meglévő `n8n-docker` stack.
3. [ ] TODO **Adatformátumok rögzítése** a `youtube-upload/` alatt: `config/settings.json`, `examples/meta.json`, `examples/upload-state.json`, `prompts/style.md`, `rules/rules.md`, valamint a videómappák elnevezése.
4. [ ] TODO **Telegram értesítő segéd-workflow,** amit a többi workflow meghív.
5. [ ] TODO **Feltöltő workflow** (előbb érdemes megépíteni, mert egy kézzel írt `meta.json`-nal jól tesztelhető):
   1. [ ] TODO Űrlap, előre kitöltve az alapértelmezett mappával.
   2. [ ] TODO Ellenőrzi, hogy a mappa létezik.
   3. [ ] TODO Megkeresi a feltölthető videókat: ahol a `meta.json` státusza `ready`, és az `upload-state.json` nem `uploaded`. Ha egy van, rögtön indul. Ha több, egy második űrlapoldalon legördülő listából választasz.
   4. [ ] TODO Feltölti a videót privátként, a `youtube_scheduled_at` időpontra időzítve.
   5. [ ] TODO Beállítja a thumbnailt egy HTTP Request node-dal.
   6. [ ] TODO Hozzáadja a videót a playlisthez.
   7. [ ] TODO Minden lépés után menti az állapotot. Újraindításkor a `videoId` alapján csak a hiányzó lépéseket futtatja.
   8. [ ] TODO Telegramon jelzi, hol tart. A végén elküldi a linket, és emlékeztet az end screenre a Studio-linkkel. Hiba esetén megírja, mi és melyik lépésnél romlott el.
6. [ ] TODO **Metaadat-chat workflow:**
   1. [ ] TODO Chat-oldal és AI-ügynök memóriával.
   2. [ ] TODO Beolvassa a `style.md`-t és a `rules.md`-t, a playlisteket élőben kéri le.
   3. [ ] TODO Elkészíti a `meta.md`-t és a `meta.json`-t `draft` státusszal.
   4. [ ] TODO Módosítás a chatben vagy kézzel.
   5. [ ] TODO Egyezteti veled a playlistet és az időzítést.
   6. [ ] TODO A jóváhagyásod után átviszi a `meta.md` tartalmát a `meta.json`-ba, és `ready`-re állítja.
   7. [ ] TODO Ha új szabályt mondasz, beírja a `rules.md`-be, és legközelebb már csak felajánlja.
7. [ ] TODO **Végigtesztelés egy valódi videóval,** utána `make -C youtube-upload export` és commit.

## Kockázatok
- **Ellenőrizetlen Google API-projekt:** a YouTube szabályai szerint az ilyen projektből feltöltött videók privátak maradnak, és az időzítés sem teszi őket nyilvánossá. Ezt egy ellenőrzés (audit) kérésével lehet feloldani.
- **Napi YouTube API-keret:** a keret szűkös. Egy feltöltés nagyjából 1600 egységbe kerül a napi 10 000-ből, ez kb. 6 videó naponta. Ezt az értéket érdemes a Google aktuális dokumentációjában ellenőrizni.
- **Rancher Desktop Macen:** alapból csak a saját mappádat (home) osztja meg a konténerekkel. Ha a videók máshol vannak, azt a mappát külön engedélyezni kell.

## Rád váró teendők
1. [ ] TODO **Rancher Desktop:** állítsd a motort dockerdre (moby), és ha a videómappa nem a saját mappádon belül van, engedélyezd a megosztását.
2. [ ] TODO **`n8n-docker/.env` kitöltése:** állítsd be a `VIDEOS_ROOT` útvonalat, és generálj egy `N8N_ENCRYPTION_KEY` kulcsot. A kulcsot mentsd el biztonságos helyre, mert nélküle a credentialök nem állíthatók vissza. A compose csak e fájl mellől látja a `VIDEOS_ROOT`-ot.
3. [ ] TODO **Google Cloud:**
   1. [ ] TODO Hozz létre egy projektet, és kapcsold be a YouTube Data API v3-at.
   2. [ ] TODO Állítsd be a bejelentkezési (OAuth) engedélykérő képernyőt.
   3. [ ] TODO Hozz létre egy Client ID-t és egy Client Secretet, az n8n által megadott átirányítási címmel.
   4. [ ] TODO Az n8n-ben hozd létre a YouTube credentialt.
   5. [ ] TODO Kérd az API-ellenőrzést (audit), különben a videók privátak maradnak.
4. [ ] TODO **Telegram:**
   1. [ ] TODO Az n8n-ben hozd létre a Telegram credentialt a BotFathertől kapott tokennel.
   2. [ ] TODO Írj egy üzenetet a botnak.
   3. [ ] TODO A `getUpdates` címen nézd ki a chat ID-t, és írd be a `youtube-upload/config/settings.json`-ba.
5. [ ] TODO **AI-modell:** hozz létre egy credentialt a választott szolgáltatóhoz (pl. OpenAI vagy Anthropic), az API-kulcsoddal.
6. [ ] TODO **Tartalom:** másold át a meglévő skilledet és a preferenciáidat a `youtube-upload/prompts/style.md`-be, és töltsd ki a `youtube-upload/config/settings.json` alapértékeit.
7. [ ] TODO **Minden videónál:** állítsd be kézzel az end screent a YouTube Studióban.
8. [ ] TODO **Minden workflow-változtatás után:** futtasd a `make -C youtube-upload export` parancsot, és commitolj.

