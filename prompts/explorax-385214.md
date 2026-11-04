# Interactive Lamborghini FL3 tractor diesel engine

**#169 by likes** · ♥ 466 · by [@exploraX_](https://x.com/exploraX_) · [Original post](https://x.com/exploraX_/status/2112130961714385214) · [Watch the video](https://video.twimg.com/amplify_video/2112127113201405952/vid/avc1/1152x720/v8V6mVZ2yNifc3Xs.mp4?tag=29)

[![Interactive Lamborghini FL3 tractor diesel engine](https://pbs.twimg.com/amplify_video_thumb/2112127113201405952/img/9e0XK93jf4BspAYl.jpg)](https://x.com/exploraX_/status/2112130961714385214)

## Prompt

```text
Build an interactive 3D web page: a live "bench study" of the **Lamborghini FL3**, the air-cooled three-cylinder diesel that powered the Lamborghini 2R tractor (1961 to 1967), from the years before Lamborghini built cars. Visitors should be able to start the engine, rev it, load it, cut it open, watch the cooling air, and take it apart. The page should feel like a beautifully printed technical plate that happens to be alive.

## Hard rules

- **Everything procedural.** No 3D models, no Blender, no textures, no image files, no audio files. Geometry, materials, drawings and sound are all generated in code.
- **three.js (WebGL)**, vendored locally, ES modules with an importmap, no build step. It must run from a plain static server.
- **60 fps** on a recent laptop at 1440x900 and on a retina display.
- **Desktop:** the whole sheet fits a 1440x900 viewport with no scrolling.
- **Phone width:** the sheet becomes a vertical scroll with nothing cut off. On touch, horizontal drags turn the engine and vertical swipes scroll the page.
- **No em dashes** anywhere in the copy.

## The engine: facts

Only these figures are published. Use them exactly:

- 3 cylinders, inline, air-cooled, direct-injection diesel, Lamborghini type FL3
- bore 92 mm, stroke 110 mm, 2,193 cc
- 39 hp (29.1 kW) at 2,200 rpm
- electric starter, Bosch injection
- about 2,000 2Rs sold between 1961 and 1967
- factory colours: orange and light blue ("celeste")

The external layout, from photographs of a restored 1962 2R:

- the engine block painted celeste
- an axial cooling blower in a round housing at the front, belt-driven from the crank, with a wire guard
- a sheet-metal air cowl along the cold side
- individual finned cylinder barrels and finned heads, held down by long studs
- a silver inline injection pump on the hot side, with three copper high-pressure lines up to the injectors
- twin fuel filters
- a black vertical exhaust stack with a silencer and a flapper rain cap
- an oil-bath air cleaner
- a dynamo, a starter motor, and a flywheel with a ring gear

Everything else is an assumption and must be labelled **modelled** on the page:

- compression ratio (about 17:1), rod length, valve timing
- idle (about 700 rpm) and high idle (about 2,350 rpm)
- torque curve, friction, airflow, temperatures, fuel use

Never dimension an assumed size in the drawings.

## Art direction: a 1960s Italian two-ink print

It must not look like a Victorian parchment plate or a generic blueprint. Think of a page from an Italian factory manual or a mid-century industrial catalogue, printed in the tractor's own two inks.

- **Paper:** ivory offset stock (about #EEE9DC) with fine paper grain and soft, uneven ink absorption.
- **Inks:** arancio (#E0561C), celeste (#58AED6 for the print, a deeper #3F9DD0 for the painted engine) and near-black (#1C1B19).
- **Type:**
- Bodoni Moda for display: a huge "FL3" with the 3 in arancio, and an italic "Lamborghini" above it.
- Archivo for labels (wide, letter-spaced small caps).
- IBM Plex Mono for numbers.
- Every label carries its Italian term in small italic Bodoni (for example: Hand throttle *acceleratore*).
- **Print details:**
- registration marks in the four corners and a colour bar in the margin
- a thin double frame and a running head across the top: "Bench study · *banco prova*", "Air-cooled diesel · three cylinders · direct injection", "Sheet 03"
- a giant celeste numeral "3" printed faintly behind the engine, slightly out of register
- **Layout at 1440x900:**
- left column: title, deck, lede and the controls
- centre: the 3D engine
- right column: four live instruments
- bottom strip: four live drawings and a readings card

Copy:
- Kicker: "Lamborghini Trattori · 1961–1967"
- Deck: "Three cylinders. No radiator."
- Lede: "Before the supercars, Lamborghini built tractors. The 2R of 1961 carried this engine: 2,193 cc of direct-injection diesel and no radiator, cooled by a belt-driven blower and cast fins. About 2,000 were sold by 1967, and tractor money paid for the move into cars in 1963."

## The 3D model

Build the FL3 to its real proportions: 92 mm bore, 110 mm stroke, cylinders about 150 mm apart, crank axis as the origin.

Exterior parts:

- crankcase with main-bearing ribs and mounting feet, oil sump, timing case, flywheel plate
- three separate finned barrels, with the fins flattened where neighbours meet
- three finned heads with rocker covers and long studs
- blower with a spinning rotor, stator vanes and a guard
- V-belt around the crank, dynamo and blower pulleys
- air cowl with a stencilled "FL3 · raffreddato ad aria"
- intake runners into the oil-bath air cleaner with a glass pre-cleaner bowl
- exhaust manifold, silencer and a flapper cap that lifts on each exhaust pulse at idle
- injection pump with a governor housing whose throttle lever follows the hand throttle
- copper injector lines and a leak-off line, injectors, twin fuel filters
- starter motor whose pinion slides into the ring gear while cranking
- a small name plate reading "MOTORE DIESEL · FL3 · CV 39 · 2200 g/min" (no company logo anywhere)

Moving internals:

- crankshaft with counterweights, pins 120 degrees apart, turning clockwise seen from the blower end
- connecting rods, pistons with rings and a combustion bowl
- camshaft at half speed with lobes timed to the valve events
- tappets, pushrods, rockers, valves and springs that compress, all driven by the same valve-lift curves the simulation uses

Materials and setting:

- **Materials:** glossy celeste enamel with subtle procedural grain, rougher on castings than on sheet metal. Steel, alloy, copper and heat-darkened exhaust.
- **Stand:** the engine sits on an **arancio test stand**.
- **Lighting and floor:** a soft cast shadow and a contact shadow lands on the paper itself (a transparent canvas over the page).
- **Life at rest:** the engine rocks slightly on its mounts against the gas torque.

## The simulation

Write it as a pure, testable module.

- **Kinematics:**
- exact slider-crank piston motion and rod angle
- four-stroke cycle over 720 degrees, firing order 1-2-3, one firing every 240 degrees
- **In-cylinder pressure:**
- polytropic compression and expansion with a double-Wiebe heat release (fast premixed burn plus a slower diffusion burn), tabulated by fuel level
- calibrate the heat release so that full fuel at 2,200 rpm gives exactly 29.1 kW at the flywheel
- peak pressure lands around 70 to 75 bar at full load
- **Crank dynamics:**
- integrate with sub-steps of about 2 degrees of crank, so the instantaneous gas torque gives real speed ripple at idle and real compression pulses while cranking
- flywheel inertia about 0.8 kg·m²
- **Governor and load:**
- an all-speed mechanical governor with about 120 rpm of droop and a little fuel-rack lag
- the hand throttle sets the governed speed between idle and high idle
- the PTO brake applies a load that rises with the square of speed, so 100% load at 2,200 rpm needs exactly full fuel
- **Starting:**
- the starter cranks at about 250 rpm
- the charge needs a few compressions before it lights, the first cycles misfire and burn rich, and that black smoke leaves the stack
- the engine catches in about 1 second and the starter disengages
- **Stopping:**
- friction rises with speed, plus blower drag rising with the square of speed
- an unfired cylinder gives back less than it took to compress (heat lost to the fins), so the engine stops about 2 seconds after the fuel is cut at idle
- **Temperatures:**
- head temperatures come from about a quarter of the fuel's heat going into the metal, removed by blower air that rises with engine speed
- full load settles around 160 to 175 °C
- run thermal time 30 times faster than real time and say so

The simulation emits events with timestamps: crank, fire, misfire, exhaust valve opening, caught, stop, stalled. Events raised between steps (the key) must not be lost.

## Interaction

- **Ignition key:** a round bakelite-and-steel switch. Click (or Space) to start and stop. It shows Start, Cranking or Stop.
- **Two levers:** the hand throttle shows the governed rpm, and the PTO brake shows a percentage. Style them as notched quadrants with orange lever knobs.
- **Four views** (keys 1 to 4), each with a smooth scripted camera move:
- **Painted.**
- **Cutaway:**
- a section plane through the cylinder axes, with cut faces printed as a light arancio hatch
- parts lying wholly in the removed half (pump, filters, exhaust, starter, pushrods, cam) disappear
- pistons, rods and crank stay whole
- a combustion glow fills each chamber as it fires
- **Airflow:**
- everything except the barrels and heads fades to a paper-grey ghost
- barrels and heads show a temperature ramp from deep celeste to arancio
- particles are drawn in through the blower guard, run along the cowl, cross the fins and leave warm on the pump side
- particles are drawn through the metal like the flow arrows of a technical illustration
- **Exploded:**
- waits until the engine has stopped, then separates the parts along sensible axes and holds the crank still
- each part gets a callout: English name in small caps, Italian term in italic, and a leader line to an orange dot
- labels sit on a paper backing and never overlap
- **Other controls:**
- Slow motion (S) eases time to 1/25
- a Sound toggle
- Reset view
- drag to orbit, scroll to zoom
- **Narration line:** a single italic line in the console that reacts to what is happening. Examples:
- "Key turned. The starter pinion meshes with the flywheel and spins the engine at about 250 rpm."
- "Squeezed about 17 to 1, the air gets hot enough to light the diesel. No spark plugs."
- "It caught."
- "Idling near 700 rpm: three power strokes every two turns, one every 240 degrees."
- "The hand throttle sets the governor, which opens the rack until the engine holds that speed."
- "Full PTO load at 2,200 rpm: the rack is wide open and the FL3 makes its rated 39 hp."
- "No water anywhere. The blower pushes air down the cowl, across the fins, and out warm on the pump side."
- "Fuel cut. It runs down and rocks back on its last compression."
- Each view also gets a line of its own.

## Live instruments (Canvas 2D, ink on paper)

1. **Tachometer:** a period Italian dial, 0 to 25 x100 rpm, with an arancio arc above rated speed and an hour meter whose tenths drum rolls.
2. **The cycle:** a 720-degree wheel with three rings (one per cylinder, offset 240 degrees). Power is arancio, exhaust grey, intake celeste, compression hatched. A pointer follows the crank and a dot flashes at each firing.
3. **Indicator diagram:** the live P-V loop for cylinder 1, with the full-load loop dashed for reference, a dot at the current state and the peak pressure labelled.
4. **Chart recorder:** scrolling chart paper with an rpm pen in black and a power pen in arancio.

Below the drawings, a **readings card**:

- live values: speed, power, torque, fuel (l/h), cooling air (m³/min) and head temperature
- marked "live, modelled"
- a footnote listing what is published and stating that the page is an independent study, not affiliated with Lamborghini

Power and torque are measured at the flywheel, so they never overshoot the rated 39 hp during transients.

## Live drawings: blueline prints of the running engine

Front, Right side, Plan and **Section A-A** are real orthographic renders of the same running model, not illustrations. Ink them in a shader like 1960s diazo prints:

- render normals and depth, then draw blue outlines from silhouette, crease and depth edges
- shade with a celeste 45-degree screentone
- print an arancio hatch wherever the section plane cuts metal
- the diazo paper and its faint grid are printed by the shader itself
- add centre lines and numbered cylinders
- Section A-A cuts through cylinder 1 so you see the piston moving. It dimensions only the published bore (Ø 92) and stroke (110), with TDC and BDC lines marked PMS and PMI.

## Sound (Web Audio, synthesised)

- **Exhaust:** each pop is scheduled from the simulation's own exhaust-valve events at the correct sub-frame time. It is not a looped sample.
- **Layers:**
- diesel knock at each injection
- blower roar and a blade-pass tone tracking speed
- valve-gear whirr
- a starter whine that strains on each compression
- a solenoid clunk on start and stop
- the flapper cap ticking at idle
- a soft metallic cue when the engine comes apart and a seating clunk when it goes back together
- **Slow motion** spaces the pops out and deepens them.
- **Mix:** run everything through a compressor. It must never clip.
- **Autoplay:** audio starts on the first user gesture.

## Deliverables

- the page: `index.html`, `css/`, `js/`, with three.js vendored in `vendor/`
- a tiny no-cache static server (`https://serve.py/`)
- a README that separates published facts from modelled ones
- a headless Node check of the simulation that asserts:
- 29.1 kW at 2,200 rpm
- peak pressure 60 to 85 bar
- catches within 3 s
- idles between 650 and 750 rpm
- full load holds about 2,200 rpm and 39 hp
- heads pass 120 °C under load
- it stops after the fuel is cut
- optional: a frame-exact video capture script (virtual time at 60 fps, a drawn cursor with click rings, the sound rendered offline from the simulation's event log so it stays in sync)

## Done means

1. The sheet loads with no console errors and holds 60 fps.
2. Turning the key cranks, catches with a dark puff and settles near 700 rpm.
3. Full throttle plus full PTO load reads about 2,200 rpm and 39 hp, and the P-V loop peaks around 73 bar.
4. Every view works, including Section A-A cutting through the moving piston.
5. The exploded view waits for the engine to stop, and its labels are all readable.
6. Every figure that is not published is labelled as modelled.
7. At 1440x900 nothing overflows, and at phone width nothing is cut off.
```

The prompt and video belong to @exploraX_; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)
