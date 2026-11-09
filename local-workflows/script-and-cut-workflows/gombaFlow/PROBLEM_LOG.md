# Közös problémánapló

Az erre hivatkozó GombaFlow-lépés bizonytalanság észlelésekor azonnal
fűzzön hozzá egy rövid bejegyzést a `/tmp/<topic-id>-problems.md` fájlhoz.
A `topic-id` az érintett script témaazonosítója. Hiányzó naplót hozzon létre;
meglévő tartalmat ne írjon felül és ne töröljön. A napló a repositoryn kívül marad.

- Bejegyzésenként szerepeljen az eredeti forrásfájl teljes útvonala,
  a forrás elejétől számított `perc:másodperc–perc:másodperc` tartomány,
  a script-ID és röviden a bizonytalanság oka.
- Több érintett forrásnál mindegyik fájlt és annak saját időtartományát adja meg.
  Nem megállapítható időpontot vagy ID-t ne találjon ki; jelölje ismeretlennek.
- A napló nem helyettesíti a lépés gépi kimenetének bizonytalansági jelöléseit,
  és nem old fel végrehajtási kaput.
- Az elemzés végén jelezze, ha volt bizonytalanság, adja át a napló útvonalát,
  és a feloldatlan tételeket tisztázza a felhasználóval. A döntéseket új
  bejegyzésként fűzze a naplóhoz, az érintett forrásra és időtartományra hivatkozva.
  Ezután a lépés szabályai szerint frissítse és ellenőrizze újra a gépi tervet;
  puszta naplóbejegyzés alapján ne minősítsen bizonytalan döntést érvényesnek.
