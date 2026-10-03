// ============================================================
//  scene.js — Centralized Three.js Scene, Camera & Renderer Manager
// ============================================================
window.SceneManager = (function() {
  'use strict';
  function getTHREE() {
    if (typeof window !== 'undefined' && window.THREE) return window.THREE;
    if (typeof globalThis !== 'undefined' && globalThis.THREE) return globalThis.THREE;
    if (typeof global !== 'undefined' && global.THREE) return global.THREE;
    return null;
  }

  let scene = null;
  let camera = null;
  let renderer = null;
  let ambientLight = null;
  let sunLight = null;
  let fillLight = null;
  let starfieldMesh = null;

  function createStarfield() {
    const THREE = getTHREE();
    if (!THREE) return;
    if (starfieldMesh && scene) scene.remove(starfieldMesh);

    const starCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);

    for (let i = 0; i < starCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 2400.0 + Math.random() * 200.0;

      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 20.0;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);

      const colorType = Math.random();
      if (colorType > 0.85) {
        colors[i * 3] = 1.0; colors[i * 3 + 1] = 0.85; colors[i * 3 + 2] = 0.4;
      } else if (colorType > 0.65) {
        colors[i * 3] = 0.5; colors[i * 3 + 1] = 0.8; colors[i * 3 + 2] = 1.0;
      } else {
        colors[i * 3] = 0.95; colors[i * 3 + 1] = 0.95; colors[i * 3 + 2] = 1.0;
      }
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 2.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      fog: false,
      sizeAttenuation: false
    });

    starfieldMesh = new THREE.Points(geometry, material);
    starfieldMesh.name = 'starfield';
    if (scene) scene.add(starfieldMesh);
  }

  function init(canvasId) {
    const THREE = getTHREE();
    if (!THREE) {
      console.error('[SceneManager] THREE is not loaded!');
      return null;
    }
    console.log('[NewGame Trace] [1/5] SceneManager.init() called for canvasId:', canvasId || 'game-canvas');
    let canvas = document.getElementById(canvasId || 'game-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = canvasId || 'game-canvas';
      document.body.prepend(canvas);
    }

    // 1. Ensure canvas is visible in DOM
    canvas.classList.remove('hidden');
    canvas.style.display = 'block';
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '1';

    // 2. Singleton THREE.Scene (Prevent second scene creation)
    if (!scene) {
      scene = new THREE.Scene();
      console.log('[NewGame Trace] [2/5] Created Primary THREE.Scene singleton.');
    }
    scene.background = new THREE.Color(0x0e1724);
    scene.fog = new THREE.FogExp2(0x111c2b, 0.0007);

    // 3. Singleton Camera
    if (!camera) {
      camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.5, 30000
      );
      console.log('[NewGame Trace] [3/5] Created Primary THREE.PerspectiveCamera.');
    }
    camera.far = 30000;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    camera.position.set(0, 4.5, 6.5);
    camera.lookAt(0, 0.6, 0);

    // 4. Singleton WebGLRenderer (Desktop High Fidelity - Artistic Dark Fantasy Tone)
    if (!renderer) {
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          antialias: true,
          preserveDrawingBuffer: true,
          alpha: false,
          powerPreference: 'high-performance'
        });
        console.log('[NewGame Trace] [4/5] WebGLRenderer initialized on canvas:', renderer.domElement);
      } catch (err) {
        console.warn('[SceneManager] WebGL fallback renderer created:', err);
        renderer = new THREE.WebGLRenderer({ canvas, alpha: false });
      }
    }

    const width = window.innerWidth || document.documentElement.clientWidth || 1280;
    const height = window.innerHeight || document.documentElement.clientHeight || 720;
    renderer.setSize(width, height, true);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2.0)); // Ultra-crisp desktop rendering
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = (THREE.PCFSoftShadowMap !== undefined) ? THREE.PCFSoftShadowMap : THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.90; // Balanced artistic contrast, no washed-out highlights
    if (renderer.outputColorSpace && THREE.SRGBColorSpace) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    // 5. Stylized Artistic Lights (Atmospheric Contrast & Rim Contour)
    if (!ambientLight) {
      ambientLight = new THREE.AmbientLight(0x425672, 0.45);
      scene.add(ambientLight);
    } else {
      ambientLight.color.set(0x425672);
      ambientLight.intensity = 0.45;
      if (!scene.children.includes(ambientLight)) scene.add(ambientLight);
    }

    if (!sunLight) {
      sunLight = new THREE.DirectionalLight(0xffecd1, 0.98);
      sunLight.position.set(38, 52, 26);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 2048; // 2K crisp shadow resolution
      sunLight.shadow.mapSize.height = 2048;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 160;
      sunLight.shadow.camera.left = -45;
      sunLight.shadow.camera.right = 45;
      sunLight.shadow.camera.top = 45;
      sunLight.shadow.camera.bottom = -45;
      sunLight.shadow.bias = -0.00018;
      sunLight.shadow.radius = 2.4; // Soft realistic shadow penumbra
      scene.add(sunLight);
    } else {
      sunLight.color.set(0xffecd1);
      sunLight.intensity = 0.98;
      if (!scene.children.includes(sunLight)) scene.add(sunLight);
    }

    if (!fillLight) {
      fillLight = new THREE.HemisphereLight(0x425b78, 0x142018, 0.35);
      scene.add(fillLight);
    } else {
      fillLight.color.set(0x425b78);
      fillLight.groundColor.set(0x142018);
      fillLight.intensity = 0.35;
      if (!scene.children.includes(fillLight)) scene.add(fillLight);
    }

    // 5a. Cinematic Rim Light (Atmospheric Backlighting for sculpted silhouettes)
    let rimLight = scene.getObjectByName('cinematic_rim_light');
    if (!rimLight) {
      rimLight = new THREE.DirectionalLight(0x56a4d8, 0.42);
      rimLight.name = 'cinematic_rim_light';
      rimLight.position.set(-35, 30, -35);
      scene.add(rimLight);
    }

    // 5b. Twinkling Starfield Sky Dome (1500 Celestial Stars)
    if (!starfieldMesh) {
      createStarfield();
    }

    // 6. Render First Frame
    onResize();
    renderer.render(scene, camera);
    console.log(`[NewGame Trace] [5/5] First frame rendered successfully! Scene contains ${scene.children.length} active objects.`);

    window.removeEventListener('resize', onResize);
    window.addEventListener('resize', onResize);

    return { scene, camera, renderer };
  }

  function onResize() {
    if (!camera || !renderer) return;
    const w = window.innerWidth || document.documentElement.clientWidth || 1280;
    const h = window.innerHeight || document.documentElement.clientHeight || 720;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, true);
  }

  let frameCount = 0;

  function render() {
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
      frameCount++;
      if (frameCount % 60 === 1) {
        console.log(`[3D World Diagnostics] Frame #${frameCount} | Scene Children: ${scene.children.length} | Camera Pos: (${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}) | Draw Calls: ${renderer.info ? renderer.info.render.calls : 'N/A'}`);
      }
    }
  }

  function getScene() {
    if (!scene && typeof document !== 'undefined') {
      const canvas = document.getElementById('game-canvas');
      if (canvas) init('game-canvas');
    }
    return scene;
  }

  function getCamera() {
    return camera;
  }

  function getRenderer() {
    return renderer;
  }

  function getSunLight() {
    return sunLight;
  }

  function getAmbientLight() {
    return ambientLight;
  }

  function getFillLight() {
    return fillLight;
  }

  return {
    init,
    onResize,
    render,
    getScene,
    getCamera,
    getRenderer,
    getSunLight,
    getAmbientLight,
    getFillLight
  };
})();



