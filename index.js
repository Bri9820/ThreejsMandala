import * as THREE from 'three'
import { OrbitControls } from 'jsm/controls/OrbitControls.js'
import { OBJLoader } from "jsm/loaders/OBJLoader.js";



const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w/h, 0.1, 1000);
camera.position.z = 10;
const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(w, h);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.03;

const btn = document.getElementById('color-btn');

const mandalaGroup = new THREE.Group();
scene.add(mandalaGroup);

const startHue = Math.random() * 0.5 + 0.5;
//the list of data geometries is passed through here




//refreshes the page with a click of a button
btn.addEventListener('click', () => {
    window.location.reload();
});

function initScene(data){
    console.log(data);
    //upload the data into goes
    const { geos } = data;
    const textureLoader = new THREE.TextureLoader();
    const matcap = textureLoader.load('./textures/black-n-shiney2.jpg');
    
    //generates the 3D items with instance mesh
    function getInstanced(geometry, index){
        //calculate the number of objs in each ring
        const numObjs = 8 + index * 4;
        //the angle for setting the quanternion axis
        const step = (Math.PI * 2) / numObjs;
        //colors * index / 10 randomly changes the color for each row
        const color = new THREE.Color().setHSL(startHue * index / 10, 1.0, 0.5)
        //materials of each object
        const material = new THREE.MeshMatcapMaterial({matcap, color: color, flatShading: true});
        //mesh for each object
        const instaMesh = new THREE.InstancedMesh(geometry, material, numObjs);
        const matrix = new THREE.Matrix4();
        //used to set the Vector3 Scalar or scale
        const size = 0.5;
        //space between each object
        const radius = 1 + index * 1.05;
        //the axis for the quaternion 
        const axis = new THREE.Vector3(0, 0, 1);
        //the actual generating of the objexts
        for(let i = 0; i < numObjs; i += 1){
            //how to align each object  in a circle
            //determines the x, y, z alignment of each item
            //cos and sin generate the cirular shape of the rings 
            const x = Math.cos(step * i) * radius;
            const y = Math.sin(step * i) * radius;
            //z axis this pushes the center forward and moves the rest of the rings back
            const z = -0.5 + index * -0.25;
            //positions of the ojb
            const position = new THREE.Vector3(x, y, z);
            //quaternion is needed for the matrix
            const quaternion = new THREE.Quaternion();
            quaternion.setFromAxisAngle(axis, i * step)
            const scale = new THREE.Vector3().setScalar(size);
            //passing everyting into the Matrix4
            matrix.compose(position, quaternion, scale);
            //creates and instance mesh with the matrix information and index
            instaMesh.setMatrixAt(i, matrix);

        }
        //returns the instance mesh
        return instaMesh;
    }

    //adds directional light which is the main light
    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set( 2, 2, 2);
    scene.add(mainLight)
    
    //adds ambient light which shines on sides that don't get directional light
    const ambientLight = new THREE.AmbientLight();
    scene.add(ambientLight);



    const box = new THREE.BoxGeometry();
    const ball = new THREE.SphereGeometry(0.66, 16, 16);
    const pretzel = new THREE.TorusKnotGeometry(0.5, 0.2, 100, 16);
    const cone = new THREE.ConeGeometry(0.5, 1, 16);
    // const geoms = [box, ball, pretzel, cone];

    //decide on the number of rings you want
    const numRings = 10;
    for(let i = 0; i < numRings; i++){
        // let gIndex = Math.floor(Math.random() * geos.length);
        //go through for loop and cal the gIndex
        //this allows the order of the  items to be decided randomly
        let gIndex = i % geos.length;
        //pass in the geos and the gIndex along with i into the getInstanced function
        const ring = getInstanced(geos[gIndex], i);
        mandalaGroup.add(ring)
    }

    //adding middle piece
    const color = new THREE.Color().setHSL(startHue, 1.0, 0.5)
    const middleP = new THREE.Mesh(pretzel, new THREE.MeshMatcapMaterial({matcap, color: color, flatShading: true}));
    scene.add(middleP);

    // const material = new THREE.MeshStandardMaterial({color: '#53DFBA'});
    // const cube = new THREE.Mesh(box, material);

    // scene.add(cube);

    // const ring = getInstanced(box);
    // scene.add(ring);

    

    function animate(){
        requestAnimationFrame(animate);
        // mandalaGroup.rotation.z += 0.002
        mandalaGroup.children[1].rotation.z += 0.002;
        mandalaGroup.children[3].rotation.z += 0.002;
        mandalaGroup.children[5].rotation.z += 0.002;
        mandalaGroup.children[7].rotation.z += 0.002;
        mandalaGroup.children[9].rotation.z += 0.002;
        mandalaGroup.children[0].rotation.z -= 0.002;
        mandalaGroup.children[2].rotation.z -= 0.002;
        mandalaGroup.children[4].rotation.z -= 0.002;
        mandalaGroup.children[6].rotation.z -= 0.002;
        mandalaGroup.children[8].rotation.z -= 0.002;
        
        renderer.render(scene, camera);
        controls.update();
    }
    console.log(mandalaGroup);
    
    animate();
}
//finish populating scene with meshes until the obj is loaded
//below and entire list is loaded then populate the sceneData which is then passed 
// into initScene where the objects are generated and rendered
const sceneData = { geos: [] };
const manager = new THREE.LoadingManager();
//watch the events
manager.onLoad = () => initScene(sceneData);
const loader = new OBJLoader(manager);

const objs = [
    'A_12',
    'B_01',
    'B_10',
    'D_08',
    'D_16',
    'goldfish3',
    'H_07',
    'skull2',
];
const path = './objects/'
objs.forEach((obj) => {
    loader.load(`${path}${obj}.obj`, (obj) => {
        //go through the children and find the ones that are meshes
        // console.log(obj);
        obj.traverse((child) => {
            if(child.isMesh){
                
                //child.material = new THREE.MeshMatcapMaterial({matcap, flatShading: true});
                sceneData.geos.push(child.geometry);
            }
        })
        
    });
});


//Handles window resizing
window.addEventListener('resize', () => {
    //updates the matrix for the orbit camera
    camera.aspect = w/h;
    camera.updateProjectionMatrix();
});