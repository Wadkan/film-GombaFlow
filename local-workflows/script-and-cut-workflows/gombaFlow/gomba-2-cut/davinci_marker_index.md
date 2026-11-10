# DaVinci Resolve marker index

Ez a fájl a Gomba 2 workflow markerneveinek és színeinek közös forrása.
A Resolve timeline-on a következő angol markerneveket használd:

- **Red — `KEEP IN`:** a megtartandó rész kezdete.
- **Red — `KEEP OUT`:** a megtartandó rész vége.
- **Blue — `TITLE`:** cím vagy felirat helye.
- **Pink — `IMAGE OVERLAY`:** a talking head fölé kerülő kép helye.
- **Yellow — `REVIEW START`:** kézi átnézést igénylő rész kezdete.
- **Yellow — `REVIEW END`:** kézi átnézést igénylő rész vége.
- **Yellow — `OMIT TAKE`:** a teljes klippéldány kihagyására tett javaslat;
  egyetlen tartománymarker, amely a klip teljes hosszát lefedi.

Az első review timeline minden klippéldánya kapjon piros megtartási
markerpárt, sárga review markerpárt vagy egy sárga `OMIT TAKE` tartománymarkert.
Az `OMIT TAKE` ugyanazon klipen nem szerepelhet megtartási vagy review
jelöléssel együtt. A marker nevét és színét együtt ellenőrizd; a sárga szín
önmagában nem jelent bizonytalanságot. Jelöletlen klipből ne következtess törlésre.

A `KEEP IN` és `KEEP OUT` pár közötti rész marad meg; több pár több megtartandó
részt jelölhet. Ha egy megtartási tartomány vagy markerpár nem egyértelmű,
az érintett anyag maradjon bent kézi vágáshoz. A teljes bizonytalan rész elejét
és végét az első review timeline-on, majd a második timeline-on is
`REVIEW START` és `REVIEW END` marker jelölje.
