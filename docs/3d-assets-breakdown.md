# GoodEggs — 3D Assets Breakdown & Specifications

This document outlines the 3D models, geometry structures, material shaders, and animation actions required for the GoodEggs 3D e-commerce experience.

---

## 1. 3D Character: Stylized Hen (`chicken.glb`)

### Geometric Structure
- **Body**: Plump, organic ellipsoid mesh with subdivision surface (`subsurf 2`), tapered slightly at rear and broad at base.
- **Belly Patch**: Soft frontal patch with lighter creamy tone (`#FFF7D6`).
- **Head**: Spherical head mesh smoothly integrated onto body neck with curious tilt rig.
- **Crown Comb**: 3 distinct organic lobes on head apex with gradient deep red to warm ruby (`#E2503F` → `#C22F24`).
- **Beak**: Upper and lower golden-orange cone segments with bevelled edge and realistic mouth line (`#F6A51E`).
- **Wattle**: Dual fleshy red tear-drop lobes hanging under the lower beak.
- **Cheeks**: Subtle pink blush circles (`#FF9398`) with 0.65 opacity.
- **Eyes**: Spherical glossy black sclera/pupils with white specular highlights and blink lid controllers.
- **Wings**: Left and right stylized curved wing plates with 4 scalloped feather ridges.
- **Tail Feathers**: Fan arrangement of 3 upward-arching tail feathers with dark amber gradient (`#9C6A3D` → `#6F4526`).
- **Legs & Feet**: Dual orange cylinder legs with knee bend and 3 forward-pointing toes.

### Rigging & Animations
| Action Name | Duration | Description |
|---|---|---|
| `Chicken_Idle` | 2.4s (Loop) | Gentle vertical bobbing, breathing torso scale, subtle wing flutter, head curiosity tilt. |
| `Chicken_Walk` | 1.9s | Alternating leg steps with foot arc, torso bob, synchronized footstep timing. |
| `Chicken_Squat` | 0.8s | Lowering torso over nest with tail-feather elevation preparing to lay egg. |
| `Chicken_Blink` | 0.2s | Eyelid scale down and snap open every 4.4 seconds. |
| `Chicken_Bounce` | 0.5s | Playful landing squish and stretch upon settling in nest. |

---

## 2. 3D Eggs (`egg-brown.glb`, `egg-white.glb`, `egg-collection.glb`)

### Geometry
- **Parametric Egg Curve**: Spherical base modified via parametric vertex displacement:
  - Top hemisphere ($y > 0$) tapered inward by factor of $0.24$.
  - Bottom hemisphere ($y < 0$) broadened outward by factor of $0.06$.
  - Height scaled to $1.35 \times$ radius.
  - Polycount: 1,840 vertices (smooth normal interpolation).

### Materials (Principled BSDF)
- **Brown Shell**:
  - Base Color: `#A66B3F` / `#B0713F` with subtle procedural noise speckles (`#7C4820`).
  - Roughness: `0.52`.
  - Subsurface Scattering (SSS): `0.08` with warm amber tint.
  - Clearcoat: `0.04`.
- **White Shell**:
  - Base Color: `#FFFFFF` / `#F4EFE4`.
  - Roughness: `0.38`.
  - SSS: `0.10` with soft creamy tint.
  - Clearcoat: `0.06`.

### Animations
| Action Name | Description |
|---|---|
| `Egg_Float` | Gentle vertical oscillation ($\pm 12\text{px}$) with slow $y$-axis presentation rotation. |
| `Egg_Fall` | Parabolic gravity drop from hen into nest with damping bounce physics. |
| `Egg_Compare` | Synchronized side-by-side presentation orbit with slight opposing tilt. |

---

## 3. 3D Egg Carton Packaging (`egg-carton.glb` & `egg-carton-closed.glb`)

### Geometry
- **Carton Tray**: Molded paper-pulp tray with 6, 10, or 12 individual conical egg cups and center stabilization cones.
- **Hinged Lid**: Top cover with recessed branding panel and perimeter clasp flanges.
- **Wall Thickness**: Solidified geometry ($1.8\text{mm}$ physical scale equivalent).
- **Hinge Pivot**: Dedicated armature bone at rear junction for independent lid opening/closing.

### Materials
- **Molded Paper Pulp**:
  - Base Color: `#CDB896` / `#D4C5A9`.
  - Roughness: `0.85` (matte paper texture).
  - Normal Map: Fine fiber bump texture.
- **Brand Sticker**:
  - Tamper-evident sunrise batch seal with high-resolution GoodEggs vector graphic.

### Animations
| Action Name | Description |
|---|---|
| `Carton_Open` | Lid rotates from $0^\circ$ (closed) to $115^\circ$ revealing nested eggs inside. |
| `Carton_Close` | Lid smoothly snaps shut over base clasp with subtle spring recoil. |
| `Carton_Rotate` | $360^\circ$ turntable presentation for 3D inspection. |

---

## 4. Stylized Farm Scene Environment (`farm-scene.glb`)

### Assets
- **Hen House / Coop**: Clean timber barn with gable roof, timber cladding, open roosting window, and ramp.
- **Pasture Ground**: Gentle rolling grassy mound with warm spring green vertex colors.
- **Wooden Post Fence**: Stylized rustic timber railings bounding the foraging yard.
- **Fruit Trees**: Low-poly stylized round-canopy shade trees.
- **Straw Nest**: Circular woven straw nest cradle positioned beneath the hero chicken.

