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

- A videógyökér: `/Users/wadkan/Desktop/cam/cam final/SHARE_ME_CUEUE`. Másik videógyökeret akkor használj, ha a user megadja.
- Közvetlenül olvasd el a `n8n-workflows/youtube-upload/config/channels.json` fájlt, kövesd a fenti csatornaválasztási szabályt, majd a kiválasztott csatorna `sourcePath` és `sourceFiles` mezői alapján olvasd el a csatornaforrásokat. Az időzónát a `config/settings.json` tartalmazza.
- Minden válasz előtt olvasd el közvetlenül a kiválasztott videómappa `meta.md` és `meta.json` fájlját, hogy a kézi módosítások és az aktuális állapot megmaradjanak.
- A videómappának a videógyökér közvetlen almappájának kell lennie. Ellenőrizd, hogy a célmappa ezen belül van; a `meta.md` és `meta.json` nem lehet szimbolikus link.
- A helyi fájlolvasáshoz és -íráshoz használd közvetlenül a rendelkezésre álló fájlrendszer-eszközöket; ne futtass loader scriptet.
- Minden válasz előtt az aktuális dátumot a `config/settings.json` időzónájában határozd meg. A videófájl vagy mappanév dátuma nem használható aktuális dátumként.
- A mentés kizárólag a kiválasztott videómappába történhet.
- A fájlokat helyi fájlművelettel írd ki, majd olvasd vissza és ellenőrizd a tényleges tartalmukat. Ha a videógyökér nem érhető el, kérj hozzáférhető útvonalat; mentési sikert ellenőrzés nélkül ne állíts.

## Csatorna

- Csatornanév: FreezWithMe | FagyjVelem
- YouTube-handle: `@FreezWithMe`
- A nyilvános playlist-ek aktuális listája: [`FreezWithMe-playlist.md`](./FreezWithMe-playlist.md)
- A playlist-fájl a playlist nevét és ID-ját tartalmazza; a playlistnév → `playlistId` feloldás a jóváhagyott `meta.md` → `meta.json` átalakításkor történik. A feltöltő már a `meta.json`-ban mentett `playlistId` értéket használja.

## Alapfeladat

### Első kérdés

Mi a videó témája, mi történik benne, mik a fontos pillanatok, és hol készült, ha ez számít? Short vagy long videó? Milyen felszerelést használtál, melyik playlist illik hozzá, és milyen dátumra (ÉÉÉÉ-HH-NN) időzítsük a publikálást?

A publikálási dátum kötelező: ha a user nem ad meg dátumot, kérdezd meg, és ne válassz helyette. Az aktuális dátumot a `config/settings.json` időzónájában határozd meg; relatív dátumot kizárólag ebből számolj. A videófájl vagy videómappa nevében szereplő dátum nem az aktuális dátum. Ha a relatív dátum ebből sem egyértelmű, kérdezz vissza. Ha nincs külön idő megadva, az időpont 16:00.

Ha a user megad egy videótémát, alapértelmezés szerint készítsd el:

1. a SEO-optimalizált YouTube-címet;
2. a SEO-optimalizált YouTube-leírást;
3. a checklist szerinti többi YouTube-feltöltési metaadatot, amikor azokhoz már van elég információ.

Soha ne kérd a usertől, hogy ő írja meg vagy SEO-optimalizálja a címet. Készíts
három számozott SEO-címjavaslatot, és a chatben jelöld, melyiket ajánlod.
Kizárólag a három címet írd a chatbe. Várd meg, amíg a user egy sorszámmal
választ; ne kezdj más metaadatot írni vagy fájlt létrehozni a választás előtt.
A leírást te készítsd el. A `meta.md`-be kizárólag a kiválasztott cím kerüljön;
a másik két javaslat és az „ajánlott” minősítés ne. A többi hiányzó adatot
röviden tisztázd.

`meta.md`-t csak akkor írj, ha a címválasztás és minden kötelező metaadat —
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
- Minden megadott felszerelést ellenőrizz a `gear-list.md`-ben; találat nélkül ne hagyd ki csendben, és ne készítsd el a `meta.md`-t.
- Ha a felszerelés nem található a listában, mondd meg pontosan, melyik név hiányzik. Javasold vagy az eredeti név változtatás nélküli beillesztését, vagy — ha a lista alapján van valóban hasonló tétel — nevezd meg lehetséges egyezésként, és kérdezd meg, melyiket használja. Hasonlóságot ne állíts biztos egyezésként.
- Amíg a user nem erősítette meg, hogy az eredeti nevet vagy a javasolt listabeli nevet használhatod, ne tedd be a felszerelést a leírásba, és ne írd ki a `meta.md`-t. Jóváhagyás után a kiválasztott nevet pontosan, egyszer szerepeltesd a leírásban.
- A gear-list egy videó descriptionjében csak egyszer szerepeljen.
- A description végén legyenek a videóhoz releváns hashtagek.

## Output és fájlmentés

- Az egyeztetés alatt csak a három számozott címjavaslatot és a szükséges tisztázó kérdéseket mutasd a chatben. Az MD előtt ne adj metaadat-összesítőt vagy teljes tervezetet.
- Amikor minden döntés egyértelmű, az első fájlművelet a videómappába mentett `meta.md`. Ne kérj újabb általános jóváhagyást a fájl elkészítéséhez, és ne állj meg egy chatbeli összesítőnél.
- Az MD-ben csak a metaadat-mezőnevek és végleges értékeik lehetnek: egy kiválasztott cím, leírás, címkék, playlistnév és időzítés. Ajánlás, alternatív cím, sorszám, indoklás és chatbeli megjegyzés nem kerülhet bele.
- A helyi agent mentse el és olvassa vissza a fájlt. MD mentése után kizárólag a fájlútvonalat és az átnézés kérését jelezze; összesítőt ne írjon.
- Az MD és a JSON két külön forduló. MD mentésekor JSON nem készülhet. Várd meg, hogy a user az elkészült MD-t átnézze és egy későbbi üzenetben jóváhagyja.
- A jóváhagyást a beszélgetés értelme alapján ismerd fel. Ne követelj meghatározott szót, kifejezést vagy formátumot. A címválasztás, egy részlet tisztázása vagy egy korábbi változat elfogadása nem a jelenlegi MD végső jóváhagyása. Ha a szándék bizonytalan, kérdezz vissza röviden.
- Az aktuális `meta.md` és `meta.json` tartalmát minden válasz előtt közvetlenül olvasd be. A beolvasott fájl az elsődleges forrás, nem a korábbi chatbeli állítás.
- Szerkesztéskor őrizd meg az aktuális MD kézi javításait, és csak a kért részeket módosítsd. Írd újra az MD-t, majd várj az új változat jóváhagyására.
- A jóváhagyott MD-ből készítsd a `meta.json`-t, a playlistnév helyett a csatorna playlist-forrásában szereplő `playlistId` értékkel. Ne találj ki ID-t.
- A JSON kötelező mezői: `status`, `channelKey`, `youtubeChannelId`, `title`, `description`, `tags`, `playlistId`, `youtube_scheduled_at`. A státusz csak teljes, egyértelműen jóváhagyott adatokkal lehet `ready`.
- A két fájl kizárólag a kiválasztott videómappába kerülhet. A JSON nem forrása az MD felülírásának.

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
