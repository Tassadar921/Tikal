import * as THREE from 'three';

export class GameConfig{

    constructor(lines, col, radius){
        this.plane = this.configPlane(lines, col, radius);
        this.scene = this.configScene(this.plane);
        this.matrix = this.initMatrix(lines, col);
    }

    //creates the XY plane, returning a 3D object
    configPlane = (lines, col, radius) => {
        const geometry = new THREE.PlaneGeometry(
            col * (radius + radius * Math.sin(Math.PI / 6)) + radius * Math.sin(Math.PI / 6) + 3000,
            (lines + 1) * radius * Math.cos(Math.PI / 6) + 3000
        );
        const planeMaterial = new THREE.MeshBasicMaterial({opacity: 0, transparent: true});
        // const planeMaterial = new THREE.MeshBasicMaterial({color: new THREE.Color(1,1,1), side: THREE.DoubleSide});
        const plane = new THREE.Mesh(geometry, planeMaterial);
        plane.translateOnAxis(new THREE.Vector3(0, 0, 1), 0);
        return plane;
    };

    //creates scene, adding plane and returning it
    configScene = (plane) => {
        console.log('bouh');
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
}