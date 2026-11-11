# Explainer video of 9 football rules

**#305 by popularity** · ♥ 135 · 19,002 views · by [@lukasersil](https://x.com/lukasersil) · [Original post](https://x.com/lukasersil/status/2105922894924501283) · [Watch the video](https://video.twimg.com/amplify_video/2105921779478691840/vid/avc1/1280x720/5rDctckTd2waW8Q2.mp4?tag=29)

[![Explainer video of 9 football rules](https://pbs.twimg.com/amplify_video_thumb/2105921779478691840/img/QYm_3-KAgORYR8-H.jpg)](https://x.com/lukasersil/status/2105922894924501283)

## Prompt

```text
Postav mi video, které vysvětluje pravidla sportu stylem televizní analýzy s AR grafikou. Bez AI video modelů a bez stahování assetů: 3D scénu, postavy, textury, grafiku i zvuk vytvoř kódem. Pracuj samostatně a průběžně mi ukazuj kontrolní snímky.

## Parametry (pro jiný sport změň tuhle sekci a sekci Scénář)
- Sport: fotbal
- Pravidla (9): ofsajd, faul, pokutový kop, vhazování, rohový kop + kop od branky, hra rukou, přímý volný kop, žlutá a červená karta, gól (celý míč za čarou)
- Jazyk všech textů: čeština (plná diakritika, desetinná čárka)
- Délka: cca 68 s (úvod ~4,5 s, každé pravidlo 6 až 8 s, závěr ~4 s)
- Formát: 1920×1080, 30 fps, MP4 (H.264 + AAC)
- Styl postav: PS2 éra ve stylu GTA San Andreas (low-poly tvarované tělo, ručně malované textury)
- Týmy: Červení (červený dres s bílými lemy, bílé trenky), Modří (královsky modrý dres, tmavě modré trenky), rozhodčí černý s limetkovými lemy, brankáři zelený a fialový

## Technologie a pipeline
- Three.js (npm). index.html obsahuje WebGL canvas 1920×1080 a nad ním DOM vrstvu pro HUD.
- Deterministická funkce `window.renderFrame(t)`: stav scény i HUD je čistá funkce času, žádný stav mezi snímky.
- `render.mjs`: lokální statický HTTP server + puppeteer-core se systémovým Chrome (headless, na Macu `--use-angle=metal`). Pro každý snímek zavolej renderFrame(t), počkej 2× requestAnimationFrame, udělej JPEG screenshot a pošli ho rourou do ffmpeg (libx264, CRF 18, yuv420p). Režimy: `stills t1 t2 …` (PNG na kontrolu), `video`, `info` (zapíše časovou osu do out/timeline.json).
- Cesty řeš přes fileURLToPath (složky s mezerami v názvu).
- WebGLRenderer s `preserveDrawingBuffer: true`, ACES tone mapping, PCF soft shadows. EffectComposer s MSAA (samples 4, HalfFloat): RenderPass, UnrealBloomPass, vlastní grade pass (vinětace, jemné zrno, chromatická aberace, záblesk, whip blur, VHS efekt), OutputPass.
- Zvuk: Python (numpy + scipy) syntetizuje celý soundtrack do WAV, ffmpeg ho přimíchá (AAC 192k).
- Výstupy: plná kvalita + webová verze (CRF 23 až 24, maxrate 10M).

## Struktura projektu
src/util.js (easing, tmap pro freeze a zpomalení, track() pro pohyb hráčů po časovaných waypointech s fází běhu podle uražené vzdálenosti, seeded rng), src/world.js, src/player.js, src/ar.js, src/hud.js, src/grade.js, src/segments.js, src/main.js, render.mjs, https://audio.py/, PROGRESS.md (průběžně zapisuj, co je hotové a jak se to pouští, ať se dá navázat po přerušení).

## Svět
- Hřiště 105×68 m. Tráva jako canvas textura (pruhy po 5,25 m, šum, skvrny) + dlaždicová detail textura přes onBeforeCompile. Čáry jako ostrá geometrie, ne textura. Vnější hrana čar = hranice hřiště.
- Branky se sítí (LineSegments), rohové praporky.
- Stadion: dvoupatrová mísa podle superelipsy, dav jako canvas textura lidí v řadách, LED pás mezi patry, střecha s žebry, řady reflektorů na hraně střechy (emisivní, bloom), vnější fasáda s osvětlenými okny, noční obloha, světla města kolem, tmavá zem.
- LED mantinely kolem hřiště s českými nápisy (PRAVIDLA FOTBALU, RESPEKT, FAIR PLAY, ZNEJ PRAVIDLA, #PRAVIDLAFOTBALU), pomalu se posouvají.
- Světla: 4 směrová světla z rohů střechy se stíny (shadow kamera zaostřená na akci daného segmentu), hemisférické světlo, jemná mlha.
- Analytický grade: do všech materiálů světa vlož přes onBeforeCompile sdílený uniform uFreeze (odbarvení do chladné šedozelené + ztmavení). AR materiály ho nemají, takže při zastaveném obrazu zůstanou syté.

## Postavy (styl GTA San Andreas)
- Hierarchický rig: root → body (pánev) → trup → hlava a ramena → lokty, kyčle → kolena → kotníky. Póza = sada úhlů (náklon a rotace trupu, flexe a abdukce ramen, lokty, kyčle, kolena, kotníky, náklon těla, výskok).
- Geometrie: trup jako LatheGeometry (široká ramena, užší pas), zúžené končetiny, klouby jako koule, dlaň s palcem, kopačka s podrážkou a zúženou špičkou, tvarovaná hlava (užší brada), nos, uši, vlasy jako slupka (krátké, objemné, ježek, holá hlava).
- Ručně malované canvas textury: obličej (oči s duhovkou a odleskem, obočí, stín nosu, rty, tváře, strniště nebo vousy, vlasová linie), dres (V-výstřih, boční pruhy, znak, sponzor, jméno a velké číslo na zádech, vrásky látky), rukávy, trenky s číslem, štulpny s pruhy.
- Každý hráč jiný: pleť, vlasy, účes, oči, vousy, barva kopaček, postava. Česká jména na zádech (NOVÁK, DVOŘÁK, RŮŽIČKA…).
- Procedurální běh (fáze z uražené vzdálenosti, ať nohy nekloužou) + knihovna póz: kop (nápřah, úder, dokopnutí), skluz, zakopnutí a pád, vhazování, výskok s paží nad hlavou, zvednutá karta, postoj ve zdi, výskok zdi, robinzonáda brankáře, hlava dolů.
- Zvýraznění: obrysová slupka (inverted hull, tloušťka podle vzdálenosti od kamery), průsvitný hologram „ducha“ pro naznačení restartu, rozsvícení paže.

## AR grafika (additive blending, depthWrite false, kreslí se postupně přes progress)
GroundLine (zářící čára na zemi), Curtain (svislá rovina: ofsajd, branková a postranní čára), GroundRing (prstenec nebo disk s pulzem, čárkováním a výsečí, třeba kruh 9,15 m), Area (vyplněné území s okrajem a skenem), Trail (trubice trajektorie míče), GroundArrow (šipka s běžícími chevrony), Marker (zaměřovač kontaktu), Beam (světelný sloup), ScanGrid (skenovací mřížka), Segment3D (měřicí úsečky), Silhouette (válec obrysu těla).
Barvy: tyrkysová = měření, červená = přestupek, jantarová = míč a území, zelená = platné rozhodnutí.
DŮLEŽITÉ: shadery musí být NaN-safe (clamp UV, žádné pow ze záporného čísla). MSAA na hranách extrapoluje UV a NaN se v bloomu rozleje do černých bloků přes půl obrazu.

## HUD (DOM, styl sportovního přenosu)
- Logo vlevo nahoře „PRAVIDLA FOTBALU / AR ANALÝZA ZÁPASU“ + počítadlo „01 / 09“.
- Vpravo nahoře stav (ŽIVĚ, ZÁZNAM, ZPOMALENĚ ×0,6, STOP · AR, PŘETÁČENÍ ◀◀, KONEC ZÁPASU) a herní čas.
- Lower third vlevo dole: číslo pravidla, název, jednověté vysvětlení, ukazatel postupu z 9 dílků.
- Panel rozhodnutí vpravo dole v barvě rozhodnutí (OFSAJD, PENALTA, GÓL…) s podtitulkem.
- Při zastavení obrazu: záblesk, rohové závorky, štítek „ZASTAVENÝ OBRAZ · AR ANALÝZA“, krátký technický řádek dole.
- AR štítky ukotvené na 3D bod (projekce kamerou) s odkazovou čarou. Drž je v bezpečné zóně (ne pod spodní grafikou, ne pod logem) a nesmí se překrývat.
- Velká grafika karty (žlutá a červená) s důvody, úvodní titulek, závěr „TEĎ ZNÁŠ PRAVIDLA.“ s mřížkou 9 pravidel, stinger přechod (šikmé pruhy navy, tyrkysová, bílá + logo) na každém střihu.
- Čitelnost: minimální velikosti (název pravidla 66 px, popis 29 px, štítek 33 px + podtitulek 21 px, technický řádek 22 px). Text vždy na tmavém podkladu, krátké texty. Line-height aspoň 1,05, aby diakritika (Ž, Č, Ř) nebyla oříznutá. Titulky neodhaluj maskou, vypadá to jako ořez: použij fade + rozostření + lehký zoom.
- Fonty: systémové s českou diakritikou (na macOS DIN Condensed + Avenir Next Condensed). Pokrytí znaků ověř předem přes fc-query.

## Scénář (vnitřní časy segmentů, natažení na čtení viz další sekce)
Úvod (3,5 s): dron sjíždí z noční oblohy přes střechu do stadionu na široký záběr středu hřiště. Skenovací mřížka přejede hřiště, pod hráči naskočí kroužky, štítek „MÍČ SLEDOVÁN“. Titulek „PRAVIDLA FOTBALU“, nad ním „TV ANALÝZA PRAVIDEL“, pod ním „9 KLÍČOVÝCH PRAVIDEL · AR ANALÝZA“.
1. Ofsajd: televizní kamera, Červený #8 přihrává, zastavení v okamžiku přihrávky. Kamera se přesune do osy ofsajdové linie. Tyrkysová rovina u nejzazší části těla předposledního obránce (Modrý #4), červená u předsunutého kolena útočníka (Červený #9), měření „+1,59 m“ (spočítej z kloubů, paže se nepočítají). Rozhodnutí OFSAJD: nepřímý volný kop, Modří.
2. Faul: záznam ×0,6 nízko u trávníku. Modrý #10 vede míč, Červený #6 jde skluzem zezadu do kotníku. Zastavení v okamžiku kontaktu: zaměřovač „KONTAKT“, „MÍSTO FAULU“ (kruh + sloup), šipka dráhy skluzu, červený obrys. Kamera obkrouží, pak pád. FAUL: přímý volný kop.
3. Penalta: Červený #9 ve vápně, Modrý #3 ho podrazí. Zastavení, jeřáb nahoru. Zvýraznění pokutového území, oblouk z místa faulu na pokutovou značku s drátěným míčem, „11 m“. PENALTA.
4. Vhazování: přihrávka Červeného #2 přejede postranní čáru (trajektorie se kreslí živě). Zastavení až ve chvíli, kdy je celý míč venku, střih na kameru za čarou. Červená rovina, „+15 cm“, „CELÝ MÍČ VENKU“, „POSLEDNÍ DOTEK · ČERVENÝ #2“, modrá šipka do hřiště a hologram modrého hráče s míčem nad hlavou. VHAZOVÁNÍ (Modří).
5. Roh + kop od branky: střela Červeného #10 tečovaná Modrým #4 za brankovou čáru → ROHOVÝ KOP. Pak efekt přetáčení (VHS) a stejná střela bez teče → KOP OD BRANKY (zvýrazněné brankové území).
6. Hra rukou: střela, Modrý #5 ve výskoku s paží nad ramenem, míč do předloktí. Paže zčervená, ramenní linie, čára paže „ÚHEL PAŽE 135°“, průsvitný válec „OBRYS TĚLA“. RUKA: přímý volný kop.
7. Volný kop: zeď na 8,00 m „ZEĎ MOC BLÍZKO“, nakreslí se kruh 9,15 m, zeď ustoupí, číslo naběhne na 9,15 m a zezelená. Kamera za exekutora, zahraný oblouk přes zeď zpomaleně, zastavení „PŘES ZEĎ“. PŘÍMÝ VOLNÝ KOP.
8. Karty: detail rozhodčího se žlutou kartou proti hráči se svěšenou hlavou + velká grafika ŽLUTÁ KARTA / NAPOMENUTÍ se 3 důvody. Střih, červená karta, vyloučený odchází + ČERVENÁ KARTA / VYLOUČENÍ.
9. Gól: střela, brankář vyrazí, míč padá na čáru. Kamera u brankové čáry. První zastavení: polovina míče na čáře, červená rovina, „−11 cm“, „ZATÍM NENÍ GÓL“. Míč se dokutálí. Druhé zastavení: celý míč za čarou, rovina zezelená, „+3 cm“, blesky foťáků v hledišti. GÓL.
Závěr (2,5 s): kamera stoupá nad hřiště (návrat k úvodnímu záběru), mřížka, „TEĎ ZNÁŠ PRAVIDLA.“ + mřížka 9 pravidel, stmívačka.

Každé zastavení obrazu: krátký záblesk, odbarvení scény, kamera se dál pomalu hýbe kolem zmrazených hráčů, AR prvky naskakují postupně. Mezi segmenty vždy stinger.

## Čas na čtení
Akce (běh, kopy, skluzy) běží ve skutečné rychlosti. Analytické části každého segmentu natáhni 1,5× až 2,1× přes warp funkci (výstupní čas → vnitřní čas segmentu), aby každé pravidlo bylo na obrazovce 6 až 8 s a všechny texty se daly v klidu přečíst. `node render.mjs info` exportuje výslednou časovou osu do out/timeline.json.

## Zvuk (procedurální, https://audio.py/)
120 BPM broadcast groove (kopák, virbl, hi-haty, basa se sidechainem, arpeggio, pad), riser v úvodu, závěrečný akord. Při zastaveném obrazu hudba ztlumená low-passem. Dav (filtrovaný šum s vlněním, řev při gólu), whoosh + boom na každém střihu, kovový úder na každém zastavení, krátké „razítko“ při rozhodnutí, píšťalka, kopy do míče, zvuk přetáčení. Časy všech zvuků načti z out/timeline.json, ať sedí na obraz i po změně délky. Cílová hlasitost kolem −14 LUFS.

## Postup práce a kontrola
1. Nejdřív rozjeď pipeline (server, render, ffmpeg) s jednou scénou a ověř, že WebGL v headless Chrome běží.
2. Po každé změně vyrenderuj kontrolní snímky v klíčových časech a prohlédni je, včetně výřezů na 100 % kvůli textu a diakritice.
3. Celé video kontroluj přes kontaktní listy (ffmpeg filtr tile) a snímky kolem přechodů.
4. Hotové video ověř dekódováním (`ffmpeg -v error -i video.mp4 -f null -`) a délku a stopy přes ffprobe.
5. Do PROGRESS.md průběžně zapisuj, co je hotové a jakými příkazy se to pouští.
```

The prompt and video belong to @lukasersil; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)
