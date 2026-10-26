
# Áttekintő terv: YouTube-feltöltés n8n-nel (MVP)

> **Történeti terv:** a metaadat-chat n8n workflow-k kivezetése folyamatban van.
> A metaadatok egyeztetése és a `meta.md` / `meta.json` létrehozása
> most közvetlenül chatben történik; az agent aktuális szabályait lásd
> [`local-workflows/youtube-meta-update/channels/FreezWithMe/youtube-metadata-workflow.md`](../local-workflows/youtube-meta-update/channels/FreezWithMe/youtube-metadata-workflow.md).
> A további útvonalak az eredeti n8n MVP terv korabeli hivatkozásai.
> Az alábbi részletek az eredeti n8n MVP tervet dokumentálják, nem aktív
> végrehajtási listát.

## Alapelvek
- **A már futó n8n marad.** Egy helyi n8n fut Rancher Desktopon, az `n8n-docker/` stackből, két workflow-val és egy közös értesítő segéd-workflow-val. Nem készül második compose, és nem kerül `docker-compose.yml` a repó gyökerébe. A stackhez kell egy helyi Docker API: Rancher Desktop **moby** motorral (`docker compose` a `Makefile`-ból). Kubernetes nem kell az MVP-hez.
- **Webes használat:**
  - a chat az n8n beépített chat-oldala,
  - a feltöltést egy n8n-űrlap indítja,
  - a metaadat-agent belépése a jóváhagyott, n8n Webhook által kiszolgált egyszerű webes űrlap: csatorna- és videómappa-dropdown, külön indítóképernyő nélkül,
  - a kiválasztott csatorna az egész metaadat-egyeztetés kontextusa; az agent csak az ahhoz tartozó szabályokat és forrásfájlokat olvashatja,
  - a metaadatot a csatornához kötött agenttel egyezteted. Az első kimenet a videómappába írt, kézzel szerkeszthető `meta.md`, amelyből a user „kész” jelzése után készül a `meta.json`.
- **A Telegram csak értesít,** bejövő üzenetet nem figyel, ezért tunnel nem kell.
- **A feltöltés mindig kézzel indul,** minden más automatikus.
- **Git-állapot kezelése:** az n8n-ben futó agent és workflow soha nem stage-el, commitol vagy pushol. Repóbeli fájlmódosítás után rövid, néhány szavas commitüzenet-javaslatot ad a usernek, de a Git-műveletet teljes egészében a user végzi. Repón kívüli módosításnál nincs commitüzenet; a chatben kötelező röviden jelenteni a módosítás pontos PATH-ját.
- **Szűk automatizált tesztelés:** csak két teljes flow E2E alapellenőrzése készül `pytest`-tel; nincs unit teszt, külön meta-contract tesztcsomag vagy részletes esetmátrix. A cél annak ellenőrzése, hogy az elkészített workflow-k működnek. A paraméter nélküli gyökérszintű `make test` ezeket futtatja, valódi YouTube-feltöltés és valódi Telegram-küldés nélkül.
- **Tesztelési biztonság:** a `make test` soha nem indít és nem buildel Docker konténert. Csak a már kézzel elindított környezethez csatlakozhat. A tesztek semmilyen valódi videó-, metaadat-, repo- vagy Git-fájlt nem módosíthatnak; kizárólag izolált ideiglenes fixture-t használhatnak. Hiányzó vagy nem futó előfeltételnél a teszt egyértelműen kiírja, pontosan mi hiányzik és milyen kézi parancs szükséges, majd hibával leáll. A valódi adatokkal és szolgáltatásokkal végzett tesztek külön kézi körbe tartoznak.
  - **A csatorna metaadatai csatornánként elkülönülnek.** Minden csatorna saját `youtube-metadata-workflow.md` és `rules.md` fájlt tartalmaz. A további fájlok és almappák opcionálisak, csatornánként eltérhetnek; például nem minden csatornának lesz gear-listája vagy playlist-forrása. Az agent csak a kiválasztott csatorna könyvtárából és az ott ténylegesen létező, releváns fájlokból dolgozik. Feltöltéshez azonban minden csatornának kell definiált playlist-feloldási mód; MVP-ben ez kötelezően egy csatornafájlból történő feloldás. A feltöltő a jóváhagyott `meta.json` csatorna- és `playlistId` mezőjét használja.
- **A valódi feltöltéses teszt és az end screen kézi lépés:** az implementációs sorrenden kívül, a külön tesztelési blokk szerint. Az end screen feltöltés után, a YouTube Studióban állítható be. Playwright ebben a körben nincs.
- **Az n8n indítása és leállítása a meglévő Makefile-okban marad** (`make start-n8n`, `make stop-n8n`). Az export és az import a `n8n-workflows/youtube-upload/Makefile`-ban van.

## A repó tartalma

Meglévő stack, ez marad: `n8n-docker/` (`compose.yaml`, `env.example`, `Makefile`). A gyökér `Makefile` az indítást és leállítást ide delegálja; a tervezett `test` cél a két E2E-t futtatja.

Workflow csomag: `n8n-workflows/youtube-upload/` (csoportosítás: [`n8n-workflows/README.md`](../n8n-workflows/README.md)):

- `workflows/`: az exportált workflow-k JSON-ban.
- `scripts/`: az export és az import.
- `Makefile`: `export` és `import`.
- `config/settings.json`: az alapértelmezett mappa konténerbeli útvonala (`/data/videos`), a Telegram chat ID, az időzóna, az alapértelmezett megjelenési idő. Mac-útvonal nincs benne.
- `config/channels.json`: a választható YouTube-csatornák regisztere. Minden bejegyzés tartalmazza a stabil csatornaazonosítót, a megjelenítendő nevet, az OAuth-credential kulcsát, a csatorna-forráskönyvtár relatív útvonalát, a playlist-feloldási módot és az adott csatornához ténylegesen betöltendő `sourceFiles` listát.
- `channels/<ChannelName>/youtube-metadata-workflow.md`: az adott csatorna fő utasításfájlja a metaadatok elkészítéséhez és YouTube-ra frissítéséhez; minden csatornamappában ezen a fix néven szerepel.
- `channels/<ChannelName>/rules.md`: az adott csatorna kötelező tanult szabályai.
- `channels/<ChannelName>/`: további csatornaspecifikus fájlok és almappák szabadon, csak akkor, ha az adott csatornának szüksége van rájuk. Például a gear-list és playlist-forrás opcionális.
- `examples/meta.json` és `examples/upload-state.json`: a formátum példája. A valódi fájlokat a workflow a videómappába írja.

A videók nincsenek a repóban. Helyi mappában vannak. A `VIDEOS_ROOT` az `n8n-docker/.env`-ben van, mert a compose a mellette lévő `.env`-ből helyettesíti az útvonalat. A workflow nem olvassa a Mac-útvonalat. A titkos kulcsok is ott maradnak. Külön workflow-csomag `.env` nem kell. A valódi `.env` továbbra is az `n8n-docker/.gitignore` alatt van.

Az env változó önmagában nem teszi láthatóvá a mappát. Az `n8n` szolgáltatásra két bind mount kell: `${VIDEOS_ROOT}:/data/videos` írhatóan és `../n8n-workflows/youtube-upload:/data/youtube-upload` írhatóan. A `runners` szolgáltatásra nincs kötet. A mappaellenőrzés, a `meta.json`, az `upload-state.json` és a csatornaszabályok (`rules.md`) írása csak a fő `n8n` konténer Read/Write Files node-jával megy. A Code node nem éri el a fájlrendszert. A szabályfrissítés csak a kiválasztott csatorna `rules.md` fájljára korlátozható, és a workflow-nak a meglévő tartalmat kell visszaolvasnia, módosítania, majd teljes fájlként visszaírnia. Az `N8N_RESTRICT_FILE_ACCESS_TO` értéke `/data/videos;/data/youtube-upload`, különben az n8n 2.44 csak a `~/.n8n-files` alá enged. Az `N8N_DEFAULT_BINARY_DATA_MODE=filesystem` és az `N8N_ENCRYPTION_KEY` az `n8n-docker/env.example` kiegészítése. A kulcs értéke nem új generált kulcs: a már létező `n8n-docker_n8n_data` kötet `/home/node/.n8n/config` fájljának `encryptionKey` mezője. Új kulcsot csak akkor kell generálni, ha ez a fájl még nincs. A `GENERIC_TIMEZONE=Europe/Vienna` már be van állítva.

## Egy videó mappája
`YYYY-MM-DD_videonev/`, benne:
- egy feltölthető videófájl bármilyen támogatott videoformátumban és `thumbnail.jpg`
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

## Megvalósítandó elemek

Az alábbi számozás követelményhivatkozás; a nyitott munkák tényleges sorrendjét és felelősét a következő blokk rögzíti. A DONE jelölések a korábban elkészült alapokat jelzik.

1. [x] DONE **Repó alapjai, a meglévő stackhez igazítva.** Új compose nem készül. Az `n8n-docker/compose.yaml` `n8n` szolgáltatására két bind mount: `${VIDEOS_ROOT}:/data/videos` és `../n8n-workflows/youtube-upload:/data/youtube-upload`. A `runners` szolgáltatásra nincs kötet. Az `n8n-docker/env.example` kiegészítése: `VIDEOS_ROOT`, `N8N_RESTRICT_FILE_ACCESS_TO=/data/videos;/data/youtube-upload`, `N8N_DEFAULT_BINARY_DATA_MODE=filesystem`, `N8N_ENCRYPTION_KEY`. A `n8n-workflows/youtube-upload/Makefile` csak az `export` és az `import`.
2. [x] DONE **Export- és importszkript** a `n8n-workflows/youtube-upload/workflows/` mappába, a csomag `Makefile` `export` és `import` céljaival. A futó konténer a meglévő `n8n-docker` stack.
3. [x] DONE **Alap adatformátumok rögzítése** a `n8n-workflows/youtube-upload/` alatt: `config/settings.json`, `config/channels.json`, `examples/meta.json`, `examples/upload-state.json`, valamint a videómappák elnevezése. A csatornaspecifikus metaadat-források a `channels/<ChannelName>/` könyvtárban vannak; a csatornaválasztó és a metaadat-chat belépése elkészült, a további workflow-integráció TODO.
4. [ ] TODO **Telegram értesítő segéd-workflow,** amit a többi workflow meghív.
5. [ ] TODO **Egy csatorna-aware metaadat-chat workflow:**
   1. [x] DONE A belépési weboldal azonnal megjeleníti a két dropdown-mezőt: az engedélyezett csatornákat a `config/channels.json` alapján, a videómappákat a `/data/videos` közvetlen almappáiból. Nem ellenőrzi a mappák elnevezését, és nem olvas videómappán belüli fájlokat. A Tovább gomb csak mindkét választás után aktív; a workflow továbbadja a `channelKey` és `videoFolder` értékét. Belépés: `http://localhost:5678/webhook/youtube-meta`. Böngészőben és user által is igazolt.
      - [x] DONE A kiválasztott `channelKey` és `videoFolder` metadata-ként jut el a Chat Triggerhez. A Simple Memory kulcsa `${channelKey}:${videoFolder}`, így más csatorna vagy videómappa memóriája nem keveredik bele. A később elkészülő fájlíró lépéseknek is ezt kell használniuk.
   2. [x] DONE Minden chatüzenet előtt a workflow a session `channelKey` értékével feloldja az aktív csatornát a `config/channels.json`-ból, és csak annak `sourceFiles` listáját olvassa be a ténylegesen létező fájlok közül. A fájlok tartalma az AI Agent system promptjába kerül; más csatorna fájljai nem töltődnek be.

   5. [ ] TODO Az agent a metaadatokat elsőként ugyanabba a videómappába írt `meta.md` fájlba állítja elő. A `meta.md` playlistnevet tartalmaz, nem playlist ID-t, és a user kézzel szerkesztheti.
   6. [ ] TODO Minden chatbeli átírás előtt visszaolvassa az aktuális `meta.md`-t, így a user kézi módosításai nem vesznek el. Ha már létezik `ready` állapotú `meta.json`, az új szerkesztés kezdetén `draft` állapotúra állítja, és törli vagy érvényteleníti a korábbi feltölthetőséget.
   
   7. [ ] TODO Ha a user nem ad playlistet, az agent javasol a kiválasztott csatorna playlistjei közül. Ha a választás nem egyértelmű, egyeztet, és addig nem lép tovább, amíg a playlist, az időzítés és minden más kötelező mező tiszta.
   8. [ ] TODO Short/portré videóhoz csak `SHORT` nevű playlist, long videóhoz csak `SHORT` nélküli playlist választható.
   9. [ ] TODO MVP-ben a `ready` állapothoz kötelező egy registryben deklarált, ténylegesen létező playlist-forrásfájl. Playlist-forrás nélküli csatorna legfeljebb `draft` metaadatot készíthet; `ready` és feltöltés csak későbbi, külön definiált live/API playlist-feloldóval engedélyezhető.
   
   10. [ ] TODO A user „kész” jelzése után a workflow visszaolvassa az aktuális `meta.md`-t, a deklarált playlist-forrásból a playlistnévhez feloldja a `playlistId`-t, és ugyanabba a videómappába írja a `meta.json`-t `draft` státusszal, a `channelKey` és `youtubeChannelId` mezőkkel együtt.
   11. [ ] TODO Ellenőrzi a kötelező mezőket, a csatornaazonosítót és az OAuth-credential csatornaegyezését, és csak teljesen kitöltött, egyértelműen jóváhagyott metaadat esetén állítja a `meta.json`-t `ready` állapotúra.
   
   12. [ ] TODO Ha új szabályt mondasz, a n8n-ben futó agent a kiválasztott csatorna `rules.md` fájlját csak a fő workflow Read/Write Files node-ján keresztül módosíthatja: visszaolvassa, módosítja, validálja, majd visszaírja. Az agent közvetlenül nem írhat tetszőleges repófájlba, és a szabály legközelebb csak az adott csatornához használható.
6. [ ] TODO **Egy közös feltöltő workflow** (előbb érdemes megépíteni, mert egy kézzel írt `meta.json`-nal jól tesztelhető; a feltöltő workflow nem csatornánként duplikálódik):
   1. [ ] TODO Read/Write Files node ellenőrzi, hogy a `/data/videos/YYYY-MM-DD_videonev/` létezik, és videóformátumú fájlt keres benne; fájlnév nem hardcode-olható. Találat nélkül megáll, egy találatot használ, több találatnál választást kér. Ez a mappa minden `meta.md` és `meta.json` írás célja.
   2. [ ] TODO Read/Write Files node ellenőrzi, hogy a konténerbeli mappa létezik.
   3. [ ] TODO Megkeresi a feltölthető videókat: ahol a `meta.json` státusza `ready`, és az `upload-state.json` hiányzik, `failed`, vagy a határon túli `uploading`. A határon belüli `uploading` kimarad. A határon túli `uploading` állapotot előbb `failed`-re írja. Ha egy jelölt van, rögtön indul. Ha több, a második űrlapoldalon kifejezéssel töltött legördülő listából választasz.
   4. [ ] TODO A `meta.json` `channelKey` és `youtubeChannelId` mezője alapján feloldja és kiválasztja a registryben megadott OAuth-credentialt, ellenőrzi, hogy a credential az elvárt YouTube-csatornához tartozik, és csak sikeres ellenőrzés után folytatja a feltöltést.
   
   5. [ ] TODO Egyetlen videófeltöltési lépésben feltölti a videót privátként, az eltolásos `youtube_scheduled_at` időpontra időzítve.
   6. [ ] TODO Beállítja a thumbnailt egy HTTP Request node-dal.
   7. [ ] TODO Hozzáadja a videót a `meta.json`-ban már mentett `playlistId` alapján; playlistnév → ID feloldás itt már nem történik.
   8. [ ] TODO Minden lépés után menti az állapotot, az `uploading` kezdetén a `startedAt` mezővel. Újraindításkor a `videoId` alapján csak a hiányzó lépéseket futtatja.
   9. [ ] TODO Telegramon jelzi, hol tart. A végén elküldi a linket, és emlékeztet az end screenre a Studio-linkkel. Hiba esetén megírja, mi és melyik lépésnél romlott el.

## Végrehajtási sorrend és agentfelelősök

**Munkamegosztás:** a **lokális agent** a repóbeli konfigurációkat, forrásdokumentumokat, példákat, Makefile-t, tesztfuttatót és workflow-exportot kezeli. Az **n8n agent** az n8n felületén építi és köti össze a node-okat, a credentialöket és a workflow-kat. Az n8n agent itt a workflow-építő assistant; a megépítendő metaadat-chat futásidejű agentje ettől külön szerep.

Egy fázis az előző lezárása után indul. Egy workflow üzleti folyamata a hozzá tartozó fájlírással, hibakezeléssel és értesítéssel együtt készül el; ezek nem maradnak későbbi, másik flow utáni körre.

### 1. Közös előfeltételek és átadási szerződés

- [ ] TODO **Lokális agent:** a meglévő `settings.json`, `channels.json` és példák alapján rögzíti a két workflow közös bemenetét és kimenetét. Pótolja a még hiányzó, kézzel szerkeszthető `meta.md` mintát és annak egyértelmű mezőformátumát; rögzíti a playlistnév feloldását és a `draft` → `ready` jóváhagyási feltételeit. Ez nem külön parseralkalmazás vagy új szolgáltatás.
- [ ] TODO **Lokális agent:** a feltöltő elkészítése előtt rögzíti a régi `uploading` állapot határát és konfigurációs mezőjét, valamint a hiányzó vagy hibás `startedAt` kezelését. A határ konkrét értékét egyeztetni kell; ezt az agent nem találja ki. Rögzíti azt is, hogy bizonytalan kimenetelű videófeltöltésnél, mentett `videoId` nélkül ne induljon vakon új feltöltés.
- [ ] TODO **n8n agent:** még a teljes workflow-k megépítése előtt tisztázza a futó n8n-ben az `oauthCredentialKey` → tényleges credential hozzárendelését és a csatornaegyezés ellenőrzésének módját, amelyet mindkét workflow használ. Az egy közös feltöltő követelménye megmarad; dinamikus credential-választást nem szabad ellenőrzés nélkül adottnak venni. Token vagy titkos kulcs nem kerül a registrybe vagy exportba.
- [x] DONE **n8n agent:** a Webhook-űrlap `channelKey` és `videoFolder` kimenete a beépített Chathez kötve van `${channelKey}:${videoFolder}` sessionnel. A futásidejű modell `deepseek/deepseek-chat`; az OpenRouter credential a workflow projektjében elérhető. Ezt az Assistant builder beállításától külön ellenőriztük.
- [ ] TODO **Lokális agent, az n8n agenttel egyeztetve:** rögzíti a két E2E futtatási módját: az elkészített workflow-k izolált tesztpéldánya, ideiglenes fájlok, helyettesített LLM/YouTube/Telegram-válaszok. A teszt a tényleges node-láncot járja végig, nem annak Pythonban újraírt másolatát. A host oldali segéd- és fixture-fájlok `/tmp` alatt legyenek; a fő n8n konténerből való elérésüket előre rendezni kell, a valódi videos és repo fájlok írása nélkül. A runners szolgáltatás nem kap fájlrendszer-hozzáférést.
- **Lezárás feltétele:** a fájlformátum, a credential-hozzárendelés, a Form → Chat kapcsolat és a biztonságos E2E futtatási mód egyértelmű. A technikai vagy termékdöntést igénylő eltéréseknél egyeztetés szükséges, az érintett építés addig nem indul.

### 2. Telegram értesítő teljes segéd-flow — n8n agent

- [ ] TODO A 4. követelménypontot egyben elkészíti: meghívás más workflow-ból → üzenet és cél feloldása → Telegram-küldés → eredmény vagy küldési hiba visszaadása. A chat ID a `settings.json`-ból, a token az n8n credentialből jön.
- [ ] TODO Az értesítési hiba ne indítsa újra a videófeltöltést, és ne írja felül a már mentett feltöltési eredményt.
- **Előfeltétel:** 1. fázis, meglévő Telegram credential és chat ID.
- **Átadás a lokális agentnek:** a kész segéd-workflow azonosítója, bemenete és kimenete; export a meglévő paranccsal. Külön automatizált Telegram-teszt nem készül: ezt a feltöltő E2E-je érinti.

### 3. Közös feltöltő teljes flow — n8n agent

- [ ] TODO Az 5. követelménypont összes elemét egyben építi meg: indítóűrlap → settings és mappák beolvasása → feltölthető videó kiválasztása → metaadat- és csatornaellenőrzés → `uploading` mentése → privát/időzített videófeltöltés → azonnali `videoId`-mentés → thumbnail → playlist → `uploaded` és link → Telegram.
- [ ] TODO Ebben a fázisban készül el a lépésenkénti állapotmentés, a `failed` ág és a folytatás is. A friss `uploading` kimarad; a lejárt állapot kezelése az 1. fázisban rögzített szabályt követi. Mentett `videoId` esetén csak a hiányzó lépések futnak. Nulla jelölt esetén érthetően lezár, több jelöltnél a választóűrlapot használja.
- **Előfeltétel:** 1–2. fázis. A metaadat-chat még nem szükséges: a bemenet a rögzített szerződés szerinti, kézzel előkészített fixture `ready` metaadat.
- **Átadás a lokális agentnek:** kész feltöltő és értesítő kapcsolata, tesztelhető belépés, állapotfájlok és credential-hozzárendelés; valódi feltöltés ekkor nem indul.

### 4. Feltöltő lezárása és minimális E2E — lokális agent

- [ ] TODO Exportálja a kész workflow-kat a `make -C n8n-workflows/youtube-upload export` paranccsal; ellenőrzi az exportban a workflow-k közötti hivatkozásokat és azt, hogy titkos credentialérték nincs benne.
- [ ] TODO Elkészíti a gyökérszintű `make test` belépést és a tesztelési blokkban leírt egy feltöltő E2E-t. A Docker/mount/forrás-előfeltételek ellenőrzése ennek része, nem külön tesztcsomag. A csomag saját Makefile-ja továbbra is csak `export` és `import` célokat kap.
- **Előfeltétel:** 3. fázis, már kézzel elindított n8n és az 1. fázisban rögzített izolált tesztelérési mód.
- **Lezárás feltétele:** az exportált feltöltő teljes flow-ja átmegy az alapellenőrzésen. Workflow-hibát az n8n agent, tesztfuttató- vagy repóhibát a lokális agent javít ugyanebben a fázisban; csak ezután kezdődik a metaadat-chat.

### 5. Metaadat-chat forrásainak lezárása — lokális agent

- [ ] TODO A már elkészült feltöltő bemenetéhez és az 1. fázis mintájához igazítja a csatornaforrásokat. A userrel lezárja a még nyitott `youtube-metadata-workflow.md` / `rules.md` tartalmi kérdéseket; nem ír át saját döntéssel csatornapreferenciát.
- [ ] TODO Ellenőrzi az engedélyezett csatorna `sourceFiles` és `playlistSource` hivatkozásait. A metaadat-chat építése előtt átadja az n8n agentnek a végleges forráslistát, a playlistnév → ID forrást és a `meta.md` mintát.
- **Előfeltétel:** 4. fázis. Nem készül külön unit vagy forrásfájlonkénti tesztcsomag.
- **Lezárás feltétele:** a metaadat-agent által olvasandó források és a feltöltőnek átadandó fájlformátum véglegesek.

### 6. Csatornához kötött metaadat-chat teljes flow — n8n agent

- [x] DONE A `youtube meta workflow` belépési weboldala elkészült, importálva és aktiválva van. A két dropdown, a Tovább gomb állapota és a kiválasztott értékek átadása böngészőben ellenőrizve; a user a `freezwithme` és `20260730_drava_sup_testfolder` értékekkel is visszaigazolta. Az Execute Command engedélyezett a fő n8n konténerben.
- [x] DONE A választás után megjelenik a beépített n8n chat; a DeepSeek Chat (`deepseek/deepseek-chat`) és a workflow-projektben elérhető OpenRouter credential hozzá van kötve. A `channelKey` és `videoFolder` metadata-ként jut a Chat Triggerhez; a chat memóriája `${channelKey}:${videoFolder}` kulcsot használ. A selector beküldése és a chatoldal megnyitása sikeres; a user kézzel visszaigazolta a működést.
- [ ] TODO A 6. követelménypont mind a 12 elemét egyben elkészíti: csatorna- és videómappa-űrlap → kötött session → kiválasztott csatornaforrások → videómappa ellenőrzése → egyeztetés → `meta.md` mentése és visszaolvasása → „kész” → playlistfeloldás → `draft` metaadat → validáció és csatornaegyezés → `ready`.
- [ ] TODO Ebbe a teljes flow-ba tartozik a kézi `meta.md` javítások megőrzése, az új szerkesztéskor történő `ready` → `draft` visszaállítás, a short/long playlistkorlát és a playlistforrás nélküli csatorna `draft` korlátozása is.
- [ ] TODO Ugyanekkor készül el a tanult szabály visszaolvasás → módosítás → validálás → visszaírás ága, kizárólag a kiválasztott csatorna `rules.md` fájljára. Minden fájlművelet a fő n8n konténer Read/Write Files node-ján megy. A chat röviden jelenti a mentési PATH-ot, repóbeli szabálymódosításnál commitüzenet-javaslatot ad.
- **Előfeltétel:** 5. fázis és az 1. fázisban igazolt Form → Chat kapcsolat, session és futásidejű modell/credential. A `ready` ellenőrzés a feltöltőnél már lezárt csatorna- és credential-hozzárendelést használja.
- **Átadás a lokális agentnek:** a teljes metaadat-flow és belépése, a session átadásának módja, a mentett fájlok helye; valódi videós próba ekkor nem indul.

### 7. Metaadat-flow lezárása és végső repoátadás — lokális agent

- [ ] TODO Exportálja a metaadat-workflow-t és az esetleg módosult segéd-workflow-kat; hozzáadja a tesztelési blokk szerinti egy metaadat E2E-t a már meglévő `make test` futtatáshoz.
- [ ] TODO Lefuttatja a két E2E alapellenőrzést együtt. A metaadat-flow kimenete ugyanazt a szerződést követi, amelyből a feltöltő indul; nem készül harmadik, ismétlődő tesztcsomag.
- [ ] TODO A végleges workflow-exportokat és a checklist státuszait egyezteti a ténylegesen elkészült állapottal. A workflow-javítás az n8n agenthez, a repóbeli javítás a lokális agenthez kerül; javítás után az érintett E2E fut újra.
- **Lezárás feltétele:** mindkét teljes flow exportálva van és a két szűk E2E sikeres. A valódi kézi teszt nem implementációs kapu; külön, az alábbi blokkban vár a userre. Stage, commit és push nem agentes feladat.

## Tesztelés

### Automatizált alapellenőrzés — lokális agent

Az E2E-k megírása a hozzájuk tartozó flow lezárási fázisának része. Csak az alábbi két teszt készül; nincs unit teszt, külön parser-/registryteszt vagy részletes hibamátrix. Nem szükséges minden node belső kimenetét vizsgálni, csak a teljes folyamat eredményét.

- [ ] TODO **Feltöltő E2E:** izolált `ready` videómappából, a tényleges feltöltő workflow-val eljut a helyettesített YouTube-lépéseken át az `uploaded` állapotig és az értesítő meghívásáig. Ugyanebben az egy forgatókönyvben egy megszakítás utáni folytatás igazolja, hogy a mentett `videoId`-t használja, és nem tölti fel újra a videót.
- [ ] TODO **Metaadat E2E:** a csatorna-/mappaválasztástól egy rövid, helyettesített modellválaszokkal vezetett egyeztetésen és a `meta.md` mentésén át a jóváhagyott `ready` `meta.json`-ig fut. A kézzel javított előnézet marad a véglegesítés forrása; az eredmény a kiválasztott csatorna és a forrásból feloldott playlist azonosítóját tartalmazza.
- **Futtatás:** paraméter nélküli `make test` a repó gyökeréből; `pytest`, a már futó n8n-re támaszkodva. A szükséges környezet- és mountellenőrzés a belépés része. Hiány esetén konkrét hiba és kézi indítóparancs, például `make start-n8n`, majd hibás kilépés; nincs automatikus indítás/build vagy csendes skip.
- **Izoláció:** ideiglenes tesztadat és teszt-workflow-példány; valódi videó-, metaadat-, csatornaszabály-, repo- és Git-fájlok módosítása nélkül. Az LLM-, YouTube- és Telegram-hívások helyettesítettek. A valódi credential, AI-szövegminőség és külső szolgáltatás működését a kézi próba igazolja.

### Valódi kézi tesztelés — user, az implementációs sorrenden kívül

Ez külön, a workflow-k elkészülése után indítható kör. Nem része a `make test`-nek, és az agent nem indítja el a fejlesztési fázisok lezárásához.

- [ ] TODO **Egy teljes valós használati próba:** valódi videómappa és csatornaválasztás → metaadat-chat → `meta.md` kézi javítása → „kész” → `ready` `meta.json` → külön kézzel indított feltöltő → privát/időzített videó, thumbnail és playlist → Telegram-link. Csak azt kell ellenőrizni, hogy a teljes használati út működik.
- [ ] LATER **End screen:** a feltöltött videóhoz kézzel, a YouTube Studióban. A workflow csak emlékeztetőt és Studio-linket küld.
- **Google audit:** az MVP implementációján és a privát feltöltési próbán kívüli későbbi teendő; a nyilvános ütemezés korlátait a kockázati blokk tartalmazza.
- **Ha a kézi próba javítást igényel:** a workflow-javítást az n8n agent végzi, majd a lokális agent exportál és lefuttatja az érintett automatizált E2E-t. Az exportot nem kell a valódi feltöltési próbáig halasztani; Git-műveletet a user végez.

## Kockázatok
- **Ellenőrizetlen Google API-projekt:** a YouTube szabályai szerint az ilyen projektből feltöltött videók privátak maradnak, és az időzítés sem teszi őket nyilvánossá. Ezt egy ellenőrzés (audit) kérésével lehet feloldani.
- **Napi YouTube API-keret:** a keret szűkös. Egy feltöltés nagyjából 1600 egységbe kerül a napi 10 000-ből, ez kb. 6 videó naponta. Ezt az értéket érdemes a Google aktuális dokumentációjában ellenőrizni.

## Rád váró teendők

**Előkészítés összefoglaló (2026-10-25):** infra, `.env`, YouTube OAuth, Telegram, OpenRouter / n8n AI Assistant, a FreezWithMe csatorna-forrásstruktúrája, a `config/channels.json` registry, a csatorna-/videómappa-választó, a DeepSeek-alapú chat/session bekötés és a csatorna-/közös forrásfájlok dinamikus betöltése **kész**. A workflow a futó n8n-be importálva és aktiválva van. **Hátra:** a videómappa és metaadatfájlok kezelése, a metaadat-workflow további részei, az értesítő, a közös feltöltő, két szűk E2E és a teljes workflow-k exportjai. A valódi használati próba külön kézi kör. GCP **audit** és **end screen** nem implementációs feladat.

1. [x] DONE **Rancher Desktop (MVP):** moby motor, hogy a `make start-n8n` / `docker compose` működjön. A `VIDEOS_ROOT` home alatti Mac-útvonal bind mountolható extra Rancher-beállítás nélkül. Kubernetes és külön „volume megosztás” nem része az MVP-nek.
2. [x] DONE **`n8n-docker/.env`:** `VIDEOS_ROOT` (idézőjeles útvonal, szóköz), `N8N_ENCRYPTION_KEY`, többi mező az `env.example` szerint; `n8n` konténer recreate után a mount egyezik a `.env`-vel.
3. [x] DONE **Google Cloud / YouTube (OAuth):** GCP projekt, consent, Web OAuth kliens, n8n **YouTube OAuth2 API** credential connected. Audit / nyilvános ütemezés korlát **később**. Repó: `n8n-workflows/youtube-upload/config/google-oauth.n8n.json`, `n8n-workflows/youtube-upload/docs/google-cloud-teendok.md`.
4. [x] DONE **Telegram:** BotFather token → n8n **Telegram API** credential; chat ID a `n8n-workflows/youtube-upload/config/settings.json` `telegramChatId` mezőben (token nem a repóban).
5. [x] DONE **AI:** OpenRouter API key és n8n **AI Assistant** beállítva az n8n UI-ban (metaadat-chat workflow építéshez).
6. [x] DONE **Csatorna-források:** a struktúra `channels/FreezWithMe/youtube-metadata-workflow.md`, `rules.md`, valamint a csatorna által igényelt opcionális fájlok. A `channels/` rename a munkafában ellenőrizve.
7. [x] DONE **Csatorna-, videómappa-választó és chat-belépés:** a weboldal két dropdownnal továbbadja a `channelKey` és `videoFolder` értékeket, majd megnyitja a DeepSeek-alapú Chatet a kiválasztásokhoz kötött sessionnel. Workflow: `youtube meta workflow`; JSON: `n8n-workflows/youtube-upload/workflows/youtube-meta-folder-picker.json`.
8. [ ] TODO **`youtube-metadata-workflow.md` és csatornaszabályok véglegesítése:** a lokális agenttel, az 5. fázisban; csak a még nyitott tartalmi kérdésekben kell userdöntés.
9. [ ] TODO **Valódi kézi próba és későbbi end screen:** kizárólag a külön tesztelési blokk szerint, a workflow-k elkészülése után.
10. [ ] TODO **Workflow export:** a lokális agent végzi minden lezárt workflow-változtatás után a `make -C n8n-workflows/youtube-upload export` paranccsal. Stage, commit és push a user feladata.

