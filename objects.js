import * as CUBE from './libs/objects/cube.js';
import * as SPHERE from './libs/objects/sphere.js';
import * as COW from './libs/objects/cow.js';
import * as BUNNY from './libs/objects/bunny.js';
import * as CYLINDER from './libs/objects/cylinder.js';
import * as PYRAMID from './libs/objects/pyramid.js';
import * as TORUS from './libs/objects/torus.js';

export {objects}

let objects = {
    scene: [ {
        name: 'floor',
        shape: CUBE,
        position: [0, -0.05, 0],
        rotation: [0, 0, 0],
        scale: [4, 0.1, 4],
        Ka: [0.5,0.5,0.5],
        Kd: [0.5,0.5,0.5],
        Ks: [0.5,0.5,0.5],
        shininess: 100,
        children: [
            {
                name: 'object1',
                shape: CUBE,
                shapeName: 'Cube',
                position: [-1, 0.5, -1],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
                Ka: [0,0,0.5],
                Kd: [0,0,0.5],
                Ks: [0,0,0.5],
                shininess: 100,
                children: []
            },
            {
                name: 'object2',
                shape: SPHERE,
                shapeName: 'Sphere',
                position: [1, 0.5, -1],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
                Ka: [0.5,0,0],
                Kd: [0.5,0,0],
                Ks: [0.5,0,0],
                shininess: 100,
                children: []
            },
            {
                name: 'object3',
                shape: COW,
                shapeName: 'Cow',
                position: [-1, 0.5, 1],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
                Ka: [0,0.5,0],
                Kd: [0,0.5,0],
                Ks: [0,0.5,0],
                shininess: 100,
                children: []
            },
            {
                name: 'object4',
                shape: BUNNY,
                shapeName: 'Bunny',
                position: [1, 0.5, 1],
                rotation: [0, 0, 0],
                scale: [1, 1, 1],
                Ka: [0,0.5,0.5],
                Kd: [0,0.5,0.5],
                Ks: [0,0.5,0.5],
                shininess: 100,
                children: []
            }
        ]
    } ],
    lights: [
        {
            position: [0, 0 ,3.0],
            ambient: [0.3,0.3,0.3],
            diffuse: [0.7,0.7,0.7],
            specular: [1.0,1.0,1.0],
            shininess: 6,
            directional: false,
            active: true
        },
        {
            position: [3.0, 0 ,0],
            ambient: [0.3,0.3,0.3],
            diffuse: [0.7,0.7,0.7],
            specular: [1.0,1.0,1.0],
            shininess: 6,
            directional: false,
            active: true
        },
        {
            position: [0, 3.0 ,0],
            ambient: [0.3,0.3,0.3],
            diffuse: [0.7,0.7,0.7],
            specular: [1.0,1.0,1.0],
            shininess: 6,
            directional: false,
            active: true
        }
    ] 
}