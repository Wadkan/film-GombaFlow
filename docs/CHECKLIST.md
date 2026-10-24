
# Áttekintő terv: YouTube-feltöltés n8n-nel (MVP)

## Alapelvek
- **A már futó n8n marad.** Egy helyi n8n fut Rancher Desktopon, az `n8n-docker/` stackből, két workflow-val és egy közös értesítő segéd-workflow-val. Nem készül második compose, és nem kerül `docker-compose.yml` a repó gyökerébe. A Rancher Desktopban a Docker-kompatibilis motort (dockerd/moby) kell választani, hogy a `docker compose` működjön.
- **Minden webes, saját fejlesztés nélkül:**
  - a chat az n8n beépített chat-oldala,
  - a feltöltést egy n8n-űrlap indítja,
  - a metaadatot a chatben egyezteted. A `meta.md` a `meta.json` mezőiből készül.
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
- `config/settings.json`: az alapértelmezett mappa konténerbeli útvonala (`/data/videos`), a Telegram chat ID, az időzóna, az alapértelmezett megjelenési idő. Mac-útvonal nincs benne.
- `prompts/style.md`: a skilled, a stílusod és a SEO-szabályaid (AI-keresőkre és klasszikus keresőkre).
- `rules/rules.md`: amit az ügynök tanul, például „bringás videó → Bringa playlist”.
- `examples/meta.json` és `examples/upload-state.json`: a formátum példája. A valódi fájlokat a workflow a videómappába írja.

A videók nincsenek a repóban. Helyi mappában vannak. A `VIDEOS_ROOT` az `n8n-docker/.env`-ben van, mert a compose a mellette lévő `.env`-ből helyettesíti az útvonalat. A workflow nem olvassa a Mac-útvonalat. A titkos kulcsok is ott maradnak. Külön `youtube-upload/.env` nem kell. A valódi `.env` továbbra is az `n8n-docker/.gitignore` alatt van.

Az env változó önmagában nem teszi láthatóvá a mappát. Az `n8n` szolgáltatásra két bind mount kell: `${VIDEOS_ROOT}:/data/videos` írhatóan, és `../youtube-upload:/data/youtube-upload` írhatóan. A `runners` szolgáltatásra nincs kötet. A mappaellenőrzés, a `meta.json`, az `upload-state.json` és a `rules.md` írása csak a fő `n8n` konténer Read/Write Files node-jával megy. A Code node nem éri el a fájlrendszert. Az `N8N_RESTRICT_FILE_ACCESS_TO` értéke `/data/videos;/data/youtube-upload`, különben az n8n 2.44 csak a `~/.n8n-files` alá enged. Az `N8N_DEFAULT_BINARY_DATA_MODE=filesystem` és az `N8N_ENCRYPTION_KEY` az `n8n-docker/env.example` kiegészítése. A kulcs értéke nem új generált kulcs: a már létező `n8n-docker_n8n_data` kötet `/home/node/.n8n/config` fájljának `encryptionKey` mezője. Új kulcsot csak akkor kell generálni, ha ez a fájl még nincs. A `GENERIC_TIMEZONE=Europe/Vienna` már be van állítva.

## Egy videó mappája
`YYYY-MM-DD_videonev/`, benne:
- `video.mp4` és `thumbnail.jpg`
- `meta.md`: a chat a `meta.json` mezőiből írja. Kézi szerkesztése nem forrás.
- `meta.json`: ezt az ügynök írja, rögzített mezőkkel, csak ebbe az almappába: `/data/videos/YYYY-MM-DD_videonev/meta.json`. A `/data/videos/meta.json` útvonal érvénytelen. A `status` értéke `draft`, a kötelező mezők ellenőrzése után `ready`. Mezők: cím, leírás, címkék, `playlistId`, `youtube_scheduled_at`. A playlist nevét a workflow élőben kéri le, és a névből ID-t ment. A `youtube_scheduled_at` eltolásos idő, például `2026-10-24T18:00:00+02:00`.
- `upload-state.json`: ezt csak a feltöltő írja.
  - `status`: `uploading`, `uploaded` vagy `failed`
  - `steps`: lépésenkénti állapot
  - `videoId` és `videoUrl`
  - `startedAt`: az `uploading` állapot kezdete
  - `uploadedAt`: pontos időbélyeg
  - `attempts` és `error`
  - Nincs háttérfigyelő. A következő kézi indításkor a friss `uploading` kimarad a választásból: ha a `startedAt` a választott határon belül van, a workflow nem nyúl hozzá. Ha a `startedAt` régebbi ennél a határnál, `failed`-nek veszi, és a meglévő `videoId` alapján csak a hiányzó lépéseket futtatja.

## Megvalósítási sorrend
1. [ ] TODO **Repó alapjai, a meglévő stackhez igazítva.** Új compose nem készül. Az `n8n-docker/compose.yaml` `n8n` szolgáltatására két bind mount: `${VIDEOS_ROOT}:/data/videos` és `../youtube-upload:/data/youtube-upload`. A `runners` szolgáltatásra nincs kötet. Az `n8n-docker/env.example` kiegészítése: `VIDEOS_ROOT`, `N8N_RESTRICT_FILE_ACCESS_TO=/data/videos;/data/youtube-upload`, `N8N_DEFAULT_BINARY_DATA_MODE=filesystem`, `N8N_ENCRYPTION_KEY`. A `youtube-upload/Makefile` csak az `export` és az `import`.
2. [ ] TODO **Export- és importszkript** a `youtube-upload/workflows/` mappába, a `youtube-upload/Makefile` `export` és `import` céljaival. A futó konténer a meglévő `n8n-docker` stack.
3. [ ] TODO **Adatformátumok rögzítése** a `youtube-upload/` alatt: `config/settings.json`, `examples/meta.json`, `examples/upload-state.json`, `prompts/style.md`, `rules/rules.md`, valamint a videómappák elnevezése.
4. [ ] TODO **Telegram értesítő segéd-workflow,** amit a többi workflow meghív.
5. [ ] TODO **Feltöltő workflow** (előbb érdemes megépíteni, mert egy kézzel írt `meta.json`-nal jól tesztelhető):
   1. [ ] TODO Az első űrlapoldal csak az indítás. Nincs előre kitöltött mappa. A következő node a `settings.json`-ból olvassa a `/data/videos` útvonalat.
   2. [ ] TODO Read/Write Files node ellenőrzi, hogy a konténerbeli mappa létezik.
   3. [ ] TODO Megkeresi a feltölthető videókat: ahol a `meta.json` státusza `ready`, és az `upload-state.json` hiányzik, `failed`, vagy a határon túli `uploading`. A határon belüli `uploading` kimarad. A határon túli `uploading` állapotot előbb `failed`-re írja. Ha egy jelölt van, rögtön indul. Ha több, a második űrlapoldalon kifejezéssel töltött legördülő listából választasz.
   4. [ ] TODO Feltölti a videót privátként, az eltolásos `youtube_scheduled_at` időpontra időzítve.
   5. [ ] TODO Beállítja a thumbnailt egy HTTP Request node-dal.
   6. [ ] TODO Hozzáadja a videót a playlisthez a `playlistId` alapján.
   7. [ ] TODO Minden lépés után menti az állapotot, az `uploading` kezdetén a `startedAt` mezővel. Újraindításkor a `videoId` alapján csak a hiányzó lépéseket futtatja.
   8. [ ] TODO Telegramon jelzi, hol tart. A végén elküldi a linket, és emlékeztet az end screenre a Studio-linkkel. Hiba esetén megírja, mi és melyik lépésnél romlott el.
6. [ ] TODO **Metaadat-chat workflow:**
   1. [ ] TODO Chat-oldal és AI-ügynök memóriával. A chatben megadod a `YYYY-MM-DD_videonev` almappát.
   2. [ ] TODO Read/Write Files node ellenőrzi, hogy a `/data/videos/YYYY-MM-DD_videonev/` létezik és van benne `video.mp4`. Ez a mappa minden `meta.json` és `meta.md` írás célja. Beolvassa a `style.md`-t és a `rules.md`-t, a playlisteket élőben kéri le.
   3. [ ] TODO A rögzített mezőket a `/data/videos/YYYY-MM-DD_videonev/meta.json` fájlba írja `draft` státusszal, a `meta.md`-t ugyanebbe a mappába, ezekből a mezőkből készíti. A playlistnévből `playlistId` lesz, az idő eltolásos.
   4. [ ] TODO Módosítás a chatben: ugyanabban az almappában írja újra a mezőket, és a `meta.md`-t újragenerálja.
   5. [ ] TODO Egyezteti veled a playlistet és az időzítést.
   6. [ ] TODO A jóváhagyásod után ellenőrzi a kötelező mezőket, és ugyanabban az almappában `ready`-re állítja a `meta.json`-t. A `meta.md`-t nem értelmezi.
   7. [ ] TODO Ha új szabályt mondasz, Read/Write Files node-dal beírja a `rules.md`-be, és legközelebb már csak felajánlja.
7. [ ] TODO **Végigtesztelés egy valódi videóval,** utána `make -C youtube-upload export` és commit.

## Kockázatok
- **Ellenőrizetlen Google API-projekt:** a YouTube szabályai szerint az ilyen projektből feltöltött videók privátak maradnak, és az időzítés sem teszi őket nyilvánossá. Ezt egy ellenőrzés (audit) kérésével lehet feloldani.
- **Napi YouTube API-keret:** a keret szűkös. Egy feltöltés nagyjából 1600 egységbe kerül a napi 10 000-ből, ez kb. 6 videó naponta. Ezt az értéket érdemes a Google aktuális dokumentációjában ellenőrizni.
- **Rancher Desktop Macen:** alapból csak a saját mappádat (home) osztja meg a konténerekkel. Ha a videók máshol vannak, azt a mappát külön engedélyezni kell.

## Rád váró teendők
1. [ ] TODO **Rancher Desktop:** állítsd a motort dockerdre (moby), és ha a videómappa nem a saját mappádon belül van, engedélyezd a megosztását.
2. [ ] TODO **`n8n-docker/.env` kitöltése:** állítsd be a `VIDEOS_ROOT` útvonalat. Az `N8N_ENCRYPTION_KEY` a futó konténer `/home/node/.n8n/config` fájljának `encryptionKey` értéke. Új kulcsot ne generálj, ha ez a fájl megvan, mert a meglévő credentialök azzal visszafejthetetlenek. A kulcsot mentsd el biztonságos helyre. A compose csak e fájl mellől látja a `VIDEOS_ROOT`-ot.
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
6. [ ] TODO **Tartalom:** másold át a meglévő skilledet és a preferenciáidat a `youtube-upload/prompts/style.md`-be, és töltsd ki a `youtube-upload/config/settings.json` alapértékeit. Az alapértelmezett mappa a `/data/videos` konténerbeli útvonal.
7. [ ] TODO **Minden videónál:** állítsd be kézzel az end screent a YouTube Studióban.
8. [ ] TODO **Minden workflow-változtatás után:** futtasd a `make -C youtube-upload export` parancsot, és commitolj.

