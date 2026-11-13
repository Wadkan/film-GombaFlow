# Scriptreview — Claude Code limitbe futott? Próbáld helyi modellel

- Témaazonosító: `2-unlimited-claude-code-for`
- Ellenőrzött bemeneti változatok: jóváhagyott `0-brief.md`, `1-story.md`, `1-thumbnail-prompt.md`, `1-outline-hyperframes-brief.md`, `2-chapters.md`; `source-transcript.md`; `3-script.md` R1–R4 javítási változat.
- Döntés: **megfelelt**
- Rövid indoklás: az előző review egyetlen blokkoló pontja, R2, javítva: a 32K Modelfile-beállítás, a verzió- és beállításellenőrzés, valamint a modell indítása és Claude Code-ban történő használata egységes. A gépen való tényleges futtatás helyesen forgatás előtti próbaként maradt meg.

## Lefedett ellenőrzések

- Ellenőrzés: Inputok aktualitása és template-megfelelés.
- Eredmény és bizonyíték: A script az elfogadott briefre, storyra, outline-ra és fejezettervre hivatkozik, és R1–R4 javításiként azonosítja magát. C4.2 S9 `ollama --version` paranccsal rögzítteti a verziót, valamint a `ollama show gomba-gemma --modelfile` kimenetével ellenőrizteti a `PARAMETER num_ctx 32768` értéket.
- Kapcsolódó hiba ID: nincs

- Ellenőrzés: Forrásmegoldás és saját átdolgozás összhangja.
- Eredmény és bizonyíték: A script megtartja a Claude Code + Ollama helyi modell megoldást; a Gomba Limited kalkulátor saját, szűk demonstráció. A helyi modell nem kerül Anthropic Claude-ként bemutatásra.
- Kapcsolódó hiba ID: nincs

- Ellenőrzés: Kötött fejezetek, kártyák, átvezetések, összehasonlítás és CTA.
- Eredmény és bizonyíték: H, O, C1–C6 és CTA sorrendje teljes. Az O négy pontja az elfogadott story és Hyperframes-brief szövegével/sorrendjével egyezik. C2 megtartja az öt összehasonlítási szempontot; a CTA rögzített szövege változatlan.
- Kapcsolódó hiba ID: nincs

- Ellenőrzés: Technikai teljesség, demóállapotok, teljes teszt és határeset terve.
- Eredmény és bizonyíték: C4.2 az `ollama create gomba-gemma -f Modelfile` lépéssel hozza létre a modellt `num_ctx 32768` beállítással; S9 ezt a modellt indítja és ellenőrzi. C4.3 S10 `claude --model gomba-gemma` parancsot használ, S11 az `ollama ps` kimenetén ellenőrzi, hogy ugyanez a modell fut. R1 szerint egyetlen `index.html` jön létre, külső csomag/hálózat nélkül, macOS-en megnyitható; C5 ugyanazt a fájlt teszteli normál, nulla és negatív bemenettel, kézi várt eredménnyel. A futtatás nincs megtörténtként állítva.
- Kapcsolódó hiba ID: nincs

- Ellenőrzés: Ígéret, eredmény, költségek, felügyelet és bizonyítékstátusz.
- Eredmény és bizonyíték: C3 / S5 a helyi modellprovideri tokendíj hiányát, a hardver/áram/letöltés költségét és a Claude Code hozzáférés konfigurációfüggését narrációban mondja ki. H, C1 és C6 a saját próba eredményéhez köti a végleges állításokat; az emberi kódellenőrzés megmarad.
- Kapcsolódó hiba ID: nincs

- Ellenőrzés: Lendület, ismétlések, túlmagyarázás és hangvétel.
- Eredmény és bizonyíték: C1 / S3, C3 / S5 és C4.4 / S12 rövid vállalkozói zsargonpoénokat használ úgy, hogy a számítási és beállítási lépések követhetők maradnak. A korábbi ismétlődő „most” felütések csökkentek.
- Kapcsolódó hiba ID: nincs

- Ellenőrzés: Nézői/felvételi sorrend és adatvédelem.
- Eredmény és bizonyíték: A megvalósítás és teszt felvétele megelőzi a kész megoldás és összefoglaló rögzítését. A script kizárja a valódi kulcsok, ügyféladatok és gépazonosítók megjelenítését.
- Kapcsolódó hiba ID: nincs

- Ellenőrzés: Felvételi jelölések a script-template szabályai szerint.
- Eredmény és bizonyíték: 16 egyedi pozitív script-ID szerepel; a vágói átadás mindet felsorolja. A varázsszó, timeline-név és kliptípusok egységesek.
- Kapcsolódó hiba ID: nincs

## Javítandó tételek

Nincs javítandó tétel.

## Forgatás előtt ténylegesen ellenőrizendő

- C4.1 / S7: Ollama telepítése, verzió feljegyzése a Mac M2 Pro 16 GB gépen.
- C4.2 / S8–S9: `gomba-gemma` betöltése, a 32 768-as beállítás konfigurációs ellenőrzése, stabil válasz és memóriahasználat.
- C4.3 / S10–S11: Claude Code kérése közben az `ollama ps` a `gomba-gemma` modellt mutatja; fájlmódosítási feladat működik, hozzáférési mód tisztázott.
- C4.4–C5 / S12–S14: egyfájlos kalkulátor létrejötte és megnyitása; normál, nulla és negatív bemenet tényleges eredménye.
- C1/C6 / S3 és S15: végleges narráció a tényleges teszteredményhez igazítva.
- C2/C3 / S4–S6: költség- és hozzáférési állítások megfelelnek a használt konfigurációnak.

## Következő kapu

- A scriptreview megfelelt. A felhasználó külön fogadja el a végleges scriptet; ezután a 5. forgatás-előkészítési lépés következik. A megfelelt review nem igazolja a még el nem végzett gépes demópróbát.
