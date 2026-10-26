# YouTube-metaadat frissítő

A helyi agent a jóváhagyott, `ready` meta JSON-t a védett n8n production
webhooknak küldi. Az n8n natív HTTP Request node-jai a meglévő `YouTube account`
credentiallel olvasnak és írnak; a CLI menti vissza az eredményt a helyi JSON-ba.

## Célvideó

A `videoId` mező határozza meg a frissítendő videót. A workflow nem rögzít
videóazonosítót; az aktuális, jóváhagyott JSON `videoId` mezőjét használja.

## Használat az agentből vagy terminálból

A repó gyökeréből kapcsolatpróba, YouTube-hívás és fájlmódosítás nélkül:

```sh
python3 local-workflows/youtube-meta-update/youtube_meta_update.py check \
  local-workflows/youtube-meta-update/examples/connection-check.json
```

A jóváhagyott videó kizárólag olvasási előellenőrzése:

```sh
python3 local-workflows/youtube-meta-update/youtube_meta_update.py preflight \
  local-workflows/youtube-meta-update/channels/FreezWithMe/youtube-metas/20260730_drava_sup_testfolder.json
```

Elvárt: `status: validated`, `step: youtube-preflight`, `youtubeModified: false`.
A `check` és `preflight` nem módosítja a JSON-t, és nem foglal frissítést.
Mindkettő csak `ready` JSON-t fogad el.

A jóváhagyott adatok tényleges alkalmazása:

```sh
python3 local-workflows/youtube-meta-update/youtube_meta_update.py update \
  local-workflows/youtube-meta-update/channels/FreezWithMe/youtube-metas/20260730_drava_sup_testfolder.json
```

Ez valódi módosítás: playlist-tagságot, címet, leírást, címkéket, kategóriát,
privát láthatóságot, a jóváhagyott jövőbeli publikálási időt, a videó nyelvét
és a valósághű módosított/szintetikus tartalom jelölését állítja be.
Siker csak visszaolvasással igazolt egyezés után lehet `updated`.
A válasz tartalmazza a videó linkjét, az n8n `executionId` értékét és a megerősített
írási lépéseket. A CLI a teljes választ `updateResult` mezőbe menti; a `status`
mezőn kívül a jóváhagyott metaadatok változatlanok maradnak.

Kilépési kód: `0` igazolt siker; `1` visszakapott `error`/`unknown`; `2` helyi
bemeneti/konfigurációs hiba vagy tiltott újraindítás. A `--timeout 30` rövidebb
várakozást állít; legfeljebb 120 másodperc engedélyezett. Nincs automatikus újraküldés.

## Írási sorrend és ellenőrzések

Az n8n egyezteti a hitelesített csatornát a regiszterrel, a videó tulajdonosát,
a privát/nem időzített állapotot, a jövőbeli időpontot és a playlist csatornáját.
Már nyilvános vagy bármilyen `publishAt` értékkel időzített videó nem módosítható.
Ez akkor is tiltás, ha valamely kért adat már egyezik.

Lekéri a playlist-tagságot, és csak hiányzó tagságnál szúr be új playlist-elemet.
Közvetlenül minden írás előtt újra lekéri a videó aktuális állapotát.
Ekkor a kért publikálási időnek az aktuális kérés teljes timeoutján és további
1 másodperces indítási tartalékon túl is jövőbelinek kell lennie. Elégtelen
tartaléknál `PUBLISH_TIME_TOO_CLOSE` hibát ment, az időpontot nem módosítja;
a korábbi megerősített playlist-módosítás részleges sikerként megmarad.
Először a hiányzó playlist-tagságot rendezi, utoljára a videó metaadatait és
időzítését írja; az időzítetté vált videón ezután csak olvasást végez.
A már egyező mezők/tagság nem indítanak fölösleges írást. A kötelező jövőbeli
időzítés miatt egy korábban nem időzített videó sikeres alkalmazása általában
videófrissítést igényel; a már időzített videó tiltását nem kerüli meg no-op címén.

A visszaellenőrzés legfeljebb három körben olvassa a videómezőket és tagságot.
A dátumot időpillanatként, a címkéket sorrendtől függetlenül hasonlítja össze.
Írási kérést soha nem ismétel; csak az ellenőrző olvasások ismételhetők.
Az API-cím rögzített Google HTTPS-host, átirányítás és natív retry tiltott.

A YouTube Data API a paid promotion állapotát vissza tudja olvasni, de nem tudja
módosítani; ezt a beállítást a YouTube Studio-ban kell kezelni. Az age restriction
mezőt az API nem tudja írni vagy ellenőrizni, ezért az automatizálás sem beállítást,
sem ellenőrzést nem végez rajta; ezt is a YouTube Studio-ban kell kezelni.

## Állapot és bizonytalan eredmény

A CLI videónként host-szintű fájlzárat tart a `/tmp/film-gombaflow-<uid>/`
könyvtárban, küldés előtt atomikusan `updating` státuszt ment, de az eredeti
jóváhagyott `ready` tartalmat küldi. `updating`, `updated`, `error`, `unknown`
státuszból új indítás tiltott.

A szerver atomikus, kizárólagos fájllétrehozással foglalja a videót a meglévő
n8n volume `/home/node/.n8n/youtube-meta-update/` mappájában. A foglalás az
`executionId` tulajdonában marad, újraindítás után is blokkol. Minden kérés előtt
menti a következő lépést; az írások megerősítését azonnal tartósan rögzíti.

`error` esetén a lépés és az ismert részleges siker szerepel a válaszban.
Írási timeout, kapcsolatvesztés, nem értelmezhető írási válasz vagy sikertelen
visszaellenőrzés `unknown`: a módosítás történhetett, ezért automatikus retry nincs.
A `youtubeModified: null` azt jelenti, hogy a módosítás nem igazolható;
`true` esetén legalább egy írás megerősített. A `partialSuccess` hibás/bizonytalan
végállapotban jelzi a korábbi megerősített lépést.

Nincs automatikus feloldás vagy státusz-visszaállítás. Új próbához előbb az agent
ellenőrizze az előző n8n-futás lezárását és a valódi YouTube-állapotot, majd csak
külön user-kérésre készíthet elő egyeztetett új indítást. Az `updated` fájl nem
használható újabb tesztfrissítéshez kézi `ready`-ra átírással.

## Hibák az n8n-ben

A kezelt hibák megfelelő HTTP-kóddal, `status`, `step`, `code`, `message`,
`partialSuccess`, `youtubeModified`, `executionId` mezőkkel térnek vissza.
A `youtubeError` megőrzi a szolgáltatói hibakódot és biztonságosan szűrt üzenetet;
tokent, Authorization fejlécet és nyers hibaobjektumot nem küld vissza.
A `Respond to Webhook` után `Stop And Error` zárja hibásként az `error` és
`unknown` futást. Váratlan node-hiba sem válhat sikeres válasszá.
Hibás Header Auth már futásindítás előtt 403-at ad.

A feldolgozás belső határideje 85 másodperc, az n8n hard limitje 90 másodperc,
a kliensé 120. Az egyes API-kérések legfeljebb 15 másodpercet kaphatnak, de ezt
a még hátralévő feldolgozási idő tovább korlátozza. A jövőbeli publikálást nem várja meg.

## Telepítés és titok

```sh
python3 n8n-workflows/scripts/install-youtube-meta-connection.py
```

Csak a kezelt `youtubeMetaConnection` workflow-t és külön Header Auth credentialjét
importálja/publikálja a meglévő stackbe, majd a meglévő import/export Makefile-célokkal
exportálja. Röviden újraindítja csak az n8n szolgáltatást; más workflow/credential és
volume megmarad. A csatornaregiszter `youtubeCredential` hivatkozása a meglévő OAuth
credential id/név/típusát tartalmazza; token nincs a repóban.

A Header Auth titok a repón kívül, `~/.config/film-gombaflow/youtube-meta-update.json`
fájlban marad (`600`, könyvtár `700`). Meglévő konfigurációt nem ír felül más webhookhoz.
Másik repón kívüli helyhez `--config <útvonal>` adható. Manuális beállítás:
`python3 local-workflows/youtube-meta-update/youtube_meta_update.py configure`.

Production URL: `http://127.0.0.1:5678/webhook/youtube-meta-connection`.
Ez az agent host hálózati környezetéből igazoltan elérhető; sandboxban külön helyi
hálózati jogosultság szükséges. Nem helyi HTTP-cím tiltott, távoli címhez HTTPS kell.

## Automatizált és kézi próba

`make test` az összes automatizált ellenőrzés belépési pontja. Az új teljes flow-tesztek
a CLI-től natív n8n webhookon és HTTP node-okon át a fájlstátusz visszaírásáig futnak.
A YouTube API-t izolált helyi tesztdupla helyettesíti, az összes tesztworkflow HTTP
node-járól eltávolított valódi OAuth-credentiallel és helyi URL-lel. A módosító
próbák saját `/tmp` állapotmappát használnak, a production videófoglalást nem érintik.
Siker, tagságduplikáció, friss állapotellenőrzés, tiltott videó/állapot/csatorna,
párhuzamosság, részleges hiba, írási timeout és legfeljebb három visszaolvasás szerepel.
A tesztek végén a kezelt test workflow-k inaktívak, a helyi API-folyamatok és fájlok
törlődnek; a production webhook újra elérhető. A kezelt inaktív tesztdefiníciók az
n8n-ben maradnak, mivel a támogatott CLI nem biztosít workflow-törlő parancsot.

Kézi éles próba jóváhagyott JSON-nal:
`preflight`, majd `update`. Az eredmény `updated` és visszaolvasással igazolt legyen;
a videó maradjon privát a jövőbeli időzítéssel, a playlistben pontosan a kért tagsággal.
Az ismételt `update` helyben tiltott, nem küld újabb kérést. Nyilvános/időzített
videó elutasítása `preflight` hívással ellenőrizhető.
