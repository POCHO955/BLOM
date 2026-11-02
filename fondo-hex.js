// ==========================================================================
// fondo-hex.js — Fondo de BLOM
//
// Dibuja en un <canvas> un piso de hexágonos en 3D donde:
//   1) la cámara AVANZA hacia adelante todo el tiempo, y
//   2) algunos hexágonos (no todos) SUBEN como columnas y luego VUELVEN a bajar.
//
// No usa librerías: la perspectiva se calcula a mano (mira la función "project").
// ==========================================================================

(function () {
    "use strict";

    // ----------------------------------------------------------------------
    // AJUSTES — aquí puedes cambiar el comportamiento sin tocar nada más
    // ----------------------------------------------------------------------
    var CONFIG = {
        hexRadius: 0.6,        // tamaño de cada hexágono (más grande = hexágonos más grandes)
        gap: 0.92,             // las columnas son un poquito más chicas que su celda: así se ve la separación
        cameraHeight: 3.4,     // altura de la cámara sobre el piso (debe ser mayor que maxHeight)
        pitchDeg: 13,          // cuánto mira hacia abajo la cámara
        fovDeg: 55,            // campo de visión vertical (más grande = más "gran angular")
        speed: 1.5,            // VELOCIDAD con la que avanza la cámara (más = más rápido)
        sway: 0.35,            // balanceo lateral suave de la cámara (0 = va recto)
        farDistance: 38,       // hasta qué distancia se dibuja (después se desvanece)
        opacity: 0.6,          // qué tan visible es todo el fondo (0 a 1)

        activeFraction: 0.07,  // fracción de hexágonos que "tienen permiso" de subir
        fireChance: 0.65,      // en cada ciclo, probabilidad de que de verdad suba
        riseDuration: 3.4,     // segundos que dura el movimiento completo (sube, aguanta, baja)
        minHeight: 0.3,        // altura mínima que alcanza una columna
        maxHeight: 1.3,        // altura máxima que alcanza una columna

        lineColor: "#c084fc",  // borde neón (violeta)
        glowColor: "#a855f7",  // halo del borde
        accentColor: "#f472b6",// algunas columnas brillan en rosa
        accentChance: 0.3,     // fracción de columnas rosas

        bottomFade: 0.30,      // qué parte de abajo de la pantalla se desvanece
        bottomFadeStrength: 0.6
    };

    // ----------------------------------------------------------------------
    // Utilidades
    // ----------------------------------------------------------------------

    // Número "al azar" pero SIEMPRE el mismo para los mismos (a, b, c).
    // Así cada hexágono tiene su propia personalidad fija sin guardar nada en memoria.
    function hash(a, b, c) {
        var h = Math.imul(a | 0, 374761393) ^ Math.imul(b | 0, 668265263) ^ Math.imul(c | 0, 2246822519);
        h = Math.imul(h ^ (h >>> 13), 1274126177);
        h ^= h >>> 16;
        return (h >>> 0) / 4294967296;
    }

    // Transición suave de 0 a 1 (sin tirones al inicio ni al final)
    function smoothstep(a, b, x) {
        var t = Math.min(1, Math.max(0, (x - a) / (b - a)));
        return t * t * (3 - 2 * t);
    }

    function clamp(x, lo, hi) {
        return Math.min(hi, Math.max(lo, x));
    }

    // Altura de la columna del hexágono (i, j) en el segundo "t".
    // Devuelve 0 casi siempre; solo unos pocos hexágonos suben, cada uno a su ritmo.
    function columnHeight(i, j, t, cfg) {
        // ¿Este hexágono es de los que pueden subir? (solo una fracción pequeña)
        if (hash(i, j, 1) >= cfg.activeFraction) return 0;

        var period = 6 + hash(i, j, 2) * 9;          // cada hexágono repite su ciclo cada 6-15 s
        var u = t + hash(i, j, 3) * period;          // desfase propio: no suben todos a la vez
        var k = Math.floor(u / period);              // número de ciclo
        var local = u - k * period;                  // segundo dentro del ciclo actual

        if (local >= cfg.riseDuration) return 0;     // fuera del momento de subir
        if (hash(i, j, 100 + k) >= cfg.fireChance) return 0; // a veces se salta un ciclo

        // Forma del movimiento: sube suave, aguanta un momento y baja suave
        var s = local / cfg.riseDuration;
        var e;
        if (s < 0.35) e = smoothstep(0, 0.35, s);
        else if (s < 0.55) e = 1;
        else e = 1 - smoothstep(0.55, 1, s);

        // Cada subida llega a una altura distinta
        var amp = cfg.minHeight + (cfg.maxHeight - cfg.minHeight) * hash(i, j, 500 + k);
        return amp * e;
    }

    // ----------------------------------------------------------------------
    // Creador del fondo
    // ----------------------------------------------------------------------
    function createHexBackground(canvas, options) {
        options = options || {};
        var cfg = {};
        var key;
        for (key in CONFIG) cfg[key] = CONFIG[key];
        for (key in (options.config || {})) cfg[key] = options.config[key];

        var ctx = canvas.getContext("2d");
        var W = 0, H = 0, dpr = 1, f = 1, cx = 0, cy = 0;

        var pitch = cfg.pitchDeg * Math.PI / 180;
        var sinP = Math.sin(pitch);
        var cosP = Math.cos(pitch);

        var R = cfg.hexRadius;
        var rowH = Math.sqrt(3) * R;   // separación entre filas
        var colW = 1.5 * R;            // separación entre columnas

        // Esquinas de un hexágono (con la punta hacia los lados, como tu referencia)
        var VX = [], VZ = [], k;
        for (k = 0; k < 6; k++) {
            VX.push(Math.cos(k * Math.PI / 3));
            VZ.push(Math.sin(k * Math.PI / 3));
        }

        var cam = { x: 0, y: cfg.cameraHeight, z: 0 };
        var P = { x: 0, y: 0, z: 0 };   // punto proyectado reutilizable (evita crear objetos en cada cuadro)
        var rafId = null;
        var staticTime = null;   // si no es null, solo se muestra una imagen fija en ese segundo

        // Ajusta el canvas al tamaño real de la pantalla (y a pantallas de alta densidad)
        function resize() {
            var cssW = canvas.clientWidth || options.width || 1280;
            var cssH = canvas.clientHeight || options.height || 720;
            dpr = options.dpr ||
                Math.min((typeof window !== "undefined" && window.devicePixelRatio) || 1, 1.5);
            W = cssW;
            H = cssH;
            canvas.width = Math.round(cssW * dpr);
            canvas.height = Math.round(cssH * dpr);
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            f = (H / 2) / Math.tan(cfg.fovDeg * Math.PI / 360);   // "distancia focal" en píxeles
            cx = W / 2;
            cy = H / 2;
            if (staticTime !== null) draw(staticTime);   // el canvas se borra al cambiar de tamaño
        }

        // PERSPECTIVA: convierte un punto del mundo 3D (x, y, z) en un punto de la pantalla.
        //   x = izquierda/derecha, y = arriba/abajo, z = hacia adelante.
        // Devuelve false si el punto quedó detrás (o muy pegado) a la cámara.
        function project(x, y, z, out) {
            var dx = x - cam.x;
            var dy = y - cam.y;
            var dz = z - cam.z;
            var depth = -dy * sinP + dz * cosP;      // qué tan lejos está, en la dirección en que mira la cámara
            if (depth < 0.6) return false;
            var up = dy * cosP + dz * sinP;
            out.x = cx + f * dx / depth;             // cosas lejanas → más cerca del centro
            out.y = cy - f * up / depth;
            out.z = depth;
            return true;
        }

        // Qué tan visible es algo según su distancia (cerca = 1, en el horizonte = 0)
        function fade(depth) {
            return Math.pow(clamp((cfg.farDistance - depth) / (cfg.farDistance * 0.8), 0, 1), 1.2);
        }

        // Posición en el mundo del centro del hexágono (i = columna, j = fila)
        function cellX(i) { return i * colW; }
        function cellZ(i, j) { return rowH * (j + ((i & 1) ? 0.5 : 0)); }

        var pa = [], pb = [], pt = [];
        for (k = 0; k < 6; k++) {
            pa.push({ x: 0, y: 0, z: 0 });
            pb.push({ x: 0, y: 0, z: 0 });
            pt.push({ x: 0, y: 0, z: 0 });
        }

        function lineWidth(depth, scale) {
            return clamp(f * 0.012 / depth, 0.6, 2.4) * scale;
        }

        // Dibuja UNA columna (hexágono levantado): caras laterales + tapa
        function drawColumn(c) {
            var r = R * cfg.gap;
            var i2;
            for (var q = 0; q < 6; q++) {
                var wx = c.x + r * VX[q];
                var wz = c.z + r * VZ[q];
                if (!project(wx, 0, wz, pb[q]) || !project(wx, c.h, wz, pt[q])) return;
            }

            var a = cfg.opacity * fade(c.depth);
            var accent = hash(c.i, c.j, 900) < cfg.accentChance;
            var edge = accent ? cfg.accentColor : cfg.lineColor;
            var hue = accent ? 322 : 268;

            // Caras laterales: solo las que miran hacia la cámara
            for (q = 0; q < 6; q++) {
                i2 = (q + 1) % 6;
                var mx = c.x + r * 0.5 * (VX[q] + VX[i2]);
                var mz = c.z + r * 0.5 * (VZ[q] + VZ[i2]);
                var nx = mx - c.x;
                var nz = mz - c.z;
                if (nx * (cam.x - mx) + nz * (cam.z - mz) <= 0) continue;   // cara de atrás: no se ve

                var facing = -nz / (r * 0.866);                              // 1 = de frente a la cámara
                var light = 30 + 20 * clamp(facing, 0, 1);
                ctx.globalAlpha = a * 0.85;
                ctx.fillStyle = "hsl(" + hue + ",80%," + light + "%)";
                ctx.beginPath();
                ctx.moveTo(pb[q].x, pb[q].y);
                ctx.lineTo(pb[i2].x, pb[i2].y);
                ctx.lineTo(pt[i2].x, pt[i2].y);
                ctx.lineTo(pt[q].x, pt[q].y);
                ctx.closePath();
                ctx.fill();
                ctx.globalAlpha = a * 0.7;
                ctx.strokeStyle = edge;
                ctx.lineWidth = lineWidth(c.depth, 0.8);
                ctx.stroke();
            }

            // Tapa de arriba (oscura, como en tu referencia) con borde neón
            ctx.beginPath();
            ctx.moveTo(pt[0].x, pt[0].y);
            for (q = 1; q < 6; q++) ctx.lineTo(pt[q].x, pt[q].y);
            ctx.closePath();
            ctx.globalAlpha = a * 0.95;
            ctx.fillStyle = "rgb(14,8,30)";
            ctx.fill();
            ctx.globalAlpha = a * 0.22;                 // halo
            ctx.strokeStyle = accent ? cfg.accentColor : cfg.glowColor;
            ctx.lineWidth = lineWidth(c.depth, 4);
            ctx.stroke();
            ctx.globalAlpha = a;                        // línea brillante
            ctx.strokeStyle = edge;
            ctx.lineWidth = lineWidth(c.depth, 1);
            ctx.stroke();
        }

        // Dibuja un cuadro completo en el segundo "t"
        function draw(t) {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            ctx.clearRect(0, 0, W, H);
            ctx.lineJoin = "round";
            ctx.lineCap = "round";

            // La cámara AVANZA: su posición z crece con el tiempo
            cam.z = cfg.speed * t;
            cam.x = cfg.sway * Math.sin(t * 0.22);

            var jMin = Math.floor((cam.z - 2) / rowH);
            var jMax = Math.ceil((cam.z + cfg.farDistance + 3) / rowH);
            var columns = [];
            var halfView = (W / 2 + 200) / f;           // cuánto se ve hacia los lados por cada unidad de profundidad

            for (var j = jMin; j <= jMax; j++) {
                // Profundidad aproximada de esta fila (para el desvanecido y el ancho de línea)
                var zRow = rowH * j;
                var depthRow = (cfg.cameraHeight * sinP) + (zRow - cam.z) * cosP;
                if (depthRow < 1 || depthRow > cfg.farDistance) continue;

                var halfW = depthRow * halfView + 2 * R;
                var iMin = Math.floor((cam.x - halfW) / colW);
                var iMax = Math.ceil((cam.x + halfW) / colW);
                var rowAlpha = cfg.opacity * fade(depthRow);
                if (rowAlpha < 0.01) continue;

                ctx.beginPath();
                var any = false;
                for (var i = iMin; i <= iMax; i++) {
                    var x = cellX(i);
                    var z = cellZ(i, j);
                    var ok = true;
                    for (k = 0; k < 4 && ok; k++) {      // solo la mitad de atrás de cada hexágono: así no se repiten bordes
                        ok = project(x + R * VX[k], 0, z + R * VZ[k], pa[k]);
                    }
                    if (!ok) continue;
                    if (pa[0].y > H + 400) continue;     // muy abajo, fuera de pantalla
                    ctx.moveTo(pa[0].x, pa[0].y);
                    ctx.lineTo(pa[1].x, pa[1].y);
                    ctx.lineTo(pa[2].x, pa[2].y);
                    ctx.lineTo(pa[3].x, pa[3].y);
                    any = true;

                    var h = columnHeight(i, j, t, cfg);
                    if (h > 0.02) {
                        var dC = (cfg.cameraHeight * sinP) + (z - cam.z) * cosP;
                        columns.push({ i: i, j: j, x: x, z: z, h: h, depth: dC });
                    }
                }
                if (any) {
                    ctx.globalAlpha = rowAlpha * 0.2;                 // halo ancho y tenue
                    ctx.strokeStyle = cfg.glowColor;
                    ctx.lineWidth = lineWidth(depthRow, 4);
                    ctx.stroke();
                    ctx.globalAlpha = rowAlpha * 0.9;                 // línea fina y brillante
                    ctx.strokeStyle = cfg.lineColor;
                    ctx.lineWidth = lineWidth(depthRow, 1);
                    ctx.stroke();
                }
            }

            // Las columnas se dibujan de LEJOS a CERCA para que las de adelante tapen a las de atrás
            columns.sort(function (a, b) { return b.depth - a.depth; });
            for (var n = 0; n < columns.length; n++) drawColumn(columns[n]);

            // Desvanece la parte de abajo de la pantalla para que no compita con BLOM
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = "destination-out";
            var y0 = H * (1 - cfg.bottomFade);
            var g = ctx.createLinearGradient(0, y0, 0, H);
            g.addColorStop(0, "rgba(0,0,0,0)");
            g.addColorStop(1, "rgba(0,0,0," + cfg.bottomFadeStrength + ")");
            ctx.fillStyle = g;
            ctx.fillRect(0, y0, W, H - y0);
            ctx.globalCompositeOperation = "source-over";
        }

        // Animación continua
        function start() {
            resize();
            var reduce = typeof window !== "undefined" && window.matchMedia &&
                window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            if (reduce) {            // si la persona pidió "menos movimiento": una imagen fija
                staticTime = 14;
                draw(staticTime);
                return;
            }
            var t0 = null;
            function frame(now) {
                if (t0 === null) t0 = now;
                draw((now - t0) / 1000 + 8);   // +8: arranca ya con algo de recorrido
                rafId = requestAnimationFrame(frame);
            }
            rafId = requestAnimationFrame(frame);
        }

        function stop() {
            if (rafId !== null && typeof cancelAnimationFrame !== "undefined") cancelAnimationFrame(rafId);
            rafId = null;
        }

        return { start: start, stop: stop, resize: resize, draw: draw };
    }

    // ----------------------------------------------------------------------
    // Arranque automático en el navegador
    // ----------------------------------------------------------------------
    if (typeof document !== "undefined") {
        var boot = function () {
            var canvas = document.getElementById("bg-hex-canvas");
            if (!canvas || !canvas.getContext) return;
            var bg = createHexBackground(canvas);
            bg.start();
            window.addEventListener("resize", bg.resize);
        };
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
        else boot();
    }

    // Para poder probarlo fuera del navegador (Node)
    if (typeof module !== "undefined" && module.exports) {
        module.exports = { createHexBackground: createHexBackground, columnHeight: columnHeight, CONFIG: CONFIG };
    }
})();