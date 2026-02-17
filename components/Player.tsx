
import React, { useState, useEffect, useRef } from 'react';
import * as Tone from 'tone';
import { Composition, Note, DrumHit } from '../types';
import { Play, Square, Download, Music } from 'lucide-react';

interface Props {
  composition: Composition;
  autoPlay?: boolean;
}

const Player: React.FC<Props> = ({ composition, autoPlay = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [ready, setReady] = useState(false);
  
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Synthesizers
  const leadSynth = useRef<Tone.PolySynth | null>(null);
  const bassSynth = useRef<Tone.PolySynth | null>(null);
  const kickSynth = useRef<Tone.MembraneSynth | null>(null);
  const snareSynth = useRef<Tone.NoiseSynth | null>(null);
  const hihatSynth = useRef<Tone.NoiseSynth | null>(null); // Changed to NoiseSynth for more stable high-hats

  // Master effects
  const limiter = useRef<Tone.Limiter | null>(null);
  const compressor = useRef<Tone.Compressor | null>(null);

  // Parts
  const parts = useRef<Tone.Part[]>([]);

  useEffect(() => {
    const initInstruments = () => {
      // Audio chain: Synths -> Compressor -> Limiter -> Destination
      limiter.current = new Tone.Limiter(-1).toDestination();
      compressor.current = new Tone.Compressor({
        threshold: -20,
        ratio: 4,
        attack: 0.01,
        release: 0.1
      }).connect(limiter.current);

      const reverb = new Tone.Reverb({ decay: 1.5, wet: 0.2 }).connect(compressor.current);
      const delay = new Tone.FeedbackDelay("8n", 0.15).connect(reverb);

      leadSynth.current = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sawtooth' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
      }).connect(delay);
      
      bassSynth.current = new Tone.PolySynth(Tone.MonoSynth, {
        oscillator: { type: 'fatsawtooth', count: 3, spread: 20 },
        envelope: { attack: 0.05, decay: 0.2, sustain: 0.4, release: 0.8 }
      }).connect(compressor.current);

      kickSynth.current = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 6,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
      }).connect(compressor.current);

      snareSynth.current = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.15, sustain: 0 }
      }).connect(compressor.current);

      hihatSynth.current = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.03, sustain: 0 }
      }).connect(compressor.current);

      setReady(true);
    };

    initInstruments();

    return () => {
      stopAndCleanup();
      leadSynth.current?.dispose();
      bassSynth.current?.dispose();
      kickSynth.current?.dispose();
      snareSynth.current?.dispose();
      hihatSynth.current?.dispose();
      limiter.current?.dispose();
      compressor.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (ready && autoPlay) {
      // Small delay to ensure user interaction requirement is met if possible
      const timer = setTimeout(() => handlePlay(), 500);
      return () => clearTimeout(timer);
    }
  }, [composition, ready]);

  const stopAndCleanup = () => {
    Tone.getTransport().stop();
    Tone.getTransport().cancel();
    parts.current.forEach(part => part.dispose());
    parts.current = [];
    setIsPlaying(false);
  };

  const schedulePlayback = () => {
    stopAndCleanup();
    
    // CRITICAL: Set BPM before any Tone.Time calculations
    Tone.getTransport().bpm.value = composition.tempo;

    let currentBarOffset = 0;
    const melodyData: any[] = [];
    const bassData: any[] = [];
    const drumData: any[] = [];

    composition.structure.forEach((section) => {
      const sectionStart = `${currentBarOffset}:0:0`;
      
      section.melody.forEach(n => {
        // Fix: Added conversion to seconds before addition as 'add' is not available on Tone.Time type definitions
        const absTime = Tone.Time(Tone.Time(sectionStart).toSeconds() + Tone.Time(n.time).toSeconds()).toBarsBeatsSixteenths();
        melodyData.push({ time: absTime, note: n.note, duration: n.duration });
      });

      section.bass.forEach(n => {
        // Fix: Added conversion to seconds before addition as 'add' is not available on Tone.Time type definitions
        const absTime = Tone.Time(Tone.Time(sectionStart).toSeconds() + Tone.Time(n.time).toSeconds()).toBarsBeatsSixteenths();
        bassData.push({ time: absTime, note: n.note, duration: n.duration });
      });

      section.drums.forEach(hit => {
        // Fix: Added conversion to seconds before addition as 'add' is not available on Tone.Time type definitions
        const absTime = Tone.Time(Tone.Time(sectionStart).toSeconds() + Tone.Time(hit.time).toSeconds()).toBarsBeatsSixteenths();
        drumData.push({ time: absTime, type: hit.type });
      });

      currentBarOffset += section.bars;
    });

    const melodyPart = new Tone.Part((time, value) => {
      leadSynth.current?.triggerAttackRelease(value.note, value.duration, time);
    }, melodyData).start(0);

    const bassPart = new Tone.Part((time, value) => {
      bassSynth.current?.triggerAttackRelease(value.note, value.duration, time);
    }, bassData).start(0);

    const drumPart = new Tone.Part((time, value) => {
      if (value.type === 'kick') kickSynth.current?.triggerAttackRelease("C1", "8n", time);
      if (value.type === 'snare') snareSynth.current?.triggerAttackRelease("16n", time);
      if (value.type === 'hihat') hihatSynth.current?.triggerAttackRelease("32n", time);
    }, drumData).start(0);

    parts.current = [melodyPart, bassPart, drumPart];

    // Schedule stop slightly after the last bar to allow for release tails
    const totalDuration = Tone.Time(`${currentBarOffset}:0:0`).toSeconds();
    Tone.getTransport().schedule((time) => {
      Tone.Draw.schedule(() => {
        setIsPlaying(false);
        if (isRecording) stopRecording();
      }, time);
    }, totalDuration + 1);
  };

  const handlePlay = async () => {
    if (!ready) return;
    try {
      await Tone.start();
      schedulePlayback();
      // Lookahead of 0.2s for stability
      Tone.getTransport().start("+0.2");
      setIsPlaying(true);
    } catch (e) {
      console.error("Playback error:", e);
    }
  };

  const handleStop = () => {
    stopAndCleanup();
    if (isRecording) stopRecording();
  };

  const startRecording = async () => {
    if (!ready) return;
    try {
      await Tone.start();
      
      const dest = Tone.getDestination().context.createMediaStreamDestination();
      Tone.getDestination().connect(dest);
      
      const recorder = new MediaRecorder(dest.stream);
      recorderRef.current = recorder;
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm; codecs=opus' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `AudioMind-${composition.genre}-${composition.mood}.webm`;
        a.click();
        setIsRecording(false);
      };

      recorder.start();
      setIsRecording(true);
      await handlePlay();
    } catch (e) {
      console.error("Recording error:", e);
    }
  };

  const stopRecording = () => {
    if (recorderRef.current && recorderRef.current.state !== 'inactive') {
      recorderRef.current.stop();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10 shadow-xl backdrop-blur-xl">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Music className="text-blue-400" size={20} />
        </div>
        <div>
          <span className="font-bold text-sm block">Synthesizer Engine</span>
          <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Accurate Timing Enabled</span>
        </div>
      </div>
      
      <div className="h-8 w-px bg-white/10 mx-2 hidden md:block" />

      <div className="flex items-center gap-3">
        {!isPlaying ? (
          <button 
            onClick={handlePlay}
            className="flex items-center space-x-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
          >
            <Play size={18} fill="currentColor" />
            <span>Play</span>
          </button>
        ) : (
          <button 
            onClick={handleStop}
            className="flex items-center space-x-2 px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95"
          >
            <Square size={18} fill="currentColor" />
            <span>Stop</span>
          </button>
        )}

        <button 
          onClick={isRecording ? stopRecording : startRecording}
          disabled={!ready}
          className={`flex items-center space-x-2 px-6 py-2 rounded-xl font-bold transition-all border shadow-lg ${isRecording ? 'bg-red-500/10 border-red-500 text-red-500 animate-pulse' : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-500 shadow-blue-500/20'} disabled:opacity-50 active:scale-95`}
        >
          <Download size={18} />
          <span>{isRecording ? 'Recording...' : 'Record & Download'}</span>
        </button>
      </div>

      {isPlaying && (
        <div className="flex items-center space-x-1.5 ml-auto pr-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div 
              key={i} 
              className={`w-1.5 bg-blue-500 rounded-full animate-bounce`} 
              style={{ height: `${8 + Math.random() * 20}px`, animationDelay: `${i * 0.1}s` }}
            ></div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Player;
