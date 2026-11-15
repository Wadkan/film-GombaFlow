# Forgatási script — Viewer teszt

- Témaazonosító: `999-viewer-fixture`
- Felvételi varázsszó: `próba`
- Alapértelmezett timeline: `Példa timeline`

## Script nézői sorrendben

### A — Első fejezet

```xml
<production-note>
A fejezet közös megjegyzése.
</production-note>
```

#### Felvehető rész — 401

`````xml
<agent-cue timeline="Példa timeline" script-id="401" clip-type="talking head" location="A">
<spoken-cue>próba timeline 999 script 401 próba</spoken-cue>
</agent-cue>

<narration>
Alma &amp; &lt;körte&gt; a narrációban.
</narration>

<screen-action>
Csak a képernyőn: SCREENONLY. A példa kód:
````javascript
const greeting = "hello";
`````

</screen-action>

<production-note>
A rész saját gyártási megjegyzése.
</production-note>
```

#### Felvehető rész — 402

```xml
<agent-cue timeline="Példa timeline" script-id="402" clip-type="b-roll" location="B">
<spoken-cue>próba timeline 999 script 402 próba</spoken-cue>
</agent-cue>

<narration>
A második rész csak a narrációban kereshető.
</narration>

<screen-action>
A második képernyőművelet.
</screen-action>

<production-note>
A második rész megjegyzése.
</production-note>
```

### B — Második fejezet

#### Felvehető rész — 403

```xml
<agent-cue timeline="Példa timeline" script-id="403" clip-type="animation" location="C">
<spoken-cue>próba timeline 999 script 403 próba</spoken-cue>
</agent-cue>

<narration>
Harmadik rész, külön fejezetben.
</narration>

<screen-action>
Animált példa.
</screen-action>

<production-note>
Harmadik rész megjegyzése.
</production-note>
```
