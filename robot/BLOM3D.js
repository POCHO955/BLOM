import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

const container = document.getElementById("blom-3d-container");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, container.clientWidth / container.clientHeight, 0.1, 100);
camera.position.set(0, 0, 5);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.setPixelRatio(window.devicePixelRatio);

// --- ESTO ES LO NUEVO: hace que los colores se vean como en Blender ---
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;

container.appendChild(renderer.domElement);

// --- ENTORNO DE LUZ: le da a los materiales algo que "reflejar" ---
const pmremGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

scene.add(new THREE.AmbientLight(0xffffff, 0.6));
const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
keyLight.position.set(2, 3, 4);
scene.add(keyLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enableZoom = false;
controls.autoRotate = false;
controls.autoRotateSpeed = 1.5;

// CARGADOR: aquí se lee tu archivo .glb y se agrega a la escena
const loader = new GLTFLoader();
loader.load(
    "robot/BLOM.glb",
    (gltf) => {
        const model = gltf.scene;
        scene.add(model);

        // --- DIAGNÓSTICO TEMPORAL ---
// Fuerza a que TODAS las caras se dibujen por ambos lados, sin importar
// hacia dónde miren sus normales. Si esto hace que BLOM aparezca,
// confirma que el problema son normales invertidas desde Blender.
model.traverse((child) => {
    if (child.isMesh) {
        child.material.side = THREE.DoubleSide;
    }
});

        // --- AUTO-AJUSTE DE CÁMARA ---
        // Calcula la "caja invisible" que envuelve todo el modelo, para saber
        // su tamaño y centro reales, sea cual sea la escala con la que se exportó.
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Centra el modelo en (0,0,0), sin importar dónde estaba en Blender
        model.position.sub(center);

        // Calcula qué tan lejos debe estar la cámara según el tamaño real del modelo
        const maxDimension = Math.max(size.x, size.y, size.z);
        const distance = maxDimension * 2.2;
        camera.position.set(0, 0, distance || 5);
        camera.near = distance / 100;
        camera.far = distance * 100;
        camera.updateProjectionMatrix();

        controls.target.set(0, 0, 0);
        controls.update();

        console.log("BLOM cargado. Tamaño:", size, "Distancia de cámara usada:", distance);
    },
    undefined,
    (error) => console.error("Error cargando BLOM.glb:", error)
);

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();

window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
});