
# Áttekintő terv: YouTube-feltöltés n8n-nel (MVP)

## Alapelvek
- **A már futó n8n marad.** Egy helyi n8n fut Rancher Desktopon, az `n8n-docker/` stackből, két workflow-val és egy közös értesítő segéd-workflow-val. Nem készül második compose, és nem kerül `docker-compose.yml` a repó gyökerébe. A stackhez kell egy helyi Docker API: Rancher Desktop **moby** motorral (`docker compose` a `Makefile`-ból). Kubernetes nem kell az MVP-hez.
- **Minden webes, saját fejlesztés nélkül:**
  - a chat az n8n beépített chat-oldala,
  - a feltöltést egy n8n-űrlap indítja,
  - a metaadat-agent indítása előtt egy n8n-űrlapon listából kiválasztod a YouTube-csatornát,
  - a kiválasztott csatorna az egész metaadat-egyeztetés kontextusa; az agent csak az ahhoz tartozó szabályokat és forrásfájlokat olvashatja,
  - a metaadatot a csatornához kötött agenttel egyezteted. Az első kimenet a videómappába írt, kézzel szerkeszthető `meta.md`, amelyből a user „kész” jelzése után készül a `meta.json`.
- **A Telegram csak értesít,** bejövő üzenetet nem figyel, ezért tunnel nem kell.
- **A feltöltés mindig kézzel indul,** minden más automatikus.
- **Git-állapot kezelése:** az n8n-ben futó agent és workflow soha nem stage-el, commitol vagy pushol. Repóbeli fájlmódosítás után rövid, néhány szavas commitüzenet-javaslatot ad a usernek, de a Git-műveletet teljes egészében a user végzi. Repón kívüli módosításnál nincs commitüzenet; a chatben kötelező röviden jelenteni a módosítás pontos PATH-ját.
  - **A csatorna metaadatai csatornánként elkülönülnek.** Minden csatorna saját `style.md` és `rules.md` fájlt tartalmaz. A további fájlok és almappák opcionálisak, csatornánként eltérhetnek; például nem minden csatornának lesz gear-listája vagy playlist-forrása. Az agent csak a kiválasztott csatorna könyvtárából és az ott ténylegesen létező, releváns fájlokból dolgozik. Feltöltéshez azonban minden csatornának kell definiált playlist-feloldási mód; MVP-ben ez kötelezően egy csatornafájlból történő feloldás. A feltöltő a jóváhagyott `meta.json` csatorna- és `playlistId` mezőjét használja.
- **Az end screen kézi lépés** (YouTube Studio); az implementációs / workflow-építési körön kívül, feltöltéses végigteszt nélkül. Playwright ebben a körben nincs.
- **Az n8n indítása és leállítása a meglévő Makefile-okban marad** (`make start-n8n`, `make stop-n8n`). Az export és az import a `n8n-workflows/youtube-upload/Makefile`-ban van.

## A repó tartalma

Meglévő stack, ez marad: `n8n-docker/` (`compose.yaml`, `env.example`, `Makefile`). A gyökér `Makefile` csak ide delegál.

Workflow csomag: `n8n-workflows/youtube-upload/` (csoportosítás: [`n8n-workflows/README.md`](../n8n-workflows/README.md)):

- `workflows/`: az exportált workflow-k JSON-ban.
- `scripts/`: az export és az import.
- `Makefile`: `export` és `import`.
- `config/settings.json`: az alapértelmezett mappa konténerbeli útvonala (`/data/videos`), a Telegram chat ID, az időzóna, az alapértelmezett megjelenési idő. Mac-útvonal nincs benne.
- `config/channels.json`: a választható YouTube-csatornák regisztere. Minden bejegyzés tartalmazza a stabil csatornaazonosítót, a megjelenítendő nevet, az OAuth-credential kulcsát, a csatorna-forráskönyvtár relatív útvonalát, a playlist-feloldási módot és az adott csatornához ténylegesen betöltendő `sourceFiles` listát. A közös, minden meta-agenthez betöltendő fájlokat a gyökérszintű `commonSkills` lista tartalmazza; ezek konténerbeli abszolút útvonalak.
- `channels/<ChannelName>/style.md`: az adott csatorna kötelező stílus-, SEO- és metaadat-szabályai.
- `channels/<ChannelName>/rules.md`: az adott csatorna kötelező tanult szabályai.
- `channels/<ChannelName>/`: további csatornaspecifikus fájlok és almappák szabadon, csak akkor, ha az adott csatornának szüksége van rájuk. Például a gear-list és playlist-forrás opcionális.
- `examples/meta.json` és `examples/upload-state.json`: a formátum példája. A valódi fájlokat a workflow a videómappába írja.

A videók nincsenek a repóban. Helyi mappában vannak. A `VIDEOS_ROOT` az `n8n-docker/.env`-ben van, mert a compose a mellette lévő `.env`-ből helyettesíti az útvonalat. A workflow nem olvassa a Mac-útvonalat. A titkos kulcsok is ott maradnak. Külön workflow-csomag `.env` nem kell. A valódi `.env` továbbra is az `n8n-docker/.gitignore` alatt van.

Az env változó önmagában nem teszi láthatóvá a mappát. Az `n8n` szolgáltatásra három bind mount kell: `${VIDEOS_ROOT}:/data/videos` írhatóan, `../n8n-workflows/youtube-upload:/data/youtube-upload` írhatóan és `../n8n-workflows/common-skills:/data/common-skills:ro`. A `runners` szolgáltatásra nincs kötet. A mappaellenőrzés, a `meta.json`, az `upload-state.json` és a csatornaszabályok (`rules.md`) írása csak a fő `n8n` konténer Read/Write Files node-jával megy. A Code node nem éri el a fájlrendszert. A közös skill csak olvasható. A szabályfrissítés csak a kiválasztott csatorna `rules.md` fájljára korlátozható, és a workflow-nak a meglévő tartalmat kell visszaolvasnia, módosítania, majd teljes fájlként visszaírnia. Az `N8N_RESTRICT_FILE_ACCESS_TO` értéke `/data/videos;/data/youtube-upload;/data/common-skills`, különben az n8n 2.44 csak a `~/.n8n-files` alá enged. Az `N8N_DEFAULT_BINARY_DATA_MODE=filesystem` és az `N8N_ENCRYPTION_KEY` az `n8n-docker/env.example` kiegészítése. A kulcs értéke nem új generált kulcs: a már létező `n8n-docker_n8n_data` kötet `/home/node/.n8n/config` fájljának `encryptionKey` mezője. Új kulcsot csak akkor kell generálni, ha ez a fájl még nincs. A `GENERIC_TIMEZONE=Europe/Vienna` már be van állítva.

## Egy videó mappája
`YYYY-MM-DD_videonev/`, benne:
- `video.mp4` és `thumbnail.jpg`
- `meta.md`: a meta-agent első kimenete, kézzel szerkeszthető előnézet. A user módosításai a „kész” jelzésig elsődlegesek.
- `meta.json`: ezt az ügynök írja a user „kész” jelzése után, rögzített mezőkkel, csak ebbe az almappába: `/data/videos/YYYY-MM-DD_videonev/meta.json`. A `/data/videos/meta.json` útvonal érvénytelen. A `status` értéke `draft`, és csak minden kötelező mező kitöltése, minden bizonytalanság tisztázása és a user egyértelmű jóváhagyása után lehet `ready`. Mezők: `status`, `channelKey`, `youtubeChannelId`, cím, leírás, címkék, `playlistId`, `youtube_scheduled_at`. A `meta.md` playlistnevet tartalmaz; a `meta.json` csak a kiválasztott csatorna playlist-feloldási forrásából származó ID-t tartalmaz. A `youtube_scheduled_at` eltolásos idő, például `2026-10-24T18:00:00+02:00`.
- `upload-state.json`: ezt csak a feltöltő írja.
  - `status`: `uploading`, `uploaded` vagy `failed`
  - `steps`: lépésenkénti állapot
  - `videoId` és `videoUrl`
  - `startedAt`: az `uploading` állapot kezdete
  - `uploadedAt`: pontos időbélyeg
  - `attempts` és `error`
  - Nincs háttérfigyelő. A következő kézi indításkor a friss `uploading` kimarad a választásból: ha a `startedAt` a választott határon belül van, a workflow nem nyúl hozzá. Ha a `startedAt` régebbi ennél a határnál, `failed`-nek veszi, és a meglévő `videoId` alapján csak a hiányzó lépéseket futtatja.

## Megvalósítási sorrend
1. [x] DONE **Repó alapjai, a meglévő stackhez igazítva.** Új compose nem készül. Az `n8n-docker/compose.yaml` `n8n` szolgáltatására három bind mount: `${VIDEOS_ROOT}:/data/videos`, `../n8n-workflows/youtube-upload:/data/youtube-upload` és `../n8n-workflows/common-skills:/data/common-skills:ro`. A `runners` szolgáltatásra nincs kötet. Az `n8n-docker/env.example` kiegészítése: `VIDEOS_ROOT`, `N8N_RESTRICT_FILE_ACCESS_TO=/data/videos;/data/youtube-upload;/data/common-skills`, `N8N_DEFAULT_BINARY_DATA_MODE=filesystem`, `N8N_ENCRYPTION_KEY`. A `n8n-workflows/youtube-upload/Makefile` csak az `export` és az `import`.
2. [x] DONE **Export- és importszkript** a `n8n-workflows/youtube-upload/workflows/` mappába, a csomag `Makefile` `export` és `import` céljaival. A futó konténer a meglévő `n8n-docker` stack.
3. [x] DONE **Alap adatformátumok rögzítése** a `n8n-workflows/youtube-upload/` alatt: `config/settings.json`, `config/channels.json`, `examples/meta.json`, `examples/upload-state.json`, valamint a videómappák elnevezése. A csatornaspecifikus metaadat-források a `channels/<ChannelName>/` könyvtárban vannak; csak a csatornaválasztó és a workflow-integráció maradt TODO.
4. [ ] TODO **Telegram értesítő segéd-workflow,** amit a többi workflow meghív.
5. [ ] TODO **Egy közös feltöltő workflow** (előbb érdemes megépíteni, mert egy kézzel írt `meta.json`-nal jól tesztelhető; a feltöltő workflow nem csatornánként duplikálódik):
   1. [ ] TODO Az első űrlapoldal csak az indítás. Nincs előre kitöltött mappa. A következő node a `settings.json`-ból olvassa a `/data/videos` útvonalat.
   2. [ ] TODO Read/Write Files node ellenőrzi, hogy a konténerbeli mappa létezik.
   3. [ ] TODO Megkeresi a feltölthető videókat: ahol a `meta.json` státusza `ready`, és az `upload-state.json` hiányzik, `failed`, vagy a határon túli `uploading`. A határon belüli `uploading` kimarad. A határon túli `uploading` állapotot előbb `failed`-re írja. Ha egy jelölt van, rögtön indul. Ha több, a második űrlapoldalon kifejezéssel töltött legördülő listából választasz.
   4. [ ] TODO A `meta.json` `channelKey` és `youtubeChannelId` mezője alapján feloldja és kiválasztja a registryben megadott OAuth-credentialt, ellenőrzi, hogy a credential az elvárt YouTube-csatornához tartozik, és csak sikeres ellenőrzés után folytatja a feltöltést.
   5. [ ] TODO Egyetlen videófeltöltési lépésben feltölti a videót privátként, az eltolásos `youtube_scheduled_at` időpontra időzítve.
   6. [ ] TODO Beállítja a thumbnailt egy HTTP Request node-dal.
   7. [ ] TODO Hozzáadja a videót a `meta.json`-ban már mentett `playlistId` alapján; playlistnév → ID feloldás itt már nem történik.
   8. [ ] TODO Minden lépés után menti az állapotot, az `uploading` kezdetén a `startedAt` mezővel. Újraindításkor a `videoId` alapján csak a hiányzó lépéseket futtatja.
   9. [ ] TODO Telegramon jelzi, hol tart. A végén elküldi a linket, és emlékeztet az end screenre a Studio-linkkel. Hiba esetén megírja, mi és melyik lépésnél romlott el.
6. [ ] TODO **Egy csatorna-aware metaadat-chat workflow:**
   1. [ ] TODO A közös belépési űrlapon listából kiválasztod a YouTube-csatornát a meta-agent hívása előtt, majd megadod a `YYYY-MM-DD_videonev` almappát. A workflow létrehoz egy session kulcsot `${channelKey}:${videoFolder}` formában, ezt adja át a chat memóriájának és minden fájlíró lépésnek; más csatorna vagy más videómappa sessionje nem keveredhet bele.
   2. [ ] TODO A workflow a `config/channels.json` alapján feloldja a kiválasztott csatorna könyvtárát, és csak az adott bejegyzés `sourceFiles` listájában szereplő, ténylegesen létező fájlokat tölti be. Más csatorna kontextusa nem kerülhet az agent promptjába.
   3. [ ] TODO A workflow a registry gyökérszintű `commonSkills` listájában szereplő közös fájlokat is betölti minden meta-agent futásnál. MVP-ben ez a `/data/common-skills/walk.md`; a protokollt nem kell csatornánként vagy workflow-nként lemásolni.
   4. [ ] TODO Read/Write Files node ellenőrzi, hogy a `/data/videos/YYYY-MM-DD_videonev/` létezik és van benne `video.mp4`. Ez a mappa minden `meta.md` és `meta.json` írás célja.
   5. [ ] TODO Az agent a metaadatokat elsőként ugyanabba a videómappába írt `meta.md` fájlba állítja elő. A `meta.md` playlistnevet tartalmaz, nem playlist ID-t, és a user kézzel szerkesztheti.
   6. [ ] TODO Minden chatbeli átírás előtt visszaolvassa az aktuális `meta.md`-t, így a user kézi módosításai nem vesznek el. Ha már létezik `ready` állapotú `meta.json`, az új szerkesztés kezdetén `draft` állapotúra állítja, és törli vagy érvényteleníti a korábbi feltölthetőséget.
   7. [ ] TODO Ha a user nem ad playlistet, az agent javasol a kiválasztott csatorna playlistjei közül. Ha a választás nem egyértelmű, egyeztet, és addig nem lép tovább, amíg a playlist, az időzítés és minden más kötelező mező tiszta.
   8. [ ] TODO Short/portré videóhoz csak `SHORT` nevű playlist, long videóhoz csak `SHORT` nélküli playlist választható.
   9. [ ] TODO MVP-ben a `ready` állapothoz kötelező egy registryben deklarált, ténylegesen létező playlist-forrásfájl. Playlist-forrás nélküli csatorna legfeljebb `draft` metaadatot készíthet; `ready` és feltöltés csak későbbi, külön definiált live/API playlist-feloldóval engedélyezhető.
   10. [ ] TODO A user „kész” jelzése után a workflow visszaolvassa az aktuális `meta.md`-t, a deklarált playlist-forrásból a playlistnévhez feloldja a `playlistId`-t, és ugyanabba a videómappába írja a `meta.json`-t `draft` státusszal, a `channelKey` és `youtubeChannelId` mezőkkel együtt.
   11. [ ] TODO Ellenőrzi a kötelező mezőket, a csatornaazonosítót és az OAuth-credential csatornaegyezését, és csak teljesen kitöltött, egyértelműen jóváhagyott metaadat esetén állítja a `meta.json`-t `ready` állapotúra.
   12. [ ] TODO Ha új szabályt mondasz, a n8n-ben futó agent a kiválasztott csatorna `rules.md` fájlját csak a fő workflow Read/Write Files node-ján keresztül módosíthatja: visszaolvassa, módosítja, validálja, majd visszaírja. Az agent közvetlenül nem írhat tetszőleges repófájlba, és a szabály legközelebb csak az adott csatornához használható.
7. [ ] TODO **Végigtesztelés egy valódi videóval,** utána `make -C n8n-workflows/youtube-upload export` és commit.

## Kockázatok
- **Ellenőrizetlen Google API-projekt:** a YouTube szabályai szerint az ilyen projektből feltöltött videók privátak maradnak, és az időzítés sem teszi őket nyilvánossá. Ezt egy ellenőrzés (audit) kérésével lehet feloldani.
- **Napi YouTube API-keret:** a keret szűkös. Egy feltöltés nagyjából 1600 egységbe kerül a napi 10 000-ből, ez kb. 6 videó naponta. Ezt az értéket érdemes a Google aktuális dokumentációjában ellenőrizni.

## Rád váró teendők

**Előkészítés összefoglaló (2026-10-24):** infra, `.env`, YouTube OAuth, Telegram, OpenRouter / n8n AI assistant, a FreezWithMe csatorna-forrásstruktúrája és a `config/channels.json` registry **kész**. **Hátra:** a csatornaválasztó, a channel-aware metaadat-workflow, a közös feltöltő workflow és a végigteszt; export/commit workflow-k után. GCP **audit** és **end screen** nem ebben a körben.

1. [x] DONE **Rancher Desktop (MVP):** moby motor, hogy a `make start-n8n` / `docker compose` működjön. A `VIDEOS_ROOT` home alatti Mac-útvonal bind mountolható extra Rancher-beállítás nélkül. Kubernetes és külön „volume megosztás” nem része az MVP-nek.
2. [x] DONE **`n8n-docker/.env`:** `VIDEOS_ROOT` (idézőjeles útvonal, szóköz), `N8N_ENCRYPTION_KEY`, többi mező az `env.example` szerint; `n8n` konténer recreate után a mount egyezik a `.env`-vel.
3. [x] DONE **Google Cloud / YouTube (OAuth):** GCP projekt, consent, Web OAuth kliens, n8n **YouTube OAuth2 API** credential connected. Audit / nyilvános ütemezés korlát **később**. Repó: `n8n-workflows/youtube-upload/config/google-oauth.n8n.json`, `n8n-workflows/youtube-upload/docs/google-cloud-teendok.md`.
4. [x] DONE **Telegram:** BotFather token → n8n **Telegram API** credential; chat ID a `n8n-workflows/youtube-upload/config/settings.json` `telegramChatId` mezőben (token nem a repóban).
5. [x] DONE **AI:** OpenRouter API key és n8n **AI Assistant** beállítva az n8n UI-ban (metaadat-chat workflow építéshez).
6. [x] DONE **Csatorna-források:** a struktúra `channels/FreezWithMe/style.md`, `rules.md`, valamint a csatorna által igényelt opcionális fájlok. A `channels/` rename a munkafában ellenőrizve.
7. [ ] TODO **Csatornaválasztó az agent indítása előtt:** n8n űrlapon listából választható csatorna. A választás alapján a metaadat-chat egyetlen közös workflow-ja a megfelelő csatorna-forráskönyvtárat tölti be, és a kiválasztott csatorna azonosítóját végig továbbadja a metaadat- és fájlírási lépéseknek. Ha a beépített chat-oldalon nincs előzetes választó, az n8n Form Trigger legyen a belépési pont, amely ezután nyitja vagy indítja a chat-folyamatot.
8. [ ] TODO **`style.md` és csatornaszabályok véglegesítése:** az agent a kiválasztott csatorna kötelező `style.md` és `rules.md` fájljából, valamint csak a ténylegesen létező opcionális forrásokból dolgozik; más csatorna szabályait nem használhatja.
9. [ ] LATER **End screen** (YouTube Studio, videónként): nem az implementációs kör feladata; feltöltéses végigteszt előtt.
10. [ ] TODO **Workflow export:** minden workflow-változtatás után `make -C n8n-workflows/youtube-upload export` (majd commit, ha kéred).

