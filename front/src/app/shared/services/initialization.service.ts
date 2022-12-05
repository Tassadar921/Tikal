import {Injectable} from '@angular/core';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';

@Injectable({
  providedIn: 'root'
})
export class InitializationService {

  constructor() {}

  //calculates graphic scale from canvas width and height, better graphic render, returning a proportion
  calculateAspectRatio = (canvas) => {
    const height = canvas.clientHeight;
    if (height === 0) {
      return 0;
    } else {
      return canvas.clientWidth / canvas.clientHeight;
    }
  };

  //creates the XY plane, returning a 3D object
  configPlane = (lines, col, radius) => {
    const geometry = new THREE.PlaneGeometry(
      col * (radius + radius * Math.sin(Math.PI / 6)) + radius * Math.sin(Math.PI / 6) + 1000,
      (lines + 1) * radius * Math.cos(Math.PI / 6) + 1000
    );
    const planeMaterial = new THREE.MeshBasicMaterial({opacity: 0, transparent: true});
    // const planeMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color(1,1,1), side: THREE.DoubleSide});
    // const planeMaterial = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load('./assets/herbe.png'), side: THREE.DoubleSide});
    const plane = new THREE.Mesh(geometry, planeMaterial);
    plane.translateOnAxis(new THREE.Vector3(0, 0, 1), -10);
    return plane;
  };

  //creates scene, adding plane and returning it
  configScene = (plane) => {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0, 0, 0);
    scene.add(plane);
    return scene;
  };

  //created matrix of line*col, returning it
  initMatrix = (line, col) => {
    const matrix = [];
    for (let l = 0; l < line; l++) {
      matrix.push([]);
      for (let c = 0; c < col; c++) {
        // @ts-ignore
        matrix[l].push('');
      }
    }
    return matrix;
  };

  //created camera from proportion of calculateAspectRatio, making it looking at scene.position and returning it
  configCamera = (canvas, scene) => {
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.5, 1000);
    camera.aspect = this.calculateAspectRatio(canvas);
    camera.updateProjectionMatrix();
    camera.position.set(0, 0, 150);
    camera.lookAt(scene.position);
    return camera;
  };

  //created renderer as a WebGLRenderer and returning it
  configRenderer = (canvas) => {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
    });
    renderer.setSize(window.innerWidth, window.innerWidth / 2);
    return renderer;
  };

  //created an OrbitControls object and returning it
  configControls = (canvas, camera) => {
    const controls = new OrbitControls(camera, canvas);
    controls.enableZoom = true;
    controls.minAzimuthAngle = -Math.PI / 2;
    controls.mouseButtons = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      RIGHT: THREE.MOUSE.ROTATE,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      LEFT: THREE.MOUSE.PAN
    };
    return controls;
  };

  //creates a light everywhere and returning it
  configLight = () => new THREE.AmbientLight(0xffffff);
}
