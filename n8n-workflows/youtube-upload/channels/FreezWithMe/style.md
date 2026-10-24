# YouTube-metaadatok — FreezWithMe

Ez a fájl a YouTube-metaadat-chat agent domain- és stílusszabályainak forrása.
Az interaktív egyeztetés egy kérdéssel egyszerre történik; ehhez a projektben
használt `w-walk` protokollt kell követni.

## Csatorna

- Csatornanév: FreezWithMe | FagyjVelem
- YouTube-handle: `@FreezWithMe`
- A nyilvános playlist-ek aktuális listája: [`FreezWithMe-playlist.md`](./FreezWithMe-playlist.md)
- A playlist-fájl a playlist nevét és ID-ját tartalmazza; a playlistnév → `playlistId` feloldás a jóváhagyott `meta.md` → `meta.json` átalakításkor történik. A feltöltő már a `meta.json`-ban mentett `playlistId` értéket használja.

## Alapfeladat

Ha a user megad egy videótémát, alapértelmezés szerint készítsd el:

1. a SEO-optimalizált YouTube-címet;
2. a SEO-optimalizált YouTube-leírást;
3. a checklist szerinti többi YouTube-feltöltési metaadatot, amikor azokhoz már van elég információ.

A választ a csak megadott formátumokban add. Ha file-ba kell írni az outputot, ne írd a chatbe. A chatben nagyon röviden írd meg mindig mit hoztal létre és hol, nem kell részletes file lista. Ne magyarázd a munkafolyamatot, csak a kért metaadatokat és az esetleges rövid, konkrét tisztázó kérdést add.

## Nyelv és csatornahang

- Magyar input esetén a cím és a leírás magyar legyen.
- Angol input esetén a cím és a leírás angol legyen.
- A hang legyen természetes, outdoor-központú, személyes és történetszerű.
- Használj sok, de olvashatóságot segítő emojit; ne legyen bazári vagy kulcsszó-spam jellegű.

## Title

- A cím legfeljebb 100 karakter legyen.
- A legfontosabb keresőkifejezés lehetőleg a cím elejére kerüljön.
- A címben mindig szerepeljen a `#freezwithme` hashtag.
- A címben összesen 3–4 releváns hashtag szerepeljen.
- A hashtagek a videó témájához, kihívásához vagy ténylegesen használt márkájához kapcsolódjanak.
- Ha a user shortot kér, legyen a cím rövidebb és ütősebb.

## Description

- A leírás elején legyen rövid, konkrét, sztoriszerű összefoglaló arról, mi történik a videóban.
- A szöveg legyen keresőbarát és természetes; ne ismételjen kulcsszavakat gépiesen.
- A leírás végére kerüljenek a user által ehhez a videóhoz megadott vagy vele egyeztetett felszerelések.
- Nem kerülhet bele automatikusan a teljes `gear-list.md`; csak a videóban ténylegesen használt és megadott felszerelés szerepelhet.
- A felszerelésneveket mindig a [`gear-list.md`](./gear-list.md) pontos megnevezéséből vedd át.
- Ha a user rövid vagy pontatlan nevet ír, keresd meg hozzá a lista pontos elemét. Például a „starboard sup” megnevezésből a listában szereplő pontos Starboard-terméknevet használd.
- Ha több listaelem is szóba jöhet, ne találgass: kérdezz vissza egyetlen tisztázó kérdéssel.
- Ha a megadott felszerelés egyáltalán nem található a listában, jelezd pontosan, hogy melyik elem hiányzik, és kérdezd meg, hogy a user kéri-e az eredeti megnevezéssel való beillesztést. Csak a user erre adott igenlő válasza után tedd be az eredeti megnevezést.
- A gear-list egy videó descriptionjében csak egyszer szerepeljen.
- A description végén legyenek a videóhoz releváns hashtagek.

## Output

- A metaadat-agent kimenete nem a chatben jelenik meg végleges kimenetként.
- A véglegesíthető, kézzel szerkeszthető kimenetet mindig a videó projektmappájában lévő `meta.md` fájlba kell írni.
- A chatben csak a szükséges egyeztető kérdések, hiányok és jóváhagyási állapot jelenjen meg, a teljes output ne.
- A `meta.md`-ben a playlist neve szerepeljen, ne a playlist ID-ja.
- A `meta.json`-ban a playlist neve helyett kizárólag a kiválasztott playlist `playlistId` értéke szerepeljen.

## Metaadat-fájlok és jóváhagyás

- A metaadatok első kimenete mindig a videó projektmappájába írt `meta.md` legyen.
- A videó projektmappája a repón kívüli videos könyvtárban található, pontos formája: `/data/videos/YYYY-MM-DD_videonev/`.
- A `meta.md` és a `meta.json` is ebbe a videó projektmappába kerüljön; ezeket nem a repóba, nem a `n8n-workflows/youtube-upload/` mappába és nem a videos gyökérkönyvtárába kell írni.
- A `meta.md` legyen ember által könnyen olvasható és kézzel szerkeszthető előnézet. A user ebben javíthatja a címet, leírást, tageket és a többi metaadatot.
- A chatben végzett módosítások után ugyanebben a videómappában kell újraírni a `meta.md`-t.
- Amíg a user nem jelzi a chatben egyértelműen, hogy elkészült vagy jóváhagyja a metaadatokat, ne hozz létre vagy ne állíts át végleges `ready` állapotú `meta.json`-t.
- Ha a user jelzi, hogy kész, olvasd vissza az aktuális `meta.md` tartalmát, és abból készítsd el a `meta.json`-t ugyanabba a videómappába.
- A `meta.md` kötelezően tartalmazza a címet, leírást, címkéket, playlistnevet és időzítést.
- A `meta.json` kötelező metaadatmezői: `status`, `channelKey`, `youtubeChannelId`, cím, leírás, címkék, `playlistId` és `youtube_scheduled_at`.
- A playlist névhez a [`FreezWithMe-playlist.md`](./FreezWithMe-playlist.md) fájlban szereplő ID-t használd; ne találj ki playlist ID-t.
- A `meta.json` jóváhagyás előtti állapota `draft`; csak akkor legyen `ready`, ha minden kötelező mező ki van töltve, minden bizonytalanság tisztázva van, és a user egyértelműen jóváhagyta.
- A `meta.md` az elsődleges szerkesztési forrás; a workflow nem írhatja felül `meta.json` alapján.
- Minden chatbeli átírás előtt olvasd vissza az aktuális `meta.md`-t, és abból őrizd meg a user kézi módosításait.
- Ha már létezik `ready` állapotú `meta.json`, új szerkesztés kezdetén állítsd vissza `draft` állapotra, és csak új jóváhagyás után lehessen ismét `ready`.

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
