"""Universe sting clone — 3D object plate (Blender / Cycles, emission matcap shading).
python sting_scene.py OUTDIR SCALE SPP FRAMES   e.g.  /tmp/plate 0.5 8 57   or  1,2,3   or  1-70
World units = 100 reference px at f57. Camera: orthographic, looks +Y (screen x = +X, screen up = +Z).
Zoom C(t) and per-object tracks g(t), a(t) come from tracks.json (measured from the reference)."""
import bpy, math, sys, os, json
from mathutils import Vector, Euler, Quaternion, Matrix

HERE = os.path.dirname(os.path.abspath(__file__))
OUT, SCALE, SPP, FR = sys.argv[1], float(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
if "-" in FR: a, b = FR.split("-"); FRAMES = list(range(int(a), int(b) + 1))
else: FRAMES = [int(x) for x in FR.split(",")]
os.makedirs(OUT, exist_ok=True)
T = json.load(open(os.path.join(HERE, "tracks.json")))
SPEC = json.load(open(os.path.join(HERE, os.environ.get("SPEC", "spec.json"))))

# reuse geometry helpers from the object library (everything before its render loop)
src = open("/home/claude/aefx/blender/objects.py").read().split("for oid, fn in OBJECTS.items():")[0]
_argv = sys.argv; sys.argv = ["x", "/tmp/_unused", "64", "1"]; exec(src); sys.argv = _argv
OUT, SCALE, SPP = _argv[1], float(_argv[2]), int(_argv[3])   # the library defines its own OUT/SPP

def lin(h):
    h = h.lstrip("#"); c = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return [x / 12.92 if x <= 0.04045 else ((x + 0.055) / 1.055) ** 2.4 for x in c] + [1.0]

# ---------------------------------------------------------------- matcap material
PALS = {  # measured at f57 (luminance quantiles + colour modes of each object in the reference): body, dark, rim, pale, spec
    #          alt / alt2 = airbrushed hue patches (large soft noise), blot = near-black patch
    "blue":   dict(body="#160DFE", dark="#100CB5", rim="#62ED9E", pale="#4C8CE0", spec="#C6F1EC"),
    "violet": dict(body="#6734FE", dark="#251583", rim="#51FC81", pale="#8858FE", spec="#B89CFF"),
    "shield": dict(body="#140DFE", dark="#100CB5", rim="#5EB4C9", pale="#C6F1EC", spec="#E8F8FF"),
    "coral":  dict(body="#FE5740", dark="#411C54", rim="#C64FAD", pale="#FFE6EC", spec="#FFF0F4",
                   alt="#F84D7B", alt2="#A249B7", blot="#200A30"),
    "green":  dict(body="#2CF07A", dark="#14A050", rim="#D8FFE8", pale="#B0FFD0", spec="#FFFFFF"),
    "ringp":  dict(body="#1E1BF5", dark="#0A0A50", rim="#13CE70", pale="#6F63E5", spec="#E8F0FF"),
    "glass":  dict(body="#1A40D0", dark="#04042A", rim="#24E46C", pale="#CFF4FF", spec="#FFFFFF"),
    "beak":   dict(body="#FFD0DC", dark="#C06090", rim="#FFFFFF", pale="#FFFFFF", spec="#FFFFFF"),
    "ink":    dict(body="#0A0830", dark="#04021A", rim="#140C50", pale="#140C50", spec="#3A3070"),
    "cyanpatch": dict(body="#0A69E0", dark="#0A58C8", rim="#0A69E0", pale="#2A80E8", spec="#2A80E8"),
}
MATS = {}
CAMX, CAMY, CAMZ = 1, 1, -1      # Cycles camera space looks down +Z: a normal facing the viewer is (0, 0, -1)
def matcap(name, p, rim_dir=(-0.55, -0.75, 0.2), key=(-0.35, 0.6, 0.72), spec_dir=(-0.3, 0.5, 0.82),
           rim_amt=1.0, spec_amt=0.45, pale_amt=0.35, shade_lo=-0.8, blot=None, core=0.75, shadow_noise=0.45, halo_amt=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; n = nt.nodes; L = nt.links
    for x in list(n): n.remove(x)
    out = n.new("ShaderNodeOutputMaterial"); em = n.new("ShaderNodeEmission"); L.new(em.outputs[0], out.inputs[0])
    geo = n.new("ShaderNodeNewGeometry")
    vt = n.new("ShaderNodeVectorTransform"); vt.vector_type = "NORMAL"; vt.convert_from = "WORLD"; vt.convert_to = "CAMERA"
    L.new(geo.outputs["Normal"], vt.inputs[0])
    def dot(vec):
        d = n.new("ShaderNodeVectorMath"); d.operation = "DOT_PRODUCT"
        L.new(vt.outputs[0], d.inputs[0]); v = Vector(vec).normalized(); d.inputs[1].default_value = (v.x * CAMX, v.y * CAMY, v.z * CAMZ); return d.outputs["Value"]
    def smooth(sock, a, b):
        r = n.new("ShaderNodeMapRange"); r.interpolation_type = "SMOOTHSTEP"
        L.new(sock, r.inputs["Value"]); r.inputs["From Min"].default_value = a; r.inputs["From Max"].default_value = b; return r.outputs["Result"]
    def math2(op, a, b):
        x = n.new("ShaderNodeMath"); x.operation = op
        for i, v in enumerate((a, b)):
            if isinstance(v, float): x.inputs[i].default_value = v
            else: L.new(v, x.inputs[i])
        return x.outputs[0]
    def mix(fac, a, b):
        x = n.new("ShaderNodeMix"); x.data_type = "RGBA"; x.clamp_result = True
        if isinstance(fac, float): x.inputs["Factor"].default_value = fac
        else: L.new(fac, x.inputs["Factor"])
        for slot, v in (("A", a), ("B", b)):
            if isinstance(v, (list, tuple)): x.inputs[slot].default_value = v
            else: L.new(v, x.inputs[slot])
        return x.outputs["Result"]
    facing = dot((0, 0, 1))
    edge = math2("POWER", math2("SUBTRACT", 1.0, smooth(facing, 0.0, 1.0)), 2.2)       # 0 centre -> 1 silhouette
    c = mix(smooth(dot(key), shade_lo, 0.45), lin(p["dark"]), lin(p["body"]))         # broad lit body, shadow side to dark
    if "alt" in p:      # airbrush: big soft patches of a second and third hue (measured modes), not hard spots
        for key2, scl, lo, amt, off in (("alt", 0.9, 0.45, 0.85, (3.1, 0.7, 1.9)), ("alt2", 1.1, 0.55, 0.75, (-2.3, 5.1, 0.4))):
            tcA = n.new("ShaderNodeTexCoord"); mp = n.new("ShaderNodeMapping"); mp.inputs["Location"].default_value = off
            L.new(tcA.outputs["Object"], mp.inputs["Vector"]); nzA = n.new("ShaderNodeTexNoise")
            nzA.inputs["Scale"].default_value = scl; nzA.inputs["Detail"].default_value = 0.0; L.new(mp.outputs["Vector"], nzA.inputs["Vector"])
            c = mix(math2("MULTIPLY", smooth(nzA.outputs["Fac"], lo, lo + 0.22), amt), c, lin(p[key2]))
    # deep airbrushed core shadow on the side away from the key (the reference goes to near-black navy/violet there)
    deep = tuple(v * 0.28 for v in lin(p["dark"])[:3]) + (1.0,)
    sh = Vector((-key[0], -key[1], 0.0)).normalized()            # core shadow: the screen-side opposite the key, into the body
    c = mix(math2("MULTIPLY", smooth(dot((sh.x, sh.y, 0.25)), -0.05, 0.75), core), c, deep)
    # large soft dark patches across the surface (airbrush), every object
    tcS = n.new("ShaderNodeTexCoord"); mpS = n.new("ShaderNodeMapping"); mpS.inputs["Location"].default_value = (7.3, -1.9, 2.6)
    L.new(tcS.outputs["Object"], mpS.inputs["Vector"]); nzS = n.new("ShaderNodeTexNoise"); nzS.inputs["Scale"].default_value = 0.8
    nzS.inputs["Detail"].default_value = 0.0; L.new(mpS.outputs["Vector"], nzS.inputs["Vector"])
    c = mix(math2("MULTIPLY", smooth(nzS.outputs["Fac"], 0.56, 0.78), shadow_noise), c, deep)
    if blot is None and "blot" in p: blot = (0.9, 0.56, 0.95)        # coral family: black-violet spots like the reference
    if blot:
        tc = n.new("ShaderNodeTexCoord"); nz = n.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = blot[0]
        nz.inputs["Detail"].default_value = 0.5; L.new(tc.outputs["Object"], nz.inputs["Vector"])
        c = mix(math2("MULTIPLY", smooth(nz.outputs["Fac"], blot[1], blot[1] + 0.2), blot[2]), c, lin(p["blot"]))
    c = mix(math2("MULTIPLY", math2("MULTIPLY", edge, smooth(dot((-0.4, 0.75, 0.3)), -0.2, 0.6)), pale_amt), c, lin(p["pale"]))
    c = mix(math2("MULTIPLY", math2("MULTIPLY", math2("POWER", edge, 0.35), smooth(dot(rim_dir), -0.1, 0.6)), rim_amt), c, lin(p["rim"]))   # broad rim
    c = mix(math2("MULTIPLY", smooth(dot(spec_dir), 0.72, 0.97), spec_amt), c, lin(p["spec"]))
    if halo_amt > 0: c = mix(math2("MULTIPLY", math2("POWER", edge, 1.4), halo_amt), c, lin(p.get("halo", p["pale"])))
    L.new(c, em.inputs["Color"]); em.inputs["Strength"].default_value = 1.0
    MATS[name] = m
    return m

def build_mats():
    for k, p in PALS.items(): matcap(k, p)
    matcap("coral_blot", PALS["coral"], blot=(2.2, 0.5, 1.0), rim_dir=(0.6, -0.7, 0.2))
    matcap("coralb_blot", PALS["coral"], blot=(1.3, 0.6, 0.95), rim_dir=(0.6, -0.7, 0.2))
    matcap("coral_soft", PALS["coral"], rim_dir=(0.6, -0.7, 0.2))
    # duck (reference f30-70): coral body, pink highlights upper-right, violet -> near-black shadow lower-left, pale edge
    matcap("duck_m", dict(body="#FE5744", dark="#8C34B0", rim="#FFC8DC", pale="#FFD9E3", spec="#FFE0EA", alt="#FE5A50", alt2="#FE4F71",
           halo="#FFD0E0"), key=(0.55, 0.55, 0.62), rim_dir=(-0.6, -0.65, 0.3), spec_dir=(0.55, 0.6, 0.58), spec_amt=0.12,
           pale_amt=0.0, shade_lo=0.1, core=1.0, shadow_noise=0.0, rim_amt=0.35, halo_amt=0.2)
    matcap("violet_greenTL", PALS["violet"], rim_dir=(-0.7, 0.6, 0.2))
    matcap("violet_greenB", PALS["violet"], rim_dir=(-0.35, -0.9, 0.2))
    matcap("violet_greenL", PALS["violet"], rim_dir=(-0.8, -0.5, 0.25))
    matcap("violet_greenR", PALS["violet"], rim_dir=(0.8, -0.3, 0.25))
    matcap("blue_greenR", PALS["blue"], rim_dir=(0.6, -0.7, 0.2))
    matcap("blue_greenTL", PALS["blue"], rim_dir=(-0.7, 0.6, 0.2))
    matcap("blue_greenB", PALS["blue"], rim_dir=(-0.1, -0.95, 0.2))
    matcap("blue_greenTR", PALS["ringp"], rim_dir=(0.55, 0.8, 0.2), pale_amt=0.15, spec_amt=0.1)
    matcap("shield_m", PALS["shield"], rim_dir=(-0.3, -0.9, 0.2), pale_amt=0.9)
    # refractive glass: real transmission (IOR 1.45) with dispersion, so the blue sphere and anything behind
    # bends through it with coloured fringes; a faint matcap tint keeps the white/green edge glow of the reference
    tint = matcap("glass_tint", dict(PALS["glass"], body="#0A1440", pale="#E8FFF4", rim="#2CF07A"), rim_dir=(-0.6, -0.6, 0.3), pale_amt=1.0, rim_amt=1.2)
    g = bpy.data.materials.new("glassT"); g.use_nodes = True; nt = g.node_tree
    bs = nt.nodes["Principled BSDF"]; out = nt.nodes["Material Output"]
    bs.inputs["Base Color"].default_value = (0.85, 0.95, 1.0, 1); bs.inputs["Transmission Weight"].default_value = 1.0
    bs.inputs["IOR"].default_value = 1.6; bs.inputs["Roughness"].default_value = 0.02
    try: bs.inputs["Dispersion"].default_value = 0.6
    except Exception: pass
    tint_nt = tint.node_tree; tem = next(x for x in tint_nt.nodes if x.type == "EMISSION")
    # copy the tint's emission colour network into this material via a node group-free trick: append the tint as a second shader
    grp = bpy.data.node_groups.new("glass_tint_grp", "ShaderNodeTree")
    mx = nt.nodes.new("ShaderNodeAddShader")
    em = nt.nodes.new("ShaderNodeEmission"); em.inputs["Strength"].default_value = 0.1
    fr = nt.nodes.new("ShaderNodeLayerWeight"); fr.inputs["Blend"].default_value = 0.35
    ramp = nt.nodes.new("ShaderNodeValToRGB"); e = ramp.color_ramp.elements
    e[0].position, e[0].color = 0.0, lin("#000000"); e[1].position, e[1].color = 1.0, lin("#E8FFF4")
    el = e.new(0.8); el.color = lin("#9CC8FF")
    nt.links.new(fr.outputs["Facing"], ramp.inputs["Fac"]); nt.links.new(ramp.outputs["Color"], em.inputs["Color"])
    nt.links.new(bs.outputs[0], mx.inputs[0]); nt.links.new(em.outputs[0], mx.inputs[1]); nt.links.new(mx.outputs[0], out.inputs[0])
    MATS["glassT"] = g
    # flat "airbrush" fill for the flower petals: violet centre -> pink tip (measured #542484 -> #E4549C)
    m = bpy.data.materials.new("petalflat"); m.use_nodes = True; nt = m.node_tree; n = nt.nodes; L = nt.links
    for x in list(n): n.remove(x)
    out = n.new("ShaderNodeOutputMaterial"); em = n.new("ShaderNodeEmission"); L.new(em.outputs[0], out.inputs[0])
    tc = n.new("ShaderNodeTexCoord")
    ln = n.new("ShaderNodeVectorMath"); ln.operation = "LENGTH"; L.new(tc.outputs["Object"], ln.inputs[0])
    rp = n.new("ShaderNodeValToRGB"); e = rp.color_ramp.elements
    e[0].position, e[0].color = 0.0, lin("#35185D"); e[1].position, e[1].color = 1.0, lin("#E56AAB")
    for pos, col in ((0.2, "#6E31A4"), (0.5, "#B144AE"), (0.8, "#D54A9C")):
        el = e.new(pos); el.color = lin(col)
    mr = n.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = 0.0; mr.inputs["From Max"].default_value = 1.25
    L.new(ln.outputs["Value"], mr.inputs["Value"]); L.new(mr.outputs["Result"], rp.inputs["Fac"]); L.new(rp.outputs["Color"], em.inputs["Color"])
    MATS["petalflat"] = m
    # measured on the reference petals (f57): axis  #210E3D (u .15) #4D2283 (.3) #963AA6 (.45) #D5489C (.6) #D84A96 (.75) #E84E76 (.9)
    #                                       edges #8D46E2 (.3) #A045D0 (.45) #C64AAE (.6) #CE68BE (.75)
    m = bpy.data.materials.new("petal_m"); m.use_nodes = True; nt = m.node_tree; n = nt.nodes; L = nt.links
    for x in list(n): n.remove(x)
    out = n.new("ShaderNodeOutputMaterial"); em = n.new("ShaderNodeEmission"); L.new(em.outputs[0], out.inputs[0])
    tc = n.new("ShaderNodeTexCoord"); sx = n.new("ShaderNodeSeparateXYZ"); L.new(tc.outputs["Object"], sx.inputs[0])
    def ramp(stops):
        r = n.new("ShaderNodeValToRGB"); e = r.color_ramp.elements
        e[0].position, e[0].color = stops[0][0], lin(stops[0][1]); e[1].position, e[1].color = stops[-1][0], lin(stops[-1][1])
        for pos, col in stops[1:-1]:
            el = e.new(pos); el.color = lin(col)
        L.new(sx.outputs["Y"], r.inputs["Fac"]); return r
    ax_r = ramp([(0.0, "#0E0420"), (0.15, "#210E3D"), (0.3, "#4D2283"), (0.45, "#963AA6"), (0.6, "#D5489C"), (0.75, "#D84A96"), (0.9, "#E84E76"), (1.0, "#F05A72")])
    ed_r = ramp([(0.0, "#1A0838"), (0.15, "#4A2290"), (0.3, "#8D46E2"), (0.45, "#A045D0"), (0.6, "#C64AAE"), (0.75, "#CE68BE"), (0.9, "#E07090"), (1.0, "#F07888")])
    # edge factor = |v| / half-width(u), half-width ~ 0.216 * sin(pi u)^0.75
    def M(op, a_, b_=None):
        x = n.new("ShaderNodeMath"); x.operation = op
        for i_, v_ in enumerate((a_, b_)):
            if v_ is None: continue
            if isinstance(v_, (int, float)): x.inputs[i_].default_value = v_
            else: L.new(v_, x.inputs[i_])
        return x.outputs[0]
    hw = M("ADD", M("MULTIPLY", M("POWER", M("SINE", M("MULTIPLY", sx.outputs["Y"], math.pi)), 0.75), 0.216), 0.01)
    ef = M("DIVIDE", M("ABSOLUTE", sx.outputs["X"]), hw)
    sm = n.new("ShaderNodeMapRange"); sm.interpolation_type = "SMOOTHSTEP"; L.new(ef, sm.inputs["Value"])
    sm.inputs["From Min"].default_value = 0.2; sm.inputs["From Max"].default_value = 0.95
    mx = n.new("ShaderNodeMix"); mx.data_type = "RGBA"; L.new(sm.outputs["Result"], mx.inputs["Factor"])
    L.new(ax_r.outputs["Color"], mx.inputs["A"]); L.new(ed_r.outputs["Color"], mx.inputs["B"]); L.new(mx.outputs["Result"], em.inputs["Color"])
    MATS["petal_m"] = m
    ring_grad_mat()
    grad_mat("shield_grad", (-0.75, 1.1, 0.0, "R"), [(0.0, "#140DFE"), (0.45, "#1C31F3"), (0.68, "#3469E3"), (0.86, "#5EB4C9"), (1.0, "#F0FCF8")], -1.6, -0.1, halo="#C6F1EC")
    matcap("torus_m", PALS["violet"], rim_dir=(-0.55, -0.8, 0.2), rim_amt=1.6, shade_lo=-0.2, pale_amt=0.25)
    matcap("dome_m2", dict(PALS["violet"], body="#2A12A0", dark="#05030F", rim="#22DE6C", pale="#7A3CF6"), key=(-0.6, 0.6, 0.5), rim_dir=(-0.75, -0.6, 0.2), rim_amt=1.6, shade_lo=0.0, pale_amt=0.9)
    matcap("mol_m", dict(PALS["violet"], body="#7037F2", dark="#24117C", rim="#73F2A6"), rim_dir=(-0.5, -0.8, 0.2), rim_amt=1.4, shade_lo=-0.2, pale_amt=0.2)
    matcap("copi_body", dict(PALS["blue"], body="#5A34FF", dark="#1520D8", rim="#1DDD70", pale="#673EFE"), rim_dir=(0.75, -0.4, 0.3), rim_amt=1.0)
    matcap("copi_gog", dict(PALS["violet"], body="#673EFE", dark="#1506E3"), rim_dir=(0.6, 0.5, 0.3), rim_amt=0.6)
    matcap("bone_m2", dict(PALS["coral"], body="#FE5740", alt="#F84D7B", alt2="#C64FAD", dark="#3A1650", blot="#140820",
           pale="#FFE6EC", halo="#FFD8E6"), blot=(0.5, 0.40, 1.0), rim_dir=(0.6, -0.7, 0.2), spec_dir=(-0.5, 0.45, 0.74),
           spec_amt=0.15, pale_amt=0.5, shade_lo=-0.4, core=0.7, shadow_noise=0.0, halo_amt=0.85)
    matcap("hair", dict(body="#8C8C50", dark="#8C8C50", rim="#8C8C50", pale="#8C8C50", spec="#8C8C50"), rim_amt=0.0, pale_amt=0.0, spec_amt=0.0)
    matcap("coral_D", PALS["coral"], rim_dir=(-0.6, -0.75, 0.2), spec_dir=(0.45, 0.45, 0.77), spec_amt=0.85, blot=(1.6, 0.62, 0.8))
    matcap("dome_m", PALS["violet"], rim_dir=(-0.75, -0.6, 0.2), key=(-0.5, 0.7, 0.5), shade_lo=-0.2)
    matcap("shield2", dict(PALS["shield"], pale="#C8F0F8"), rim_dir=(-0.3, -0.9, 0.2), pale_amt=1.0, key=(0.2, -0.6, 0.77))
    matcap("bone_m", dict(PALS["coral"], pale="#FFD0E0", spec="#FFF0F4"), blot=(1.1, 0.6, 0.95), rim_dir=(0.6, -0.7, 0.2),
           spec_dir=(-0.5, 0.45, 0.74), spec_amt=0.5, pale_amt=0.8)

def ring_grad_mat():
    # flat arc colour measured at f57: green end cap (-30 deg) -> blue top -> violet left -> fades to black at the bottom
    m = bpy.data.materials.new("ringgrad"); m.use_nodes = True; nt = m.node_tree; n = nt.nodes; L = nt.links
    for x in list(n): n.remove(x)
    out = n.new("ShaderNodeOutputMaterial"); em = n.new("ShaderNodeEmission"); L.new(em.outputs[0], out.inputs[0])
    tc = n.new("ShaderNodeTexCoord"); sx = n.new("ShaderNodeSeparateXYZ"); L.new(tc.outputs["Object"], sx.inputs[0])
    at = n.new("ShaderNodeMath"); at.operation = "ARCTAN2"; L.new(sx.outputs["Z"], at.inputs[0]); L.new(sx.outputs["X"], at.inputs[1])
    # angle in [-pi, pi]; unwrap so the arc runs -30 .. 265 deg continuously
    w = n.new("ShaderNodeMath"); w.operation = "WRAP"; L.new(at.outputs[0], w.inputs[0])
    w.inputs[1].default_value = math.radians(-60); w.inputs[2].default_value = math.radians(300)
    mr = n.new("ShaderNodeMapRange"); L.new(w.outputs[0], mr.inputs["Value"])
    mr.inputs["From Min"].default_value = math.radians(-35); mr.inputs["From Max"].default_value = math.radians(280)
    rp = n.new("ShaderNodeValToRGB"); e = rp.color_ramp.elements
    stops = [(0.0, "#1A2CE8"), (0.3, "#1C1CF4"), (0.5, "#2A2AF0"), (0.62, "#5A4EE6"), (0.74, "#6F63E5"), (0.86, "#4A3E9A"), (0.95, "#1E1838"), (1.0, "#08060F")]
    e[0].position, e[0].color = stops[0][0], lin(stops[0][1]); e[1].position, e[1].color = stops[-1][0], lin(stops[-1][1])
    for pos, col in stops[1:-1]:
        el = e.new(pos); el.color = lin(col)
    L.new(mr.outputs["Result"], rp.inputs["Fac"])
    # soft pale halo at the silhouette (2.5D look), same camera-normal convention as matcap
    geo = n.new("ShaderNodeNewGeometry")
    vt = n.new("ShaderNodeVectorTransform"); vt.vector_type = "NORMAL"; vt.convert_from = "WORLD"; vt.convert_to = "CAMERA"
    L.new(geo.outputs["Normal"], vt.inputs[0])
    d = n.new("ShaderNodeVectorMath"); d.operation = "DOT_PRODUCT"; L.new(vt.outputs[0], d.inputs[0]); d.inputs[1].default_value = (0, 0, CAMZ)
    sm = n.new("ShaderNodeMapRange"); sm.interpolation_type = "SMOOTHSTEP"; L.new(d.outputs["Value"], sm.inputs["Value"])
    sm.inputs["From Min"].default_value = 0.0; sm.inputs["From Max"].default_value = 0.8
    inv = n.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0; L.new(sm.outputs["Result"], inv.inputs[1])
    k = n.new("ShaderNodeMath"); k.operation = "MULTIPLY"; L.new(inv.outputs[0], k.inputs[0]); k.inputs[1].default_value = 0.25
    mx = n.new("ShaderNodeMix"); mx.data_type = "RGBA"; L.new(k.outputs[0], mx.inputs["Factor"])
    L.new(rp.outputs["Color"], mx.inputs["A"]); mx.inputs["B"].default_value = lin("#9C9CFF")
    # green highlight that stays at the TOP of the screen while the ring spins (reference f50-70): world-space direction
    # from the ring centre (camera looks down +Y, so world +Z = screen up)
    geo2 = n.new("ShaderNodeNewGeometry"); oi = n.new("ShaderNodeObjectInfo")
    dv = n.new("ShaderNodeVectorMath"); dv.operation = "SUBTRACT"; L.new(geo2.outputs["Position"], dv.inputs[0]); L.new(oi.outputs["Location"], dv.inputs[1])
    sp = n.new("ShaderNodeSeparateXYZ"); L.new(dv.outputs[0], sp.inputs[0])
    hyp = n.new("ShaderNodeMath"); hyp.operation = "ARCTAN2"; L.new(sp.outputs["Z"], hyp.inputs[0]); L.new(sp.outputs["X"], hyp.inputs[1])
    up = n.new("ShaderNodeMath"); up.operation = "SINE"; L.new(hyp.outputs[0], up.inputs[0])
    gm = n.new("ShaderNodeMapRange"); gm.interpolation_type = "SMOOTHSTEP"; L.new(up.outputs[0], gm.inputs["Value"])
    gm.inputs["From Min"].default_value = 0.35; gm.inputs["From Max"].default_value = 0.95; gm.inputs["To Max"].default_value = 0.9
    mg = n.new("ShaderNodeMix"); mg.data_type = "RGBA"; L.new(gm.outputs["Result"], mg.inputs["Factor"])
    L.new(mx.outputs["Result"], mg.inputs["A"]); mg.inputs["B"].default_value = lin("#2CE47C")
    L.new(mg.outputs["Result"], em.inputs["Color"]); MATS["ringgrad"] = m

def grad_mat(name, axis, stops, lo, hi, halo=None):
    # body colour from a linear ramp along an object-space direction (soft airbrush gradient) + pale silhouette halo
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; n = nt.nodes; L = nt.links
    for x in list(n): n.remove(x)
    out = n.new("ShaderNodeOutputMaterial"); em = n.new("ShaderNodeEmission"); L.new(em.outputs[0], out.inputs[0])
    tc = n.new("ShaderNodeTexCoord"); d = n.new("ShaderNodeVectorMath")
    if len(axis) == 4:      # radial: (cx, cy, cz, 'R') -> negative distance from a point (glow)
        sub = n.new("ShaderNodeVectorMath"); sub.operation = "DISTANCE"; L.new(tc.outputs["Object"], sub.inputs[0]); sub.inputs[1].default_value = axis[:3]
        d = n.new("ShaderNodeMath"); d.operation = "MULTIPLY"; L.new(sub.outputs["Value"], d.inputs[0]); d.inputs[1].default_value = -1.0
    else:
        d.operation = "DOT_PRODUCT"; L.new(tc.outputs["Object"], d.inputs[0]); d.inputs[1].default_value = axis
    mr = n.new("ShaderNodeMapRange"); L.new(d.outputs["Value"], mr.inputs["Value"]); mr.inputs["From Min"].default_value = lo; mr.inputs["From Max"].default_value = hi
    rp = n.new("ShaderNodeValToRGB"); e = rp.color_ramp.elements
    e[0].position, e[0].color = stops[0][0], lin(stops[0][1]); e[1].position, e[1].color = stops[-1][0], lin(stops[-1][1])
    for pos, col in stops[1:-1]:
        el = e.new(pos); el.color = lin(col)
    L.new(mr.outputs["Result"], rp.inputs["Fac"]); c = rp.outputs["Color"]
    if halo:
        geo = n.new("ShaderNodeNewGeometry"); vt = n.new("ShaderNodeVectorTransform"); vt.vector_type = "NORMAL"; vt.convert_from = "WORLD"; vt.convert_to = "CAMERA"
        L.new(geo.outputs["Normal"], vt.inputs[0]); dd = n.new("ShaderNodeVectorMath"); dd.operation = "DOT_PRODUCT"; L.new(vt.outputs[0], dd.inputs[0]); dd.inputs[1].default_value = (0, 0, CAMZ)
        sm = n.new("ShaderNodeMapRange"); sm.interpolation_type = "SMOOTHSTEP"; L.new(dd.outputs["Value"], sm.inputs["Value"]); sm.inputs["From Min"].default_value = 0.0; sm.inputs["From Max"].default_value = 0.9
        inv = n.new("ShaderNodeMath"); inv.operation = "SUBTRACT"; inv.inputs[0].default_value = 1.0; L.new(sm.outputs["Result"], inv.inputs[1])
        k = n.new("ShaderNodeMath"); k.operation = "MULTIPLY"; L.new(inv.outputs[0], k.inputs[0]); k.inputs[1].default_value = 0.55
        mx = n.new("ShaderNodeMix"); mx.data_type = "RGBA"; L.new(k.outputs[0], mx.inputs["Factor"]); L.new(c, mx.inputs["A"]); mx.inputs["B"].default_value = lin(halo); c = mx.outputs["Result"]
    L.new(c, em.inputs["Color"]); MATS[name] = m

def setmat(objs, key):
    for o in objs:
        if o.type in ("MESH", "CURVE", "META") and o.data is not None:
            o.data.materials.clear(); o.data.materials.append(MATS[key])

def new_objs(fn):
    before = set(bpy.data.objects); fn(); return [o for o in bpy.data.objects if o not in before]

# ---------------------------------------------------------------- scene objects (shapes from the reference)
def mk_sphere(r, loc=(0, 0, 0), sc=(1, 1, 1)):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=64, ring_count=32, radius=r, location=loc)
    o = bpy.context.active_object; o.scale = sc
    for p in o.data.polygons: p.use_smooth = True
    return o
def mk_half(r, loc=(0, 0, 0), keep=-1, axis=(0, 0, 1)):
    o = mk_sphere(r, loc)
    bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.mesh.bisect(plane_co=loc, plane_no=tuple(-keep * a for a in axis), clear_inner=True, use_fill=True)
    bpy.ops.object.mode_set(mode="OBJECT"); return o
def mk_torus(R, r, loc=(0, 0, 0)):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=r, major_segments=128, minor_segments=48, location=loc)
    o = bpy.context.active_object
    for p in o.data.polygons: p.use_smooth = True
    return o

def S_torus():   # measured: hole = 0.49 of outer width, ball = 0.32 of outer width
    t = mk_torus(0.9, 0.31); setmat([t], "torus_m")       # ring axis = Z (edge-on until pitched)
    b = mk_sphere(0.39); setmat([b], "mol_m")
def rounded_poly(P, rad, n=8):
    out = []
    for i in range(len(P)):
        a, b, c = Vector(P[i - 1]), Vector(P[i]), Vector(P[(i + 1) % len(P)])
        u, v = (a - b).normalized(), (c - b).normalized()
        r = min(rad, (a - b).length * 0.45, (c - b).length * 0.45)
        p0, p1 = b + u * r, b + v * r
        for k in range(n + 1):    # quadratic bezier fillet through the corner
            t = k / n; q = (1 - t) ** 2 * p0 + 2 * (1 - t) * t * b + t * t * p1
            out.append((q.x, q.y, "VECTOR"))
    return out
def S_ring():   # flat thick arc (2.5D), measured: R_in 110 px, R_out 237 px at f57 (size 202 -> 1 unit = 202 px)
    cu = bpy.data.curves.new("ring", "CURVE"); cu.dimensions = "3D"; cu.bevel_depth = 0.31; cu.bevel_resolution = 12; cu.use_fill_caps = True
    sp = cu.splines.new("POLY"); N = 96; sp.points.add(N - 1)
    for i, p in enumerate(sp.points):
        t = math.radians(-35 + 315 * i / (N - 1)); p.co = (math.cos(t) * 0.86, 0, math.sin(t) * 0.86, 1)
    o = link(bpy.data.objects.new("ring", cu)); o.data.materials.append(MATS["ringgrad"]); o.scale = (1, 0.25, 1)
    # round cap at the leading end (the reference end is a semicircle, not a square cut); mesh built in ring space so
    # the angular gradient continues across it
    import bmesh
    me = bpy.data.meshes.new("ring_cap"); bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=24, radius=0.31)
    t0 = math.radians(-35)
    for v in bm.verts: v.co = (v.co.x + math.cos(t0) * 0.86, v.co.y * 0.25, v.co.z + math.sin(t0) * 0.86)
    bm.to_mesh(me); bm.free(); cap = link(bpy.data.objects.new("ring_cap", me)); cap.data.materials.append(MATS["ringgrad"])
    for pl in cap.data.polygons: pl.use_smooth = True
def S_shield():   # outline traced from f57 (units = 205 px, centre of bbox)
    P = [(-0.70, 1.07), (0.27, 1.02), (0.98, 0.40), (0.60, -0.86), (-0.43, -1.08), (-0.88, -0.67), (-0.96, 0.42)]
    o = puffy_curve(rounded_poly(P, 0.16), 0.04, 0.09, "blue"); o.data.materials.clear(); o.data.materials.append(MATS["shield_grad"])
    tb = tube([(-0.42, -0.2, 0.24), (-0.28, -0.2, -0.05), (0.39, -0.2, 0.19)], 0.105, "blue"); tb.data.materials.clear(); tb.data.materials.append(MATS["green"])
    for q in ((-0.42, -0.2, 0.24), (0.39, -0.2, 0.19)): cap = mk_sphere(0.105, loc=q); setmat([cap], "green")
def mk_D(r, loc, ang):   # hemisphere, curved side toward -X, flat face normal +X; rotated in the XZ (screen) plane by ang
    h = mk_half(r, (0, 0, 0), keep=1, axis=(1, 0, 0)); h.location = loc; h.rotation_euler = (0, -math.radians(ang), 0); return h
def S_coral():    # two half-spheres seen side-on, flat edges toward upper-right (measured f57: R 89 / 97 px)
    a = mk_D(1.0, (0, 0, 0), 0); setmat([a], "coral_D")
    b = mk_D(1.08, (1.2, 0.3, -0.13), 0); setmat([b], "coral_D")
def S_halfdome():  # row of 4 half-spheres, shrinking, each tucked behind the previous flat edge (f57: big R 112 px)
    for i, (r, x) in enumerate(((1.0, 0.0), (0.68, 0.7), (0.5, 1.2), (0.32, 1.6))):
        h = mk_D(r, (x, 0.2 * i, 0), 0); setmat([h], "dome_m2")
def S_bone():     # hourglass lathe, measured f57: top lobe R100 @-175 px, bottom R121 @+150 px, neck 45 px wide (unit 100 px)
    import bmesh
    def smin(a, b, k):
        h = max(k - abs(a - b), 0) / k; return min(a, b) - h * h * k * 0.25
    def sdf(r, z):   # smooth union of the two lobes and a thin core rod -> concave hourglass neck (0.225 at k 0.8)
        return smin(smin(math.hypot(r, z - 1.75) - 1.2, math.hypot(r, z + 1.42) - 1.18, 0.62), math.hypot(r, z - min(1.75, max(-1.42, z))) - 0.09, 0.62)
    prof = []
    for i in range(301):
        z = 3.2 - i * 6.4 / 300
        if sdf(0, z) > 0: prof.append((0.0, z)); continue
        lo, hi = 0.0, 2.0
        for _ in range(40):
            m = (lo + hi) / 2
            if sdf(m, z) < 0: lo = m
            else: hi = m
        prof.append((lo, z))
    prof[0] = (0.0, prof[0][1]); prof[-1] = (0.0, prof[-1][1])
    me = bpy.data.meshes.new("bone"); bm = bmesh.new(); S = 96; rings = []
    for (r, z) in prof:
        rings.append([bm.verts.new((r * math.cos(2 * math.pi * j / S), r * math.sin(2 * math.pi * j / S), z)) for j in range(S)])
    for a, b in zip(rings[:-1], rings[1:]):
        for j in range(S): bm.faces.new((a[j], a[(j + 1) % S], b[(j + 1) % S], b[j]))
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5); bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
    o = link(bpy.data.objects.new("bone", me))
    for p in o.data.polygons: p.use_smooth = True
    o.rotation_euler = (0, math.radians(-4.4), 0); setmat([o], "bone_m2")
def S_tile():
    rbox((1.7, 0.42, 1.7), 0.06); o = bpy.context.active_object; setmat([o], "blue")
    t = mk_torus(0.62, 0.17, loc=(0.05, -0.3, -0.05)); t.rotation_euler = (math.radians(90), 0, 0); setmat([t], "blue_greenR")
    b = mk_sphere(0.47, loc=(-0.14, -0.5, 0.12)); setmat([b], "blue_greenTL")
def S_orbcube():
    s = mk_sphere(0.62); setmat([s], "blue_greenR")
    p = mk_sphere(0.26, loc=(-0.28, -0.4, 0.3)); setmat([p], "cyanpatch")
    rbox((1.0, 1.0, 1.0), 0.03, loc=(-0.12, -0.85, -0.42), rot=(math.radians(28), math.radians(32), math.radians(22)))
    c = bpy.context.active_object; setmat([c], "glassT")
def S_clover():   # four overlapping spheres on the diagonals
    for i in range(4):
        a = i * math.pi / 2 + math.pi / 4
        sp = mk_sphere(0.47, loc=(math.cos(a) * 0.58, -0.05 * i, math.sin(a) * 0.58)); setmat([sp], "coral_blot")
def S_orb():
    s = mk_sphere(0.8); setmat([s], "blue_greenR")
    q = 0.82; a = math.radians(-5); pts = []
    for (x, z) in ((-q, -q), (q, -q), (q, q), (-q, q), (-q, -q)):
        pts.append((x * math.cos(a) - z * math.sin(a), -0.9, x * math.sin(a) + z * math.cos(a)))
    tb = tube(pts, 0.011, "blue"); tb.data.materials.clear(); tb.data.materials.append(MATS["hair"])
def S_sparkle():
    R, p = 1.15, 0.36; pts = []
    for i in range(4):
        a = i * math.pi / 2; b = a + math.pi / 4
        pts.append((math.cos(a) * R, math.sin(a) * R, "VECTOR")); pts.append((math.cos(b) * p, math.sin(b) * p, "AUTO"))
    o = puffy_curve(pts, 0.06, 0.16, "violet"); o.data.materials.clear(); o.data.materials.append(MATS["violet_greenR"])
def S_flower():   # petal outline traced from the reference f57 (length 241 px = 1 unit), petals at 150/60.7/-28.9/-119.3 deg
    HW = [(0.0, 0.0), (0.05, 0.07), (0.1, 0.105), (0.2, 0.155), (0.3, 0.19), (0.4, 0.21), (0.5, 0.216), (0.6, 0.21),
          (0.7, 0.192), (0.8, 0.16), (0.9, 0.112), (0.95, 0.075), (0.985, 0.035), (1.0, 0.0)]
    import numpy as _np
    us = _np.linspace(0, 1, 60); hw = _np.interp(us, [h[0] for h in HW], [h[1] for h in HW])
    right = [(float(w), float(u), "VECTOR") for u, w in zip(us, hw)]
    left = [(-float(w), float(u), "VECTOR") for u, w in zip(us[::-1], hw[::-1])][1:-1]
    leaf = right + left
    for i, A in enumerate((150.0, 60.7, -28.9, -119.3)):
        o = puffy_curve(leaf, 0.0, 0.012, "pink"); o.data.materials.clear(); o.data.materials.append(MATS["petal_m"])
        o.rotation_euler = (math.radians(90), math.radians(90 - A), 0); o.location = (0, -0.002 * i, 0)
def S_molecule():   # measured at f57 (1 unit = 100 px, centre sphere at origin)
    P = [(0.0, 0, 0.0, 0.54), (-0.25, 0.1, 2.4, 0.54), (0.78, 0.15, 1.59, 0.635), (-1.09, 0.05, 1.39, 0.455)]
    for (x, y, z, r) in P:
        s = mk_sphere(r, loc=(x, y, z)); setmat([s], "mol_m")
    for q in P[1:]:
        tb = tube([P[0][:3], q[:3]], 0.018, "violet"); tb.data.materials.clear(); tb.data.materials.append(MATS["violet"])
def S_copilot():
    objs = new_objs(lambda: load_model("copilot.glb", {"*": "blue"}))
    for o in objs:
        nm = o.name.lower()
        key = "ink" if ("face" in nm or "glass" in nm) else ("copi_gog" if "goggle" in nm else "copi_body")
        setmat([o], key)
def S_duck():
    objs = new_objs(lambda: load_model("duck.glb", {"*": "coral"}))
    for o in objs:
        nm = o.name.lower()
        key = "beak" if "beak" in nm else ("ink" if "eye" in nm else "duck_m")
        setmat([o], key)

BUILD = {"torus": S_torus, "ring": S_ring, "tile": S_tile, "shield": S_shield, "coral_halves": S_coral, "bone": S_bone,
         "orbcube": S_orbcube, "clover": S_clover, "orb": S_orb, "sparkle": S_sparkle, "flower": S_flower,
         "molecule": S_molecule, "halfdome": S_halfdome, "copilot": S_copilot, "duck": S_duck}

# ---------------------------------------------------------------- scene
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"; sc.cycles.samples = SPP
sc.cycles.use_denoising = False; sc.cycles.max_bounces = 10; sc.cycles.transmission_bounces = 10; sc.cycles.glossy_bounces = 4; sc.cycles.diffuse_bounces = 0; sc.cycles.transparent_max_bounces = 8
sc.render.resolution_x = int(1920 * SCALE); sc.render.resolution_y = int(1080 * SCALE)
sc.render.film_transparent = True; sc.render.filter_size = 1.2
sc.render.image_settings.file_format = "PNG"; sc.render.image_settings.color_mode = "RGBA"
sc.view_settings.view_transform = "Standard"
w = bpy.data.worlds.new("W"); sc.world = w; w.use_nodes = True; w.node_tree.nodes["Background"].inputs[1].default_value = 0.0
camd = bpy.data.cameras.new("cam"); camd.type = "ORTHO"; camd.clip_start = 0.1; camd.clip_end = 400
cam = bpy.data.objects.new("cam", camd); sc.collection.objects.link(cam); sc.camera = cam
cam.location = (0, -100, 0); cam.rotation_euler = (math.radians(90), 0, 0)
MAT.clear(); mats()           # library materials (needed by helper calls), then ours
build_mats()
for k in list(MAT): pass

roots = {}
for name, spec in SPEC.items():
    objs = new_objs(BUILD[spec["shape"]])
    root = bpy.data.objects.new("root_" + name, None); sc.collection.objects.link(root)
    for o in objs:
        if o.parent is None: o.parent = root
    roots[name] = (root, spec)

def q_from(rot):   # rot = [rx, ry, rz] degrees in view space (X right, Y depth, Z up), applied X then Z then Y(in-plane)
    return Euler([math.radians(v) for v in rot], "XZY").to_quaternion()

def _pchip_slopes(xs, ys):
    # Fritsch-Carlson monotone cubic slopes: smooth through keys, no overshoot, no stop at every key
    n = len(xs); h = [xs[i + 1] - xs[i] for i in range(n - 1)]; d = [(ys[i + 1] - ys[i]) / h[i] for i in range(n - 1)]
    m = [0.0] * n
    if n == 2: return [d[0], d[0]]
    for i in range(1, n - 1):
        if d[i - 1] * d[i] <= 0: m[i] = 0.0
        else:
            w1, w2 = 2 * h[i] + h[i - 1], h[i] + 2 * h[i - 1]
            m[i] = (w1 + w2) / (w1 / d[i - 1] + w2 / d[i])
    m[0] = d[0]; m[-1] = d[-1]
    return m
def interp_keys(keys, f):
    ks = sorted(keys, key=lambda k: k[0])
    if f <= ks[0][0]: return list(ks[0][1])
    if f >= ks[-1][0]: return list(ks[-1][1])
    xs = [k[0] for k in ks]; out = []
    for c in range(len(ks[0][1])):
        ys = [k[1][c] for k in ks]; m = _pchip_slopes(xs, ys)
        i = max(j for j in range(len(xs) - 1) if xs[j] <= f)
        h = xs[i + 1] - xs[i]; t = (f - xs[i]) / h
        h00, h10, h01, h11 = 2*t**3 - 3*t**2 + 1, t**3 - 2*t**2 + t, -2*t**3 + 3*t**2, t**3 - t**2
        out.append(h00 * ys[i] + h10 * h * m[i] + h01 * ys[i + 1] + h11 * h * m[i + 1])
    return out

T2 = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "tracks2.json")))
MODEL_AT = {}
def place(f):
    C = T["C"][f]
    camd.ortho_scale = 19.2 / C
    for name, (root, spec) in roots.items():
        trk = T["obj"].get(spec.get("track", name))
        t2 = T2.get(spec.get("track", name))
        g = t2["gpos"][f] if t2 else (trk["g"][f] if trk else 1.0)
        gs = t2["gsize"][f] if t2 else g
        a = math.radians(trk["a"][f]) if trk else 0.0
        gk = interp_keys(spec.get("gkeys", [[0, [1.0]]]), f)[0]; g *= gk; gs *= gk
        x, y = spec["c"][0] - 960, spec["c"][1] - 540
        xr, yr = x * math.cos(a) - y * math.sin(a), x * math.sin(a) + y * math.cos(a)
        off = interp_keys(spec.get("pkeys", [[0, [0, 0]]]), f)
        lx, lz = (xr * g + off[0]) / 100, -(yr * g + off[1]) / 100
        if "abs" in spec:   # measured screen-space centre track (px), linear between keys; model + held offset after the last key
            K = spec["abs"]; Cf = T["C"][f]
            def absw(k):
                X, Y = interp_keys([[q[0], q[1]] for q in K], k)
                return (X - 960) / (100 * T["C"][k]), -(Y - 540) / (100 * T["C"][k])
            fl = K[-1][0]
            if f <= fl: lx, lz = absw(f)
            else:
                ax, az = absw(fl); mx, mz = MODEL_AT[name][fl]
                lx, lz = lx + (ax - mx) * Cf ** 0 * T["C"][fl] / Cf, lz + (az - mz) * T["C"][fl] / Cf
        MODEL_AT.setdefault(name, {})[f] = ((xr * g + off[0]) / 100, -(yr * g + off[1]) / 100)
        root.location = (lx, spec.get("depth", 0), lz)
        rot = [b + o for b, o in zip(spec["rot"], interp_keys(spec.get("rkeys", [[0, [0, 0, 0]]]), f))]
        root.rotation_mode = "QUATERNION"; root.rotation_quaternion = q_from(rot)
        if "gskeys" in spec: gs = interp_keys(spec["gskeys"], f)[0] * gk
        s = spec["size"] / 100 * gs; root.scale = (s, s, s)

if os.environ.get("IDPASS"):      # flat object-ID render (R = 15*(index+1)), for per-object colour matching
    IDN = sorted(roots)
    for i, nm in enumerate(IDN):
        mid = bpy.data.materials.new("ID_" + nm); mid.use_nodes = True; nn = mid.node_tree.nodes
        for x in list(nn): nn.remove(x)
        eo = nn.new("ShaderNodeEmission"); oo = nn.new("ShaderNodeOutputMaterial"); mid.node_tree.links.new(eo.outputs[0], oo.inputs[0])
        v = ((15 * (i + 1)) / 255.0) ** 2.2; eo.inputs["Color"].default_value = (v, 0, 0, 1)
        for o in roots[nm][0].children_recursive:
            if hasattr(o.data, "materials"):
                o.data.materials.clear(); o.data.materials.append(mid)
                for sl in o.material_slots: sl.link = "OBJECT"; sl.material = mid
    sc_ = bpy.context.scene; sc_.cycles.samples = 1; sc_.render.filter_size = 0.01; sc_.render.dither_intensity = 0.0
    sc_.cycles.max_bounces = 0; sc_.cycles.transparent_max_bounces = 0
    json.dump(IDN, open(os.path.join(OUT, "ids.json"), "w"))
for k in range(1, 71): place(k)       # pre-pass fills MODEL_AT for the abs-track hand-off
# ---- temporal smoothing: record every object's final transform per frame, low-pass it (Savitzky-Golay, 9 frames,
# cubic - keeps the fast arrival/collapse, removes frame-to-frame noise), then place() applies the smoothed values.
def _savgol(seq, win=9, order=3):
    import numpy as _np
    a = _np.asarray(seq, float); n = len(a); half = win // 2; out = a.copy()
    for i in range(n):
        lo, hi = max(0, i - half), min(n, i + half + 1)
        xs = _np.arange(lo, hi) - i; o = min(order, hi - lo - 1)
        A = _np.vander(xs, o + 1); coef = _np.linalg.lstsq(A, a[lo:hi], rcond=None)[0]; out[i] = coef[-1]
    return out
_RAW = {}
for k in range(1, 71):
    place(k); bpy.context.view_layer.update()
    for name, (root, spec) in roots.items():
        loc, q, sc_ = root.matrix_world.decompose()
        _RAW.setdefault(name, []).append((loc.copy(), q.copy(), sc_.x, T["C"][k]))
_SM = {}
for name, rows in _RAW.items():
    # positions in screen px (camera zoom varies), scale in log, quaternion with sign continuity
    px = [(r[0].x * 100 * r[3], r[0].z * 100 * r[3], r[0].y) for r in rows]
    qs = []; prev = None
    for r in rows:
        q = r[1]
        if prev is not None and prev.dot(q) < 0: q = -q
        qs.append(q); prev = q
    import math as _m
    sx = _savgol([p[0] for p in px]); sz = _savgol([p[1] for p in px]); sy = [p[2] for p in px]
    ss = _savgol([_m.log(r[2]) for r in rows])
    qc = [_savgol([q[c] for q in qs]) for c in range(4)]
    _SM[name] = {k: (sx[k - 1], sy[k - 1], sz[k - 1], ss[k - 1], [qc[c][k - 1] for c in range(4)]) for k in range(1, 71)}
_place_raw = place
def place(f):
    _place_raw(f)
    if os.environ.get("NO_SMOOTH") or f not in next(iter(_SM.values())): return
    C = T["C"][f]
    for name, (root, spec) in roots.items():
        x, y, z, ls, q = _SM[name][f]
        from mathutils import Quaternion as _Q
        qq = _Q(q); qq.normalize()
        root.location = (x / (100 * C), y, z / (100 * C))      # rotation stays as keyed (monotone-cubic keys are already smooth)
        sv = math.exp(ls)
        if "soff" in spec:          # measured screen-space correction [dx px, dy px, size factor]
            dx, dy, sf = interp_keys(spec["soff"], f)
            x, z = x + dx, z - dy; sv *= sf
            root.location = (x / (100 * C), y, z / (100 * C))
        root.scale = (sv, sv, sv)
if os.environ.get("EXPORT_AE"):
    exec(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "export_ae3d.py")).read())
    raise SystemExit(0)
for f in FRAMES:
    place(f); bpy.context.view_layer.update()
    sc.render.filepath = os.path.join(OUT, "p%03d.png" % f)
    bpy.ops.render.render(write_still=True)
    print("PLATE", f, flush=True)
