# Cozy Café Fluid Studio: interactive coffee and milk simulation

**#280 by popularity** · ♥ 227 · by [@genevieve__h](https://x.com/genevieve__h) · [Original post](https://x.com/genevieve__h/status/2112646847454147003) · [Watch the video](https://video.twimg.com/amplify_video/2112644885362696192/vid/avc1/1280x720/mVPZYKgyM52x7lZq.mp4)

[![Cozy Café Fluid Studio: interactive coffee and milk simulation](https://pbs.twimg.com/amplify_video_thumb/2112644885362696192/img/UxyeSdBl3kCFln2A.jpg)](https://x.com/genevieve__h/status/2112646847454147003)

## Prompt

```text
# Role & Objective
Act as a Principal Graphics Engineer and Creative Technologist specializing in Three.js, WebGL2/WebGPU, 3D Volumetric Fluid Dynamics, and GLSL Raymarching. 

Build a browser-based, photorealistic, interactive 3D coffee & milk physics sandbox ("Cozy Café Fluid Studio") designed to look like a viral macro-lens video on X. The user can orbit the camera freely (from 90° top-down to a 0° macro side-profile view), swap custom 3D glass vessels and ice cube shapes (with procedural fallbacks and a `.glb`/`.gltf` loader for Blender assets), and pour either Espresso or Heavy Cream directly from their cursor in any order.

---

# 1. Core Visual & Physics Architecture (True 3D Volumetric Fluid)
Because the camera can view the glass from the side, top, or any oblique angle, implement a **3D Eulerian Grid Fluid Solver** (e.g., `64x96x64` or `96x128x96` tiled 2D texture atlas or WebGL2 `sampler3D` / WebGPU 3D Storage Textures) confined to the bounding volume of the active glass mesh:

1. **Two-Fluid Miscible Density & Filling System:**
   - Track two separate scalar volume fields inside the glass: $\rho_{\text{coffee}}$ (dark absorbing fluid) and $\rho_{\text{milk}}$ (bright scattering fluid), plus a dynamic **Liquid Fill Height (
$h
_{\text{fill}}$)** that rises smoothly as the user pours either liquid into the glass.
   - Allow pouring in **any order**:
     - *Coffee first, then Milk:* Pouring espresso fills the glass with dark amber-black liquid and generates a thin golden crema foam layer on the top meniscus ($y \approx h_{\text{fill}}$). Pouring cold milk next shoots a dense white plume downward that billows back up via buoyancy.
     - *Milk first, then Coffee (Dirty Latte / Macchiato style):* Pouring cold milk fills the glass with opaque ivory liquid. Pouring hot espresso on top creates dark mahogany plumes that sink through the dense milk and stratify into layered gradients around the ice.

2. **Rayleigh-Taylor & Kelvin-Helmholtz Instabilities:**
   - Implement **MacCormack (or BFECC) Advection** so thin caramel ribbons do not smear out due to numerical dissipation.
   - Inject **Baroclinic Vorticity** ($\nabla \rho \times \nabla P$) and **Vorticity Confinement** ($\epsilon (\mathbf{N} \times \boldsymbol{\omega})$) along the interface between milk and coffee so sinking/rising plumes roll up into hyper-detailed mushroom caps and curling tendrils.

3. **3D Volumetric Raymarching Shader (Beer-Lambert + Multiple Scattering Approximation):**
   - Render the fluid volume inside the glass by raymarching through the 3D density texture (`sampler3D`).
   - **Optical Physics:** Do NOT use simple RGB `mix()`. Compute physically based **Beer-Lambert Law extinction** ($\sigma_a(\lambda) = \text{vec3}(1.6, 5.4, 13.5)$ for espresso so thin edges glow ruby/caramel-amber while thick regions are pitch black) combined with **isotropic + forward Henyey-Greenstein phase function scattering** for the milk fat globules (high albedo ivory-white).
   - Add a **Dual-Lobe Subsurface Scattering (SSS)** look by sampling a lower-MIP (blurred) level of the milk density volume for ambient internal light transport, creating a soft, milky amber glow where coffee and cream meet.

---

# 2. Custom Blender Assets (Glasses & Ice) + Procedural SDF Dual-Representation
Support loading custom Blender `.glb` meshes via `GLTFLoader` while providing built-in procedural geometries (and matching Signed Distance Fields) so the app runs out-of-the-box:

1. **Glass Shapes (Vessel Selector):**
   - **Fluted Café Glass:** Ribbed vertical ridges that distort and refract the swirling fluid inside.
   - **Double-Walled Borosilicate Mug:** Suspended inner rounded chamber showing floating liquid in mid-air.
   - **Stemless Wine / Tulip Glass:** Curved tapered bowl that forces sinking milk plumes inward toward the center.
   - **Classic Rocks Tumbler:** Heavy thick crystal base with sharp vertical walls.
   - *Rendering:* Use Three.js `MeshPhysicalMaterial` with `transmission: 0.98`, `ior: 1.52`, `thickness`, dispersion/chromatic aberration, and crisp studio softbox environment reflections.
   - *Physics Boundary:* Enforce a strict no-slip/no-penetration boundary condition against the inner wall SDF of the selected glass so fluid hugs the exact contour of the vessel.

2. **Ice Cube Shapes (Ice Selector):**
   - **Large Craft Sphere:** A single giant crystal-clear sphere in the center that splits the pour stream into a ring vortex.
   - **Beveled Bistro Cubes (x3):** Stacked at angles inside the glass, creating narrow channels for cream tendrils to snake through.
   - **Hollow Cylinder / Bullet Ice:** Allows fluid to pour through the center hole and billow out the bottom.
   - **Crushed / Pebble Ice:** A porous top cluster that diffuses the pour into dozens of tiny trickling caramel fingers.
   - *Rendering & Physics:* Render ice with `ior: 1.31`, internal frost fracture planes, and real-time refraction of the raymarched fluid behind it. Stamp the ice SDFs into the 3D fluid solver's obstacle buffer so plumes physically collide with, wrap around, and slide underneath the ice cubes. Include buoyant bobbing when liquid height rises.

---

# 3. Interactive Pouring & Camera Controls
1. **Cursor-Driven Pour Stream:**
   - Raycast the mouse cursor onto a horizontal plane above the glass rim.
   - **Left-Click & Hold:** Pour a visible, glossy 3D parabolic liquid stream (rendered as a dynamic tube mesh or raymarched metaball stream) from the cursor into the glass.
   - **Mouse Speed & Scroll Wheel:** Moving the mouse whips the stream across the surface; scrolling adjusts **Pour Height / Velocity** (a high pour punches deep to the bottom of the glass with high turbulence; a low pour gently floats layers on the surface).
2. **Seamless Orbit Camera (`OrbitControls`):**
   - Right-click drag (or two-finger drag) smoothly orbits from **Macro Side View** (watching plumes dive down the glass wall) to **Top-Down Latte Art View** (watching crema swirl around the ice).
   - Include quick camera preset buttons: `[Side Profile]`, `[45° Café Angle]`, and `[Top-Down Macro]`.

---

# 4. Minimalist Cozy UI & Atmosphere
- **Environment:** A warm, sunlit wooden tabletop with soft morning window blinds casting subtle gobos/caustics, warm beige/linen background tones, and a shallow depth-of-field (`BokehPass`) on the background.
- **Minimalist Floating Dock (Bottom Center, frosted glass `backdrop-filter: blur(12px)`, rounded pill buttons, warm serif/sans typography):**
  - **Liquid Toggle:** `[ ☕ Pour Espresso ]` | `[ 🥛 Pour Heavy Cream ]`
  - **Vessel Picker:** `[ Fluted ]` `[ Rocks ]` `[ Tulip ]` `[ Double-Wall ]` `[ + Load .GLB ]`
  - **Ice Picker:** `[ Sphere ]` `[ Bistro Cubes ]` `[ Crushed ]` `[ None ]`
  - **Simulation Controls:** `Pour Speed` slider, `Time Scale` slider (`0.1x Slow-Mo` to `1.0x`), `[ Stir with Glass Straw ]` tool, and `[ Empty Glass ]` reset button.

---

# Deliverable Instructions
Provide a complete, runnable HTML/JS/GLSL implementation (or clean modular Vite + Three.js setup) with zero missing placeholders. Prioritize the 3D raymarched Beer-Lambert coffee/milk shader, the 3D fluid advection/vorticity compute passes, and the refractive glass/ice boundary coupling so it runs at 60fps.
```

The prompt and video belong to @genevieve__h; this page links back to their post.

[← Back to the list](../README.md) · [Watch it on the site](https://framevoid1312.github.io/motion-shelf/)
