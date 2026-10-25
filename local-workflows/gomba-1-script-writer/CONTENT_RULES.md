# Közös tartalmi és felvételi szabályok

A [kutatás](research_result.md) tömör, végrehajtásra kijelölt tanulságai.
Nem cél a sikeresnek kiválasztott forrás újraminősítése vagy formátumkísérletezés.
A fejezetsorrendet és CTA-t kizárólag a [VIDEO_STRUCTURE.md](VIDEO_STRUCTURE.md) adja.

## Átdolgozás és technikai teljesség

- A forrás üzleti problémájára és megvalósított megoldására építs; a saját példa,
  narráció és közös fejezetszerkezet ne változtassa észrevétlenül a scope-ot.
- Ne másold a forrás szövegét vagy egyedi történetét. A brief azonosítsa a
  felhasznált forrásokat és a megtartott/átalakított elemeket.
- Az elemzés alapját jelöld: videó, átirat vagy leírás. Átiratból ne találj ki
  képi részleteket; kritikus hiánynál kérj hozzáférhető anyagot vagy pontosítást.
- Minden szükséges telepítés, account, credential, jogosultság, konfiguráció,
  kód, expression, prompt, aktiválás és futtatás legyen reprodukálhatóan leírva.
  Ami nem szükséges az adott megoldáshoz, ne szerepeljen mesterségesen.
- Logikai blokkonként legyen kiinduló állapot, művelet, várt output és
  ellenőrzési pont. A teljes teszt a megvalósítás eredményét mutassa, ne csak ábrát.
- Térj ki releváns hibára/határesetre, hibafelismerésre és emberi ellenőrzésre.
- Valódi API-kulcsot, személyes vagy ügyféladatot ne kérj be és ne írj ki.
  A felvételhez maszkolt vagy mesterséges példaadatot tervezz.

## Állítások és bizonyítékok

- A forrásban látott működés, a saját megvalósítás terve és a készítő által
  ténylegesen ellenőrzött eredmény különböző státuszok; ne mosd össze őket.
- Idő-, költség- vagy megtakarítási szám csak igazolható alappal szerepelhet;
  mérés nélkül legyen minőségi összehasonlítás vagy „mérés szükséges” jelölés.
- Az „ingyenes”, „teljesen automatikus” és „hibamentes” nem alapértelmezett jelző.
  Jelezd a szolgáltatás-, API- és hostingköltséget, limiteket, illetve emberi munkát.
- Az AI-kimenet bizonytalanságát és a jóváhagyást igénylő pontokat ne rejtsd el.
- A script tervezete tartalmazhat várt eredményt, de végleges felvételi állítás
  csak a saját működő projekt ellenőrzésére épülhet.

## Szerkesztői review

- A hook, demó, összehasonlítás és összefoglalás külön szerepet töltsön be,
  ne ugyanazt ismételje négyszer.
- A lépés vigye közelebb a nézőt az eredményhez. Új információ vagy állapotváltozás
  nélküli hosszú részhez adj konkrét rövidítési javaslatot.
- Ne magyarázd többször ugyanazt a beállítást, ne olvasd fel a teljes felületet,
  és ne időzz hosszan mellékes általános fogalmaknál.
- Rövidítéskor ne vesszen el kötelező lépés, fontos döntési indok vagy
  az elvégzéshez szükséges technikai részlet.
- Ellenőrizd a forrás–átdolgozás, ígéret–demó–teszt összhangját, a kötött
  szerkezetet, a brief hangvételét és a template-ek szerinti teljességet.
- A megállapítás fejezetazonosítót és javítási javaslatot kapjon.
  Ez szöveges minőségellenőrzés, nem retentionmérés vagy A/B-teszt.

## Felvételi sorrend — a készítőnek

1. A script alapján készítsd el a saját projektet és a reprodukálható példaadatokat.
2. Próbáld ki a teljes folyamatot, a köztes állapotokat és releváns határesetet;
   ellenőrizd az összehasonlítás állításait és költségeit.
3. Eltérés esetén jelezd vissza a tényeket: az érintett scriptlépések, review
   és felkészülési lista frissítése, illetve új jóváhagyás szükséges.
4. Rögzítsd a megvalósítás képernyőfelvételét, a demót, a tesztet és korlátokat.
5. Az igazolt eredményhez igazítva vedd fel a szolgáltatás-összefoglalót,
   az előtte–utána részt, a hookot, az összefoglalást és a CTA talking head részeit.

Ez nem a nézői sorrend. A script mindkettőt tegye követhetővé.
A workflow csak megtervezi ezeket, nem épít, tesztel vagy vesz fel ténylegesen.
A külön felkészülési lista a teljes script elkészülte után készül.
