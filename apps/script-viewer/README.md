# GombaFlow Script Reader

A böngészős olvasó a tagged MD-fájlt a felhasználó helyi fájlválasztójából nyitja meg, és a témákat, pipákat, olvasási pozíciót, valamint globális szűrőket a böngésző IndexedDB-tárában őrzi. Az eredeti MD-fájl változatlan marad. Azonos témájú MD frissítése megtartja a meglévő pipákat és pozíciót; a könyvtárból egy téma törölhető megerősítéssel.

A `tools/build-pwa.mjs` kizárólag az olvasót, a parsert, a böngészős modulokat és az offline működéshez szükséges manifestet, ikont és service workert csomagolja; projektpéldát vagy MD-tartalmat nem tesz a programba. Az offline állapot csak a teljes programcsomag cache-elése és az oldal service worker általi vezérlése után jelenik meg késznek.

## Offline használat és programfrissítés

Az első online megnyitáskor a service worker letölti a teljes programot és az ikont. A **Offline kész** állapot után a mentett MD-k és pipák hálózat nélkül is használhatók. A böngésző IndexedDB-tára különálló a program cache-étől.

A frissítés ellenőrzése az alkalmazás indulásakor történik, amikor a Macen futó helyi kiszolgáló és tunnel elérhetővé teszi az új buildet. A hálózat visszatérésekor külön frissítésellenőrzés nem követelmény.

Az új programverzió a nyitott ablakok mellett települ, de a régi munkamenetet nem váltja le. Zárd be az alkalmazás összes ablakát, majd nyisd meg újra; ekkor az új verzió indul, a helyi MD-k és olvasási állapot megmarad. Ha egy frissítés hiányos vagy sikertelen, az aktív verzió és annak cache-e marad használható. Visszaállításhoz a kívánt forrásverziót kell ugyanazon az originon újra kiszolgálni, majd megvárni a worker aktiválását; a böngészőadatok törlése nem szükséges.

## Helyi indítás és mobilos HTTPS-elérés

Futtasd a projekt gyökeréből a `make pwa-start` parancsot, és nyisd meg a [helyi PWA-t](http://127.0.0.1:8787/). Ha a tunnel konfigurációs fájlja létezik, az indító a Cloudflare Tunnelt is elindítja. Beállítás nélküli gépen a PWA helyben érhető el. A leállításhoz nyomj `Ctrl+C`-t.

A mobiltelepítéshez egy állandó, Cloudflare által kezelt domain és egy helyben kezelt, named Cloudflare Tunnel szükséges. Telepítsd a `cloudflared` eszközt, jelentkezz be a Cloudflare fiókba, majd egyszer hozd létre vagy használd újra a `gombaflow-pwa` nevű tunnelt. A tunnel konfigurációja legyen a `~/.cloudflared/gombaflow-pwa.yml` fájlban: az első ingress szabály a kiválasztott hostname-et a `http://127.0.0.1:8787` címre irányítja, az utolsó ingress szabály pedig `http_status:404`; hozz létre DNS útvonalat ehhez a hostname-hez is. Ne tedd a konfigurációt vagy a tunnel hitelesítő adatokat a repositoryba, és ne írd felül a meglévő konfigurációt. Részletek: [Cloudflare helyben kezelt tunnel beállítása](https://developers.cloudflare.com/tunnel/features/locally-managed-tunnels/create-local-tunnel/).

A `PWA_TUNNEL` (alapérték: `gombaflow-pwa`) és `PWA_TUNNEL_CONFIG` (alapérték: `~/.cloudflared/gombaflow-pwa.yml`) felülírható környezeti változó. A `PWA_HOSTNAME` opcionális. Ha megadod, az indító kiírja a nyilvános URL-t, és hiányzó tunnel konfiguráció esetén hibát jelez. A telepítést vagy frissítést végző eszköz mobiladat-kapcsolaton is nyissa meg a konfigurált HTTPS-címet, és várja meg a **Offline kész** állapotot. Offline használathoz a Mac és a tunnel ezután leállítható.

A hostname-et és portot ne változtasd meg a telepítések között, különben a böngésző külön helyi adattárat használ.

## Pipák cseréje

Az aktív témában a **Pipák exportja** letölt egy dátumozott JSON-fájlt, amely minden aktuális részhez tartalmaz boolean pipát. A **Pipák importja** csak az aktív témához és annak létező részazonosítóihoz tartozó, érvényes fájlt fogad el; a megerősítés a fájl exportálási idejét mutatja. Az import logikai VAGY-ként egyesíti az értékeket: a már felvett rész pipája importtal nem törölhető. A kihagyott vagy hamis érték nem módosít igaz pipát.

## Ellenőrzés

A `make test-pwa` futtatja a parser-, build- és böngészős ellenőrzéseket, köztük az offline újranyitás és frissítés valós service workeres tesztjét. A Playwright tesztek ideiglenes buildet és helyi HTTP-kiszolgálót indítanak a rendszer ideiglenes könyvtárában, majd eltávolítják azokat. A `make test` részeként ez az ellenőrzés automatikusan lefut.
