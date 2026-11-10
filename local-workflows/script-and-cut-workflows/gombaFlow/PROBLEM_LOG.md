# Közös problémánapló

Az erre hivatkozó GombaFlow-lépés minden érintett scripthez külön
`problems.md` fájlt használjon a script meglévő projektmappájában, a
`3-script.md`, `recording_index.json` és `retake_plan.json` mellett.
A mappát az adott script útvonalából határozza meg; ne a forrásvideó mappáját
használja. Hiányzó naplót hozzon létre; meglévő tartalmat ne írjon felül és ne
töröljön.

Probléma észlelésekor azonnal fűzzön hozzá egy rövid bejegyzést az érintett
script naplójának megfelelő felsorolásához. Egy forrás több scripthez tartozó
problémáinál mindegyik kizárólag a saját scriptjének naplójába kerüljön. Ha az
érintett script nem állapítható meg, ne írja a problémát egyetlen script
naplójába sem; jelezze az azonosítási akadályt.

- Minden problématípus külön második szintű Markdown-címet kapjon; a cím alatt
  felsorolásban szerepeljenek az ahhoz tartozó tételek. Új tételt a meglévő
  típuscím alá illesszen; az ismert címeket a `Használható címkék` rész adja.
  Új típusnál hozzon létre új címet.
- Bejegyzésenként szerepeljen a script-ID és röviden a probléma oka. Ha van
  érintett forrásfelvétel, szerepeljen annak teljes útvonala és a forrás
  elejétől számított `perc:másodperc–perc:másodperc` tartomány is. Hiányzó
  felvételnél jelezze, hogy nincs hozzá forrás; ne találjon ki útvonalat.
- Több érintett forrásnál mindegyik fájlt és annak saját időtartományát adja meg.
  Nem megállapítható időpontot vagy ID-t ne találjon ki; jelölje ismeretlennek.
- A napló nem helyettesíti a lépés gépi kimenetének bizonytalansági jelöléseit,
  és nem old fel végrehajtási kaput.
- Az elemzés végén jelezze, ha volt bizonytalanság, és adja át a napló útvonalát.
  Azt, hogy kell-e azonnali tisztázás, az adott lépés szabályai határozzák meg.
  Ha a felhasználó döntést ad, azt új bejegyzésként fűzze a naplóhoz, az érintett
  forrásra és időtartományra hivatkozva. Puszta naplóbejegyzés alapján ne
  minősítsen bizonytalan döntést érvényesnek.

## Használható címkék

- `Hiányzó felvételrészek`: a scriptből hiányzó felvételek és beszédrészek.
  A tételek a script-ID-val kezdődjenek, és tartalmazzák a hiányzó rész
  scriptbeli szövegét szó szerint.
- `Kézi vágást igénylő részek`: a bizonytalanul vágható tartományok, amelyeket
  a review vagy Rough Cut timeline teljes egészében megtart `REVIEW START` és `REVIEW END`
  markerekkel. A bejegyzés tartalmazza a script-ID-t, az okot, a forrásútvonalat
  és forrásidő-tartományt, valamint az érintett timeline nevét és markerhelyeit.
