import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
import { ortho, lookAt, flatten, perspective, vec3, rotateY } from "../../libs/MV.js";
import {modelView, loadMatrix, multRotationX, multRotationY, multRotationZ, multScale, multTranslation, popMatrix, pushMatrix} from "../../libs/stack.js";

import * as CUBE from '../../libs/objects/cube.js';
import * as CYLINDER from '../../libs/objects/cylinder.js'
import * as BUNNY from '../../libs/objects/bunny.js'
import * as SPHERE from '../../libs/objects/sphere.js'
import * as TORUS from '../../libs/objects/torus.js'

import * as dat from "../../libs/dat.gui.module.js";

let camera = {
        eye: vec3(2, 1.2, 1),
        at: vec3(0, 0.6, 0),
        up: vec3(0, 1, 0),
        fovy: 90,
        near: 0.0,
        far: 10.0
    };
let ADJUSTABLE_VARS = {};


function setup(shaders)
{
    let canvas = document.getElementById("gl-canvas");
    let aspect = canvas.width / canvas.height;
    
    
    /** @type WebGL2RenderingContext */
    let gl = setupWebGL(canvas);

    // Drawing mode (gl.LINES or gl.TRIANGLES)
    let mode = gl.TRIANGLES;

    let program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    let mProjection = perspective(
        camera.fovy,
        aspect, 
        0.0, 
        150.0);
    let mView = lookAt(camera.eye, camera.at, [0, 1, 0]);

    let zoom = 1.0;

    /** Model parameters */
    let ag = 0;
    let rg = 0;
    let rb = 0;
    let rc = 0;

    resize_canvas();
    window.addEventListener("resize", resize_canvas);

    document.onkeydown = function(event) {
        switch(event.key) {
            case '1':
                // Front view
                mView = lookAt([0,0.6,1], [0,0.6,0], [0,1,0]);
                break;
            case '2':
                // Top view
                mView = lookAt([0,1.6,0],  [0,0.6,0], [0,0,-1]);
                break;
            case '3':
                // Right view
                mView = lookAt([1, 0.6, 0.], [0, 0.6, 0], [0, 1, 0]);
                break;
            case '4':
                mView = lookAt([2, 1.2, 1], [0, 0.6, 0], [0, 1, 0]);
                break;
            case '9':
                mode = gl.LINES; 
                break;
            case '0':
                mode = gl.TRIANGLES;
                break;
            case 'p':
                ag = Math.min(0.050, ag + 0.005);
                break;
            case 'o':
                ag = Math.max(0, ag - 0.005);
                break;
            case 'q':
                rg += 1;
                break;
            case 'e':
                rg -= 1;
                break;
            case 'w':
                rc = Math.min(120, rc+1);
                break;
            case 's':
                rc = Math.max(-120, rc-1);
                break;
            case 'a':
                rb -= 1;
                break;
            case 'd':
                rb += 1;
                break;
            case '+':
                zoom /= 1.1;
                break;
            case '-':
                zoom *= 1.1;
                break;
        }
    }

    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.enable(gl.DEPTH_TEST);   // Enables Z-buffer depth test

    CUBE.init(gl);
    CYLINDER.init(gl);
    SPHERE.init(gl);
    BUNNY.init(gl);
    TORUS.init(gl);

    window.requestAnimationFrame(render);


    function resize_canvas(event)
    {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        aspect = canvas.width / canvas.height;

        gl.viewport(0,0,canvas.width, canvas.height);
        mProjection = perspective(
            camera.fovy,
            aspect, 
            0.1, 
            40.0);
    }

    function uploadProjection()
    {
        uploadMatrix("mProjection", mProjection);
    }

    function uploadModelView()
    {
        uploadMatrix("mModelView", modelView());
    }

    function uploadMatrix(name, m) {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, name), false, flatten(m));
    }

    function selectColor(color){
        let floorColor = vec3(color[0] / 255.0, color[1] / 255.0, color[2] / 255.0);
        const uColor = gl.getUniformLocation(program, "uColor");
        gl.useProgram(program);
        gl.uniform3fv(uColor, flatten(floorColor));
      }

    function ground(){
    selectColor(vec3(235, 205, 75));
    multScale([2.4, 0.1, 2.4]);
    uploadModelView();
    CUBE.draw(gl, program, mode);
    }

    function world(){
        pushMatrix();
            multRotationY(50.0); // Nao funciona e nao sei pq
            //multTranslation([2.0, 0.0, 2.0]);
            ground();
        popMatrix();
    }

    function render()
    {
        window.requestAnimationFrame(render);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        
        gl.useProgram(program);
        
        // Send the mProjection matrix to the GLSL program
        mProjection = perspective(
            camera.fovy,
            aspect, 
            0.1, 
            40.0);
        uploadProjection(mProjection);

        // Load the ModelView matrix with the Worl to Camera (View) matrix
        loadMatrix(mView);

        world();
    }
}

const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))
