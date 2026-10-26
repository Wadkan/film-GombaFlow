# Állandó videóstruktúra

A néző mindig az alábbi címekkel és sorrenddel találkozzon.
A kiválasztott sikeres forrásvideó megoldását ebbe a keretbe dolgozzuk át,
saját példával és megfogalmazással, nem új tartalomkísérletként.

A [kutatás](research_result.md) korai eredménybemutatását, adatút szerinti
megvalósítását és valódi funkcionális tesztjét vesszük át. A kötött címek,
összehasonlítás és CTA csatornaszintű szerkesztői döntések, nem bizonyított
teljesítménygaranciák. Nem végzünk nézettségi vagy formátumteszteket.

## Nézői sorrend és kötött címek

| ID  | Cím                      | Kötelező tartalom                                                                                               |
| --- | ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| H   | Hook                     | Konkrét probléma és teljesíthető ígéret; rövid kérdés is lehet, például „Hogyan automatizálom ma a számlázást?” |
| C1  | A kész megoldás          | Tipikus input → futás → látható output rövid bemutatása, konfigurációmagyarázat nélkül.                         |
| C2  | Előtte és utána          | Gyors, párhuzamos összehasonlítás a [közös template](templates/comparison-template.md) szerint.                 |
| C3  | Szükséges szolgáltatások | Mi mire való; ingyenes/fizetős, account/API-igény és lényeges korlát. Nem hosszú telepítési kézikönyv.          |
| C4  | Megvalósítás             | Követhető építés a megoldás adatútja szerint; témaspecifikus alfejezetek és köztes ellenőrzések.                |
| C5  | Teszt és korlátok        | Teljes input → futás → output, legalább egy releváns hibás/határeset, költség és emberi felügyelet.             |
| C6  | Mit oldottunk meg?       | Elért eredmény, megmaradó emberi feladat és fő korlát; nem a teljes megvalósítás újramesélése.                  |
| CTA | Következő lépés          | Az alábbi rögzített zárószöveg.                                                                                 |

A felső szintű címek és sorrend maradnak; egyszerű témánál rövidebb a tartalmuk,
nem kapnak véletlenszerű új elnevezést. A C4 alfejezetei témánként változhatnak,
de stabil azonosítót kapnak, például `C4.1`. Nem releváns technikai lépést nem
kell kitalálni a szerkezet kedvéért.

Minden egységhez, a hookot és CTA-t is beleértve, készüljön rövid tevékenységleírás,
bevezető kártyaszöveg és átvezetés; a hooknál az átvezetés maga a nyitómondat.
Ezek szöveges tartalmak, nem grafikai vagy animációs tervek.

## Tempó és részletesség

- A hook és C1 gyorsan mutassa meg, miért érdemes végignézni a videót.
- A C2 rövid, képernyőre vihető listapontokból álljon.
- A leghosszabb rész a C4; minden logikai blokk végén legyen látható köztes
  eredmény vagy ellenőrzési pont, ne puszta beállításfelolvasás.
- A szükséges telepítés és konfiguráció a C4-ben követhető, a C3 csak áttekintés.
- A teljes hossz és részletesség a forrás megoldásához és a briefhez igazodik;
  nincsenek kötelező másodpercek, arányszámok vagy próbavideós versenyeztetés.
- A technikai teljesség és felvétel szabályait a [CONTENT_RULES.md](CONTENT_RULES.md)
  tartalmazza; az egyes skillek nem definiálhatják újra őket.

## Rögzített CTA

„Ha nem szeretnél lemaradni, iratkozz fel a YouTube-csatornámra!
Ha pedig inkább kényelmesen velem végeztetnéd el a munkát, vagy konzultációt
kérnél, keress a gombaflow.eu oldalon!”
