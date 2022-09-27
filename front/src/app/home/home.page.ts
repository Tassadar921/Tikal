import {Component, OnInit} from '@angular/core';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit{

  constructor() {}

  ngOnInit() {
    const renderer = new THREE.WebGLRenderer();
    document.body.appendChild(renderer.domElement);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 1000);
    const scene = new THREE.Scene();

    camera.position.set(0,0,100);

    const controls = new OrbitControls(camera, renderer.domElement);

    scene.background = new THREE.Color(0, 0, 0);

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
    scene.add(cube);

    renderer.render(scene, camera);

    controls.update();

    this.see(renderer, scene, camera, controls);
  }

  see = (renderer, scene, camera, controls) => {
    requestAnimationFrame(see);
    renderer.render(scene,camera);
    controls.update();
  };

}
