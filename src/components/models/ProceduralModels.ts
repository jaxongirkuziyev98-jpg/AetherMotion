import * as THREE from 'three';

/**
 * Procedural Grid Floor Texture (Zero 404s)
 */
export function createGridTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#030712';
  ctx.fillRect(0, 0, 512, 512);

  ctx.strokeStyle = 'rgba(6, 182, 212, 0.22)';
  ctx.lineWidth = 1.5;

  const step = 32;
  for (let x = 0; x <= 512; x += step) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y <= 512; y += step) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Creates a circular glowing micro-bead sprite texture
 */
export function createGlowingBeadTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
  grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.3, 'rgba(103, 232, 249, 0.95)');
  grad.addColorStop(0.65, 'rgba(168, 85, 247, 0.55)');
  grad.addColorStop(0.9, 'rgba(6, 182, 212, 0.15)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

/**
 * Quantum Micro-Orb Particle Swarm (ONE Single Unified Sphere)
 * Requirements:
 * 1. ONLY ONE single sphere in the scene ("ikta sharikcha emas bitta bo'lsin").
 * 2. Controllable either with ONE hand OR with TWO hands.
 * 3. Hand curled / brought close together ("bir biriga yaqinlashtirsam") -> particles condense tightly into a dense glowing core ("zichlashib ketadi").
 * 4. Hand open / spread wide ("kotta yoysam") -> particles disperse and expand widely outward ("yoyilib ketadi").
 * 5. Hand rotation (Pitch, Yaw, Roll) rotates the sphere.
 * 6. NO HEART GESTURE ("yurakcha kerak emas, faqat zichlashish va yoyilish").
 */
export class QuantumOrbSwarm {
  public group: THREE.Group;
  private particleCount: number = 3000;
  private particles: THREE.Points;
  private positions: Float32Array;
  private currentPositions: Float32Array;
  private colors: Float32Array;
  private geo: THREE.BufferGeometry;

  // Pre-calculated Fibonacci sphere offsets for the single sphere
  private unifiedOffsets: Float32Array;
  // Pre-calculated radial dispersal scatter vectors (for "yoyilib ketish")
  private disperseOffsets: Float32Array;

  // Smooth state
  private currentCenter = new THREE.Vector3(0, 0, 0);
  private currentRadius: number = 0.35;
  private currentDisperse: number = 0.0;
  private rotMatrix = new THREE.Matrix4();
  private tempVec = new THREE.Vector3();

  constructor() {
    this.group = new THREE.Group();
    const count = this.particleCount;

    this.positions = new Float32Array(count * 3);
    this.currentPositions = new Float32Array(count * 3);
    this.colors = new Float32Array(count * 3);
    this.unifiedOffsets = new Float32Array(count * 3);
    this.disperseOffsets = new Float32Array(count * 3);

    const phi = Math.PI * (3 - Math.sqrt(5)); // Golden angle

    // Single unified sphere distribution (Fibonacci)
    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      const y = 1 - (i / (count - 1)) * 2;
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;

      this.unifiedOffsets[idx] = Math.cos(theta) * radiusAtY;
      this.unifiedOffsets[idx + 1] = y;
      this.unifiedOffsets[idx + 2] = Math.sin(theta) * radiusAtY;

      // Random 3D dispersal direction for outward scattering when spread wide ("yoyilib ketish")
      const u1 = Math.random();
      const u2 = Math.random();
      const sTheta = u1 * Math.PI * 2;
      const sPhi = Math.acos(2 * u2 - 1);
      const scatterDistance = 0.4 + Math.random() * 1.1; // variable scatter depth

      this.disperseOffsets[idx] = Math.sin(sPhi) * Math.cos(sTheta) * scatterDistance;
      this.disperseOffsets[idx + 1] = Math.sin(sPhi) * Math.sin(sTheta) * scatterDistance;
      this.disperseOffsets[idx + 2] = Math.cos(sPhi) * scatterDistance;

      // Harmonic quantum cosmic gradient across the single sphere:
      const normY = (y + 1) / 2; // 0 to 1
      if (normY > 0.65) {
        // Northern hemisphere: Electric Cyan / Sky
        this.colors[idx] = 0.05 + Math.random() * 0.15;
        this.colors[idx + 1] = 0.78 + Math.random() * 0.22;
        this.colors[idx + 2] = 0.98;
      } else if (normY > 0.35) {
        // Equator: Radiant Violet / Magenta
        this.colors[idx] = 0.75 + Math.random() * 0.25;
        this.colors[idx + 1] = 0.22 + Math.random() * 0.25;
        this.colors[idx + 2] = 0.98;
      } else {
        // Southern hemisphere: Emerald / Aquamarine
        this.colors[idx] = 0.06 + Math.random() * 0.15;
        this.colors[idx + 1] = 0.85 + Math.random() * 0.15;
        this.colors[idx + 2] = 0.65 + Math.random() * 0.3;
      }

      // 12% sparkling diamond-white energy sparks
      if (i % 8 === 0) {
        this.colors[idx] = 1.0;
        this.colors[idx + 1] = 1.0;
        this.colors[idx + 2] = 1.0;
      }
    }

    // Initialize positions
    for (let i = 0; i < count * 3; i++) {
      this.currentPositions[i] = this.unifiedOffsets[i] * 0.35;
      this.positions[i] = this.currentPositions[i];
    }

    this.geo = new THREE.BufferGeometry();
    this.geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.geo.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    const beadTex = createGlowingBeadTexture();
    const mat = new THREE.PointsMaterial({
      size: 0.065,
      map: beadTex,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particles = new THREE.Points(this.geo, mat);
    this.group.add(this.particles);
  }

  /**
   * Single Unified Sphere update:
   * - targetPos: 3D point (1-hand position or 2-hand midpoint)
   * - handRot: Pitch, Yaw, Roll to rotate the sphere
   * - expansionRatio: 0.0 (curled / hands close = dense ball) to 1.0 (spread wide = particles disperse)
   */
  public update(
    targetPos: THREE.Vector3,
    handRot: { pitch: number; yaw: number; roll: number },
    expansionRatio: number,
    _unusedHeartGesture: boolean,
    time: number,
    delta: number
  ) {
    const count = this.particleCount;
    const pos = this.positions;
    const cur = this.currentPositions;
    const uni = this.unifiedOffsets;
    const disp = this.disperseOffsets;

    // Smoothly follow hand / dual-hand center position
    this.currentCenter.x = THREE.MathUtils.damp(this.currentCenter.x, targetPos.x, 22, delta);
    this.currentCenter.y = THREE.MathUtils.damp(this.currentCenter.y, targetPos.y, 22, delta);
    this.currentCenter.z = THREE.MathUtils.damp(this.currentCenter.z, targetPos.z, 22, delta);

    // Dynamic radius with wide dynamic range:
    // When hands are close / curled: minRadius = 0.08m (super tight, dense glowing nucleus)
    // When hands spread wide ("kotta yoysam"): maxRadius = 1.75m + radial dispersal
    const minRadius = 0.08;
    const maxRadius = 1.75;
    const clampedRatio = Math.max(0, Math.min(1, expansionRatio));

    const targetRadius = minRadius + (maxRadius - minRadius) * clampedRatio;
    this.currentRadius = THREE.MathUtils.damp(this.currentRadius, targetRadius, 14, delta);

    // Dynamic dispersal factor: when clampedRatio > 0.3, particles scatter outward widely ("yoyilib ketadi")
    const targetDisperse = Math.pow(clampedRatio, 1.4) * 1.5;
    this.currentDisperse = THREE.MathUtils.damp(this.currentDisperse, targetDisperse, 14, delta);

    // Dynamic particle point size: dense when small, luminous aura when dispersed
    const mat = this.particles.material as THREE.PointsMaterial;
    mat.size = 0.05 + clampedRatio * 0.025;

    // Rotation from user's wrist gyro
    const euler = new THREE.Euler(
      THREE.MathUtils.degToRad(handRot.pitch),
      THREE.MathUtils.degToRad(handRot.yaw),
      THREE.MathUtils.degToRad(handRot.roll),
      'XYZ'
    );
    this.rotMatrix.makeRotationFromEuler(euler);

    // Continuous celestial spin
    const sphereSpin = time * 0.75;
    const cosSpin = Math.cos(sphereSpin);
    const sinSpin = Math.sin(sphereSpin);

    const lerpSpeed = Math.min(1.0, delta * 16.0);
    const r = this.currentRadius;
    const dFactor = this.currentDisperse;
    const c = this.currentCenter;
    const _v = this.tempVec;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;

      const ux = uni[idx];
      const uy = uni[idx + 1];
      const uz = uni[idx + 2];

      _v.set(ux * cosSpin - uz * sinSpin, uy, ux * sinSpin + uz * cosSpin);
      _v.applyMatrix4(this.rotMatrix);

      // Outward particle scatter when spreading wide ("yoyilib ketish"):
      const scatterX = disp[idx] * dFactor;
      const scatterY = disp[idx + 1] * dFactor;
      const scatterZ = disp[idx + 2] * dFactor;

      const targetX = c.x + _v.x * r + scatterX;
      const targetY = c.y + _v.y * r + scatterY;
      const targetZ = c.z + _v.z * r + scatterZ;

      cur[idx] += (targetX - cur[idx]) * lerpSpeed;
      cur[idx + 1] += (targetY - cur[idx + 1]) * lerpSpeed;
      cur[idx + 2] += (targetZ - cur[idx + 2]) * lerpSpeed;

      pos[idx] = cur[idx];
      pos[idx + 1] = cur[idx + 1];
      pos[idx + 2] = cur[idx + 2];
    }

    const posAttr = this.geo.getAttribute('position') as THREE.BufferAttribute;
    posAttr.needsUpdate = true;
  }
}

/**
 * Sleek Holographic Luminous Cyber Hand (Left & Right)
 */
export class HolographicCyberHand {
  public group: THREE.Group;
  public isLeftHand: boolean;
  private fingerJoints: THREE.Group[][] = [];
  public laserEmitter: THREE.Mesh | null = null;
  public palmOrb!: THREE.Mesh;

  constructor(isLeftHand: boolean) {
    this.isLeftHand = isLeftHand;
    this.group = new THREE.Group();
    this.group.scale.set(0.48, 0.48, 0.48);
    this.buildHand();
  }

  private buildHand() {
    const primaryHex = this.isLeftHand ? 0x06b6d4 : 0xa855f7;

    const crystalMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      emissive: primaryHex,
      emissiveIntensity: 0.25,
      metalness: 0.9,
      roughness: 0.2,
      clearcoat: 1.0,
      transparent: true,
      opacity: 0.88,
    });

    const luminousMat = new THREE.MeshBasicMaterial({ color: primaryHex });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });

    const wristGeo = new THREE.CylinderGeometry(0.28, 0.35, 0.42, 18);
    const wrist = new THREE.Mesh(wristGeo, crystalMat);
    wrist.position.y = -0.75;
    this.group.add(wrist);

    const ringGeo = new THREE.TorusGeometry(0.36, 0.02, 12, 32);
    const wristRing = new THREE.Mesh(ringGeo, luminousMat);
    wristRing.rotation.x = Math.PI / 2;
    wristRing.position.y = -0.75;
    this.group.add(wristRing);

    const palmShape = new THREE.Shape();
    palmShape.moveTo(-0.38, -0.38);
    palmShape.lineTo(0.38, -0.38);
    palmShape.lineTo(0.42, 0.26);
    palmShape.lineTo(-0.42, 0.26);
    palmShape.closePath();

    const palmGeo = new THREE.ExtrudeGeometry(palmShape, {
      depth: 0.15,
      bevelEnabled: true,
      bevelSegments: 3,
      steps: 1,
      bevelSize: 0.035,
      bevelThickness: 0.035,
    });
    palmGeo.center();
    const palm = new THREE.Mesh(palmGeo, crystalMat);
    palm.position.y = -0.26;
    this.group.add(palm);

    const coreGeo = new THREE.CylinderGeometry(0.13, 0.13, 0.18, 18);
    this.palmOrb = new THREE.Mesh(coreGeo, luminousMat);
    this.palmOrb.rotation.x = Math.PI / 2;
    this.palmOrb.position.set(0, -0.26, 0.03);
    this.group.add(this.palmOrb);

    const m = this.isLeftHand ? -1 : 1;
    const configs = [
      { x: -0.42 * m, y: -0.28, angle: 0.45 * m, scale: 0.7, isIndex: false },
      { x: -0.26 * m, y: 0.13, angle: 0.05 * m, scale: 0.88, isIndex: true },
      { x: -0.08 * m, y: 0.17, angle: 0.0, scale: 0.94, isIndex: false },
      { x: 0.09 * m, y: 0.14, angle: -0.04 * m, scale: 0.88, isIndex: false },
      { x: 0.28 * m, y: 0.07, angle: -0.12 * m, scale: 0.7, isIndex: false },
    ];

    configs.forEach((cfg) => {
      const joints: THREE.Group[] = [];

      const baseJoint = new THREE.Group();
      baseJoint.position.set(cfg.x, cfg.y, 0);
      baseJoint.rotation.z = cfg.angle;
      this.group.add(baseJoint);

      const knuckle = new THREE.Mesh(new THREE.SphereGeometry(0.065 * cfg.scale, 12, 12), chromeMat);
      baseJoint.add(knuckle);

      const p1Len = 0.36 * cfg.scale;
      const phalanx1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05 * cfg.scale, 0.06 * cfg.scale, p1Len, 10),
        crystalMat
      );
      phalanx1.position.y = p1Len / 2;
      baseJoint.add(phalanx1);
      joints.push(baseJoint);

      const midJoint = new THREE.Group();
      midJoint.position.y = p1Len;
      baseJoint.add(midJoint);

      const midKnuckle = new THREE.Mesh(new THREE.SphereGeometry(0.055 * cfg.scale, 10, 10), luminousMat);
      midJoint.add(midKnuckle);

      const p2Len = 0.28 * cfg.scale;
      const phalanx2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04 * cfg.scale, 0.05 * cfg.scale, p2Len, 10),
        crystalMat
      );
      phalanx2.position.y = p2Len / 2;
      midJoint.add(phalanx2);
      joints.push(midJoint);

      const tipJoint = new THREE.Group();
      tipJoint.position.y = p2Len;
      midJoint.add(tipJoint);

      const tipKnuckle = new THREE.Mesh(new THREE.SphereGeometry(0.045 * cfg.scale, 10, 10), luminousMat);
      tipJoint.add(tipKnuckle);

      const p3Len = 0.2 * cfg.scale;
      const phalanx3 = new THREE.Mesh(new THREE.ConeGeometry(0.04 * cfg.scale, p3Len, 10), crystalMat);
      phalanx3.position.y = p3Len / 2;
      tipJoint.add(phalanx3);
      joints.push(tipJoint);

      if (cfg.isIndex) {
        this.laserEmitter = tipKnuckle;
      }

      this.fingerJoints.push(joints);
    });
  }

  public updateFingers(bends: [number, number, number, number, number]) {
    for (let f = 0; f < 5; f++) {
      const bend = bends[f] || 0;
      const joints = this.fingerJoints[f];
      if (!joints) continue;

      const angle = bend * 1.35;
      joints[0].rotation.x = angle * 0.45;
      joints[1].rotation.x = angle * 0.55;
      joints[2].rotation.x = angle * 0.4;
    }
  }
}

/**
 * Quantum Core / Holographic Reactor ("Kvant Yadrosi")
 */
export class QuantumCore {
  public group: THREE.Group;
  private ring1: THREE.Mesh;
  private ring2: THREE.Mesh;
  private ring3: THREE.Mesh;
  private coreSphere: THREE.Mesh;
  private particles: THREE.Points;

  constructor() {
    this.group = new THREE.Group();

    const coreGeo = new THREE.SphereGeometry(0.65, 32, 32);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.9,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      transmission: 0.3,
      transparent: true,
      opacity: 0.88,
    });
    this.coreSphere = new THREE.Mesh(coreGeo, coreMat);
    this.group.add(this.coreSphere);

    const ringMat1 = new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.9, roughness: 0.15 });
    const ringMat2 = new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.9, roughness: 0.15 });
    const ringMat3 = new THREE.MeshStandardMaterial({ color: 0xa855f7, metalness: 0.9, roughness: 0.15 });

    this.ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.15, 0.045, 16, 64), ringMat1);
    this.ring2 = new THREE.Mesh(new THREE.TorusGeometry(1.42, 0.04, 16, 64), ringMat2);
    this.ring3 = new THREE.Mesh(new THREE.TorusGeometry(1.68, 0.035, 16, 64), ringMat3);

    this.group.add(this.ring1);
    this.group.add(this.ring2);
    this.group.add(this.ring3);

    const pGeo = new THREE.BufferGeometry();
    const pCount = 350;
    const positions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      const r = 0.9 + Math.random() * 1.3;
      const theta = Math.random() * Math.PI * 2;
      const phiAngle = Math.acos(Math.random() * 2 - 1);
      positions[i] = r * Math.sin(phiAngle) * Math.cos(theta);
      positions[i + 1] = r * Math.sin(phiAngle) * Math.sin(theta);
      positions[i + 2] = r * Math.cos(phiAngle);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.05,
      transparent: true,
      opacity: 0.8,
    });
    this.particles = new THREE.Points(pGeo, pMat);
    this.group.add(this.particles);
  }

  public update(time: number, speedMultiplier: number = 1) {
    const s = speedMultiplier;
    this.ring1.rotation.x = time * 0.8 * s;
    this.ring1.rotation.y = time * 0.5 * s;
    this.ring2.rotation.y = time * 0.6 * s;
    this.ring2.rotation.z = time * 0.9 * s;
    this.ring3.rotation.x = time * 0.4 * s;
    this.ring3.rotation.z = time * 0.7 * s;

    const pulse = 1 + Math.sin(time * 3 * s) * 0.06;
    this.coreSphere.scale.set(pulse, pulse, pulse);
    this.particles.rotation.y = time * 0.2 * s;
  }
}

/**
 * Interactive Holographic Cyber Globe with Lat/Long Coordinates ("Kiber Globus")
 */
export class CyberGlobe {
  public group: THREE.Group;
  private sphereWire: THREE.Mesh;
  private satellites: THREE.Group;
  private rings: THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();

    const sphereGeo = new THREE.SphereGeometry(1.15, 26, 26);
    const wireMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      wireframe: true,
      transparent: true,
      opacity: 0.55,
    });
    this.sphereWire = new THREE.Mesh(sphereGeo, wireMat);
    this.group.add(this.sphereWire);

    const innerGeo = new THREE.SphereGeometry(1.08, 30, 30);
    const innerMat = new THREE.MeshPhysicalMaterial({
      color: 0x0c4a6e,
      emissive: 0x0369a1,
      emissiveIntensity: 0.5,
      roughness: 0.4,
      metalness: 0.8,
      transparent: true,
      opacity: 0.82,
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    this.group.add(inner);

    const ringGeo = new THREE.RingGeometry(1.35, 1.7, 48);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
    });
    this.rings = new THREE.Mesh(ringGeo, ringMat);
    this.rings.rotation.x = Math.PI / 2.3;
    this.group.add(this.rings);

    this.satellites = new THREE.Group();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const sat = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.12, 0.12),
        new THREE.MeshStandardMaterial({ color: 0x10b981, metalness: 0.9, roughness: 0.2 })
      );
      sat.position.set(Math.cos(angle) * 1.55, Math.sin(angle) * 0.35, Math.sin(angle) * 1.55);
      this.satellites.add(sat);
    }
    this.group.add(this.satellites);
  }

  public update(time: number, speedMultiplier: number = 1) {
    const s = speedMultiplier;
    this.sphereWire.rotation.y = time * 0.35 * s;
    this.satellites.rotation.y = -time * 0.5 * s;
    this.rings.rotation.z = time * 0.15 * s;
  }
}

/**
 * 4D Tesseract Kinetic Hypercube ("Giperkub 4D")
 */
export class Hypercube {
  public group: THREE.Group;
  private outerCube: THREE.Mesh;
  private innerCube: THREE.Mesh;
  private connectors: THREE.LineSegments;

  constructor() {
    this.group = new THREE.Group();

    const outerGeo = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    const outerMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.2,
      roughness: 0.1,
      transmission: 0.8,
      transparent: true,
      opacity: 0.65,
      clearcoat: 1.0,
    });
    this.outerCube = new THREE.Mesh(outerGeo, outerMat);
    this.group.add(this.outerCube);

    const innerGeo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
    const innerMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.9,
      roughness: 0.15,
    });
    this.innerCube = new THREE.Mesh(innerGeo, innerMat);
    this.group.add(this.innerCube);

    const linePositions: number[] = [];
    const corners = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]
    ];
    corners.forEach(([x, y, z]) => {
      linePositions.push(x * 0.7, y * 0.7, z * 0.7);
      linePositions.push(x * 0.35, y * 0.35, z * 0.35);
    });

    const linesGeo = new THREE.BufferGeometry();
    linesGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
    const linesMat = new THREE.LineBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.7,
    });
    this.connectors = new THREE.LineSegments(linesGeo, linesMat);
    this.group.add(this.connectors);
  }

  public update(time: number, speedMultiplier: number = 1) {
    const s = speedMultiplier;
    this.outerCube.rotation.x = time * 0.4 * s;
    this.outerCube.rotation.y = time * 0.5 * s;
    this.innerCube.rotation.x = -time * 0.6 * s;
    this.innerCube.rotation.y = -time * 0.8 * s;
    this.connectors.rotation.x = time * 0.4 * s;
    this.connectors.rotation.y = time * 0.5 * s;
  }
}
