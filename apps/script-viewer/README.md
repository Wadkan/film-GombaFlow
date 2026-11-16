# GombaFlow Script Reader

A böngészős olvasó a tagged MD-fájlt a felhasználó helyi fájlválasztójából nyitja meg, és a témákat, pipákat, olvasási pozíciót, valamint globális szűrőket a böngésző IndexedDB-tárában őrzi. Az eredeti MD-fájl változatlan marad. Azonos témájú MD frissítése megtartja a meglévő pipákat és pozíciót; a könyvtárból egy téma törölhető megerősítéssel.

A `tools/build-pwa.mjs` kizárólag az olvasót, a parsert és a böngészős modulokat csomagolja; projektpéldát vagy MD-tartalmat nem tesz a programba. A teljes PWA build és offline telepítés a későbbi checkpoint feladata.

## Pipák cseréje

Az aktív témában a **Pipák exportja** letölt egy dátumozott JSON-fájlt, amely minden aktuális részhez tartalmaz boolean pipát. A **Pipák importja** csak az aktív témához és annak létező részazonosítóihoz tartozó, érvényes fájlt fogad el; a megerősítés a fájl exportálási idejét mutatja. Az import logikai VAGY-ként egyesíti az értékeket: a már felvett rész pipája importtal nem törölhető. A kihagyott vagy hamis érték nem módosít igaz pipát.

## Ellenőrzés

A `make test-pwa` futtatja a parser-, build- és böngészős ellenőrzéseket. A Playwright tesztek ideiglenes buildet és helyi HTTP-kiszolgálót indítanak a rendszer ideiglenes könyvtárában, majd eltávolítják azokat. A `make test` részeként ez az ellenőrzés automatikusan lefut.
