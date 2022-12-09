import {AfterViewInit, Component, ElementRef, ViewChild} from '@angular/core';
import * as THREE from 'three'
import {DragControls} from 'three/examples/jsm/controls/DragControls';
import {InitializationService} from '../shared/services/initialization.service';
import {GenerateHexagonService} from '../shared/services/generate-hexagon.service';
import {ApiService} from '../shared/services/api.service';
import {GameService} from '../shared/services/game.service';
import {ToastService} from '../shared/services/toast.service';
import {Socket} from 'ngx-socket-io';
import {SocketsService} from '../shared/services/sockets.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit {

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

  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }

  constructor(
    private initializationService: InitializationService,
    private generateHexagonService: GenerateHexagonService,
    private apiService: ApiService,
    private gameService: GameService,
    private toastService: ToastService,
    private socketsService: SocketsService
  ) {}

  async ngAfterViewInit() {
    this.socketsService.setRoomSockets();
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

    await this.gameService.initTilesToPlace();

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
            this.generateHexagon(x, y, this.matrix, this.draggableObjects, lines, col, radius, this.plane, cooBeforeDrag, false);
          }
        } else {
          if (x % 2) { //if line and col both odd
            this.generateHexagon(x, y, this.matrix, this.draggableObjects, lines, col, radius, this.plane, cooBeforeDrag, false);
          }
        }
      }
    }

    //creating a draggable object for testing
    this.generateHexagon(5, -2, this.matrix, this.draggableObjects, lines, col, radius, this.plane, cooBeforeDrag, true);
    //fires each time pointer moves
    this.renderer.domElement.addEventListener('pointermove', (e) => {
      //normalized coo of pointer
      this.pointer.x = (e.clientX / this.renderer.domElement.width) * 2 - 1;
      this.pointer.y = -(e.clientY / this.renderer.domElement.height) * 2 + 1;
    });

    //enable clockwise rotation on key press 'r'
    document.body.addEventListener('keydown', (input) => {
      if (input.key.toLowerCase() === 'r') {
        this.draggableObjects[0] = this.generateHexagonService.rotate(this.draggableObjects[0]);
      }
    });

    setInterval(this.animate, 1000 / fps);
  }

  generateHexagon = (x, y, matrix, draggableObjects, lines, col, radius, plane, cooBeforeDrag, draggable) => {
    const rtrn = this.generateHexagonService.generateHexagon(
      x, y, matrix, lines, col, radius, plane, draggable);
    this.draggableObjects = [rtrn.cylinder];
    this.plane = rtrn.plane;
    this.matrix = rtrn.matrix;
    if (draggable) {
      this.dragControls = new DragControls(this.draggableObjects, this.camera, this.renderer.domElement);
      this.dragControls.transformGroup = true;
      this.setDraggableEvents(lines, col, radius, cooBeforeDrag);
      rtrn.cylinder = this.generateHexagonService.addPath(rtrn.cylinder, radius);
      rtrn.cylinder = this.generateHexagonService.addTree(rtrn.cylinder);
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
          break;
        }
      }
    });
    //fires when dragging ends
    this.dragControls.addEventListener('dragend', async (e) => {
      //re-enable OrbitControls

      let reset = () => {
        e.object.position.x = cooBeforeDrag.x;
        e.object.position.y = cooBeforeDrag.y;
      };

      this.controls.enabled = true;

      //put the object on the plane
      e.object.position.z = 0;

      this.raycaster.setFromCamera(this.pointer, this.camera);
      const intersects = this.raycaster.intersectObjects(this.scene.children);
      let droppedArea;

      for(const child of intersects){
        if(Object(child.object).geometry.type==='CylinderGeometry'
          && !child.object.userData.draggable
          && !child.object.userData.piecePlaced){
          droppedArea = child.object;
          break;
        }
      }

      if(droppedArea){
        let x = droppedArea.userData.x;
        let y = droppedArea.userData.y;

        console.log('x: ' + x + ' y: ' + y);

        if(((x>0 && y<col-1)&&(this.matrix[x-1][y+1].userData.piecePlaced && (this.matrix[x-1][y+1].userData.tile.directions.southWest || e.object.userData.tile.directions.northEast)))
        || ((x<lines-1 && y<col-1)&&(this.matrix[x+1][y+1].userData.piecePlaced && (this.matrix[x+1][y+1].userData.tile.directions.northWest || e.object.userData.tile.directions.southEast)))
          || ((x<lines-2)&&(this.matrix[x+2][y].userData.piecePlaced && (this.matrix[x+2][y].userData.tile.directions.north || e.object.userData.tile.directions.south)))
          || ((x<lines-1 && y>0)&&(this.matrix[x+1][y-1].userData.piecePlaced && (this.matrix[x+1][y-1].userData.tile.directions.northEast || e.object.userData.tile.directions.southWest)))
          || ((x>0 && y>0)&&(this.matrix[x-1][y-1].userData.piecePlaced && (this.matrix[x-1][y-1].userData.tile.directions.southEast || e.object.userData.tile.directions.northWest)))
          || ((x>1)&&(this.matrix[x-2][y].userData.piecePlaced && (this.matrix[x-2][y].userData.tile.directions.south || e.object.userData.tile.directions.north)))){
          droppedArea.userData.tile = e.object.userData.tile;
          droppedArea.material = e.object.material;
          droppedArea.userData.piecePlaced = true;
          droppedArea.children = [];
          droppedArea = this.generateHexagonService.addPath(droppedArea, radius);
          droppedArea = this.generateHexagonService.addTree(droppedArea);
          this.plane.remove(e.object);
          this.draggableObjects = [];
          this.dragControls.dispose();
          this.generateHexagon(5, -2, this.matrix, this.draggableObjects, lines, col, radius, this.plane, cooBeforeDrag, true);
        }else{
          await this.toastService.displayToast('Paths must match', 3000, 'bottom');
          reset();
        }
      }else{
        await this.toastService.displayToast('Invalid  placement', 3000, 'bottom');
        reset();
      }


      for (const child of this.plane.children) { //hide placement grid
        if (!child.userData.draggable && child.geometry.type === 'CylinderGeometry' && !child.userData.piecePlaced) {
          child.visible = false;
        }
      }
    });
  };

  animate = () => {
    this.renderer.render(this.scene, this.camera);
  };
}
