import React, { useState } from 'react';
import { 
  Bot, 
  Atom, 
  Globe, 
  Box, 
  Glasses, 
  Sliders, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  ChevronUp, 
  ChevronDown,
  Sparkles,
  Palette
} from 'lucide-react';
import { SceneEnvironment, SpatialObjectType } from '../types/tracking';

interface ControlDockProps {
  selectedObject: SpatialObjectType;
  onSelectObject: (obj: SpatialObjectType) => void;
  environment: SceneEnvironment;
  onSelectEnvironment: (env: SceneEnvironment) => void;
  isVRMode: boolean;
  onToggleVRMode: () => void;
  sensitivity: number;
  onChangeSensitivity: (val: number) => void;
  smoothing: number;
  onChangeSmoothing: (val: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenHelp: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  selectedObject,
  onSelectObject,
  environment,
  onSelectEnvironment,
  isVRMode,
  onToggleVRMode,
  sensitivity,
  onChangeSensitivity,
  smoothing,
  onChangeSmoothing,
  isMuted,
  onToggleMute,
  onOpenHelp,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'objects' | 'env' | 'settings'>('objects');

  const objects: { id: SpatialObjectType; name: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'dual-hands', name: 'Kvant Zarracha Shari', icon: <Bot size={15} />, desc: 'Yaqinlashtirishda zich, yoyishda fazoga tarqaladi' },
    { id: 'quantum-core', name: 'Kvant Yadrosi', icon: <Atom size={15} />, desc: 'Aylanuvchi reaktor halqalari' },
    { id: 'cyber-globe', name: 'Kiber Globus', icon: <Globe size={15} />, desc: 'Orbital sun‘iy yo‘ldoshlar' },
    { id: 'hypercube', name: 'Giperkub 4D', icon: <Box size={15} />, desc: 'Tesserakt kristall matritsasi' },
  ];

  const envs: { id: SceneEnvironment; name: string; color: string }[] = [
    { id: 'cyber-space', name: 'Kiber Kosmos', color: 'bg-cyan-500' },
    { id: 'matrix-grid', name: 'Neon Matritsa', color: 'bg-emerald-500' },
    { id: 'holo-lab', name: 'Golo-Laboratoriya', color: 'bg-purple-500' },
    { id: 'minimal-studio', name: 'Minimal Studiya', color: 'bg-slate-400' },
  ];

  return (
    <div
      className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 max-w-[min(940px,94vw)] w-full select-none ${
        isCollapsed ? 'translate-y-[calc(100%-38px)]' : 'translate-y-0'
      }`}
    >
      {/* Collapse / Expand Toggle Button centered on top edge */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 px-4 py-1 rounded-t-lg bg-slate-900/90 border-t border-x border-cyan-500/40 text-[11px] font-cyber tracking-wider text-cyan-300 hover:text-white backdrop-blur-md shadow-lg shadow-cyan-950/40 transition-colors"
        >
          {isCollapsed ? (
            <>
              <ChevronUp size={14} className="text-cyan-400" />
              <span>Boshqaruv Panelini Ochish</span>
            </>
          ) : (
            <>
              <ChevronDown size={14} className="text-cyan-400" />
              <span>Kinolik Rejim (Panellarni Yashirish)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Dock */}
      <div className="bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3 backdrop-blur-xl shadow-2xl shadow-cyan-950/60 text-slate-200">
        {/* Top Dock Navigation Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-2.5 border-b border-slate-800 text-xs">
          {/* Section Tabs */}
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('objects')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-cyber transition-all ${
                activeTab === 'objects'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles size={13} />
              <span>3D Obyektlar</span>
            </button>

            <button
              onClick={() => setActiveTab('env')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-cyber transition-all ${
                activeTab === 'env'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Palette size={13} />
              <span>Atrof-muhit</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-cyber transition-all ${
                activeTab === 'settings'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders size={13} />
              <span>Sozlamalar</span>
            </button>
          </div>

          {/* Quick Action Badges */}
          <div className="flex items-center gap-2">
            {/* VR Stereo Mode Toggle */}
            <button
              onClick={onToggleVRMode}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-cyber font-bold tracking-wider transition-all ${
                isVRMode
                  ? 'bg-purple-600/30 text-purple-300 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
                  : 'bg-slate-950/80 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <Glasses size={14} className={isVRMode ? 'text-purple-400' : 'text-slate-400'} />
              <span>{isVRMode ? 'VR REJIM FAOL' : 'VR STEREO'}</span>
            </button>

            {/* Audio Toggle */}
            <button
              onClick={onToggleMute}
              title={isMuted ? 'Ovozni yoqish' : 'Ovozni o‘chirish'}
              className="p-1.5 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
            >
              {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>

            {/* Gesture Guide Help Button */}
            <button
              onClick={onOpenHelp}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-600/30 text-xs font-cyber transition-all"
            >
              <HelpCircle size={14} />
              <span>Qo‘llanma</span>
            </button>
          </div>
        </div>

        {/* Tab 1: 3D Objects Switcher */}
        {activeTab === 'objects' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {objects.map((obj) => {
              const isSelected = selectedObject === obj.id;
              return (
                <button
                  key={obj.id}
                  onClick={() => onSelectObject(obj.id)}
                  className={`flex flex-col text-left p-2.5 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-950/60 to-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={isSelected ? 'text-cyan-400' : 'text-slate-400'}>
                      {obj.icon}
                    </span>
                    <span className={`text-xs font-cyber font-bold ${isSelected ? 'text-cyan-200' : 'text-slate-300'}`}>
                      {obj.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 leading-tight">
                    {obj.desc}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 2: Environment Switcher */}
        {activeTab === 'env' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {envs.map((e) => {
              const isSelected = environment === e.id;
              return (
                <button
                  key={e.id}
                  onClick={() => onSelectEnvironment(e.id)}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-cyber transition-all ${
                    isSelected
                      ? 'bg-cyan-950/50 border-cyan-400 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                      : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className={`w-3 h-3 rounded-full ${e.color}`} />
                  <span className="font-semibold">{e.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Tab 3: Sliders & Sensor Tuning */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Sensitivity */}
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-300 font-cyber">Harakat Sezgirligi (Sensitivity):</span>
                <span className="text-cyan-400 font-bold">{sensitivity.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={sensitivity}
                onChange={(e) => onChangeSensitivity(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>0.5x (Aniq)</span>
                <span>1.0x (Standart)</span>
                <span>2.0x (Tezkor)</span>
              </div>
            </div>

            {/* Smoothing */}
            <div className="bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-slate-300 font-cyber">Silliqlash Filtri (Smoothing):</span>
                <span className="text-emerald-400 font-bold">{Math.round(smoothing * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.8"
                step="0.05"
                value={smoothing}
                onChange={(e) => onChangeSmoothing(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
                <span>10% (Tez javob)</span>
                <span>40% (Optimal)</span>
                <span>80% (O‘ta silliq)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
