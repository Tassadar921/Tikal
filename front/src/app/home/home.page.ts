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
  private readonly scene = null;
  private readonly camera = null;
  private controls = null;

  constructor() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 1000);
  }

  ngAfterViewInit() {
    this.configScene();
    this.configCamera();
    this.configRenderer();
    this.configControls();

    const lines = 5;
    const col = 3;
    for(let i=0;i<lines;i++){
      for(let j=0;j<col;j++){
        this.generateHexagon(20*i, j*10*Math.sin(2*Math.PI/6), 'green');
        this.generateHexagon(20*i, j*10*Math.sin(2*Math.PI/6), 'green');
      }
    }
    // this.generateHexagon(0,0, 'green');
    // this.generateHexagon(15,10*Math.sin(2*Math.PI/6), 'blue');

    this.animate();
  }

  configScene = () => {
    this.scene.background = new THREE.Color( 0,0,0 );
  };

  configCamera = () => {
    this.camera.aspect = this.calculateAspectRatio();
    this.camera.updateProjectionMatrix();
    this.camera.position.set(0, 0, 70);
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

  private calculateAspectRatio(): number {
    const height = this.canvas.clientHeight;
    if (height === 0) {
      return 0;
    }
    return this.canvas.clientWidth / this.canvas.clientHeight;
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  private get canvas(): HTMLCanvasElement {
    return this.canvasRef.nativeElement;
  }
}
