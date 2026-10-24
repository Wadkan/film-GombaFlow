
# Áttekintő terv: YouTube-feltöltés n8n-nel (MVP)

## Alapelvek
- **A már futó n8n marad.** Egy helyi n8n fut Rancher Desktopon, az `n8n-docker/` stackből, két workflow-val és egy közös értesítő segéd-workflow-val. Nem készül második compose, és nem kerül `docker-compose.yml` a repó gyökerébe. A stackhez kell egy helyi Docker API: Rancher Desktop **moby** motorral (`docker compose` a `Makefile`-ból). Kubernetes nem kell az MVP-hez.
- **Minden webes, saját fejlesztés nélkül:**
  - a chat az n8n beépített chat-oldala,
  - a feltöltést egy n8n-űrlap indítja,
  - a metaadatot a chatben egyezteted. A `meta.md` a `meta.json` mezőiből készül.
- **A Telegram csak értesít,** bejövő üzenetet nem figyel, ezért tunnel nem kell.
- **A feltöltés mindig kézzel indul,** minden más automatikus.
- **Amit online el lehet érni, azt nem mentjük el külön.** A playlisteket a workflow mindig élőben kéri le.
- **Az end screen kézi lépés** (YouTube Studio); az implementációs / workflow-építési körön kívül, feltöltéses végigteszt nélkül. Playwright ebben a körben nincs.
- **Az n8n indítása és leállítása a meglévő Makefile-okban marad** (`make start-n8n`, `make stop-n8n`). Az export és az import a `n8n-workflows/youtube-upload/Makefile`-ban van.

## A repó tartalma

Meglévő stack, ez marad: `n8n-docker/` (`compose.yaml`, `env.example`, `Makefile`). A gyökér `Makefile` csak ide delegál.

Workflow csomag: `n8n-workflows/youtube-upload/` (csoportosítás: [`n8n-workflows/README.md`](../n8n-workflows/README.md)):

- `workflows/`: az exportált workflow-k JSON-ban.
- `scripts/`: az export és az import.
- `Makefile`: `export` és `import`.
- `config/settings.json`: az alapértelmezett mappa konténerbeli útvonala (`/data/videos`), a Telegram chat ID, az időzóna, az alapértelmezett megjelenési idő. Mac-útvonal nincs benne.
- `prompts/style.md`: a skilled, a stílusod és a SEO-szabályaid (AI-keresőkre és klasszikus keresőkre).
- `rules/rules.md`: amit az ügynök tanul, például „bringás videó → Bringa playlist”.
- `examples/meta.json` és `examples/upload-state.json`: a formátum példája. A valódi fájlokat a workflow a videómappába írja.

A videók nincsenek a repóban. Helyi mappában vannak. A `VIDEOS_ROOT` az `n8n-docker/.env`-ben van, mert a compose a mellette lévő `.env`-ből helyettesíti az útvonalat. A workflow nem olvassa a Mac-útvonalat. A titkos kulcsok is ott maradnak. Külön workflow-csomag `.env` nem kell. A valódi `.env` továbbra is az `n8n-docker/.gitignore` alatt van.

Az env változó önmagában nem teszi láthatóvá a mappát. Az `n8n` szolgáltatásra két bind mount kell: `${VIDEOS_ROOT}:/data/videos` írhatóan, és `../n8n-workflows/youtube-upload:/data/youtube-upload` írhatóan. A `runners` szolgáltatásra nincs kötet. A mappaellenőrzés, a `meta.json`, az `upload-state.json` és a `rules.md` írása csak a fő `n8n` konténer Read/Write Files node-jával megy. A Code node nem éri el a fájlrendszert. Az `N8N_RESTRICT_FILE_ACCESS_TO` értéke `/data/videos;/data/youtube-upload`, különben az n8n 2.44 csak a `~/.n8n-files` alá enged. Az `N8N_DEFAULT_BINARY_DATA_MODE=filesystem` és az `N8N_ENCRYPTION_KEY` az `n8n-docker/env.example` kiegészítése. A kulcs értéke nem új generált kulcs: a már létező `n8n-docker_n8n_data` kötet `/home/node/.n8n/config` fájljának `encryptionKey` mezője. Új kulcsot csak akkor kell generálni, ha ez a fájl még nincs. A `GENERIC_TIMEZONE=Europe/Vienna` már be van állítva.

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
1. [x] DONE **Repó alapjai, a meglévő stackhez igazítva.** Új compose nem készül. Az `n8n-docker/compose.yaml` `n8n` szolgáltatására két bind mount: `${VIDEOS_ROOT}:/data/videos` és `../n8n-workflows/youtube-upload:/data/youtube-upload`. A `runners` szolgáltatásra nincs kötet. Az `n8n-docker/env.example` kiegészítése: `VIDEOS_ROOT`, `N8N_RESTRICT_FILE_ACCESS_TO=/data/videos;/data/youtube-upload`, `N8N_DEFAULT_BINARY_DATA_MODE=filesystem`, `N8N_ENCRYPTION_KEY`. A `n8n-workflows/youtube-upload/Makefile` csak az `export` és az `import`.
2. [x] DONE **Export- és importszkript** a `n8n-workflows/youtube-upload/workflows/` mappába, a csomag `Makefile` `export` és `import` céljaival. A futó konténer a meglévő `n8n-docker` stack.
3. [x] DONE **Adatformátumok rögzítése** a `n8n-workflows/youtube-upload/` alatt: `config/settings.json`, `examples/meta.json`, `examples/upload-state.json`, `rules/rules.md`, valamint a videómappák elnevezése. A `prompts/style.md` fájl megvan, tartalma még **kitöltendő** (lásd Rád váró 6.).
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
7. [ ] TODO **Végigtesztelés egy valódi videóval,** utána `make -C n8n-workflows/youtube-upload export` és commit.

## Kockázatok
- **Ellenőrizetlen Google API-projekt:** a YouTube szabályai szerint az ilyen projektből feltöltött videók privátak maradnak, és az időzítés sem teszi őket nyilvánossá. Ezt egy ellenőrzés (audit) kérésével lehet feloldani.
- **Napi YouTube API-keret:** a keret szűkös. Egy feltöltés nagyjából 1600 egységbe kerül a napi 10 000-ből, ez kb. 6 videó naponta. Ezt az értéket érdemes a Google aktuális dokumentációjában ellenőrizni.

## Rád váró teendők

**Előkészítés összefoglaló (2026-10-24):** infra, `.env`, YouTube OAuth, Telegram, OpenRouter / n8n AI assistant **kész**. **Hátra:** `prompts/style.md` tartalom; workflow-építés (megvalósítási sorrend 4–7); export/commit workflow-k után. GCP **audit** és **end screen** nem ebben a körben.

1. [x] DONE **Rancher Desktop (MVP):** moby motor, hogy a `make start-n8n` / `docker compose` működjön. A `VIDEOS_ROOT` home alatti Mac-útvonal bind mountolható extra Rancher-beállítás nélkül. Kubernetes és külön „volume megosztás” nem része az MVP-nek.
2. [x] DONE **`n8n-docker/.env`:** `VIDEOS_ROOT` (idézőjeles útvonal, szóköz), `N8N_ENCRYPTION_KEY`, többi mező az `env.example` szerint; `n8n` konténer recreate után a mount egyezik a `.env`-vel.
3. [x] DONE **Google Cloud / YouTube (OAuth):** GCP projekt, consent, Web OAuth kliens, n8n **YouTube OAuth2 API** credential connected. Audit / nyilvános ütemezés korlát **később**. Repó: `n8n-workflows/youtube-upload/config/google-oauth.n8n.json`, `n8n-workflows/youtube-upload/docs/google-cloud-teendok.md`.
4. [x] DONE **Telegram:** BotFather token → n8n **Telegram API** credential; chat ID a `n8n-workflows/youtube-upload/config/settings.json` `telegramChatId` mezőben (token nem a repóban).
5. [x] DONE **AI:** OpenRouter API key és n8n **AI Assistant** beállítva az n8n UI-ban (metaadat-chat workflow építéshez).
6. [ ] TODO **`n8n-workflows/youtube-upload/prompts/style.md`:** skilled, csatornahang, SEO-szabályok — **következő előkészítési lépés**. A `n8n-workflows/youtube-upload/config/settings.json` alapmezői (`videosContainerPath`, `telegramChatId`, `timezone`, `defaultPublishTime`) **kész**.
7. [ ] LATER **End screen** (YouTube Studio, videónként): nem az implementációs kör feladata; feltöltéses végigteszt előtt.
8. [ ] TODO **Workflow export:** minden workflow-változtatás után `make -C n8n-workflows/youtube-upload export` (majd commit, ha kéred).

