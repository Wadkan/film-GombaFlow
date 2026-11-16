# GombaFlow Script Viewer

## Generálás Macen

A repó gyökerében:

```sh
make scriptable-viewer
```

Írd be a kívánt `3-script.md` sorszámát és nyomj Entert.
Az `apps/script-viewer/output/` mappában két külön fájl készül:

- `GombaFlowViewer.js`: az egyszer telepítendő nézőprogram (S1 indítás).
- `<projekt>.md`: a kiválasztott tagged felvételi script változatlan másolata.

A generált output a felhasználó döntése szerint Gitben marad, így a kész
telepítő és az átviteli MD is megőrizhető. A helyi teszteredmények ignore alatt vannak.

Az MD nincs beépítve a telepített programba. Programfrissítéskor a `.js`-t,
tartalomfrissítéskor csak az `.md`-t kell újra átvinni. A régi projektnevű
`*-GombaFlowViewer.js` fájlokat ne használd.

## Telepítés és indítás iPhone-on

1. Telepítsd a Scriptable alkalmazást az App Store-ból.
2. A Mac Finderben nyisd meg az `apps/script-viewer/output/` mappát.
3. A `GombaFlowViewer.js` fájlt Megosztás → AirDrop segítségével küldd az iPhone-ra.
4. Add hozzá a Scriptable-hoz. Ha a megosztási menüben nem szerepel Scriptable,
   másold ki a `.js` teljes szövegét, Scriptable-ben a **+** gombbal hozz létre
   scriptet, és illeszd be. Frissítéskor a teljes régi kódot cseréld le.
5. A `<projekt>.md` fájlt is AirDropold át, és mentsd a Fájlok alkalmazásban
   egy helyi, letöltött példányként elérhető mappába.
6. Scriptable-ben koppints a GombaFlowViewer csempére. **Először a natív
   fájlválasztó jelenik meg.** Válaszd ki az MD-t. Megszakításkor nem nyílik olvasó.
7. A program beolvassa és ellenőrzi az MD-t, majd teljes képernyős nézőben
   megjeleníti az első részt és a teljes beszélt cue-t. Hibás tagged formátumnál
   **GombaFlow S1** hibaüzenet jelenik meg.

A program kiválasztás és betöltés után nem használ folyamatos natív
parancshidat, időzítős lekérdezést vagy WebView.evaluateJavaScript hívást.
A felhasználó az iPhone-próba elvégzését visszajelezte; verzióadatot nem adott meg.

Másik MD-hez zárd be a nézőt, indítsd újra a programot és válassz másik fájlt.
A **Másik MD…** gomb ezt a menetet jelzi. A megnyitás és olvasás helyi MD-vel
hálózat nélkül is működhet; egy csak felhőben elérhető fájlt előbb le kell tölteni.

## A jelenlegi checkpoint határa

A szűrés, keresés, lapozás és pipálás az aktuális futásban működik.
**A pipák és a megnyitott script újraindítás után nem állnak vissza.**
A tartós offline könyvtár és fájlalapú pipamentés a következő, 3. checkpoint.
A mostani program nem írja át a bemeneti MD-t és nem ment felvételi állapotot.

## Ellenőrzés

`make test-scriptable-viewer` futtatja a parser-, build-, host- és böngészős
ellenőrzéseket. A teljes generált program natív API-helyettesítőkkel is lefut;
a valódi Scriptable-megjelenítés csak iPhone-on igazolható.

A kézi próba során ellenőrizendő a fájlválasztó, a teljes képernyő, hosszú
részek görgetése, a billentyűzet melletti keresés, a szűrők és a lapozás.
A jelenlegi iPhone-próbát a felhasználó elvégezte.
