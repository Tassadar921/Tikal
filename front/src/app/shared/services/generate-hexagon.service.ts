import { Injectable } from '@angular/core';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

@Injectable({
  providedIn: 'root'
})
export class GenerateHexagonService {

  private modelLoader = new GLTFLoader();

  constructor() {}

  generateHexagon = (x, y, matrix, draggableObjects, lines, col, radius, plane, letter, draggable = true) => {
    //calculating graphic xy of cylinder from matrix's xy
    const cylinderX = x * (radius * Math.cos(2 * Math.PI) + 2*radius);
    const cylinderY = -y*radius*Math.cos(Math.PI/6);

    //creating shape of regular cylinder of 6 segments => hexagon in 3D
    const geometry = new THREE.CylinderGeometry(radius, radius, radius / 5, 6);

    //id linked with sides to add textures to cylinder
    //i=0: sides
    //i=1: top
    //i=2: bottom
    const materials = [];

    if (!draggable) { //transparent hexagon
      materials.push(new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
      materials.push(new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
      materials.push(new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
    } else { //we add textures
      materials.push(new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/dirt.png')}));
      materials.push(new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/herbe.png')}));
      materials.push(new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/back'+letter+'.png')}));
    }

    //creating 3D object
    const cylinder = new THREE.Mesh(geometry, materials);

    //rotating object in XY-plane
    cylinder.rotateX(Math.PI / 2);
    cylinder.rotateY(-Math.PI/2);

    //updating xy of 3D object from cylinderX and cylinderY
    cylinder.position.x = cylinderX / 2 - Math.floor(col / 2) * (radius + radius * Math.sin(Math.PI / 6)) + radius * Math.sin(Math.PI / 6);
    cylinder.position.y = cylinderY + lines * radius * Math.cos(Math.PI / 6) / Math.PI;

    if (!draggable) {//adding visible edges
      const edgeGeometry = new THREE.EdgesGeometry(geometry);
      const edgeMaterial = new THREE.LineBasicMaterial({color: 'lightGreen'});
      const edgeWireframe = new THREE.LineSegments(edgeGeometry, edgeMaterial);

      cylinder.add(edgeWireframe);

      cylinder.userData = {
        piecePlaced:false,
        draggable:false,
        x:y,
        y:x
      };

      if (x === 0 && y === 0) {//starting hexagon, special texture and visible
        cylinder.userData.piecePlaced = true;
        cylinder.children = [];
        cylinder.visible = true;
        cylinder.material[0] = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/dirt.png')});
        cylinder.material[1] = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/herbe.png')});
        cylinder.material[2] = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/back.png')});
      }else{
        cylinder.visible = false;
      }
      //x and y on graphics and in matrix are inverted
      //saving xy coo of object which is in the matrix in object

      //it becomes a pointer : updating in the matrix will update on graphics
      matrix[y][x] = cylinder;
      plane.add(cylinder);
    } else {//if draggable => pushing in objects
      cylinder.userData = {
        draggable:true
      };
      cylinder.visible = true;
      draggableObjects = [cylinder];
      plane.add(cylinder);
    }

    return {draggableObjects, plane, matrix, cylinder};

  };

  addTree = (tile, position, scene) => {
    this.modelLoader.load('./assets/arbre.gltf', (gltf) => {
      gltf.scene.position.setX(tile.position.x);
      gltf.scene.position.setY(0);
      gltf.scene.position.setZ(tile.position.z);
      tile.add(gltf.scene);
    });
    return tile;
  };
}