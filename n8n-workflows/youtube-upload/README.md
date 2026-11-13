# YouTube Studio automatizálás

Az n8n sikeres API-frissítése **után** futó, külön Python Playwright-lépés.
A meglévő CLI továbbra is csak `ready` bemenetet fogad; ez a script csak
`updated` JSON-t és egyező `updateResult.videoId` mellett sikeres
`updateResult.status: updated`, `step: verification`, `partialSuccess: false`
eredményt fogad. Nem hívja az n8n-t, és sem a metaadatfájlt, sem az
`updateResult` mezőt nem írja át. A jóváhagyást és az alkalmazási engedélyt
az agent kezeli; nincs új jóváhagyási kérdés a scriptben.

## Telepítés

Python 3.12+, grafikus munkamenet és a Playwright által támogatott operációs
rendszer szükséges. A repó gyökeréből:

```sh
python3 -m venv n8n-workflows/youtube-upload/.venv
n8n-workflows/youtube-upload/.venv/bin/python -m pip install -r n8n-workflows/youtube-upload/requirements.txt
n8n-workflows/youtube-upload/.venv/bin/python -m playwright install chromium
```

Linux CI-n a rendszerfüggőségekhez szükség lehet a
`python -m playwright install --with-deps chromium` parancsra is a fenti
virtuális környezetből. A `.venv/` és a Python cache Gitből kizárt.
A Playwright és tranzitív Python-függőségei rögzített verziójúak;
a böngészőverziót a Playwright telepítője választja hozzájuk.
Telepítési referencia: [Playwright Python](https://playwright.dev/python/docs/library).

## Első kézi bejelentkezés

```sh
make -C n8n-workflows/youtube-upload login
```

A megnyitott Chromiumban jelentkezz be kézzel a Google-fiókba, válaszd ki
a megfelelő csatornát, majd zárd be a böngészőablakot. Erre 10 perc van.
A script nem olvas jelszót, nem kezeli automatikusan a belépést és nem készít
bejelentkezési képernyőképet. A Google által kért ellenőrzések kézi feladatok;
a bejelentkezési korlátozásokat nem kerüli meg.
A `login-window-closed` eredmény csak az ablak lezárását jelenti;
a munkamenetet és a csatornát a következő `studio` futás ellenőrzi.

A külön tartós profil helye:
`~/.config/film-gombaflow/youtube-studio/` (könyvtárjogosultság: `700`).
Ez helyi munkamenettitkokat tartalmaz: ne másold a repóba, ne oszd meg.
A mindennapi Chrome-profilt a script nem használja. Egy profilhoz egyszerre
csak egy `login` vagy `studio` folyamat tartozhat.

Mindkét target felülírható `PYTHON=/teljes/út/python` és
`PROFILE=/repón/kívül/youtube-studio` paraméterrel. A profil utolsó
útvonaleleme kötelezően `youtube-studio`; repón belüli vagy symlinkkel oda
mutató útvonal elutasított. Lejárt/hiányzó munkamenetnél a `studio`
`LOGIN_REQUIRED` hibát és a `login` parancsot adja, nem vár belépésre.

## Futtatás

A JSON és az alkalmazás user általi engedélyezése után az agent előbb a
meglévő CLI `preflight`, majd `update` parancsát futtatja. Csak sikeres
n8n-eredmény után:

```sh
make -C n8n-workflows/youtube-upload studio META="/teljes/út/meta.json"
```

A futás a JSON `videoId`, `youtubeChannelId`, `playlistId`, `defaultLanguage`, `thumbnailPrompt`
mezőiből dolgozik, angol Studio-felületet kér (`hl=en`, `en-US`). Az aktuális
csatorna és a megnyitott videó azonosítóját, valamint a videó kijelölt
playlistjei között a JSON-playlist jelenlétét ellenőrzi. A megjelenített név
nem azonosítási bizonyíték. A böngészőben renderelt, megfelelően szűkített
komponensek linkjeit és a Studio-komponensek olvasható adatmodelljét vizsgálja;
ha az ID nem állapítható meg egyértelműen, megáll.

A beszélt videó „Video language” mezőjét állítja, menti, majd teljes
újratöltés után ellenőrzi. Az összetett nyelvválasztónál a lenyitott opció
`aria-selected` állapotát olvassa; a feliratot és súgót nem tekinti értéknek.
Az egymásba ágyazott gomboknál a legbelső megfelelő vezérlőt használja;
különálló, azonos nevű gomboknál nem választ önkényesen. A playlistválasztót
„Select playlists” és „Playlists” felirattal is kezeli.
Ezután a záróképernyőn pontosan egy videót
(„Best for viewer”), egy playlistet (JSON `playlistId`) és egy feliratkozást
(JSON `youtubeChannelId`, az előzőleg ellenőrzött aktuális csatorna) állít be.
A megfelelő elemeket változatlanul hagyja; eltérésnél a meglévő legfeljebb négy
elemet a szerkesztő piszkozatából törli, és a kért sablont alkalmazza.
Ez felülírja a korábbi egyedi záróképernyőt és annak időzítését/elrendezését.
Mentés után újratölti a videót, újranyitja a szerkesztőt és ismét ellenőrzi
mindhárom értéket. A privát/időzített videó láthatósági tájékoztatása nem hiba.

A YouTube nem minden videón enged záróképernyőt (például a túl rövid és a
made-for-kids videóknál); lásd a
[YouTube feltételeit](https://support.google.com/youtube/answer/6388789?hl=en).
Nem támogatott UI, hiányzó vezérlő, eltérő ID vagy lejárt várakozás hibát eredményez.
A vezérlőnkénti timeout 20 másodperc, az indításé 30 másodperc;
nincs automatikus mentési retry vagy koordinátás kattintás. Az automatizált UI-műveletek várakozása korlátos; a kézi átvétel az ablak bezárásáig tart.

## Ask Studio és kézi átvétel

A jóváhagyott MD végén, a metaadatokkal együtt készül a
`## YouTube thumbnail prompt` szakasz. Az MD jóváhagyásakor az agent a teljes
promptot változtatás nélkül a JSON `thumbnailPrompt` mezőjébe másolja.
Nincs külön jóváhagyási kör. A mező nem üres szöveg; nem része a YouTube
leírásának. A régi JSON-okból hiányzó promptot előbb egyeztesd a userrel.
Az API CLI a régi JSON-okat továbbra is elfogadja; a Studio-lépéshez a prompt
kötelező. Az n8n nem alkalmazza ezt a mezőt a YouTube Data API-n.

A sikeres nyelv- és záróképernyő-ellenőrzés után a script megnyitja az Ask Studio
panelt. Az „Add files, reference videos, and more” → „Select your video”
választóban videoId alapján keres, a találatot a thumbnail URL-jének ID-jával
azonosítja, majd ellenőrzi a kiválasztott címke megjelenését. Meglévő csatolást
csak igazolható, egyező videoId mellett használ; meglévő eltérő piszkozatot
nem ír felül. Az „Ask something” mezőbe thumbnail készítésére kérő bevezetőt
és a JSON teljes promptját illeszti, majd ellenőrzi a mezőt. Nem nyom Entert,
nem küldi el a promptot, és nem indít generálást vagy képfeltöltést.

A böngésző előtérbe kerül. A script stderrre azonnal jelzi a kézi átvételt;
a folyamat és a profilzár az ablak bezárásáig életben marad. Ekkor a stdout
végső JSON-ja visszaadja az automatizált előkészítés eredményét. A hívó agent
ne várjon a kézi munkára a chatválasszal: az átadás jelzésekor tájékoztassa a
usert, és hagyja futni a terminálfolyamatot. A kézi generálás eredményét a script
nem ellenőrzi. Hiányzó Ask Studio vagy nem igazolható kontextus külön
`thumbnail` hibát ad; a korábbi `verified` beállítások megmaradnak. Ez nem ok
az n8n-frissítés megismétlésére.

Az Ask Studio angol feliratát, mezőjét és videóválasztóját a natív Chrome
felületén ellenőriztük. Az ID-t adó DOM-adatok és a teljes Playwright-futás
éles igazolása továbbra is külön próba tárgya; a helyi fixture ezt nem bizonyítja.

## Eredmény és hiba

A script stdoutja egyetlen JSON-sor; a napló stderrre megy. Gépi hívónál a
Make saját könyvtárüzenetei a `make --no-print-directory -C ...` kapcsolóval
elnyomhatók. A bemeneti fájl változatlan marad minden kimenet mellett.

- `status: success`: a két Studio-beállítás visszaellenőrzött és az Ask Studio promptja előkészített.
- `status: error`: az aktuális lépés sikertelen.
- `status: unknown`: legalább egy megkísérelt mentés nem igazolható.
- `steps.identity`, `steps.language`, `steps.endscreen`: `pending`,
  `save-unverified` vagy `verified`.
- `steps.thumbnail: prepared`, `step: handoff`, `generationStarted: false`: a prompt kitöltött, a generálás kézi feladat.
- Hiba esetén `code`, `message`, `step`, `partialSuccess`, `uncertainSteps`
  jelzi a hibát, a korábbi visszaellenőrzött sikert és a bizonytalan mentést.
- Script-kilépés: `0` siker; `2` bemeneti/környezeti hiba indítás előtt;
  `1` futás közbeni hiba vagy bizonytalan mentés. A Make a nem nulla
  scriptkódot saját nem nulla hibakódjával jelzi.

Bizonytalan eredménynél az agent ellenőrizze a valós Studio-állapotot;
ne állítsa vissza a metaadat `updated` státuszát, és ne ismételje az n8n update-et.
Az ismételt Studio-futás újra olvassa a mentett állapotot, így nem fűz hozzá
dupla elemeket. Ideiglenes zárolás a `/tmp` alatt van; a tesztprofilok és
segédfájlok szintén oda kerülnek. A script nem készít képernyőképet vagy trace-t.

## Automatizált ellenőrzés és igazolás határa

```sh
make test
# Csak ez a komponens:
make -C n8n-workflows/youtube-upload test
# Másik virtuális környezettel a teljes suite:
make test STUDIO_PYTHON=/teljes/út/python
```

A gyökér `make test` kötelezően futtatja ezt a suite-ot is. Hiányzó
Playwright/Chromium esetén hibázik, nem hagyja ki zöldként a böngészős teszteket.
Valódi headless Chromium egy loopback HTTP tesztoldallal dolgozik; a tesztek
minden külső hálózati kérést blokkolnak. Lefedik a reload/újranyitás utáni
ellenőrzést, ismétlést, duplikátumok cseréjét, azonos nevű playlistet, eltérő
csatornát/videót/playlistet/feliratkozást, hiányzó belépést, részleges sikert,
elveszett mentéseket, a profil megőrzését és a bemeneti szerződést.

**Éles YouTube Studio működés még nincs igazolva.** A helyi oldal a támogatott
DOM-szerződés tesztduplája; nem bizonyítja, hogy a mindenkori Studio felületén
ugyanezek a szelektorok és komponens-adatmezők érhetők el. A Google változó,
nem verziózott felülete miatt külön engedélyezett éles próbára és esetleg
szelektorillesztésre lesz szükség. Az automatizálás hiányzó bizonyítéknál
hibát ad, nem állít sikert. Éles próbát a tesztek nem indítanak.
