# YouTube uploader és metaadat-frissítő

## Megőrzendő n8n- és uploader-alapok

- A meglévő helyi n8n stack marad az alap (`n8n-docker/`); indítás és leállítás a meglévő Makefile-célokkal történik. Ne készüljön második Compose stack.
- A videó- és workflow-fájlok n8n konténerbeli elérése a compose mountokon keresztül történik. A fájlrendszer-hozzáférés maradjon a szükséges mappákra korlátozva; a runners ne kapjanak videó- vagy repo-mountot.
- A YouTube OAuth-credential az n8n-ben marad. A csatorna-regiszter alapján kell kiválasztani, és a hitelesített csatornát egyeztetni kell a várt `youtubeChannelId`-val. Token vagy titok ne kerüljön a repóba vagy exportba.
- A feltöltő a jóváhagyott `ready` metaadatot, a hozzá tartozó videófájlt és thumbnailt használja; privát/időzített feltöltést végez, beállítja a playlistet, és jelenti a végső YouTube-linket. A metaadatban tárolt `playlistId` az irányadó.
- A feltöltő lépésenként mentse az állapotot, a YouTube `videoId`-t pedig azonnal a feltöltés után. Újraindításkor csak a hiányzó lépéseket folytassa, ne töltsön fel duplán. Hiba esetén a lépést és annak okát adja vissza. A Telegram csak értesítésre szolgál.
- Workflow-változtatás után az exportált n8n workflow-k legyenek naprakészek; automatizált E2E-ben az LLM-, YouTube- és Telegram-hívások legyenek helyettesítve, valódi feltöltés csak külön kézi próbában történjen.

## Most megvalósítandó feladat

- [x] **A helyi channel agent által indított YouTube-metaadat-frissítő elkészítése.** A már feltöltött videót a jóváhagyott JSON alapján frissíti, és ellenőrzött eredményt ad vissza az agentnek.

A mostani kör kizárólag a metaadat-frissítés. A fenti uploader-elvárások megőrzendő háttérkövetelmények; videófeltöltés, thumbnail, Telegram-értesítés és n8n-ben futó AI-agent nem része ennek a megvalósításnak. A user a meglévő helyi metaadat-egyeztetést használja, az n8n-be a napi működéshez nem kell belépnie.

## Már kész, újrahasználandó alapok

Állapotfelmérés: 2026-10-26. A repót és a futó n8n-t is ellenőriztük; a Google-projekt és a kapcsolatok kész állapotát a user is megerősítette.

- [x] A meglévő `n8n-docker/` stack fut; az n8n verziója `2.44.6`, a `http://127.0.0.1:5678/healthz` válasza `{"status":"ok"}`. A korábbi elérhetetlenségi megjegyzés elavult.
- [x] A Google-projekt, API- és secret-beállítások elkészültek; a YouTube és Telegram csatlakoztatva van. Az n8n-ben létezik a `YouTube account` és `Telegram account` credential. Ezeket nem kell újralétrehozni vagy újracsatlakoztatni. A credential létezése és a user által ellenőrzött kapcsolat nem helyettesíti a konkrét csatorna és videó futásonkénti ellenőrzését.
- [x] A channel meta creation leírás megvan: [`youtube-metadata-workflow.md`](../local-workflows/youtube-meta-update/channels/FreezWithMe/youtube-metadata-workflow.md). A csatornaválasztás, MD-jóváhagyás, majd `ready` JSON előállítás szabályai már benne vannak; a konfigurációs útvonalak javítva vannak.
- [x] A bemeneti mezők mintája megvan: [`examples/meta.json`](../local-workflows/youtube-meta-update/examples/meta.json). A [`channels.json`](../local-workflows/youtube-meta-update/config/channels.json) tartalmazza a FreezWithMe csatornaazonosítóját és a `travel` / `19` kategóriát; a [`settings.json`](../local-workflows/youtube-meta-update/config/settings.json) időzónája `Europe/Vienna`.
- [x] A workflow import/export eszközök és Makefile-célok készen vannak: [`n8n-workflows/README.md`](../n8n-workflows/README.md). Ezeket kell használni.

Az ellenőrzött n8n-ben négy korábbi, inaktív workflow van: `YouTube – Metaadat keszites`, `youtube meta workflow`, valamint a videómappa fájlírási és olvasási eszközei. Ezek űrlapot, AI-chatet és fájlkezelést valósítanak meg; YouTube-metaadat-frissítő API-lépést nem tartalmaznak. A repó `n8n-workflows/workflows/` mappájában jelenleg csak `.gitkeep` van. Védett frissítő webhookot, közös helyi indítósegédet, duplázásvédelmet és ehhez tartozó teszteket nem találtunk. Az alábbiak ezért még nyitott feladatok, nem a kész funkciók újraírásai.

## Megvalósítás, ebben a sorrendben

### 1. A helyi agent elküldi a JSON-t az n8n-nek

- [x] Készüljön repóban lévő, a helyi agent által meghívható indítókapcsolat (CLI-segéd vagy azzal egyenértékű, dokumentált eszköz), amely a kiválasztott `ready` JSON-t elküldi az n8n production webhookjára, megvárja és értelmezi annak válaszát, majd az eredményt visszaírja a helyi JSON-ba. Rögzíteni kell a parancsot, bemenetet/kimenetet, webhook URL konfigurálását és a Header Auth titok helyi, repón kívüli tárolását; titok nem kerülhet a repóba vagy exportált workflow-ba.
- [x] A kapcsolatot a tényleges helyi agent futtatókörnyezetből kell kipróbálni. A `127.0.0.1:5678` csak akkor használható, ha az agent ugyanazt a host hálózati névteret látja; ha nem, dokumentáltan elérhető helyi címet vagy hidat kell kialakítani. A hívásnak véges ideig kell várnia, és timeout után nem küldheti el automatikusan újra a módosítást.
- [x] Küldés előtt videónként fájlzárral ellenőrzi és `updating` állapotra állítja a meta JSON-t; a webhookra a jóváhagyott `ready` tartalmat küldi. `updating` vagy `updated` státusszal új módosítás nem indulhat. A webhook ugyanazon videóra érkező párhuzamos vagy ismételt kéréseket is zárja ki, ne csak a helyi fájlzár védjen.

### 2. Az n8n ellenőrzi a videót és a bemenetet

- [x] Ellenőrzi a `ready` állapotot és a meglévő kötelező mezőket. A meglévő YouTube-credentiallel lekéri a videót: létezik-e, és a regiszter szerinti csatornához tartozik-e. A hitelesített csatornát is egyezteti; eltéréskor konkrét hibával leáll.
- [x] Minden írás előtt ellenőrzi az aktuális YouTube-állapotot. Csak jelenleg privát, nem időzített videó frissíthető; ha `privacyStatus` nem `private`, vagy már van `status.publishAt` értéke, azonnal hibával leáll, és sem videó-, sem playlist-módosító API-hívást nem végez. A YouTube `scheduled` állapotát privát videó és beállított jövőbeli `publishAt` jelenti.
- [x] Egyetlen kérés sem állíthat be `privacyStatus: public` értéket vagy múltbeli publikálási időt. A videó csak privát maradhat vagy a kért jövőbeli `publishAt` révén időzítetté válhat. A tervezett publikálást nem várja meg és nem teszi közzé.
- [x] Csak érvényes, jövőbeli időzítést és `privacyStatus: private` bemenetet fogad el. A megadott playlist elérhetőségét írás előtt ellenőrzi.

### 3. Az n8n frissíti a metaadatokat

- [x] Beépített YouTube vagy HTTP Request node-okkal, a meglévő credentialt használva frissíti a `title`, `description`, `tags`, `categoryId`, `privacyStatus: private` és `youtube_scheduled_at` → `publishAt` mezőket. A kategória a meglévő regiszterből jön: FreezWithMe esetén `19`. Meglévő videó egyéb mezőinek megőrzése nem követelmény.
- [ ] A megadott playlisthez csak akkor adja hozzá a videót, ha még nincs benne. Ha a kért metaadatok és a tagság már egyeznek, nem ír újra. Írási hívást nem ismétel automatikusan.

### 4. Az n8n ellenőriz és visszajelez a helyi agentnek

- [x] A módosítás után visszaolvassa a cím, leírás, kategória, láthatóság, időzítés és playlist-tagság állapotát. A YouTube GET-válaszában hiányzó tageket nem hasonlítja össze. Legfeljebb három ellenőrzés után egyértelmű JSON-választ küld: siker, konkrét hiba vagy nem igazolható eredmény. A jövőbeli publikálást nem várja meg.
- [x] Legyen kérésenkénti API-timeout, 90 másodperces feldolgozási határidő és a helyi hívásra 120 másodperces teljes korlát. Az agent nem várhat végtelenül; kapcsolatvesztés vagy timeout esetén nem indíthat automatikusan új módosítást.
- [x] `Respond to Webhook` küldi a választ megfelelő HTTP-kóddal. Hiba esetén szerepeljen a hibás lépés, a YouTube hibakódja/üzenete és az esetleges részleges siker; az n8n-ben is hibás futásként látszódjon. Hibából nem lehet általános sikeres válasz.

### 5. A meta JSON státusza és az MVP próbája

- [x] Az n8n a válasz JSON-ban megadja a végállapotot: `updated`, `error` vagy `unknown`; a helyi agent ezt menti vissza az eredeti meta JSON-ba. Az n8n a kapott JSON-nal dolgozik, a helyi fájlt az agent írja. A többi metaadat változatlan marad.
- [x] `unknown` vagy korábbról megmaradt `updating` állapot blokkolja az új indítást. Új próbálkozás csak az előző n8n-futás lezárásának és a tényleges YouTube-állapotnak az agent általi ellenőrzése után engedhető. `error` után is ellenőrizni kell az esetleges részleges módosítást; új indítás csak külön kérésre történjen.
- [x] TDD-vel, kevés teljes folyamatot lefedő automatizált teszttel kell fejleszteni; unit teszt nem készülhet. A tesztek a helyi agent-indítókapcsolattól a webhook-válaszig és a fájlstátusz visszaírásáig járják be a flow-t, a YouTube API-t tesztduplával helyettesítve. Legalább egy sikeres és egy tiltott állapotot (már időzített vagy nyilvános videó) végigtesztelnek; az n8n és a helyi hívás hibás válaszát is ellenőrzik. Minden automatizált teszt a gyökérszintű `make test` targetbe kerül.
- [x] Az új workflow aktiválása és exportja a meglévő eszközzel a `n8n-workflows/workflows/` mappába, majd a sikeres frissítés kézi kipróbálása saját privát tesztvideón. A YouTube-eredmény, az agent válasza és a fájl státusza ellenőrizve.
- [ ] Kézi ellenőrzés még hátravan: már időzített és nyilvános videó tiltása, hibás videoId, ismételt indítás és timeout.

## Kész, ha

- [x] A helyi agentből indított frissítés visszaolvasással igazolt, a meta JSON státusza helyes, az ismételt indítás blokkolt, és hiba vagy timeout esetén az agent véges időn belül konkrét visszajelzést kap.

## Ellenőrzött technikai források

- [n8n YouTube node és meglévő credential használata HTTP Request node-ban](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.youtube/): a videó- és playlist-műveletekhez kész node-ok vannak, saját integráció nem szükséges.
- [n8n Webhook](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/): Header Auth, production webhook és explicit válaszadás.
- [n8n HTTP Request](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.httprequest/): meglévő credential, HTTP-hibák, válaszstátusz és timeout.
- [n8n Stop And Error](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.stopanderror/): a kezelt hiba végrehajtási hibaként történő lezárása.
- [YouTube videos.update](https://developers.google.com/youtube/data/reference/rest/v3/videos/update): írható mezők, időzítés feltételei és kihagyott mezők törlési viselkedése.
- [YouTube playlistItems.list](https://developers.google.com/youtube/data/reference/rest/v3/playlistItems/list): playlist- és videóazonosító szerinti tagságellenőrzés a duplázás elkerüléséhez.

## Külön feladat: Gomba 1 helyi transcript — szűk MVP

- [x] Megkeresni a meglévő YouTube-letöltó CLI és a Faster-Whisper tényleges helyi hívását; ezeket használni.
- [x] Egyetlen, agentből hívható script készüljön a `local-workflows/script-and-cut/gombaFlow/gomba-1-script-writer/` alatt, két művelettel: `create <youtube-url> <selected-topic-path>` és `cleanup <gomba-1-id>`.
- [x] A `create` a kiválasztott Gomba 0 ötlethez az audió letöltése előtt Gomba 1 ID-t rendel, és a `projects/registry.json` fájlban a YouTube videó ID-jához rögzíti. Az ID alakja `1-rovid-cim`; a projektmappa neve is pontosan ez az ID. Ha registry szerint transcript már készült, ne töltsön le és ne írjon felül.
- [x] Az audió a repón belüli `projects/<gomba-1-id>/source-audio/` mappába kerül, amelyet a `.gitignore` kizár a Gitből, de helyben látható. Helyi Faster-Whisper készíti a `projects/<gomba-1-id>/source-transcript.md` fájlt forrás-URL-lel és időbélyegekkel. Az audió jóváhagyásig megmarad.
- [x] Legyen `make gomba1-transcript` target: listázza a legfrissebb Gomba 0 ötleteket, fogadja el a sorszámot, hibás sorszámnál álljon meg hibával, majd a meglévő `create` és siker esetén a `cleanup` CLI műveletet futtassa. Sikeres cleanup után egy színes sorban írja ki az agent következő lépését és a transcript útvonalát.
- [ ] Egy kézi végigpróba: a targetből elkészül az átirat, utána törlődik az audió, a transcript megmarad, és megjelenik az agentnek szóló következő lépés. Ehhez a külön feladathoz nem kell TDD vagy új automatizált teszt.

## Külön MVP: YouTube-thumbnail beállítása

- [ ] A metaadat-generálás keresse a thumbnailt a kiválasztott csatorna és videó mappájában: `local-workflows/youtube-meta-update/channels/<channel-mappa>/videos/<video-mappa>/thumbnail.jpg`. A csatornamappa kötelező része az útvonalnak, hogy több csatorna fájljai ne keveredjenek.
- [ ] Ellenőrizze, hogy a fájl valódi JPEG kép, legfeljebb 50 MB, és 16:9 képarányú. Hiányzó vagy hibás képnél jelezze a problémát, majd várjon: a user pótolhatja a képet és jelezheti, hogy kész, vagy kérheti a thumbnail kihagyását.
- [ ] Sikeres metaadat-frissítés után, kihagyás hiányában, külön YouTube `thumbnails.set` API-hívással állítsa be a képet a már megadott `videoId`-hoz.
- [ ] A thumbnail művelet eredményét a metaadat-JSON külön `thumbnailResult` mezőjébe mentse az `updateResult` mellett; rögzítse a sikeres, sikertelen vagy kihagyott állapotot. A thumbnail hibája ne indítsa újra a metaadat-frissítést, és a thumbnail külön legyen újrapróbálható.
- [ ] A kész állapotot és a hibás/kihagyott eseteket automatizáltan ellenőrizze; valódi YouTube-módosítást csak külön kézi próbában végezzen.

## Külön feladat: videómappa és YouTube-azonosító összerendelése

- [ ] Tartsa meg a jelenlegi mappaválasztási szabályt: üres `videos/` mappánál jelezze, hogy nincs videómappa; pontosan egy almappánál válassza ki automatikusan; több almappánál sorolja fel őket sorszámozva, külön sorokban, és engedje a kihagyást.
- [ ] A kiválasztott mappa sorszáma mellett a user a jelenlegi első kérdésre adott válaszban megadott YouTube-linkből vagy `videoId`-ból dolgozzon; ne kérje a mappa nevét vagy útvonalát másolásra.
- [ ] A kiválasztott videómappa nevét a hozzá tartozó metaadat-JSON-ban `archivedSourceVideoFolderName` mezőben tárolja. Ez a mező a később külső meghajtóra archivált forrásmappa nevét őrzi, nem az aktuális elérési útját. A csatornaazonosító és a `videoId` maradjon a JSON-ban az összerendelés része.
- [ ] Mappaválasztás kihagyásakor ne írjon `archivedSourceVideoFolderName` mezőt.

## Külön feladat: automatikus átirat-összefoglaló a YouTube-upload-agent előtt

- [ ] A user továbbra is csak a meglévő YouTube-upload-agentet hívja. Az agent a kiválasztott videómappa alapján automatikusan indítsa el az összefoglaló agentet, és várja meg annak befejezését; a usernek ne kelljen az összefoglaló agentet külön meghívnia.
- [ ] Az összefoglaló agent első lépésként hívja meg az átiratkészítő `make` targetet a kiválasztott helyi videómappa fájljára: `local-workflows/youtube-meta-update/channels/<channel-mappa>/videos/<video-mappa>/`. A target szinkron módon várja meg az átirat elkészültét, és közben mutasson a usernek érthető előrehaladást; az upload-agent ezalatt ne lépjen tovább.
- [ ] Külön összefoglaló folyamat készüljön, amely újrahasználja a meglévő Faster-Whisper átiratkészítést, de nem alakítja át a Gomba 1 folyamatát.
- [ ] Az összefoglaló agent olvassa be az elkészült átiratot, és ugyanabba a videómappába készítse el a `summary.md` és `chapters.md` fájlokat.
- [ ] A `summary.md` részletesen, a történet menetét követve foglalja össze, miről szól a videó és mi történik benne. Külön gyűjtse ki az átiratban szereplő eszközöket/felszerelést, helyszínt, sportot vagy tevékenységet (például bringázás, gravel, futás vagy terepfutás, túrázás, sátrazás, eszközbemutató), valamint minden egyéb, címhez vagy leíráshoz hasznos tényt. Csak az átirattal alátámasztott adatot írja le; a hiányzó vagy bizonytalan információt jelezze, ne találja ki.
- [ ] A `chapters.md` a teljes átiratot fedje le, és csak érdemi tartalmi/narratív váltásoknál jelöljön fejezetet; a fejezetek ne legyenek túl közel egymáshoz, rövid kitérőkből ne készítsen külön fejezetet. A címek a videó nyelvén, néhány szóból álljanak, legyenek tömörek, trendik és izgalmasak, pontosan nevezzék meg a fejezet tényleges tartalmát, kattintásvadászat nélkül.
- [ ] A fejezetidőket az átirat időbélyegeiből vegye: minden időpont a fejezet tényleges kezdetére essen, ne becsülje vagy találja ki. A lista kezdődjön `00:00`-val, legyen legalább három fejezet, az időbélyegek legyenek egyediek és növekvő sorrendűek, minden fejezet tartson legalább 10 másodpercig, és egyik se nyúljon a videó végén túlra.
- [ ] A `chapters.md` tartalmazza a YouTube-leírásba közvetlenül beilleszthető időbélyeg–fejezetcím listát, magyarázó szöveg nélkül. Mentés előtt ellenőrizze a formátumot, a teljes lefedettséget, az időbélyegek helyességét és a YouTube minimumfeltételeit; ha ezek nem teljesíthetők, adjon konkrét hibát, hogy az upload-agent a usertől pótlást vagy kihagyást kérhessen.
- [ ] Az összefoglaló agent ne készítsen címet, leírást vagy tageket. A YouTube-upload-agent kizárólag az összefoglalót használja az átirat helyett, és továbbra is ő készítse, mutassa be és a user visszajelzése alapján szükség esetén javasolja újra a címet, leírást és tageket.
- [ ] A user opcionálisan adhat meg további részleteket, például használt eszközöket vagy helyszínt; ezek hiányában az upload-agent az összefoglaló alapján folytassa. A megosztási dátum megadása továbbra is kötelező.
- [ ] Az átirat-, összefoglaló- vagy fejezetgenerálási hibát az upload-agent géppel feldolgozható eredményként kapja meg, és világos, teendőt tartalmazó üzenetben jelezze a usernek. Az összefoglaló sikertelensége esetén feltöltési lépés ne induljon.

## Külön feladat: YouTube-fejezetek a leírásban

- [ ] A fejezeteket a thumbnaillel közös videómappában keresse: `local-workflows/youtube-meta-update/channels/<channel-mappa>/videos/<video-mappa>/chapters.md`.
- [ ] Ha a `chapters.md` hiányzik, kérdezzen rá, és várja meg, amíg a user pótolja, vagy jelzi, hogy kihagyható; kihagyáskor a metaadat-generálás folytatódjon fejezetek nélkül.
- [ ] Ellenőrizze a YouTube-fejezetfeltételeket: az első időbélyeg `00:00`, legalább három fejezet, időbélyegek növekvő sorrendben, és minden fejezet legalább 10 másodperc hosszú.
- [ ] Érvényes fejezeteket illesszen a generált YouTube-leírás végére, a hashtagek elé; a meglévő metaadat-frissítési hívás mentse őket a leírás részeként.
