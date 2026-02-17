
import React, { useState } from 'react';
import { Genre, Mood, Composition, CompositionRequest } from './types';
import { generateMusicComposition } from './services/geminiService';
import CompositionDisplay from './components/CompositionDisplay';
import { Music, Settings2, Sparkles, Loader2, PlayCircle, PlusCircle, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [composition, setComposition] = useState<Composition | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CompositionRequest>({
    genre: Genre.EDM,
    mood: Mood.ENERGETIC,
    tempo: 128,
    includeLyrics: false,
    durationSeconds: 60
  });

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await generateMusicComposition(formData);
      setComposition(result);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate composition. Please check your API key and network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 px-4 pt-8 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Music className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight gradient-text">AudioMind AI</h1>
            <p className="text-slate-400 text-sm">Professional Music Composition Engine</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-xs font-mono bg-white/5 px-3 py-1 rounded-full text-slate-500 border border-white/5">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span>GEMINI-3-FLASH ACTIVE</span>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Sidebar Controls */}
        <aside className="xl:col-span-1 space-y-6">
          <div className="glass p-6 rounded-3xl sticky top-8">
            <div className="flex items-center space-x-2 mb-6 text-slate-300">
              <Settings2 size={20} />
              <h2 className="font-bold uppercase tracking-widest text-sm">Parameters</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Genre</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                  value={formData.genre}
                  onChange={(e) => setFormData({...formData, genre: e.target.value as Genre})}
                >
                  {Object.values(Genre).map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Mood</label>
                <select 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer"
                  value={formData.mood}
                  onChange={(e) => setFormData({...formData, mood: e.target.value as Mood})}
                >
                  {Object.values(Mood).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Tempo (BPM)</label>
                <input 
                  type="number" 
                  min="40" 
                  max="300"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.tempo}
                  onChange={(e) => setFormData({...formData, tempo: parseInt(e.target.value)})}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Duration (Secs)</label>
                <input 
                  type="number" 
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.durationSeconds}
                  onChange={(e) => setFormData({...formData, durationSeconds: parseInt(e.target.value)})}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-sm font-medium">Generate Lyrics</span>
                <button 
                  onClick={() => setFormData({...formData, includeLyrics: !formData.includeLyrics})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.includeLyrics ? 'bg-blue-600' : 'bg-slate-700'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.includeLyrics ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="group-hover:rotate-12 transition-transform" size={20} />
                    <span>Generate Composition</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="xl:col-span-3 min-h-[600px]">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 flex items-center space-x-3">
              <span className="text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {!composition && !loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-6 glass rounded-3xl border-dashed border-2 border-white/5">
              <div className="p-6 bg-white/5 rounded-full mb-4">
                <Music size={64} className="text-slate-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-300">Ready to Compose?</h2>
                <p className="text-slate-500 max-w-sm mt-2">Adjust the parameters on the left and click Generate to start your next masterpiece.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl px-6">
                 <div className="p-4 bg-white/5 rounded-2xl text-left border border-white/5">
                    <PlayCircle className="text-blue-400 mb-2" size={20} />
                    <h3 className="text-sm font-bold">Pro Structures</h3>
                    <p className="text-xs text-slate-500">Intro, Verse, Chorus, Bridge, and Outro flows.</p>
                 </div>
                 <div className="p-4 bg-white/5 rounded-2xl text-left border border-white/5">
                    <PlusCircle className="text-purple-400 mb-2" size={20} />
                    <h3 className="text-sm font-bold">Layered Parts</h3>
                    <p className="text-xs text-slate-500">Chords, melodies, basslines, and drum patterns.</p>
                 </div>
                 <div className="p-4 bg-white/5 rounded-2xl text-left border border-white/5">
                    <Trash2 className="text-pink-400 mb-2" size={20} />
                    <h3 className="text-sm font-bold">Smart Lyrics</h3>
                    <p className="text-xs text-slate-500">Thematic lyrics for Pop, Rock, and EDM genres.</p>
                 </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-center space-y-8 glass rounded-3xl">
              <div className="relative">
                <div className="w-24 h-24 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                <Music className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-blue-500" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Gemini is Composing...</h3>
                <p className="text-slate-400 animate-pulse">Calculating harmonics, arranging structures, and generating rhythms.</p>
              </div>
            </div>
          )}

          {composition && !loading && (
            <CompositionDisplay composition={composition} />
          )}
        </main>
      </div>

      <footer className="mt-20 pt-8 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>&copy; 2024 AudioMind AI. Powered by Gemini 3 Flash. No actual audio synthesis performed; musical blueprint only.</p>
      </footer>
    </div>
  );
};

export default App;
