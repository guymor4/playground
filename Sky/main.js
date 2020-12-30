/// <reference path='libs/three.min.js' />

const RADIUS_PLANET = 6360 // KM
const RADIUS_ATMOSPHERE = 6420 // KM

var ground;
var plane;
var camera;
var scene;
var renderer;
var controls;
var mesh;
var mainLight;
var clock = new THREE.Clock();

async function start() {
    await init();
    animate();
}

//////////////////////////////////////////////////////////
//														//
// 														//
//														//
//														//
//    Check: https://github.com/jmcneese/libnoise.js  	//
//														//
//														//
//														//
//														//
//////////////////////////////////////////////////////////

async function init() {
    // Setup basic mangers
    noise.seed(Math.random());
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    document.body.appendChild(renderer.domElement);
    window.addEventListener('resize', onWindowResize, false);

    setupCameraAndControls();
    setupLights();
    await setupShapes();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    var deltaTime = clock.getDelta();

    requestAnimationFrame(animate);

    controls.update(deltaTime);
    renderer.render(scene, camera);
}

function setupCameraAndControls() {
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 9999999);
    camera.position.x = RADIUS_PLANET * 2;
    camera.position.y = 0;
    camera.position.z = 0;
    camera.lookAt(scene.position);
    controls = new THREE.OrbitControls(camera);
}

function setupLights() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));
    mainLight = new THREE.DirectionalLight(0xffffff, 0.7);
    mainLight.position.x = 1.0;
    mainLight.position.y = 2.0;
    mainLight.position.z = 3.0;
    scene.add(mainLight);
}

async function readTextFile(filename) {
    return fetch(filename, {
        cache: "no-cache",
        headers: {
            'pragma': 'no-cache',
            'cache-control': 'no-cache'
        }
    }).then(response => response.text())
}

async function setupShapes() {
    const planetGeometry = new THREE.SphereGeometry(RADIUS_PLANET, 32, 32);
    planet = new THREE.Mesh(planetGeometry, new THREE.MeshBasicMaterial({
        color: 0x5577aa
    }));
    planet.castShadow = false;
    planet.receiveShadow = false;
    scene.add(planet);

    const uniforms = {
        RADIUS_PLANET: {
            value: RADIUS_PLANET
        },
        RADIUS_ATMOSPHERE: {
            value: RADIUS_ATMOSPHERE
        },
        RESOLUTION: {
            value: {
                x: renderer.getSize().width,
                y: renderer.getSize().height
            }
        },
        LIGHTDIR: {
            value: new THREE.Vector3().sub(
                new THREE.Vector3(mainLight.position.x, mainLight.position.y, mainLight.position.z)
            ).normalize()
        }
    }
    console.log(uniforms)

    skydomeVertexShader = await readTextFile('/skydome_vert.glsl')
    skydomeFragShader = await readTextFile('/skydome_frag.glsl')

    const skydomeGeometry = new THREE.SphereGeometry(RADIUS_ATMOSPHERE, 32, 32);
    const skydomeMaterial = new THREE.ShaderMaterial({
        vertexShader: skydomeVertexShader,
        fragmentShader: skydomeFragShader,
        uniforms
    });
    skydome = new THREE.Mesh(skydomeGeometry, skydomeMaterial);

    skydome.castShadow = false;
    skydome.receiveShadow = false;
    scene.add(skydome);
}