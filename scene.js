/* ============================================================
   3D BACKGROUND SCENE — stars, galaxy dust, fireflies, floating hearts
   ============================================================ */

const BG = (() => {
  const canvas = document.getElementById('bg-canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.z = 60;

  // ---------- Starfield ----------
  const starCount = 2200;
  const starGeo = new THREE.BufferGeometry();
  const starPos = new Float32Array(starCount * 3);
  const starColor = new Float32Array(starCount * 3);
  const palette = [
    new THREE.Color(0xffffff),
    new THREE.Color(0xffe58a),
    new THREE.Color(0xff9fd0),
    new THREE.Color(0xc9a6ff),
  ];
  for (let i = 0; i < starCount; i++) {
    const r = 300 * Math.cbrt(Math.random());
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    starPos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
    starPos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
    starPos[i*3+2] = r * Math.cos(phi) - 100;
    const c = palette[Math.floor(Math.random()*palette.length)];
    starColor[i*3] = c.r; starColor[i*3+1] = c.g; starColor[i*3+2] = c.b;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute('color', new THREE.BufferAttribute(starColor, 3));
  const starMat = new THREE.PointsMaterial({
    size: 1.4, vertexColors: true, transparent: true, opacity: 0.85,
    blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true
  });
  const stars = new THREE.Points(starGeo, starMat);
  scene.add(stars);

  // ---------- Galaxy dust particles ----------
  const dustCount = 900;
  const dustGeo = new THREE.BufferGeometry();
  const dustPos = new Float32Array(dustCount * 3);
  for (let i = 0; i < dustCount; i++) {
    const radius = 20 + Math.random() * 90;
    const angle = Math.random() * Math.PI * 2;
    const spin = radius * 0.02;
    dustPos[i*3]   = Math.cos(angle + spin) * radius;
    dustPos[i*3+1] = (Math.random() - 0.5) * 30;
    dustPos[i*3+2] = Math.sin(angle + spin) * radius - 80;
  }
  dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
  const dustMat = new THREE.PointsMaterial({
    color: 0xb98cff, size: 0.9, transparent: true, opacity: 0.35,
    blending: THREE.AdditiveBlending, depthWrite: false
  });
  const dust = new THREE.Points(dustGeo, dustMat);
  scene.add(dust);

  // ---------- Fireflies (glowing points that drift with organic motion) ----------
  const FIREFLY_COUNT = 26;
  const fireflyGroup = new THREE.Group();
  const fireflies = [];
  const fireflyTexture = makeGlowTexture('#ffe58a');
  for (let i = 0; i < FIREFLY_COUNT; i++) {
    const mat = new THREE.SpriteMaterial({
      map: fireflyTexture, color: 0xffe58a, transparent: true,
      opacity: 0.9, blending: THREE.AdditiveBlending, depthWrite: false
    });
    const sprite = new THREE.Sprite(mat);
    const scale = 1.2 + Math.random() * 1.6;
    sprite.scale.set(scale, scale, 1);
    sprite.position.set(
      (Math.random()-0.5) * 70,
      (Math.random()-0.5) * 40,
      (Math.random()-0.5) * 40 + 10
    );
    fireflyGroup.add(sprite);
    fireflies.push({
      sprite,
      base: sprite.position.clone(),
      speed: 0.3 + Math.random()*0.5,
      offset: Math.random()*Math.PI*2,
      radius: 4 + Math.random()*8,
      blinkSpeed: 1 + Math.random()*2
    });
  }
  scene.add(fireflyGroup);

  // ---------- Floating 3D hearts (click-reactive) ----------
  const heartShape = makeHeartShape();
  const heartGeo = new THREE.ExtrudeGeometry(heartShape, { depth: 0.6, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.3, bevelSegments: 3 });
  heartGeo.center();
  heartGeo.scale(0.35, 0.35, 0.35);

  const HEART_COUNT = 14;
  const heartMeshes = [];
  const heartGroup = new THREE.Group();
  for (let i = 0; i < HEART_COUNT; i++) {
    const hue = 0.9 + Math.random()*0.15;
    const color = new THREE.Color().setHSL(Math.random() > 0.5 ? 0.92 : 0.78, 0.75, 0.68);
    const mat = new THREE.MeshStandardMaterial({
      color, emissive: color, emissiveIntensity: 0.5,
      roughness: 0.35, metalness: 0.2, transparent: true, opacity: 0.85
    });
    const mesh = new THREE.Mesh(heartGeo, mat);
    mesh.position.set((Math.random()-0.5)*50, (Math.random()-0.5)*35, (Math.random()-0.5)*30 + 5);
    mesh.rotation.z = Math.PI;
    mesh.rotation.y = Math.random()*Math.PI;
    heartGroup.add(mesh);
    heartMeshes.push({
      mesh, base: mesh.position.clone(),
      speed: 0.2 + Math.random()*0.3, offset: Math.random()*Math.PI*2,
      rotSpeed: (Math.random()-0.5)*0.01,
      punch: 0
    });
  }
  scene.add(heartGroup);

  // lights for the hearts
  const ambient = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambient);
  const point1 = new THREE.PointLight(0xff5fa2, 1.2, 100);
  point1.position.set(20, 20, 30);
  scene.add(point1);
  const point2 = new THREE.PointLight(0x8b3ff0, 1.0, 100);
  point2.position.set(-20, -10, 20);
  scene.add(point2);

  function makeHeartShape() {
    const shape = new THREE.Shape();
    const x = 0, y = 0;
    shape.moveTo(x, y);
    shape.bezierCurveTo(x, y - 3, x - 6, y - 3, x - 6, y + 1);
    shape.bezierCurveTo(x - 6, y + 4, x - 3, y + 6, x, y + 9);
    shape.bezierCurveTo(x + 3, y + 6, x + 6, y + 4, x + 6, y + 1);
    shape.bezierCurveTo(x + 6, y - 3, x, y - 3, x, y);
    return shape;
  }

  function makeGlowTexture(hexColor) {
    const size = 128;
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = size;
    const ctx = cvs.getContext('2d');
    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.2, hexColor);
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(cvs);
    return tex;
  }

  // ---------- Raycasting for heart clicks ----------
  const raycaster = new THREE.Raycaster();
  const mouseNDC = new THREE.Vector2();
  function onPointerDown(clientX, clientY) {
    mouseNDC.x = (clientX / window.innerWidth) * 2 - 1;
    mouseNDC.y = -(clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouseNDC, camera);
    const meshes = heartMeshes.map(h => h.mesh);
    const hits = raycaster.intersectObjects(meshes);
    if (hits.length) {
      const hit = heartMeshes.find(h => h.mesh === hits[0].object);
      if (hit) {
        hit.punch = 1.0;
        spawnRipple(clientX, clientY);
      }
    }
  }
  window.addEventListener('pointerdown', (e) => onPointerDown(e.clientX, e.clientY));

  function spawnRipple(x, y) {
    const layer = document.getElementById('ripple-layer');
    if (!layer) return;
    const el = document.createElement('div');
    el.className = 'ripple';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    layer.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }
  window.addEventListener('click', (e) => spawnRipple(e.clientX, e.clientY));

  // ---------- Mouse parallax ----------
  let targetX = 0, targetY = 0;
  window.addEventListener('mousemove', (e) => {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // ---------- Scroll-based camera drift ----------
  let scrollProgress = 0;
  function updateScroll() {
    const doc = document.documentElement;
    const max = doc.scrollHeight - window.innerHeight;
    scrollProgress = max > 0 ? window.scrollY / max : 0;
  }
  window.addEventListener('scroll', updateScroll, { passive: true });

  // ---------- Resize ----------
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ---------- Animate loop ----------
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    stars.rotation.y = t * 0.006;
    dust.rotation.y = t * 0.012;
    dust.rotation.x = Math.sin(t*0.05)*0.05;

    fireflies.forEach(f => {
      const { base, speed, offset, radius, blinkSpeed, sprite } = f;
      sprite.position.x = base.x + Math.sin(t*speed + offset) * radius;
      sprite.position.y = base.y + Math.cos(t*speed*0.8 + offset) * radius * 0.6;
      sprite.position.z = base.z + Math.sin(t*speed*0.5 + offset*2) * radius * 0.4;
      const blink = 0.5 + 0.5 * Math.sin(t * blinkSpeed + offset*3);
      sprite.material.opacity = 0.35 + blink * 0.65;
      const s = (1.2 + Math.random()*0) * (0.8 + blink*0.5);
    });

    heartMeshes.forEach(h => {
      const { base, speed, offset, mesh, rotSpeed } = h;
      mesh.position.x = base.x + Math.sin(t*speed + offset) * 3;
      mesh.position.y = base.y + Math.cos(t*speed*0.7 + offset) * 2.4 + Math.sin(t*0.3)*1.5;
      mesh.rotation.y += rotSpeed;
      let scale = 1;
      if (h.punch > 0) {
        scale = 1 + Math.sin(h.punch * Math.PI) * 0.6;
        h.punch -= 0.04;
        if (h.punch < 0) h.punch = 0;
      }
      mesh.scale.set(scale, scale, scale);
    });

    // camera parallax + scroll drift
    camera.position.x += (targetX * 6 - camera.position.x) * 0.03;
    camera.position.y += (-targetY * 4 - camera.position.y) * 0.03;
    camera.position.z = 60 + scrollProgress * 40;
    camera.lookAt(0, 0, -20);

    point1.position.x = Math.sin(t*0.3) * 30;
    point2.position.x = Math.cos(t*0.25) * -30;

    renderer.render(scene, camera);
  }
  animate();

  return { scene, camera, renderer };
})();


/* ============================================================
   PROPOSAL SCENE — firefly trail forming a heart shape
   ============================================================ */

const HeartTrailScene = (() => {
  let renderer, scene, camera, points, particles = [];
  let running = false;
  let animFrame = null;

  function init(canvas) {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    camera.position.z = 40;

    const count = 120;
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const targets = [];

    for (let i = 0; i < count; i++) {
      // random starting position (scattered, like fireflies wandering)
      positions[i*3]   = (Math.random()-0.5) * 60;
      positions[i*3+1] = (Math.random()-0.5) * 40;
      positions[i*3+2] = (Math.random()-0.5) * 30;

      // heart-shape target using parametric equation
      const tt = (i / count) * Math.PI * 2;
      const hx = 16 * Math.pow(Math.sin(tt), 3);
      const hy = 13 * Math.cos(tt) - 5 * Math.cos(2*tt) - 2 * Math.cos(3*tt) - Math.cos(4*tt);
      targets.push(new THREE.Vector3(hx * 0.9, hy * 0.9, (Math.random()-0.5) * 4));
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const tex = makeGlow();
    const mat = new THREE.PointsMaterial({
      size: 2.6, map: tex, color: 0xffe58a, transparent: true,
      opacity: 0.95, blending: THREE.AdditiveBlending, depthWrite: false
    });
    points = new THREE.Points(geo, mat);
    scene.add(points);

    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        current: new THREE.Vector3(positions[i*3], positions[i*3+1], positions[i*3+2]),
        target: targets[i],
        speed: 0.02 + Math.random()*0.02,
        wobbleOffset: Math.random()*Math.PI*2
      });
    }

    const light = new THREE.PointLight(0xffe58a, 1.5, 100);
    light.position.set(0,0,30);
    scene.add(light);
  }

  function makeGlow() {
    const size = 128;
    const cvs = document.createElement('canvas');
    cvs.width = cvs.height = size;
    const ctx = cvs.getContext('2d');
    const grad = ctx.createRadialGradient(size/2, size/2, 0, size/2, size/2, size/2);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.25, '#ffe58a');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0,0,size,size);
    return new THREE.CanvasTexture(cvs);
  }

  function start(canvas) {
    if (!renderer) init(canvas);
    running = true;
    const clock = new THREE.Clock();
    const posAttr = points.geometry.attributes.position;

    function loop() {
      if (!running) return;
      animFrame = requestAnimationFrame(loop);
      const t = clock.getElapsedTime();

      particles.forEach((p, i) => {
        p.current.lerp(p.target, p.speed);
        const wob = Math.sin(t*1.5 + p.wobbleOffset) * 0.3;
        posAttr.setXYZ(i, p.current.x + wob, p.current.y + Math.cos(t + p.wobbleOffset)*0.3, p.current.z);
      });
      posAttr.needsUpdate = true;

      points.rotation.y = Math.sin(t*0.2) * 0.15;
      scene.children.forEach(c => {
        if (c.isPointLight) {
          c.intensity = 1.2 + Math.sin(t*2)*0.4;
        }
      });

      renderer.render(scene, camera);
    }
    loop();
  }

  function stop() {
    running = false;
    if (animFrame) cancelAnimationFrame(animFrame);
  }

  function resize(canvas) {
    if (!renderer) return;
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  }

  return { start, stop, resize };
})();
