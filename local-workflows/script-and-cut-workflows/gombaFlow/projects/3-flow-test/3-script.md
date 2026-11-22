# Forgatási script — Flow teszt

- Témaazonosító: `3-flow-test`
- Bemeneti változatok és briefjóváhagyás: tesztanyag a gomba-2-cut vágási skillhez; nincs brief.
- Javítási kör review-referenciája: első változat.
- Felvételi varázsszó: `serpenyő`
- Alapértelmezett timeline: `Flow teszt — vágási próbafelvétel`

## Script nézői sorrendben

### H — Hook

```xml
<agent-cue timeline="Flow teszt — vágási próbafelvétel" script-id="1" clip-type="talking head" location="A">
<spoken-cue>serpenyő timeline 3 script 1 serpenyő</spoken-cue>
</agent-cue>

<narration>
Ebben a rövid felvételben azt mutatom meg, hogyan próbálom ki a vágási folyamatomat egy tiszta, hétköznapi beszélgetős anyagon.
</narration>

<screen-action>
Kamerába beszélő felvétel.
</screen-action>
```

### O — Mit mutatok meg?

```xml
<agent-cue timeline="Flow teszt — vágási próbafelvétel" script-id="2" clip-type="talking head" location="B">
<spoken-cue>serpenyő timeline 3 script 2 serpenyő</spoken-cue>
</agent-cue>

<narration>
Először elmondom, miből áll a rögzített anyag, aztán szándékosan teszek néhány szünetet és hibát, hogy a vágás utána pontosan vissza tudja adni a megtartandó részeket.
</narration>

<screen-action>
Kamerába beszélő felvétel.
</screen-action>
```

### C1

```xml
<agent-cue timeline="Flow teszt — vágási próbafelvétel" script-id="3" clip-type="b-roll" location="C">
<spoken-cue>serpenyő timeline 3 script 3 serpenyő</spoken-cue>
</agent-cue>

<narration>
</narration>

<screen-action>
Kiegészítő b-roll kép.
</screen-action>
```

### C2

```xml
<agent-cue timeline="Flow teszt — vágási próbafelvétel" script-id="4" clip-type="talking head" location="D">
<spoken-cue>serpenyő timeline 3 script 4 serpenyő</spoken-cue>
</agent-cue>

<narration>
A cél az, hogy a kész anyagban csak az maradjon, amit tényleg megtartottam. A közöttünk lévő csendek és az elrontott mondatok kikerüljenek, és a végén egy folyamatos, érthető rész álljon össze.
</narration>

<screen-action>
Kamerába beszélő felvétel.
</screen-action>
```

### C3

```xml
<agent-cue timeline="Flow teszt — vágási próbafelvétel" script-id="5" clip-type="b-roll" location="E">
<spoken-cue>serpenyő timeline 3 script 5 serpenyő</spoken-cue>
</agent-cue>

<narration>
</narration>

<screen-action>
Kiegészítő b-roll kép.
</screen-action>
```

### C4

```xml
<agent-cue timeline="Flow teszt — vágási próbafelvétel" script-id="6" clip-type="talking head" location="F">
<spoken-cue>serpenyő timeline 3 script 6 serpenyő</spoken-cue>
</agent-cue>

<narration>
A felvétel során figyelek arra, hogy a bemondás után mindig egyértelműen elinduljon a szöveg, és ahol hosszabb szünetet tartok, ott a vágó felismerhesse a határt.
</narration>

<screen-action>
Kamerába beszélő felvétel.
</screen-action>
```

### C5

```xml
<agent-cue timeline="Flow teszt — vágási próbafelvétel" script-id="7" clip-type="talking head" location="G">
<spoken-cue>serpenyő timeline 3 script 7 serpenyő</spoken-cue>
</agent-cue>

<narration>
Ha minden a helyén van, a vágás után egy rövid, összefüggő anyagot kapok, amin jól látszik, hol maradt meg beszéd és hol lett valami kihagyva.
</narration>

<screen-action>
Kamerába beszélő felvétel.
</screen-action>
```

## Vágói átadás

```xml
<production-note>
Átadási szerződés: a 3-script-template vágói átadási szerződése.
Scriptváltozat: első változat.
Részek:
- Script-ID: 1 — Fejezet-ID: H — Timeline: Flow teszt — vágási próbafelvétel — Kliptípus: talking head — Leírás: hook.
- Script-ID: 2 — Fejezet-ID: O — Timeline: Flow teszt — vágási próbafelvétel — Kliptípus: talking head — Leírás: outline.
- Script-ID: 3 — Fejezet-ID: C1 — Timeline: Flow teszt — vágási próbafelvétel — Kliptípus: b-roll — Leírás: kiegészítő kép.
- Script-ID: 4 — Fejezet-ID: C2 — Timeline: Flow teszt — vágási próbafelvétel — Kliptípus: talking head — Leírás: a vágás célja.
- Script-ID: 5 — Fejezet-ID: C3 — Timeline: Flow teszt — vágási próbafelvétel — Kliptípus: b-roll — Leírás: kiegészítő kép.
- Script-ID: 6 — Fejezet-ID: C4 — Timeline: Flow teszt — vágási próbafelvétel — Kliptípus: talking head — Leírás: a bemondás utáni indulás.
- Script-ID: 7 — Fejezet-ID: C5 — Timeline: Flow teszt — vágási próbafelvétel — Kliptípus: talking head — Leírás: lezárás.
</production-note>
```
