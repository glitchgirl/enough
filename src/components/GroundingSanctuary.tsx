import React, { useState, useEffect } from 'react';
import { soundSynth, SoundType } from '../services/soundSynth';
import { PERMISSION_SLIPS } from '../data/presetData';
import { Play, Pause, Volume2, VolumeX, CloudRain, Waves, Wind, Droplets, Sparkles, Check, Copy } from 'lucide-react';

interface GroundingSanctuaryProps {
  isPlayingSound: boolean;
  onToggleSound: () => void;
}

export const GroundingSanctuary: React.FC<GroundingSanctuaryProps> = ({
  isPlayingSound,
  onToggleSound,
}) => {
  const [cadence, setCadence] = useState<'4-7-8' | 'box' | 'coherent'>('4-7-8');
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale' | 'pause'>('inhale');
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState<number>(4);
  const [soundType, setSoundType] = useState<SoundType>('rain');
  const [volume, setVolume] = useState<number>(soundSynth.getVolume());
  const [activeSlipIdx, setActiveSlipIdx] = useState<number>(0);
  const [customSlipText, setCustomSlipText] = useState<string>('');
  const [copiedSlip, setCopiedSlip] = useState<boolean>(false);

  // Breathing rhythm loop
  useEffect(() => {
    let timer: number;

    const timings = {
      '4-7-8': { inhale: 4, hold: 7, exhale: 8, pause: 0 },
      box: { inhale: 4, hold: 4, exhale: 4, pause: 4 },
      coherent: { inhale: 5, hold: 0, exhale: 5, pause: 0 },
    }[cadence];

    timer = window.setInterval(() => {
      setPhaseSecondsLeft((prev) => {
        if (prev <= 1) {
          // Advance phase
          if (cadence === '4-7-8') {
            if (breathPhase === 'inhale') {
              setBreathPhase('hold');
              return timings.hold;
            } else if (breathPhase === 'hold') {
              setBreathPhase('exhale');
              return timings.exhale;
            } else {
              setBreathPhase('inhale');
              return timings.inhale;
            }
          } else if (cadence === 'box') {
            if (breathPhase === 'inhale') {
              setBreathPhase('hold');
              return timings.hold;
            } else if (breathPhase === 'hold') {
              setBreathPhase('exhale');
              return timings.exhale;
            } else if (breathPhase === 'exhale') {
              setBreathPhase('pause');
              return timings.pause;
            } else {
              setBreathPhase('inhale');
              return timings.inhale;
            }
          } else {
            // coherent
            if (breathPhase === 'inhale') {
              setBreathPhase('exhale');
              return timings.exhale;
            } else {
              setBreathPhase('inhale');
              return timings.inhale;
            }
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cadence, breathPhase]);

  const handleSoundChange = (type: SoundType) => {
    setSoundType(type);
    if (isPlayingSound) {
      soundSynth.play(type);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundSynth.setVolume(newVol);
  };

  const getPhaseInstruction = () => {
    switch (breathPhase) {
      case 'inhale':
        return 'Gently inhale through your nose...';
      case 'hold':
        return 'Rest softly in the fullness...';
      case 'exhale':
        return 'Slowly sigh out, releasing your shoulders...';
      case 'pause':
        return 'Empty and safe in the stillness...';
    }
  };

  const activeSlip = PERMISSION_SLIPS[activeSlipIdx];

  const handleCopySlip = () => {
    const textToCopy = customSlipText.trim()
      ? `Permission Slip: "${customSlipText}" — Signed by: A human being.`
      : `Permission Slip: "${activeSlip.title}"\n${activeSlip.text}\n— Signed by: A human being.`;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSlip(true);
    setTimeout(() => setCopiedSlip(false), 2500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="max-w-2xl">
        <h1 className="text-3xl sm:text-4xl font-serif tracking-tight text-stone-900 mb-2">
          Grounding Sanctuary
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          When the mind starts spinning with endless optimization loops, anchor yourself in your senses. Slow down your breathing and listen to natural sounds.
        </p>
      </div>

      {/* Main Breathing Pacer Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200/90 shadow-xs flex flex-col items-center text-center space-y-8">
        
        {/* Cadence Selection */}
        <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-stone-100 rounded-2xl">
          <button
            onClick={() => {
              setCadence('4-7-8');
              setBreathPhase('inhale');
              setPhaseSecondsLeft(4);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              cadence === '4-7-8'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            4-7-8 Nervous System Reset
          </button>
          <button
            onClick={() => {
              setCadence('box');
              setBreathPhase('inhale');
              setPhaseSecondsLeft(4);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              cadence === 'box'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Box Breath (4-4-4-4)
          </button>
          <button
            onClick={() => {
              setCadence('coherent');
              setBreathPhase('inhale');
              setPhaseSecondsLeft(5);
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
              cadence === 'coherent'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Coherent Flow (5-5)
          </button>
        </div>

        {/* Dynamic Visual Breathing Circle */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-4">
          {/* Subtle outer aura */}
          <div
            className={`absolute rounded-full transition-all ease-in-out ${
              breathPhase === 'inhale'
                ? 'w-64 h-64 sm:w-72 sm:h-72 bg-[#E3E8DE]/60 duration-4000 scale-100'
                : breathPhase === 'hold'
                ? 'w-64 h-64 sm:w-72 sm:h-72 bg-[#E3E8DE]/80 duration-1000 scale-100'
                : breathPhase === 'exhale'
                ? 'w-36 h-36 bg-[#E3E8DE]/30 duration-6000 scale-90'
                : 'w-32 h-32 bg-[#E3E8DE]/20 duration-1000 scale-85'
            }`}
          />

          {/* Inner organic orb */}
          <div
            className={`relative rounded-full flex flex-col items-center justify-center transition-all ease-in-out border border-[#CAD4C3] ${
              breathPhase === 'inhale'
                ? 'w-48 h-48 sm:w-56 sm:h-56 bg-[#DFE7DA] text-stone-800 shadow-md duration-4000'
                : breathPhase === 'hold'
                ? 'w-48 h-48 sm:w-56 sm:h-56 bg-[#DFE7DA] text-stone-800 shadow-md duration-1000'
                : breathPhase === 'exhale'
                ? 'w-28 h-28 sm:w-32 sm:h-32 bg-[#E8EFE5] text-stone-700 shadow-xs duration-6000'
                : 'w-24 h-24 sm:w-28 sm:h-28 bg-[#EEF4EC] text-stone-600 shadow-none duration-1000'
            }`}
          >
            <span className="font-serif text-lg sm:text-xl font-medium capitalize tracking-wide">
              {breathPhase}
            </span>
            <span className="font-mono text-2xl font-bold tabular-nums text-stone-700 mt-1">
              {phaseSecondsLeft}s
            </span>
          </div>
        </div>

        {/* Phase Instruction Text */}
        <div className="space-y-1">
          <p className="font-serif text-xl text-stone-800">
            {getPhaseInstruction()}
          </p>
          <p className="text-xs text-stone-500">
            No score to achieve. Let your stomach expand naturally.
          </p>
        </div>
      </div>

      {/* Ambient Soundscapes Console */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl text-stone-900">
              Ambient Sound Generator
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm">
              Synthesized locally via the Web Audio API. Pure sound, zero ads, zero distraction.
            </p>
          </div>

          <button
            onClick={onToggleSound}
            className={`min-h-[44px] px-6 rounded-2xl text-xs font-semibold flex items-center gap-2 transition-all self-start sm:self-auto ${
              isPlayingSound
                ? 'bg-rose-100 text-rose-900 border border-rose-300 hover:bg-rose-200'
                : 'bg-stone-900 text-stone-50 hover:bg-stone-800 shadow-xs'
            }`}
          >
            {isPlayingSound ? (
              <>
                <Pause className="w-4 h-4" />
                <span>Pause Ambient Sound</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Play Soothing Ambient</span>
              </>
            )}
          </button>
        </div>

        {/* Sound Selection Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'rain' as SoundType, label: 'Gentle Rain', desc: 'Soft droplet rhythms', icon: <CloudRain className="w-5 h-5 text-sky-600" /> },
            { id: 'ocean' as SoundType, label: 'Ocean Tide', desc: '8-second rhythmic swell', icon: <Waves className="w-5 h-5 text-teal-600" /> },
            { id: 'wind' as SoundType, label: 'Summer Breeze', desc: 'Whispering airy hum', icon: <Wind className="w-5 h-5 text-amber-600" /> },
            { id: 'stream' as SoundType, label: 'Forest Brook', desc: 'Light bubbling water', icon: <Droplets className="w-5 h-5 text-emerald-600" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleSoundChange(item.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                soundType === item.id
                  ? 'bg-stone-50 border-stone-800 shadow-xs'
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="mb-2">{item.icon}</div>
              <div className="font-serif text-sm font-medium text-stone-900">
                {item.label}
              </div>
              <div className="text-[11px] text-stone-500 mt-0.5">
                {item.desc}
              </div>
            </button>
          ))}
        </div>

        {/* Volume Slider */}
        <div className="pt-2 flex items-center gap-4 max-w-sm">
          <button
            onClick={() => handleVolumeChange(volume > 0 ? 0 : 0.4)}
            className="text-stone-500 hover:text-stone-800"
            title="Toggle mute"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-full accent-stone-800 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
            aria-label="Sound volume"
          />
          <span className="font-mono text-xs text-stone-500 tabular-nums w-8">
            {Math.round(volume * 100)}%
          </span>
        </div>
      </div>

      {/* Permission Slip Generator */}
      <div className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-stone-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-stone-500 font-medium mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Tangible Self-Compassion</span>
            </div>
            <h2 className="font-serif text-2xl text-stone-900">
              Digital Permission Slip
            </h2>
            <p className="text-stone-600 text-xs sm:text-sm">
              Perfectionists often feel they need external authorization to rest or do less. Sign your own slip.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {PERMISSION_SLIPS.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setActiveSlipIdx(idx);
                  setCustomSlipText('');
                }}
                className={`w-7 h-7 rounded-full text-xs font-mono font-medium transition-colors ${
                  activeSlipIdx === idx && !customSlipText
                    ? 'bg-stone-900 text-stone-50'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>

        {/* The Slip Card (Editorial parchment look) */}
        <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border-2 border-dashed border-stone-300 shadow-xs space-y-4 text-center">
          <div className="text-[11px] font-mono uppercase tracking-widest text-stone-400">
            OFFICIAL PERMISSION SLIP · NO EXPIRATION
          </div>

          <h3 className="font-serif text-2xl text-stone-900 font-medium">
            {customSlipText.trim() ? customSlipText : activeSlip.title}
          </h3>

          <p className="text-stone-600 text-xs sm:text-sm leading-relaxed max-w-md mx-auto italic">
            "{customSlipText.trim() ? 'This permission is valid immediately and unconditionally.' : activeSlip.text}"
          </p>

          <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
            <span>Category: {activeSlip.category}</span>
            <span className="font-serif italic text-stone-700">Signed: A Human Being</span>
          </div>
        </div>

        {/* Custom Slip input & Copy */}
        <div className="flex flex-col sm:flex-row items-center gap-3 max-w-xl mx-auto">
          <input
            type="text"
            value={customSlipText}
            onChange={(e) => setCustomSlipText(e.target.value)}
            placeholder="Or write your own: e.g. Permission to leave the party at 9pm"
            className="w-full px-4 py-2.5 rounded-xl border border-stone-200 bg-white text-xs sm:text-sm text-stone-800 placeholder:text-stone-400 focus:outline-hidden focus:ring-2 focus:ring-stone-400"
          />
          <button
            onClick={handleCopySlip}
            className="min-h-[42px] px-5 rounded-xl bg-stone-900 text-stone-50 text-xs font-medium hover:bg-stone-800 transition-colors flex items-center gap-1.5 shrink-0"
          >
            {copiedSlip ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSlip ? 'Copied' : 'Copy Slip'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
