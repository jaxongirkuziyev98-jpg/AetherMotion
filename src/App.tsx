import React, { useEffect, useRef, useState, useCallback } from 'react';
import { HandTrackingManager, CameraDeviceInfo } from './services/handTracking';
import { DualHandMetrics, SceneEnvironment, SpatialObjectType } from './types/tracking';
import { SpatialScene } from './components/SpatialScene';
import { CameraStreamCard } from './components/CameraStreamCard';
import { TelemetryPanel } from './components/TelemetryPanel';
import { ControlDock } from './components/ControlDock';
import { GestureGuideModal } from './components/GestureGuideModal';
import { CameraPermissionModal } from './components/CameraPermissionModal';
import { spatialAudio } from './utils/audio';

const initialMetrics: DualHandMetrics = {
  isDetected: false,
  handCount: 0,
  leftHand: null,
  rightHand: null,
  handDistance: 2.0,
  isFused: false,
  isHeartGesture: false,
  fps: 60,
  latencyMs: 12,
};

export default function App() {
  const [metrics, setMetrics] = useState<DualHandMetrics>(initialMetrics);
  const [selectedObject, setSelectedObject] = useState<SpatialObjectType>('dual-hands');
  const [environment, setEnvironment] = useState<SceneEnvironment>('cyber-space');
  const [isVRMode, setIsVRMode] = useState<boolean>(false);
  const [sensitivity, setSensitivity] = useState<number>(1.2);
  const [smoothing, setSmoothing] = useState<number>(0.35);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isHelpOpen, setIsHelpOpen] = useState<boolean>(false);

  // Camera & permissions state
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [isSimulation, setIsSimulation] = useState<boolean>(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [availableCameras, setAvailableCameras] = useState<CameraDeviceInfo[]>([]);
  const [selectedCameraId, setSelectedCameraId] = useState<string>('');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const trackingManagerRef = useRef<HandTrackingManager | null>(null);

  // Initialize tracking manager
  useEffect(() => {
    const manager = new HandTrackingManager();
    trackingManagerRef.current = manager;

    manager.setOnMetricsUpdate((newMetrics) => {
      setMetrics(newMetrics);
    });

    manager.setOnError((err) => {
      setErrorMessage(err);
      setIsCameraActive(false);
    });

    manager.getAvailableCameras().then((cams) => {
      setAvailableCameras(cams);
      if (cams.length > 0) {
        setSelectedCameraId(cams[0].deviceId);
      }
    });

    return () => {
      manager.destroy();
    };
  }, []);

  // Update smoothing in manager
  useEffect(() => {
    if (trackingManagerRef.current) {
      trackingManagerRef.current.setSmoothing(smoothing);
    }
  }, [smoothing]);

  // Audio Mute toggle
  const handleToggleMute = useCallback(() => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    spatialAudio.setMuted(nextMute);
  }, [isMuted]);

  // Activate Camera with user gesture
  const handleActivateCamera = async (deviceId?: string) => {
    const manager = trackingManagerRef.current;
    if (!manager || !videoRef.current || !canvasRef.current) return;

    setErrorMessage(null);
    const result = await manager.startCamera(videoRef.current, canvasRef.current, deviceId || selectedCameraId);

    if (result.success) {
      setIsCameraActive(true);
      setIsSimulation(false);
      setIsPermissionModalOpen(false);
      const cams = await manager.getAvailableCameras();
      setAvailableCameras(cams);
    } else {
      setIsCameraActive(false);
      setErrorMessage(result.error || 'Kameraga ulanib bo‘lmadi.');
      setIsPermissionModalOpen(true);
    }
  };

  // Toggle Camera
  const handleToggleCamera = () => {
    if (isCameraActive) {
      trackingManagerRef.current?.stopCamera();
      setIsCameraActive(false);
    } else {
      handleActivateCamera();
    }
  };

  // Toggle Simulation
  const handleToggleSimulation = () => {
    const manager = trackingManagerRef.current;
    if (!manager) return;

    if (isSimulation) {
      manager.stopSimulation();
      setIsSimulation(false);
      handleActivateCamera();
    } else {
      manager.startSimulation();
      setIsSimulation(true);
      setIsCameraActive(false);
      setErrorMessage(null);
      setIsPermissionModalOpen(false);
    }
  };

  const handleSelectCamera = (devId: string) => {
    setSelectedCameraId(devId);
    handleActivateCamera(devId);
  };

  return (
    <div className="relative w-screen h-screen bg-slate-950 overflow-hidden font-sans">
      {/* 3D VR Spatial Viewport */}
      <div className="absolute inset-0 w-full h-full">
        <SpatialScene
          metrics={metrics}
          selectedObject={selectedObject}
          environment={environment}
          isVRMode={isVRMode}
          sensitivity={sensitivity}
        />
      </div>

      {/* Top Center Minimal Spec Badge */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/85 border border-cyan-500/30 backdrop-blur-md shadow-lg shadow-cyan-950/40 text-xs font-cyber text-slate-200">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              metrics.isFused
                ? 'bg-cyan-400 shadow-[0_0_12px_#38bdf8]'
                : metrics.handDistance > 0.65
                ? 'bg-purple-400 shadow-[0_0_12px_#c084fc]'
                : metrics.handCount === 2
                ? 'bg-emerald-400 shadow-[0_0_8px_#10b981]'
                : isCameraActive
                ? 'bg-cyan-400 animate-pulse'
                : 'bg-amber-400'
            }`}
          />
          <span className="font-bold tracking-wider text-cyan-300">AETHERMOTION VR</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-300 font-mono text-[11px]">
            {(() => {
              const activeHand = metrics.rightHand || metrics.leftHand;
              if (metrics.handCount === 2) {
                if (metrics.handDistance < 0.32) return '⚡ QO‘LLAR BIRLASHDI: ZARRACHALAR ZICHLASHGAN';
                if (metrics.handDistance > 0.65) return '🌌 QO‘LLAR KENGAYTIRILDI: ZARRACHALAR YOYILMOQDA';
                return `🙌 IKKITA QO‘L BILAN BOSHQARILMOQDA (${metrics.handDistance.toFixed(2)}M)`;
              }
              if (activeHand && activeHand.isDetected) {
                const avgBend = activeHand.fingerBends.reduce((a, b) => a + b, 0) / 5;
                if (avgBend > 0.55 || activeHand.isPinching) {
                  return '✊ QO‘L BUKLANDI: ZARRACHALAR ZICHLASHTIRILDI';
                }
                if (avgBend < 0.28) {
                  return '🖐️ QO‘L KENG YOYILDI: ZARRACHALAR YOYILMOQDA';
                }
                return `☝️ 1 TA QO‘L BILAN BOSHQARILMOQDA (${activeHand.handedness === 'Left' ? 'CHAP' : 'O‘NG'})`;
              }
              if (isCameraActive) return 'KAMERAGA QO‘LINGIZNI KO‘RSATING';
              return 'KAMERA SOZLANMOQDA';
            })()}
          </span>
        </div>
      </div>

      {/* Top Left: Live Camera Stream with Dual-Hand Skeleton */}
      <CameraStreamCard
        metrics={metrics}
        videoRef={videoRef}
        canvasRef={canvasRef}
        isCameraActive={isCameraActive}
        isSimulation={isSimulation}
        errorMessage={errorMessage}
        availableCameras={availableCameras}
        selectedCameraId={selectedCameraId}
        onSelectCamera={handleSelectCamera}
        onToggleCamera={handleToggleCamera}
        onToggleSimulation={handleToggleSimulation}
        onClearError={() => setErrorMessage(null)}
      />

      {/* Top Right: Sensor Telemetry Panel */}
      <TelemetryPanel metrics={metrics} />

      {/* Unified Bottom Control Dock */}
      <ControlDock
        selectedObject={selectedObject}
        onSelectObject={setSelectedObject}
        environment={environment}
        onSelectEnvironment={setEnvironment}
        isVRMode={isVRMode}
        onToggleVRMode={() => setIsVRMode(!isVRMode)}
        sensitivity={sensitivity}
        onChangeSensitivity={setSensitivity}
        smoothing={smoothing}
        onChangeSmoothing={setSmoothing}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Gesture Guide Modal */}
      <GestureGuideModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      {/* Camera Activation / Permission Modal */}
      <CameraPermissionModal
        isOpen={isPermissionModalOpen && !isCameraActive}
        errorMessage={errorMessage}
        onActivateCamera={() => handleActivateCamera()}
        onUseSimulation={() => {
          setIsPermissionModalOpen(false);
          handleToggleSimulation();
        }}
      />
    </div>
  );
}
