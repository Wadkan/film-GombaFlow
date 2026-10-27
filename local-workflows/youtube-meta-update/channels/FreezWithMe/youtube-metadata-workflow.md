# YouTube-metaadatok — FreezWithMe

Ez a fájl a YouTube-metaadatok egyeztetését végző helyi chat-agent domain-,
stílus- és végrehajtási szabályainak forrása.
Elsőként olvasd el a `config/channels.json` fájlt, és számold meg az aktív
(`enabled: true`) csatornákat. Ha pontosan egy aktív csatorna van, használd azt
kérdés nélkül. Ha több aktív csatorna van, az első üzeneted kizárólag a
csatornaválasztás legyen: sorold fel őket sorszámozva a megjelenített nevükkel
(és handle-jükkel, ha van), majd kérd meg a usert, hogy csak egy sorszámot
küldjön. Ne kérdezz még a videóról. Ha nincs aktív csatorna, jelezd, hogy nincs
kiválasztható csatorna, és ne folytasd az egyeztetést.

A csatorna kiválasztása után olvasd be annak `sourcePath` és `sourceFiles`
mezőiben megadott forrásait, és az adott csatornához tartozó szabályokat
alkalmazd. Ezután az első metaadat-egyeztető üzenetben kérdezd meg egyszerre a
videóadatokat. Ne készíts agendát, és ne kérj címet vagy leírást. A hiányzó vagy
nem egyértelmű kötelező adatokat csak ezután tisztázd.

## Helyi végrehajtás

- A kiválasztott csatorna mappáját a `config/channels.json` megfelelő csatornájának `sourcePath` mezője határozza meg. A metaadatok célmappája ennek a mappának a `youtube-metas/` almappája; minden videó metaadata ide kerüljön.
- A videómappa útvonala: `channels/<csatornamappa>/videos/<ÉÉÉÉHHNN>-<rövid-név>/`. Például `channels/<csatornamappa>/videos/20251012-thaifold-fozes/`. A videómappa neve az útvonal utolsó eleme, például `20251012-thaifold-fozes`; ez az alapnév változtatás nélkül kerüljön a meta fájlokba. A `<csatornamappa>` mindig a kiválasztott csatorna `sourcePath` mezőjéből jön.
- Ha a `videos/` mappának pontosan egy közvetlen almappája van, azt használd automatikusan, és ne kérdezd meg, melyik videóval dolgozz. Ha nincs benne almappa, jelezd, hogy még nincs feltöltött videó; ha több van, kérdezd meg, melyiket használja. A videó nevét ne kérdezd; a fájlnevet és a tartalmat a kiválasztott videómappából olvasd ki.
- Közvetlenül olvasd el a `local-workflows/youtube-meta-update/config/channels.json` fájlt, kövesd a fenti csatornaválasztási szabályt, majd a kiválasztott csatorna `sourcePath` és `sourceFiles` mezői alapján olvasd el a csatornaforrásokat. Az időzónát a `local-workflows/youtube-meta-update/config/settings.json` tartalmazza.
- A videómappa neve legyen a metaadatfájlok alapneve. A `youtube-metas/` mappában a Markdown fájl neve `<videómappa-neve>.md`, a JSON fájl neve `<videómappa-neve>.json` legyen; a kiterjesztésen kívül ne módosítsd az alapnevet.
- Minden válasz előtt olvasd be a kiválasztott videómappa nevével egyező `.md` és `.json` fájlokat a `youtube-metas/` mappából, ha léteznek, hogy a kézi módosítások és az aktuális állapot megmaradjanak. Új videónál, ha ilyen fájl még nincs, ezt a lépést hagyd ki.
- A helyi fájlolvasáshoz és -íráshoz használd közvetlenül a rendelkezésre álló fájlrendszer-eszközöket; ne futtass loader scriptet.
- Minden válasz előtt az aktuális dátumot a `config/settings.json` időzónájában határozd meg. A videófájl vagy mappanév dátuma nem használható aktuális dátumként.
- A mentés kizárólag a fenti metaadatmappába történhet.
- A fájlokat helyi fájlművelettel írd ki, majd olvasd vissza és ellenőrizd a tényleges tartalmukat. Ha a metaadatmappa nem érhető el, jelezd ezt; mentési sikert ellenőrzés nélkül ne állíts.

## Csatorna

- Csatornanév: FreezWithMe | FagyjVelem
- YouTube-handle: `@FreezWithMe`
- A nyilvános playlist-ek aktuális listája: [`FreezWithMe-playlist.md`](./FreezWithMe-playlist.md)
- A playlist-fájl a playlist nevét és ID-ját tartalmazza; a playlistnév → `playlistId` feloldás a jóváhagyott, videómappa nevével egyező `.md` fájl → `.json` átalakításakor történik. A feltöltő a `.json` fájlban mentett `playlistId` értéket használja.

## Alapfeladat

### Első kérdés

Mi a videó témája, mi történik benne, mik a fontos pillanatok, és hol készült, ha ez számít? Mi a YouTube-linkje? Short vagy long videó? Milyen felszerelést használtál, melyik playlist illik hozzá, és milyen dátumra (ÉÉÉÉ-HH-NN) időzítsük a publikálást?

A YouTube-link kötelező adat, mert a kész metaadatot egy már feltöltött videóhoz kell kapcsolni. A linkből nyerd ki a videóazonosítót (`videoId`): `youtube.com/watch?v=...`, `youtu.be/...` és `youtube.com/shorts/...` formátumot fogadj el. Ha a link nem egyértelműen egy videóra mutat, kérj javított linket; ne találgass. A `videoId` kerüljön az MD-be és az abból készített JSON-ba.

A publikálási dátum kötelező: ha a user nem ad meg dátumot, kérdezd meg, és ne válassz helyette. Az aktuális dátumot a `config/settings.json` időzónájában határozd meg; relatív publikálási dátumot kizárólag ebből számolj. Ha a relatív dátum ebből sem egyértelmű, kérdezz vissza. Ha nincs külön idő megadva, az időpont 16:00.

Ha a user megad egy videótémát, alapértelmezés szerint készítsd el:

1. a SEO-optimalizált YouTube-címet;
2. a SEO-optimalizált YouTube-leírást;
3. a checklist szerinti többi YouTube-feltöltési metaadatot, amikor azokhoz már van elég információ.

Soha ne kérd a usertől, hogy ő írja meg vagy SEO-optimalizálja a címet. Készíts
három számozott SEO-címjavaslatot, és a chatben jelöld, melyiket ajánlod.
Kizárólag a három címet írd a chatbe. Várd meg, amíg a user egy sorszámmal
választ; ne kezdj más metaadatot írni vagy fájlt létrehozni a választás előtt.
A leírást te készítsd el. A videómappa nevével egyező `.md` fájlba kizárólag a kiválasztott cím kerüljön;
a másik két javaslat és az „ajánlott” minősítés ne. A többi hiányzó adatot
röviden tisztázd.

A videómappa nevével egyező `.md` fájlt csak akkor írj, ha a címválasztás és minden kötelező metaadat —
köztük a dátum és a playlist — egyértelmű és végleges.

A választ a csak megadott formátumokban add. Ha file-ba kell írni az outputot, ne írd a chatbe. A chatben nagyon röviden írd meg mindig mit hoztal létre és hol, nem kell részletes file lista. Ne magyarázd a munkafolyamatot, csak a kért metaadatokat és az esetleges rövid, konkrét tisztázó kérdést add.

## Nyelv és csatornahang

- Magyar input esetén a cím és a leírás magyar legyen.
- Angol input esetén a cím és a leírás angol legyen.
- A generált cím és leírás mindig egyes szám első személyben készüljön.
- A hang legyen természetes, outdoor-központú, személyes és történetszerű.
- Használj sok, de olvashatóságot segítő emojit; ne legyen bazári vagy kulcsszó-spam jellegű.

## Title

- A cím legfeljebb 100 karakter legyen.
- A legfontosabb keresőkifejezés lehetőleg a cím elejére kerüljön.
- A címben mindig szerepeljen a kiválasztott csatorna `channels.json`-beli `requiredDescriptionHashtag` értéke.
- Ha természetesen belefér a 100 karakteres limitbe, a címben is szerepelhetnek a videóhoz illő, SEO-szempontból fontos hashtagek; ne rövidítsd vagy gyengítsd miattuk a címet.
- Ha a user shortot kér, legyen a cím rövidebb és ütősebb.

## Description

- A leírás elején legyen rövid, konkrét, sztoriszerű összefoglaló arról, mi történik a videóban.
- A szöveg legyen keresőbarát és természetes; ne ismételjen kulcsszavakat gépiesen.
- A leírásban a user által ehhez a videóhoz megadott vagy vele egyeztetett felszerelések szerepeljenek a leírás végső hashtagsora előtt.
- Nem kerülhet bele automatikusan a teljes `gear-list.md`; csak a videóban ténylegesen használt és megadott felszerelés szerepelhet.
- A felszerelésneveket mindig a [`gear-list.md`](./gear-list.md) pontos megnevezéséből vedd át.
- A JSON `tags` mezőjében tartsd meg változtatás nélkül a már meglévő tageket, és egészítsd ki az összes további releváns keresőkifejezéssel a videó tényleges tartalma alapján: többek között a helyszínnel, tevékenységgel vagy sportággal, bemutatott vagy használt felszerelésekkel és más fontos videóinformációkkal.
- A ténylegesen használt vagy bemutatott, `gear-list.md`-ben szereplő tagelhető felszerelésnevek is kerüljenek a `tags` mezőbe; használd a lista pontos megnevezéseit. Ne hagyj ki releváns elemet csak azért, mert a leírásban már szerepel.
- Ha a user rövid vagy pontatlan nevet ír, keresd meg hozzá a lista pontos elemét. Például a „starboard sup” megnevezésből a listában szereplő pontos Starboard-terméknevet használd.
- Ha több listaelem is szóba jöhet, ne találgass: kérdezz vissza egyetlen tisztázó kérdéssel.
- Minden megadott felszerelést ellenőrizz a `gear-list.md`-ben; találat nélkül ne hagyd ki csendben, és ne készítsd el a `.md` fájlt.
- Ha a felszerelés nem található a listában, mondd meg pontosan, melyik név hiányzik. Javasold vagy az eredeti név változtatás nélküli beillesztését, vagy — ha a lista alapján van valóban hasonló tétel — nevezd meg lehetséges egyezésként, és kérdezd meg, melyiket használja. Hasonlóságot ne állíts biztos egyezésként.
- Amíg a user nem erősítette meg, hogy az eredeti nevet vagy a javasolt listabeli nevet használhatod, ne tedd be a felszerelést a leírásba, és ne írd ki a `.md` fájlt. Jóváhagyás után a kiválasztott nevet pontosan, egyszer szerepeltesd a leírásban.
- A gear-list egy videó descriptionjében csak egyszer szerepeljen.
- A description legvégére kerüljön egy hashtagsor: a kiválasztott csatorna `channels.json`-beli `requiredDescriptionHashtag` értéke kötelezően elsőként szerepeljen, és utána legfeljebb két további, SEO-szempontból legfontosabb hashtag jöjjön. Összesen legfeljebb három hashtag legyen.
- A további hashtageket a videó alapján válaszd: érdekes helyszínnél a helyszín, sportnál vagy eszköznél a releváns tevékenység (például SUP, bringázás, túrázás, kajakozás vagy terepfutás), felszerelésbemutatónál a fő termék, többféle felszerelés bemutatásakor pedig egy megfelelő gyűjtőtéma (például főzés vagy bikepacking gear) legyen a legfontosabbak között. Keress természetes, SEO-szempontból erős hashtaget; ne válassz általános vagy a videóhoz nem illő címkét.
- A leírás törzse és a felszereléslista maradjon a hashtagsor előtt.

## YouTube-beállítások

- A JSON tartalmazza a `containsSyntheticMedia` és `defaultLanguage` mezőket.
- `containsSyntheticMedia` alapértéke `false`; ez a YouTube valósághű, módosított vagy szintetikus tartalomra vonatkozó jelölése, nem általános AI-használati címke.
- A `defaultLanguage` értékét a title és description nyelve alapján állapítsd meg, és ISO nyelvkóddal add meg (például `hu` vagy `en`). Ha a két szöveg nyelve eltér vagy nem egyértelmű, kérdezz vissza.
- A YouTube Data API a `defaultLanguage` értékét a cím és leírás nyelvéhez, a `containsSyntheticMedia` értékét a szintetikus tartalom jelöléséhez használja. A Studio külön „Video language” beállítását az API-frissítés nem állítja be.
- A JSON `tags` mezője a metaadat-egyeztetésben és a helyi fájlokban marad. Az agent nem alkalmazza ezeket a YouTube-tag mezőjére. Az n8n a már létező YouTube-tageket változatlanul viszi át a videófrissítéskor.

## Output és fájlmentés

- Az egyeztetés alatt csak a három számozott címjavaslatot és a szükséges tisztázó kérdéseket mutasd a chatben. Az MD előtt ne adj metaadat-összesítőt vagy teljes tervezetet.
- Amikor minden döntés egyértelmű, az első fájlművelet a metaadatmappába mentett, videómappa nevét viselő `.md` fájl. Ne kérj újabb általános jóváhagyást a fájl elkészítéséhez, és ne állj meg egy chatbeli összesítőnél.
- Az MD-ben csak a metaadat-mezőnevek és végleges értékeik lehetnek: `videoId`, egy kiválasztott cím, leírás, címkék, playlistnév, időzítés, `containsSyntheticMedia` és `defaultLanguage`. Ajánlás, alternatív cím, sorszám, indoklás és chatbeli megjegyzés nem kerülhet bele.
- A helyi agent mentse el és olvassa vissza a fájlt. MD mentése után kizárólag a fájlútvonalat és az átnézés kérését jelezze; összesítőt ne írjon.
- Az MD és a JSON két külön forduló. MD mentésekor JSON nem készülhet. Várd meg, hogy a user az elkészült MD-t átnézze és egy későbbi üzenetben jóváhagyja.
- A jóváhagyást a beszélgetés értelme alapján ismerd fel. Ne követelj meghatározott szót, kifejezést vagy formátumot. A címválasztás, egy részlet tisztázása vagy egy korábbi változat elfogadása nem a jelenlegi MD végső jóváhagyása. Ha a szándék bizonytalan, kérdezz vissza röviden.
- Az aktuális, videómappa nevével egyező `.md` és `.json` fájl tartalmát minden válasz előtt közvetlenül olvasd be, ha léteznek. A beolvasott fájl az elsődleges forrás, nem a korábbi chatbeli állítás.
- Szerkesztéskor őrizd meg az aktuális MD kézi javításait, és csak a kért részeket módosítsd. Írd újra az MD-t, majd várj az új változat jóváhagyására.
- A jóváhagyott, videómappa nevével egyező `.md` fájlból készítsd el az ugyanilyen nevű `.json` fájlt, a playlistnév helyett a csatorna playlist-forrásában szereplő `playlistId` értékkel. Ne találj ki ID-t.
- A JSON kötelező mezői: `status`, `channelKey`, `youtubeChannelId`, `videoId`, `title`, `description`, `tags`, `categoryId`, `playlistId`, `privacyStatus`, `youtube_scheduled_at`, `containsSyntheticMedia`, `defaultLanguage`. A `containsSyntheticMedia` logikai érték legyen. A `categoryId` értékét a kiválasztott csatorna `youtubeCategory.categoryId` mezőjéből vedd át; ne találd ki. A `privacyStatus` értéke `private`. A státusz csak teljes, egyértelműen jóváhagyott adatokkal lehet `ready`.
- A két fájl kizárólag a metaadatmappába kerülhet. A JSON nem forrása az MD felülírásának.

## Playlist-egyeztetés

- A playlist kötelező mező. Ha a user nem adja meg, a videó témája alapján javasolj megfelelő playlistet.
- Ha a leírás alapján több playlist is ésszerű, vagy nem egyértelmű, melyik illik a videóhoz, jelezd ezt és egyeztess a userrel.
- Amíg a playlist, az időzítés vagy bármely más kötelező metaadat nem tiszta és végleges, ne lépj tovább, és ne állítsd a `meta.json`-t `ready` állapotúra.
- Short, vagyis portré videóhoz kizárólag olyan playlist választható, amelynek nevében szerepel a `SHORT` szó.
- Long videóhoz kizárólag olyan playlist választható, amelynek nevében nem szerepel a `SHORT` szó.
- A playlist javaslatánál és ellenőrzésénél a [`FreezWithMe-playlist.md`](./FreezWithMe-playlist.md) aktuális listáját használd.

## Felszerelés-forrás

A felszerelés kanonikus forrása: [`gear-list.md`](./gear-list.md).
Az agent nem bővítheti ki saját tudásból a listát, és nem írhat át márkaneveket általánosabb vagy rövidebb megnevezésre.

## A jóváhagyott JSON alkalmazása

Ha a user a kész metaadat YouTube-ra alkalmazását kéri, a helyi agent hívja a
repo gyökeréből a `python3 local-workflows/youtube-meta-update/youtube_meta_update.py
preflight <jóváhagyott-json-útvonal>` parancsot, majd megfelelő előellenőrzésnél
az ugyanilyen `update <jóváhagyott-json-útvonal>` parancsot. A usernek nem kell
terminált vagy n8n felületet használnia. Meglévő egyértelmű alkalmazási engedélyt
ne kérj újra; a puszta MD-jóváhagyás továbbra is csak a JSON elkészítését engedi.

Sikeres `update` után az agent nyissa meg ugyanazt a videót a YouTube Studio-ban,
és a JSON `defaultLanguage` értékéből állítsa be a „Video language” mezőt
(például `hu` → Hungarian, `en` → English). Mentés után újratöltéssel ellenőrizze
a beállítást. A cím és leírás nyelvét is ellenőrizze. Ha a Studio nem érhető el,
jelezze, hogy a videó nyelvének beállítása még hátravan; az n8n `updated`
válasza önmagában nem igazolja ezt a Studio-beállítást.

Ezután a Studio „End screen” szerkesztőjében állítsa be az „1 video, 1 playlist,
1 subscribe” elrendezést. A videóelem ajánlása legyen „Best for viewer”. A
playlist elemhez azt a playlistet válassza ki, amelyet a videó adatlapja mutat;
ennek egyeznie kell a JSON `playlistId` mezője alapján beállított playlisttel.
Mentse a módosításokat, majd ellenőrizze, hogy a szerkesztő mentett állapotot
jelez, vagy újbóli megnyitás után is pontosan egy video, egy playlist és egy
subscribe elem szerepel a kívánt értékekkel. Ha a Studio nem érhető el vagy a
mentés nem igazolható, jelezze, hogy a záróképernyő beállítása hátravan; az n8n
`updated` válasza ezt sem igazolja. Privát/időzített videón a Studio jelezheti,
hogy a záróképernyő nem látható a watch oldalon; ez nem akadálya a mentett
beállítás publikáláskori használatának.

Az `update` a fájl státuszát és eredményét maga menti; `updated` csak igazolt
visszaolvasás után siker. `error`, `unknown` vagy megmaradt `updating` esetén
ne állítsd vissza automatikusan `ready`-ra, és ne indíts új módosítást. Előbb az
n8n-futást és a tényleges YouTube-állapotot ellenőrizd, és külön user-kérés szükséges
az egyeztetett új indításhoz.
