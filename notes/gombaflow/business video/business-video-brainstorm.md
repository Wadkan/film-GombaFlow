
legyen egy kepzelt ceg vicces trendy nevvel amivel bemutatom a peldaimat
legyen mcp sorozat?


youtube video create-or skilll
-konstans reszek es kepernyok
-osszefoglalo



uzenet lehet slack/telegram.
anyagok tarolasa: remote repo - igy van verziokovetes, kommit, lehuzhato lokalba, es elerheto felhobol
	file-nevek es file-on belul id-k kidolgozasa es katalogusba helyezese kulon

PIPELINE:
-> kerses naponta
-> tema szurese, osszeallitas ha nincs meg a listaban
	-> tema javaslatok kuldese usernek sorszamozott listaban roviden
	-> user temakat jovahagyja vagy elutasitja szovegesen uzenetben: peldaul 1,2-t tedd be (igy bekerul listaba a tema)
	-> tema listaba kerul added state-el
-> added temakat ai user jovahagyas utan rogton kidolgozza es scriptet keszit beloluk kulon google docs file-ba (?)-be es ertesiti usert uzenetben
	-> google docs file link kuldese usernek
	-> user scriptet atolvassa es velemenyez vagy kerhet valtozast vagy beleirhat google docsba beirva peldaul [FIXME] prefgixszel kulon sorba
-> triger: user ir telegramon elozo uzenetre valaszolva - ok, vagy change
	-> ok: docs status: draft accepted, change: megnezi a ekszitett dokumentamban user fixme-jeit es javitja majd ujra ir usernek ha kes.z



n8n - for business youtube automation
https://www.youtube.com/watch?v=e3OV3LnrS7o



IN PROGRESS
-mik codexben az uj skillek macen?


-RESEARCH: youtube uploader automation - mivel legegyszerubb es leghatekonyabb? naptarban schedule?

-CSAK MIUTAN DAVINCI SKILLEK KI LETTEK PROBALVA:
	-sajat video vagas survival skill-ek letrehozasa



RESEARCH
szuksegem van egy templatere a business video (automation, n8n, ai skills, agents, stb) bemutato videoimhoz. nagyon professzionalis kell legyen, ai vagassal es fizetos davincival konnyen hasznalhato amennyire lehet automatikusan (ai driven).
roviden listazd a 5 top lehetoseget.
 kesz templatet szeretnek, nem szertenek nagyon belemelyedni, csak hasznalni szeretnem.
 amire szuksegem van: cim kartyak a reszek kozott igenyes transitionnel es akar hanggal
 kiiras tipusok ha magyarazok valamit

RESEARCH: milyen hosszu legyen a video?
RESEARCH: legsikeresebb ai bemutato videok pontjai, hosszusaga, tomorsege, hook es tanulsaga

RESEARCH: davinci transparetn talking head


 WORKFLOW
 
 COLLECT NEWS
 -scheduled idea collector
 -filter top ideas per week
 -select ideas by human from recommendation
 -put selected ideas into a list

CREATE SCRIPT
 -list addition triggers pilot story kidolgozas
    -create similar BUT DIFFERENT the source video in MY STYLE
    -collect: pontok ami bemutatasra kerul
    -collect: eszkozok a pontokhoz: install, beallit
    -cli ai demo (prompt cli agentnek mit hajtson vegre es milyen timinggal)
        -iterative user review
    -story telling
    -create timing from story - bemutato video keszitese storyhoz
    -plan template transitions and texts (template)
        -iterative user review
    SCIPT READY
    
    VIDEO
    -screenrecording cli actions demo
        -iterative user review
    -approved videora talking head felvetel
    -davinci + ai rough cut
        -iterative user review
        -add templates from the plan between captions
    
    META CREATION
    -generate captions for youtube
    -generate meta for all platforms (youtube title, etc.)
    -cut main, shorts, tiktok, insta videos
    -generate images and posts for linkedIn (and other platforms)
    
    UPLOAD
    -upload ready videos, images and posts
