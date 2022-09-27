import {Component, OnInit} from '@angular/core';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  private renderer;
  private scene;
  private camera;
  private controls;

  constructor() {}

  ngOnInit() {
    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 1000);
    this.scene = new THREE.Scene();

    this.camera.position.set(0,0,100);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.scene.background = new THREE.Color(0, 0, 0);

    const green = new THREE.LineBasicMaterial({color: 0x3CAF0D});

    const cubeBuffer = [];

    cubeBuffer.push( new THREE.Vector3( -10, -10, -10 ) );
    cubeBuffer.push( new THREE.Vector3( -10, 10, -10 ) );
    cubeBuffer.push( new THREE.Vector3( 10, 10, -10 ) );
    cubeBuffer.push( new THREE.Vector3( 10, -10, -10 ) );
    cubeBuffer.push( new THREE.Vector3( -10, -10, -10 ) );

    cubeBuffer.push( new THREE.Vector3( -10, -10, 10 ) );
    cubeBuffer.push( new THREE.Vector3( -10, 10, 10 ) );
    cubeBuffer.push( new THREE.Vector3( 10, 10, 10 ) );
    cubeBuffer.push( new THREE.Vector3( 10, -10, 10 ) );
    cubeBuffer.push( new THREE.Vector3( -10, -10, 10 ) );

    cubeBuffer.push( new THREE.Vector3( -10, 10, -10 ) );
    cubeBuffer.push( new THREE.Vector3( -10, 10, 10 ) );

    cubeBuffer.push( new THREE.Vector3( 10, -10, -10 ) );
    cubeBuffer.push( new THREE.Vector3( 10, -10, 10 ) );

    cubeBuffer.push( new THREE.Vector3( 10, 10, -10 ) );
    cubeBuffer.push( new THREE.Vector3( 10, 10, 10 ) );

    cubeBuffer.push( new THREE.Vector3( -10, -10, -10 ) );
    cubeBuffer.push( new THREE.Vector3( -10, -10, 10 ) );

    const cubeTMP = new THREE.BufferGeometry().setFromPoints(cubeBuffer);

    const cube = new THREE.Line(cubeTMP, green);
    this.scene.add(cube);

    this.controls.keys = {
      left: 'ArrowLeft', //left arrow
      up: 'ArrowUp', // up arrow
      right: 'ArrowRight', // right arrow
      bottom: 'ArrowDown' // down arrow
    };

    this.controls.update();

    this.see();
  }

  see = () => {
    console.log('test');
    this.controls.update();
    this.renderer.render(this.scene,this.camera);
    requestAnimationFrame(this.see);
  };
}
