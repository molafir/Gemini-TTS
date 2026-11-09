import React, { useState, useEffect, useRef } from 'react';
import {
  Music,
  Play,
  Pause,
  Volume2,
  Sliders,
  Sparkles,
  RotateCcw,
  Gauge,
  Radio,
} from 'lucide-react';

export const MusicStudio: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [tempoBpm, setTempoBpm] = useState<number>(85);
  const [droneVolume, setDroneVolume] = useState<number>(0.6);
  const [rhythmVolume, setRhythmVolume] = useState<number>(0.4);
  const [currentMode, setCurrentMode] = useState<'epic' | 'soroz' | 'storm'>('epic');

  // Web Audio Context refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const rhythmGainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<any>(null);

  const initAudio = () => {
    if (audioCtxRef.current) return;
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const master = ctx.createGain();
    master.gain.setValueAtTime(0.8, ctx.currentTime);
    master.connect(ctx.destination);
    masterGainRef.current = master;

    const droneGain = ctx.createGain();
    droneGain.gain.setValueAtTime(droneVolume, ctx.currentTime);
    droneGain.connect(master);
    droneGainRef.current = droneGain;

    const rhythmGain = ctx.createGain();
    rhythmGain.gain.setValueAtTime(rhythmVolume, ctx.currentTime);
    rhythmGain.connect(master);
    rhythmGainRef.current = rhythmGain;
  };

  const playDafPulse = () => {
    const ctx = audioCtxRef.current;
    const rGain = rhythmGainRef.current;
    if (!ctx || !rGain) return;

    // Resonant Daf drum tone
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);

    osc.connect(gain);
    gain.connect(rGain);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  };

  const startMusic = () => {
    initAudio();
    const ctx = audioCtxRef.current;
    if (!ctx) return;
    if (ctx.state === 'suspended') ctx.resume();

    // 1. Start Drone chords (Root D ~ 73.4Hz + Fifth A ~ 110Hz + Octave D ~ 146.8Hz)
    const dGain = droneGainRef.current;
    if (dGain) {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const osc3 = ctx.createOscillator();

      osc1.type = currentMode === 'soroz' ? 'sawtooth' : 'triangle';
      osc2.type = 'sine';
      osc3.type = 'triangle';

      const rootFreq = currentMode === 'storm' ? 65.41 : 73.41;
      osc1.frequency.setValueAtTime(rootFreq, ctx.currentTime);
      osc2.frequency.setValueAtTime(rootFreq * 1.5, ctx.currentTime);
      osc3.frequency.setValueAtTime(rootFreq * 2, ctx.currentTime);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(currentMode === 'soroz' ? 600 : 350, ctx.currentTime);

      osc1.connect(filter);
      osc2.connect(filter);
      osc3.connect(filter);
      filter.connect(dGain);

      osc1.start();
      osc2.start();
      osc3.start();
    }

    // 2. Start Rhythm interval (traditional 4/4 or 6/8 Balochi ceremonial chapk pulse)
    const intervalMs = (60 / tempoBpm) * 1000;
    intervalRef.current = setInterval(() => {
      playDafPulse();
    }, intervalMs);

    setIsPlaying(true);
  };

  const stopMusic = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setIsPlaying(false);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {});
    };
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-950/80 text-amber-300 text-xs font-medium mb-2 border border-amber-600/40">
            <Music className="w-3.5 h-3.5" />
            <span>Balochi Instrumental & Soundscape Studio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-100">
            Traditional Musical Accompaniment (ساز ءُ زیم)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time synthesized Balochi Soroz harmonics, rhythmic ceremonial Daf pulses, and ambient accompaniment.
          </p>
        </div>

        <button
          onClick={isPlaying ? stopMusic : startMusic}
          className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all ${
            isPlaying
              ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/50'
              : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-amber-950/50'
          }`}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Stop Music</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>Start Accompaniment</span>
            </>
          )}
        </button>
      </div>

      {/* Preset Modes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          onClick={() => {
            setCurrentMode('epic');
            if (isPlaying) {
              stopMusic();
              setTimeout(startMusic, 150);
            }
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            currentMode === 'epic'
              ? 'bg-amber-950/60 border-amber-500 text-amber-200'
              : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="font-bold text-sm mb-1 text-amber-300">Epic Hymn (حماسی)</div>
          <p className="text-xs text-slate-400">
            Resonant ceremonial drone with steady Daf percussion.
          </p>
        </button>

        <button
          onClick={() => {
            setCurrentMode('soroz');
            if (isPlaying) {
              stopMusic();
              setTimeout(startMusic, 150);
            }
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            currentMode === 'soroz'
              ? 'bg-amber-950/60 border-amber-500 text-amber-200'
              : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="font-bold text-sm mb-1 text-amber-300">Soroz & Benju (سروز)</div>
          <p className="text-xs text-slate-400">
            Rich bowed string harmonics evoking the Makran desert and sea.
          </p>
        </button>

        <button
          onClick={() => {
            setCurrentMode('storm');
            if (isPlaying) {
              stopMusic();
              setTimeout(startMusic, 150);
            }
          }}
          className={`p-4 rounded-2xl border text-left transition-all ${
            currentMode === 'storm'
              ? 'bg-amber-950/60 border-amber-500 text-amber-200'
              : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:border-slate-700'
          }`}
        >
          <div className="font-bold text-sm mb-1 text-amber-300">Stormy Swell (مستیں زر)</div>
          <p className="text-xs text-slate-400">
            Deep oceanic sub-bass with galloping rhythmic strides.
          </p>
        </button>
      </div>

      {/* Control Sliders */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
          <span className="flex items-center gap-1.5">
            <Gauge className="w-4 h-4 text-amber-400" />
            <span>Tempo ({tempoBpm} BPM):</span>
          </span>
          <span className="font-mono text-slate-400">{tempoBpm} BPM</span>
        </div>
        <input
          type="range"
          min={60}
          max={130}
          value={tempoBpm}
          onChange={(e) => setTempoBpm(parseInt(e.target.value, 10))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none accent-amber-500"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Harmonic Drone Volume:
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={droneVolume}
              onChange={(e) => setDroneVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none accent-amber-500"
            />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Daf Percussion Volume:
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={rhythmVolume}
              onChange={(e) => setRhythmVolume(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none accent-amber-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
