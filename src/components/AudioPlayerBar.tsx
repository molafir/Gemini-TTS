import React, { useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Download,
  X,
  Radio,
  Gauge,
  Sparkles,
  Loader2,
  Check,
} from 'lucide-react';
import { downloadAudioFile } from '../services/ttsService';
import { convertWavToMp3Blob, downloadBlob } from '../utils/audioUtils';

interface AudioPlayerBarProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onRestart: () => void;
  onClose: () => void;
  currentTime: number;
  duration: number;
  onSeek: (time: number) => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  volume: number;
  onVolumeChange: (vol: number) => void;
  currentTrackLabel: string;
  voiceName: string;
  audioDataUrl: string | null;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  isPlaying,
  onPlayPause,
  onRestart,
  onClose,
  currentTime,
  duration,
  onSeek,
  playbackRate,
  onPlaybackRateChange,
  volume,
  onVolumeChange,
  currentTrackLabel,
  voiceName,
  audioDataUrl,
}) => {
  const [isDownloadingMp3, setIsDownloadingMp3] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds <= 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleDownloadMp3 = async () => {
    if (!audioDataUrl || isDownloadingMp3) return;
    try {
      setIsDownloadingMp3(true);
      const safeLabel = (currentTrackLabel || 'balochi-recitation')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'balochi-recitation';
      const filename = `${safeLabel}-${voiceName.toLowerCase()}.mp3`;

      const mp3Blob = await convertWavToMp3Blob(audioDataUrl);
      downloadBlob(mp3Blob, filename);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to convert and download MP3:', err);
      // Fallback download directly
      downloadAudioFile(audioDataUrl, `balochi-recitation-${voiceName.toLowerCase()}.mp3`);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } finally {
      setIsDownloadingMp3(false);
    }
  };

  const handleDownloadWav = () => {
    if (audioDataUrl) {
      downloadAudioFile(audioDataUrl, `balochi-recitation-${voiceName.toLowerCase()}.wav`);
    }
  };

  const cycleSpeed = () => {
    const rates = [0.8, 1.0, 1.25];
    const nextIdx = (rates.indexOf(playbackRate) + 1) % rates.length;
    onPlaybackRateChange(rates[nextIdx]);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#0f1422]/95 backdrop-blur-md border-t border-amber-900/40 shadow-2xl px-4 py-3 sm:px-6 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Track info & Voice Persona badge */}
        <div className="flex items-center gap-3 w-full md:w-1/3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 to-amber-900 flex items-center justify-center shrink-0 shadow-md border border-amber-500/30">
            {isPlaying ? (
              <div className="flex items-end gap-0.5 h-4">
                <span className="w-1 bg-amber-200 rounded-full animate-audio-bar" style={{ height: '70%', animationDelay: '0.1s' }} />
                <span className="w-1 bg-amber-300 rounded-full animate-audio-bar" style={{ height: '100%', animationDelay: '0.3s' }} />
                <span className="w-1 bg-amber-200 rounded-full animate-audio-bar" style={{ height: '50%', animationDelay: '0.2s' }} />
              </div>
            ) : (
              <Radio className="w-5 h-5 text-amber-200" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-semibold text-slate-200 truncate">
              {currentTrackLabel || 'O Mardaaren Baloch (Recitation)'}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-medium">
              <Sparkles className="w-3 h-3" />
              <span>Gemini 3.8 Flash TTS ({voiceName})</span>
            </div>
          </div>
        </div>

        {/* Center Controls & Scrubber */}
        <div className="flex flex-col items-center w-full md:w-2/5 gap-1.5">
          <div className="flex items-center gap-4">
            <button
              onClick={onRestart}
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
              title="Replay from start"
              aria-label="Replay from start"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={onPlayPause}
              className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 flex items-center justify-center shadow-md shadow-amber-950/60 transition-transform active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause recitation' : 'Play recitation'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-slate-950" />
              ) : (
                <Play className="w-5 h-5 fill-slate-950 ml-0.5" />
              )}
            </button>

            <button
              onClick={cycleSpeed}
              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 flex items-center gap-1 border border-slate-700 transition-colors"
              title="Toggle Playback Speed"
              aria-label={`Playback speed ${playbackRate}x`}
            >
              <Gauge className="w-3 h-3 text-amber-400" />
              <span>{playbackRate}x</span>
            </button>
          </div>

          {/* Scrubber bar */}
          <div className="w-full flex items-center gap-2 text-[11px] font-mono text-slate-400">
            <span>{formatTime(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime || 0}
              onChange={(e) => onSeek(parseFloat(e.target.value))}
              className="flex-1 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              aria-label="Audio progress seek bar"
            />
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Right Tools (Volume, Download WAV, Close) */}
        <div className="flex items-center justify-end gap-2 w-full md:w-1/3">
          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              onClick={() => onVolumeChange(volume === 0 ? 0.8 : 0)}
              className="text-slate-400 hover:text-slate-200"
              aria-label="Toggle mute"
            >
              {volume === 0 ? (
                <VolumeX className="w-4 h-4 text-slate-500" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              aria-label="Volume slider"
            />
          </div>

          {/* Download Audio (MP3 & WAV) */}
          {audioDataUrl && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleDownloadMp3}
                disabled={isDownloadingMp3}
                className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-amber-950/40 disabled:opacity-75 disabled:cursor-not-allowed"
                title="Save generated recitation as an MP3 file"
                aria-label="Download audio as MP3"
              >
                {isDownloadingMp3 ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-950" />
                    <span>Saving MP3...</span>
                  </>
                ) : downloadSuccess ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-slate-950 stroke-[3]" />
                    <span>Saved MP3!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 text-slate-950" />
                    <span>Download MP3</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadWav}
                className="px-2 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-[11px] font-mono text-slate-400 hover:text-amber-300 transition-colors"
                title="Download uncompressed WAV format"
                aria-label="Download WAV format"
              >
                WAV
              </button>
            </div>
          )}

          {/* Close audio bar */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            title="Stop and Dismiss Player"
            aria-label="Close audio player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
