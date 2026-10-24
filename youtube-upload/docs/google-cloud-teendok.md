# Google / YouTube — csak nálad (Google-fiók)

**Állapot:** OAuth + n8n **YouTube OAuth2** credential **kész** (2026-10-24). Az API audit / production quota **még nincs** — feltöltéses MVP után, ha nyilvános ütemezés kell.

A repóban fix értékek: `youtube-upload/config/google-oauth.n8n.json` (redirect URI, API neve, n8n credential típus).

## 1. Projekt + API

1. Nyisd meg: https://console.cloud.google.com/
2. Új projekt (javasolt név: **GombaFlow YouTube**, javasolt ID: `gombaflow-youtube`).
3. **APIs & Services → Library** → keresés: **YouTube Data API v3** → **Enable**.

## 2. OAuth consent screen

1. **APIs & Services → OAuth consent screen**.
2. User type: **External** (saját csatornához elég; teszt módban csak a felvett teszt userek használhatják).
3. App name, support email — töltsd ki.
4. **Scopes → Add or remove scopes** — add hozzá legalább:
   - `.../auth/youtube.upload`
   - `.../auth/youtube` (vagy a konzol által ajánlott YouTube scope-ok)
5. **Test users** → add hozzá a YouTube-csatornához használt Google e-mail címedet.

## 3. OAuth Client (Web)

1. **APIs & Services → Credentials → Create credentials → OAuth client ID**.
2. Application type: **Web application**.
3. Name: pl. `n8n-local`.
4. **Authorized redirect URIs** — pontosan ez (a repóból is):

   `http://localhost:5678/rest/oauth2-credential/callback`

5. Mentsd. Másold ki a **Client ID** és **Client Secret** értékeket (egyszer látszik a secret; jegyzeteld biztonságos helyre).

## 4. n8n credential

1. Böngésző: http://localhost:5678/
2. **Credentials → Add credential → YouTube OAuth2 API** (vagy a listában „YouTube OAuth2”).
3. Illeszd be a Client ID / Client Secret mezőket.
4. **Save**, majd **Connect my account** / **Sign in with Google** — ugyanazzal a fiókkal, ami teszt user és a csatorna tulajdonosa.
5. Ha hiba „redirect_uri_mismatch”: ellenőrizd, hogy a GCP-ben egy karakterre is ugyanaz az URI, mint a `google-oauth.n8n.json`-ban.

## 5. Később (nem blokkolja az MVP teszt feltöltést privát/időzített próbára)

- **API audit / quota extension:** ellenőrizetlen projektnél a feltöltött videók gyakran **privátak maradnak** nyilvános ütemezéshez. Ha kész vagy az MVP workflow-val, a Google Cloud Console **APIs & Services** felületén kérd az ellenőrzést / production használatot a YouTube Data API-hoz.

Nincs szükség Google Cloud CLI-re ehhez a stackhez.
