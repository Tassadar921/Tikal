import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MovementsService {

  constructor() { }

  keyBufferIncludes = (keyBuffer, key) => {
    for (const line of keyBuffer) {
      if (line === key) {
        return true;
      }
    }
    return false;
  };

  deleteFromKeyBuffer = (keyBuffer, key) => {
    for (let i = 0; i < keyBuffer.length; i++) {
      if (keyBuffer[i] === key) {
        keyBuffer.splice(i, 1);
        return keyBuffer;
      }
    }
    return keyBuffer;
  };

  keyboardPressed = (keyBuffer, shift, scene) => {
    for (const key of keyBuffer) {
      if (key === 'z' || key === 'q' || key === 's' || key === 'd' || key === 'p' || key === 'm') {
        scene = this.moveCamera(key, shift, scene);
      }
    }
    return scene;
  };

  moveCamera = (key, shift, scene) => {
    let speed = 1;
    if (shift) {
      speed = 3;
    }
    switch (key) {
      case 'z':
        scene.position.y -= speed;
        break;
      case 'q':
        scene.position.x += speed;
        break;
      case 's':
        scene.position.y += speed;
        break;
      case 'd':
        scene.position.x -= speed;
        break;
      case 'p':
        scene.position.z += speed;
        break;
      case 'm':
        scene.position.z -= speed;
        break;
    }
    return scene;
  };
}
