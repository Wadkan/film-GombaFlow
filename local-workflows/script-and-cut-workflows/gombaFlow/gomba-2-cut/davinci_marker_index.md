# DaVinci Resolve marker index

Ez a fájl a Gomba 2 workflow markerneveinek és színeinek közös forrása.
A Resolve timeline-on a következő angol markerneveket használd:

- **Red — `KEEP IN`:** a megtartandó rész kezdete.
- **Red — `KEEP OUT`:** a megtartandó rész vége.
- **Blue — `TITLE`:** cím vagy felirat helye.
- **Pink — `IMAGE OVERLAY`:** a talking head fölé kerülő kép helye.
- **Yellow — `REVIEW START`:** kézi átnézést igénylő rész kezdete.
- **Yellow — `REVIEW END`:** kézi átnézést igénylő rész vége.

A `KEEP IN` és `KEEP OUT` pár közötti rész marad meg; több pár több megtartandó
részt jelölhet. Ha egy megtartási tartomány vagy markerpár nem egyértelmű,
az érintett anyag maradjon bent kézi vágáshoz. A teljes bizonytalan rész elejét
és végét az első review timeline-on, majd a második timeline-on is
`REVIEW START` és `REVIEW END` marker jelölje.
