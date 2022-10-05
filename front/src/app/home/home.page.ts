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
    document.body.addEventListener('keydown', (e) => {
      this.keyboardPressed(e.key);
    });

    //fonction qui boucle pour update la caméra
    this.animate();
  }

  configScene = () => {
    this.scene.background = new THREE.Color( 0,0,0 );
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

  keyboardPressed = (key) => {
    if(key==='z'||key==='q'||key==='s'||key==='d'){
      this.moveCamera(key);
      console.log(this.scene.position);
    }
    this.controls.update();
  };

  moveCamera = (key) => {
    switch(key){
      case 'z':
        this.scene.position.y-=1;
        break;
      case 'q':
        this.scene.position.x+=1;
        break;
      case 's':
        this.scene.position.y+=1;
        break;
      case 'd':
        this.scene.position.x-=1;
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
