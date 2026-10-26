# YouTube-metaadat frissítő hívó

A helyi agent a jóváhagyott, `ready` állapotú meta JSON-t ezen a CLI-n keresztül
küldi az n8n **production webhookjára**. A tényleges YouTube-módosítás az n8n
workflow feladata; ez az eszköz a workflow JSON-válaszát menti vissza a helyi
meta JSON-ba.

## Jelenleg használható: kapcsolatpróba

A védett kapcsolat és bemenetellenőrzés működik. A `check` nem hívja a YouTube API-t;
a sikerének státusza `validated`, nem `updated`. A `check` sem a helyi
JSON-t, sem a YouTube-ot nem módosítja, és nem foglal le frissítést.

A már telepített helyi workflow kipróbálása a repó gyökeréből:

```sh
python3 local-workflows/youtube-meta-update/youtube_meta_update.py check \
  local-workflows/youtube-meta-update/examples/connection-check.json
```

Elvárt: `status: validated`, `step: connection`, `youtubeModified: false`,
és `0` kilépési kód. A példaazonosítók szándékosan nem valódi videó- és
playlistazonosítók; ezekkel a `preflight` nem adhat sikeres YouTube-ellenőrzést.

Az `update` jelenleg `501 / UPDATE_NOT_IMPLEMENTED` hibával áll le. Ez
szándékos védőkapu, nem sikeres frissítés: a helyi fájl `error` állapotú lesz,
az n8n futás pedig hibásként zárul. Valódi meta JSON-on még ne használd.

## YouTube-előellenőrzés most

A `preflight` a meglévő n8n `YouTube account` credentiallel három natív HTTP Request
GET node-ot futtat. Ellenőrzi a hitelesített csatornát, a videó létezését és tulajdonosát,
a jelenlegi privát és még nem időzített állapotot, majd a playlist elérhetőségét és csatornáját.
A videó csak `privacyStatus: private`, üres/hiányzó `status.publishAt` esetén elfogadható.
A bemenetben csak valós, időzónás, jövőbeli időpont fogadható el.

A meglévő jóváhagyott meta JSON kizárólag olvasási ellenőrzése:

```sh
python3 local-workflows/youtube-meta-update/youtube_meta_update.py preflight \
  local-workflows/youtube-meta-update/channels/FreezWithMe/youtube-metas/20260730_drava_sup_testfolder.json
```

Elvárt megfelelő, privát és nem időzített videónál: `status: validated`,
`step: youtube-preflight`, `youtubeModified: false`, `0` kilépési kód.
Ez a parancs nem módosítja a meta JSON-t, nem foglal le frissítést, és nem ír a YouTube-ra.
Az `update` továbbra is szándékosan `UPDATE_NOT_IMPLEMENTED` hibával leáll.

Kézi elutasításpróba: készíts másolatot a fenti JSON-ról `/tmp/youtube-preflight-manual.json`
néven, a `videoId` mezőt állítsd egy saját nyilvános vagy már időzített videóra,
majd futtasd ugyanezt a `preflight` parancsot a másolaton. Elvárt:
`VIDEO_NOT_PRIVATE` vagy `VIDEO_ALREADY_SCHEDULED`, és az `executionId` szerinti
n8n-futás hibás. Hibás videoId esetén `VIDEO_NOT_FOUND`; nem elérhető playlistnél
`PLAYLIST_NOT_FOUND`. A másolat státusza minden esetben változatlan marad.
Lejárt bemeneti dátum esetén a helyi CLI már a webhook hívása előtt hibát ad;
a kézi próbához mindig jövőbeli, időzónás dátum kell.

A csatornaregiszter `youtubeCredential` mezője kizárólag a meglévő n8n credential
azonosítóját, nevét és típusát tárolja, tokent nem. A telepítő ebből köti a natív
node-ok credentialjét; jelenleg egy aktív csatornát támogat. A regiszter és a telepített
kötés eltérésekor hibával leáll. Új credential létrehozása vagy OAuth-kezelő kód nincs.
A production API-címek rögzített Google HTTPS-címek, kliensadat nem írhatja át őket,
átirányítás nincs engedélyezve, API-kérésenként 15 másodperces timeout érvényes.

API-hibánál a válasz a lépést és a szolgáltató hibakódját/üzenetét is visszaadja
(`youtubeError`), transporthibánál biztonságos timeout/hitelesítési hibát jelez.
Az n8n ezután `Stop And Error` node-dal hibásként zárja le a futást.

## Workflow telepítése vagy frissítése

```sh
python3 n8n-workflows/scripts/install-youtube-meta-connection.py
```

Az eszköz csak a `youtubeMetaConnection` workflow-t és annak külön Header
Auth credentialjét importálja; az egyéb workflow-khoz/credentialökhöz nem nyúl.
A titkot automatikusan hozza létre a repón kívüli klienskonfigurációban, illetve
titkosított n8n credentialben. Meglévő, más webhookra mutató klienskonfigurációt
nem ír felül; külön fájlt a `--config /repón-kívüli/útvonal.json` kapcsolóval adhatsz meg.
A jelenlegi Compose-mountokat alkalmazza, majd röviden újraindítja csak az n8n
szolgáltatást a publikált webhook aktiválásához; a volume-okat megőrzi.
Az import/export a meglévő `n8n-workflows` Makefile-célokkal történik, az új
workflow-ra korlátozva (`WORKFLOW_ID=youtubeMetaConnection`).

A production webhook: `http://127.0.0.1:5678/webhook/youtube-meta-connection`.
Ez a helyi agent host hálózati névteréből igazoltan elérhető. Sandboxból a
helyi hálózati hozzáférés engedélyezése szükséges; nem elérhető címre nem
indulhat automatikus újrapróbálás. Más hálózati névtérből a host megfelelő
HTTPS-címét kell beállítani; távoli sima HTTP tiltott.

## Egyszeri beállítás

Futtasd a repó gyökeréből:

```sh
python3 local-workflows/youtube-meta-update/youtube_meta_update.py configure
```

Add meg az n8n aktivált workflow-jának production webhook URL-jét, majd az n8n
Header Auth credentialben beállított fejléc nevét és titkát. A titok rejtve
marad a terminálon. Az eszköz a beállítást a repón kívül tárolja itt:

```text
~/.config/film-gombaflow/youtube-meta-update.json
```

A fájl jogosultsága `600`, a könyvtáré `700`. Ha más helyet szeretnél, add meg
a `configure` parancs `--config <útvonal>` kapcsolójával; a konfiguráció nem
helyezhető a repóba. Meglévő konfigurációt a CLI nem ír felül: töröld vagy
szerkeszd kézzel, majd futtasd újra a beállítást.

## Frissítés indítása

```sh
python3 local-workflows/youtube-meta-update/youtube_meta_update.py update \
  local-workflows/youtube-meta-update/channels/FreezWithMe/youtube-metas/<videó>.json
```

Egyedi konfigurációval és rövidebb várakozási korláttal:

```sh
python3 local-workflows/youtube-meta-update/youtube_meta_update.py update \
  <meta.json> --config <kliens-konfiguráció.json> --timeout 30
```

Csak teljes és érvényes, `ready` státuszú bemenetet küld el. A teljes HTTP POST
legfeljebb 120 másodpercig vár (a `--timeout` ezt csökkentheti), és a CLI nem
ismétli meg a kérés küldését sem timeout, sem hiba esetén. A timeout, a
kapcsolat megszakadása vagy az értelmezhetetlen válasz `unknown` eredményként
kerül a meta JSON-ba, mert a YouTube-módosítás megtörténte ilyenkor nem
igazolható. Ilyen esetben ellenőrizd az n8n futást és a YouTube állapotát, mielőtt
új kérést indítasz.

Az `update` videónként nem blokkoló fájlzárat tart a host ideiglenes
`film-gombaflow-<uid>/` könyvtárában, és a kérés előtt atomikusan `updating`
állapotot ment. A webhook az eredeti `ready` tartalmat kapja. Második indítás
`updating`, `updated`, `unknown` vagy `error` állapotból tiltott. A fájlzár
folyamatkilépéskor elenged, a megmaradó `updating` állapot továbbra is blokkol.

Az n8n emellett atomikus, kizárólagos fájllétrehozással videónként tartós
foglalást ment a meglévő `n8n_data` volume
`/home/node/.n8n/youtube-meta-update/` mappájába. Ez konténer-újraindítás és
azonos videó más JSON-fájlból indítása ellen is véd. Foglalást nem töröl
automatikusan: hiba vagy bizonytalan állapot után előbb az n8n-futást és a
tényleges YouTube-állapotot kell ellenőrizni, majd külön kérésre lehet
egyeztetett újraindítást előkészíteni. Automatikus feloldás nincs.

## Hibák az n8n-ben

A kezelt hibák `Respond to Webhook` node-on keresztül megfelelő HTTP-kóddal,
`status`, `step`, `code`, `message`, `partialSuccess`, `youtubeModified` és
`executionId` mezővel térnek vissza. A következő `Stop And Error` node a futást
hibásként zárja. Az `executionId` alapján az n8n Executions nézetében
megtalálható a hiba. A parancs- vagy válaszfeldolgozó node váratlan hibája is
ugyanerre a hibás válasz/futás útvonalra kerül, nem általános sikerre.
A natív Header Auth már a workflow indítása előtt 403-mal utasítja el a hibás
hitelesítést; ez nem indít workflow-futást.

A workflow feldolgozási korlátja 90 másodperc, a helyi parancsfolyamaté
85 másodperc, a kliens teljes kéréskorlátja legfeljebb 120 másodperc. A YouTube-előellenőrzés API-kérésenkénti timeoutja 15 másodperc. Kényszerű workflow-leállítás vagy
kapcsolatszakadás esetén a kliens `unknown` állapotot rögzít és blokkolja az
újrapróbálást.

## Kézi hibapróba most

1. A fenti `check` parancs után a példa JSON maradjon változatlan.
2. Hitelesítés nélkül küldj próbát:
   `curl -i -X POST http://127.0.0.1:5678/webhook/youtube-meta-connection`.
   Elvárt: 403, nincs indult n8n-futás.
3. Az `update` védőkapujához készíts külön tesztpéldányt és egyedi teszt-ID-t:

```sh
python3 - <<'PY'
import json, pathlib, uuid
value = json.loads(pathlib.Path('local-workflows/youtube-meta-update/examples/connection-check.json').read_text())
value['videoId'] = 'connection-test-' + uuid.uuid4().hex
pathlib.Path('/tmp/youtube-meta-manual.json').write_text(json.dumps(value, indent=2))
PY
python3 local-workflows/youtube-meta-update/youtube_meta_update.py update /tmp/youtube-meta-manual.json
```

Elvárt: `UPDATE_NOT_IMPLEMENTED`, a tesztfájl státusza `error`, az n8n-ben
ugyanazzal az `executionId`-val hibás futás. A parancsot ugyanazzal a fájllal
újra futtatva helyi tiltás történik, nem új webhookkérés. Valódi videóadatot
ez a próba nem használ.

## Automatizált flow-tesztek

`make test` futtatja a helyi tesztwebhookos kliensfolyamatokat és a telepített,
valódi helyi n8n connection-flow tesztjeit. A live tesztekhez fusson a stack és
a fenti telepítő; más konfigurációt a `YOUTUBE_META_TEST_CONFIG` környezeti
változóval adhatsz meg. Csak a helyi connection webhook elfogadott. A tesztek
egyedi, nem valódi YouTube-azonosítókat használnak, és nem hívják a valódi YouTube API-t.
Ellenőrzik a védett sikeres kapcsolatot, a bemeneti hibát és a valóban hibás
n8n-futást, a blokkolt írást, valamint a szerveroldali tartós és párhuzamos
duplázásvédelmet. A helyi tesztwebhook a timeoutot és a fájlállapotot is vizsgálja.

Az n8n JSON-válasza `status` mezőben `updated`, `error` vagy `unknown`
végállapotot adjon vissza. A válasz teljes objektuma `updateResult` mezőként
kerül a meta JSON-ba; a többi metaadatmező változatlan marad. A CLI `0` kóddal
fejeződik be `updated` esetén, `1` kóddal `error` vagy `unknown` esetén, és `2`
kóddal helyi bemeneti vagy konfigurációs hibánál.

A YouTube-preflight flow-tesztek a `youtubeMetaPreflightTest` izolált n8n workflow-t
aktiválják a futás idejére. Ez ugyanazokat a natív node-okat használja helyi API-tesztduplával,
YouTube OAuth credential nélkül. A production webhook és credential kötése változatlan.
A tesztek után a teszt-workflow inaktív marad, a teszt API-folyamat és annak `/tmp` fájljai
eltűnnek. A setup/cleanup röviden újraindítja az n8n szolgáltatást. Sikeres előellenőrzést,
nyilvános/időzített videó tiltását, csatornaeltérést, hiányzó videót/playlistet, API-hibát
és timeoutot vizsgálnak, és ellenőrzik a JSON változatlanságát és a hibás n8n-futást.
