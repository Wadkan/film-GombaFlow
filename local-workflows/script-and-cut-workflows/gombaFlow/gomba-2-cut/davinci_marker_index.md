# DaVinci Resolve marker index

Ez a fájl a Gomba 2 workflow markerneveinek és színeinek közös forrása.
A Resolve timeline-on a következő angol markerneveket használd:

- **Red — `KEEP IN`:** a megtartandó rész első képkockája.
- **Red — `KEEP OUT`:** a megtartandó rész utolsó képkockája; ez a kép még megmarad.
- **Blue — `TITLE`:** cím vagy felirat helye.
- **Pink — `IMAGE OVERLAY`:** a talking head fölé kerülő kép helye.
- **Yellow — `REVIEW START`:** a kézi átnézést igénylő rész első képkockája.
- **Yellow — `REVIEW END`:** a kézi átnézést igénylő rész utolsó képkockája; ez is megmarad.
- **Yellow — `OMIT TAKE`:** a teljes klippéldány kihagyására tett javaslat;
  egyetlen tartománymarker, amely a klip teljes hosszát lefedi.

Az első review timeline minden videoklipje és kapcsolt hangja egy vágási
egységet alkot. A vágási markerek a videoklipen legyenek; a kapcsolt hangra
nem kell külön marker. Egy fizikai videoklip több logikai `recording_id`
tartományt is tartalmazhat, ezért ugyanazon klipen lehetnek különböző,
nem átfedő piros `KEEP IN` / `KEEP OUT` és sárga `REVIEW START` /
`REVIEW END` markerpárok. Minden marker megjegyzésében szerepeljen a hozzá
tartozó `recording_id`; a `script_id` csak akkor, ha ismert. A döntés az adott
logikai tartomány kép- és hangrészére vonatkozik.
Az `OMIT TAKE` ugyanazon klipen nem szerepelhet megtartási vagy review
jelöléssel együtt, és csak akkor használható, ha a teljes fizikai klip
kihagyása jóváhagyott. Részleges logikai rekord kihagyását ne jelöld az egész
fizikai klipet lefedő `OMIT TAKE` markerrel. A marker nevét és színét együtt
ellenőrizd; a sárga szín önmagában nem jelent bizonytalanságot. Jelöletlen
logikai tartományból ne következtess törlésre. A megtartási tartományok
`KEEP IN` / `KEEP OUT` határai mutatják a tervezett kivágások helyét; a
review timeline fizikai klipjéből ne távolíts el képkockát.
Ha a kapcsolt hangon is van vágási marker, és az a videó jelölésével eltérő
vagy nem összevethető döntést jelent, az egész egység maradjon meg kézi
review-ra.

A `KEEP IN` és `KEEP OUT` közötti rész mindkét jelölt képkockával együtt marad
meg; több pár több megtartandó
részt jelölhet. Ha egy megtartási tartomány vagy markerpár nem egyértelmű,
az érintett anyag maradjon bent kézi vágáshoz. A teljes bizonytalan rész elejét
és végét az első review timeline-on, majd a második timeline-on is
`REVIEW START` és `REVIEW END` marker jelölje.

A fájlokban és belső számításban a képkockatartomány félig nyílt `[start, end)`:
az `end` az utolsó megtartott képkockát követő határ. Például `[10, 100)`
esetén a kezdő marker a 10., a záró marker a 99. képkockán van. A marker
időalapjában visszaolvasott zárómarkerhez egyet adva kapod meg az `end` határt;
a forrás- és timeline-képkockákat csak ezután, saját FPS-ükkel váltsd át.
