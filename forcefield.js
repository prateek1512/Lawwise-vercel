/* ====================================================
   ForceField — Vanilla p5.js Particle System
   Ported from React ForceFieldBackground component
   Adapted for Modern Obsidian design system
   ==================================================== */

function initForceField(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const config = {
        hue: options.hue ?? 210,
        saturation: options.saturation ?? 15,      // Low saturation for silver
        spacing: options.spacing ?? 12,
        density: options.density ?? 1.8,
        minStroke: options.minStroke ?? 1.5,
        maxStroke: options.maxStroke ?? 4,
        forceStrength: options.forceStrength ?? 12,
        magnifierRadius: options.magnifierRadius ?? 180,
        friction: options.friction ?? 0.88,
        restoreSpeed: options.restoreSpeed ?? 0.04,
        noiseScale: options.noiseScale ?? 0.008,
        particleOpacity: options.particleOpacity ?? 0.6,
    };

    const sketch = (p) => {
        let points = [];
        let palette = [];
        let magnifierX = 0;
        let magnifierY = 0;
        const magnifierInertia = 0.08;
        let isMouseInCanvas = false;

        p.setup = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            const canvas = p.createCanvas(w, h);
            canvas.style('display', 'block');

            magnifierX = w / 2;
            magnifierY = h / 2;

            generatePalette();
            generatePoints();
        };

        p.windowResized = () => {
            const w = container.clientWidth;
            const h = container.clientHeight;
            if (w > 0 && h > 0) {
                p.resizeCanvas(w, h);
                generatePoints();
            }
        };

        function generatePalette() {
            palette = [];
            p.push();
            p.colorMode(p.HSL);
            // Create a silver-white gradient palette
            for (let i = 0; i < 10; i++) {
                const lightness = p.map(i, 0, 9, 90, 25);
                const sat = p.map(i, 0, 9, config.saturation * 0.3, config.saturation);
                palette.push(p.color(config.hue, sat, lightness));
            }
            p.pop();
        }

        function generatePoints() {
            points = [];
            const safeSpacing = Math.max(4, config.spacing);
            const w = p.width;
            const h = p.height;

            for (let y = 0; y < h; y += safeSpacing) {
                for (let x = 0; x < w; x += safeSpacing) {
                    // Use noise to create organic distribution
                    const noiseVal = p.noise(x * config.noiseScale, y * config.noiseScale);

                    // Skip some particles for organic feel
                    if (p.random() > config.density * noiseVal) continue;

                    // Slight position jitter from noise
                    const jitterX = (p.noise(x * 0.01, y * 0.01) - 0.5) * safeSpacing * 0.6;
                    const jitterY = (p.noise(x * 0.01 + 100, y * 0.01 + 100) - 0.5) * safeSpacing * 0.6;
                    const px = x + jitterX;
                    const py = y + jitterY;

                    // Brightness from noise — drives particle size and color
                    const brightness = noiseVal * 255;

                    points.push({
                        pos: p.createVector(px, py),
                        originalPos: p.createVector(px, py),
                        vel: p.createVector(0, 0),
                        brightness: brightness,
                        // Assign palette index based on noise
                        colorIndex: Math.floor(p.map(brightness, 0, 255, 0, palette.length - 1)),
                        baseSize: p.map(brightness, 0, 255, config.minStroke, config.maxStroke),
                    });
                }
            }
        }

        p.mouseMoved = () => {
            isMouseInCanvas = (
                p.mouseX >= 0 && p.mouseX <= p.width &&
                p.mouseY >= 0 && p.mouseY <= p.height
            );
        };

        p.mouseEntered = () => { isMouseInCanvas = true; };
        p.mouseExited = () => { isMouseInCanvas = false; };

        p.draw = () => {
            p.background(8, 8, 8);

            // Smooth magnifier tracking
            if (isMouseInCanvas) {
                magnifierX = p.lerp(magnifierX, p.mouseX, magnifierInertia);
                magnifierY = p.lerp(magnifierY, p.mouseY, magnifierInertia);
            }

            // Physics pass
            for (let pt of points) {
                if (isMouseInCanvas) {
                    // Repulsion force
                    const dx = pt.pos.x - magnifierX;
                    const dy = pt.pos.y - magnifierY;
                    const distSq = dx * dx + dy * dy;
                    const dist = Math.sqrt(distSq);

                    if (dist < config.magnifierRadius) {
                        const force = config.forceStrength / Math.max(1, dist);
                        pt.vel.x += (dx / dist) * force;
                        pt.vel.y += (dy / dist) * force;
                    }
                }

                // Friction
                pt.vel.x *= config.friction;
                pt.vel.y *= config.friction;

                // Restore spring to original
                pt.vel.x += (pt.originalPos.x - pt.pos.x) * config.restoreSpeed;
                pt.vel.y += (pt.originalPos.y - pt.pos.y) * config.restoreSpeed;

                // Integrate
                pt.pos.x += pt.vel.x;
                pt.pos.y += pt.vel.y;
            }

            // Render pass
            p.noFill();
            for (let pt of points) {
                const x = pt.pos.x;
                const y = pt.pos.y;
                const dist = isMouseInCanvas
                    ? p.dist(x, y, magnifierX, magnifierY)
                    : config.magnifierRadius + 1;

                let strokeSize = pt.baseSize;

                // Enlarge near cursor
                if (dist < config.magnifierRadius) {
                    const factor = p.map(dist, 0, config.magnifierRadius, 2.5, 1);
                    strokeSize *= factor;
                }

                // Fade at edges of canvas for soft vignette
                const edgeFadeX = Math.min(x, p.width - x) / 100;
                const edgeFadeY = Math.min(y, p.height - y) / 80;
                const edgeFade = Math.min(1, edgeFadeX, edgeFadeY);

                const idx = p.constrain(pt.colorIndex, 0, palette.length - 1);
                if (palette[idx]) {
                    const c = palette[idx];
                    // Apply opacity and edge fade
                    const alpha = config.particleOpacity * edgeFade * 255;
                    p.stroke(p.red(c), p.green(c), p.blue(c), alpha);
                    p.strokeWeight(strokeSize);
                    p.point(x, y);
                }
            }
        };
    };

    // Initialize p5 in instance mode
    return new p5(sketch, container);
}
