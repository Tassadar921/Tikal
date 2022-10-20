import { Injectable } from '@angular/core';
import * as THREE from 'three';

@Injectable({
  providedIn: 'root'
})
export class InitializationService {

  constructor() { }

  calculateAspectRatio = (canvas) => {
    const height = canvas.clientHeight;
    if (height === 0) {
      return 0;
    } else {
      return canvas.clientWidth / canvas.clientHeight;
    }
  };

  configPlane = (lines, col, radius) => {
    const geometry = new THREE.PlaneGeometry(
      Math.floor(col) * (radius + radius * Math.sin(Math.PI / 6)) + radius * Math.sin(Math.PI / 6) + 1000,
      (lines + 1) * radius * Math.cos(Math.PI / 6) + 1000
    );
    const planeMaterial = new THREE.MeshBasicMaterial({opacity: 0, transparent: true});
    return new THREE.Mesh(geometry, planeMaterial);
  };
}
