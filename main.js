import * as THREE from "three";
import * as dat from "dat.gui";
import * as R from "ramda";
import gsap from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

const gui = new dat.GUI();

//configure threejs scene, renderer, camera, light and add cube to scene and render it to the screen

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75,
	window.innerWidth / window.innerHeight,
	0.1,
	1000
);
camera.position.y = 3;
camera.rotateX(-0.1);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const hemiLight = new THREE.HemisphereLight(0x0000ff, 0x00ff00, 2);
const light = new THREE.PointLight(0xffffff, 1.5, 100);
light.castShadow = true;
light.shadow.camera.near = 0.1;
light.shadow.camera.far = 100;
light.position.set(-10, 10, 10);

gui.add(light.position, "x", -10, 10);
gui.add(light.position, "y", -10, 10);
gui.add(light.position, "z", -10, 10);
scene.add(light);
scene.add(hemiLight);
scene.background = new THREE.Color(0xc2f7ff);

camera.position.z = 5;

const loader = new THREE.TextureLoader();
const height = loader.load("displace.jpg");
let tree;

const gltfLoader = new GLTFLoader();

gltfLoader.load("tree.gltf", (gltf) => {
	tree = gltf.scene;
	scene.add(gltf.scene);
});

function World() {
	const wrl = new THREE.Group();

	const ground = new THREE.Mesh(
		new THREE.PlaneGeometry(100, 900, 100, 100),
		new THREE.MeshPhongMaterial({
			color: 0x22d428,
			displacementMap: height,
			displacementScale: 2,
		})
	);
	ground.receiveShadow = true;

	wrl.add(ground);

	return wrl;
}

function Bird() {
	const brd = new THREE.Group();

	const body = new THREE.Mesh(
		new THREE.BoxGeometry(0.5, 0.5, 1.25),
		new THREE.MeshPhongMaterial({
			color: 0xeeeeee,
			shininess: 100,
		})
	);
	body.castShadow = true;

	brd.add(body);

	const wingL = new THREE.Mesh(
		new THREE.BoxGeometry(1, 0.1, 0.75),
		new THREE.MeshPhongMaterial({
			color: 0xeeeeee,
			shininess: 100,
		})
	);
	wingL.castShadow = true;

	wingL.position.x = -0.5;
	wingL.position.y = -0.15;
	wingL.rotateZ(Math.PI / 8);

	brd.add(wingL);

	const wingR = new THREE.Mesh(
		new THREE.BoxGeometry(1, 0.1, 0.75),
		new THREE.MeshPhongMaterial({
			color: 0xeeeeee,
			shininess: 100,
		})
	);
	wingR.castShadow = true;

	wingR.position.x = 0.5;
	wingR.position.y = -0.15;
	wingR.rotateZ(Math.PI / -8);
	brd.add(wingR);

	const head = new THREE.Mesh(
		new THREE.BoxGeometry(0.4, 0.4, 0.7),
		new THREE.MeshPhongMaterial({
			color: 0xeeeeee,
			shininess: 100,
		})
	);
	head.castShadow = true;

	head.position.y = 0.3;
	head.position.z = -0.4;

	brd.add(head);

	function jump() {
		gsap.to(brd.position, {
			duration: 0.5,
			y: brd.position.y + 1,
		});
		const tl = new gsap.timeline();
		tl.to(wingL.rotation, { z: -0.1, duration: 0.1 }, 0).to(
			wingL.rotation,
			{
				z: Math.PI / 4,
				duration: 0.1,
			}
		);
		const tl2 = new gsap.timeline();
		tl2.to(wingR.rotation, { z: 0.1, duration: 0.1 }, 0).to(
			wingR.rotation,
			{
				z: -(Math.PI / 4),
				duration: 0.1,
			}
		);

		gsap.to(brd.rotation, { x: 0.2, duration: 0.1 });
	}

	function animate() {
		gsap.to(wingL.rotation, { z: wingL.rotation.z + 10, duration: 1 });
	}

	return { group: brd, animate, jump };
}

const bird = Bird();
bird.group.castShadow = true;
scene.add(bird.group);

const world = World();
world.receiveShadow = true;
world.rotation.x = -Math.PI / 2;
world.position.y = -5;
scene.add(world);

document.addEventListener("keydown", (e) => {
	if (e.keyCode === 38) {
		bird.animate();
	}
	if (e.keyCode === 32) {
		bird.jump();
	}
});

const animate = function () {
	requestAnimationFrame(animate);
	// bird.group.position.y -= 0.01;
	bird.group.rotation.x = R.clamp(-0.1, 10, bird.group.rotation.x - 0.01);

	document.addEventListener("keydown", (e) => {
		if (e.keyCode === 38) {
			// bird.group.position.y += 0.0005;
		}
		if (e.keyCode === 40) {
			bird.group.position.y -= 0.0001;
		}
		if (e.keyCode === 37) {
			bird.group.position.x -= 0.0001;
		}
		if (e.keyCode === 39) {
			bird.group.position.x += 0.0001;
		}
		if (e.keyCode === 87) {
			bird.group.position.z += 0.0001;
		}
		if (e.keyCode === 83) {
			bird.group.position.z -= 0.0001;
		}
	});

	renderer.render(scene, camera);
};

animate();
