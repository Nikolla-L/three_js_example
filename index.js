import * as THREE from "https://unpkg.com/three@0.126.1/build/three.module.js";
import { OrbitControls } from "https://unpkg.com/three@0.126.1/examples/jsm/controls/OrbitControls.js";

const guy = new dat.GUI();
const world = {
    plane: {
        width: 19,
        height: 19,
        widthSegments: 17,
        heightSegments: 17
    }
}

const generatePlane = () => {
    planeMesh.geometry.dispose();
    planeMesh.geometry = new THREE.PlaneGeometry(world.plane.width, world.plane.height, world.plane.widthSegments,  world.plane.heightSegments);
    
    const arr = planeMesh.geometry.attributes.position.array;
    for (let i = 3; i < arr.length; i+=3) {
        const x = arr[i];
        const y = arr[i+1];
        const z = arr[i+2];

        arr[i + 2] = z + Math.random()
    }
    const colors = [];
    for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
        colors.push(0, .19, .4);
    }
    planeMesh.geometry.setAttribute(
        'color',
        new THREE.BufferAttribute(
            new Float32Array(colors),
            3
        )
    );
}

guy.add(world.plane, 'width', 1, 20)
    .onChange(() => {
    generatePlane()
})

guy.add(world.plane, 'height', 1, 20)
    .onChange(() => {
    generatePlane()
})

guy.add(world.plane, 'widthSegments', 1, 50)
    .onChange(() => {
    generatePlane()
})

guy.add(world.plane, 'heightSegments', 1, 50)
    .onChange(() => {
    generatePlane()
})

const raycaster = new THREE.Raycaster();
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(devicePixelRatio);
document.body.appendChild(renderer.domElement);

new OrbitControls(camera, renderer.domElement);
camera.position.z = 5;

const planeGeometry = new THREE.PlaneGeometry(19, 19, 17, 17);
const planeMaterial = new THREE.MeshPhongMaterial({
    side: THREE.DoubleSide,
    flatShading: THREE.FlatShading,
    vertexColors: true
});
const planeMesh = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(planeMesh);

const arr = planeMesh.geometry.attributes.position.array;
const randomValues = [];
for (let i = 3; i < arr.length; i+=3) {
    const x = arr[i];
    const y = arr[i+1];
    const z = arr[i+2];

    arr[i] = x + (Math.random() - 0.5);
    arr[i + 1] = y + (Math.random() - 0.5);
    arr[i + 2] = z + Math.random();

    randomValues.push(Math.random());
}

planeMesh.geometry.attributes.position.randomValues = randomValues
planeMesh.geometry.attributes.position.originalPosition = planeMesh.geometry.attributes.position.array

const colors = [];
for (let i = 0; i < planeMesh.geometry.attributes.position.count; i++) {
    colors.push(0, .19, .4);
}
planeMesh.geometry.setAttribute(
    'color',
    new THREE.BufferAttribute(
        new Float32Array(colors),
        3
    )
);

const light = new THREE.DirectionalLight('aqua', 1);
light.position.set(0, 0, 1);
scene.add(light);

const backLight = new THREE.DirectionalLight('white', 1);
backLight.position.set(0, 0, -1);
scene.add(backLight);

const mouse = {
    x: undefined,
    y: undefined
}

let frame = 0
const animate = () => {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    raycaster.setFromCamera(mouse, camera);
    frame += .01;

    const { array, originalPosition, randomValues } = planeMesh.geometry.attributes.position
    for(let i = 0; i < array.length; i+=3) {
        array[i] = originalPosition[i] + Math.cos(frame) * .01;
    }
    planeMesh.geometry.attributes.position.needsUpdate = true;

    const intersects = raycaster.intersectObject(planeMesh);
    if(intersects.length>0) {
        const { color } = intersects[0].object.geometry.attributes

        color.setX(intersects[0].face.a, .1)
        color.setY(intersects[0].face.a, .5)
        color.setZ(intersects[0].face.a, 1)

        color.setX(intersects[0].face.b, .1)
        color.setY(intersects[0].face.b, .5)
        color.setZ(intersects[0].face.b, 1)

        color.setX(intersects[0].face.c, .1)
        color.setY(intersects[0].face.c, .5)
        color.setZ(intersects[0].face.c, 1)

        color.needsUpdate = true

        const initialColor = {
            r: 0,
            g: .19,
            b: .4
        }
        const hoverColor = {
            r: .1,
            g: .5,
            b: 1
        }
        gsap.to(hoverColor, {
            r: initialColor.r,
            g: initialColor.g,
            b: initialColor.b,
            onUpdate: () => {
                color.setX(intersects[0].face.a, hoverColor.r)
                color.setY(intersects[0].face.a, hoverColor.g)
                color.setZ(intersects[0].face.a, hoverColor.b)
        
                color.setX(intersects[0].face.b, hoverColor.r)
                color.setY(intersects[0].face.b, hoverColor.g)
                color.setZ(intersects[0].face.b, hoverColor.b)
        
                color.setX(intersects[0].face.c, hoverColor.r)
                color.setY(intersects[0].face.c, hoverColor.g)
                color.setZ(intersects[0].face.c, hoverColor.b)
                color.needsUpdate = true
            }
        })
    }
}

animate();

addEventListener('mousemove', e => {
    mouse.x = (e.clientX / innerWidth) * 2 - 1
    mouse.y = -(e.clientY / innerHeight) * 2 + 1
});