import { buildProgramFromSources, loadShadersFromURLS, setupWebGL } from "../../libs/utils.js";
  import { ortho, lookAt, flatten, perspective, vec3, vec2,vec4, rotateY, rotateX, rotateZ, mult,scale, normalMatrix } from "../../libs/MV.js";
import {modelView, loadMatrix, multRotationX, multRotationY, multRotationZ, multScale, multTranslation, popMatrix, pushMatrix} from "../../libs/stack.js";

import * as CUBE from '../../libs/objects/cube.js';
import * as CYLINDER from '../../libs/objects/cylinder.js'
import * as BUNNY from '../../libs/objects/bunny.js'
import * as SPHERE from '../../libs/objects/sphere.js'
import * as TORUS from '../../libs/objects/torus.js'

import * as dat from "../../libs/dat.gui.module.js";


let mouseMoving = false;
const cameraSpeedX = 100.0;
const cameraSpeedY = 100.0;
const RGB = 255;
let cameraAngleX = 0;
let cameraAngleY = 0;
let lastMouseX = 0.0;
let lastMouseY = 0.0;

//primitive types

const BUNNY_TYPE = "bunny";
const TORUS_TYPE = "torus";
const CUBE_TYPE = "cube";
const FLOOR_TYPE = "floor";
const CYLINDER_TYPE = "cylinder";
const LIGHT_TYPE = "light"

let bunnyPrimitive = {
    Ka: vec3(227,152,150),
    Kd: vec3(150, 150, 150),
    Ks: vec3(200, 200, 200),
    shininess: 100,
  };

let donutPrimitive = {
    Ka: vec3(0,139,38),
    Kd: vec3(150, 150, 150),
    Ks: vec3(200, 200, 200),
    shininess: 100,
  };

let  cubePrimitive = {
    Ka: vec3(150,75,75),
    Kd: vec3(150, 75, 75),
    Ks: vec3(200, 200, 200),
    shininess: 100,
  }

let  floorPrimitive = {
    Ka: vec3(150,150,75),
    Kd: vec3(125, 125, 125),
    Ks: vec3(0, 0, 0),
    shininess: 1.0,
  };

let  cylinderPrimitive = {
    Ka: vec3(0,150,100),
    Kd: vec3(0, 150, 100),
    Ks: vec3(200, 200, 200),
    shininess: 100,
  }

let  lightPrimitive = {
    Ka: vec3(RGB, RGB, RGB),
    Kd: vec3(RGB, RGB, RGB),
    Ks: vec3(RGB, RGB, RGB),
    shininess: 100,
  }

let  lightInfo = [{ //spotlight
    active: true,
    position: vec4(0.0, 10.0, 0.0, 1.0),
    ambient: vec3(50.0, 50.0, 50.0),
    diffuse: vec3(60.0, 60.0, 60.0),
    specular: vec3(200.0, 200.0, 200.0),
    axis: vec4(0.0, 0.0, -1.0, 0.0),
    aperture: 10.0,
    cutoff: 10.0,
  },
  { //direcional
    active: true,
    position: vec4(-20.0, 5.0, 5.0, 0.0),
    ambient: vec3(50.0, 0.0, 0.0),
    diffuse: vec3(50.0, 0.0, 0.0),
    specular: vec3(150, 0.0, 0.0),
    axis: vec4(20.0, -5.0, -5.0, 0.0),
    aperture: 180.0,
    cutoff: -1.0,
  },
  { //pontual
    active: true,
    position: vec4(5.0, 5.0, 2.0, 1.0),
    ambient: vec3(75.0, 75.0, 100.0),
    diffuse: vec3(75.0, 75.0, 100.0),
    specular: vec3(150, 150.0, 175.0),
    axis: vec4(-5.0, 5.0, -2.0, 0.0),
    aperture: 180.0,
    cutoff: -1.0,
  }
  ]

function setup(shaders)
{
    let canvas = document.getElementById("gl-canvas");
    let aspect = canvas.width / canvas.height;
    
    
    /** @type WebGL2RenderingContext */
    let gl = setupWebGL(canvas);

    // Drawing mode (gl.LINES or gl.TRIANGLES)
    let mode = gl.TRIANGLES;

    let program = buildProgramFromSources(gl, shaders["shader.vert"], shaders["shader.frag"]);

    let camera = {
            eye: vec3(2, 2, 0),
            at: vec3(0, 0.6, 0),
            up: vec3(0, 1, 0),
            fovy: 90,
            near: 0.1,
            far: 40.0
        };

    const gui = new dat.GUI();
    
    // Camera GUI
    const cameraFolder = gui.addFolder("Camera");

    const cameraEye = cameraFolder.addFolder("eye");
    const cameraAt = cameraFolder.addFolder("at");
    cameraEye.add(camera.eye, 0).step(0.05).name("x"); 
    cameraEye.add(camera.eye, 1).step(0.05).name("y"); 
    cameraEye.add(camera.eye, 2).step(0.05).name("z"); 
    cameraAt.add(camera.at, 0).step(0.05).name("x"); 
    cameraAt.add(camera.at, 1).step(0.05).name("y"); 
    cameraAt.add(camera.at, 2).step(0.05).name("z"); 
    cameraFolder.add(camera, "fovy", 1.0, 180.0);
    cameraFolder.add(camera, "near", 0.0, 2.0);
    cameraFolder.add(camera, "far", 0.0, 50.0);
  
    let ADJUSTABLE_VARS = {};
   
    let mProjection = perspective(
            camera.fovy,
            aspect, 
            camera.near, 
            camera.far);
    let mView = lookAt(camera.eye, camera.at, [0, 1, 0]);

    let zoom = 1.0;

    /** Model parameters */
    let ag = 0;
    let rg = 0;
    let rb = 0;
    let rc = 0;

    resize_canvas();
    window.addEventListener("resize", resize_canvas);
    
    document.onM
    
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
    
  function getCursorPosition(canvas, event) {
  
       
        const mx = event.offsetX;
        const my = event.offsetY;

        const x = (((mx / canvas.width * 2) - 1)*1.5);
        const y = ((((canvas.height - my)/canvas.height * 2) -1) * (1.5 * (canvas.height / canvas.width)));

        return vec2(x,y);
    }

    canvas.addEventListener("mousedown", function(event) {
      mouseMoving = true;
      let mousePos1 = getCursorPosition(canvas, event); 
      lastMouseX = mousePos1[0];
      lastMouseY = mousePos1[1];
    });

    canvas.addEventListener("mouseup", function(event) {
      mouseMoving = false;
    });
    
    canvas.addEventListener("mousemove", function(event) {
      let mousePos2 = getCursorPosition(canvas, event); 
      if(mouseMoving) {
          cameraAngleX += (mousePos2[0] - lastMouseX) * cameraSpeedX;
          cameraAngleY += (mousePos2[1] - lastMouseY) * cameraSpeedY;

          let mousePos1 = getCursorPosition(canvas, event); 
          lastMouseX = mousePos1[0];
          lastMouseY = mousePos1[1];
      }
    });

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
            camera.near, 
            camera.far);
    }

    function uploadProjection()
    {
        uploadMatrix("mProjection", mProjection);
    }

    function uploadModelView()
    {
        uploadMatrix("mModelView", modelView());
        uploadMatrix("mNormals", normalMatrix(modelView()));
        uploadMatrix("mViewNormals", normalMatrix(mView));
    }

    function uploadMatrix(name, m) {
        gl.uniformMatrix4fv(gl.getUniformLocation(program, name), false, flatten(m));
    }

    function primitiveToShaderPerType(type){
        
            switch(type){
                case BUNNY_TYPE:
                    primitiveMaterialToShader(bunnyPrimitive.Ka,bunnyPrimitive.Kd,bunnyPrimitive.Ks,bunnyPrimitive.shininess);
                break;
                case TORUS_TYPE:
                    primitiveMaterialToShader(donutPrimitive.Ka,donutPrimitive.Kd,donutPrimitive.Ks,donutPrimitive.shininess);
                break;
                case CUBE_TYPE:
                    primitiveMaterialToShader(cubePrimitive.Ka,cubePrimitive.Kd,cubePrimitive.Ks,cubePrimitive.shininess);
                break;
                case FLOOR_TYPE:
                    primitiveMaterialToShader(floorPrimitive.Ka,floorPrimitive.Kd,floorPrimitive.Ks,floorPrimitive.shininess);
                break;
                case CYLINDER_TYPE:
                    primitiveMaterialToShader(cylinderPrimitive.Ka,cylinderPrimitive.Kd,cylinderPrimitive.Ks,cylinderPrimitive.shininess);
                break;
                case LIGHT_TYPE:
                    primitiveMaterialToShader(lightPrimitive.Ka,lightPrimitive.Kd,lightPrimitive.Ks,lightPrimitive.shininess);
                break;
            }
    }

    function uniformUpdate(type, color){
        selectColor(color);
        uploadModelView();
        primitiveToShaderPerType(type);
    }


    function primitiveMaterialToShader(Ka,Kd,Ks,shininess){
        const uKa = gl.getUniformLocation(program, "uMaterial.ka");
        gl.uniform3fv(uKa,flatten(scale(1/RGB,Ka)));
        const uKd = gl.getUniformLocation(program, "uMaterial.kd");
        gl.uniform3fv(uKd,flatten(scale(1/RGB,Kd)));
        const uKs = gl.getUniformLocation(program, "uMaterial.ks");
        gl.uniform3fv(uKs,flatten(scale(1/RGB,Ks)));
        const ushininess = gl.getUniformLocation(program, "uMaterial.shininess");
        gl.uniform1f(ushininess,shininess);
    }

    function selectColor(color){
        let floorColor = vec3(color[0] / 255.0, color[1] / 255.0, color[2] / 255.0);
        const uColor = gl.getUniformLocation(program, "uColor");
       // gl.useProgram(program);
        gl.uniform3fv(uColor, flatten(floorColor));
      }

    function ground(){
      multScale([2.4, 0.1, 2.4]);
      uniformUpdate(CUBE_TYPE,vec3(235, 205, 75));
      CUBE.draw(gl, program, mode);
    }

    function world(){
        pushMatrix();
            //multRotationY(50.0); // Nao funciona e nao sei pq
            //multTranslation([2.0, 0.0, 2.0]);
            ground();
        popMatrix();
        pushMatrix();
            bunny();
        popMatrix();
    }

    function bunny(){
      multScale([3.5, 3.5, 3.5]);
      uniformUpdate(BUNNY_TYPE,vec3(255, 51, 143));
      BUNNY.draw(gl, program, mode);
    }

    function getCameraEye(){
      
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
            camera.near, 
            camera.far);
        uploadProjection(mProjection);

        // Load the ModelView matrix with the Worl to Camera (View) matrix
    
        mView = lookAt(camera.eye, camera.at, [0, 1, 0]);
    
      // mView = lookAt(camera.eye, camera.at, [0, 1, 0]);

        
        
        if(camera.eye[2] !=0 && camera.eye[0] !=0){
            
            let sign = -1;
            if(camera.eye[2] < 0){
                sign = -sign;
            }
    
            if(camera.eye[0] < 0){
                sign = -sign;
            }
    
            if(cameraAngleY/360<180){
                sign = -sign;
            }

            mView = mult(mView,rotateZ((sign*cameraAngleY)/(camera.eye[2])));
            mView = mult(mView,rotateX((-sign*cameraAngleY)/(camera.eye[0])));
        }else{
            
            if(camera.eye[2] !=0){
                mView = mult(mView,rotateX((cameraAngleY)/(camera.eye[2])));
            }
            if(camera.eye[0] != 0){
                mView = mult(mView,rotateZ((cameraAngleY)/(camera.eye[0])));
            }
         } 

        mView = mult(mView,rotateY(cameraAngleX));
        loadMatrix(mView);

        world();
    }
}

const urls = ["shader.vert", "shader.frag"];
loadShadersFromURLS(urls).then(shaders => setup(shaders))
