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
nem kell külön marker. A videoklip kapjon piros megtartási markerpárt, sárga
review markerpárt vagy egy sárga `OMIT TAKE` tartománymarkert. A döntés
ugyanarra a kép- és hangtartományra vonatkozik.
Az `OMIT TAKE` ugyanazon klipen nem szerepelhet megtartási vagy review
jelöléssel együtt. A marker nevét és színét együtt ellenőrizd; a sárga szín
önmagában nem jelent bizonytalanságot. Jelöletlen klipből ne következtess törlésre.
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
