import React, { useRef, useEffect } from 'react';

interface ChickenMotionCanvasProps {
  onReady?: () => void;
  className?: string;
}

// Deterministic natural egg speckles for brown egg
const SPECKLES: [number, number, number][] = (() => {
  let seed = 19;
  const list: [number, number, number][] = [];
  for (let i = 0; i < 18; i++) {
    seed = (seed * 16807) % 2147483647;
    const x = (seed % 1000) / 1000;
    seed = (seed * 16807) % 2147483647;
    const y = (seed % 1000) / 1000;
    seed = (seed * 16807) % 2147483647;
    list.push([x, y, 0.22 + (seed % 100) / 450]);
  }
  return list;
})();

export const ChickenMotionCanvas: React.FC<ChickenMotionCanvasProps> = ({ onReady, className = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let animId = 0;
    let isDestroyed = false;
    let isReadyTriggered = false;
    let elapsedTime = 0;
    let lastTime = performance.now();
    let isVisible = true;
    let isSkipped = prefersReducedMotion;

    // Interactive cursor state
    let mouseX = -9999;
    let mouseY = -9999;
    let isHoveringCanvas = false;

    // Fast, delightful video timing matching reference video (WhatsApp_Video 0:00 - 0:04)
    // 0.0s - 1.6s: Chicken walks happily in from left to nest
    // 1.6s - 2.1s: Chicken squats on nest, tail lifts
    // 1.85s: Brown Egg & White Egg pop out with elastic bounce in front of chicken
    // 2.2s: "Bok bok! ✨" speech bubble pops up and stays permanently
    // 2.5s: onReady triggers, revealing Hero UI
    const T = {
      walkStart: 0.0,
      walkEnd: 1.6,
      squatStart: 1.6,
      eggPop: 1.85,
      squatEnd: 2.2,
      bubble: 2.2,
      reveal: 2.5,
    };

    interface EggState {
      id: 'brown' | 'white';
      color: 'brown' | 'white';
      mode: 'hidden' | 'emerge' | 'fall' | 'rest';
      baseX: number;
      x: number;
      y: number;
      vy: number;
      bounces: number;
      scale: number;
      wobble: number;
      hoverScale: number;
    }

    const eggs: EggState[] = [
      {
        id: 'brown',
        color: 'brown',
        mode: 'hidden',
        baseX: 0,
        x: 0,
        y: 0,
        vy: 0,
        bounces: 0,
        scale: 0,
        wobble: 0,
        hoverScale: 1,
      },
      {
        id: 'white',
        color: 'white',
        mode: 'hidden',
        baseX: 0,
        x: 0,
        y: 0,
        vy: 0,
        bounces: 0,
        scale: 0,
        wobble: 0,
        hoverScale: 1,
      },
    ];

    const clamp = (val: number, min: number, max: number) => Math.min(max, Math.max(min, val));
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const elasticEase = (t: number) => 1 + 2.7 * Math.pow(t - 1, 3) + 1.7 * Math.pow(t - 1, 2);

    function resize() {
      if (!canvas || !ctx) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);

    function notifyReady() {
      if (!isReadyTriggered && !isDestroyed) {
        isReadyTriggered = true;
        onReadyRef.current?.();
      }
    }

    // Pointer move listener for cursor tracking
    const handlePointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isHoveringCanvas = true;
    };

    const handlePointerLeave = () => {
      isHoveringCanvas = false;
      mouseX = -9999;
      mouseY = -9999;
    };

    // Draw realistic egg path with pointy apex and broad base
    function drawEggPath(c: CanvasRenderingContext2D, rx: number, ry: number) {
      c.beginPath();
      c.moveTo(0, -ry);
      c.bezierCurveTo(rx * 0.92, -ry, rx, -ry * 0.42, rx, 0.05 * ry);
      c.bezierCurveTo(rx, ry * 0.72, rx * 0.62, ry, 0, ry);
      c.bezierCurveTo(-rx * 0.62, ry, -rx, ry * 0.72, -rx, 0.05 * ry);
      c.bezierCurveTo(-rx, -ry * 0.42, -rx * 0.92, -ry, 0, -ry);
      c.closePath();
    }

    // Render an egg with gradients, speckles, sheen, and interactive cursor tilt
    function drawEgg(
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      unit: number,
      color: 'brown' | 'white',
      scale: number,
      tilt = 0
    ) {
      if (scale <= 0.01) return;
      // Prominent egg size matching frame 004
      const rx = 5.6 * unit * scale;
      const ry = 7.0 * unit * scale;

      c.save();
      c.translate(x, y);
      if (tilt !== 0) {
        c.rotate(tilt);
      }

      // Egg soft contact shadow
      c.save();
      c.globalAlpha = 0.24 * scale;
      c.fillStyle = '#5c3a1e';
      c.beginPath();
      c.ellipse(0, 0.6 * unit, rx * 1.05, ry * 0.22, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();

      drawEggPath(c, rx, ry);
      const shellGrad = c.createRadialGradient(-rx * 0.38, -ry * 0.48, rx * 0.12, 0, 0, ry * 1.25);
      if (color === 'brown') {
        shellGrad.addColorStop(0, '#c78453');
        shellGrad.addColorStop(0.5, '#a66436');
        shellGrad.addColorStop(1, '#78401e');
      } else {
        shellGrad.addColorStop(0, '#ffffff');
        shellGrad.addColorStop(0.55, '#f8f4ec');
        shellGrad.addColorStop(1, '#ddd4c3');
      }
      c.fillStyle = shellGrad;
      c.fill();

      // Natural speckles on brown egg
      if (color === 'brown') {
        c.save();
        drawEggPath(c, rx, ry);
        c.clip();
        c.fillStyle = '#653112';
        for (const [sx, sy, sr] of SPECKLES) {
          c.globalAlpha = 0.32;
          c.beginPath();
          c.ellipse(
            (sx - 0.5) * 1.6 * rx,
            (sy - 0.45) * 1.7 * ry,
            sr * unit * 0.32,
            sr * unit * 0.24,
            sx * 3,
            0,
            Math.PI * 2
          );
          c.fill();
        }
        c.restore();
      }

      // Specular sheen highlight
      c.save();
      drawEggPath(c, rx, ry);
      c.clip();
      const sheen = c.createRadialGradient(-rx * 0.35, -ry * 0.55, 0, -rx * 0.35, -ry * 0.55, rx * 1.1);
      sheen.addColorStop(0, 'rgba(255,255,255,0.65)');
      sheen.addColorStop(0.45, 'rgba(255,255,255,0.1)');
      sheen.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = sheen;
      c.fillRect(-rx, -ry, rx * 2, ry * 2);
      c.restore();

      c.restore();
    }

    // Straw Nest on the ground
    function drawStrawNest(c: CanvasRenderingContext2D, x: number, y: number, unit: number, progress: number) {
      if (progress <= 0.01) return;
      c.save();
      c.globalAlpha = progress;
      c.lineCap = 'round';

      const straws: [number, number, number, number, string, number][] = [
        [-8.5 * unit, -0.4 * unit, 11 * unit, -0.06, '#a4713d', 0.6 * unit],
        [8 * unit, 0.2 * unit, 10 * unit, 0.05, '#8a5a33', 0.55 * unit],
        [-3.5 * unit, 1 * unit, 12 * unit, -0.03, '#8a5a33', 0.65 * unit],
        [5 * unit, -1 * unit, 9 * unit, 0.08, '#a4713d', 0.5 * unit],
        [0, 2.2 * unit, 13 * unit, 0.02, '#a9863f', 0.5 * unit],
        [-11 * unit, 0.8 * unit, 6 * unit, 0.15, '#8a5a33', 0.45 * unit],
        [12 * unit, 1.2 * unit, 6 * unit, -0.12, '#8a5a33', 0.45 * unit],
        [2 * unit, 3 * unit, 8.5 * unit, -0.04, '#c9a44a', 0.45 * unit],
      ];

      for (const [ox, oy, radius, rot, color, lw] of straws) {
        c.save();
        c.translate(x + ox, y + oy);
        c.rotate(rot);
        c.strokeStyle = color;
        c.lineWidth = lw;
        c.setLineDash([radius * 0.9, radius * 0.28]);
        c.beginPath();
        c.ellipse(0, 0, radius, Math.max(1 * unit, radius * 0.15), 0, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }

      c.restore();
    }

    // Chicken Leg with foot and toes
    function drawChickenLeg(
      c: CanvasRenderingContext2D,
      hx: number,
      hy: number,
      fx: number,
      fy: number,
      unit: number
    ) {
      c.strokeStyle = '#e8912b';
      c.lineWidth = 1.0 * unit;
      c.lineCap = 'round';
      const midX = (hx + fx) / 2 + 0.9 * unit;
      const midY = (hy + fy) / 2 - 0.4 * unit;
      c.beginPath();
      c.moveTo(hx, hy);
      c.quadraticCurveTo(midX, midY, fx, fy);
      c.stroke();

      // Claws / toes
      c.lineWidth = 0.75 * unit;
      c.beginPath();
      c.moveTo(fx - 1.5 * unit, fy + 0.15 * unit);
      c.lineTo(fx + 1.8 * unit, fy + 0.15 * unit);
      c.moveTo(fx + 0.3 * unit, fy + 0.15 * unit);
      c.lineTo(fx + 1.0 * unit, fy - 1.0 * unit);
      c.stroke();
    }

    // Tail Feather with curvature
    function drawTailFeather(
      c: CanvasRenderingContext2D,
      x: number,
      y: number,
      angle: number,
      len: number,
      thick: number,
      _unit: number
    ) {
      const tipX = x + Math.cos(angle) * len;
      const tipY = y + Math.sin(angle) * len;
      const perpX = Math.cos(angle + Math.PI / 2) * thick;
      const perpY = Math.sin(angle + Math.PI / 2) * thick;

      const grad = c.createLinearGradient(x, y, tipX, tipY);
      grad.addColorStop(0, '#9c6a3d');
      grad.addColorStop(1, '#6f4526');
      c.fillStyle = grad;

      c.beginPath();
      c.moveTo(x, y);
      c.quadraticCurveTo((x + tipX) / 2 + perpX, (y + tipY) / 2 + perpY, tipX, tipY);
      c.quadraticCurveTo((x + tipX) / 2 - perpX, (y + tipY) / 2 - perpY, x, y);
      c.closePath();
      c.fill();
    }

    // Complete Chicken Character with cursor tracking
    function drawChicken(
      c: CanvasRenderingContext2D,
      state: {
        x: number;
        legPhase: number;
        dip: number;
        tailLift: number;
        blink: boolean;
        lookX: number;
        lookY: number;
      },
      groundY: number,
      unit: number
    ) {
      const { x, legPhase, dip, tailLift, blink, lookX, lookY } = state;
      const bodyY = groundY - 14.6 * unit + dip;
      const bodyRadiusX = 13.8 * unit;
      const bodyRadiusY = 11.8 * unit - dip * 0.35;
      const headX = x + 9.8 * unit + lookX * 1.5 * unit;
      const headY = groundY - 26.5 * unit + dip * 0.85 + lookY * 1.2 * unit;
      const headRadius = 7.0 * unit;
      const legStartY = groundY - 5.2 * unit + dip * 0.4;

      // 1. Legs with alternating walking footsteps
      const legSin1 = Math.sin(legPhase);
      const legSin2 = Math.sin(legPhase + Math.PI);
      drawChickenLeg(
        c,
        x - 4 * unit,
        legStartY,
        x - 4 * unit + legSin1 * 2.8 * unit,
        groundY - Math.max(0, legSin1) * 1.8 * unit,
        unit
      );
      drawChickenLeg(
        c,
        x + 3.6 * unit,
        legStartY,
        x + 3.6 * unit + legSin2 * 2.8 * unit,
        groundY - Math.max(0, legSin2) * 1.8 * unit,
        unit
      );

      // 2. Fan Tail Feathers
      const tailX = x - 11.5 * unit;
      const tailY = bodyY - 1.5 * unit;
      drawTailFeather(
        c,
        tailX,
        tailY,
        -Math.PI * 0.62 + tailLift * 0.16,
        13 * unit * (1 + tailLift * 0.08),
        3.8 * unit,
        unit
      );
      drawTailFeather(
        c,
        tailX - 1 * unit,
        tailY + 0.6 * unit,
        -Math.PI * 0.42 + tailLift * 0.2,
        14.5 * unit * (1 + tailLift * 0.1),
        4.0 * unit,
        unit
      );
      drawTailFeather(
        c,
        tailX + 0.5 * unit,
        tailY + 1.2 * unit,
        -Math.PI * 0.82 + tailLift * 0.12,
        11 * unit,
        3.4 * unit,
        unit
      );

      // 3. Main Plump Yellow Body
      const bodyGrad = c.createRadialGradient(
        x - 4.5 * unit,
        bodyY - 5 * unit,
        2 * unit,
        x,
        bodyY + 2 * unit,
        bodyRadiusX * 1.5
      );
      bodyGrad.addColorStop(0, '#ffd95c');
      bodyGrad.addColorStop(0.55, '#fbbd35');
      bodyGrad.addColorStop(1, '#ef9f1c');
      c.fillStyle = bodyGrad;
      c.beginPath();
      c.ellipse(x, bodyY, bodyRadiusX, bodyRadiusY, 0, 0, Math.PI * 2);
      c.fill();

      // 4. Wing with subtle feathered scallop tips
      const wingY = bodyY + 3.4 * unit;
      const wingX = x - 2.2 * unit;
      const wingGrad = c.createRadialGradient(
        wingX - 2 * unit,
        wingY - 2 * unit,
        1 * unit,
        wingX,
        wingY,
        8.5 * unit
      );
      wingGrad.addColorStop(0, '#f6a724');
      wingGrad.addColorStop(1, '#e08c14');
      c.fillStyle = wingGrad;
      c.beginPath();
      c.ellipse(wingX, wingY, 7.6 * unit, 5.4 * unit, -0.12, 0, Math.PI * 2);
      c.fill();

      for (const [fx, fy] of [
        [-4.5, 2.6],
        [-1.3, 3.5],
        [2.1, 3.0],
        [4.9, 2.0],
      ]) {
        c.beginPath();
        c.arc(wingX + fx * unit, wingY + fy * unit, 2.0 * unit, 0, Math.PI * 2);
        c.fill();
      }

      // 5. Head with dynamic cursor tracking
      const headGrad = c.createRadialGradient(
        headX - 2 * unit,
        headY - 2.5 * unit,
        1 * unit,
        headX,
        headY,
        headRadius * 1.4
      );
      headGrad.addColorStop(0, '#ffd95c');
      headGrad.addColorStop(0.6, '#fbbd35');
      headGrad.addColorStop(1, '#f2a91f');
      c.fillStyle = headGrad;
      c.beginPath();
      c.arc(headX, headY, headRadius, 0, Math.PI * 2);
      c.fill();

      // 6. Crown Comb (3 red lobes)
      const combGrad = c.createLinearGradient(headX, headY - headRadius - 3 * unit, headX, headY - headRadius);
      combGrad.addColorStop(0, '#e2503f');
      combGrad.addColorStop(1, '#c22f24');
      c.fillStyle = combGrad;
      for (const [cx, cr] of [
        [-2.7, 1.8],
        [0.1, 2.2],
        [2.8, 1.7],
      ]) {
        c.beginPath();
        c.arc(headX + cx * unit, headY - headRadius + 0.4 * unit, cr * unit, 0, Math.PI * 2);
        c.fill();
      }

      // 7. Beak (Golden Upper and Lower Jaw)
      c.fillStyle = '#f6a51e';
      c.beginPath();
      c.moveTo(headX + headRadius * 0.82, headY - 1.4 * unit);
      c.lineTo(headX + headRadius + 3.6 * unit, headY + 0.1 * unit);
      c.lineTo(headX + headRadius * 0.86, headY + 0.7 * unit);
      c.closePath();
      c.fill();

      c.fillStyle = '#dd8a10';
      c.beginPath();
      c.moveTo(headX + headRadius * 0.82, headY + 0.7 * unit);
      c.lineTo(headX + headRadius + 2.2 * unit, headY + 0.85 * unit);
      c.lineTo(headX + headRadius * 0.86, headY + 1.5 * unit);
      c.closePath();
      c.fill();

      // Red Wattle
      c.fillStyle = '#cf3a2c';
      c.beginPath();
      c.ellipse(headX + headRadius * 0.62, headY + 3.6 * unit, 1.6 * unit, 2.2 * unit, 0.15, 0, Math.PI * 2);
      c.fill();

      // 8. Eye with blink cycle and cursor gaze
      const eyeBaseX = headX + 2.3 * unit;
      const eyeBaseY = headY - 1.5 * unit;
      const pupilShiftX = clamp(lookX * 0.7, -0.6, 0.6) * unit;
      const pupilShiftY = clamp(lookY * 0.7, -0.6, 0.6) * unit;

      if (blink) {
        c.strokeStyle = '#3a2415';
        c.lineWidth = 0.5 * unit;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(headX + 1.4 * unit, headY - 1.6 * unit);
        c.lineTo(headX + 3.2 * unit, headY - 1.4 * unit);
        c.stroke();
      } else {
        c.fillStyle = '#3a2415';
        c.beginPath();
        c.arc(eyeBaseX + pupilShiftX, eyeBaseY + pupilShiftY, 1.1 * unit, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.arc(eyeBaseX + pupilShiftX - 0.35 * unit, eyeBaseY + pupilShiftY - 0.35 * unit, 0.34 * unit, 0, Math.PI * 2);
        c.fill();
      }
    }

    // Permanent "Bok bok! ✨" Speech Bubble matching frame 004
    function drawSpeechBubble(
      c: CanvasRenderingContext2D,
      chickenX: number,
      groundY: number,
      unit: number,
      time: number
    ) {
      const delta = time - T.bubble;
      if (delta < 0) return;

      const popScale = delta < 0.25 ? elasticEase(delta / 0.25) : 1;
      const headX = chickenX + 9.8 * unit;
      const headY = groundY - 26.5 * unit;
      const bubbleX = headX + 14 * unit;
      const bubbleY = headY - 11 * unit;

      c.save();
      c.translate(bubbleX, bubbleY);
      c.scale(popScale, popScale);

      const bw = 17 * unit;
      const bh = 8.5 * unit;

      c.fillStyle = '#fffdf4';
      c.strokeStyle = '#e8ddc4';
      c.lineWidth = 0.35 * unit;
      c.beginPath();
      c.roundRect(-bw / 2, -bh / 2, bw, bh, 2.6 * unit);
      c.fill();
      c.stroke();

      // Tail arrow pointing toward head
      c.fillStyle = '#fffdf4';
      c.beginPath();
      c.moveTo(-bw / 2 + 1.5 * unit, bh / 2 - 0.4 * unit);
      c.lineTo(-bw / 2 - 2.6 * unit, bh / 2 + 3.4 * unit);
      c.lineTo(-bw / 2 + 4.6 * unit, bh / 2 - 0.2 * unit);
      c.closePath();
      c.fill();

      // Cursive text
      c.fillStyle = '#4a2c14';
      c.font = `700 ${3.3 * unit}px Caveat, cursive`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText('Bok bok!', -1 * unit, -0.2 * unit);

      // Cute golden sparkle star
      c.fillStyle = '#E8912B';
      c.font = `${2.4 * unit}px sans-serif`;
      c.fillText('✦', 6 * unit, -1.2 * unit);

      c.restore();
    }

    // Main animation frame loop
    function tick(timestamp: number) {
      if (isDestroyed) return;
      const dt = clamp((timestamp - lastTime) / 1000, 0, 0.05);
      lastTime = timestamp;

      if (isVisible) {
        elapsedTime += dt;
      }

      const t = elapsedTime;
      const rect = canvas!.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const scaleUnit = Math.min(h / 78, w / 56);
      const isMobile = w < 760;
      const targetX = isMobile ? w * 0.52 : w * 0.65;
      const groundY = isMobile ? h * 0.74 : h * 0.68;

      // 1. Walk in and Nest Positioning
      const startX = -22 * scaleUnit;
      const nestStopX = targetX;

      // Set base positions for the two eggs floating in front of chicken
      // Brown Egg (left) & White Egg (right) matching frame 004
      eggs[0].baseX = nestStopX - 6.5 * scaleUnit; // Brown egg on left
      eggs[1].baseX = nestStopX + 3.8 * scaleUnit; // White egg on right

      let chickenX = startX;
      let legPhase = 0;
      let bodyDip = 0;
      let tailLift = 0;

      if (isSkipped || t >= T.walkEnd + 0.6) {
        chickenX = nestStopX;
        const idleTime = t - T.squatEnd;
        bodyDip = Math.sin(idleTime * 2.2) * 0.4 * scaleUnit;
      } else if (t < T.walkEnd) {
        // Walk in from left
        const p = clamp((t - T.walkStart) / (T.walkEnd - T.walkStart), 0, 1);
        chickenX = startX + (nestStopX - startX) * easeOutCubic(p);
        legPhase = t * 12;
        bodyDip = Math.abs(Math.sin(t * 12)) * 0.8 * scaleUnit;
      } else if (t < T.squatEnd) {
        // Squat on nest to present eggs
        chickenX = nestStopX;
        const squatProg =
          clamp((t - T.squatStart) / 0.3, 0, 1) * clamp(1 - (t - T.eggPop) / 0.35, 0, 1);
        bodyDip = squatProg * 2.5 * scaleUnit;
        tailLift = squatProg * 1.3;
      }

      const isBlinking = t > T.squatEnd + 0.5 && t % 4.2 < 0.12;

      // Cursor gaze calculations for chicken head & eye
      let lookX = 0;
      let lookY = 0;
      if (isHoveringCanvas && mouseX > -1000) {
        const chickenHeadX = chickenX + 9.8 * scaleUnit;
        const chickenHeadY = groundY - 26.5 * scaleUnit;
        const dx = mouseX - chickenHeadX;
        const dy = mouseY - chickenHeadY;
        const dist = Math.hypot(dx, dy);
        if (dist > 1) {
          lookX = clamp(dx / 120, -1, 1);
          lookY = clamp(dy / 100, -1, 1);
        }
      }

      // 2. Process Both Eggs Physics (Pop out & Settle in front)
      for (const egg of eggs) {
        if (isSkipped) {
          egg.mode = 'rest';
          egg.scale = 1;
          egg.x = egg.baseX;
          egg.y = groundY - 5.0 * scaleUnit;
          continue;
        }

        if (egg.mode === 'hidden' && t >= T.eggPop) {
          egg.mode = 'emerge';
          egg.scale = 0;
          egg.x = egg.baseX;
          egg.y = groundY - 14 * scaleUnit;
          egg.vy = 2.4 * scaleUnit;
        }

        if (egg.mode === 'emerge') {
          const emergeProg = clamp((t - T.eggPop) / 0.3, 0, 1);
          egg.scale = elasticEase(emergeProg);
          if (emergeProg >= 1) {
            egg.mode = 'fall';
          }
        } else if (egg.mode === 'fall') {
          egg.vy += 32 * scaleUnit * dt;
          egg.y += egg.vy * dt;
          if (egg.y >= groundY - 5.0 * scaleUnit) {
            egg.y = groundY - 5.0 * scaleUnit;
            egg.vy = -egg.vy * 0.36; // Bounce damping
            egg.bounces += 1;
            if (egg.bounces >= 3 || Math.abs(egg.vy) < 1.2 * scaleUnit) {
              egg.mode = 'rest';
              egg.y = groundY - 5.0 * scaleUnit;
            }
          }
        }

        if (egg.mode === 'rest') {
          egg.scale = 1;
          // Organic 3D breathing float in front of chicken
          const floatBob = Math.sin(t * 1.8 + (egg.color === 'white' ? 1.4 : 0)) * 0.4 * scaleUnit;
          egg.y = groundY - 5.0 * scaleUnit + floatBob;

          // Interactive cursor reaction: wobble and parallax when mouse moves near
          if (isHoveringCanvas && mouseX > -1000) {
            const dist = Math.hypot(mouseX - egg.baseX, mouseY - (groundY - 5.0 * scaleUnit));
            if (dist < 90 * (scaleUnit / 7)) {
              const tiltTarget = clamp((mouseX - egg.baseX) / 100, -0.28, 0.28);
              egg.wobble += (tiltTarget - egg.wobble) * 0.12;
              egg.hoverScale += (1.12 - egg.hoverScale) * 0.12;
              egg.x += (egg.baseX + (mouseX - egg.baseX) * 0.08 - egg.x) * 0.1;
            } else {
              egg.wobble *= 0.88;
              egg.hoverScale += (1.0 - egg.hoverScale) * 0.1;
              egg.x += (egg.baseX - egg.x) * 0.1;
            }
          } else {
            egg.wobble *= 0.88;
            egg.hoverScale += (1.0 - egg.hoverScale) * 0.1;
            egg.x += (egg.baseX - egg.x) * 0.1;
          }
        }
      }

      // 3. Clear and Render Scene
      ctx!.clearRect(0, 0, w, h);

      // Straw Nest at final resting spot
      const nestProg = isSkipped ? 1 : clamp((t - T.walkStart + 0.3) / 0.8, 0, 1);
      drawStrawNest(ctx!, nestStopX, groundY + 0.6 * scaleUnit, scaleUnit, nestProg);

      // Chicken Character
      drawChicken(
        ctx!,
        { x: chickenX, legPhase, dip: bodyDip, tailLift, blink: isBlinking, lookX, lookY },
        groundY,
        scaleUnit
      );

      // Both Laid Eggs in Front of Chicken (Brown on Left, White on Right)
      // Render Brown egg first, then White egg in front matching frame 004
      const brownEgg = eggs.find((e) => e.color === 'brown')!;
      const whiteEgg = eggs.find((e) => e.color === 'white')!;

      if (brownEgg.mode === 'fall' || brownEgg.mode === 'rest') {
        drawEgg(
          ctx!,
          brownEgg.x,
          brownEgg.y,
          scaleUnit,
          'brown',
          brownEgg.scale * brownEgg.hoverScale,
          brownEgg.wobble
        );
      }

      if (whiteEgg.mode === 'fall' || whiteEgg.mode === 'rest') {
        drawEgg(
          ctx!,
          whiteEgg.x,
          whiteEgg.y,
          scaleUnit,
          'white',
          whiteEgg.scale * whiteEgg.hoverScale,
          whiteEgg.wobble
        );
      }

      // Permanent Speech Bubble "Bok bok! ✨"
      if (!isSkipped) {
        drawSpeechBubble(ctx!, chickenX, groundY, scaleUnit, t);
      }

      if (t >= T.reveal) {
        notifyReady();
      }

      animId = requestAnimationFrame(tick);
    }

    // Font loading check
    const fonts = document.fonts;
    let isStarted = false;
    const startLoop = () => {
      if (isDestroyed || isStarted) return;
      isStarted = true;
      lastTime = performance.now();
      if (isSkipped) {
        elapsedTime = T.reveal;
        for (const egg of eggs) {
          egg.mode = 'rest';
          egg.scale = 1;
          egg.y = 0;
        }
      }
      animId = requestAnimationFrame(tick);
    };

    if (fonts) {
      const fallbackTimeout = window.setTimeout(startLoop, 600);
      fonts
        .load('700 32px Caveat')
        .catch(() => void 0)
        .finally(() => {
          window.clearTimeout(fallbackTimeout);
          startLoop();
        });
    } else {
      startLoop();
    }

    const observer = new IntersectionObserver(
      (entries) => {
        isVisible = entries.some((e) => e.isIntersecting);
        if (isVisible) {
          lastTime = performance.now();
        }
      },
      { threshold: 0.05 }
    );
    observer.observe(canvas);

    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerleave', handlePointerLeave);

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      observer.disconnect();
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 h-full w-full ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'block',
      }}
      aria-label="Animated hen walking in and presenting brown and white eggs"
    />
  );
};
