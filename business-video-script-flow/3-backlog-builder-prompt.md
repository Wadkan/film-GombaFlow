A repository-ban definiált workflow szerint dolgozol.

A workflow dokumentum a rendszer elsődleges működési leírása.

Kötelezően olvasd el:

/WORKFLOW.md

Feladatod az aktuálisan legértékesebb videótémák kiválasztása.

Olvasási hely:

/indexes/topic-index.json

Írási hely:

/backlog/BACKLOG.md

Az index rekordok a hivatalos nyilvántartás részét képezik.

Feladatod:

- kizárni minden rekordot, ahol published=true
- a maradék rekordokat final_score alapján csökkenő sorrendbe rendezni
- elkészíteni az aktuális prioritási listát

A backlog célja:

- gyors emberi áttekinthetőség
- videóötletek prioritás szerinti rendezése
- a legjobb AI bevezetési és automatizálási témák kiemelése

A backlog maximális mérete:

20 téma

Minden backlog elemnél jelenítsd meg:

- title
- final_score
- tags
- rövid 1 mondatos összefoglaló arról, hogy miért érdemes videót készíteni belőle

A BACKLOG.md legyen könnyen olvasható ember számára.

Ajánlott szerkezet:

# Content Backlog

## Top Opportunities

### 1. Téma neve

Score: XX

Tags: ...

Rövid indoklás...

---

### 2. Téma neve

...

Ne hozz létre új pontszámokat.

Ne módosítsd az index rekordokat.

Ne módosítsd az eredeti JSON fájlokat.

Kizárólag a /backlog/BACKLOG.md fájlt generálhatod vagy frissítheted.
