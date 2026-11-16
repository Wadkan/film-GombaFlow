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
3. A `GombaFlowViewer.js` fájlt Megosztás → AirDrop segítségével küldd az iPhone-ra, majd add hozzá Scriptable-hoz. Ha a megosztási menüben nem szerepel, másold ki a teljes kódot, Scriptable-ben a **+** gombbal hozz létre scriptet, és illeszd be.
4. Első alkalommal AirDropold át a kiválasztott tagged `.md` scriptet, és mentsd a Fájlok alkalmazásban egy helyi, letöltött példányként elérhető mappába. Indítsd el a GombaFlowViewer-t, és válaszd ki az MD-t. A script ellenőrzés után a Scriptable saját dokumentumai közé menti, így a következő indítás fájlválasztás nélkül folytatja az utolsó scriptet és részt.
5. A Home Screen indításhoz hozz létre iOS Shortcutot, amely az **Open URLs** művelettel ezt nyitja meg: `scriptable:///run/GombaFlowViewer`. A Shortcut részleteinél válaszd az **Add to Home Screen** lehetőséget. Ezzel közvetlenül a Scriptable-ben futó, teljes képernyős néző nyílik meg.
6. A néző **Scriptek** gombjával nyithatsz meg korábban mentett témát, törölhetsz témát megerősítés után, vagy a **Másik MD megnyitása…** gombbal választhatsz új fájlt. A kiválasztás megszakítása vagy egy hibás MD nem cseréli le a mostani scriptet.

A `viewer-state.json` és témánkénti MD-másolat a Scriptable helyi dokumentumtárában marad. A mentett script, pipák, globális szűrők/típusbeállítások, keresés, a felső és alsó sáv becsukott állapota és az utolsó rész újraindítás után visszaállnak; nincs hálózati függőség. A repository marad a hosszú távú biztonsági másolat. Törlés előtt exportfunkció még nincs; a repo eredeti MD-jét ez a néző soha nem módosítja.

A Home Screen és az offline újraindítás tényleges működését iPhone-on ellenőrizd: válassz egy későbbi részt, várd meg az „Offline mentve” jelzést, kapcsold be a repülő módot, kényszerítsd a Scriptable bezárását, majd indítsd újra a Home Screen ikonról. A Shortcut a Scriptable-ben megadott `GombaFlowViewer` nevű telepített scriptet futtatja.

## Ellenőrzés

`make test-scriptable-viewer` futtatja a parser-, build-, host- és böngészős
ellenőrzéseket. A teljes generált program natív API-helyettesítőkkel is lefut;
a valódi Scriptable-megjelenítés csak iPhone-on igazolható.

A kézi próba során ellenőrizendő a fájlválasztó, a teljes képernyő, hosszú
részek görgetése, a billentyűzet melletti keresés, a szűrők és a lapozás.
A jelenlegi iPhone-próbát a felhasználó elvégezte.
