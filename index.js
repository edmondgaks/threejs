class Stage {
    constructor() {
      this.renderParam = {
        clearColor: 0x000000,
        width: window.innerWidth,
        height: window.innerHeight
      }
      
      this.cameraParam = {
        fov: 70,
        near: 0.01,
        far: 1000,
        lookAt: new THREE.Vector3(0, 0, 0),
        x: 0,
        y: -1,
        z: -0.05
      }
      
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      
      this.isInitialized = false;
    }
    
    init() {
      this._setScene();
      this._setRender();
      this._setCamera();
      
      this.isInitialized = true;
    }
    
    _setScene() {
      this.scene = new THREE.Scene();
    }
    
    _setRender() {
      this.renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById("webgl-canvas"),
        antialias: true,
        alpha: true
      });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setClearColor(new THREE.Color(this.renderParam.clearColor)); 
      this.renderer.setSize( this.renderParam.width, this.renderParam.height );
    }
    
    _setCamera() {
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;
      
      if( !this.isInitialized ){
        this.camera = new THREE.PerspectiveCamera(
          this.cameraParam.fov,
          this.renderParam.width / this.renderParam.height,
          this.cameraParam.near,
          this.cameraParam.far
        );
        
        this.camera.position.set(
          this.cameraParam.x,
          this.cameraParam.y,
          this.cameraParam.z
        );
        this.camera.lookAt(this.cameraParam.lookAt);
        
        this.orbitcontrols = new THREE.OrbitControls(
          this.camera,
          this.renderer.domElement
        );
        this.orbitcontrols.enableDamping = true;
      }
      
      this.camera.aspect = windowWidth / windowHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(windowWidth, windowHeight);
    }
    
    _render() {
      this.renderer.render(this.scene, this.camera);
      this.orbitcontrols.update();
    }
    
    onResize() {
      this._setCamera();
    }
    
    onRaf() {
      this._render();
    }
  }
  
  class Mesh {
    constructor(stage) {
      this.geometryParam = {
        width: 1,
        height: 1,
        widthSegments: 10,
        heightSegments: 10
      }
  
      this.uniforms =  {
        time: { type: "f", value: 0.0 }
      }
  
      this.stage = stage;
      this.mesh = null;
    }
    
    init() {
      this._setMesh();
    }
    
    _setMesh() {
      this.geometry = new THREE.BufferGeometry();
      
      let count = 500;
      
      let position = new Float32Array(count * count * 3);
      for(let i = 0; i < count; i++) {
        for(let j = 0; j < count; j++) {
          
          let u = Math.random() * 2 * Math.PI;
          let v = Math.random() * Math.PI;
  
          let x = (0.9 + 0.2 * v) * Math.cos(u) * Math.sin(v);
          let y = 1.5 * Math.cos(v);
          let z = (0.9 + 0.2 * v) * Math.sin(u) * Math.sin(v);
   
          // position.set([
          //   (i / count - 0.5) * 10,
          //   (j / count - 0.5) * 10,
          //   0
          // ], 3 * (count * i + j));
          position.set([
            x,
            y,
            z
          ], 3 * (count * i + j));
        }
      }
      
      this.geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
      
      const material = new THREE.ShaderMaterial({
        vertexShader: document.getElementById("js-vertex-shader").textContent,
        fragmentShader: document.getElementById("js-fragment-shader").textContent,
        uniforms: this.uniforms,
        side: THREE.DoubleSide,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending
      });
      
      this.mesh = new THREE.Points(this.geometry, material);
      this.stage.scene.add(this.mesh);
    }
    
    _render() {
      this.uniforms.time.value += 0.05;
    }
    
    onRaf() {
      this._render();
    }
  }
  
  (() => {
    const stage = new Stage();
    const mesh = new Mesh(stage);
    
    stage.init();
    mesh.init();
    
    window.addEventListener("resize", () => {
      stage.onResize();
    });
    
    const _raf = () => {
      window.requestAnimationFrame(() => {
        stage.onRaf();
        mesh.onRaf();
  
        _raf();
      });
    }
    
    _raf();
  })();