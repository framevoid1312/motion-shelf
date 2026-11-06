# Pixel-art Paris night diorama lofi loop

**#130 by likes** · ♥ 655 · by [@minosdevs](https://x.com/minosdevs) · [Original post](https://x.com/minosdevs/status/2103112945341251920) · [Watch the video](https://video.twimg.com/amplify_video/2103112926575910912/vid/avc1/1298x720/t85IUdEprERBM-Th.mp4)

[![Pixel-art Paris night diorama lofi loop](https://pbs.twimg.com/amplify_video_thumb/2103112926575910912/img/iZVnHGYtDMTFx5O4.jpg)](https://x.com/minosdevs/status/2103112945341251920)

## Prompt

```text
Fais-moi un diorama pixel-art animé de Paris la nuit, pour servir de fond en boucle à une vidéo lofi de 10 heures sur YouTube. Tout dans un seul fichier HTML (canvas + JavaScript, sans librairie).

AMBIANCE ET COULEURS
Joue à fond sur le contraste chaud / froid : une nuit pluvieuse bleu nuit et violette, avec des coins de lumière chaude. La tour Eiffel dorée, les fenêtres éclairées, les réverbères, un café.

LA SCÈNE (de l'arrière vers l'avant)
- Un ciel en dégradé tramé (dithering façon pixel art), une lune avec un halo, et plusieurs couches de nuages qui défilent lentement, éclairées par la lune au-dessus et par la ville en dessous.
- La tour Eiffel au centre, dorée, avec sa structure en treillis, ses 3 plateformes et son antenne. Son phare tourne et balaie le ciel. Elle scintille régulièrement (des points blancs qui clignotent partout), et une lumière rouge clignote tout en haut.
- Au fond, une ligne de toits parisiens avec des fenêtres qui s'allument et s'éteignent, le dôme doré des Invalides et le Sacré-Cœur blanc sur sa colline.
- Un quai avec des platanes et des réverbères.
- La Seine, avec les reflets de la tour et des lampadaires qui ondulent, de longues traînées de lumière dorée, des ronds de pluie sur l'eau, et un bateau-mouche éclairé qui traverse de temps en temps.
- À gauche, au premier plan, un immeuble haussmannien : toit en zinc mouillé, cheminée qui fume et crache des étincelles, un chat dans une lucarne qui bouge la queue, une fenêtre à la bougie qui vacille, une télé qui clignote en bleu, un balcon en fer forgé, un café avec un store rayé rouge et un néon « CAFÉ » qui grésille de temps en temps.
- À droite, un réverbère parisien avec un halo chaud, qui vacille parfois.
- Tout en bas, une balustrade en fer forgé avec des jardinières.

EFFETS
- De la pluie sur 3 profondeurs. Les gouttes deviennent orange quand elles passent dans une lumière, et elles éclaboussent sur les rebords, le store et la balustrade.
- DES BILLETS QUI TOMBENT DU CIEL : des billets de 100 €, 50 € et 20 €, sur plusieurs profondeurs. Ils virevoltent comme des feuilles (ils se balancent, pivotent, se retournent et brillent quand ils font face).
- De la fumée qui dérive avec le vent, des étincelles, des lumières qui vacillent, et 2 éclairs discrets dans les nuages par boucle.

TECHNIQUE (important)
- Le rendu interne est en 480×270, agrandi ×4 sans lissage (plus proche voisin), pour obtenir un 1920×1080 parfaitement net en plein écran.
- La boucle est PARFAITE et dure 4 minutes : chaque animation est une fonction du temps modulo 240 s (fréquences entières, particules déterministes), donc aucun saut au moment où ça reboucle.
- Touche R : enregistre exactement une boucle en 1920×1080, 60 fps, et télécharge le fichier vidéo (mp4 si possible, sinon webm).
- Touche S : capture PNG en 1080p. Touche F ou double-clic : plein écran. Le curseur se cache quand on ne bouge pas la souris.
- Optimise pour tenir 60 fps : sprites pré-rendus, halos en cache, et un canvas avec l'option willReadFrequently.
```

The prompt and video belong to @minosdevs; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)
