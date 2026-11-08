# BLOM

BLOM es un robot de acompañamiento que vive dentro de una página web. Tiene un diseño 2D con forma de personaje, un fondo hexagonal animado, diálogos con pausas y transición de opacidad, y un pequeño sistema de memoria local para recordar el nombre, la edad y el estado de ánimo del usuario.

> Estado actual: versión funcional de demostración. BLOM ya saluda, recuerda datos básicos del usuario, permite acariciarlo, mostrar un menú de opciones y guardar información en `localStorage`.

---

## Qué incluye

- Robot 2D con estilo propio y animaciones suaves.
- Fondo con efecto hexagonal y brillo violeta/cian.
- Diálogos con textos que aparecen y desaparecen.
- Menú de elección: Charlar / Despedirse.
- Sistema de reconocimiento de nombre y edad.
- Guardado local en el navegador con `localStorage`.
- Estado emocional del robot (mood) según la interacción.

## Tecnologías

- HTML
- CSS
- JavaScript vanilla
- Tailwind CSS por CDN
- `localStorage` para guardar la sesión del usuario

## Estructura del proyecto

```text
BLOM/
├── index.html          Estructura principal de la interfaz
├── style.css           Estilos del robot, fondo, diálogos y formularios
├── events.js           Lógica del flujo, diálogos, menú y UX
├── storage.js          Estado del usuario y memoria del robot
├── fondo-hex.js        Fondo hexagonal animado
├── robot/
│   └── dialogue.js     Frases e interacciones de BLOM
├── README.md           Documentación del proyecto
├── min.js              Archivo auxiliar / legado
└── style.css           Hoja principal de estilos
```

## Cómo ejecutarlo

1. Abre la carpeta del proyecto en VS Code.
2. Haz clic derecho en `index.html` y usa la opción de Live Server.
3. Se abrirá automáticamente en tu navegador con un puerto local generado por Live Server.

No hay una URL pública fija para este proyecto; se ejecuta normalmente desde el navegador local con Live Server.

## Flujo del proyecto

### 1. Inicio
Cuando la página carga, BLOM entra en una secuencia de saludo y luego muestra un formulario si falta el nombre o la edad.

### 2. Registro básico
El usuario puede escribir:
- Nombre
- Edad

Estos valores se guardan en `localStorage` y se reutilizan en futuras visitas.

### 3. Interacción
El usuario puede:
- hacer click en BLOM para acariciarlo,
- abrir el menú de opciones,
- entrar a Charlar,
- despedirse.

### 4. Estado emocional
El mood cambia según las interacciones y se guarda para mantener la personalidad de BLOM.

## Archivos principales

- `index.html`: estructura general y nodos de interfaz
- `style.css`: diseño visual, colores, animaciones, formulario y menús
- `events.js`: control de diálogos, menú, interacción y flujo principal
- `storage.js`: persistencia del estado del usuario
- `fondo-hex.js`: render del fondo geométrico
- `robot/dialogue.js`: mensajes y frases del robot

## Cambios recientes

- Reemplazo de la versión previa por un diseño 2D más limpio y atractivo.
- Ajuste del formulario para que muestre nombre y edad con estilo BLOM.
- Menú de acciones más pequeño y visualmente integrado al fondo.
- Guardado del perfil del usuario sin depender de un modelo 3D ni de archivos pesados.
- Simplificación del proyecto para una experiencia más ligera y moderna.

## Notas

- Este proyecto está pensado como demo interactiva y personalizable.
- Los colores están basados en la identidad visual violeta/cian de BLOM.
- El contenido de diálogos y la personalidad del personaje se pueden modificar fácilmente en `robot/dialogue.js`.

## Créditos

Proyecto y diseño: BLOM.

Este README fue actualizado para reflejar el estado actual del proyecto y su enfoque visual y funcional actual.
