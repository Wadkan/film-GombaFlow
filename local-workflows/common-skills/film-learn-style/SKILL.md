# film-learn-style

Ez a közös, `local-workflows` alatti skill egy `script-and-cut` workflow
hang- és stílusszabályait bővíti. Nem agent-skillként települ; ezt a leírást
workflow-koordinátor vagy ember futtatja.

## Első üzenet

1. Olvasd be a `local-workflows/script-and-cut-workflows/workflow-registry.json`
   fájlt.
2. A `workflows` objektum minden bejegyzése egy választható workflow. Ne bontsd
   tovább a bejegyzés alatti alkönyvtárakra vagy `WORKFLOW.md` fájlokra.
3. Sorszámozd a bejegyzéseket a registry sorrendjében. Minden opciónál add meg
   a registry-kulcsot és a feloldott, repo-relatív workflow-gyökérútvonalat.
4. Tedd fel ugyanabban az üzenetben, két külön sorban, pontosan ezeket a kérdéseket:

    `Melyik script-and-cut-workflow sorszámát választod? Csak a sorszámot add meg.`

    `Mit szeretnél hozzáadni ehhez a workflow-hoz?`

5. Kérd, hogy az első kérdésre a felhasználó csak a workflow sorszámát adja
   meg, a másodikban pedig írja le a hozzáadandó szabályt. A két kérdés után
   jelenítsd meg az `Elérhető workflow-k:` feliratot, majd a sorszámozott listát.
   Ha a registry
   nem olvasható/hibás, vagy nem található workflow, jelezd az akadályt, és ne
   találj ki opciót vagy fájlt.

## Szabály ellenőrzése és hozzáadása

1. A workflow kiválasztásához fogadd el a felsorolt sorszámot. Ha a válasz nem
   egyezik egy listázott sorszámmal, ismét kérd be a sorszámot.
2. A célfájl a kiválasztott registry-bejegyzés gyökérmappájában lévő `style.md`.
   Ha létezik, olvasd el teljes egészében. Ha nem létezik, olvasd el a gyökér
   alatti `WORKFLOW.md` fájlokat és az azokban hivatkozott, stílust vagy
   scriptírást meghatározó dokumentumokat.
3. Értelmezd a kérést egyértelmű, önálló szabályként. Ellenőrizd a teljes
   meglévő `style.md`-ben, valamint a workflow releváns dokumentumaiban és
   template-jeiben, hogy a szabály már szerepel-e, vagy ellentmond-e meglévő
   hang-, stílus-, tartalmi vagy szerkezeti szabálynak.
4. Ha azonos szabály már létezik, ne add hozzá újra; mutasd meg, melyik meglévő
   pont fedi le.
5. Ha ellentmondást találsz, ne szerkessz semmit. Nevezd meg az ütköző
   szabályokat, és kérj iránymutatást a felhasználótól.
6. Ha nincs ismétlés vagy ellentmondás, fogalmazd meg tömören a szabályt, majd
   add hozzá a workflow `style.md` fájljához a megfelelő fejezet alatt. Ha nincs
   megfelelő fejezet, hozz létre egy tömör címet. Ha a fájl nem létezett,
   hozz létre címmel és az új szabállyal.
7. Csak a kiválasztott workflow `style.md` fájlját módosítsd. Őrizd meg a fájl
   többi tartalmát; más workflow-t, regisztert, template-et vagy skillt ne írj át.

## Befejezés

Röviden jelezd a módosított fájlt és az új szabályt, vagy azt, hogy miért nem
történt módosítás.
