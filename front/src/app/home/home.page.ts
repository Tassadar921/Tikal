import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import {DragControls} from 'three/examples/jsm/controls/DragControls';
import {Platform} from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements AfterViewInit{

  @Input() name: string;
  @ViewChild('canvas') canvasRef: ElementRef;

  private renderer = new THREE.WebGLRenderer();
  private scene = null;
  private camera = null;
  private controls = null;
  private plane = null;
  private raycaster = new THREE.Raycaster();
  private pointer = new THREE.Vector2();

  constructor(
    private platform: Platform,
  ) {}

  ngAfterViewInit() {
    const lines = 8;//pair uniquement
    const col = 10;//pair uniquement
    const radius = 10;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 1000);
    this.configScene();
    this.configCamera();
    this.configRenderer();
    this.configControls();
    this.configPlane(lines, col, radius);

    // génération de la grid de lines*col sous la forme d'hexagones
    let objects = [];
    // for(let i=0;i<col/2;i++){
    //   for(let j=0;j<lines/2;j++){
    //     objects = this.generateHexagon(i*(10 * Math.cos(2*Math.PI)+20),
    //       j*-2*10*Math.cos(Math.PI/6),
    //       'green', objects, lines, col, radius, false);
    //
    //     objects = this.generateHexagon(15 + i*(10 * Math.cos(2*Math.PI)+20),
    //       10*Math.sin(2*Math.PI/6)+j*-2*10*Math.cos(Math.PI/6),
    //       'green', objects, lines, col, radius, false);
    //   }
    // }

    objects = this.generateHexagon(0, 0, objects, lines, col, radius, false);
    objects = this.generateHexagon(20, 20, objects, lines, col, radius, true);

    //save xy in case of non-droppable place in which object is dropped
    let coo = {x:0, y:0};

    const dragable = new DragControls(objects, this.camera, this.renderer.domElement);
    dragable.transformGroup=false;
    dragable.addEventListener( 'dragstart',(e) => {
      this.controls.enabled = false;
      coo.x = e.object.position.x;
      coo.y = e.object.position.y;
    });
    dragable.addEventListener( 'dragend', (e) => {
      this.controls.enabled = true;
      e.object.position.z=0;
      let validPlacement = false;
      this.raycaster.setFromCamera( this.pointer, this.camera );

      // calculate objects intersecting the picking ray
      const intersects = this.raycaster.intersectObjects(this.scene.children);

      for(let i=0; i<intersects.length; i++){
        if(Object(intersects[i]).object.geometry.type==='CylinderGeometry'&&Object(intersects[i]).object.children.length){
          for(let p=0; p<this.plane.children.length; p++){
            if(this.plane.children[p]===intersects[i].object){
              this.plane.children[p].material[0]=new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/dirt.png')});
              this.plane.children[p].material[1]=new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/herbe.png')});
              this.plane.children[p].material[2]=new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/wood.png')});
              this.plane.remove(e.object);
              for(let m=0; m<objects.length; m++){
                if(objects[m]===e.object){
                  objects.splice(m,1);
                  m=objects.length;
                  validPlacement = true;
                }
              }
              p=this.plane.children.length;
            }
          }
          i=intersects.length;
        }
      }
      if(!validPlacement){
        e.object.position.x=coo.x;
        e.object.position.y=coo.y;
      }
    });
    dragable.addEventListener( 'drag', (e) => {
      e.object.position.z=radius/2.5;
      this.raycaster.setFromCamera( this.pointer, this.camera );

      // calculate objects intersecting the picking ray
      const intersects = this.raycaster.intersectObjects(this.scene.children);
      for(let i=0; i<intersects.length; i++){
        if(Object(intersects[i]).object.geometry.type==='PlaneGeometry'){
          e.object.position.x=intersects[i].point.x-this.scene.position.x;
          e.object.position.y=intersects[i].point.y-this.scene.position.y;
          i=intersects.length;
        }else{ //limit dragging to plane borders
          if(e.object.position.x< -this.plane.geometry.parameters.width/2){
            e.object.position.x = -this.plane.geometry.parameters.width/2;
          }else if (e.object.position.x>this.plane.geometry.parameters.width/2){
            e.object.position.x = this.plane.geometry.parameters.width/2;
          }else if(e.object.position.y< -this.plane.geometry.parameters.height/2){
            e.object.position.y = -this.plane.geometry.parameters.height/2;
          }else if (e.object.position.y>this.plane.geometry.parameters.height/2){
            e.object.position.y = this.plane.geometry.parameters.height/2;
          }
        }
      }
    });
    this.controls.addEventListener('end', (e) => {
      const h = Math.sqrt(Math.pow(this.camera.position.x, 2)
        +Math.pow(this.camera.position.y, 2)
        +Math.pow(this.camera.position.z, 2));

      const p = Math.sqrt(Math.pow(this.camera.position.x, 2)
        +Math.pow(this.camera.position.y, 2));

      // console.log(Math.acos(p/h)*(180/Math.PI));
    });

    this.scene.add(this.plane);

    let keyBuffer = [];

    document.body.addEventListener('keydown', (e) => {

      if(!this.keyBufferIncludes(keyBuffer, e.key.toLowerCase())){
        keyBuffer.push(e.key.toLowerCase());
      }
      const shift = this.keyBufferIncludes(keyBuffer, 'shift');
      this.keyboardPressed(keyBuffer, shift);
    });
    document.body.addEventListener('keyup', (e) => {
      keyBuffer = this.deleteFromKeyBuffer(keyBuffer, e.key.toLowerCase());
    });
    this.renderer.domElement.addEventListener( 'pointermove', (e) => {
      this.pointer.x = (e.clientX/this.renderer.domElement.width) * 2 - 1;
      this.pointer.y = - (e.clientY/this.renderer.domElement.height) * 2 + 1;
    });

    //fonction qui boucle pour update la caméra
    setInterval(this.animate, 1000/60);
  }

  configScene = () => {
    this.scene.background = new THREE.Color( 0,0,0 );
  };

  configCamera = () => {
    this.camera.aspect = this.calculateAspectRatio();
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
    this.renderer.setSize(window.innerWidth,window.innerWidth/2);
    this.renderer.setClearColor( 0x000000, 0 );
  };

  configControls = () => {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.autoRotate = false;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.update();
  };

  configPlane = (lines, col, radius) => {
    //hauteur et largeur plateau, petit problème sur la largeur soit sur la gen des hexagones soit sur le calcul de la largeur totale
    const scenePlane = new THREE.PlaneGeometry(
      Math.floor(col)*(radius+radius*Math.sin(Math.PI/6))+radius*Math.sin(Math.PI/6)+20,
      (lines+1)*radius*Math.cos(Math.PI/6)+20
    );
    const planeMaterial = new THREE.MeshBasicMaterial({opacity:0, transparent:true});
    // const planeMaterial = new THREE.MeshBasicMaterial({});
    this.plane = new THREE.Mesh(scenePlane, planeMaterial);
  };

  keyBufferIncludes = (keyBuffer, key) => {
    for(const line of keyBuffer){
      if(line===key){
        return true;
      }
    }
    return false;
  };

  deleteFromKeyBuffer = (keyBuffer, key) => {
    for(let i=0; i<keyBuffer.length;i++){
      if(keyBuffer[i]===key){
        keyBuffer.splice(i,1);
        return keyBuffer;
      }
    }
    return keyBuffer;
  };

  keyboardPressed = (keyBuffer, shift) => {
    for(const key of keyBuffer) {
      if (key === 'z' || key === 'q' || key === 's' || key === 'd' || key === 'r' || key === 'f') {
        this.moveCamera(key, shift);
      }
      this.controls.update();
    }
  };

  moveCamera = (key, shift) => {
    let speed = 1;
    if(shift){
      speed = 3;
    }
    switch(key){
      case 'z':
        this.scene.position.y-=speed;
        break;
      case 'q':
        this.scene.position.x+=speed;
        break;
      case 's':
        this.scene.position.y+=speed;
        break;
      case 'd':
        this.scene.position.x-=speed;
        break;
      case 'f':
        this.scene.position.z-=speed;
        break;
      case 'r':
        this.scene.position.z+=speed;
        break;
    }
  };

  generateHexagon = (x, y, objects, lines, col, radius, dragable = true) => {

    console.log('on génère');

    const loader = new THREE.TextureLoader();

    const geometry = new THREE.CylinderGeometry( radius, radius, radius/3, 6);
    //i=0: sides
    //i=1: top
    //i=2: bottom
    const materials = [];

    if(!dragable) {
      materials.push(new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
      materials.push(new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
      materials.push(new THREE.MeshBasicMaterial({transparent: true, opacity: 0}));
    }else{
      materials.push(new THREE.MeshBasicMaterial({map: loader.load('./assets/dirt.png')}));
      materials.push(new THREE.MeshBasicMaterial({map: loader.load('./assets/herbe.png')}));
      materials.push(new THREE.MeshBasicMaterial({map: loader.load('./assets/wood.png')}));
    }

    const cylinder = new THREE.Mesh( geometry, materials );
    cylinder.rotateX(Math.PI/2);
    cylinder.rotateY(Math.PI/2);
    const h = radius*Math.cos(Math.PI/6);
    cylinder.position.x=x-Math.floor(col/2)*(radius+radius*Math.sin(Math.PI/6))+radius*Math.sin(Math.PI/6);
    cylinder.position.y=y+lines*h/Math.PI;

    if(!dragable) {
      const edgeGeometry = new THREE.EdgesGeometry(geometry);
      const edgeMaterial = new THREE.LineBasicMaterial({color: 'lightGreen', linewidth: 1});
      const edgeWireframe = new THREE.LineSegments(edgeGeometry, edgeMaterial);

      cylinder.add(edgeWireframe);
    }else{
      objects.push(cylinder);
    }

    this.plane.add(cylinder);

    return objects;
  };

  animate = () => {
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  calculateAspectRatio = () => {
    const height = this.canvas.clientHeight;
    if (height === 0) {
      return 0;
    }
    return this.canvas.clientWidth / this.canvas.clientHeight;
  };

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
}
