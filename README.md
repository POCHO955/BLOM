# BLOM

BLOM es un pequeño robot compañero que vive en una página web. Aparece flotando en un fondo animado, te habla con frases que se desvanecen una tras otra y se puede girar arrastrándolo con el mouse. El robot es un modelo 3D propio hecho en Blender y mostrado con Three.js.

> Estado: en desarrollo. Hoy BLOM saluda con diálogos de texto. La animación del saludo, la voz y los juegos están pendientes (ver [Pendientes](#pendientes)).

---

## Qué incluye

- **Robot 3D propio**: modelado en Blender, exportado como `.glb` y cargado con Three.js. Se puede girar arrastrando con el mouse.
- **Sistema de diálogos**: BLOM dice una lista de frases, cada una con su propia pausa y un fundido suave entre ellas. Un clic en cualquier parte salta la pausa.
- **Fondo animado en 3D**: un piso de hexágonos con borde neón por el que la cámara avanza todo el tiempo, y donde algunos hexágonos suben como columnas y vuelven a bajar al azar.
- **Paleta morado medianoche** pensada para no cansar la vista de noche.
- **Respeta "reducir movimiento"**: si el sistema lo tiene activado, el fondo se queda como una imagen fija.

## Tecnologías

| Parte | Con qué está hecho |
|---|---|
| Página | HTML, CSS y JavaScript sin frameworks |
| Estilos utilitarios | Tailwind CSS por CDN |
| Robot 3D | Three.js 0.160 (`GLTFLoader`, `OrbitControls`, `RoomEnvironment`), cargado por CDN con un `importmap` |
| Modelado | Blender 5.2 (exportación glTF 2.0 Binary, `.glb`) |
| Fondo animado | `<canvas>` 2D con la perspectiva calculada a mano (sin librerías) |

## Estructura del proyecto

```
BLOM/
├── index.html          Estructura de la página (fondo, robot, diálogo, contenedores de futuros juegos)
├── style.css           Colores, diálogo, resplandor del fondo y tamaño del canvas del fondo
├── events.js           Motor de diálogos: muestra las frases una por una
├── fondo-hex.js        Fondo animado: piso de hexágonos 3D con columnas que suben y bajan
├── storage.js          Vacío por ahora (reservado para guardar progreso)
├── min.js              Vacío y sin usar (se puede borrar)
└── robot/
    ├── BLOM.glb        Modelo 3D de BLOM exportado desde Blender
    ├── BLOM3D.js       Escena de Three.js: carga el modelo, luces, cámara y controles
    └── dialogue.js     Las frases de BLOM (introDialogue y outroDialogue)
```

## Cómo ejecutarlo

Requisitos:

1. **Un servidor local.** Abrir `index.html` con doble clic no funciona: el navegador bloquea la carga del `.glb` por seguridad. En VS Code se usa la extensión **Live Server** (clic derecho sobre `index.html` → *Open with Live Server*).
2. **Conexión a internet.** Tailwind y Three.js se descargan desde un CDN.

Después de cambiar archivos, recarga con `Ctrl + Shift + R` para que el navegador no use copias viejas guardadas en caché.

## Cómo funciona

### El robot 3D (`robot/BLOM3D.js`)

1. Crea la escena, la cámara y un `renderer` con fondo transparente (por eso se ve el fondo animado detrás de BLOM).
2. Carga `robot/BLOM.glb`.
3. **Auto-ajuste de cámara:** mide la caja que envuelve al modelo (`Box3`), lo centra y calcula a qué distancia poner la cámara. Así se ve completo sin importar la escala con la que Blender lo exportó.
4. **Colores parecidos a Blender:** `outputColorSpace = SRGBColorSpace`, tone mapping `ACESFilmic` (exposición 1.1) y un entorno de reflejos (`RoomEnvironment`). Sin esto los colores se ven apagados.
5. `OrbitControls` permite girarlo arrastrando. El zoom con la rueda está desactivado y el giro automático está apagado (`autoRotate = false`).

### Los diálogos (`events.js` + `robot/dialogue.js`)

- Cada frase es un objeto `{ text: "...", pause: milisegundos }`. `pause` es cuánto se queda la frase en pantalla.
- `showDialogue(lineas, alTerminar)` escribe el texto en el `<p>` dentro de `.dialogue-text`, lo hace aparecer, espera `pause`, lo desvanece y pasa a la siguiente.
- `FADE_DURATION` (800 ms) debe coincidir con el `transition: opacity 0.8s` de `.dialogue-text` en `style.css`.
- Al final de `events.js` arranca la historia: primero `introDialogue` y, al terminar, `outroDialogue`.
- Los nombres `introDialogue` y `outroDialogue` y la propiedad `text` deben escribirse **exactamente así** (con esas mayúsculas), porque `events.js` los busca por nombre.

### El fondo animado (`fondo-hex.js`)

- Dibuja en `<canvas id="bg-hex-canvas">` un piso de hexágonos en perspectiva. La cámara **avanza** de forma continua y se balancea un poco hacia los lados.
- Cada hexágono tiene una "personalidad" fija calculada con una función hash, así no hay que guardar estado. Solo una fracción pequeña (`activeFraction`) puede subir; cuando sube, llega a una altura propia, se queda un momento y baja suave.
- Las columnas tienen tapa oscura, laterales violeta (o rosa en algunas) y borde neón.
- La parte de abajo de la pantalla se desvanece para que el fondo no compita con BLOM.
- El resplandor violeta/magenta de atrás es CSS (`.bg-hex-glow`) y "respira" lentamente.
- El canvas necesita su tamaño en CSS (`#bg-hex-canvas`, 100% de ancho y alto) para saber de qué tamaño dibujar.

## Personalización

| Quiero cambiar... | Dónde |
|---|---|
| El color de fondo de la página | `--bg-void` en `style.css` (usar 6 dígitos, ej. `#211f2e`) |
| El color del texto del diálogo | `--text-dialogue` en `style.css` |
| Tamaño y tipografía del diálogo | `.dialogue-text` en `style.css` |
| Lo que dice BLOM | `robot/dialogue.js` |
| Qué tan rápido avanza el fondo | `speed` en el bloque `CONFIG` de `fondo-hex.js` |
| Cuántos hexágonos suben y qué tan alto | `activeFraction` y `maxHeight` en `CONFIG` |
| Qué tan visible es el fondo | `opacity` en `CONFIG` |
| Tamaño de los hexágonos | `hexRadius` en `CONFIG` |
| Colores del neón | `lineColor`, `glowColor`, `accentColor` en `CONFIG` |
| Brillo general de los colores de BLOM | `toneMappingExposure` en `BLOM3D.js` |
| Tamaño del robot en pantalla | `width` y `height` del `<div id="blom-3d-container">` en `index.html` |

## Del modelo de Blender a la web

Checklist antes de exportar:

1. Los ojos y partes que brillan usan un material con **Emisión** (color e intensidad > 0).
2. **Sombrear suave** aplicado a todo (clic derecho → Objeto → Sombrear suave).
3. **Superficie de subdivisión** en la cabeza y el cuerpo para que se vean redondos (nivel 2 o 3).
4. **Recalcular normales hacia afuera**: seleccionar todo y `Shift + N`.
5. **Aplicar transformaciones**: `Ctrl + A` → Todas las transformaciones.
6. Exportar con *Archivo → Exportar → glTF 2.0*:
   - Formato **glTF Binario (.glb)**.
   - En *Datos → Malla*, marcar **Aplicar modificadores** (si no, la subdivisión no viaja al archivo).
   - Dejar activada la casilla **Animación**.
7. Guardar como `robot/BLOM.glb` (el nombre debe coincidir con el de `BLOM3D.js`, mayúsculas incluidas).

## Problemas conocidos y cómo se resolvieron

| Síntoma | Causa | Solución |
|---|---|---|
| No aparece nada y la consola dice `Failed to resolve module specifier` | Error de dedo en `import ... from "three"` (el texto debe coincidir con el `importmap`) | Escribir exactamente `"three"` |
| La consola dice "BLOM cargado" pero no se ve el robot | Normales invertidas al exportar de Blender | `Shift + N` en Blender; mientras tanto, `material.side = DoubleSide` en `BLOM3D.js` |
| Los diálogos no aparecen | Nombres de variables o clases que no coinciden, o falta el `<p>` dentro de `.dialogue-text` | Usar `introDialogue`, `outroDialogue`, `text` y la clase `.dialogue-text` tal cual |
| Un script detiene todo | Una línea busca un elemento que ya no existe (por ejemplo el brazo de la versión en CSS) | Quitar esa línea o comprobar que el elemento exista |
| Errores 404 en la consola | El HTML pide archivos que no existen o están en otra carpeta | Revisar las rutas de los `<script>` |
| No sale el fondo de hexágonos | Falta `fondo-hex.js`, falta el `<canvas>`, o falta el tamaño de `#bg-hex-canvas` en CSS | Revisar los tres |
| Los cambios no se ven | Caché del navegador | `Ctrl + Shift + R` |
| Los colores del robot se ven apagados | Faltan color space, tone mapping o entorno de reflejos | Ver "El robot 3D" arriba |
| El color de fondo "no cambia" | Un color con 8 dígitos hexadecimales: los 2 últimos son transparencia | Usar 6 dígitos |
| El `.glb` no carga | Se abrió el HTML directo desde el disco | Usar Live Server |

## Historial del proyecto

1. Base: motor de diálogos con frases con pausa y fundido, a partir de la estructura de un proyecto de referencia, reescrita y renombrada.
2. Identidad propia: nombre **BLOM** y un diseño de robot original.
3. Primera versión del robot en **CSS puro** (cuerpo, pantalla, cejas LED, brazos).
4. Paleta morado medianoche pensada para uso nocturno.
5. Migración a **3D**: modelo propio en Blender, exportado a `.glb` y mostrado con Three.js.
6. Ajustes de render para que los colores se parezcan a los de Blender.
7. **Fondo animado**: piso de hexágonos 3D con cámara que avanza y columnas que suben al azar.

## Pendientes

- [ ] Animación de entrada y saludo hecha en Blender (acción con keyframes) y reproducida con `THREE.AnimationMixer`.
- [ ] Voz para BLOM (la voz del navegador con Web Speech API, o archivos de audio propios).
- [ ] Expresiones de la cara (contento, sorprendido, etc.).
- [ ] Juegos: en `index.html` ya hay contenedores ocultos (`#game-ui`, `#game-menu-ui`, `#name-ui`...) listos para usarse.
- [ ] Guardar progreso y el nombre del jugador (`storage.js`).
- [ ] Reducir el peso de `BLOM.glb` (ahora ~11 MB; bajar el nivel de subdivisión de *Render* ayuda).
- [ ] Revisar si el parche `DoubleSide` en `BLOM3D.js` sigue haciendo falta ahora que las normales están corregidas.
- [ ] Limpieza: borrar `min.js` y el CSS que ya no se usa (`blomWave`, `blomHover`, `fadeInText`).
- [ ] Para publicarlo: reemplazar Tailwind por CDN por una versión compilada.

## Créditos

Diseño, modelo 3D y proyecto: autor de BLOM.
La estructura inicial del motor de diálogos se inspiró en un proyecto de un amigo (Yoro); el diseño, el nombre y todo el resto son propios.