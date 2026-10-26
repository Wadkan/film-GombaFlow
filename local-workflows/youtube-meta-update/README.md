# YouTube-metaadat frissítő hívó

A helyi agent a jóváhagyott, `ready` állapotú meta JSON-t ezen a CLI-n keresztül
küldi az n8n **production webhookjára**. A tényleges YouTube-módosítás az n8n
workflow feladata; ez az eszköz a workflow JSON-válaszát menti vissza a helyi
meta JSON-ba.

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

Az n8n JSON-válasza `status` mezőben `updated`, `error` vagy `unknown`
végállapotot adjon vissza. A válasz teljes objektuma `updateResult` mezőként
kerül a meta JSON-ba; a többi metaadatmező változatlan marad. A CLI `0` kóddal
fejeződik be `updated` esetén, `1` kóddal `error` vagy `unknown` esetén, és `2`
kóddal helyi bemeneti vagy konfigurációs hibánál.
