import React, { useRef, useEffect, useState } from 'react';
import {
  Play,
  Pause,
  Sun,
  Moon,
  CloudLightning,
  Wind,
  Compass,
  Sliders,
  Sparkles,
  Volume2,
} from 'lucide-react';

interface CinematicVisualStudioProps {
  onReciteDawnVerse: () => void;
}

export const CinematicVisualStudio: React.FC<CinematicVisualStudioProps> = ({
  onReciteDawnVerse,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [timeOfDay, setTimeOfDay] = useState<'night' | 'storm' | 'dawn'>('storm');
  const [stormIntensity, setStormIntensity] = useState<number>(0.7);
  const [steerAngle, setSteerAngle] = useState<number>(0);
  const [lightningFlash, setLightningFlash] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let step = 0;

    const render = () => {
      if (!canvas || !ctx) return;
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // 1. Sky Background Gradient
      let skyGradient = ctx.createLinearGradient(0, 0, 0, height * 0.7);
      if (timeOfDay === 'night') {
        skyGradient.addColorStop(0, '#04060d');
        skyGradient.addColorStop(1, '#091024');
      } else if (timeOfDay === 'storm') {
        skyGradient.addColorStop(0, lightningFlash ? '#3b4252' : '#070b14');
        skyGradient.addColorStop(0.6, '#0f172a');
        skyGradient.addColorStop(1, '#1e293b');
      } else {
        // Dawn: The dark night gives way to gold and crimson!
        skyGradient.addColorStop(0, '#1e1b4b');
        skyGradient.addColorStop(0.4, '#831843');
        skyGradient.addColorStop(0.7, '#d97706');
        skyGradient.addColorStop(1, '#fbbf24');
      }
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height);

      // Stars in night mode
      if (timeOfDay === 'night') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        for (let i = 0; i < 40; i++) {
          const x = (Math.sin(i * 99) * 0.5 + 0.5) * width;
          const y = (Math.cos(i * 33) * 0.5 + 0.5) * (height * 0.5);
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Rising Sun in Dawn mode
      if (timeOfDay === 'dawn') {
        const sunX = width * 0.75;
        const sunY = height * 0.48;
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 100);
        sunGrad.addColorStop(0, 'rgba(254, 240, 138, 0.9)');
        sunGrad.addColorStop(0.3, 'rgba(245, 158, 11, 0.6)');
        sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(sunX, sunY, 100, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Storm Clouds (جمّراں)
      if (timeOfDay === 'storm' || timeOfDay === 'night') {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        for (let i = 0; i < 5; i++) {
          const cloudX = ((step * 0.4 + i * 220) % (width + 300)) - 150;
          const cloudY = 40 + Math.sin(i) * 20;
          ctx.beginPath();
          ctx.arc(cloudX, cloudY, 65, 0, Math.PI * 2);
          ctx.arc(cloudX + 50, cloudY - 20, 80, 0, Math.PI * 2);
          ctx.arc(cloudX + 110, cloudY, 70, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Lightning bolt (گِروک)
      if (lightningFlash && timeOfDay === 'storm') {
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#fef08a';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        let lx = width * 0.45;
        let ly = 30;
        ctx.moveTo(lx, ly);
        for (let j = 0; j < 6; j++) {
          lx += (Math.random() - 0.5) * 35;
          ly += 30;
          ctx.lineTo(lx, ly);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 4. Seafaring Waves (چئول - Chawool)
      const baseWaterY = height * 0.6;
      const waveSpeed = 0.035 * (1 + stormIntensity * 0.5);

      // Back wave layer
      ctx.fillStyle = timeOfDay === 'dawn' ? '#0c4a6e' : '#091e3a';
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 10) {
        const y =
          baseWaterY -
          15 +
          Math.sin(x * 0.012 + step * waveSpeed) * (18 * stormIntensity) +
          Math.cos(x * 0.02 - step * 0.02) * 8;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // 5. The Balochi Wooden Sailboat (بوجی - Boji)
      const shipX = width * 0.45;
      const shipWaveOffset =
        Math.sin(shipX * 0.012 + step * waveSpeed) * (20 * stormIntensity);
      const shipY = baseWaterY + shipWaveOffset + 10;
      const pitchAngle =
        (Math.cos(shipX * 0.012 + step * waveSpeed) * 0.15 * stormIntensity) +
        steerAngle * 0.08;

      ctx.save();
      ctx.translate(shipX, shipY);
      ctx.rotate(pitchAngle);

      // Wooden Hull (Boji)
      ctx.fillStyle = '#78350f'; // Dark cedar teak
      ctx.beginPath();
      ctx.moveTo(-60, 0);
      ctx.quadraticCurveTo(0, 35, 75, 5); // Bow
      ctx.lineTo(65, -10);
      ctx.lineTo(-55, -10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Mast
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(5, -10);
      ctx.lineTo(5, -95);
      ctx.stroke();

      // Lateen Sail
      ctx.fillStyle = timeOfDay === 'dawn' ? '#fef3c7' : '#e2e8f0';
      ctx.beginPath();
      ctx.moveTo(5, -90);
      ctx.lineTo(-45, -25);
      ctx.lineTo(5, -18);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Balochi Crimson Banner at masthead
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(5, -95);
      ctx.lineTo(25, -90);
      ctx.lineTo(5, -85);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      // Fore wave layer
      ctx.fillStyle = timeOfDay === 'dawn' ? '#0369a1' : '#082f49';
      ctx.beginPath();
      ctx.moveTo(0, height);
      for (let x = 0; x <= width; x += 10) {
        const y =
          baseWaterY +
          10 +
          Math.sin(x * 0.018 + step * (waveSpeed * 1.2)) * (22 * stormIntensity) +
          Math.cos(x * 0.035 - step * 0.03) * 10;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(width, height);
      ctx.closePath();
      ctx.fill();

      // White sea foam crests
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      for (let x = 10; x <= width; x += 25) {
        const y =
          baseWaterY +
          10 +
          Math.sin(x * 0.018 + step * (waveSpeed * 1.2)) * (22 * stormIntensity) +
          Math.cos(x * 0.035 - step * 0.03) * 10;
        ctx.arc(x, y, 2.5 * stormIntensity, 0, Math.PI * 2);
      }
      ctx.fill();

      if (isPlaying) {
        step++;
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, timeOfDay, stormIntensity, steerAngle, lightningFlash]);

  const triggerLightning = () => {
    setLightningFlash(true);
    setTimeout(() => setLightningFlash(false), 200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 text-cyan-300 text-xs font-medium mb-2 border border-cyan-500/40">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Visual Storyboard</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-100">
            The Seafaring Allegory (بوجی ءُ مستیں زر)
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Visualizing the brave wooden boat (*Boji*) steering through raging waves (*Chawool*) toward the triumphant dawn.
          </p>
        </div>

        <button
          onClick={onReciteDawnVerse}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shrink-0"
        >
          <Volume2 className="w-4 h-4 fill-slate-950" />
          <span>Recite Dawn Verse (Verse 22)</span>
        </button>
      </div>

      {/* Main Canvas Viewport (16:9 Aspect Ratio) */}
      <div className="relative aspect-video w-full rounded-3xl overflow-hidden border-2 border-slate-800 shadow-2xl bg-black">
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          className="w-full h-full object-cover"
        />

        {/* Poetic Overlay Caption */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs text-amber-300 font-mono">
            {timeOfDay === 'storm'
              ? 'Verse 4: بوجی ءَ گندئے وتی بیتگ گوں توپان ءَ دچار'
              : timeOfDay === 'night'
              ? 'Verse 8: دیر و بیگواہ انت تیاب و شپ سیاہ انت و تهار'
              : 'Verse 22: اے سیاهیں شپ نہ مانیت، نئے سیاهیں روزگار'}
          </span>

          <span className="px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs text-slate-300 font-medium">
            16:9 Cinematic Canvas
          </span>
        </div>

        {/* Bottom Floating Controls */}
        <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-slate-950/80 backdrop-blur-md border border-slate-800/90 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Play/Pause Motion */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              title={isPlaying ? 'Pause simulation' : 'Play simulation'}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>

            {/* Time of Day Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setTimeOfDay('night')}
                className={`px-2 py-1 rounded flex items-center gap-1 ${
                  timeOfDay === 'night' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400'
                }`}
                title="Night (شپ سیاہ)"
              >
                <Moon className="w-3.5 h-3.5" />
                <span>Night</span>
              </button>
              <button
                onClick={() => setTimeOfDay('storm')}
                className={`px-2 py-1 rounded flex items-center gap-1 ${
                  timeOfDay === 'storm' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400'
                }`}
                title="Storm (توپان)"
              >
                <Wind className="w-3.5 h-3.5" />
                <span>Storm</span>
              </button>
              <button
                onClick={() => setTimeOfDay('dawn')}
                className={`px-2 py-1 rounded flex items-center gap-1 ${
                  timeOfDay === 'dawn' ? 'bg-amber-600 text-slate-950 font-bold' : 'text-slate-400'
                }`}
                title="Golden Dawn (روزگار)"
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Dawn</span>
              </button>
            </div>
          </div>

          {/* Storm & Rudder Sliders */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Waves:</span>
              <input
                type="range"
                min={0.2}
                max={1.5}
                step={0.1}
                value={stormIntensity}
                onChange={(e) => setStormIntensity(parseFloat(e.target.value))}
                className="w-16 h-1.5 bg-slate-800 rounded appearance-none accent-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-[11px]">Rudder (مهار):</span>
              <input
                type="range"
                min={-2}
                max={2}
                step={0.2}
                value={steerAngle}
                onChange={(e) => setSteerAngle(parseFloat(e.target.value))}
                className="w-16 h-1.5 bg-slate-800 rounded appearance-none accent-amber-500"
              />
            </div>

            <button
              onClick={triggerLightning}
              className="p-1.5 rounded-lg bg-amber-950 hover:bg-amber-900 border border-amber-600/50 text-amber-300 flex items-center gap-1"
              title="Flash Lightning (گِروک)"
            >
              <CloudLightning className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Giroak</span>
            </button>
          </div>
        </div>
      </div>

      {/* Literary Reflection */}
      <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <p className="font-semibold text-amber-300 mb-1">Allegorical Context:</p>
        <p>
          In coastal Balochi poetry, the boat (*Boji*) symbolizes both the individual soul and society at large navigating through hostile currents. By steering the rudder and taking the reins of fate (*تکدیرءِ مهار*), the voyager masters the elements and ushers in the luminous dawn.
        </p>
      </div>
    </div>
  );
};
