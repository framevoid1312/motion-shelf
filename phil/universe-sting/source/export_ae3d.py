# Runs inside sting_scene.py (EXPORT_AE=<dir>): per-object GLB models with the f57 look baked into an emission
# texture, plus per-frame transforms in After Effects space (anim.json). Not a render: AE does the rendering.
import json, math, os, bpy
from mathutils import Matrix
OUTD = os.environ["EXPORT_AE"]; MD = os.path.join(OUTD, "models"); TX = os.path.join(MD, "textures")
os.makedirs(TX, exist_ok=True)
P = Matrix(((1, 0, 0), (0, 0, -1), (0, 1, 0)))       # Blender (x right, y in, z up) -> AE (x right, y down, z in)
anim = {}
for f in range(1, 71):
    place(f); bpy.context.view_layer.update(); C = T["C"][f]
    for name, (root, spec) in roots.items():
        loc, q, scl = root.matrix_world.decompose()
        e = (P @ q.to_matrix() @ P.transposed()).to_euler("XYZ")      # R = Rz Ry Rx: X applied first, as AE Orientation
        anim.setdefault(name, []).append([round(960 + loc.x * 100 * C, 3), round(540 - loc.z * 100 * C, 3), round(loc.y * 100, 2),
                                          round(math.degrees(e.x), 3), round(math.degrees(e.y), 3), round(math.degrees(e.z), 3),
                                          round(scl.x * 100 * C, 4)])          # last: px per model unit (1 m) on screen
json.dump({"frames": [1, 70], "objects": anim}, open(os.path.join(OUTD, "anim.json"), "w"))

# ---- bake the f57 look (camera-space matcap shading) into one emission texture per object, then export GLB
place(57); bpy.context.view_layer.update()
sc = bpy.context.scene; sc.render.engine = "CYCLES"; sc.cycles.samples = 16; sc.cycles.device = "CPU"
for name, (root, spec) in roots.items():
    kids = [o for o in root.children_recursive if o.type in ("MESH", "CURVE", "META", "FONT")]
    bpy.ops.object.select_all(action="DESELECT")
    meshes = []
    for o in kids:
        bpy.context.view_layer.objects.active = o; o.select_set(True)
        for md in getattr(o, "modifiers", []):
            if md.type == "SUBSURF": md.levels = md.render_levels = min(md.render_levels, 2)   # keep AE models light
        bpy.ops.object.convert(target="MESH")          # applies modifiers on meshes too
        meshes.append(bpy.context.view_layer.objects.active); o.select_set(False)
    meshes = [m for m in meshes if m.type == "MESH" and len(m.data.polygons)]
    # glass parts: AE's Advanced 3D has no refraction and ignores the material's transparency, so the glass gets the
    # video's own rendered look (sphere refracted through the glass) projected from the camera at f57, opaque.
    glass_parts = [m for m in meshes if any(sl.material and "glass" in sl.material.name.lower() for sl in m.material_slots)]
    meshes = [m for m in meshes if m not in glass_parts]
    if glass_parts:
        from bpy_extras.object_utils import world_to_camera_view
        hidden = []
        for nm2, (r2, s2) in roots.items():
            if nm2 != name:
                for o2 in [r2] + list(r2.children_recursive):
                    if not o2.hide_render: o2.hide_render = True; hidden.append(o2)
        if sc.world is None: sc.world = bpy.data.worlds.new("black")
        sc.world.use_nodes = True
        try: sc.world.node_tree.nodes["Background"].inputs[1].default_value = 0.0
        except Exception: pass
        ft = sc.render.film_transparent; sc.render.film_transparent = False; sc.cycles.samples = 96
        rp = os.path.join(TX, name + "_glass_view.png"); sc.render.filepath = rp; sc.render.resolution_percentage = 100
        bpy.ops.render.render(write_still=True)
        sc.render.film_transparent = ft; sc.cycles.samples = 16
        for o2 in hidden: o2.hide_render = False
        proj_img = bpy.data.images.load(rp)
        for g in glass_parts:
            uvl = g.data.uv_layers.new(name="camproj"); g.data.uv_layers.active = uvl; uvl.active_render = True
            for poly in g.data.polygons:
                for li in poly.loop_indices:
                    co = g.matrix_world @ g.data.vertices[g.data.loops[li].vertex_index].co
                    ndc = world_to_camera_view(sc, sc.camera, co); uvl.data[li].uv = (ndc.x, ndc.y)
            gm = bpy.data.materials.new(name + "_AE_glassview"); gm.use_nodes = True; gnt = gm.node_tree
            gbs = gnt.nodes["Principled BSDF"]; gbs.inputs["Base Color"].default_value = (0, 0, 0, 1)
            gbs.inputs["Roughness"].default_value = 1.0; gbs.inputs["Specular IOR Level"].default_value = 0.0
            gtn = gnt.nodes.new("ShaderNodeTexImage"); gtn.image = proj_img
            gnt.links.new(gtn.outputs["Color"], gbs.inputs["Emission Color"]); gbs.inputs["Emission Strength"].default_value = 1.0
            g.data.materials.clear(); g.data.materials.append(gm)
            gw = root.matrix_world.inverted() @ g.matrix_world; g.parent = None; g.matrix_world = gw
        bpy.ops.object.select_all(action="DESELECT")
        for g in glass_parts: g.select_set(True)
        bpy.context.view_layer.objects.active = glass_parts[0]
        if len(glass_parts) > 1: bpy.ops.object.join()
        gob = bpy.context.view_layer.objects.active
        bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
        bpy.ops.export_scene.gltf(filepath=os.path.join(MD, name + "_glass.glb"), export_format="GLB", use_selection=True,
                                  export_yup=True, export_apply=True, export_texcoords=True, export_normals=True)
        gob.hide_render = True; gob.hide_set(True)
        place(57); bpy.context.view_layer.update()
    glass_parts = []
    # bake BEFORE joining: every piece keeps its own object coordinates (petal ramps, airbrush noise), all pieces
    # share one UV layout (multi-object smart project) and one texture
    bpy.ops.object.select_all(action="DESELECT")
    for m_ in meshes: m_.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT")
    bpy.ops.uv.smart_project(angle_limit=math.radians(66), island_margin=0.004)
    bpy.ops.object.mode_set(mode="OBJECT")
    res = 2048 if spec["size"] * 2 > 300 else 1024
    img = bpy.data.images.new(name + "_look", res, res, alpha=False)
    for m_ in meshes:
        for ms in m_.material_slots:
            if not ms.material: continue
            ms.material = ms.material.copy(); nt = ms.material.node_tree
            tn = nt.nodes.new("ShaderNodeTexImage"); tn.image = img; nt.nodes.active = tn
    sc.cycles.bake_type = "EMIT"; sc.render.bake.margin = 6
    bpy.ops.object.bake(type="EMIT")
    bpy.ops.object.select_all(action="DESELECT")
    for m_ in meshes: m_.select_set(True)
    bpy.context.view_layer.objects.active = meshes[0]
    if len(meshes) > 1: bpy.ops.object.join()
    ob = bpy.context.view_layer.objects.active
    # same per-object colour curves as the video (fitted against the reference at f57)
    try:
        CMd = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "color_luts.json")))
        if name in CMd["luts"] and name not in ("ring", "shield", "flower", "bone", "duck", "clover", "coral_halves", "orbcube"):
            import numpy as _np
            Lt = _np.array(CMd["luts"][name], _np.float32) / 255.0
            px = _np.array(img.pixels[:], _np.float32).reshape(-1, 4)
            idx = _np.clip(_np.round(px[:, :3] * 255), 0, 255).astype(int)
            for ch in range(3): px[:, ch] = Lt[ch][idx[:, ch]]
            img.pixels[:] = px.ravel().tolist()
    except Exception as ex:
        print("LUT skip", name, ex)
    img.filepath_raw = os.path.join(TX, name + "_look.png"); img.file_format = "PNG"; img.save()
    # export material: emission-only look (base black, no spec), so AE lighting doesn't repaint it
    m = bpy.data.materials.new(name + "_AE"); m.use_nodes = True; nt = m.node_tree
    bs = nt.nodes["Principled BSDF"]; bs.inputs["Base Color"].default_value = (0, 0, 0, 1)
    bs.inputs["Roughness"].default_value = 1.0; bs.inputs["Specular IOR Level"].default_value = 0.0
    tn = nt.nodes.new("ShaderNodeTexImage"); tn.image = img
    nt.links.new(tn.outputs["Color"], bs.inputs["Emission Color"]); bs.inputs["Emission Strength"].default_value = 1.0
    glass = None   # (no glass slots remain on the baked mesh)
    if any(ms.material and "glass" in ms.material.name.lower() for ms in ob.material_slots):
        glass = m.copy(); glass.name = name + "_AE_glass"; gb = glass.node_tree.nodes["Principled BSDF"]
        gb.inputs["Alpha"].default_value = 0.6
        gb.inputs["Transmission Weight"].default_value = 1.0; gb.inputs["IOR"].default_value = 1.6
        gb.inputs["Base Color"].default_value = (0.85, 0.95, 1.0, 1); gb.inputs["Roughness"].default_value = 0.02
        try: gb.inputs["Dispersion"].default_value = 0.6
        except Exception: pass
        try: glass.surface_render_method = "BLENDED"
        except Exception: glass.blend_method = "BLEND"
    for i, ms in enumerate(ob.material_slots):
        ms.material = glass if (glass and ms.material and "glass" in ms.material.name.lower()) else m
    # model space = the root's local space (AE layer transforms come from anim.json)
    mw = root.matrix_world.inverted() @ ob.matrix_world
    ob.parent = None; ob.matrix_world = mw
    bpy.ops.object.select_all(action="DESELECT")
    for g in glass_parts:
        gw = root.matrix_world.inverted() @ g.matrix_world; g.parent = None; g.matrix_world = gw; g.select_set(True)
    ob.select_set(True); bpy.context.view_layer.objects.active = ob
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(MD, name + ".glb"), export_format="GLB", use_selection=True,
                              export_yup=True, export_apply=True, export_texcoords=True, export_normals=True)
    ob.hide_render = True; ob.hide_set(True)
    for g in glass_parts: g.hide_render = True; g.hide_set(True)
    print("MODEL", name, len(ob.data.polygons), "faces", flush=True)
