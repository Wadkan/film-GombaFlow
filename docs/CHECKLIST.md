# YouTube uploader és metaadat-frissítő

## Megőrzendő n8n- és uploader-alapok

- A meglévő helyi n8n stack marad az alap (`n8n-docker/`); indítás és leállítás a meglévő Makefile-célokkal történik. Ne készüljön második Compose stack.
- A videó- és workflow-fájlok n8n konténerbeli elérése a compose mountokon keresztül történik. A fájlrendszer-hozzáférés maradjon a szükséges mappákra korlátozva; a runners ne kapjanak videó- vagy repo-mountot.
- A YouTube OAuth-credential az n8n-ben marad. A csatorna-regiszter alapján kell kiválasztani, és a hitelesített csatornát egyeztetni kell a várt `youtubeChannelId`-val. Token vagy titok ne kerüljön a repóba vagy exportba.
- A feltöltő a jóváhagyott `ready` metaadatot, a hozzá tartozó videófájlt és thumbnailt használja; privát/időzített feltöltést végez, beállítja a playlistet, és jelenti a végső YouTube-linket. A metaadatban tárolt `playlistId` az irányadó.
- A feltöltő lépésenként mentse az állapotot, a YouTube `videoId`-t pedig azonnal a feltöltés után. Újraindításkor csak a hiányzó lépéseket folytassa, ne töltsön fel duplán. Hiba esetén a lépést és annak okát adja vissza. A Telegram csak értesítésre szolgál.
- Workflow-változtatás után az exportált n8n workflow-k legyenek naprakészek; automatizált E2E-ben az LLM-, YouTube- és Telegram-hívások legyenek helyettesítve, valódi feltöltés csak külön kézi próbában történjen.

## Egyetlen elvégzetlen feladat

- [ ] **Külön YouTube-metaadat-frissítő n8n workflow készítése.** A metaadatot a helyi chat/agent készíti és menti `ready` JSON-ként a kiválasztott csatorna `youtube-metas/` mappájába; a helyi agent indítsa a n8n-t egy védett webhookon, és küldje át a JSON teljes tartalmát. A usernek ne kelljen n8n-be belépnie, az n8n-nek pedig ne kelljen a repófájlokat olvasnia.
  - A workflow csak az átadott JSON-t hajtsa végre: ne használjon AI-agentet, ne kérdezzen, ne generáljon és ne következtessen adatot. Ellenőrizze a `ready` állapotot, a kötelező mezőket és hogy a videó a megadott YouTube-csatornához tartozik.
  - A `title`, `description`, `tags`, `categoryId`, `privacyStatus` és `youtube_scheduled_at` mezőkkel frissítse a videót; a `playlistId`-t külön API-lépésben állítsa be. A csatorna kategóriája a `config/channels.json`-ból jön; FreezWithMe esetén `travel`, YouTube `categoryId` `19`.
  - Csak YouTube API-siker után adjon sikert vissza; hiba esetén konkrét hibát jelezzen. Ismételt indítás ne töltsön fel új videót, és ne duplázza a playlist-hozzárendelést.
  - A webhookos indítás és visszaigazolás csak akkor tekinthető késznek, ha az aktív helyi n8n elérése és a YouTube-módosítás eredménye igazolt. A legutóbbi ellenőrzéskor a `127.0.0.1:5678` nem válaszolt.
  - Bemeneti szerződés: `local-workflows/youtube-meta-update/examples/meta.json`; csatorna- és kategóriabeállítás: `local-workflows/youtube-meta-update/config/channels.json`.
