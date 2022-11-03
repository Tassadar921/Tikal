import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {DragControls} from 'three/examples/jsm/controls/DragControls';
import {InitializationService} from '../shared/services/initialization.service';

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

  constructor(
    private initializationService: InitializationService
  ) {}

  ngAfterViewInit() {
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

    //contains each dragable element
    let draggableObjects = [];

    //buffer of keys beeing pressed at the same time
    let keyBuffer = [];

    //used to receive js objects returned by functions
    let rtrn;

    //gen of matrix, like

    //[ object, '', object, '', object]
    //[ '', object, '', object, '']
    //[ object, '', object, '', object]
    //[ '', object, '', object, '']

    //thought to make operations easier on neightbours
    for (let y = 0; y < lines; y++) {
      for (let x = 0; x < col; x++) {
        if((y+1)%2) { //if index of line is even
          if ((x + 1) % 2) { //if index of col is even
            rtrn = this.generateHexagon(x, y, draggableObjects, lines, col, radius, this.plane, false);
            draggableObjects = rtrn.objects;
            this.plane = rtrn.plane;
          }
        }else{
          if (x % 2) { //if line and col both odd
            rtrn = this.generateHexagon(x, y, draggableObjects, lines, col, radius, this.plane, false);
            draggableObjects = rtrn.objects;
            this.plane = rtrn.plane;
          }
        }
      }
    }

    //creating a draggable object for testing
    rtrn = this.generateHexagon(5, -2, draggableObjects, lines, col, radius, this.plane, true);
    draggableObjects = rtrn.objects;
    this.plane = rtrn.plane;

    //save xy in case of non-droppable place in which object is dropped
    const coo = {x: 0, y: 0};

    //makes all items in objects draggable in domElement
    const dragable = new DragControls(draggableObjects, this.camera, this.renderer.domElement);

    //fires when dragging starts
    dragable.addEventListener('dragstart', (e) => {
      //disable OrbitControls, if we don't it's total chaos
      this.controls.enabled = false;

      //making the piece beeing above the board
      e.object.position.z = radius/2;

      //saving xy of dragged object to move it back if invalid drop placement
      coo.x = e.object.position.x;
      coo.y = e.object.position.y;

      //display of droppable grid
      for (const object of this.plane.children) {
        if (object.children.length && object.geometry.type === 'CylinderGeometry') {
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
    dragable.addEventListener('drag', (e) => {

      //making the piece beeing above the board
      e.object.position.z = radius/2;

      //casts an infinite line between the pointer and the camera
      this.raycaster.setFromCamera(this.pointer, this.camera);

      const intersects = this.raycaster.intersectObjects(this.scene.children);

      //looking for the xy coo of intersection between pointer and plane
      //updating xy of dragged object with xy of intersection
      for (let i = 0; i < intersects.length; i++) {
        if (Object(intersects[i]).object.geometry.type === 'PlaneGeometry') {
          e.object.position.x = intersects[i].point.x - this.scene.position.x;
          e.object.position.y = intersects[i].point.y - this.scene.position.y;
          i = intersects.length;
        }
      }
    });
    //fires when dragging ends
    dragable.addEventListener('dragend', (e) => {
      //re-enable OrbitControls
      this.controls.enabled = true;

      //destroy of piece rotation on key press 'r'
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

      //looking in intersects for a CylinderGeometry object with at least a children => corresponds to hexagons of placement grid
      //placed hexagons have no longer children
      //saving its property id in id
      for(let i=0; i<intersects.length; i++){
        if(Object(intersects[i]).object.geometry.type === 'CylinderGeometry' && Object(intersects[i]).object.children.length){
          id=Object(intersects[i]).object.id;
          i=intersects.length;

          //saving the object we're looking for
          const object = this.matrix[this.plane.getObjectById(id).userData.x]
            [this.plane.getObjectById(id).userData.y];

          //check the 4 hexagons on the sides to see if they contain a piece or if empty
          for(const x0 of [object.userData.x-1,object.userData.x+1]){
            for(const y0 of [object.userData.y-1,object.userData.y+1]){
              if(x0 > -1 && x0 < this.matrix.length && y0 > -1 && y0 < this.matrix[0].length) { //if index isn't valid, skip
                if (!this.matrix[x0][y0].children.length) { //toggle validPlacement if a piece is placed on neighbors
                  validPlacement = true;
                }
              }
            }
          }

          //idem here with pieces above and under, checking if one isn't empty
          for(const x0 of [object.userData.x-2,object.userData.x,object.userData.x+2]){
            if( x0 > -1 && x0 < this.matrix.length) { //if index isn't valid, skip
              if (!this.matrix[x0][object.userData.y].children.length) { //toggle validPlacement if a piece is placed on neighbors
                validPlacement = true;
              }
            }
          }
          //if a placed neighbor piece on the board if present
          if(validPlacement) {
            //children borders become useless, we delete it
            //next we set our dropped hexagon's sprites, copying dragged hexagon
            //then copying its rotation
            object.children = [];
            object.material = e.object.material;
            object.rotation.x = e.object.rotation.x;
            object.rotation.y = e.object.rotation.y;
            object.rotation.z = e.object.rotation.z;
            //finally deleting the dragged object from draggableObjects and from the plane
            this.plane.remove(e.object);
            for (let m = 0; m < draggableObjects.length; m++) {
              if (draggableObjects[m] === e.object) {
                draggableObjects.splice(m, 1);
                //dev tool : initiates a new hexagon at the same place
                rtrn = this.generateHexagon(5, -2, draggableObjects, lines, col, radius, this.plane, true);
                draggableObjects = rtrn.objects;
                this.plane = rtrn.plane;
                m = draggableObjects.length;
              }
            }
          }
        }
      }
      if(!validPlacement) { //if droppable area isn't found, reinitialize coo of dragged object
        e.object.position.x = coo.x;
        e.object.position.y = coo.y;
      }

      for (const obj of this.plane.children) { //hide placement grid
        if (obj.children.length && obj.geometry.type === 'CylinderGeometry') {
          obj.visible = false;
        }
      }
    });

    //fires each time pointer moves
    this.renderer.domElement.addEventListener('pointermove', (e) => {
      //normalized coo of pointer
      this.pointer.x = (e.clientX / this.renderer.domElement.width) * 2 - 1;
      this.pointer.y = -(e.clientY / this.renderer.domElement.height) * 2 + 1;
    });

    setInterval(this.animate, 1000 / fps);
  }

  generateHexagon = (x, y, objects, lines, col, radius, plane, draggable = true) => {

    //calculating graphic xy of cylinder from matrix's xy
    const cylinderX = x * (radius * Math.cos(2 * Math.PI) + 2*radius);
    const cylinderY = -y*radius*Math.cos(Math.PI/6);

    //creating shape of regular cylinder of 6 segments => hexagon in 3D
    const geometry = new THREE.CylinderGeometry(radius, radius, radius / 3, 6);

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
      materials.push(new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/test.png')}));
    }

    //creating 3D object
    const cylinder = new THREE.Mesh(geometry, materials);

    //rotating object in XY-plane
    cylinder.rotateX(Math.PI / 2);
    cylinder.rotateY(Math.PI / 2);

    //updating xy of 3D object from cylinderX and cylinderY
    cylinder.position.x = cylinderX / 2 - Math.floor(col / 2) * (radius + radius * Math.sin(Math.PI / 6)) + radius * Math.sin(Math.PI / 6);
    cylinder.position.y = cylinderY + lines * radius * Math.cos(Math.PI / 6) / Math.PI;

    if (!draggable) {//adding visible edges
      const edgeGeometry = new THREE.EdgesGeometry(geometry);
      const edgeMaterial = new THREE.LineBasicMaterial({color: 'lightGreen'});
      const edgeWireframe = new THREE.LineSegments(edgeGeometry, edgeMaterial);

      cylinder.add(edgeWireframe);

      if (x === 0 && y === 0) {//starting hexagon, special texture and visible
        cylinder.children = [];
        cylinder.visible = true;
        cylinder.material[0] = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/dirt.png')});
        cylinder.material[1] = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/herbe.png')});
        cylinder.material[2] = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/test.png')});
      }else{
        cylinder.visible = false;
      }
      //x and y on graphics and in matrix are inverted
      //saving xy coo of object which is in the matrix in object
      cylinder.userData = {x:y, y:x};

      //it becomes a pointer : updating in the matrix will update on graphics
      this.matrix[y][x] = cylinder;
    } else {//if draggable => pushing in objects
      objects.push(cylinder);
    }

    //cylinder belongs to plane
    plane.add(cylinder);

    return {objects, plane};
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
