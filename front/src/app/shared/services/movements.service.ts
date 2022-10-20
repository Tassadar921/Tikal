import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MovementsService {

  constructor() { }

  //checks if keyBuffer includes key, returning boolean
  keyBufferIncludes = (keyBuffer, key) => {
    for (const line of keyBuffer) {
      if (line === key) {
        return true;
      }
    }
    return false;
  };

  //deletes key from keyBuffer, returning keyBuffer without it
  deleteFromKeyBuffer = (keyBuffer, key) => {
    for (let i = 0; i < keyBuffer.length; i++) {
      if (keyBuffer[i] === key) {
        keyBuffer.splice(i, 1);
        return keyBuffer;
      }
    }
    return keyBuffer;
  };

  //triggered as long as any key is pressed, returning updated scene
  keyboardPressed = (keyBuffer, shift, sceneAndCamera) => {
    for (const key of keyBuffer) {
      if (key === 'z' || key === 'q' || key === 's' || key === 'd' || key === 'p' || key === 'm') {
        sceneAndCamera = this.moveCamera(key, shift, sceneAndCamera);
      }
    }
    return sceneAndCamera;
  };

  //triggered as long as any key linked to scene's movement is pressed, updating scene's position and returning it
  moveCamera = (key, shift, sceneAndCamera) => {
    let speed = 1;
    if (shift) {
      speed = 3;
    }
    switch (key) {
      case 'z':
        sceneAndCamera.scene.position.y -= speed;
        break;
      case 'q':
        sceneAndCamera.scene.position.x += speed;
        break;
      case 's':
        sceneAndCamera.scene.position.y += speed;
        break;
      case 'd':
        sceneAndCamera.scene.position.x -= speed;
        break;
      case 'p':
        sceneAndCamera.camera.position.z -= speed;
        break;
      case 'm':
        sceneAndCamera.camera.position.z += speed;
        break;
    }
    return sceneAndCamera;
  };
}
