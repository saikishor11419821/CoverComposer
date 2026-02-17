
import React from 'react';
import { Composition, Section } from '../types';
import { Music, Layout, Drum, Speaker, Info, FileText, Zap } from 'lucide-react';
import Player from './Player';

interface Props {
  composition: Composition;
}

const CompositionDisplay: React.FC<Props> = ({ composition }) => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Audio Engine / Playback Controls */}
      <Player composition={composition} autoPlay={true} />

      {/* Header Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Key', value: composition.key, icon: Music },
          { label: 'Tempo', value: `${composition.tempo} BPM`, icon: Zap },
          { label: 'Genre', value: composition.genre, icon: Speaker },
          { label: 'Mood', value: composition.mood, icon: Info },
        ].map((item, idx) => (
          <div key={idx} className="glass p-4 rounded-xl flex items-center space-x-3">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <item.icon size={20} className="text-blue-400" />
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">{item.label}</p>
              <p className="text-lg font-bold text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Structure Timeline */}
      <div className="glass p-6 rounded-2xl">
        <div className="flex items-center space-x-2 mb-6">
          <Layout className="text-purple-400" size={24} />
          <h2 className="text-xl font-bold">Arrangement Structure</h2>
        </div>
        <div className="flex flex-col space-y-4">
          {composition.structure.map((section: Section, idx: number) => (
            <div key={idx} className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-white/5">
              <div className="flex-shrink-0 w-24 pt-1">
                <span className="text-sm font-mono text-purple-400 uppercase tracking-wider">{section.section}</span>
                <p className="text-xs text-slate-500">{section.bars} Bars</p>
              </div>
              <div className="flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Chords</p>
                  <p className="text-sm font-mono text-slate-200">{section.chords.join(' → ')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Melody (Live)</p>
                  <p className="text-sm text-slate-300 italic">{section.melody.length} notes sequenced</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Bass (Live)</p>
                  <p className="text-sm text-slate-300">{section.bass.length} notes sequenced</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Musical Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-6 rounded-2xl">
          <div className="flex items-center space-x-2 mb-4">
            <FileText className="text-blue-400" size={24} />
            <h2 className="text-xl font-bold">Musical Notation</h2>
          </div>
          <div className="bg-black/40 p-4 rounded-xl font-mono text-sm leading-relaxed overflow-x-auto whitespace-pre-wrap border border-white/5 text-emerald-400 max-h-[400px]">
            {composition.melodyNotation}
          </div>
          
          <div className="mt-6">
            <div className="flex items-center space-x-2 mb-2">
              <Drum className="text-orange-400" size={20} />
              <h3 className="font-semibold">Drum Pattern</h3>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl italic">
              {composition.drumPatternBreakdown}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Speaker className="text-pink-400" size={24} />
              <span>Instrumentation</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {composition.instrumentSuggestions.map((inst, idx) => (
                <span key={idx} className="px-3 py-1 bg-pink-500/10 text-pink-300 border border-pink-500/20 rounded-full text-sm">
                  {inst}
                </span>
              ))}
            </div>
          </div>

          {composition.lyrics && (
            <div className="glass p-6 rounded-2xl">
              <h2 className="text-xl font-bold mb-4">Lyrics</h2>
              <div className="bg-white/5 p-4 rounded-xl whitespace-pre-wrap text-slate-300 text-sm italic font-serif">
                {composition.lyrics}
              </div>
            </div>
          )}

          <div className="glass p-6 rounded-2xl border-l-4 border-l-blue-500">
            <h2 className="text-lg font-bold mb-2">AI Composer Reasoning</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              {composition.reasoning}
            </p>
            <hr className="my-4 border-white/10" />
            <h2 className="text-lg font-bold mb-2 text-blue-400">Production Tips</h2>
            <p className="text-sm text-slate-400 italic">
              {composition.productionTips}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompositionDisplay;
