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

    //génération de la grid de lines*col sous la forme d'hexagones
    for(let i=0;i<col/2;i++){
      for(let j=0;j<lines/2;j++){
        this.generateHexagon(i*(10 * Math.cos(2*Math.PI)+20), j*-2*10*Math.cos(Math.PI/6), 'green');
        this.generateHexagon(15 + i*(10 * Math.cos(2*Math.PI)+20), 10*Math.sin(2*Math.PI/6)+j*-2*10*Math.cos(Math.PI/6), 'green');
      }
    }

    //pour les mouvements de la caméra, on en est à la phase de tests de ce côté
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

    //début tests sprites

    const heartShape = new THREE.Shape();

    heartShape.moveTo( 25, 25 );
    heartShape.bezierCurveTo( 25, 25, 20, 0, 0, 0 );
    heartShape.bezierCurveTo( - 30, 0, - 30, 35, - 30, 35 );
    heartShape.bezierCurveTo( - 30, 55, - 10, 77, 25, 95 );
    heartShape.bezierCurveTo( 60, 77, 80, 55, 80, 35 );
    heartShape.bezierCurveTo( 80, 35, 80, 0, 50, 0 );
    heartShape.bezierCurveTo( 35, 0, 25, 25, 25, 25 );

    const extrudeSettings = { depth: 8, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };

    const geometry = new THREE.ExtrudeGeometry( heartShape, extrudeSettings );

    const mesh = new THREE.Mesh( geometry, new THREE.MeshPhongMaterial() );
    this.scene.add( mesh );

    //fin tests sprites

    //fonction qui boucle pour update la caméra
    this.animate();
  }

  configScene = () => {
    // this.scene.background = new THREE.Color( 0,0,0 );
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
    const hexagon3DBuffer = [];

    const material = new THREE.LineBasicMaterial({color});

    for(const h of [1.5,-1.5]) {
      for (const val of [(2 * Math.PI), (2 * Math.PI) / 6, 2 * (2 * Math.PI) / 6,
        3 * (2 * Math.PI) / 6, 4 * (2 * Math.PI) / 6,
        5 * (2 * Math.PI) / 6, (2 * Math.PI)]) {
        for(const pow of [1,2,1]) {
          hexagon3DBuffer.push(new THREE.Vector3(10 * Math.cos(val)+x, 10 * Math.sin(val)+y, Math.pow(-1, pow) * h));
        }
      }
    }
    const geometry = new THREE.BufferGeometry().setFromPoints(hexagon3DBuffer);

    const hexagon3D = new THREE.Line(geometry, material);
    this.scene.add(hexagon3D);
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
