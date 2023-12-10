import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { TGALoader } from 'three/addons/loaders/TGALoader.js';

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.set(0, 15, -15);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.shadowMap.enabled = true;
document.body.appendChild( renderer.domElement );


const controls = new OrbitControls(camera, renderer.domElement);

const ambientLight = new THREE.AmbientLight( 0xffffff, 0.5 );
scene.add( ambientLight );

const spotLight = new THREE.SpotLight( 0xffffff, 0.7 );
spotLight.position.set(2, 12, 2);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.5;
spotLight.decay = 1;
spotLight.distance = 0;

spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 1;
spotLight.shadow.camera.far = 60;

scene.add( spotLight );
scene.add( spotLight.target ); // add the target to the scene so we can update where the light is pointing

const spotLightHelper = new THREE.SpotLightHelper( spotLight );
scene.add( spotLightHelper );

const planeGeometry = new THREE.PlaneGeometry( 100, 100 );
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xbcbcbc });

const plane = new THREE.Mesh( planeGeometry, planeMaterial );
plane.rotation.x = -Math.PI / 2; // rotate the plane to face up
plane.receiveShadow = true;
scene.add( plane );

let mixer;
let robo;
const managerTGA = new THREE.LoadingManager();
managerTGA.addHandler( /\.tga$/i, new TGALoader() );
const loader = new FBXLoader(managerTGA);
loader.load('assets/Robo.fbx', 
	(object) => {
	object.scale.set(0.1, 0.1, 0.1);
	
	object.traverse((child) => {
		if (child.isMesh){
			child.castShadow = true;
			child.receiveShadow = true;
		}
	});
	mixer = new THREE.AnimationMixer(object);
	const action = mixer.clipAction(object.animations[0]);
	action.play();
	robo = object;
	scene.add(robo);
});

window.addEventListener('keydown', (event) =>{
	switch (event.key){
		case 'a':
			robo.rotation.y += 0.1;
			break;
		case 'd':
			robo.rotation.y -= 0.1;
			break;
	}
});

function animate() {
	requestAnimationFrame( animate );
	renderer.render( scene, camera );
	if (mixer) mixer.update(0.01);
	if(robo){
		robo.position.z += 0.05 * Math.cos(robo.rotation.y);
		robo.position.x -= 0.05 * -(Math.sin(robo.rotation.y));

	if (Math.abs(robo.position.z) > 30 || Math.abs(robo.position.x) > 30) {
		robo.position.set(0,0,0);
		}
		spotLight.target = robo;
		spotLightHelper.update();
	}
}

animate();