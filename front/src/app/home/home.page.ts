import {AfterViewInit, Component, ElementRef, Input, ViewChild} from '@angular/core';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

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

  constructor() {}

  ngAfterViewInit() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 1000);
    this.configScene();
    this.configCamera();
    this.configRenderer();
    this.configControls();

    const lines = 8;
    const col = 10;

    // génération de la grid de lines*col sous la forme d'hexagones
    for(let i=0;i<col/2;i++){
      for(let j=0;j<lines/2;j++){
        this.generateHexagon(i*(10 * Math.cos(2*Math.PI)+20), j*-2*10*Math.cos(Math.PI/6), 'green');
        this.generateHexagon(15 + i*(10 * Math.cos(2*Math.PI)+20), 10*Math.sin(2*Math.PI/6)+j*-2*10*Math.cos(Math.PI/6), 'green');
      }
    }

    let keyBuffer = [];
    document.body.addEventListener('keydown', (e) => {
      if(!this.keyBufferIncludes(keyBuffer, e.key)){
        keyBuffer.push(e.key);
      }
      this.keyboardPressed(keyBuffer);
    });

    document.body.addEventListener('keyup', (e) => {
      keyBuffer = this.deleteFromKeyBuffer(keyBuffer, e.key);
    });

    //fonction qui boucle pour update la caméra
    this.animate();
  }

  configScene = () => {
    // this.scene.background = new THREE.Color( 0,0,0 );
    // this.scene.add(new THREE.GridHelper(100,10));
  };

  configCamera = () => {
    this.camera.aspect = this.calculateAspectRatio();
    this.camera.updateProjectionMatrix();
    this.camera.position.set(0, 0, 100);
    this.camera.lookAt(this.scene.position);
  };

  configRenderer = () => {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true
    });
    this.renderer.setPixelRatio(devicePixelRatio);
    this.renderer.setClearColor( 0x000000, 0 );
  };

  configControls = () => {
    this.controls = new OrbitControls(this.camera, this.canvas);
    this.controls.autoRotate = false;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    this.controls.update();
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

  keyboardPressed = (keyBuffer) => {
    for(const key of keyBuffer) {
      if (key === 'z' || key === 'q' || key === 's' || key === 'd' || key === 'r' || key === 'f') {
        this.moveCamera(key);
      }
      this.controls.update();
    }
  };

  moveCamera = (key) => {
    switch(key){
      case 'z':
        this.scene.position.y--;
        break;
      case 'q':
        this.scene.position.x++;
        break;
      case 's':
        this.scene.position.y++;
        break;
      case 'd':
        this.scene.position.x--;
        break;
      case 'f':
        this.scene.position.z--;
        break;
      case 'r':
        this.scene.position.z++;
        break;
    }
  };

  generateHexagon = (x,y,color) => {

    const loader = new THREE.TextureLoader();

    const geometry = new THREE.CylinderGeometry( 10, 10, 2, 6 );
    //i=0: sides
    //i=1: top
    //i=2: bottom
    const materials = [
      new THREE.MeshBasicMaterial({map: loader.load('./assets/dirt.png')}),
      new THREE.MeshBasicMaterial({map: loader.load('./assets/herbe.png')}),
      new THREE.MeshBasicMaterial({map: loader.load('./assets/wood.png')}),
    ];

    const cylinder = new THREE.Mesh( geometry, materials );
    cylinder.rotateX(Math.PI/2);
    cylinder.rotateY(Math.PI/2);
    cylinder.position.x=x;
    cylinder.position.y=y;
    this.scene.add( cylinder );
  };

  animate = () => {
    window.requestAnimationFrame(() => this.animate());
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
