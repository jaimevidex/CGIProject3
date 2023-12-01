import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from '../../libs/utils.js';
import { length, flatten, inverse, mult, normalMatrix, perspective, lookAt, vec4, vec3, vec2, subtract, add, scale, scalem, rotate, rotateX, rotateY, rotateZ, normalize, translate } from '../../libs/MV.js';
import { modelView, loadMatrix, multRotationY, multScale ,multTranslation, pushMatrix, popMatrix, multRotationZ, multRotationX } from "../../libs/stack.js";

import * as dat from '../../libs/dat.gui.module.js';

import * as CUBE from '../../libs/objects/cube.js';
import * as SPHERE from '../../libs/objects/sphere.js';
import * as COW from '../../libs/objects/cow.js';
import * as BUNNY from '../../libs/objects/bunny.js';
import * as CYLINDER from '../../libs/objects/cylinder.js';
import * as PYRAMID from '../../libs/objects/pyramid.js';
import * as TORUS from '../../libs/objects/torus.js';

import * as STACK from '../../libs/stack.js';

import { objects } from '../project03_/objects.js';

let currentObjectIndex = 0;
let curObject = objects.scene[0].children[currentObjectIndex];
let newSelection = false;

function setup(shaders) {
    const canvas = document.getElementById('gl-canvas');
    const gl = setupWebGL(canvas);

    CUBE.init(gl);
    SPHERE.init(gl);
    COW.init(gl);
    BUNNY.init(gl);
    CYLINDER.init(gl);
    PYRAMID.init(gl);
    TORUS.init(gl);

    const program = buildProgramFromSources(gl, shaders['shader.vert'], shaders['shader.frag']);

    function fromStringToShape(string) {
        switch(string) {
            case 'Cube':
                return CUBE;
            case 'Sphere':
                return SPHERE;
            case 'Cow':
                return COW;
            case 'Bunny':
                return BUNNY;
            case 'Cylinder':
                return CYLINDER;
            case 'Pyramid':
                return PYRAMID;
            case 'Torus':
                return TORUS;
        }
    }

    const shapes = ['Cube','Sphere','Cow','Bunny','Cylinder','Pyramid','Torus'];

    
    let shape = { shape : curObject.shapeName};

    // Camera  
    let camera = {
        eye: vec3(0,0,5),
        at: vec3(0,0,0),
        up: vec3(0,1,0),
        fovy: 55,
        aspect: 1, // Updated further down
        near: 0.1,
        far: 20
    }

    let options = {
        backfaceCulling : true,
        zBuffer: true,
        animation: false,
        visibleLights: true
    }

    const objectGui = new dat.GUI({autoPlace:false});

    objectGui.add(shape, 'shape', shapes).listen().onChange(function(v) {
        curObject.shape = fromStringToShape(v);
        curObject.shapeName = v;
    });

    let customContainer = document.getElementById('my-gui-container');
    customContainer.appendChild(objectGui.domElement);

    const gui = new dat.GUI();

    const optionsGui = gui.addFolder("options");
    optionsGui.add(options, "backfaceCulling");
    optionsGui.add(options, "zBuffer");
    optionsGui.add(options, "animation");
    optionsGui.add(options, "visibleLights");

    const cameraGui = gui.addFolder("camera");
    cameraGui.add(camera, "fovy").min(1).max(100).step(1).listen();
    cameraGui.add(camera, "aspect").min(0).max(10).step(0.01).listen().domElement.style.pointerEvents = "none";
    
    cameraGui.add(camera, "near").min(0.1).max(20).step(0.01).listen().onChange( function(v) {
        camera.near = Math.min(camera.far-0.5, v);
    });

    cameraGui.add(camera, "far").min(0.1).max(20).step(0.01).listen().onChange( function(v) {
        camera.far = Math.max(camera.near+0.5, v);
    });

    const eye = cameraGui.addFolder("eye");
    eye.add(camera.eye, 0).step(0.05).listen().domElement.style.pointerEvents = "none";;
    eye.add(camera.eye, 1).step(0.05).listen().domElement.style.pointerEvents = "none";;
    eye.add(camera.eye, 2).step(0.05).listen().domElement.style.pointerEvents = "none";;

    const at = cameraGui.addFolder("at");
    at.add(camera.at, 0).step(0.05).listen().domElement.style.pointerEvents = "none";;
    at.add(camera.at, 1).step(0.05).listen().domElement.style.pointerEvents = "none";;
    at.add(camera.at, 2).step(0.05).listen().domElement.style.pointerEvents = "none";;

    const up = cameraGui.addFolder("up");
    up.add(camera.up, 0).step(0.05).listen().domElement.style.pointerEvents = "none";;
    up.add(camera.up, 1).step(0.05).listen().domElement.style.pointerEvents = "none";;
    up.add(camera.up, 2).step(0.05).listen().domElement.style.pointerEvents = "none";;

    // matrices
    let mView, mProjection;

    let down = false;
    let lastX, lastY;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    resizeCanvasToFullWindow();

    window.addEventListener('resize', resizeCanvasToFullWindow);

    window.addEventListener('wheel', function(event) {
        if(!event.altKey && !event.metaKey && !event.ctrlKey) { // Change fovy
            const factor = 1 - event.deltaY/1000;
            camera.fovy = Math.max(1, Math.min(100, camera.fovy * factor)); 
        }
        else if(event.metaKey || event.ctrlKey) {
            // move camera forward and backwards (shift)

            const offset = event.deltaY / 1000;

            const dir = normalize(subtract(camera.at, camera.eye));

            const ce = add(camera.eye, scale(offset, dir));
            const ca = add(camera.at, scale(offset, dir));
            
            // Can't replace the objects that are being listened by dat.gui, only their properties.
            camera.eye[0] = ce[0];
            camera.eye[1] = ce[1];
            camera.eye[2] = ce[2];

            if(event.ctrlKey) {
                camera.at[0] = ca[0];
                camera.at[1] = ca[1];
                camera.at[2] = ca[2];
            }
        }

        
    });

    function inCameraSpace(m) {
        const mInvView = inverse(mView);

        return mult(mInvView, mult(m, mView));
    }

    canvas.addEventListener('mousemove', function(event) {
        if(down) {
            const dx = event.offsetX - lastX;
            const dy = event.offsetY - lastY;

            if(dx != 0 || dy != 0) {
                // Do something here...

                const d = vec2(dx, dy);
                const axis = vec3(-dy, -dx, 0);

                const rotation = rotate(0.5*length(d), axis);

                let eyeAt = subtract(camera.eye, camera.at);                
                eyeAt = vec4(eyeAt[0], eyeAt[1], eyeAt[2], 0);
                let newUp = vec4(camera.up[0], camera.up[1], camera.up[2], 0);

                eyeAt = mult(inCameraSpace(rotation), eyeAt);
                newUp = mult(inCameraSpace(rotation), newUp);
            
                camera.eye[0] = camera.at[0] + eyeAt[0];
                camera.eye[1] = camera.at[1] + eyeAt[1];
                camera.eye[2] = camera.at[2] + eyeAt[2];

                camera.up[0] = newUp[0];
                camera.up[1] = newUp[1];
                camera.up[2] = newUp[2];

                lastX = event.offsetX;
                lastY = event.offsetY;
            }

        }
    });

    document.onkeydown = function (event) {
        switch (event.key) {
            case '1': 
                if (currentObjectIndex != 0)
                    newSelection = true;
                else
                    newSelection = false;
                currentObjectIndex = 0;
                curObject = objects.scene[0].children[currentObjectIndex];
                updateGui();
                break;
            case '2': 
                if (currentObjectIndex != 1)
                    newSelection = true;
                else
                    newSelection = false;
                currentObjectIndex = 1;
                curObject = objects.scene[0].children[currentObjectIndex];
                updateGui();
                break;
            case '3': 
                if (currentObjectIndex != 2)
                    newSelection = true;
                else
                    newSelection = false;
                currentObjectIndex = 2;
                curObject = objects.scene[0].children[currentObjectIndex];
                updateGui();
                break;
            case '4': 
                if (currentObjectIndex != 3)
                    newSelection = true;
                else
                    newSelection = false;
                currentObjectIndex = 3;
                curObject = objects.scene[0].children[currentObjectIndex];
                updateGui();
                break;
        }
    }

    canvas.addEventListener('mousedown', function(event) {
        down=true;
        lastX = event.offsetX;
        lastY = event.offsetY;
        gl.clearColor(0.2, 0.0, 0.0, 1.0);
    });

    canvas.addEventListener('mouseup', function(event) {
        down = false;
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
    });

    window.requestAnimationFrame(render);

    function resizeCanvasToFullWindow()
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        camera.aspect = canvas.width / canvas.height;

        gl.viewport(0,0,canvas.width, canvas.height);
    }

    function render(time)
    {
        window.requestAnimationFrame(render);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(program);

        mView = lookAt(camera.eye, camera.at, camera.up);
        loadMatrix(mView);

        mProjection = perspective(camera.fovy, camera.aspect, camera.near, camera.far);

        function buildTransform(pos, rot, sca) {
            const [px, py, pz] = pos;
            const [rx, ry, rz] = rot;
            const [sx, sy, sz] = sca;
        
            const t = translate(px, py, pz);
            const r = mult(rotateZ(rz), mult(rotateY(ry), rotateX(rx))); 
            const s = scalem(sx, sy, sz);
            const m = mult(t, mult(r, s));
        
            return m;
        }

        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mProjection"), false, flatten(mProjection));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mView"), false, flatten(mView));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mViewNormals"), false, flatten(normalMatrix(mView)));

        gl.uniform1f(gl.getUniformLocation(program, "shadow"), 0.0)

        let i = 0.0
        for ( let light of objects.lights ) {
            if (light.active) {
                gl.uniform4fv(gl.getUniformLocation(program, "uLight["+i+"].pos"), flatten(vec4(light.position[0],light.position[1],light.position[2], light.directional ? 0.0 : 1.0 )));
                gl.uniform3fv(gl.getUniformLocation(program, "uLight["+i+"].Ia"), flatten(light.ambient));
                gl.uniform3fv(gl.getUniformLocation(program, "uLight["+i+"].Id"), flatten(light.diffuse));
                gl.uniform3fv(gl.getUniformLocation(program, "uLight["+i+"].Is"), flatten(light.specular));
                const m = buildTransform(light.position,[0,0,0],[0.1,0.1,0.1])
                gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(mult(modelView(), m)));
                gl.uniformMatrix4fv(gl.getUniformLocation(program, "mNormals"), false, flatten(normalMatrix(modelView())));
                gl.uniform3fv(gl.getUniformLocation(program, "uMaterial.Ka"), flatten(light.ambient));
                gl.uniform3fv(gl.getUniformLocation(program, "uMaterial.Kd"), flatten(light.diffuse));
                gl.uniform3fv(gl.getUniformLocation(program, "uMaterial.Ks"), flatten(light.specular));
                gl.uniform1f(gl.getUniformLocation(program, "uMaterial.shininess"), light.shininess);
                SPHERE.draw(gl, program, gl.TRIANGLES);
                i++;
            }
        }

        gl.uniform1f(gl.getUniformLocation(program, "shadow"), 1.0);
    
        let sc = objects.scene[0]
        const m = buildTransform(sc.position,sc.rotation,sc.scale)
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(mult(modelView(), m)));
        gl.uniformMatrix4fv(gl.getUniformLocation(program, "mNormals"), false, flatten(normalMatrix(modelView())));
        gl.uniform3fv(gl.getUniformLocation(program, "uMaterial.Ka"), flatten(sc.Ka));
        gl.uniform3fv(gl.getUniformLocation(program, "uMaterial.Kd"), flatten(sc.Kd));
        gl.uniform3fv(gl.getUniformLocation(program, "uMaterial.Ks"), flatten(sc.Ks));
        gl.uniform1f(gl.getUniformLocation(program, "uMaterial.shininess"), sc.shininess);
        sc.shape.draw(gl, program, gl.TRIANGLES);

        if (newSelection) {
            const m = buildTransform(curObject.position,curObject.rotation,curObject.scale)
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(mult(modelView(), m)));
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "mNormals"), false, flatten(normalMatrix(modelView())));
            gl.uniform3fv(gl.getUniformLocation(program, "uMaterial.Ka"), flatten([255,255,255]));
            gl.uniform3fv(gl.getUniformLocation(program, "uMaterial.Kd"), flatten([255,255,255]));
            gl.uniform3fv(gl.getUniformLocation(program, "uMaterial.Ks"), flatten([255,255,255]));
            gl.uniform1f(gl.getUniformLocation(program, "uMaterial.shininess"), 255);
            curObject.shape.draw(gl, program, gl.LINES);
        }

        for ( let chi of sc.children) {
            const m = buildTransform(chi.position,chi.rotation,chi.scale)
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "mModelView"), false, flatten(mult(modelView(), m)));
            gl.uniformMatrix4fv(gl.getUniformLocation(program, "mNormals"), false, flatten(normalMatrix(modelView())));
            gl.uniform3fv(gl.getUniformLocation(program, "uMaterial.Ka"), flatten(chi.Ka));
            gl.uniform3fv(gl.getUniformLocation(program, "uMaterial.Kd"), flatten(chi.Kd));
            gl.uniform3fv(gl.getUniformLocation(program, "uMaterial.Ks"), flatten(chi.Ks));
            gl.uniform1f(gl.getUniformLocation(program, "uMaterial.shininess"), chi.shininess);
            chi.shape.draw(gl, program, options.wireframe ? gl.LINES : gl.TRIANGLES);
        }
    }
}

const urls = ['shader.vert', 'shader.frag'];

loadShadersFromURLS(urls).then( shaders => setup(shaders));