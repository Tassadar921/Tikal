import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {DragControls} from 'three/examples/jsm/controls/DragControls';
import {InitializationService} from '../shared/services/initialization.service';
import {GenerateHexagonService} from '../shared/services/generate-hexagon.service';
import {ApiService} from '../shared/services/api.service';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {

  @Input() name: string;
  @ViewChild('canvas') canvasRef: ElementRef;

  private renderer = new THREE.WebGLRenderer();
  private scene;
  private camera;
  private controls;
  private plane;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private matrix;
  private draggableObjects = [];
  private dragControls;

  constructor(
    private initializationService: InitializationService,
    private generateHexagonService: GenerateHexagonService,
    private apiService: ApiService
  ) {
  }

  async ngAfterViewInit() {
    //col and lines of the board, radius of hexagons
    const lines = 8;
    const col = 10;
    const radius = 10;
    const fps = 60;

    this.plane = this.initializationService.configPlane(lines, col, radius);
    this.scene = this.initializationService.configScene(this.plane);
    this.camera = this.initializationService.configCamera(this.canvas, this.scene);
    this.renderer = this.initializationService.configRenderer(this.canvas);
    this.controls = this.initializationService.configControls(this.canvas, this.camera);
    this.matrix = this.initializationService.initMatrix(lines, col);

    this.scene.add(this.initializationService.configLight());

    this.generateHexagonService.initCooPoints(radius);

    //save xy in case of non-droppable place in which object is dropped
    const cooBeforeDrag = {x: 0, y: 0, z: 0};

    //gen of matrix, like

    //[ object, '', object, '', object]
    //[ '', object, '', object, '']
    //[ object, '', object, '', object]
    //[ '', object, '', object, '']

    //thought to make operations easier on neightbours
    for (let y = 0; y < lines; y++) {
      for (let x = 0; x < col; x++) {
        if ((y + 1) % 2) { //if index of line is even
          if ((x + 1) % 2) { //if index of col is even
            this.generateHexagon(x, y, this.matrix, this.draggableObjects, lines, col, radius, this.plane, '', cooBeforeDrag, false);
          }
        } else {
          if (x % 2) { //if line and col both odd
            this.generateHexagon(x, y, this.matrix, this.draggableObjects, lines, col, radius, this.plane, '', cooBeforeDrag, false);
          }
        }
      }
    }

    //creating a draggable object for testing
    this.generateHexagon(5, -2, this.matrix, this.draggableObjects, lines, col, radius, this.plane, 'A', cooBeforeDrag, true);
    //fires each time pointer moves
    this.renderer.domElement.addEventListener('pointermove', (e) => {
      //normalized coo of pointer
      this.pointer.x = (e.clientX / this.renderer.domElement.width) * 2 - 1;
      this.pointer.y = -(e.clientY / this.renderer.domElement.height) * 2 + 1;
    });

    console.log(this.scene.children);

    setInterval(this.animate, 1000 / fps);
  }

  generateHexagon = (x, y, matrix, draggableObjects, lines, col, radius, plane, letter, cooBeforeDrag, draggable) => {
    const hexagonRtrn = this.generateHexagonService.generateHexagon(
      x, y, matrix, draggableObjects, lines, col, radius, plane, letter, draggable);
    this.draggableObjects = hexagonRtrn.draggableObjects;
    this.plane = hexagonRtrn.plane;
    this.matrix = hexagonRtrn.matrix;
    if (draggable) {
      this.dragControls = new DragControls(this.draggableObjects, this.camera, this.renderer.domElement);
      this.dragControls.transformGroup = true;
      this.setDraggableEvents(lines, col, radius, cooBeforeDrag);
      this.draggableObjects[0] = this.generateHexagonService.addTree(hexagonRtrn.cylinder);
    }
  };

  setDraggableEvents = (lines, col, radius, cooBeforeDrag) => {
    //fires when dragging starts
    this.dragControls.addEventListener('dragstart', (e) => {
      //disable OrbitControls, if we don't it's total chaos
      this.controls.enabled = false;

      //making the piece beeing above the board
      e.object.position.z = radius / 2;

      //saving xy of dragged object to move it back if invalid drop placement
      cooBeforeDrag.x = e.object.position.x;
      cooBeforeDrag.y = e.object.position.y;

      //display of droppable grid
      for (const object of this.plane.children) {
        if (object.userData && !object.userData.draggable) {
          object.visible = true;
        }
      }

      //enable clockwise rotation on key press 'r'
      document.body.addEventListener('keydown', (input) => {
        if (input.key.toLowerCase() === 'r') {
          e.object.rotateY(-Math.PI / 3);
        }
      });
    });
    //fires each time dragging object moves
    this.dragControls.addEventListener('drag', (e) => {

      const difference = new THREE.Vector3();
      difference.x = e.object.position.x - cooBeforeDrag.x;
      difference.y = e.object.position.y - cooBeforeDrag.y;

      //casts an infinite line between the pointer and the camera
      this.raycaster.setFromCamera(this.pointer, this.camera);

      const intersects = this.raycaster.intersectObjects(this.scene.children);

      //looking for the xy coo of intersection between pointer and plane
      //updating xy of dragged object with xy of intersection
      for (let i = 0; i < intersects.length; i++) {
        if (Object(intersects[i]).object.geometry.type === 'PlaneGeometry') {
          e.object.position.x = intersects[i].point.x - this.scene.position.x;
          e.object.position.y = intersects[i].point.y - this.scene.position.y;
          e.object.position.z = radius / 2;
          i = intersects.length;
        }
      }
    });
    //fires when dragging ends
    this.dragControls.addEventListener('dragend', (e) => {
      //re-enable OrbitControls
      this.controls.enabled = true;

      //piece rotation on key press 'r'
      document.body.removeEventListener('keydown', (input) => {
        if (input.key.toLowerCase() === 'r') {
          e.object.rotateY(-Math.PI / 3);
        }
      });

      //put the object on the plane
      e.object.position.z = 0;

      //used for each checking, very important
      let validPlacement = false;

      //casts an infinite line between the pointer and the camera
      this.raycaster.setFromCamera(this.pointer, this.camera);

      //array of each object in collision with the raycast
      const intersects = this.raycaster.intersectObjects(this.scene.children);

      //saves id data of the object we're looking for just after
      let id = 0;

      //looking in intersects for an object with userData.draggable=false => corresponds to hexagons of placement grid
      //placed hexagons have no longer children
      //saving its property id in id
      for (let i = 0; i < intersects.length; i++) {
        if (Object(intersects[i]).object.userData && !Object(intersects[i]).object.userData.draggable
          && Object(intersects[i]).object.geometry.type === 'CylinderGeometry') {
          id = Object(intersects[i]).object.id;
          i = intersects.length;
          //saving the object we're looking for
          const object = this.matrix[this.plane.getObjectById(id).userData.x][this.plane.getObjectById(id).userData.y];

          //check the 4 hexagons on the sides to see if they contain a piece or if empty
          for (const x0 of [object.userData.x - 1, object.userData.x + 1]) {
            for (const y0 of [object.userData.y - 1, object.userData.y + 1]) {
              if (x0 > -1 && x0 < this.matrix.length && y0 > -1 && y0 < this.matrix[0].length) { //if index isn't valid, skip
                if (this.matrix[x0][y0].userData.piecePlaced) { //toggle validPlacement if a piece is placed on neighbors
                  validPlacement = true;
                }
              }
            }
          }

          //idem here with pieces above and under, checking if one isn't empty
          for (const x0 of [object.userData.x - 2, object.userData.x, object.userData.x + 2]) {
            if (x0 > -1 && x0 < this.matrix.length) { //if index isn't valid, skip
              if (this.matrix[x0][object.userData.y].userData.piecePlaced) { //toggle validPlacement if a piece is placed on neighbors
                validPlacement = true;
              }
            }
          }
          //if a placed neighbor piece on the board if present
          if (validPlacement) {
            //children borders become useless, we delete it
            //next we set our dropped hexagon's sprites, copying dragged hexagon's ones
            //then copying its rotation
            object.userData.piecePlaced = true;
            object.children = e.object.children;
            for(const child of object.children){
              child.position.x-=(object.position.x-e.object.position.x);
              child.position.z-=(object.position.y-e.object.position.y);
            }
            object.material = e.object.material;
            object.rotation.x = e.object.rotation.x;
            object.rotation.y = e.object.rotation.y;
            object.rotation.z = e.object.rotation.z;
            for(const child of object.children) {
              child.position.y-=radius/2;
            }
            //finally deleting the dragged object from draggableObjects and from the plane
            this.plane.remove(e.object);
            for (let m = 0; m < this.draggableObjects.length; m++) {
              if (this.draggableObjects[m] === e.object) {
                this.draggableObjects.splice(m, 1);
                m = this.draggableObjects.length;
                //dev tool : initiates a new hexagon at the same place
                this.generateHexagon(5, -2, this.matrix, this.draggableObjects, lines, col, radius, this.plane, 'A', cooBeforeDrag, true);
              }
            }
          }
        }
      }
      if (!validPlacement) { //if droppable area isn't found, reinitialize coo of dragged object
        e.object.position.x = cooBeforeDrag.x;
        e.object.position.y = cooBeforeDrag.y;
      }

      for (const obj of this.plane.children) { //hide placement grid
        if (!obj.userData.draggable && obj.geometry.type === 'CylinderGeometry' && !obj.userData.piecePlaced) {
          obj.visible = false;
        }
      }
    });
  };

  animate = () => { //loop allowing graphics to be updated
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
}
