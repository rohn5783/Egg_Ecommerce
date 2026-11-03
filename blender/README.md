# GoodEggs — Blender 3D Asset Pipeline

This directory manages the 3D assets, procedural generation scripts, material shaders, `.blend` master projects, and optimized web `.glb` exports for the GoodEggs interactive e-commerce platform.

---

## Directory Organization

```
blender/
├── exports/          # Generated GLB/glTF web-optimized assets
├── materials/        # PBR Principled BSDF material definitions & presets
├── models/           # Master .blend files for Chicken, Eggs, Carton, Farm
├── renders/          # Verification renders & orthographic preview captures
├── scenes/           # Studio lighting setups and staging environments
├── scripts/          # Automation scripts (Blender Python API / bpy)
│   └── create_assets.py  # Master script building all 3D assets & animations
└── textures/         # Texture maps (Normal, Roughness, Albedo, AO)
```

---

## Automated Asset Generation Pipeline

All 3D assets are procedurally generated, textured, rigged, animated, saved to master `.blend` files, rendered to high-resolution PNG verification images, and exported to production-ready binary `.glb` files using Blender 5.2.3 LTS.

### Execution Command

```powershell
& "C:\Program Files\Blender Foundation\Blender 5.2\blender.exe" -b -P blender/scripts/create_assets.py
```

---

## Generated Master Files, Exports & Verification Renders

| Asset Name | Master Blend File | Web-Optimized GLB Export | Verification Render | Actions & Animations |
| :--- | :--- | :--- | :--- | :--- |
| **Chicken Character** | `blender/models/chicken.blend` (298 KB) | `frontend/public/models/chicken.glb` (421 KB) | `blender/renders/chicken_render.png` | `Chicken_Idle` (squash & stretch, head tilt, wing twitch) |
| **Single White Egg** | `blender/models/egg-white.blend` (146 KB) | `frontend/public/models/egg-white.glb` (73 KB) | — | `Egg_Float` (smooth bobbing & continuous Y rotation) |
| **Single Brown Egg** | `blender/models/egg-brown.blend` (146 KB) | `frontend/public/models/egg-brown.glb` (73 KB) | — | `Egg_Float` (smooth bobbing & continuous Y rotation) |
| **Egg Collection (5 Eggs)**| `blender/models/eggs.blend` (180 KB) | `frontend/public/models/egg-collection.glb` (353 KB)| `blender/renders/eggs_render.png` | Organic nest cluster arrangement |
| **Egg Carton (Open + 10 Eggs)** | `blender/models/carton.blend` (182 KB) | `frontend/public/models/egg-carton.glb` (293 KB) | `blender/renders/carton_render.png` | `Carton_Open` (0° to 105° lid hinge opening) |
| **Egg Carton (Closed Sealed)** | `blender/models/carton.blend` | `frontend/public/models/egg-carton-closed.glb` (291 KB) | — | Static sealed with tamper-evident band |
| **Farm Pasture & Barn Coop** | `blender/models/farm.blend` (155 KB) | `frontend/public/models/farm-scene.glb` (139 KB) | `blender/renders/farm_render.png` | Pasture diorama with barn, trees, fence & nest |

---

## Interactive Frontend Integration

The exported `.glb` models are loaded directly into React Three Fiber scenes with `@react-three/drei`'s `useGLTF` and `useAnimations`, complete with Suspense fallback to procedural geometry:

1. **Hero Section (`Hero3DScene.tsx`)**:
   - `BlenderChickenModel`: Renders `chicken.glb` with cursor look-at tracking and authentic `"Bok bok! ✦"` speech bubble.
   - `BlenderFloatingEgg`: Renders floating `egg-brown.glb` and `egg-white.glb`.
2. **Comparison Section (`EggComparison3DScene.tsx`)**:
   - Compares 3D Brown and White egg models side-by-side with 3D studio lighting.
3. **Packaging Section (`Carton3DScene.tsx`)**:
   - Interactive 3D 10-cup recycled kraft pulp carton viewer with lid open/close control and 360° rotation.
4. **Farm Story Section (`Farm3DScene.tsx`)**:
   - Interactive 3D pasture diorama modal featuring `farm-scene.glb` with barn coop, pasture, trees, and straw nest.
