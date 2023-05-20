import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import * as dat from 'lil-gui'
import gsap from 'gsap'
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

const BASE_PATH = '/threejs-haunted-house'


/**
 * Base
 */
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// FOG
scene.fog = new THREE.FogExp2(0x081825, 0.1);  // adding a dense fog for a spooky effect

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()

const doorColorTexture = textureLoader.load(`${BASE_PATH}/textures/door/color.jpg`)
const doorAlphaTexture = textureLoader.load(`${BASE_PATH}/textures/door/alpha.jpg`)
const doorAmbientOcclusionTexture = textureLoader.load(`${BASE_PATH}/textures/door/ambientOcclusion.jpg`)
const doorHeightTexture = textureLoader.load(`${BASE_PATH}/textures/door/height.jpg`)
const doorNormalTexture = textureLoader.load(`${BASE_PATH}/textures/door/normal.jpg`)
const doorMetalnessTexture = textureLoader.load(`${BASE_PATH}/textures/door/metalness.jpg`)
const doorRoughnessTexture = textureLoader.load(`${BASE_PATH}/textures/door/roughness.jpg`)

const bricksColorTexture = textureLoader.load(`${BASE_PATH}/textures/bricks/color.jpg`)
const bricksAmbientOcclusionTexture = textureLoader.load(`${BASE_PATH}/textures/bricks/ambientOcclusion.jpg`)
const bricksNormalTexture = textureLoader.load(`${BASE_PATH}/textures/bricks/normal.jpg`)
const bricksRoughnessTexture = textureLoader.load(`${BASE_PATH}/textures/bricks/roughness.jpg`)

const grassColorTexture = textureLoader.load(`${BASE_PATH}/textures/grass/color.jpg`)
const grassAmbientOcclusionTexture = textureLoader.load(`${BASE_PATH}/textures/grass/ambientOcclusion.jpg`)
const grassNormalTexture = textureLoader.load(`${BASE_PATH}/textures/grass/normal.jpg`)
const grassRoughnessTexture = textureLoader.load(`${BASE_PATH}/textures/grass/roughness.jpg`)



grassColorTexture.repeat.set(8, 8)
grassAmbientOcclusionTexture.repeat.set(8, 8)
grassNormalTexture.repeat.set(8, 8)
grassRoughnessTexture.repeat.set(8, 8)

grassColorTexture.wrapS = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapS = THREE.RepeatWrapping
grassNormalTexture.wrapS = THREE.RepeatWrapping
grassRoughnessTexture.wrapS = THREE.RepeatWrapping

grassColorTexture.wrapT = THREE.RepeatWrapping
grassAmbientOcclusionTexture.wrapT = THREE.RepeatWrapping
grassNormalTexture.wrapT = THREE.RepeatWrapping
grassRoughnessTexture.wrapT = THREE.RepeatWrapping


/**
 * House
 */

// Groups
const houseGroup = new THREE.Group()
scene.add(houseGroup)


// Walls
const walls = new THREE.Mesh(
    new THREE.BoxGeometry(4, 2.5, 4),
    new THREE.MeshStandardMaterial({
        map: bricksColorTexture,
        aoMap: bricksAmbientOcclusionTexture,
        normalMap: bricksNormalTexture,
        roughnessMap: bricksRoughnessTexture
     })
)

walls.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(walls.geometry.attributes.uv.array, 2))

walls.position.y = 2.5*0.5

// walls.castShadow = true
// walls.receiveShadow = true
houseGroup.add(walls)




/**
 * 
 * Setting Up Audio
 */

const listener = new THREE.AudioListener();
const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
let font;

audioLoader.load(`${BASE_PATH}/sound/haunted_house.mp3`, function (buffer) {
    sound.setBuffer(buffer);
    sound.setLoop(true);
    sound.setVolume(0.5);
});

const fontLoader = new FontLoader();
fontLoader.load(`${BASE_PATH}/fonts/helvetiker_regular.typeface.json`, (font) => {
    const textGeometry = new TextGeometry('Music', {
        font: font,
        size: 0.2,
        height: 0.1,
        curveSegments: 4,
        bevelEnabled: true,
        bevelThickness: 0.03,
        bevelSize: 0.02,
        bevelOffset: 0,
        bevelSegments: 2
    })
    textGeometry.center()
    const textMesh = new THREE.Mesh(textGeometry, new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture
    }));
    textMesh.position.set(1.3, 0.2, 2.01); // Adjust the position values so the text is placed on one face of the house walls
    walls.add(textMesh);
});


let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

function onMouseClick(event) {
    event.preventDefault();

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    
    let clickableObjects = [walls.children[0]];
    let intersects = raycaster.intersectObjects(clickableObjects, true);

    if(intersects.length > 0) {
        const intersectedObject = intersects[0].object;

        if (intersectedObject === walls.children[0]) {
            if (sound.isPlaying) {
                sound.pause();
            } else {
                if (!sound.buffer) {
                    console.log('The sound buffer is not loaded yet');
                    return;
                }
                sound.play();
            }
        }
    }
}

window.addEventListener('click', onMouseClick, false);

// ------------------------------------------------





// Roof
const roof = new THREE.Mesh(
    new THREE.ConeGeometry(3.5, 1, 4),
    new THREE.MeshStandardMaterial({ color: '#b35f45' })
)

roof.position.y = 2.5 + 0.5
roof.rotation.y = Math.PI * 0.25
// roof.castShadow = true
// roof.receiveShadow = true
houseGroup.add(roof)


// Door
const door = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.MeshStandardMaterial({ 
        map: doorColorTexture,
        alphaMap: doorAlphaTexture,
        transparent: true,
        aoMap: doorAmbientOcclusionTexture,
        displacementMap: doorHeightTexture,
        displacementScale: 0.1,
        normalMap: doorNormalTexture,
        metalnessMap: doorMetalnessTexture,
        roughnessMap: doorRoughnessTexture
     })
)
door.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(door.geometry.attributes.uv.array, 2))
door.position.y = 1
door.position.z = 2 + 0.01 // 0.01 to avoid z-fighting
// door.castShadow = true
// door.receiveShadow = true
houseGroup.add(door)

// Bushes
const bushGeometry = new THREE.SphereGeometry(1, 16, 16)
const bushMaterial = new THREE.MeshStandardMaterial({ 
    color: '#89c854',
})

const bush1 = new THREE.Mesh(bushGeometry, bushMaterial)
bush1.scale.set(0.5, 0.5, 0.5)
bush1.position.set(0.8, 0.2, 2.2)
// bush1.castShadow = true
// bush1.receiveShadow = true

const bush2 = new THREE.Mesh(bushGeometry, bushMaterial)
bush2.scale.set(0.25, 0.25, 0.25)
bush2.position.set(1.4, 0.1, 2.1)
// bush2.castShadow = true
// bush2.receiveShadow = true

const bush3 = new THREE.Mesh(bushGeometry, bushMaterial)
bush3.scale.set(0.4, 0.4, 0.4)
bush3.position.set(- 0.8, 0.1, 2.2)
// bush3.castShadow = true
// bush3.receiveShadow = true

const bush4 = new THREE.Mesh(bushGeometry, bushMaterial)
bush4.scale.set(0.15, 0.15, 0.15)
bush4.position.set(- 1, 0.05, 2.6)
// bush4.castShadow = true
// bush4.receiveShadow = true

houseGroup.add(bush1, bush2, bush3, bush4)

// Graves
// Graves
const graves = new THREE.Group();
scene.add(graves);

const graveGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
const graveMaterial = new THREE.MeshStandardMaterial({
    color: '#b2b6b1',
});

// Create an InstancedMesh with the grave geometry and material, and specify the count
const gravesInstance = new THREE.InstancedMesh(graveGeometry, graveMaterial, 50);
gravesInstance.castShadow = true; // All instance will cast shadow
graves.add(gravesInstance);

const matrix = new THREE.Matrix4();  // to specify position and rotation for each instance

// For rotation around Z axis, we use quaternion
const quaternion = new THREE.Quaternion();
const upVector = new THREE.Vector3(0, 0, 1);

for(let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2; // Random angle
    const radius = 3 + Math.random() * 6; // Random radius
    const x = Math.sin(angle) * radius; // Get the x position using cosinus
    const z = Math.cos(angle) * radius; // Get the z position using sinus

    // Set rotation using quaternion
    quaternion.setFromAxisAngle(upVector, (Math.random() - 0.5) * 0.4);

    // Reset matrix, apply rotation and translation
    matrix.identity().makeRotationFromQuaternion(quaternion).setPosition(x, 0.3, z);
    
    // Update the instance's transformation matrix
    gravesInstance.setMatrixAt(i, matrix);
}

// gravesInstance.instanceMatrix.needsUpdate = true;


// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(20, 20),
    new THREE.MeshStandardMaterial({ 
        map: grassColorTexture,
        aoMap: grassAmbientOcclusionTexture,
        normalMap: grassNormalTexture,
        roughnessMap: grassRoughnessTexture
    })
)

floor.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(floor.geometry.attributes.uv.array, 2))

floor.rotation.x = - Math.PI * 0.5
floor.position.y = 0
scene.add(floor)

/**
 * Lights
 */
// Ambient light
const ambientLight = new THREE.AmbientLight('#b9d5ff', 0.12)
gui.add(ambientLight, 'intensity').min(0).max(1).step(0.001)
scene.add(ambientLight)

// Directional light
const moonLight = new THREE.DirectionalLight('#b9d5ff', 0.12)
moonLight.position.set(4, 5, - 2)
gui.add(moonLight, 'intensity').min(0).max(1).step(0.001)
gui.add(moonLight.position, 'x').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'y').min(- 5).max(5).step(0.001)
gui.add(moonLight.position, 'z').min(- 5).max(5).step(0.001)
scene.add(moonLight)


// Door light
const doorLight = new THREE.PointLight('#ff7d46', 1, 7)
doorLight.position.set(0, 2.2, 2.7)
houseGroup.add(doorLight)

/// Ghosts

// Create 3 ghosts

// const ghost1 = new THREE.PointLight('#ff00ff', 2, 3)
const ghost1 = createGhost()
scene.add(ghost1)

// const ghost2 = new THREE.PointLight('#00ffff', 2, 3)
const ghost2 = createGhost()
scene.add(ghost2)

// const ghost3 = new THREE.PointLight('#ffff00', 2, 3)
const ghost3 = createGhost()
scene.add(ghost3)



/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 4
camera.position.y = 2
camera.position.z = 5
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

// Pause the animation when user starts interacting
controls.addEventListener('start', function() {
    tl.pause();
});

// Resume the animation when user stops interacting
controls.addEventListener('end', function() {
       // Clear the current timeline
       tl.clear();

       // Generate a new timeline starting from the current camera position
       params.x1 = camera.position.x;
       params.y1 = camera.position.y;
       params.z1 = camera.position.z;
       generateTimeline();
   
       tl.resume();   
});

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setClearColor('#262837')

/*
Shadows
*/

renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

moonLight.castShadow = true
doorLight.castShadow = true
ghost1.castShadow = true
ghost2.castShadow = true
ghost3.castShadow = true

walls.castShadow = true

bush1.castShadow = true
bush2.castShadow = true
bush3.castShadow = true
bush4.castShadow = true

floor.receiveShadow = true
walls.receiveShadow = true

doorLight.shadow.mapSize.width = 256
doorLight.shadow.mapSize.height = 256
doorLight.shadow.camera.far = 7

// ghost1.shadow.mapSize.width = 256
// ghost1.shadow.mapSize.height = 256
// ghost1.shadow.camera.far = 7

// ghost2.shadow.mapSize.width = 256
// ghost2.shadow.mapSize.height = 256
// ghost2.shadow.camera.far = 7

// ghost3.shadow.mapSize.width = 256
// ghost3.shadow.mapSize.height = 256
// ghost3.shadow.camera.far = 7


/**
 * GSAP Animation
 */

// GSAP animation parameters
const params = {
    duration: 4,
    x1: 5, 
    z1: -5,
    y1: 3,
    x2: -5, 
    z2: -5,
    y2: 2,
    x3: -5, 
    z3: 5,
    y3: 3,
    x4: 5, 
    z4: 5,
    y4: 2,
    x5: 4, 
    z5: -5,
    y5: 3,
};

// Create a GSAP timeline
const tl = gsap.timeline();

// GUI Controller
const gsapFolder = gui.addFolder('GSAP Animation');
gsapFolder.add(params, 'duration').min(1).max(10).step(0.1).onChange(generateTimeline);
gsapFolder.add(params, 'x1').min(-10).max(10).step(0.1).onChange(generateTimeline);
gsapFolder.add(params, 'y1').min(0).max(10).step(0.1).onChange(generateTimeline);
gsapFolder.add(params, 'z1').min(-10).max(10).step(0.1).onChange(generateTimeline);
gsapFolder.add(params, 'x2').min(-10).max(10).step(0.1).onChange(generateTimeline);
gsapFolder.add(params, 'y2').min(0).max(10).step(0.1).onChange(generateTimeline);
gsapFolder.add(params, 'z2').min(-10).max(10).step(0.1).onChange(generateTimeline);
gsapFolder.add(params, 'x3').min(-10).max(10).step(0.1).onChange(generateTimeline);
gsapFolder.add(params, 'y3').min(0).max(10).step(0.1).onChange(generateTimeline);
gsapFolder.add(params, 'z3').min(-10).max(10).step(0.1).onChange(generateTimeline);
gsapFolder.add(params, 'x4').min(-10).max(10).step(0.1).onChange(generateTimeline);
gsapFolder.add(params, 'y4').min(0).max(10).step(0.1).onChange(generateTimeline);
gsapFolder.add(params, 'z4').min(-10).max(10).step(0.1).onChange(generateTimeline);
gsapFolder.add(params, 'x5').min(-10).max(10).step(0.1).onChange(generateTimeline);
gsapFolder.add(params, 'y5').min(0).max(10).step(0.1).onChange(generateTimeline);
gsapFolder.add(params, 'z5').min(-10).max(10).step(0.1).onChange(generateTimeline);

function generateTimeline() {
    tl.clear(); // clear the previous timeline

    tl.to(camera.position, { 
        duration: params.duration, delay: 0.5, 
        x: params.x1, 
        z: params.z1,
        y: params.y1, 
        ease: 'power1.inOut', 
        onComplete: () => { camera.lookAt(scene.position); } 
    })
    .to(camera.position, { 
        duration: params.duration, delay: 0.5, 
        x: params.x2, 
        z: params.z2,
        y: params.y2,
        ease: 'power1.inOut',
        onComplete: () => { camera.lookAt(scene.position); } 
    })
    .to(camera.position, {
        duration: params.duration, delay: 0.5,
        x: params.x3,
        z: params.z3,
        y: params.y3,
        ease: 'power1.inOut',
        onComplete: () => { camera.lookAt(scene.position); }
    })
    .to(camera.position, {
        duration: params.duration, delay: 0.5,
        x: params.x4,
        z: params.z4,
        y: params.y4,
        ease: 'power1.inOut',
        onComplete: () => { camera.lookAt(scene.position); }
    })
    .to(camera.position, {
        duration: params.duration, delay: 0.5,
        x: params.x5,
        z: params.z5,
        y: params.y5,
        ease: 'power1.inOut',
        onComplete: () => { camera.lookAt(scene.position); }
    });
    
    // Add this line at the end of the sequence to make the animation loop
    tl.repeat(-1);
}

generateTimeline(); 

/**
 * Animate
 */

function ghostMovement(ghost, elapsedTime, randomXZ = 0, randomY = 0)
{
    const ghostAngle = elapsedTime * 0.5
    ghost.position.x = Math.cos(ghostAngle) * 4 + randomXZ
    ghost.position.z = Math.sin(ghostAngle) * 4 + randomXZ
    ghost.position.y = Math.sin(elapsedTime * 3) + randomY

    ghost.rotation.y = Math.sin(elapsedTime * 4)
}


const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime();

 
    // Update ghosts
    ghostMovement(ghost1, elapsedTime)
    ghostMovement(ghost2, elapsedTime + 10, 1, Math.sin(elapsedTime * 2.5))
    ghostMovement(ghost3, elapsedTime + 20)
    // Render 
  camera.lookAt(scene.position);

  controls.update();

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
}

tick();



function createGhost() {
    // Group for each ghost
    const ghostGroup = new THREE.Group()

    // Body
    const bodyGeometry = new THREE.ConeGeometry(0.2, 0.6, 4)
    const bodyMaterial = new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.5
    })
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial)
    body.position.y = 0.25
    ghostGroup.add(body)

    // Head
    const headGeometry = new THREE.SphereGeometry(0.2, 32, 32)
    const headMaterial = new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.5
    })
    const head = new THREE.Mesh(headGeometry, headMaterial)
    head.position.y = 0.6
    ghostGroup.add(head)

    return ghostGroup
}
