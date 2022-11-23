import {Injectable} from '@angular/core';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {GameService} from './game.service';

@Injectable({
  providedIn: 'root'
})
export class GenerateHexagonService {

  public cooPoints = [];

  private modelLoader = new GLTFLoader();

  constructor(
    private gameService: GameService
  ) {}


  initCooPoints = (radius) => {
    const h = Math.sqrt(3) / 2 * radius;
    this.cooPoints = [
      {x:radius/2, y:h},
      {x:radius, y:0},
      {x:radius/2, y:-h},
      {x:-radius/2, y:-h},
      {x:-radius, y:0},
      {x:-radius/2, y:h},
    ];
  };

  generateHexagon = (x, y, matrix, draggableObjects, lines, col, radius, plane, letter, draggable = true) => {
    //calculating graphic xy of cylinder from matrix's xy
    const cylinderX = x * (radius * Math.cos(2 * Math.PI) + 2 * radius);
    const cylinderY = -y * radius * Math.cos(Math.PI / 6);

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
      materials.push(new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/back' + letter + '.png')}));
    }

    //creating 3D object
    let cylinder = new THREE.Mesh(geometry, materials);

    //rotating object in XY-plane
    cylinder.rotateX(Math.PI / 2);
    cylinder.rotateY(-Math.PI / 2);

    //updating xy of 3D object from cylinderX and cylinderY
    cylinder.position.x = cylinderX / 2 - Math.floor(col / 2) * (radius + radius * Math.sin(Math.PI / 6)) + radius * Math.sin(Math.PI / 6);
    cylinder.position.y = cylinderY + lines * radius * Math.cos(Math.PI / 6) / Math.PI;

    if (!draggable) {//adding visible edges
      const edgeGeometry = new THREE.EdgesGeometry(geometry);
      const edgeMaterial = new THREE.LineBasicMaterial({color: 'lightGreen'});
      const edgeWireframe = new THREE.LineSegments(edgeGeometry, edgeMaterial);

      cylinder.add(edgeWireframe);

      cylinder.userData = {
        piecePlaced: false,
        draggable: false,
        x: y,
        y: x
      };

      if (x === 0 && y === 0) {//starting hexagon, special texture and visible
        cylinder.userData.piecePlaced = true;
        cylinder.children = [];
        cylinder.visible = true;
        cylinder.material[0] = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/dirt.png')});
        cylinder.material[1] = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/herbe.png')});
        cylinder.material[2] = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/back.png')});
        cylinder = this.addTree(cylinder);
      } else {
        cylinder.visible = false;
      }
      //x and y on graphics and in matrix are inverted
      //saving xy coo of object which is in the matrix in object

      //it becomes a pointer : updating in the matrix will update on graphics
      matrix[y][x] = cylinder;
      plane.add(cylinder);
    } else {//if draggable => pushing in objects
      cylinder.userData = {
        draggable: true,
        tile: this.gameService.getTile(),
      };
      cylinder.visible = true;
      draggableObjects = [cylinder];
      plane.add(cylinder);
    }

    return {draggableObjects, plane, matrix, cylinder};

  };

  addTree = (tile) => {
    for(const coo of this.cooPoints) {
      const num = Math.ceil(Math.random() * 5);
      this.modelLoader.load('./assets/3Dmodels/arbre' + num + '.gltf', (gltf) => {
        if (num === 2 || num === 3) {
          gltf.scene.scale.set(1+Math.random(), 1+Math.random(), 1+Math.random());
        }else{
          gltf.scene.scale.set(Math.random()+0.2,Math.random()+0.2,Math.random()+0.2);
        }

        const initX = gltf.scene.position.x;
        const initY = gltf.scene.position.y;

        gltf.scene.position.x += coo.y;
        gltf.scene.position.z += coo.x;

        gltf.scene.rotateY(Math.random()*Math.PI);
        gltf.scene.userData = {x:gltf.scene.position.x-initX, y:gltf.scene.position.z-initY};
        tile.add(gltf.scene);
      });
    }
    return tile;
  };

  rotate = (tile) => {
    tile.rotateY(-Math.PI / 3);
    const tmp = tile.userData.tile.directions.north;
    console.log(tile.userData.tile.directions);
    tile.userData.tile.directions.north = tile.userData.tile.directions.northWest;
    tile.userData.tile.directions.northWest = tile.userData.tile.directions.southWest;
    tile.userData.tile.directions.southWest = tile.userData.tile.directions.south;
    tile.userData.tile.directions.south = tile.userData.tile.directions.southEast;
    tile.userData.tile.directions.southEast = tile.userData.tile.directions.northEast;
    tile.userData.tile.directions.northEast = tmp;
    console.log(tile.userData.tile.directions);
    return tile;
  };
}
