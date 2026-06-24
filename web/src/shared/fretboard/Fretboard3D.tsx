import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { makeFretboard, positionKey } from '../music/fretboard';
import { noteName } from '../music/theory';
import type { FretPosition, PitchClass } from '../music/types';
import type { FretboardStringOrder } from '../storage/types';

interface Fretboard3DProps {
  fretCount: number;
  selectedKeys: string[];
  targetPitchClasses: PitchClass[];
  targetDegrees: string[];
  targetNoteLabels: string[];
  revealed: boolean;
  showNoteNames: boolean;
  showDegrees: boolean;
  stringOrder: FretboardStringOrder;
  isPositionEnabled?(position: FretPosition): boolean;
  onToggle(position: FretPosition): void;
}

const BOARD_LENGTH = 12.8;
const BOARD_WIDTH = 2.35;
const NUT_Z = -BOARD_LENGTH / 2;
const BODY_Z = BOARD_LENGTH / 2;
export const PLAYER_CAMERA_X = -0.95;

function makeTextSprite(text: string, background: string, color: string, scale: { width: number; height: number } = { width: 0.78, height: 0.29 }) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const context = canvas.getContext('2d');

  if (!context) {
    return undefined;
  }

  context.fillStyle = background;
  context.strokeStyle = 'rgba(255, 255, 255, 0.75)';
  context.lineWidth = 5;
  context.beginPath();
  context.roundRect(8, 14, 240, 68, 28);
  context.fill();
  context.stroke();
  context.fillStyle = color;
  context.font = '700 34px system-ui, sans-serif';
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText(text, 128, 49);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(material);
  sprite.scale.set(scale.width, scale.height, 1);

  return sprite;
}

function disposeObject(object: THREE.Object3D) {
  object.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }

    const material = mesh.material;
    const materials = Array.isArray(material) ? material : material ? [material] : [];
    materials.forEach((item) => {
      const spriteMaterial = item as THREE.SpriteMaterial;
      spriteMaterial.map?.dispose();
      item.dispose();
    });
  });
}

export function stringXPositions(stringOrder: FretboardStringOrder) {
  const orderedStringIndexes = stringOrder === 'first-string-top' ? [0, 1, 2, 3, 4, 5] : [5, 4, 3, 2, 1, 0];
  const gap = BOARD_WIDTH / 5;
  return new Map(orderedStringIndexes.map((stringIndex, index) => [stringIndex, -BOARD_WIDTH / 2 + index * gap]));
}

function fretCenterZ(fret: number, fretCount: number) {
  const spacing = BOARD_LENGTH / fretCount;
  if (fret === 0) {
    return NUT_Z - spacing * 0.55;
  }

  return NUT_Z + (fret - 0.5) * spacing;
}

function labelForPosition(
  position: FretPosition,
  targetPitchClasses: PitchClass[],
  targetDegrees: string[],
  targetNoteLabels: string[],
  showNoteNames: boolean,
  showDegrees: boolean,
) {
  const targetIndex = targetPitchClasses.indexOf(position.pitchClass);
  const labels: string[] = [];

  if (showNoteNames) {
    labels.push(targetIndex >= 0 ? targetNoteLabels[targetIndex] : noteName(position.pitchClass));
  }

  if (showDegrees && targetIndex >= 0) {
    labels.push(targetDegrees[targetIndex]);
  }

  return labels.join(' ');
}

export function Fretboard3D({
  fretCount,
  selectedKeys,
  targetPitchClasses,
  targetDegrees,
  targetNoteLabels,
  revealed,
  showNoteNames,
  showDegrees,
  stringOrder,
  isPositionEnabled = () => true,
  onToggle,
}: Fretboard3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | undefined>(undefined);
  const cameraRef = useRef<THREE.PerspectiveCamera | undefined>(undefined);
  const rendererRef = useRef<THREE.WebGLRenderer | undefined>(undefined);
  const controlsRef = useRef<OrbitControls | undefined>(undefined);
  const contentRef = useRef<THREE.Group | undefined>(undefined);
  const markerRefs = useRef<THREE.Object3D[]>([]);
  const markerPositions = useRef(new Map<string, FretPosition>());

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) {
      return undefined;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101513);
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(PLAYER_CAMERA_X, 1.65, BODY_Z + 1.35);
    camera.lookAt(0, 0.06, NUT_Z + 1.45);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.target.set(0, 0.04, -2.05);
    controls.minDistance = 3.2;
    controls.maxDistance = 18;
    controls.maxPolarAngle = Math.PI * 0.47;
    controls.minPolarAngle = Math.PI * 0.12;

    const ambient = new THREE.HemisphereLight(0xffffff, 0x28342e, 2.2);
    const key = new THREE.DirectionalLight(0xffffff, 2.4);
    key.position.set(2.5, 5.5, 5.5);
    key.castShadow = true;
    const rim = new THREE.DirectionalLight(0x8fd6c4, 0.85);
    rim.position.set(-3, 2.2, -6);
    const content = new THREE.Group();
    scene.add(ambient, key, rim, content);

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;
    contentRef.current = content;

    const resize = () => {
      const width = Math.max(320, mount.clientWidth);
      const height = Math.max(360, mount.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(mount);
    resize();

    let frame = 0;
    const animate = () => {
      controls.update();
      renderer.render(scene, camera);
      frame = window.requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
      controls.dispose();
      disposeObject(content);
      renderer.dispose();
      renderer.domElement.remove();
      sceneRef.current = undefined;
      cameraRef.current = undefined;
      rendererRef.current = undefined;
      controlsRef.current = undefined;
      contentRef.current = undefined;
    };
  }, []);

  useEffect(() => {
    const content = contentRef.current;
    if (!content) {
      return;
    }

    disposeObject(content);
    content.clear();
    markerRefs.current = [];
    markerPositions.current.clear();

    const selected = new Set(selectedKeys);
    const xByString = stringXPositions(stringOrder);
    const boardMaterial = new THREE.MeshStandardMaterial({ color: 0x31231c, roughness: 0.76, metalness: 0.06 });
    const board = new THREE.Mesh(new THREE.BoxGeometry(BOARD_WIDTH + 0.5, 0.16, BOARD_LENGTH + 0.75), boardMaterial);
    board.position.set(0, -0.04, 0);
    board.receiveShadow = true;
    content.add(board);

    const sideMaterial = new THREE.MeshStandardMaterial({ color: 0x151413, roughness: 0.65 });
    const side = new THREE.Mesh(new THREE.BoxGeometry(BOARD_WIDTH + 0.72, 0.32, BOARD_LENGTH + 0.9), sideMaterial);
    side.position.set(0, -0.24, 0.03);
    content.add(side);

    const headstockMaterial = new THREE.MeshStandardMaterial({ color: 0x241914, roughness: 0.72, metalness: 0.04 });
    const headstock = new THREE.Mesh(new THREE.BoxGeometry(BOARD_WIDTH + 0.98, 0.2, 1.16), headstockMaterial);
    headstock.position.set(0, -0.02, NUT_Z - 0.78);
    headstock.castShadow = true;
    headstock.receiveShadow = true;
    content.add(headstock);

    const headstockEnd = new THREE.Mesh(new THREE.BoxGeometry(BOARD_WIDTH + 1.18, 0.22, 0.18), headstockMaterial);
    headstockEnd.position.set(0, -0.01, NUT_Z - 1.42);
    headstockEnd.castShadow = true;
    content.add(headstockEnd);

    const fretMaterial = new THREE.MeshStandardMaterial({ color: 0xd8cfba, metalness: 0.85, roughness: 0.24 });
    const nut = new THREE.Mesh(new THREE.BoxGeometry(BOARD_WIDTH + 0.34, 0.17, 0.08), fretMaterial);
    nut.position.set(0, 0.16, NUT_Z);
    nut.castShadow = true;
    content.add(nut);

    const pegMaterial = new THREE.MeshStandardMaterial({ color: 0xb9b0a0, metalness: 0.78, roughness: 0.26 });
    [-1, 1].forEach((sideSign) => {
      [0, 1, 2].forEach((pegIndex) => {
        const peg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.42, 20), pegMaterial);
        peg.rotation.z = Math.PI / 2;
        peg.position.set(sideSign * (BOARD_WIDTH / 2 + 0.52), 0.11, NUT_Z - 1.17 + pegIndex * 0.25);
        peg.castShadow = true;
        content.add(peg);

        const button = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.12, 0.16), pegMaterial);
        button.position.set(sideSign * (BOARD_WIDTH / 2 + 0.78), 0.11, peg.position.z);
        button.castShadow = true;
        content.add(button);
      });
    });

    const headLabel = makeTextSprite('琴头', '#e8e0cd', '#241914', { width: 1.16, height: 0.43 });
    if (headLabel) {
      headLabel.position.set(0, 0.72, NUT_Z - 0.98);
      content.add(headLabel);
    }

    const fretSpacing = BOARD_LENGTH / fretCount;
    for (let fret = 0; fret <= fretCount; fret += 1) {
      const fretWire = new THREE.Mesh(new THREE.BoxGeometry(BOARD_WIDTH + 0.18, fret === 0 ? 0.11 : 0.07, 0.045), fretMaterial);
      fretWire.position.set(0, 0.08, NUT_Z + fret * fretSpacing);
      fretWire.castShadow = true;
      content.add(fretWire);
    }

    const markerMaterial = new THREE.MeshStandardMaterial({ color: 0xe8e0cd, roughness: 0.35 });
    [3, 5, 7, 9, 15, 17].filter((fret) => fret <= fretCount).forEach((fret) => {
      const inlay = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.016, 32), markerMaterial);
      inlay.rotation.x = Math.PI / 2;
      inlay.position.set(0, 0.055, fretCenterZ(fret, fretCount));
      content.add(inlay);
    });

    if (fretCount >= 12) {
      [-0.34, 0.34].forEach((x) => {
        const inlay = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.016, 32), markerMaterial);
        inlay.rotation.x = Math.PI / 2;
        inlay.position.set(x, 0.055, fretCenterZ(12, fretCount));
        content.add(inlay);
      });
    }

    for (let stringIndex = 0; stringIndex < 6; stringIndex += 1) {
      const x = xByString.get(stringIndex) ?? 0;
      const radius = 0.012 + (5 - stringIndex) * 0.0042;
      const stringMaterial = new THREE.MeshStandardMaterial({ color: 0xc7b78f, metalness: 0.9, roughness: 0.26 });
      const string = new THREE.Mesh(
        new THREE.CylinderGeometry(radius, radius, BOARD_LENGTH + 1.65, 18),
        stringMaterial,
      );
      string.rotation.x = Math.PI / 2;
      string.position.set(x, 0.17 + (5 - stringIndex) * 0.004, -0.28);
      string.castShadow = true;
      content.add(string);
    }

    const markerGeometry = new THREE.SphereGeometry(0.1, 24, 16);
    makeFretboard(fretCount).forEach((position) => {
      const key = positionKey(position);
      const isSelected = selected.has(key);
      const targetIndex = targetPitchClasses.indexOf(position.pitchClass);
      const isTarget = targetIndex >= 0;
      const isEnabled = isPositionEnabled(position);
      const isWrong = revealed && isSelected && (!isEnabled || !isTarget);
      const color = isWrong ? 0xd95d4f : isSelected ? 0x2dae8e : revealed && isEnabled && isTarget ? 0xf4c95d : 0xe9efe9;
      const opacity = isEnabled ? (isSelected || (revealed && isTarget) ? 1 : 0.42) : 0.12;
      const material = new THREE.MeshStandardMaterial({
        color,
        emissive: isSelected ? 0x0f4f41 : 0x000000,
        transparent: opacity < 1,
        opacity,
        roughness: 0.38,
      });
      const marker = new THREE.Mesh(markerGeometry.clone(), material);
      marker.position.set(xByString.get(position.stringIndex) ?? 0, 0.33, fretCenterZ(position.fret, fretCount));
      marker.userData.positionKey = key;
      marker.userData.enabled = isEnabled;
      marker.castShadow = true;
      markerRefs.current.push(marker);
      markerPositions.current.set(key, position);
      content.add(marker);

      const text = labelForPosition(position, targetPitchClasses, targetDegrees, targetNoteLabels, showNoteNames, showDegrees);
      if (text && (isSelected || (revealed && isEnabled && isTarget))) {
        const label = makeTextSprite(text, isSelected ? '#2dae8e' : '#f4c95d', isSelected ? '#ffffff' : '#332510');
        if (label) {
          label.position.set(marker.position.x, marker.position.y + 0.28, marker.position.z);
          content.add(label);
        }
      }
    });
  }, [
    fretCount,
    selectedKeys,
    targetPitchClasses,
    targetDegrees,
    targetNoteLabels,
    revealed,
    showNoteNames,
    showDegrees,
    stringOrder,
    isPositionEnabled,
  ]);

  useEffect(() => {
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    if (!renderer || !camera) {
      return undefined;
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downPoint: { x: number; y: number } | undefined;

    const setPointer = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    };

    const handlePointerDown = (event: PointerEvent) => {
      downPoint = { x: event.clientX, y: event.clientY };
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!downPoint || Math.hypot(event.clientX - downPoint.x, event.clientY - downPoint.y) > 5) {
        return;
      }

      setPointer(event);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(markerRefs.current, false).find((item) => item.object.userData.enabled);
      const key = hit?.object.userData.positionKey;
      const position = typeof key === 'string' ? markerPositions.current.get(key) : undefined;
      if (position) {
        onToggle(position);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handlePointerDown);
    renderer.domElement.addEventListener('pointerup', handlePointerUp);

    return () => {
      renderer.domElement.removeEventListener('pointerdown', handlePointerDown);
      renderer.domElement.removeEventListener('pointerup', handlePointerUp);
    };
  }, [onToggle]);

  return (
    <div className="fretboard-3d-shell" aria-label="3D 第一人称吉他指板">
      <div className="fretboard-3d-direction top" aria-hidden="true">琴头端</div>
      <div className="fretboard-3d-direction bottom" aria-hidden="true">琴身端</div>
      <div ref={mountRef} className="fretboard-3d-canvas" />
    </div>
  );
}
