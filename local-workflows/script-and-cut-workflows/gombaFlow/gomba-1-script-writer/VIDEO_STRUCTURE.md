# Állandó videóstruktúra

A néző mindig az alábbi címekkel és sorrenddel találkozzon.
A kiválasztott sikeres forrásvideó megoldását ebbe a keretbe dolgozzuk át,
saját példával és megfogalmazással, nem új tartalomkísérletként.

A [kutatás](research_result.md) korai eredménybemutatását, adatút szerinti
megvalósítását és valódi funkcionális tesztjét vesszük át. A kötött címek,
összehasonlítás és CTA csatornaszintű szerkesztői döntések, nem bizonyított
teljesítménygaranciák. Nem végzünk nézettségi vagy formátumteszteket.

## Nézői sorrend és kötött címek

- **H — Hook:** az első 5 másodpercben nevezze meg a cím és thumbnail
  pain pointját, és mondja ki rögtön a lényeget: megoldjuk, vagy azt vizsgáljuk
  meg, megoldható-e egyáltalán. Az ígéret legyen teljesíthető és tényszerű.
- **O — Mit mutatok meg?:** közvetlenül a hook után rövid bulletpointos
  előzetes a videó fő lépéseiről; ne ismételje el a teljes fejezettervet.
- **C1 — A kész megoldás:** tipikus input → futás → látható output rövid
  bemutatása, konfigurációmagyarázat nélkül.
- **C2 — Előtte és utána:** gyors, párhuzamos összehasonlítás a
  [közös template](templates/comparison-template.md) szerint.
- **C3 — Szükséges szolgáltatások:** mi mire való; ingyenes/fizetős,
  account/API-igény és lényeges korlát. Nem hosszú telepítési kézikönyv.
- **C4 — Megvalósítás:** követhető építés a megoldás adatútja szerint;
  témaspecifikus alfejezetek és köztes ellenőrzések.
- **C5 — Teszt és korlátok:** teljes input → futás → output, legalább egy
  releváns hibás/határeset, költség és emberi felügyelet.
- **C6 — Mit oldottunk meg?:** elért eredmény, megmaradó emberi feladat és
  fő korlát; nem a teljes megvalósítás újramesélése.
- **CTA — Következő lépés:** az alábbi rögzített zárószöveg.

A felső szintű címek és sorrend maradnak; egyszerű témánál rövidebb a tartalmuk,
nem kapnak véletlenszerű új elnevezést. A C4 alfejezetei témánként változhatnak,
de stabil azonosítót kapnak, például `C4.1`. Nem releváns technikai lépést nem
kell kitalálni a szerkezet kedvéért.

Minden egységhez, a hookot és CTA-t is beleértve, készüljön rövid tevékenységleírás,
bevezető kártyaszöveg és átvezetés; a hooknál az átvezetés maga a nyitómondat.
Az O egység bulletpointjai külön Hyperframes-briefben is szerepelnek animálási
célból. A workflow csak ezt a szöveges briefet készíti el, nem generál animációt.

## Tempó és részletesség

- A hook és az O egység gyorsan mutassa meg, miért érdemes végignézni a videót;
  C1 rögtön ezután mutassa meg a működő megoldást.
- A C2 rövid, képernyőre vihető listapontokból álljon.
- A leghosszabb rész a C4; minden logikai blokk végén legyen látható köztes
  eredmény vagy ellenőrzési pont, ne puszta beállításfelolvasás.
- A szükséges telepítés és konfiguráció a C4-ben követhető, a C3 csak áttekintés.
- A hook teljes hossza és a videó többi részének hosszúsága a forrás megoldásához
  és a briefhez igazodik; az első 5 másodperces hook-követelményen kívül
  nincsenek kötelező másodpercek vagy arányszámok, és nincs próbavideós versenyeztetés.
- A technikai teljesség és felvétel szabályait a [CONTENT_RULES.md](CONTENT_RULES.md)
  tartalmazza; az egyes skillek nem definiálhatják újra őket.

## Rögzített CTA

„Ha nem szeretnél lemaradni, iratkozz fel a YouTube-csatornámra!
Ha pedig inkább kényelmesen velem végeztetnéd el a munkát, vagy konzultációt
kérnél, keress a gombaflow.eu oldalon!”
