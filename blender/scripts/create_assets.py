"""
GoodEggs 3D Asset Generator - Blender 5.2 Automation Script
Generates production-quality 3D assets:
1. Chicken (rigged, animated, stylized cute character)
2. Eggs (parametric white, brown, collection with floating animation)
3. Egg Carton (10-egg molded pulp tray with opening lid animation)
4. Farm Scene (cozy farm diorama with barn, pasture, trees, fence, nest)

Outputs:
- .blend source files in blender/models/
- .glb export files in frontend/public/models/
- Preview renders in blender/renders/
"""

import bpy
import math
import os

# Base paths
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
BLENDER_MODELS_DIR = os.path.join(PROJECT_ROOT, "blender", "models")
BLENDER_RENDERS_DIR = os.path.join(PROJECT_ROOT, "blender", "renders")
FRONTEND_MODELS_DIR = os.path.join(PROJECT_ROOT, "frontend", "public", "models")

for d in [BLENDER_MODELS_DIR, BLENDER_RENDERS_DIR, FRONTEND_MODELS_DIR]:
    os.makedirs(d, exist_ok=True)

# Disable external OS thumbnail writes to prevent permission errors
if hasattr(bpy.context.preferences.filepaths, "file_preview_type"):
    bpy.context.preferences.filepaths.file_preview_type = 'NONE'


def clean_scene():
    """Remove all objects, materials, animations, and collections from current scene."""
    if bpy.context.active_object and bpy.context.active_object.mode != 'OBJECT':
        bpy.ops.object.mode_set(mode='OBJECT')

    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    for mesh in list(bpy.data.meshes):
        bpy.data.meshes.remove(mesh)
    for mat in list(bpy.data.materials):
        bpy.data.materials.remove(mat)
    for arm in list(bpy.data.armatures):
        bpy.data.armatures.remove(arm)
    for cam in list(bpy.data.cameras):
        bpy.data.cameras.remove(cam)
    for light in list(bpy.data.lights):
        bpy.data.lights.remove(light)
    for action in list(bpy.data.actions):
        bpy.data.actions.remove(action)


def create_material(name, base_color=(1, 1, 1, 1), roughness=0.5, metallic=0.0, specular=0.5):
    """Create a Principled BSDF material compatible with Blender 4.x and 5.x."""
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    bsdf = nodes.get("Principled BSDF")

    if bsdf:
        if "Base Color" in bsdf.inputs:
            bsdf.inputs["Base Color"].default_value = base_color
        if "Roughness" in bsdf.inputs:
            bsdf.inputs["Roughness"].default_value = roughness
        if "Metallic" in bsdf.inputs:
            bsdf.inputs["Metallic"].default_value = metallic

        # Specular property name handling across Blender versions
        if "Specular IOR Level" in bsdf.inputs:
            bsdf.inputs["Specular IOR Level"].default_value = specular
        elif "Specular" in bsdf.inputs:
            bsdf.inputs["Specular"].default_value = specular

    # Also set viewport display color for Workbench rendering
    mat.diffuse_color = base_color
    mat.roughness = roughness
    mat.metallic = metallic

    return mat


def setup_studio_lighting(cam_location=(0, -4.2, 2.0), cam_rotation=(1.15, 0, 0), cam_ortho=False):
    """Set up photographic studio lighting, camera and rendering configuration."""
    # Key light (warm sunlight)
    key_data = bpy.data.lights.new(name="KeyLight", type='SUN')
    key_data.energy = 4.5
    key_data.color = (1.0, 0.96, 0.90)
    key_obj = bpy.data.objects.new(name="KeyLight", object_data=key_data)
    key_obj.location = (4.0, -4.0, 6.0)
    key_obj.rotation_euler = (0.78, 0.35, 0.6)
    bpy.context.scene.collection.objects.link(key_obj)

    # Fill light (soft ambient sky bounce)
    fill_data = bpy.data.lights.new(name="FillLight", type='SUN')
    fill_data.energy = 2.2
    fill_data.color = (0.85, 0.92, 1.0)
    fill_obj = bpy.data.objects.new(name="FillLight", object_data=fill_data)
    fill_obj.location = (-4.0, -3.0, 4.0)
    fill_obj.rotation_euler = (0.9, -0.4, -0.6)
    bpy.context.scene.collection.objects.link(fill_obj)

    # Rim light (golden egg backlight accent)
    rim_data = bpy.data.lights.new(name="RimLight", type='SUN')
    rim_data.energy = 3.0
    rim_data.color = (1.0, 0.85, 0.5)
    rim_obj = bpy.data.objects.new(name="RimLight", object_data=rim_data)
    rim_obj.location = (0.0, 5.0, 4.0)
    rim_obj.rotation_euler = (-1.0, 0, 3.14)
    bpy.context.scene.collection.objects.link(rim_obj)

    # Camera
    cam_data = bpy.data.cameras.new(name="StudioCamera")
    if cam_ortho:
        cam_data.type = 'ORTHO'
        cam_data.ortho_scale = 4.0
    else:
        cam_data.type = 'PERSP'
        cam_data.lens = 55.0
    cam_obj = bpy.data.objects.new(name="StudioCamera", object_data=cam_data)
    cam_obj.location = cam_location
    cam_obj.rotation_euler = cam_rotation
    bpy.context.scene.collection.objects.link(cam_obj)
    bpy.context.scene.camera = cam_obj

    # Fast high-quality studio render settings with material display
    bpy.context.scene.render.engine = 'BLENDER_WORKBENCH'
    if hasattr(bpy.context.scene, "display"):
        bpy.context.scene.display.shading.light = 'STUDIO'
        bpy.context.scene.display.shading.color_type = 'MATERIAL'

    bpy.context.scene.render.film_transparent = True
    bpy.context.scene.render.resolution_x = 900
    bpy.context.scene.render.resolution_y = 900
    bpy.context.scene.render.resolution_percentage = 100


def render_preview(filepath):
    """Render preview thumbnail to png."""
    abs_path = os.path.abspath(filepath)
    bpy.context.scene.render.image_settings.file_format = 'PNG'
    bpy.context.scene.render.filepath = abs_path
    print(f"Rendering preview to: {abs_path}")
    bpy.ops.render.render(write_still=True)


def save_and_export(blend_filename, glb_filename, render_filename=None):
    """Save .blend file, export .glb, and render preview."""
    blend_path = os.path.abspath(os.path.join(BLENDER_MODELS_DIR, blend_filename))
    glb_path = os.path.abspath(os.path.join(FRONTEND_MODELS_DIR, glb_filename))

    # Save Blend project
    print(f"Saving .blend: {blend_path}")
    bpy.ops.wm.save_as_mainfile(filepath=blend_path)

    # Export production GLB
    print(f"Exporting .glb: {glb_path}")
    bpy.ops.export_scene.gltf(
        filepath=glb_path,
        export_format='GLB',
        export_animations=True,
        export_apply=False,
    )

    # Render preview image
    if render_filename:
        render_path = os.path.abspath(os.path.join(BLENDER_RENDERS_DIR, render_filename))
        render_preview(render_path)


# ==============================================================================
# 1. PARAMETRIC EGG GENERATOR
# ==============================================================================
def create_egg_mesh(name="Egg", radius=0.75, height_scale=1.35, taper=0.24, segments=48, rings=32):
    """Creates a parametric organic egg shape by tapering a UV sphere."""
    bpy.ops.mesh.primitive_uv_sphere_add(
        segments=segments,
        ring_count=rings,
        radius=radius,
        location=(0, 0, 0)
    )
    egg = bpy.context.active_object
    egg.name = name

    # Apply organic egg taper
    mesh = egg.data
    for v in mesh.vertices:
        z = v.co.z
        norm_z = z / radius
        if norm_z > 0:
            scale_factor = 1.0 - (taper * norm_z)
        else:
            scale_factor = 1.0 + (taper * 0.28 * abs(norm_z))
        v.co.x *= scale_factor
        v.co.y *= scale_factor
        v.co.z *= height_scale

    mesh.update()
    bpy.ops.object.shade_smooth()

    # Subdivision surface modifier for ultra silky eggshell
    sub = egg.modifiers.new(name="Subsurf", type='SUBSURF')
    sub.levels = 1
    sub.render_levels = 2

    return egg


def build_single_white_egg():
    print("\n--- Building Single White Egg Asset ---")
    clean_scene()
    setup_studio_lighting(cam_location=(0, -3.8, 1.4), cam_rotation=(1.25, 0, 0))

    mat_white = create_material("Mat_Egg_White", base_color=(0.98, 0.97, 0.94, 1.0), roughness=0.36, specular=0.6)
    white_egg = create_egg_mesh("Egg_White")
    white_egg.data.materials.append(mat_white)
    white_egg.location = (0, 0, 0.2)

    # Floating animation for White Egg
    white_egg.animation_data_create()
    action = bpy.data.actions.new(name="Egg_Float")
    white_egg.animation_data.action = action
    for frame, (z, rot_y) in [(1, (0.2, 0)), (30, (0.45, math.radians(180))), (60, (0.2, math.radians(360)))]:
        white_egg.location.z = z
        white_egg.rotation_euler.y = rot_y
        white_egg.keyframe_insert(data_path="location", frame=frame)
        white_egg.keyframe_insert(data_path="rotation_euler", frame=frame)

    save_and_export("egg-white.blend", "egg-white.glb")


def build_single_brown_egg():
    print("\n--- Building Single Brown Egg Asset ---")
    clean_scene()
    setup_studio_lighting(cam_location=(0, -3.8, 1.4), cam_rotation=(1.25, 0, 0))

    mat_brown = create_material("Mat_Egg_Brown", base_color=(0.68, 0.42, 0.23, 1.0), roughness=0.46, specular=0.5)
    brown_egg = create_egg_mesh("Egg_Brown")
    brown_egg.data.materials.append(mat_brown)
    brown_egg.location = (0, 0, 0.2)

    # Floating animation for Brown Egg
    brown_egg.animation_data_create()
    action = bpy.data.actions.new(name="Egg_Float")
    brown_egg.animation_data.action = action
    for frame, (z, rot_y) in [(1, (0.2, 0)), (30, (0.45, math.radians(180))), (60, (0.2, math.radians(360)))]:
        brown_egg.location.z = z
        brown_egg.rotation_euler.y = rot_y
        brown_egg.keyframe_insert(data_path="location", frame=frame)
        brown_egg.keyframe_insert(data_path="rotation_euler", frame=frame)

    save_and_export("egg-brown.blend", "egg-brown.glb")


def build_egg_collection():
    print("\n--- Building Egg Collection Asset ---")
    clean_scene()
    setup_studio_lighting(cam_location=(0, -4.5, 2.2), cam_rotation=(1.15, 0, 0))

    mat_white = create_material("Mat_Egg_White", base_color=(0.98, 0.97, 0.94, 1.0), roughness=0.36, specular=0.6)
    mat_brown = create_material("Mat_Egg_Brown", base_color=(0.68, 0.42, 0.23, 1.0), roughness=0.46, specular=0.5)

    egg_specs = [
        ("Egg_Col_1_Brown", mat_brown, (0.0, 0.0, 0.1), (0.1, -0.05, 0.2), 1.0),
        ("Egg_Col_2_White", mat_white, (-0.85, 0.25, 0.0), (-0.15, 0.2, -0.4), 0.95),
        ("Egg_Col_3_Brown", mat_brown, (0.85, 0.2, 0.0), (0.2, -0.25, 0.5), 0.96),
        ("Egg_Col_4_White", mat_white, (-0.45, -0.7, -0.05), (0.3, 0.1, 0.8), 0.92),
        ("Egg_Col_5_Brown", mat_brown, (0.55, -0.65, -0.05), (-0.25, -0.15, -0.7), 0.94),
    ]

    for name, mat, pos, rot, scale in egg_specs:
        e = create_egg_mesh(name)
        e.data.materials.append(mat)
        e.location = pos
        e.rotation_euler = rot
        e.scale = (scale, scale, scale)

    save_and_export("eggs.blend", "egg-collection.glb", "eggs_render.png")


# ==============================================================================
# 2. CHICKEN CHARACTER GENERATOR
# ==============================================================================
def build_chicken_character():
    print("\n--- Building Chicken Character Asset ---")
    clean_scene()
    setup_studio_lighting(cam_location=(0, -4.8, 1.8), cam_rotation=(1.25, 0, 0))

    # Materials
    mat_feather_warm = create_material("Mat_Chicken_Feathers", base_color=(0.97, 0.85, 0.38, 1.0), roughness=0.52)
    mat_feather_wing = create_material("Mat_Chicken_Wing", base_color=(0.95, 0.74, 0.12, 1.0), roughness=0.55)
    mat_belly = create_material("Mat_Chicken_Belly", base_color=(1.0, 0.97, 0.86, 1.0), roughness=0.55)
    mat_red = create_material("Mat_Chicken_Red", base_color=(0.85, 0.16, 0.16, 1.0), roughness=0.38)
    mat_beak = create_material("Mat_Chicken_Beak", base_color=(1.0, 0.65, 0.0, 1.0), roughness=0.3, specular=0.7)
    mat_eye_sclera = create_material("Mat_Eye_Sclera", base_color=(1.0, 1.0, 1.0, 1.0), roughness=0.15)
    mat_eye_pupil = create_material("Mat_Eye_Pupil", base_color=(0.12, 0.09, 0.08, 1.0), roughness=0.1)
    mat_eye_catch = create_material("Mat_Eye_Catch", base_color=(1.0, 1.0, 1.0, 1.0), roughness=0.0)
    mat_blush = create_material("Mat_Blush", base_color=(1.0, 0.55, 0.58, 1.0), roughness=0.8)
    mat_tail = create_material("Mat_Tail", base_color=(0.65, 0.38, 0.20, 1.0), roughness=0.6)

    # 1. Main Plump Body
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40, ring_count=32, radius=1.05, location=(0, 0, 0))
    body = bpy.context.active_object
    body.name = "Chicken_Body"
    body.scale = (1.0, 0.92, 1.08)
    bpy.ops.object.transform_apply(scale=True)
    body.data.materials.append(mat_feather_warm)
    bpy.ops.object.shade_smooth()

    # Cream Belly Patch
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, radius=0.68, location=(0, -0.45, -0.05))
    belly = bpy.context.active_object
    belly.name = "Chicken_Belly"
    belly.scale = (0.85, 0.5, 0.95)
    bpy.ops.object.transform_apply(scale=True)
    belly.data.materials.append(mat_belly)
    bpy.ops.object.shade_smooth()
    belly.parent = body

    # 2. Head
    bpy.ops.mesh.primitive_uv_sphere_add(segments=36, ring_count=28, radius=0.68, location=(0, -0.22, 0.95))
    head = bpy.context.active_object
    head.name = "Chicken_Head"
    head.data.materials.append(mat_feather_warm)
    bpy.ops.object.shade_smooth()
    head.parent = body

    # 3. 3-Lobed Red Comb on Crown
    comb_positions = [
        (0.0, -0.28, 1.70, 0.22, 1.4),
        (-0.13, -0.24, 1.62, 0.17, 1.2),
        (0.13, -0.24, 1.62, 0.17, 1.2),
    ]
    for i, (cx, cy, cz, crad, cscz) in enumerate(comb_positions):
        bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=crad, location=(cx, cy, cz))
        comb_lobe = bpy.context.active_object
        comb_lobe.name = f"Comb_Lobe_{i+1}"
        comb_lobe.scale = (0.85, 0.9, cscz)
        bpy.ops.object.transform_apply(scale=True)
        comb_lobe.data.materials.append(mat_red)
        bpy.ops.object.shade_smooth()
        comb_lobe.parent = head

    # 4. Golden Beak
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.18, depth=0.45, location=(0, -0.88, 0.92))
    beak = bpy.context.active_object
    beak.name = "Chicken_Beak"
    beak.rotation_euler = (math.radians(-90), 0, 0)
    bpy.ops.object.transform_apply(rotation=True)
    beak.data.materials.append(mat_beak)
    bpy.ops.object.shade_smooth()
    beak.parent = head

    # 5. Red Wattle (2 Teardrops below beak)
    for side, wx in [("L", -0.07), ("R", 0.07)]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=18, ring_count=14, radius=0.11, location=(wx, -0.74, 0.72))
        wattle = bpy.context.active_object
        wattle.name = f"Wattle_{side}"
        wattle.scale = (0.75, 0.8, 1.35)
        bpy.ops.object.transform_apply(scale=True)
        wattle.data.materials.append(mat_red)
        bpy.ops.object.shade_smooth()
        wattle.parent = head

    # 6. Blush Cheeks
    for side, cx in [("L", -0.42), ("R", 0.42)]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.14, location=(cx, -0.56, 0.85))
        blush = bpy.context.active_object
        blush.name = f"Blush_{side}"
        blush.scale = (0.8, 0.25, 0.7)
        bpy.ops.object.transform_apply(scale=True)
        blush.data.materials.append(mat_blush)
        bpy.ops.object.shade_smooth()
        blush.parent = head

    # 7. Stylized Eyes with catchlights
    for side, ex in [("L", -0.28), ("R", 0.28)]:
        # Sclera
        bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.13, location=(ex, -0.68, 1.04))
        sclera = bpy.context.active_object
        sclera.name = f"Eye_Sclera_{side}"
        sclera.data.materials.append(mat_eye_sclera)
        bpy.ops.object.shade_smooth()
        sclera.parent = head

        # Pupil
        bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.07, location=(ex, -0.76, 1.04))
        pupil = bpy.context.active_object
        pupil.name = f"Eye_Pupil_{side}"
        pupil.data.materials.append(mat_eye_pupil)
        pupil.parent = sclera

        # Catchlight sparkle
        bpy.ops.mesh.primitive_uv_sphere_add(segments=10, ring_count=8, radius=0.026, location=(ex + 0.025, -0.81, 1.07))
        catch = bpy.context.active_object
        catch.name = f"Eye_Catch_{side}"
        catch.data.materials.append(mat_eye_catch)
        catch.parent = sclera

    # 8. Wings
    for side, wx, rot_z in [("L", -0.98, math.radians(-10)), ("R", 0.98, math.radians(10))]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=20, radius=0.55, location=(wx, 0.05, 0.08))
        wing = bpy.context.active_object
        wing.name = f"Wing_{side}"
        wing.scale = (0.35, 0.85, 1.1)
        wing.rotation_euler = (math.radians(15), 0, rot_z)
        bpy.ops.object.transform_apply(scale=True, rotation=True)
        wing.data.materials.append(mat_feather_wing)
        bpy.ops.object.shade_smooth()
        wing.parent = body

    # 9. Upward Curving Tail Feathers
    tail_specs = [
        ("Tail_Center", 0.0, 0.95, 0.42, 0.26, 1.1, math.radians(45)),
        ("Tail_Left", -0.16, 0.90, 0.35, 0.22, 0.9, math.radians(35)),
        ("Tail_Right", 0.16, 0.90, 0.35, 0.22, 0.9, math.radians(35)),
    ]
    for tname, tx, ty, tz, trad, tlen, trot_x in tail_specs:
        bpy.ops.mesh.primitive_cone_add(vertices=20, radius1=trad, depth=tlen, location=(tx, ty, tz))
        tail = bpy.context.active_object
        tail.name = tname
        tail.rotation_euler = (trot_x, 0, 0)
        bpy.ops.object.transform_apply(rotation=True)
        tail.data.materials.append(mat_tail)
        bpy.ops.object.shade_smooth()
        tail.parent = body

    # 10. Legs and Toed Feet
    for side, lx in [("L", -0.32), ("R", 0.32)]:
        # Leg shaft
        bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.065, depth=0.45, location=(lx, -0.05, -1.1))
        leg = bpy.context.active_object
        leg.name = f"Leg_{side}"
        leg.data.materials.append(mat_beak)
        bpy.ops.object.shade_smooth()
        leg.parent = body

        # 3 Toes
        for toe_angle, toe_name in [(-0.35, "Outer"), (0.0, "Center"), (0.35, "Inner")]:
            bpy.ops.mesh.primitive_cone_add(vertices=12, radius1=0.055, depth=0.28, location=(lx + math.sin(toe_angle)*0.08, -0.22, -1.3))
            toe = bpy.context.active_object
            toe.name = f"Toe_{side}_{toe_name}"
            toe.rotation_euler = (math.radians(-90), 0, toe_angle)
            bpy.ops.object.transform_apply(rotation=True)
            toe.data.materials.append(mat_beak)
            toe.parent = leg

    # 11. Add Cute Chicken Idle Animation
    body.animation_data_create()
    idle_action = bpy.data.actions.new(name="Chicken_Idle")
    body.animation_data.action = idle_action

    frames_keyframes = [
        (1,  1.0, 1.0, 1.0, 0.0),
        (15, 1.03, 1.03, 0.97, -0.04),
        (30, 0.98, 0.98, 1.03, 0.04),
        (45, 1.02, 1.02, 0.98, -0.02),
        (60, 1.0, 1.0, 1.0, 0.0),
    ]
    for f, sx, sy, sz, dz in frames_keyframes:
        body.scale = (sx, sy, sz)
        body.location.z = dz
        body.keyframe_insert(data_path="scale", frame=f)
        body.keyframe_insert(data_path="location", frame=f)

    # Save, export and render preview
    save_and_export("chicken.blend", "chicken.glb", "chicken_render.png")


# ==============================================================================
# 3. EGG CARTON GENERATOR
# ==============================================================================
def build_egg_carton():
    print("\n--- Building Egg Carton Asset ---")
    clean_scene()
    setup_studio_lighting(cam_location=(0, -5.2, 3.2), cam_rotation=(1.05, 0, 0))

    # Materials
    mat_pulp = create_material("Mat_Pulp_Kraft", base_color=(0.82, 0.74, 0.62, 1.0), roughness=0.75, specular=0.2)
    mat_label = create_material("Mat_GoodEggs_Label", base_color=(0.14, 0.38, 0.22, 1.0), roughness=0.4, specular=0.5)
    mat_label_gold = create_material("Mat_GoodEggs_Gold", base_color=(0.95, 0.82, 0.32, 1.0), roughness=0.35)
    mat_egg_white = create_material("Mat_Carton_WhiteEgg", base_color=(0.98, 0.97, 0.94, 1.0), roughness=0.38)
    mat_egg_brown = create_material("Mat_Carton_BrownEgg", base_color=(0.68, 0.42, 0.23, 1.0), roughness=0.45)

    # 1. Base Carton Tray
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0))
    tray = bpy.context.active_object
    tray.name = "Carton_Base_Tray"
    tray.scale = (3.2, 1.45, 0.5)
    bpy.ops.object.transform_apply(scale=True)
    tray.data.materials.append(mat_pulp)

    # Bevel on tray
    bev = tray.modifiers.new(name="Bevel", type='BEVEL')
    bev.width = 0.08
    bev.segments = 3
    bpy.ops.object.shade_smooth()

    # 2. 10 Molded Egg Cups with seated eggs (2 rows of 5)
    col_spacing = 0.6
    row_spacing = 0.65
    start_x = -2 * col_spacing
    start_y = -0.5 * row_spacing

    for r in range(2):
        y_pos = start_y + r * row_spacing
        for c in range(5):
            x_pos = start_x + c * col_spacing

            # Hollow cup indentation
            bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.26, depth=0.3, location=(x_pos, y_pos, 0.18))
            cup = bpy.context.active_object
            cup.name = f"Cup_R{r}_C{c}"
            cup.data.materials.append(mat_pulp)
            bpy.ops.object.shade_smooth()
            cup.parent = tray

            # Egg seated inside cup
            is_white = (r + c) % 2 == 0
            egg_mat = mat_egg_white if is_white else mat_egg_brown
            bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=20, radius=0.24, location=(x_pos, y_pos, 0.32))
            egg = bpy.context.active_object
            egg.name = f"Carton_Egg_R{r}_C{c}"
            egg.scale = (1.0, 1.0, 1.32)
            egg.rotation_euler = (math.radians((c % 3 - 1) * 6), math.radians((r * 2 - 1) * 5), 0)
            bpy.ops.object.transform_apply(scale=True, rotation=True)
            egg.data.materials.append(egg_mat)
            bpy.ops.object.shade_smooth()
            egg.parent = tray

    # 3. Center Support Cones between cups (4 cones)
    for c in range(4):
        x_cone = start_x + (c + 0.5) * col_spacing
        bpy.ops.mesh.primitive_cone_add(vertices=16, radius1=0.12, radius2=0.06, depth=0.42, location=(x_cone, 0, 0.25))
        cone = bpy.context.active_object
        cone.name = f"Divider_Cone_{c+1}"
        cone.data.materials.append(mat_pulp)
        cone.parent = tray

    # 4. Hinged Lid with Pivot at rear edge (Y = 0.75, Z = 0.25)
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.75, 0.25))
    lid_mesh = bpy.context.active_object
    lid_mesh.name = "Carton_Lid_Geometry"
    lid_mesh.scale = (3.26, 1.5, 0.55)
    bpy.ops.object.transform_apply(scale=True)
    lid_mesh.data.materials.append(mat_pulp)
    lid_bev = lid_mesh.modifiers.new(name="Bevel", type='BEVEL')
    lid_bev.width = 0.08
    lid_bev.segments = 3
    bpy.ops.object.shade_smooth()

    # Create empty / pivot for hinge
    bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0, 0.75, 0.25))
    hinge = bpy.context.active_object
    hinge.name = "Carton_Hinge"
    lid_mesh.location = (0, 0, 0)
    lid_mesh.parent = hinge
    hinge.parent = tray

    # 5. Tamper-Evident GoodEggs Brand Label
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, -0.75, 0.55))
    label = bpy.context.active_object
    label.name = "GoodEggs_Label_Band"
    label.scale = (1.8, 1.54, 0.02)
    bpy.ops.object.transform_apply(scale=True)
    label.data.materials.append(mat_label)
    label.parent = hinge

    # Gold Stamp emblem on label
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.32, depth=0.025, location=(0, -0.75, 0.57))
    stamp = bpy.context.active_object
    stamp.name = "GoodEggs_Gold_Seal"
    stamp.data.materials.append(mat_label_gold)
    stamp.parent = label

    # 6. Carton Open Animation
    hinge.animation_data_create()
    carton_action = bpy.data.actions.new(name="Carton_Open")
    hinge.animation_data.action = carton_action

    keyframes = [
        (1, 0.0),                               # Closed
        (25, math.radians(-45)),                # Opening
        (50, math.radians(-105)),               # Fully Open showing fresh eggs
        (60, math.radians(-105)),
    ]
    for frame, rot_x in keyframes:
        hinge.rotation_euler.x = rot_x
        hinge.keyframe_insert(data_path="rotation_euler", frame=frame)

    # Save carton project and export open animated carton
    save_and_export("carton.blend", "egg-carton.glb", "carton_render.png")

    # Export closed version
    hinge.rotation_euler.x = 0.0
    glb_closed_path = os.path.abspath(os.path.join(FRONTEND_MODELS_DIR, "egg-carton-closed.glb"))
    print(f"Exporting closed carton: {glb_closed_path}")
    bpy.ops.export_scene.gltf(
        filepath=glb_closed_path,
        export_format='GLB',
        export_animations=False,
    )


# ==============================================================================
# 4. FARM SCENE GENERATOR
# ==============================================================================
def build_farm_scene():
    print("\n--- Building Farm Scene Asset ---")
    clean_scene()
    setup_studio_lighting(cam_location=(0, -8.5, 5.5), cam_rotation=(1.0, 0, 0))

    # Materials
    mat_grass = create_material("Mat_Pasture_Grass", base_color=(0.48, 0.68, 0.24, 1.0), roughness=0.8)
    mat_dirt = create_material("Mat_Farm_Soil", base_color=(0.42, 0.28, 0.16, 1.0), roughness=0.9)
    mat_barn_wall = create_material("Mat_Barn_Red", base_color=(0.65, 0.20, 0.15, 1.0), roughness=0.6)
    mat_barn_trim = create_material("Mat_Barn_WhiteTrim", base_color=(0.95, 0.94, 0.90, 1.0), roughness=0.45)
    mat_roof = create_material("Mat_Barn_Roof", base_color=(0.24, 0.18, 0.16, 1.0), roughness=0.65)
    mat_wood = create_material("Mat_Fence_Wood", base_color=(0.75, 0.65, 0.50, 1.0), roughness=0.7)
    mat_tree_wood = create_material("Mat_Trunk_Wood", base_color=(0.38, 0.25, 0.15, 1.0), roughness=0.85)
    mat_foliage = create_material("Mat_Foliage_Green", base_color=(0.35, 0.58, 0.22, 1.0), roughness=0.75)
    mat_straw = create_material("Mat_Straw_Nest", base_color=(0.88, 0.72, 0.40, 1.0), roughness=0.85)

    # 1. Pasture Ground (Beveled organic base disc)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=4.5, depth=0.5, location=(0, 0, -0.25))
    ground = bpy.context.active_object
    ground.name = "Pasture_Ground"
    ground.data.materials.append(mat_grass)
    bpy.ops.object.shade_smooth()

    # 2. Cozy Barn Chicken Coop
    # Main coop box
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-1.8, 1.2, 0.85))
    barn = bpy.context.active_object
    barn.name = "Barn_Coop"
    barn.scale = (2.2, 2.0, 1.7)
    bpy.ops.object.transform_apply(scale=True)
    barn.data.materials.append(mat_barn_wall)
    barn.parent = ground

    # Barn Pitched Roof
    bpy.ops.mesh.primitive_cylinder_add(vertices=3, radius=1.65, depth=2.4, location=(-1.8, 1.2, 2.3))
    roof = bpy.context.active_object
    roof.name = "Barn_Roof"
    roof.rotation_euler = (math.radians(90), 0, 0)
    bpy.ops.object.transform_apply(rotation=True)
    roof.data.materials.append(mat_roof)
    roof.parent = barn

    # White Trim Doorway
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-1.8, 0.18, 0.55))
    door = bpy.context.active_object
    door.name = "Barn_Doorway"
    door.scale = (0.7, 0.08, 1.1)
    bpy.ops.object.transform_apply(scale=True)
    door.data.materials.append(mat_dirt)
    door.parent = barn

    # White Trim Frame
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-1.8, 0.2, 1.15))
    lintel = bpy.context.active_object
    lintel.name = "Barn_Door_Lintel"
    lintel.scale = (0.85, 0.1, 0.1)
    bpy.ops.object.transform_apply(scale=True)
    lintel.data.materials.append(mat_barn_trim)
    lintel.parent = barn

    # 3. Wooden Post & Rail Fence Segments
    fence_angles = [-40, -15, 10, 35, 60]
    for idx, angle_deg in enumerate(fence_angles):
        rad = math.radians(angle_deg)
        dist = 3.8
        fx = math.sin(rad) * dist
        fy = -math.cos(rad) * dist

        # Post
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.07, depth=0.9, location=(fx, fy, 0.45))
        post = bpy.context.active_object
        post.name = f"Fence_Post_{idx+1}"
        post.data.materials.append(mat_wood)
        post.parent = ground

    # 4. Puffy Foliage Trees
    tree_locs = [(2.2, 2.0), (3.2, 0.4)]
    for tidx, (tx, ty) in enumerate(tree_locs):
        # Trunk
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.18, depth=1.6, location=(tx, ty, 0.8))
        trunk = bpy.context.active_object
        trunk.name = f"Tree_Trunk_{tidx+1}"
        trunk.data.materials.append(mat_tree_wood)
        trunk.parent = ground

        # Foliage puffs
        puff_specs = [
            (0, 0, 1.1, 0.85),
            (-0.35, -0.2, 0.95, 0.65),
            (0.35, 0.2, 0.95, 0.7),
            (0.1, 0.35, 1.25, 0.6),
        ]
        for pidx, (px, py, pz, prad) in enumerate(puff_specs):
            bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=prad, location=(tx + px, ty + py, 0.8 + pz))
            puff = bpy.context.active_object
            puff.name = f"Foliage_{tidx+1}_{pidx+1}"
            puff.data.materials.append(mat_foliage)
            bpy.ops.object.shade_smooth()
            puff.parent = trunk

    # 5. Cozy Braided Straw Nest
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.8, depth=0.25, location=(0.6, -1.2, 0.12))
    nest = bpy.context.active_object
    nest.name = "Straw_Nest"
    nest.data.materials.append(mat_straw)
    nest.parent = ground

    # Small brown egg nestled in straw
    bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.18, location=(0.6, -1.2, 0.24))
    nest_egg = bpy.context.active_object
    nest_egg.name = "Nest_Egg"
    nest_egg.scale = (1.0, 1.0, 1.35)
    nest_egg.rotation_euler = (math.radians(20), math.radians(15), 0)
    bpy.ops.object.transform_apply(scale=True, rotation=True)
    nest_egg.data.materials.append(create_material("Mat_Nest_Egg", base_color=(0.68, 0.42, 0.23, 1.0), roughness=0.45))
    bpy.ops.object.shade_smooth()
    nest_egg.parent = nest

    # Save and export farm scene
    save_and_export("farm.blend", "farm-scene.glb", "farm_render.png")


# ==============================================================================
# MAIN RUNNER
# ==============================================================================
if __name__ == "__main__":
    print("==================================================")
    print("   GOODEGGS 3D ASSETS PROCEDURAL PIPELINE")
    print("==================================================")
    build_single_white_egg()
    build_single_brown_egg()
    build_egg_collection()
    build_chicken_character()
    build_egg_carton()
    build_farm_scene()
    print("\n==================================================")
    print("   ALL 3D ASSETS GENERATED & EXPORTED SUCCESSFULLY")
    print("==================================================")
