import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {DragControls} from 'three/examples/jsm/controls/DragControls';
import {MovementsService} from '../shared/services/movements.service';
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
  private scene = null;
  private camera = null;
  private controls = null;
  private plane = null;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();
  private matrix = [];

  constructor(
    private movementsService: MovementsService,
    private initializationService: InitializationService
  ) {}

  ngAfterViewInit() {
    const lines = 8;
    const col = 10;
    const radius = 10;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 1000);
    this.configScene();
    this.configCamera(this.canvas);
    this.configRenderer();
    this.configControls();
    this.plane = this.initializationService.configPlane(lines, col, radius);
    this.initMatrix(lines, col);

    //contains each dragable element
    let objects = [];

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
            objects = this.generateHexagon(x, y, objects, lines, col, radius, false);
          }
        }else{
          if (x % 2) { //if line and col both odd
            objects = this.generateHexagon(x, y, objects, lines, col, radius, false);
          }
        }
      }
    }

    //creating a draggable object for testing
    objects = this.generateHexagon(5, -2, objects, lines, col, radius, true);

    //save xy in case of non-droppable place in which object is dropped
    const coo = {x: 0, y: 0};

    const dragable = new DragControls(objects, this.camera, this.renderer.domElement);
    dragable.transformGroup = false;
    dragable.addEventListener('dragstart', (e) => {
      this.controls.enabled = false;
      coo.x = e.object.position.x;
      coo.y = e.object.position.y;

      for (const object of this.plane.children) {
        if (object.children.length && object.geometry.type === 'CylinderGeometry') {
          object.visible = true;
        }
      }

      document.body.addEventListener('keydown', (input) => {
        if (input.key.toLowerCase() === 'r') {
          e.object.rotateY(Math.PI / 3);
        }
      });
    });
    dragable.addEventListener('dragend', (e) => {
      this.controls.enabled = true;
      document.body.removeEventListener('keydown', (input) => {
        if (input.key.toLowerCase() === 'r') {
          e.object.rotateY(Math.PI / 3);
        }
      });
      e.object.position.z = 0;
      let validPlacement = false;
      this.raycaster.setFromCamera(this.pointer, this.camera);

      const intersects = this.raycaster.intersectObjects(this.scene.children);
      let id = 0;

      for(let i=0; i<intersects.length; i++){
        if(Object(intersects[i]).object.geometry.type === 'CylinderGeometry' && Object(intersects[i]).object.children.length){
          id=Object(intersects[i]).object.id;
          i=intersects.length;

          const object = this.matrix[this.plane.getObjectById(id).userData.x]
            [this.plane.getObjectById(id).userData.y];

          for(const x0 of [object.userData.x-1,object.userData.x+1]){
            for(const y0 of [object.userData.y-1,object.userData.y+1]){
              let x = x0;
              let y = y0;
              if(x<0){x+=2;
              }else if(x>this.matrix.length-1){x=this.matrix.length-2;
              }else if(y<0){y+=2;
              }else if(y>this.matrix[0].length-1){y=this.matrix[0].length-2;}

              if(!this.matrix[x][y].children.length){
                validPlacement = true;
              }
            }
          }

          for(const x0 of [object.userData.x-2,object.userData.x,object.userData.x+2]){
            let x = x0;
            if(x<0){x+=2;
            }else if(x>this.matrix.length-1){x=this.matrix.length-2;}
            if(!this.matrix[x][object.userData.y].children.length){
              validPlacement = true;
            }
          }

          if(validPlacement) {
            object.children = [];
            object.material[0] = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/dirt.png')});
            object.material[1] = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/herbe.png')});
            object.material[2] = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/wood.png')});
            object.rotation.x = e.object.rotation.x;
            object.rotation.y = e.object.rotation.y;
            object.rotation.z = e.object.rotation.z;
            this.plane.remove(e.object);
            for (let m = 0; m < objects.length; m++) {
              if (objects[m] === e.object) {
                objects.splice(m, 1);
                m = objects.length;
                objects = this.generateHexagon(5, -2, objects, lines, col, radius, true);
              }
            }
          }
        }
      }
      if(validPlacement) {

      }else{
        e.object.position.x = coo.x;
        e.object.position.y = coo.y;
      }

      for (const obj of this.plane.children) {
        if (obj.children.length && obj.geometry.type === 'CylinderGeometry') {
          obj.visible = false;
        }
      }
    });
    dragable.addEventListener('drag', (e) => {

      e.object.position.z = radius / 2.5;
      this.raycaster.setFromCamera(this.pointer, this.camera);

      // calculate objects intersecting the picking ray
      const intersects = this.raycaster.intersectObjects(this.scene.children);
      for (let i = 0; i < intersects.length; i++) {
        if (Object(intersects[i]).object.geometry.type === 'PlaneGeometry') {
          e.object.position.x = intersects[i].point.x - this.scene.position.x;
          e.object.position.y = intersects[i].point.y - this.scene.position.y;
          i = intersects.length;
        }
      }
    });

    this.scene.add(this.plane);

    let keyBuffer = [];

    document.body.addEventListener('keydown', (e) => {

      if (!this.movementsService.keyBufferIncludes(keyBuffer, e.key.toLowerCase())) {
        keyBuffer.push(e.key.toLowerCase());
      }
      const shift = this.movementsService.keyBufferIncludes(keyBuffer, 'shift');
      this.scene = this.movementsService.keyboardPressed(keyBuffer, shift, this.scene);
    });
    document.body.addEventListener('keyup', (e) => {
      keyBuffer = this.movementsService.deleteFromKeyBuffer(keyBuffer, e.key.toLowerCase());
    });
    this.renderer.domElement.addEventListener('pointermove', (e) => {
      this.pointer.x = (e.clientX / this.renderer.domElement.width) * 2 - 1;
      this.pointer.y = -(e.clientY / this.renderer.domElement.height) * 2 + 1;
    });
    this.matrix[0][0].material[0] = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/dirt.png')});
    this.matrix[0][0].material[1] = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/herbe.png')});
    this.matrix[0][0].material[2] = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/wood.png')});

    console.log(this.matrix);

    setInterval(this.animate, 1000 / 60);
  }

  configScene = () => {
    this.scene.background = new THREE.Color(0, 0, 0);
  };

  configCamera = (canvas) => {
    this.camera.aspect = this.initializationService.calculateAspectRatio(canvas);
    this.camera.updateProjectionMatrix();
    this.camera.position.set(0, 0, 150);
    this.camera.lookAt(this.scene.position);
  };

  configRenderer = () => {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
    });
    // this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setSize(window.innerWidth, window.innerWidth / 2);
    this.renderer.setClearColor(0x000000, 0);
  };

  configControls = () => {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.autoRotate = false;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.update();
  };

  initMatrix = (line, col) => {
    for (let l = 0; l < line; l++) {
      this.matrix.push([]);
      for (let c = 0; c < col; c++) {
        this.matrix[l].push('');
      }
    }
  };

  generateHexagon = (x, y, objects, lines, col, radius, dragable = true) => {

    const cylinderX = x * (radius * Math.cos(2 * Math.PI) + 2*radius);
    const cylinderY = -y*radius*Math.cos(Math.PI/6);
    //                  si x pair       radius*sin(2*PI/6))            dans tous les cas -2y*radius*cos(pi/6)

    const loader = new THREE.TextureLoader();

    const geometry = new THREE.CylinderGeometry(radius, radius, radius / 3, 6);
    //i=0: sides
    //i=1: top
    //i=2: bottom
    const materials = [];

    if (!dragable) {
      materials.push(new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
      materials.push(new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
      materials.push(new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
    } else {
      materials.push(new THREE.MeshBasicMaterial({map: loader.load('./assets/dirt.png')}));
      materials.push(new THREE.MeshBasicMaterial({map: loader.load('./assets/herbe.png')}));
      materials.push(new THREE.MeshBasicMaterial({map: loader.load('./assets/wood.png')}));
    }

    const cylinder = new THREE.Mesh(geometry, materials);
    cylinder.rotateX(Math.PI / 2);
    cylinder.rotateY(Math.PI / 2);
    const h = radius * Math.cos(Math.PI / 6);
    cylinder.position.x = cylinderX / 2 - Math.floor(col / 2) * (radius + radius * Math.sin(Math.PI / 6)) + radius * Math.sin(Math.PI / 6);
    cylinder.position.y = cylinderY + lines * h / Math.PI;

    if (!dragable) {
      const edgeGeometry = new THREE.EdgesGeometry(geometry);
      const edgeMaterial = new THREE.LineBasicMaterial({color: 'lightGreen', linewidth: 1});
      const edgeWireframe = new THREE.LineSegments(edgeGeometry, edgeMaterial);

      cylinder.add(edgeWireframe);

      if (x === 0 && y === 0) {
        cylinder.children = [];
        cylinder.visible = true;
      }else{
        cylinder.visible = false;
      }
      cylinder.userData = {x:y, y:x};

      this.matrix[y][x] = cylinder;
    } else {
      objects.push(cylinder);
    }

    this.plane.add(cylinder);

    return objects;
  };

  animate = () => {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
}
