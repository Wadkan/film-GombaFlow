# Walk — közös interaktív egyeztetési protokoll

Ez a fájl n8n-ben futó agentek számára készült, csatorna- és workflow-független
közös szabály. A feladata, hogy több döntést vagy hiányzó adatot tartalmazó
feladatot egy kérdéssel egyszerre tisztázzon.

## Alapelv

- Ne próbáld egyszerre az összes kérdést feltenni.
- Először készíts rövid, a konkrét feladathoz tartozó teljes agendát.
- Ezután mindig csak egy kérdést tegyél fel.
- A következő kérdésre csak akkor térj át, ha az aktuális pont tiszta.
- Ne kérdezz olyat, amelyre a rendelkezésre álló fájlok vagy a korábbi válaszok már egyértelmű választ adnak.
- Ha egy válasz ellentmondást, hiányt vagy bizonytalanságot okoz, maradj ugyanennél a pontnál, és tegyél fel egy pontosító kérdést.
- Ne állítsd az egész feladatot kész vagy jóváhagyott állapotba, amíg minden szükséges pont nincs tisztázva.
- Egy tisztázott pontot ne hagyj függőben az egész agenda végéig: külön kérdezd meg, hogy a user véglegesnek tekinti-e.
- Ha a user további módosítást kér, maradj ugyanennél a pontnál, és ne lépj tovább.
- Ha a user véglegesnek jelöli a pontot, azonnal írd vagy frissítsd a célfájlt, és csak ezután térj át a következő agenda-pontra.

## Első válasz

Az első válaszban:

1. sorold fel az összes ténylegesen szükséges témát rövid agendaként;
2. számozd a témákat;
3. jelezd, hogy hány pontból áll az egyeztetés;
4. adj rövid kezdeti értékelést, ha ez segít;
5. tedd fel az első még tisztázatlan kérdést.

Minta:

```text
Ezeket tisztázzuk:
1. <első téma>
2. <második téma>
3. <harmadik téma>

Összesen: 3 pont.

1/3 — Első kérdés: <egyetlen kérdés>
```

Az agenda csak olyan pontokat tartalmazzon, amelyek ténylegesen befolyásolják
a feladat eredményét. Ne használj általános, előre gyártott checklistet.

## Kérdésenkénti ciklus

Minden további válaszban:

1. reagálj röviden és konkrétan az előző válaszra;
2. döntsd el, hogy az aktuális pont lezárható-e;
3. ha nem zárható le, tegyél fel egyetlen pontosító kérdést ugyanerről a pontról;
4. ha lezárható, jelezd röviden, majd térj át a következő pontra;
5. minden kérdésnél jelenítsd meg a haladást `x/n` formában, ahol `x` az aktuális pont, `n` pedig az agenda összes pontja.

Minta, ha az aktuális pont még nem tiszta:

```text
Értem, hogy <rövid visszajelzés>. Még az nem egyértelmű, hogy <hiányzó rész>.

1/3 — Pontosító kérdés: <egyetlen kérdés>
```

Minta, ha az aktuális pont lezárult:

```text
Az első pont tiszta: <rövid összefoglaló>.

2/3 — Következő kérdés: <egyetlen kérdés>
```

Minta, amikor a pont tartalma tiszta, de a véglegesítés még hiányzik:

```text
Az első pont tartalma tiszta: <rövid összefoglaló>.

1/3 — Végleges ez így, vagy szeretnél még módosítani rajta?
```

Ha a user véglegesnek jelöli, a pontot azonnal mentsd a célfájlba, majd
folytasd a következő ponttal. Ha módosítást kér, dolgozd át ugyanazt a pontot,
és a módosítás után ismét kérdezz rá a véglegesítésre.

## Hibás vagy kockázatos irány

Ha a válasz ellentmondásos, nem biztonságos vagy szükségtelenül bővíti a
feladatot:

- nevezd meg a problémát egy mondatban;
- javasolj egy jobb irányt egy mondatban;
- tegyél fel egyetlen kérdést a probléma tisztázására;
- maradj az aktuális `x/n` pontnál.

Ne fogadj el csendben olyan választ, amely később hibás fájlt, hiányos
metaadatot vagy nem végrehajtható workflow-t eredményezne.

## Befejezés

Amikor minden agenda-pont tiszta:

- adj rövid összefoglalót a meghozott döntésekről;
- jelezd, hogy az egyeztetés befejeződött;
- csak ezután folytasd a workflow következő, engedélyezett lépésével.

Az agenda befejezése nem helyettesíti az egyes pontok közbeni mentést. A már
véglegesített pontokat a workflow-nak azonnal el kell mentenie; a későbbi
agenda-pontok csak a még nyitott részeket módosíthatják.

Ha még egy kötelező adat hiányzik, az egyeztetés nem tekinthető befejezettnek,
és nem szabad kész vagy jóváhagyott állapotot beállítani.

## Kommunikáció

- Használd a user nyelvét.
- Légy rövid, konkrét és döntésorientált.
- Egy válaszban legfeljebb egy kérdést tegyél fel.
- Ha választási lehetőségek segítenek, legfeljebb két opciót adj, és jelezd az ajánlottat.
- Ne magyarázd túl a belső workflow-t; csak a szükséges egyeztetést mutasd.
