# Minecraft-style emotional storytelling Shorts workflow prompt

**#695 by popularity** · ♥ 125 · 9,450 views · by [@fuckscales](https://x.com/fuckscales) · [Original post](https://x.com/fuckscales/status/2120542368827097253) · [Watch the video](https://video.twimg.com/amplify_video/2120542065096597504/vid/avc1/1080x1920/wc3EdvObIQLkSZqx.mp4)

[![Minecraft-style emotional storytelling Shorts workflow prompt](https://pbs.twimg.com/amplify_video_thumb/2120542065096597504/img/QdxDI2fNmnkdeMPF.jpg)](https://x.com/fuckscales/status/2120542368827097253)

## Prompt

```text
<role> You are my AI animation director, Minecraft-style 3D animator, character designer, scriptwriter, voice director, and production engineer.
Your task is to create high-quality Minecraft-style emotional storytelling Shorts that closely match the visual format, pacing, character animation, editing, and production techniques of my attached reference:

"Nobody Helped Mikey Until JJ…"

Use Claude Code, Three.js, Blender Python when available, HTML Canvas, SVG, FFmpeg, and available voice tools.

The goal is to create a REUSABLE animation system that makes original Minecraft-inspired storytelling videos.

IMPORTANT:
This is NOT a normal Minecraft gameplay video.

It combines:
Animated cartoon streamer avatars in the TOP section.

A fully animated Minecraft-style 3D story in the BOTTOM section.
Word-synchronized dialogue captions.
Multiple distinct character voices.
Emotional storytelling with dramatic reactions.
Recreate this production approach as closely as possible without reusing copyrighted footage, third-party artwork, or the reference's exact story.
</role>
<reference_analysis>
FIRST, analyze the attached reference MP4.

Video specifications:
Resolution: 1080×1920
Aspect ratio: 9:16
Frame rate: 30 FPS
Duration: approximately 80.7 seconds

Use FFmpeg and OpenCV to extract frames every 1–2 seconds and around major scene changes.
Create a reference contact sheet.

Study:

Split-screen proportions
Character design
Avatar animation
Minecraft environment details

Camera movements

Dialogue timing

Scene changes
Character reactions
Subtitle positioning
Color-coded captions
Lighting
Minecraft textures
Emotional storytelling
Sound effects
Editing rhythm
Analyze the actual footage rather than guessing.
Create a detailed style specification containing measurements, color values, timing patterns, and shot descriptions.
Do not begin animation until the reference has been analyzed.
</reference_analysis>
<layout> THIS IS THE MOST IMPORTANT PART.
Recreate the reference's split-screen composition.
CANVAS:
1080×1920, vertical.
TOP SECTION:
Approximately 30–33% of the video height.

BOTTOM SECTION:
Approximately 67–70% of the video height.

TOP:
A cartoon streamer avatar reacting and speaking.

BOTTOM:
A cinematic Minecraft-style 3D story.
Keep the two sections synchronized throughout the video.

The top avatar changes according to which commentator is speaking.
The Minecraft scene continues underneath the commentary.

Use a colored rectangular border around the top panel.

The border color identifies the active speaker.
Do not randomly change the layout.

Keep the split-screen composition consistent from beginning to end.
</layout>
<streamer_avatars>
Create THREE original cartoon commentary avatars inspired by the reference's visual design principles.

AVATAR 1 — GREEN CHARACTER
A cute, rounded, turtle-like cartoon character.

Design:
Soft green body

Large expressive eyes
Small cartoon mouth

Black gaming headphones

Gaming chair

Cozy gaming bedroom

Desk visible in foreground

Soft daylight coming through a window

Use a bright lime-green border.

Personality:
Kind, emotional, curious, easily surprised.
AVATAR 2 — RED CHARACTER

A cute red, long-eared cartoon creature.
Design:

Rounded head

Large expressive eyes

Long floppy ears
Red hoodie
Black gaming headphones
Streaming microphone
Cozy blue bedroom background
Use a bright red border.
Personality:
Energetic, confident, dramatic, expressive.
AVATAR 3 — BLOCKY COMMENTATOR
A Minecraft-inspired blocky human character.

Design:

Square head
Block-shaped nose

Large expressive eyes

Teal gaming headphones

Streaming microphone
Warm wooden gaming room
Bookshelves and decorations
Use a distinctive warm-colored border.
Personality:
Funny, skeptical, occasionally frustrated.
All three must have ORIGINAL character designs and consistent appearances.
Generate reusable character sheets and animation-ready layers.
FACIAL ANIMATION:

Blinking

Smiling
Sad expressions

Shocked expressions

Angry reactions

Mouth movement
Eye direction changes
Eyebrow movement
Small head tilts
Subtle body movement
Use layered 2D character rigs.
Separate:
Head

Eyes

Eyelids
Eyebrows

Mouth

Ears

Arms

Body
Create mouth shapes for basic lip synchronization.
Animate the active speaker.
Silent commentators should not appear as if they are speaking.
Keep the background, chair, headphones, and character proportions identical across every appearance.
</streamer_avatars>
<minecraft_world>
Create a fully animated, Minecraft-inspired voxel world.
The visuals should resemble cinematic Minecraft roleplay rather than normal first-person gameplay.
STYLE:
Cubic character models
Pixelated textures

Blocky terrain

Square trees
Minecraft-style houses
Wooden interiors
Cobblestone streets
Food stalls
Shops
Villagers
Blocky furniture
Colorful environmental details

Use 16×16 or 32×32 pixel textures with nearest-neighbor filtering.

Keep the recognizable block-based aesthetic.

Do not use smooth realistic human models.

Avoid unnecessary realistic reflections or textures.
Create reusable 3D environments.

ENVIRONMENT 1 — CITY MARKET
Include:

Cobblestone plaza

Market stalls
Food carts
Shop signs
Trees
Benches
Buildings
NPC villagers
Decorative umbrellas
Street furniture
ENVIRONMENT 2 — FOOD SHOP
Include:
Wooden flooring
Food display counters

Checkout counter

Shelves

Fridges

Villager shopkeeper

Tables

Decorative plants

ENVIRONMENT 3 — OUTDOOR STREET
Include:
Grass blocks
Roads
Village buildings
Trees
Streetlights
Parked vehicles when appropriate
Create additional locations according to the story.
Environments should remain consistent between different shots.
Do not generate a new unrelated background every time the camera cuts.
</minecraft_world>

<story_characters>
Build reusable 3D voxel characters.

MAIN PROTAGONIST:
A small, sympathetic blocky character with a distinctive green appearance.
Give the protagonist expressive head movement and readable body language.
SUPPORTING CHARACTER:
A taller character wearing a distinctive hoodie, dark trousers, and colorful shoes.
This character can play the role of a friend or person who helps the protagonist.
ADDITIONAL CHARACTERS:
Villagers
Shopkeepers

Bystanders

Friends
Bullies or antagonists where relevant
Background NPCs
Use consistent proportions.
CHARACTER RIGGING:
Separate:
Head
Torso
Left arm
Right arm
Left leg
Right leg
Held objects
Animate with hierarchical transforms.

MOVEMENTS:

Walking

Running
Turning

Looking around
Head lowering

Head shaking

Nodding

Giving objects

Holding food

Sitting

Jumping

Hugging

Celebrating
Sad reactions
Surprised reactions
Make sure limbs rotate around appropriate joints.
Avoid foot sliding.
Use actual 3D character animation, not moving screenshots.
</story_characters>

<story_structure>
Ask me for a story idea or suggest five original Minecraft emotional storytelling concepts.

Focus on stories involving:

Kindness
Friendship
Betrayal
Helping strangers
Poor vs rich
Unexpected rewards
Bullying and redemption
Emotional reunions

Surprising generosity

Default duration: 75–85 seconds.
Follow this structure:
0–8s — EMOTIONAL HOOK
Introduce a character experiencing a problem.
Show the problem immediately.
Use dialogue from the commentators to establish curiosity.
8–20s — THE STRUGGLE
Show the main character asking for help or attempting to solve the problem.
Other characters may ignore or reject them.
Use expressive body language.
20–35s — THE CONFLICT
Introduce a shopkeeper, obstacle, or character who makes the situation worse.
Increase the emotional stakes.
35–48s — SOMEONE HELPS
A second character notices the problem and makes a decision.
Show kindness through visible actions.

48–60s — THE TURNING POINT

The main character receives help.

Show an emotional reaction.
Use a small moment of relief before the next reveal.

60–72s — UNEXPECTED TWIST
Reveal a surprising reward, secret, gift, reunion, or consequence.

The twist should be connected to the earlier story.

72–85s — EMOTIONAL ENDING
Deliver a satisfying payoff.
Use a memorable interaction, emotional dialogue, or visual callback.
Finish with a scene that encourages viewers to watch again.
Do not copy the reference's exact sequence of food, shopkeepers, and luxury-car rewards unless I specifically request those elements.
Create original stories using the same storytelling format.
</story_structure>
<dialogue> This format relies heavily on conversation.
Write short, natural dialogue.
Use multiple speakers.

Each commentator should have a recognizable personality.

The story characters can also speak when appropriate.

Avoid long explanations.

Every line should accomplish at least one of these:

Reveal information

Express emotion

Ask a question

Create tension

Introduce a surprise

React to an event

Example dialogue format:

GREEN: "Why is nobody helping him?"

RED: "Wait, is that his friend?"

BLOCKY: "No way he's actually doing that!"

These are examples of tone, not lines to copy.

Use quick exchanges between speakers.

Write dialogue that sounds like natural reactions to a Minecraft story.

Show the COMPLETE script before creating assets.
</dialogue>

<captions> Match the reference's subtitle presentation.

CAPTION POSITION:
Near the boundary between the cartoon commentary panel and the Minecraft scene.

CAPTION STYLE:

Bold sans-serif

All uppercase

Thick black outline

High contrast

One to three words at a time

Center aligned

SPEAKER COLORS:

Green speaker:
Bright lime/yellow-green.
Red speaker:
Bright red.

Third speaker:
Use a consistent contrasting color.
Only show captions for spoken dialogue.

Synchronize them with actual narration timestamps.

Use word-level alignment.

Animate important words with subtle scale pops.

Avoid giant paragraph captions.

Do not place captions across important faces or story actions.

Make sure the captions stay readable on mobile.
</captions>

<camera> Create cinematic third-person Minecraft camera movements.
USE:
Wide establishing shots
Medium character shots
Over-the-shoulder angles
Character close-ups

Slow push-ins

Side tracking

Character-following movement

Reaction shots

Low-angle views

Occasional overhead views

Use the camera to highlight emotions.

When a character is rejected, use a closer shot.
When a helper approaches, reveal the second character clearly.

When a gift or reward appears, use a wider reveal.
Maintain spatial consistency.

The camera should never randomly teleport to an unrelated location.
No gameplay HUD, crosshair, inventory bar, or mouse cursor unless the story specifically requires it.

The Minecraft footage should feel like a staged animated film.
</camera>
<animation> Every important action must be animated.
Character animation:
Walk cycles
Arm swings
Head turns
Reactions

Object interactions

Body rotations
Running

Giving and receiving objects
Environmental animation:

Walking NPCs
Moving props

Opening doors

Ambient movement

Subtle particles

Animated shop interactions

Use easing for camera movement.

Keep voxel-character movement appropriately blocky and slightly stylized.

Do not use overly fluid realistic human motion.
Animate objects passing between characters with correct positioning.

If a character holds a burger, present, or tool, attach it to their hand using the character rig.
Use proper local transforms so held objects follow the hand naturally.

Characters must react to the environment and to each other.

Never allow them to stand motionless through an entire important exchange.
</animation>
<audio> Ask me which voice service I want:
ElevenLabs
Kokoro
Another available service
Generate distinct, original voices for the commentators.
Keep speech clear and expressive.
Voice characteristics:
Green:
Soft, emotional, curious.
Red:
Energetic, quick, expressive.

Third:
Lower-pitched, conversational, skeptical.

Generate dialogue as separate clips or tracks.

Use faster-whisper or another alignment tool to obtain accurate word timestamps.

Synchronize:

Mouth animation

Avatar expressions

Captions

Minecraft character reactions
Camera cuts

Sound effects
Add:

Minecraft-inspired footsteps
UI clicks when appropriate
Shop ambience
Item pickup sounds
Soft emotional music
Surprise accents
Positive payoff sounds
Use original or properly licensed audio.
Avoid overpowering dialogue with music.

Keep sound design consistent between scenes.
</audio>
<production> Use Claude Code to build the complete project.
```

The prompt and video belong to @fuckscales; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)
