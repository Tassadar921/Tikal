import {Injectable} from '@angular/core';
import * as THREE from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import {GameService} from './game.service';

@Injectable({
  providedIn: 'root'
})
export class GenerateHexagonService {

  private cooSommets = [];
  private cooMiddleSides = [];

  private modelLoader = new GLTFLoader();

  constructor(
    private gameService: GameService
  ) {}


  initCooPoints = (radius) => {
    const h = Math.sqrt(3) / 2 * radius;
    this.cooSommets = [
      {x:h, y:radius/2},
      {x:0, y:radius},
      {x:-h, y:radius/2},
      {x:-h, y:-radius/2},
      {x:0, y:-radius},
      {x:h, y:-radius/2},
    ];

    this.cooMiddleSides = [
      {x:0, y:-h+radius/40},
      {x:-3/4*radius, y:-h/2},
      {x:-3/4*radius, y:h/2},
      {x:0, y:h-radius/40},
      {x:3/4*radius, y:h/2},
      {x:3/4*radius, y:-h/2},
    ]
  };

  getDirection = (direction) => {
    switch(direction) {
      case 'north':
        return 0;
      case 'northEast':
        return 1;
      case 'southEast':
        return 2;
      case 'south':
        return 3;
      case 'southWest':
        return 4;
      case 'northWest':
        return 5;
    }
    return 0;
  }

  generateHexagon = (x, y, matrix, draggableObjects, lines, col, radius, plane, draggable = true) => {
    //calculating scene xy of cylinder from matrix's xy
    const cylinderX = x * (radius * Math.cos(2 * Math.PI) + 2 * radius);
    const cylinderY = -y * radius * Math.cos(Math.PI / 6);

    //creating shape of regular cylinder of 6 segments => hexagon in 3D
    const geometry = new THREE.CylinderGeometry(radius, radius, radius / 5, 6);

    //id linked with sides to add textures to cylinder
    //i=0: sides
    //i=1: top
    //i=2: bottom
    const materials = [];

    let tileData;

    if (!draggable) { //transparent hexagon
      materials.push(new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
      materials.push(new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
      materials.push(new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
    } else { //we add textures
      tileData = this.gameService.getTile();
      materials.push(new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/dirt.png')}));
      materials.push(new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/herbe.png')}));
      materials.push(new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/back' + tileData.id[0] + '.png')}));
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

      //xy reversed to find the object in matrix with this.matrix[userData.x][userData.y]
      cylinder.userData = {
        piecePlaced: false,
        draggable: false,
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
        tile: tileData
      };
      cylinder.visible = true;
      draggableObjects = [cylinder];
      plane.add(cylinder);
    }

    return {draggableObjects, plane, matrix, cylinder};

  };

  addTree = (tile) => {
    for(const coo of this.cooSommets) {
      const num = Math.ceil(Math.random() * 5);
      this.modelLoader.load('./assets/3Dmodels/arbre' + num + '.gltf', (gltf) => {
        if (num === 2 || num === 3) {
          gltf.scene.scale.set(1+Math.random(), 1+Math.random(), 1+Math.random());
        }else{
          gltf.scene.scale.set(Math.random()+0.2,Math.random()+0.2,Math.random()+0.2);
        }

        const initX = gltf.scene.position.x;
        const initY = gltf.scene.position.y;

        gltf.scene.position.x += coo.x;
        gltf.scene.position.z += coo.y;

        gltf.scene.rotateY(Math.random()*Math.PI);
        gltf.scene.userData = {x:gltf.scene.position.x-initX, z:gltf.scene.position.z-initY};
        tile.add(gltf.scene);
      });
    }
    return tile;
  };

  //rotates the tile's texture + paths' directions in userData.tile
  rotate = (tile) => {
    tile.rotateY(-Math.PI / 3);
    const tmp = tile.userData.tile.directions.north;
    tile.userData.tile.directions.north = tile.userData.tile.directions.northWest;
    tile.userData.tile.directions.northWest = tile.userData.tile.directions.southWest;
    tile.userData.tile.directions.southWest = tile.userData.tile.directions.south;
    tile.userData.tile.directions.south = tile.userData.tile.directions.southEast;
    tile.userData.tile.directions.southEast = tile.userData.tile.directions.northEast;
    tile.userData.tile.directions.northEast = tmp;
    return tile;
  };

  addPath = (tile, radius) => {
    for(const direction in tile.userData.tile.directions){
      if(tile.userData.tile.directions[direction]){
        tile = this.drawPath(tile, direction, tile.userData.tile.directions[direction], radius);
      }
    }
    return tile;
  };

  drawPath = (tile, direction, value, radius) => {
    for(let val=0; val<value; val++) {
      tile = this.addStonePath(tile, direction, val, radius);
    }
    return tile;
  };

  addStonePath = (tile, direction, value, radius) => {
    const width = radius/6;
    const height = radius/10;
    const geometry = new THREE.BoxGeometry( height, 1, width );
    const material = new THREE.MeshBasicMaterial( {map: new THREE.TextureLoader().load('./assets/pathTexture.jpg')} );
    const rock = new THREE.Mesh( geometry, material );

    rock.position.z = this.cooMiddleSides[this.getDirection(direction)].x;
    rock.position.x = this.cooMiddleSides[this.getDirection(direction)].y;

    rock.position.y = radius/10-1/4;
    rock.rotateY(-Math.PI/3 * this.getDirection(direction)%3);
    if(rock.position.z<0){
      rock.position.z += height/2 + 1.3 * height*value;
    }else if(rock.position.z>0){
      rock.position.z -= height/2 + 1.3 * height*value;
    }
    if(rock.position.x<0){
      rock.position.x += height/2 + 1.3 * height*value;
    }else if(rock.position.x>0){
      rock.position.x -= height/2 + 1.3 * height*value;
    }
    console.log(tile.position);
    console.log(rock.position);

    const initX = tile.position.x;
    const initY = tile.position.y;

    rock.userData = {x:rock.position.x, z:rock.position.z};
    tile.add(rock);
    return tile;
  };
}
