"""FV object library — real 3D renders for the AE projects (Blender 5 / Cycles, headless).
Usage: python objects.py <out_dir> <res> <samples> [ID,ID,...]
Look: satin plastic, saturated facing-ratio gradient (centre -> edge colour),
acid-green + magenta rim lights, soft key, Standard view transform (no filmic desaturation)."""
import bpy, math, sys, os
from mathutils import Vector, Euler, Matrix
try:  # Blender 5 FBX importer trips on lights; the light is unused
    from io_scene_fbx import import_fbx as _fbx
    _ol = _fbx.blen_read_light
    def _sl(*a, **k):
        try: return _ol(*a, **k)
        except AttributeError: return bpy.data.lights.new("fbx_light", "POINT")
    _fbx.blen_read_light = _sl
except Exception: pass

OUT = sys.argv[1] if len(sys.argv) > 1 else "/tmp/obj"
RES = int(sys.argv[2]) if len(sys.argv) > 2 else 512
SPP = int(sys.argv[3]) if len(sys.argv) > 3 else 32
ONLY = sys.argv[4].split(",") if len(sys.argv) > 4 else None
os.makedirs(OUT, exist_ok=True)

def hexc(h, a=1.0):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c] + [a]  # sRGB -> linear

# ---------------------------------------------------------------- scene
LIGHTS = {}
WARM = {"coral", "pink", "petal"}

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = SPP
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.use_denoising = True
    try: sc.cycles.denoiser = "OPENIMAGEDENOISE"
    except Exception: pass
    sc.cycles.max_bounces = 6
    sc.render.resolution_x = sc.render.resolution_y = RES
    sc.render.film_transparent = True
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_mode = "RGBA"
    sc.render.image_settings.color_depth = "8"
    sc.view_settings.view_transform = "Standard"
    sc.view_settings.look = "None"
    sc.view_settings.exposure = 0.0
    w = bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True
    bg = w.node_tree.nodes["Background"]; bg.inputs[0].default_value = hexc("#140A40"); bg.inputs[1].default_value = 0.05
    cam_data = bpy.data.cameras.new("cam"); cam_data.lens = 85
    cam = bpy.data.objects.new("cam", cam_data); sc.collection.objects.link(cam); sc.camera = cam
    cam.location = (0, -9.5, 0); cam.rotation_euler = (math.radians(90), 0, 0)
    def area(name, loc, color, power, size, target=(0, 0, 0)):
        L = bpy.data.lights.new(name, "AREA"); L.color = hexc(color)[:3]; L.energy = power; L.size = size
        o = bpy.data.objects.new(name, L); o.location = loc; sc.collection.objects.link(o)
        d = Vector(target) - Vector(loc); o.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()
        LIGHTS[name] = o
    area("key", (-2.5, -3.5, 7), "#E4F0FF", 2100, 2.6)      # pale mint-white key from high upper left: bright soft highlight
    area("rimLav", (6, 2.5, 3), "#B9A2FF", 1700, 2.5)        # lavender edge, upper right
    area("rimMint", (-6, 3, 2), "#3DFFC0", 900, 2.5)         # mint rim, upper left back
    area("acid", (-2.5, 3.5, -6), "#22FF6E", 2400, 2.2)      # acid-green glint grazing the lower back edge (cool objects only)
    area("warmRim", (-6, 3, 2), "#FF8AD8", 900, 2.5)         # pink rim for warm objects instead of mint
    # no fill: lower halves fall to deep navy/black like the reference
    return sc

# ---------------------------------------------------------------- materials
def satin(name, centre, edge, rough=0.62, coat=0.0, emit=None, mid=None, glow=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; n = nt.nodes; l = nt.links
    bsdf = n["Principled BSDF"]
    lw = n.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.5
    ramp = n.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.0; ramp.color_ramp.elements[0].color = hexc(centre)
    ramp.color_ramp.elements[1].position = 0.9; ramp.color_ramp.elements[1].color = hexc(edge)
    if mid:
        e = ramp.color_ramp.elements.new(0.5); e.color = hexc(mid)
    l.new(lw.outputs["Facing"], ramp.inputs["Fac"])
    l.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = rough
    for k, v in (("Coat Weight", coat), ("Coat Roughness", 0.12), ("Specular IOR Level", 0.18)):
        if k in bsdf.inputs: bsdf.inputs[k].default_value = v
    if glow:  # self-lit airbrush fill: the gradient itself glows a little (flat illustration feel)
        l.new(ramp.outputs["Color"], bsdf.inputs["Emission Color"]); bsdf.inputs["Emission Strength"].default_value = glow
    if emit:
        bsdf.inputs["Emission Color"].default_value = hexc(emit); bsdf.inputs["Emission Strength"].default_value = 1.4
    return m

def link_lights(sc):
    # light linking: acid green only touches cool-coloured objects, pink only warm ones
    cool = bpy.data.collections.new("cool"); warm = bpy.data.collections.new("warm")
    sc.collection.children.link(cool); sc.collection.children.link(warm)
    for o in sc.objects:
        if o.type not in ("MESH", "CURVE", "META") or not o.data.materials: continue
        key = o.data.materials[0].name
        (warm if key in WARM else cool).objects.link(o)
    # an empty receiver collection means "light everything" -> keep a tiny off-camera placeholder in each
    for coll in (cool, warm):
        me = bpy.data.meshes.new("ph"); me.from_pydata([(0, 0, 0), (0.001, 0, 0), (0, 0.001, 0)], [], [(0, 1, 2)])
        ph = bpy.data.objects.new("placeholder", me); ph.location = (0, 60, -60); coll.objects.link(ph)
    LIGHTS["acid"].light_linking.receiver_collection = cool
    LIGHTS["rimMint"].light_linking.receiver_collection = cool
    LIGHTS["warmRim"].light_linking.receiver_collection = warm

MAT = {}
def radial_mat(name, stops, emit=0.9):
    """flat petal fill: object-space radial gradient (centre -> tip), self-lit like the reference flower"""
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; n = nt.nodes; l = nt.links; bsdf = n["Principled BSDF"]
    tc = n.new("ShaderNodeTexCoord"); gr = n.new("ShaderNodeTexGradient"); gr.gradient_type = "SPHERICAL"
    mp = n.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (0.9, 0.9, 0.9)
    l.new(tc.outputs["Object"], mp.inputs["Vector"]); l.new(mp.outputs["Vector"], gr.inputs["Vector"])
    inv = n.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0
    l.new(gr.outputs["Fac"], inv.inputs[1])
    ramp = n.new("ShaderNodeValToRGB"); el = ramp.color_ramp.elements
    el[0].position, el[0].color = stops[0][0], hexc(stops[0][1]); el[1].position, el[1].color = stops[-1][0], hexc(stops[-1][1])
    for pos, col in stops[1:-1]:
        e = el.new(pos); e.color = hexc(col)
    l.new(inv.outputs[0], ramp.inputs["Fac"])
    l.new(ramp.outputs["Color"], bsdf.inputs["Base Color"]); l.new(ramp.outputs["Color"], bsdf.inputs["Emission Color"])
    bsdf.inputs["Emission Strength"].default_value = emit; bsdf.inputs["Roughness"].default_value = 0.9
    bsdf.inputs["Specular IOR Level"].default_value = 0.1
    return m

def ring_mat(name):
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; n = nt.nodes; l = nt.links; bsdf = n["Principled BSDF"]
    tc = n.new("ShaderNodeTexCoord"); gr = n.new("ShaderNodeTexGradient"); gr.gradient_type = "RADIAL"
    l.new(tc.outputs["Object"], gr.inputs["Vector"])
    ramp = n.new("ShaderNodeValToRGB"); el = ramp.color_ramp.elements
    el[0].position, el[0].color = 0.0, hexc("#3A2B8A"); el[1].position, el[1].color = 1.0, hexc("#2CFF8A")
    for pos, col in ((0.45, "#7A6BFF"), (0.78, "#2B33FF"), (0.9, "#1F6BFF")):
        e = el.new(pos); e.color = hexc(col)
    l.new(gr.outputs["Fac"], ramp.inputs["Fac"]); l.new(ramp.outputs["Color"], bsdf.inputs["Base Color"])
    l.new(ramp.outputs["Color"], bsdf.inputs["Emission Color"]); bsdf.inputs["Emission Strength"].default_value = 0.25
    bsdf.inputs["Roughness"].default_value = 0.6; bsdf.inputs["Specular IOR Level"].default_value = 0.15
    return m

def mats():
    MAT["blue"] = satin("blue", "#2A33F5", "#141A9A", mid="#222CE0", glow=0.0)
    MAT["violet"] = satin("violet", "#6E46FF", "#3A2BD8", mid="#5A3BF5", glow=0.0)
    MAT["coral"] = satin("coral", "#FF5A4E", "#7A1A6E", mid="#FF4A6A", glow=0.0)
    MAT["pink"] = satin("pink", "#FF5AB8", "#5A2BD0", mid="#D84AE0", glow=0.0)
    MAT["mint"] = satin("mint", "#2CF5A0", "#2B3BFF", mid="#2AD8C8", glow=0.0)
    MAT["aqua"] = satin("aqua", "#3A6BFF", "#1F2BD8", mid="#3A55FF", glow=0.0)
    MAT["acid"] = satin("acid", "#39FF7A", "#16C65A", rough=0.5, emit="#20FF6A")
    MAT["lav"] = satin("lav", "#D8A8FF", "#8A6BFF", glow=0.0)
    MAT["ink"] = satin("ink", "#120A3A", "#1A1060", rough=0.6)
    MAT["white"] = satin("white", "#FFFFFF", "#DDE3FF", rough=0.3)
    MAT["duck"] = satin("duck", "#5A4BFF", "#24229A", mid="#4A46F5", glow=0.0)
    MAT["cream"] = satin("cream", "#D8A8FF", "#9A7BFF", glow=0.0)
    MAT["ring"] = ring_mat("ring")
    MAT["catFace"] = satin("catFace", "#8FF0FF", "#3A9BFF", mid="#6FD8FF")     # light cyan muzzle (reference cat)
    MAT["glass"] = satin("glass", "#1A1440", "#5A3BFF", rough=0.15)
    MAT["petal"] = radial_mat("petal", [(0.0, "#05030F"), (0.18, "#3A1A8A"), (0.42, "#8A3BE8"), (0.7, "#FF4FA8"), (1.0, "#FF6A4A")])

# ---------------------------------------------------------------- geometry helpers
def link(o):
    bpy.context.scene.collection.objects.link(o); return o
def smooth(o, sub=2):
    for p in o.data.polygons: p.use_smooth = True
    if sub:
        m = o.modifiers.new("sub", "SUBSURF"); m.levels = sub; m.render_levels = sub
    return o
def mat(o, key):
    o.data.materials.clear(); o.data.materials.append(MAT[key]); return o
def sphere(r, loc=(0, 0, 0), scale=(1, 1, 1), key="blue"):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=r, location=loc)
    o = bpy.context.active_object; o.scale = scale; smooth(o, 1); return mat(o, key)
def torus(R, r, loc=(0, 0, 0), rot=(0, 0, 0), key="mint"):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=96, minor_segments=40, location=loc, rotation=rot)
    o = bpy.context.active_object; smooth(o, 1); return mat(o, key)
def rbox(size, bevel, loc=(0, 0, 0), rot=(0, 0, 0), key="blue"):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot)
    o = bpy.context.active_object; o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    b = o.modifiers.new("bev", "BEVEL"); b.width = bevel; b.segments = 10; b.limit_method = "NONE"
    smooth(o, 0); return mat(o, key)
def cyl(r, depth, loc, rot, key):
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=r, depth=depth, location=loc, rotation=rot)
    o = bpy.context.active_object; smooth(o, 0); return mat(o, key)
def meta(elems, key, res=0.025):
    mb = bpy.data.metaballs.new("mb"); mb.resolution = res; mb.render_resolution = res * 0.5; mb.threshold = 0.3
    for e in elems:
        el = mb.elements.new(); el.type = e.get("type", "BALL"); el.co = e["co"]; el.radius = e["r"]
        if "size" in e: el.size_x, el.size_y, el.size_z = e["size"]
        if "rot" in e: el.rotation = Euler(e["rot"]).to_quaternion()
        if "stiff" in e: el.stiffness = e["stiff"]
    o = link(bpy.data.objects.new("meta", mb)); o.data.materials.append(MAT[key])
    # convert to a mesh so light linking applies (metaball instances ignore receiver collections)
    for ob in bpy.context.view_layer.objects: ob.select_set(False)
    bpy.context.view_layer.objects.active = o; o.select_set(True)
    bpy.ops.object.convert(target="MESH")
    o = bpy.context.view_layer.objects.active; o.name = "blob"
    for p in o.data.polygons: p.use_smooth = True
    return o
def puffy_curve(pts2d, depth, bevel, key, handles="AUTO", loc=(0, 0, 0)):
    cu = bpy.data.curves.new("c", "CURVE"); cu.dimensions = "2D"; cu.fill_mode = "BOTH"
    cu.extrude = depth; cu.bevel_depth = bevel; cu.bevel_resolution = 10; cu.resolution_u = 24
    sp = cu.splines.new("BEZIER"); sp.bezier_points.add(len(pts2d) - 1); sp.use_cyclic_u = True
    for bp, p in zip(sp.bezier_points, pts2d):
        bp.co = (p[0], p[1], 0); bp.handle_left_type = bp.handle_right_type = p[2] if len(p) > 2 else handles
    o = link(bpy.data.objects.new("curve", cu)); o.location = loc
    o.rotation_euler = (math.radians(90), 0, 0)  # face the camera (curve XY -> world XZ)
    o.data.materials.append(MAT[key]); return o
def tube(pts3d, r, key):
    cu = bpy.data.curves.new("t", "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = r; cu.bevel_resolution = 8
    cu.use_fill_caps = True
    sp = cu.splines.new("POLY"); sp.points.add(len(pts3d) - 1)
    for p, q in zip(sp.points, pts3d): p.co = (q[0], q[1], q[2], 1)
    o = link(bpy.data.objects.new("tube", cu)); o.data.materials.append(MAT[key]); return o

# ---------------------------------------------------------------- the objects (camera looks along +Y; X right, Z up)
def ORB():
    sphere(1.0, key="blue")
def DONUT():
    # open progress ring: violet body + acid-green leading tip, gap top-right (reference)
    def arc(a0, a1, key):
        cu = bpy.data.curves.new("ring", "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = 0.3; cu.bevel_resolution = 10; cu.use_fill_caps = True
        sp = cu.splines.new("POLY"); N = 48; sp.points.add(N - 1)
        for i, p in enumerate(sp.points):
            t = math.radians(a0 + (a1 - a0) * i / (N - 1)); p.co = (math.cos(t) * 0.8, 0, math.sin(t) * 0.8, 1)
        o = link(bpy.data.objects.new("ring", cu)); o.data.materials.append(MAT[key]); return o
    arc(70, 360, "violet")
    arc(10, 72, "mint")
def DOME():
    for i, (dx, rz, k) in enumerate(((-0.42, 18, "coral"), (0.42, -18, "violet"))):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=0.8, location=(dx, 0, 0))
        o = bpy.context.active_object
        bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.mesh.bisect(plane_co=(dx, 0, 0), plane_no=(1 if i == 0 else -1, 0, 0), clear_inner=True, use_fill=True)
        bpy.ops.object.mode_set(mode="OBJECT")
        b = o.modifiers.new("bev", "BEVEL"); b.width = 0.06; b.segments = 6; b.limit_method = "ANGLE"
        smooth(o, 0); o.rotation_euler = (0, math.radians(rz), 0); mat(o, k)
def FLOWER():
    # four big vesica petals meeting at a dark centre (reference)
    for i in range(4):
        a = math.radians(45 + i * 90)
        leaf = [(0, 0.0, "VECTOR"), (0.42, 0.62), (0, 1.25, "VECTOR"), (-0.42, 0.62)]
        o = puffy_curve(leaf, 0.02, 0.05, "petal")
        o.rotation_euler = (math.radians(90), a, 0)
def CLOVER():
    meta([{"co": (math.cos(a) * 0.52, 0, math.sin(a) * 0.52), "r": 0.5} for a in [i * math.pi / 2 for i in range(4)]], "coral", res=0.02)
def SPARKLE():
    R, p = 1.15, 0.5
    pts = []
    for i in range(4):
        a = i * math.pi / 2; b = a + math.pi / 4
        pts.append((math.cos(a) * R, math.sin(a) * R, "VECTOR")); pts.append((math.cos(b) * p, math.sin(b) * p, "AUTO"))
    puffy_curve(pts, 0.08, 0.2, "violet")
def SHIELD():
    # rounded hexagonal shield (reference): wide shoulders, soft point
    pts = [(-0.3, 1.0), (0.45, 0.95), (0.95, 0.45), (0.85, -0.35), (0.25, -1.0), (-0.45, -0.85), (-0.95, -0.15), (-0.9, 0.55)]
    puffy_curve(pts, 0.16, 0.26, "blue")
    tube([(-0.4, -0.66, -0.02), (-0.1, -0.66, -0.32), (0.44, -0.66, 0.32)], 0.15, "acid")
def TILE():
    rbox((1.7, 0.6, 1.7), 0.28, rot=(0, math.radians(45), 0), key="blue")
    torus(0.48, 0.13, loc=(0, -0.36, 0), rot=(math.radians(90), 0, 0), key="mint")
    sphere(0.26, loc=(0, -0.38, 0), key="aqua")
def BONE():
    meta([{"co": (0, 0, 0.78), "r": 0.62}, {"co": (0, 0, -0.78), "r": 0.62},
          {"type": "CAPSULE", "co": (0, 0, 0), "r": 0.3, "size": (0.5, 1, 1), "rot": (0, math.radians(90), 0)}], "coral", res=0.02)
def MOLECULE():
    P = [(-0.6, 0, 0.35, 0.42), (0.65, 0, 0.6, 0.34), (0.35, 0, -0.65, 0.46), (-0.15, 0.2, -0.05, 0.22)]
    for (x, y, z, r) in P: sphere(r, loc=(x, y, z), key="violet")
    for a, b in ((0, 1), (0, 2), (1, 2), (0, 3)):
        tube([P[a][:3], P[b][:3]], 0.06, "violet")
def CHIP():
    rbox((1.35, 0.32, 1.35), 0.16, key="violet")
    rbox((0.62, 0.1, 0.62), 0.07, loc=(0, -0.2, 0), key="pink")
    for i in range(4):
        o = -0.45 + i * 0.3
        for (x, z, sx, sz) in ((o, 0.85, 0.12, 0.3), (o, -0.85, 0.12, 0.3), (0.85, o, 0.3, 0.12), (-0.85, o, 0.3, 0.12)):
            rbox((sx, 0.16, sz), 0.05, loc=(x, 0, z), key="violet")
def PILL():
    meta([{"type": "CAPSULE", "co": (0, 0, 0), "r": 0.48, "size": (0.75, 1, 1), "rot": (0, math.radians(-35), 0)}], "aqua", res=0.02)
def CHICK():
    # rubber duck, side-on: head nearly as big as the body (reference), flat lavender beak + wing
    meta([{"type": "ELLIPSOID", "co": (0.28, 0, -0.5), "r": 1.0, "size": (1.05, 0.85, 0.68)},
          {"co": (-0.28, 0, 0.42), "r": 0.98},
          {"type": "ELLIPSOID", "co": (0.88, 0, -0.14), "r": 0.42, "size": (0.5, 0.5, 0.8), "rot": (0, math.radians(-45), 0)}], "duck", res=0.02)
    # beak: short flattened wedge pushed into the head; wing: soft leaf lying on the flank; eye: dark recessed oval
    bk = sphere(0.5, loc=(-1.12, 0, 0.36), scale=(0.62, 0.42, 0.2), key="cream"); bk.rotation_euler = (0, math.radians(12), 0)
    wg = sphere(0.5, loc=(0.42, -0.66, -0.42), scale=(0.95, 0.22, 0.5), key="cream"); wg.rotation_euler = (math.radians(-8), math.radians(-14), math.radians(-18))
    sphere(0.11, loc=(-0.62, -0.78, 0.66), scale=(0.75, 0.25, 1.1), key="ink")

def PR():
    # pull-request glyph in 3D: two nodes on a stem + a curved arrow into a third node (coral -> pink)
    sphere(0.32, loc=(-0.55, 0, 0.85), key="coral"); sphere(0.32, loc=(-0.55, 0, -0.85), key="coral"); sphere(0.32, loc=(0.6, 0, -0.85), key="coral")
    tube([(-0.55, 0, 0.6), (-0.55, 0, -0.6)], 0.13, "coral")
    arc = [(0.6, 0, -0.6), (0.6, 0, 0.35)] + [(0.6 - 0.35 + 0.35 * math.cos(t), 0, 0.35 + 0.35 * math.sin(t)) for t in [i * math.pi / 2 / 6 for i in range(1, 7)]] + [(0.05, 0, 0.7)]
    tube(arc, 0.13, "pink")
    tube([(0.3, 0, 0.98), (0.02, 0, 0.7), (0.3, 0, 0.42)], 0.13, "pink")

def LINKS():
    # two rounded squares joined by a bent connector (reference)
    for (x, z) in ((-0.62, 0.55), (0.62, -0.55)):
        rbox((0.95, 0.35, 0.95), 0.2, loc=(x, 0, z), key="blue")
        rbox((0.48, 0.12, 0.48), 0.1, loc=(x, -0.2, z), key="mint")
    tube([(-0.62, 0.0, 0.05), (-0.62, 0.0, -0.55), (0.12, 0.0, -0.55)], 0.13, "blue")

# ---------------------------------------------------------------- supplied character models (Phil's GLB/FBX files)
MODELS = "/home/claude/aefx/blender/models/"
def ao_mat(name, base_key, tex):
    """copy of a satin material whose colour is multiplied by the model's SSS map (creases/occlusion detail)"""
    m = MAT[base_key].copy(); m.name = name
    nt = m.node_tree; n = nt.nodes; l = nt.links; bsdf = n["Principled BSDF"]
    ramp = next(x for x in n if x.type == "VALTORGB")
    im = n.new("ShaderNodeTexImage"); im.image = bpy.data.images.load(MODELS + tex)
    hsv = n.new("ShaderNodeSeparateColor"); hsv.mode = "HSV"; l.new(im.outputs["Color"], hsv.inputs["Color"])
    mr = n.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = 0.25; mr.inputs["From Max"].default_value = 0.85
    mr.inputs["To Min"].default_value = 0.35; mr.inputs["To Max"].default_value = 1.0
    l.new(hsv.outputs["Blue"], mr.inputs["Value"])  # V channel: brown crease lines -> darker
    mul = n.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"; mul.inputs["Factor"].default_value = 1.0
    l.new(ramp.outputs["Color"], mul.inputs["A"]); l.new(mr.outputs["Result"], mul.inputs["B"])
    l.new(mul.outputs["Result"], bsdf.inputs["Base Color"])
    MAT[name] = m
    return name

def load_model(fname, part_mats, size=2.1):
    before = set(bpy.data.objects)
    if fname.endswith(".fbx"): bpy.ops.import_scene.fbx(filepath=MODELS + fname)
    else: bpy.ops.import_scene.gltf(filepath=MODELS + fname)
    new = [o for o in bpy.data.objects if o not in before and o.type == "MESH"]
    for o in new:
        key = next((v for k, v in part_mats.items() if o.name.lower().startswith(k)), part_mats.get("*", "blue"))
        o.data.materials.clear(); o.data.materials.append(MAT[key])
        for p in o.data.polygons: p.use_smooth = True
    # normalise: centre at origin, largest dimension -> size
    for o in [o for o in bpy.data.objects if o not in before and o.parent is None]:
        o.parent = None
    bpy.context.view_layer.update()
    mins = Vector((1e9,) * 3); maxs = Vector((-1e9,) * 3)
    for o in new:
        for c in o.bound_box:
            w = o.matrix_world @ Vector(c); mins = Vector(map(min, mins, w)); maxs = Vector(map(max, maxs, w))
    ctr = (mins + maxs) / 2; k = size / max(maxs - mins)
    holder = bpy.data.objects.new("model", None); bpy.context.scene.collection.objects.link(holder)
    for o in [o for o in bpy.data.objects if o not in before and o.parent is None and o is not holder]:
        o.parent = holder
    holder.scale = (k, k, k); holder.location = -ctr * k
    bpy.context.view_layer.update()
    # flatten hierarchy so the render root can parent the meshes
    for o in new:
        mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
    return new

def CAT():
    load_model("cat.glb", {"head": ao_mat("catHead", "blue", "cat_head_sss.jpg"), "face": "catFace", "eyeball": "white", "eye": "ink", "nose": "ink"})
    turn(-62)   # 3/4 profile, face to the left (reference)
def turn(deg):
    for o in bpy.context.scene.objects:
        if o.type == "MESH": o.matrix_world = Matrix.Rotation(math.radians(deg), 4, "Z") @ o.matrix_world
def COPILOT():
    load_model("copilot.glb", {"head": ao_mat("cpHead", "violet", "copilot_head_sss.jpg"), "goggle": "violet", "glass": "glass", "face": "ink", "eyes": "lav"})
    turn(48)    # 3/4, face to the right (reference)
def DUCKM():
    load_model("duck.glb", {"body": ao_mat("duckBody", "duck", "duck_body_sss.jpg"), "beak": "acid", "eyeballs": "white", "eyes": "ink"})
    turn(-70)   # profile, beak to the left (reference)

OBJECTS = {"CAT": CAT, "COPILOT": COPILOT, "PR": PR, "LINKS": LINKS, "ORB": ORB, "DONUT": DONUT, "DOME": DOME, "FLOWER": FLOWER, "CLOVER": CLOVER, "SPARKLE": SPARKLE,
           "SHIELD": SHIELD, "TILE": TILE, "BONE": BONE, "MOLECULE": MOLECULE, "CHIP": CHIP, "PILL": PILL, "CHICK": DUCKM}
# three hero angles per object: (tilt X, turn Z, roll Y) applied to a parent empty
ANGLES = [(12, -28, 8), (-18, 32, -14), (28, 8, 22)]
if os.environ.get("ONE_ANGLE"): ANGLES = ANGLES[:1]

def fit_camera(sc):
    # frame the union bounding sphere with a margin
    deps = bpy.context.evaluated_depsgraph_get()
    mins = Vector((1e9,) * 3); maxs = Vector((-1e9,) * 3)
    for o in sc.objects:
        if o.type not in ("MESH", "CURVE", "META"): continue
        oe = o.evaluated_get(deps)
        for c in oe.bound_box:
            w = oe.matrix_world @ Vector(c); mins = Vector(map(min, mins, w)); maxs = Vector(map(max, maxs, w))
    ctr = (mins + maxs) / 2; rad = max((maxs - mins).x, (maxs - mins).z) / 2 * 1.35
    cam = sc.camera; fov = 2 * math.atan(18 / cam.data.lens)
    dist = rad / math.tan(fov / 2)
    cam.location = (ctr.x, ctr.y - dist - (maxs - mins).y / 2, ctr.z)

for oid, fn in OBJECTS.items():
    if ONLY and oid not in ONLY: continue
    for ai, (rx, rz, ry) in enumerate(ANGLES):
        sc = reset(); mats()
        fn()
        root = bpy.data.objects.new("root", None); sc.collection.objects.link(root)
        for o in list(sc.objects):
            if o.type in ("MESH", "CURVE", "META") and o.parent is None: o.parent = root
        root.rotation_euler = (math.radians(rx), math.radians(ry), math.radians(rz))
        bpy.context.view_layer.update()
        fit_camera(sc)
        link_lights(sc)
        sc.render.filepath = os.path.join(OUT, "%s_%d.png" % (oid, ai + 1))
        bpy.ops.render.render(write_still=True)
        print("RENDERED", oid, ai + 1, flush=True)
