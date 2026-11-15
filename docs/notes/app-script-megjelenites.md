- **Lényeg:** erre egy apró, kezdőképernyőre kitehető **offline webapp (PWA)** a legegyszerűbb megfelelő megoldás.
- A generátor az **MD-ből készíti a mobilos nézetet**; első alkalommal interneten megnyitod és offline használatra eltárolja a scriptet és a felületet. [Offline működés](https://web.dev/learn/pwa/offline-data)
- Minden pipálást azonnal **IndexedDB-be ment**, projekt- és stabil lépés-ID alapján. Bezárás és újranyitás után visszaállítja; csak sikeres mentéskor jelzi: „Mentve”. [Helyi adattárolás](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/offline)
- Az újragenerált script ugyanazokkal az ID-kkal megtartja a kész állapotokat. Az MD az egyetlen szerkesztett tartalomforrás; a telefon az offline példányt és a pipákat tárolja.
- Kérjen **tartós tárhelyet**, és ellenőrizze, hogy a böngésző megadta-e. Ez csökkenti az automatikus törlés kockázatát; a webhelyadatok kézi törlése továbbra is törli a pipákat. [Tárolási feltételek](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
- **GombaFlow-hoz:** egy közös kis HTML/JS felület + MD-generátor elég; nincs szükség backend-adatbázisra vagy natív mobilappra.

TODO html app helyett?
ha nem jo a <> jeloles mert nem eleg megkulonboztetheto, javasolj jobbat, de ember szamara is konnyen olvashato legyen es ne legen nehany karakternel hosszabb a jeloles.
KONKRET HELYEK BEALLITASA DINAMIKUSAN
Dinamikus, mert ut kozben valtoztathato az appban!
appban tortenik a placeholderek behelyettesitese, ahol ki lehet valasztani az A, B... stb ertekeit (a GO marad igy), a TRAVEL pedig ertelemszeruen az oda es visszaut szerinti allomas lehet.

HIDE SHOW
Story board szerint talking head vs after effects elrejtese.
transition start: resz VEGE,
transition end: resz KEZDETE.

FILTER
Egyes reszek szerinti filter A,B, GO, stb.
Osszes, recorded vagy not recorded

SET TO RECORDED
Recorded: a resz fel lett veve.
