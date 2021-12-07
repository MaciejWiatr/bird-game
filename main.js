import * as THREE from "three";
import * as R from "ramda";
import gsap from "gsap";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader";
import "./style.scss";

const main = async function () {
	let playing = false;
	const scene = new THREE.Scene();
	const camera = new THREE.PerspectiveCamera(
		80,
		window.innerWidth / window.innerHeight,
		0.1,
		1000
	);
	camera.position.y = 3;
	camera.rotateX(-0.1);
	const startButton = document.querySelector("#start-button");
	const endButton = document.querySelector("#end-button");
	const titleScreen = document.querySelector(".title-screen");
	const endScreen = document.querySelector(".end-screen");
	const renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.shadowMap.enabled = true;
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);
	const hemiLight = new THREE.HemisphereLight(0xc1eef5, 2);
	const light = new THREE.PointLight(0xffffff, 1.5, 100);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 100;
	light.position.set(10, -4, 2);
	scene.add(light);
	scene.add(hemiLight);
	scene.background = new THREE.Color(0xc2f7ff);

	camera.position.z = 5;

	const loader = new THREE.TextureLoader();
	const height = loader.load("displace.png");

	const gltfLoader = new GLTFLoader();
	const dracoLoader = new DRACOLoader();
	dracoLoader.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
	gltfLoader.setDRACOLoader(dracoLoader);
	const treeGltf = await gltfLoader.loadAsync("tree.gltf");
	let tree = treeGltf.scene;
	tree.scale.set(0.7, 0.7, 0.7);

	const rocksGltf = await gltfLoader.loadAsync("rocks.gltf");
	let rocks = rocksGltf.scene;

	const bigRock = await gltfLoader.loadAsync("bigRock.gltf");
	let rockBig = bigRock.scene;

	const plantGltf = await gltfLoader.loadAsync("plant.gltf");
	let plant = plantGltf.scene;

	const houseGltf = await gltfLoader.loadAsync("house.gltf");
	let house = houseGltf.scene;

	function World() {
		const wrl = new THREE.Group();

		const water = new THREE.Mesh(
			new THREE.PlaneGeometry(1800, 1800, 100, 100),
			new THREE.MeshPhongMaterial({
				color: 0x80c3ed,
				displacementMap: height,
			})
		);
		water.receiveShadow = true;
		water.rotation.x = -Math.PI / 2;
		water.position.y = -1;
		wrl.add(water);

		const ground = new THREE.Mesh(
			new THREE.PlaneGeometry(200, 900, 100, 100),
			new THREE.MeshPhongMaterial({
				color: 0x234a22,
			})
		);
		ground.receiveShadow = true;
		ground.rotation.x = -Math.PI / 2;
		wrl.add(ground);

		for (let i = 0; i < 500; i++) {
			let treeClone = tree.clone();
			treeClone.receiveShadow = true;
			treeClone.castShadow = true;
			treeClone.position.x = Math.random() * 100 - 50;
			treeClone.position.z = Math.random() * 900 - 450;
			treeClone.rotateY = Math.random() * 360;
			wrl.add(treeClone);
		}

		for (let i = 0; i < 500; i++) {
			let rockClone = rocks.clone();
			rockClone.scale.set(7, 7, 7);
			rockClone.receiveShadow = true;
			rockClone.castShadow = true;
			rockClone.position.x = Math.random() * 100 - 50;
			rockClone.position.z = Math.random() * 900 - 450;
			wrl.add(rockClone);
		}

		for (let i = 0; i < 50; i++) {
			let rockClone = rocks.clone();
			rockClone.scale.set(50, 75, 50);
			rockClone.receiveShadow = true;
			rockClone.castShadow = true;
			rockClone.position.x = -60;
			rockClone.position.z = Math.random() * 900 - 450;
			rockClone.rotateY = Math.random() * 360;
			rockClone.position.y = Math.floor(Math.random() * 20) - 20;
			wrl.add(rockClone);
		}
		for (let i = 0; i < 50; i++) {
			let rockClone = rocks.clone();
			rockClone.scale.set(50, 75, 50);
			rockClone.receiveShadow = true;
			rockClone.castShadow = true;
			rockClone.position.x = 80;
			rockClone.position.z = Math.random() * 900 - 450;
			rockClone.rotateY = Math.random() * 360;
			rockClone.position.y = Math.floor(Math.random() * 20) - 20;
			wrl.add(rockClone);
		}

		for (let i = 0; i < 900; i++) {
			let plantClone = plant.clone();
			plantClone.scale.set(2, 2, 2);
			plantClone.receiveShadow = true;
			plantClone.castShadow = true;
			plantClone.position.x = Math.random() * 100 - 50;
			plantClone.position.z = Math.random() * 900 - 450;
			wrl.add(plantClone);
		}

		rockBig.scale.set(200, 100, 100);
		house.scale.set(10, 10, 10);
		house.position.x = 0;
		house.position.z = -425;
		house.position.y = 64.5;

		// houseMountain.add(house);

		rockBig.position.set(-1050, -20, 400);
		wrl.add(rockBig);
		wrl.add(house);

		wrl.receiveShadow = true;

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

		const nose = new THREE.Mesh(
			new THREE.BoxGeometry(0.2, 0.1, 0.2),
			new THREE.MeshPhongMaterial({
				color: 0xf59842,
				shininess: 100,
			})
		);
		nose.castShadow = true;
		nose.position.y = 0.25;
		nose.position.z = -0.9;

		brd.add(nose);

		const legL = new THREE.Mesh(
			new THREE.BoxGeometry(0.1, 0.3, 0.1),
			new THREE.MeshPhongMaterial({
				color: 0xf2f7b2,
				shininess: 100,
			})
		);

		legL.position.y = -0.3;
		legL.position.x = -0.15;

		brd.add(legL);

		const legR = new THREE.Mesh(
			new THREE.BoxGeometry(0.1, 0.3, 0.1),
			new THREE.MeshPhongMaterial({
				color: 0xf2f7b2,
				shininess: 100,
			})
		);

		legR.position.y = -0.3;
		legR.position.x = 0.15;

		brd.add(legR);

		function jump() {
			const value = Math.abs((brd.rotation.z % Math.PI).toFixed(2));
			const isRound = value === 3.14 || value === 0;

			if (!isRound) {
				gsap.to(brd.rotation, { z: 0, duration: 1 }).then(() => {
					brd.rotation.z = 0;
				});
			}

			gsap.to(brd.position, {
				duration: 0.5,
				y: brd.position.y + 1,
			});
			gsap.to(world.position, {
				duration: 0.5,
				y: world.position.y - 4,
			});
			const tl = new gsap.timeline();
			tl.to(wingL.rotation, { z: -0.1, duration: 0.1 }, 0).to(
				wingL.rotation,
				{
					z: Math.PI / 8,
					duration: 0.1,
				}
			);
			const tl2 = new gsap.timeline();
			tl2.to(wingR.rotation, { z: 0.1, duration: 0.1 }, 0).to(
				wingR.rotation,
				{
					z: -(Math.PI / 8),
					duration: 0.1,
				}
			);

			gsap.to(brd.rotation, { x: 0.5, duration: 0.1 });
		}

		function turn(dir) {
			if (dir === "left") {
				gsap.to(brd.rotation, {
					z: brd.rotation.z + 2 * Math.PI,
					duration: 1,
				});
				gsap.to(brd.position, {
					x: brd.position.x - 1,
					duration: 1,
				});
			} else {
				gsap.to(brd.rotation, {
					z: brd.rotation.z - 2 * Math.PI,
					duration: 1,
				});
				gsap.to(brd.position, {
					x: brd.position.x + 1,
					duration: 1,
				});
			}
			// todo dont return if actively turning
		}

		return { group: brd, jump, turn };
	}

	const bird = Bird();
	bird.group.castShadow = true;
	scene.add(bird.group);

	const world = World();
	world.receiveShadow = true;

	world.position.z = -200;
	world.position.y = -20;
	scene.add(world);

	document.addEventListener("keydown", (e) => {
		if (playing) {
			if (e.keyCode === 32) {
				bird.jump();
			}
			if (e.keyCode === 37) {
				bird.turn("left");
			}
			if (e.keyCode === 39) {
				bird.turn("right");
			}
		}
	});

	const geometry = new THREE.CircleGeometry(1, 32);
	const material = new THREE.MeshBasicMaterial({ color: 0x303030 });
	const circle = new THREE.Mesh(geometry, material);
	circle.position.y = 4.5;
	circle.position.z = -0.5;
	scene.add(circle);

	const enterAnim = new gsap.timeline()
		.from(
			bird.group.rotation,
			{
				y: -Math.PI / 1.2,
			},
			0
		)
		.from(
			bird.group.position,
			{
				y: 4.5,
			},
			0
		)
		.pause();

	const animate = function () {
		requestAnimationFrame(animate);
		if (playing) {
			enterAnim.play().then(() => {
				scene.remove(circle);
			});
			bird.group.position.y = R.clamp(
				-1.5,
				10,
				bird.group.position.y - 0.01
			);
			bird.group.rotation.x = R.clamp(
				-0.1,
				10,
				bird.group.rotation.x - 0.01
			);
			world.position.z = R.clamp(-999, 420, world.position.z + 0.3);
			world.position.y = R.clamp(-70, 999, world.position.y - 0.01);
			if (world.position.z >= 420) end();
		}

		renderer.render(scene, camera);
	};

	window.addEventListener("resize", onWindowResize, false);

	const end = () => {
		playing = false;
		endScreen.classList.remove("disabled");
	};

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	startButton.addEventListener("click", () => {
		playing = true;
		titleScreen.classList.add("disabled");
		endButton.addEventListener("click", () => {
			window.location.reload();
		});
	});

	animate();
};

main();
