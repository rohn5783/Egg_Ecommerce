# GoodEggs — Master Animation Timeline & Choreography

This document specifies the coordinated time-based and scroll-based motion choreography across the GoodEggs interactive web experience.

---

## 1. Master Sequence: Hero Entrance & Egg Laying

| Timestamp (s) | Event / Component | Description |
|---|---|---|
| `0.0s – 1.9s` | **Chicken Walk-in** | Hen enters from off-screen left (`x = -28 * scaleUnit`) to nest position with cubic ease-out. Legs alternate with sinusoidal footstep arcs. |
| `1.9s – 2.05s` | **Nest Settle & Idle** | Hen pauses on straw nest. Gentle body breathing and tail stabilization. |
| `2.05s – 3.4s` | **Speech Bubble Popup** | Rounded pill speech bubble scales in with elastic bounce above hen head: `"Bok bok!"` in Caveat font. |
| `2.35s – 2.55s` | **Squat Phase** | Hen lowers body over nest (`dip = +2.2 * scaleUnit`) and elevates tail feathers (`tailLift = 1.0`). |
| `2.55s – 3.0s` | **Egg 1 Emerge & Drop (Brown)** | Brown egg emerges behind body, scales up, and drops under gravity acceleration ($g = 26 \times \text{scaleUnit}/\text{s}^2$), bouncing 3 times with $-0.34$ velocity damping until resting. |
| `3.6s – 4.1s` | **Egg 2 Emerge & Drop (White)** | White egg emerges behind body, drops, and bounces into adjacent nest cup. |
| `4.8s` | **Sequence Complete (`onReady`)** | Full hero content opacity slides to 1.0 (`translate-y-0 opacity-100`). Continuous idle breathing and blink cycle take over. |
| *Anytime* | **Pointer Interaction** | Pointer tap/click on canvas immediately accelerates or skips to the settled state. |

---

## 2. Scroll-Triggered Transitions

### Hero to Egg Comparison Transition
- **Trigger**: Scroll past 15% of viewport height.
- **Divider Motion**: Hand-torn paper wave SVG (`TornDivider`) pins and reveals the soft yellow (`#F5D85E`) section.
- **Camera Movement**: R3F camera tilts down $8^\circ$ and glides toward the comparison eggs.
- **Eyebrow Animation**: Handwritten script `"meet the eggs"` draws its wavy SVG underline (`strokeDashoffset` from $100\%$ to $0\%$).
- **Egg Float**: Brown egg and white egg drift upward in anti-phase oscillation ($\pm 14\text{px}$, periods $5.0\text{s}$ and $5.6\text{s}$).

### Comparison to Pick Your Pack Transition
- **Trigger**: Scroll into Pack Selection section.
- **Divider Motion**: Scalloped paper wave fills into Warm Cream (`#FFFDF9`).
- **Product Cards**: Staggered upward slide (`y: 30px` to `0px`, stagger `0.1s`).
- **Carton Eggs**: Responsive spring reaction when clicking shell toggle:
  - Eggs morph shell color smoothly with CSS transition ($0.35\text{s}$).
  - Egg tapping triggers playful 4-frame rotation wobble (`rotate: [0, -12, 12, 0]`, `scale: [1, 1.25, 0.95, 1]`).

### Pick Your Pack to Packaging Transition
- **Trigger**: Scroll into Packaging Story section.
- **Divider Motion**: Torn wave transitions into Dark Chocolate Bark (`#24120D`).
- **Timeline Progression**: Automatic sequential step activation every $2.8\text{s}$ (cycles 1 → 2 → 3 → 4).
- **3D Carton**:
  - Carton rotates $15^\circ$ toward camera.
  - Lid hinge opens smoothly to $110^\circ$ exposing 10 nested eggs.

### Packaging to Farm Story Transition
- **Trigger**: Scroll into Farm Story section.
- **Divider Motion**: Torn wave transitions into Soft Yellow (`#F5D85E`).
- **Photo Cards**: Dual split photography cards slide in from left and right with subtle parallax depth.
- **Tour Button**: Soft scale pulse hover effect (`scale: 1.05`) with interactive play modal.

