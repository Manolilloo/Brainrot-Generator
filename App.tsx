import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BrainrotState, BrainrotEntry, BrainrotConcept, Rarity } from './types';
import { Sparkles, Skull, RefreshCw, Grid, Trash2, Download, Box, Layers, Star, Info, Zap } from 'lucide-react';

const RARITY_CONFIG: Record<Rarity, { color: string; border: string; bg: string; glow: string; complexity: string }> = {
  Common: {
    color: "text-slate-400",
    border: "border-slate-700/50",
    bg: "bg-slate-800/30",
    glow: "shadow-slate-900/20",
    complexity: "Simple absurd shapes, funny household objects with eyes, vibrant plastic textures."
  },
  Rare: {
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-900/20",
    glow: "shadow-blue-500/10",
    complexity: "Bizarre character hybrids, expressive meme-faces, shiny toy-like materials."
  },
  Epic: {
    color: "text-purple-400",
    border: "border-purple-500/30",
    bg: "bg-purple-900/20",
    glow: "shadow-purple-500/10",
    complexity: "Surreal 3D entities, glowing neon parts, liquid or jelly-like shaders, very funny silhouettes."
  },
  Legendary: {
    color: "text-amber-400",
    border: "border-amber-500/30",
    bg: "bg-amber-900/20",
    glow: "shadow-amber-500/10",
    complexity: "High-tier brainrot icons, legendary meme-aura, gold-plated absurd items, complex funny animations implied."
  },
  Mythic: {
    color: "text-rose-500",
    border: "border-rose-500/30",
    bg: "bg-rose-900/20",
    glow: "shadow-rose-500/20",
    complexity: "Reality-bending brainrot, glitch-core aesthetic, hyper-vibrant 3D nightmare-cute designs."
  }
};

const BrainrotCard: React.FC<{
  entry: BrainrotEntry;
  onGenerate3D: (entry: BrainrotEntry) => void;
  onDownload: (url: string, name: string) => void;
}> = ({ entry, onGenerate3D, onDownload }) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const rarityStyle = RARITY_CONFIG[entry.rarity];

  const is3DMode = viewMode === '3d';
  const has3DModel = !!entry.modelSheetUrl;
  const currentImageUrl = is3DMode && has3DModel ? entry.modelSheetUrl : entry.imageUrl;
  
  const handleDownload = () => {
    if (is3DMode && !has3DModel) return;
    const suffix = is3DMode ? '-brainrot-3d' : '-brainrot-concept';
    onDownload(currentImageUrl!, entry.name + suffix);
  };

  return (
    <div className={`group relative flex flex-col rounded-[2rem] bg-neutral-900/40 border ${rarityStyle.border} backdrop-blur-xl transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${rarityStyle.glow} overflow-hidden`}>
      <div className="relative aspect-square w-full overflow-hidden bg-black/20">
        {is3DMode && !has3DModel ? (
          <div className="flex h-full w-full flex-col items-center justify-center space-y-4 p-8 text-center bg-neutral-950/40">
            {entry.isModelLoading ? (
              <div className="space-y-3">
                <RefreshCw className="mx-auto h-10 w-10 animate-spin text-purple-500" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-purple-400/80">Extrayendo Esencia...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-neutral-800/50">
                  <Box className="h-8 w-8 text-neutral-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-white">Asset para Modelar</p>
                  <p className="text-[10px] text-neutral-500">Vista técnica sobre fondo gris.</p>
                </div>
                <button 
                  onClick={() => onGenerate3D(entry)}
                  className="rounded-full bg-white px-6 py-2 text-[10px] font-black uppercase tracking-widest text-black transition-transform hover:scale-105 active:scale-95"
                >
                  Generar 3D Ref
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <img 
              src={currentImageUrl || 'https://via.placeholder.com/600x600?text=Cargando...'} 
              alt={entry.name}
              className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-60" />
            
            <div className="absolute inset-0 flex items-center justify-center opacity-0 backdrop-blur-[2px] transition-opacity duration-300 group-hover:opacity-100">
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 font-bold text-black shadow-xl backdrop-blur-sm transition-all hover:bg-white hover:scale-110"
              >
                <Download className="h-4 w-4" />
                <span className="text-xs uppercase tracking-tighter">Guardar PNG</span>
              </button>
            </div>
          </>
        )}

        <div className="absolute top-4 right-4 flex gap-1 rounded-full bg-black/50 p-1 backdrop-blur-md border border-white/10 z-30 shadow-lg">
          <button 
            onClick={() => setViewMode('2d')}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${viewMode === '2d' ? 'bg-white text-black shadow-md' : 'text-white/60 hover:text-white'}`}
            title="Vista Arte"
          >
            <Sparkles className="h-4 w-4" />
          </button>
          <button 
            onClick={() => setViewMode('3d')}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-all ${viewMode === '3d' ? 'bg-purple-500 text-white shadow-md' : 'text-white/60 hover:text-white'}`}
            title="Vista Modelado"
          >
            <Box className="h-4 w-4" />
          </button>
        </div>

        <div className={`absolute left-4 top-4 flex items-center gap-1.5 rounded-full ${rarityStyle.bg} px-3 py-1 border ${rarityStyle.border} backdrop-blur-md z-20`}>
          <div className={`h-1.5 w-1.5 rounded-full ${rarityStyle.color.replace('text-', 'bg-')} animate-pulse`} />
          <span className={`text-[9px] font-black uppercase tracking-widest ${rarityStyle.color}`}>{entry.rarity}</span>
        </div>
      </div>

      <div className="flex flex-grow flex-col p-6 pt-2">
        <div className="relative -mt-10 mb-4 h-12 overflow-hidden">
          <h3 className="text-2xl font-black italic uppercase text-white drop-shadow-lg truncate">
            {entry.name}
          </h3>
        </div>
        
        <div className="flex-grow space-y-3">
          <div className="flex items-start gap-2 rounded-2xl bg-white/5 p-3 border border-white/5">
            <Info className="mt-0.5 h-3 w-3 flex-shrink-0 text-neutral-500" />
            <p className="text-[11px] font-medium leading-relaxed text-neutral-300 line-clamp-3 break-words">
              {entry.lore}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
          <div className="flex items-center gap-2 text-neutral-500">
            <Zap className="h-3 w-3" />
            <span className="text-[9px] font-bold uppercase tracking-wider">Brainrot Certified</span>
          </div>
          <span className="text-[9px] font-mono text-neutral-600 uppercase">#RT-{entry.id.split('-')[0]}</span>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [selectedRarity, setSelectedRarity] = useState<Rarity>('Common');
  const [state, setState] = useState<BrainrotState>({
    entries: [],
    isLoading: false,
    error: null,
  });

  const generateBrainrotBatch = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const rarityInfo = RARITY_CONFIG[selectedRarity];

      const schema: Schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "Funny catchy name (max 15 chars)." },
            lore: { type: Type.STRING, description: "Absurd funny description in Spanish for kids." },
            visualPrompt: { type: Type.STRING, description: "Detailed visual description in English: focus on surreal 3D brainrot style." },
          },
          required: ["name", "lore", "visualPrompt"],
        },
      };

      const textResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate 5 unique ${selectedRarity} "Steal a Brainrot" style character concepts. 
        Think of surreal, funny, vibrant 3D renders that children find hilarious. 
        Mashups of food, objects, and internet memes.`,
        config: {
          systemInstruction: `You are the ultimate Brainrot Creator. 
          Style: "Steal a Brainrot" aesthetic. 
          Concepts: Surreal absurdism, funny silhouettes, Gen Alpha humor, vibrant toy-like renders. 
          Complexity: ${rarityInfo.complexity}. 
          Language: Spanish for lore, English for visual prompts. 
          Names: Super catchy, max 15 chars.`,
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 1.5,
        },
      });

      const concepts: BrainrotConcept[] = JSON.parse(textResponse.text || "[]");
      
      const newEntries: BrainrotEntry[] = await Promise.all(concepts.map(async (concept) => {
        try {
          const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [{ 
              text: `HIGH-QUALITY 3D RENDER, "Steal a Brainrot" aesthetic. Vibrant neon colors, glossy plastic and jelly textures, funny distorted features, Octane Render style. ${concept.visualPrompt}. Professional lighting, clean solid studio background, ultra-vibrant and kid-appealing.` 
            }],
          });

          let base64Image = "";
          const parts = imageResponse.candidates?.[0]?.content?.parts || [];
          for (const part of parts) {
            if (part.inlineData?.data) {
              base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
              break;
            }
          }

          return {
            ...concept,
            rarity: selectedRarity,
            id: crypto.randomUUID(),
            imageUrl: base64Image,
            timestamp: Date.now(),
          };
        } catch {
          return { ...concept, rarity: selectedRarity, id: crypto.randomUUID(), imageUrl: "", timestamp: Date.now() };
        }
      }));

      setState(prev => ({
        entries: [...newEntries, ...prev.entries],
        isLoading: false,
        error: null,
      }));

    } catch (err) {
      setState(prev => ({ ...prev, isLoading: false, error: "Fallo en la fábrica de Brainrot. Intenta de nuevo." }));
    }
  };

  const generateModelSheet = async (entry: BrainrotEntry) => {
    setState(prev => ({
      ...prev,
      entries: prev.entries.map(e => e.id === entry.id ? { ...e, isModelLoading: true } : e)
    }));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: [{ 
          text: `TECHNICAL ISOMETRIC 3D SCAN REFERENCE. Character: ${entry.visualPrompt}. 
          RULES: Exact same colors and funny form as original. Background: Solid flat neutral gray #808080. 
          Subject must be perfectly isolated. No effects, no floor, high contrast for 3D modeling. "Steal a Brainrot" style.` 
        }]
      });
      
      let base64Image = "";
      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData?.data) {
          base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
          break;
        }
      }

      setState(prev => ({
        ...prev,
        entries: prev.entries.map(e => e.id === entry.id ? { ...e, modelSheetUrl: base64Image, isModelLoading: false } : e)
      }));
    } catch {
      setState(prev => ({
        ...prev,
        entries: prev.entries.map(e => e.id === entry.id ? { ...e, isModelLoading: false } : e)
      }));
    }
  };

  return (
    <div className="min-h-screen bg-[#050507] text-white selection:bg-purple-500/30 selection:text-purple-200">
      <div className="fixed inset-0 z-0">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-purple-600/10 blur-[150px]" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      </div>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-12 md:px-8">
        <header className="mb-16 flex flex-col items-center text-center">
          <div className="mb-6 flex items-center gap-3 rounded-full border border-white/5 bg-white/5 px-4 py-2 backdrop-blur-md">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400">Brainrot Factory v3.0</span>
          </div>
          <h1 className="mb-4 text-6xl font-black italic uppercase tracking-tighter md:text-8xl">
            Brainrot <span className="rainbow-text">Pokedex</span>
          </h1>
          <p className="max-w-xl text-sm font-medium leading-relaxed text-neutral-500 md:text-base">
            Genera activos surrealistas para tus mapas de Fortnite. Diseños divertidos, absurdos y listos para triunfar.
          </p>
        </header>

        <div className="mb-20 flex flex-col items-center gap-10">
          <div className="flex w-full max-w-2xl gap-1 rounded-2xl border border-white/5 bg-neutral-900/50 p-1.5 backdrop-blur-xl">
            {(Object.keys(RARITY_CONFIG) as Rarity[]).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRarity(r)}
                className={`flex flex-1 flex-col items-center justify-center rounded-xl py-3 transition-all duration-300 ${selectedRarity === r ? 'bg-white/10 shadow-inner' : 'hover:bg-white/5 opacity-40 hover:opacity-100'}`}
              >
                <div className={`mb-1 h-1.5 w-1.5 rounded-full ${selectedRarity === r ? RARITY_CONFIG[r].color.replace('text-', 'bg-') : 'bg-neutral-600'}`} />
                <span className={`text-[10px] font-black uppercase tracking-widest ${selectedRarity === r ? 'text-white' : 'text-neutral-500'}`}>{r}</span>
              </button>
            ))}
          </div>

          <div className="group relative">
            <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-r from-purple-600 to-blue-600 opacity-20 blur-2xl transition duration-1000 group-hover:opacity-40" />
            <button
              onClick={state.isLoading ? undefined : generateBrainrotBatch}
              disabled={state.isLoading}
              className={`relative flex items-center gap-4 rounded-[1.8rem] bg-white px-10 py-6 text-xl font-black uppercase tracking-widest text-black transition-all duration-300 ${state.isLoading ? 'opacity-50 cursor-wait' : 'hover:scale-105 active:scale-95'}`}
            >
              {state.isLoading ? (
                <>
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span>Cocinando...</span>
                </>
              ) : (
                <>
                  <Skull className="h-6 w-6" />
                  <span>Sintetizar Pack x5</span>
                </>
              )}
            </button>
          </div>
          
          {state.error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-6 py-3 text-xs font-bold text-rose-400">
              <Info className="h-4 w-4" />
              {state.error}
            </div>
          )}
        </div>

        <div className="space-y-8">
          {state.entries.length > 0 && (
            <div className="flex items-center justify-between border-b border-white/5 pb-6">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-black uppercase tracking-tight">Colección Absurda</h2>
                <div className="rounded-md bg-white/5 px-2 py-1 text-[10px] font-bold text-neutral-500 uppercase">
                  {state.entries.length} Especímenes
                </div>
              </div>
              <button 
                onClick={() => confirm("¿Vaciar Pokedex?") && setState(s => ({...s, entries: []}))}
                className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-neutral-500 transition-colors hover:text-rose-500"
              >
                <Trash2 className="h-3 w-3" />
                Vaciar
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {state.isLoading && [1,2,3,4,5].map(i => (
              <div key={i} className="flex h-[500px] flex-col overflow-hidden rounded-[2rem] bg-neutral-900/40 border border-white/5 animate-pulse">
                <div className="aspect-square w-full bg-neutral-800/30" />
                <div className="p-6 space-y-4">
                  <div className="h-8 w-3/4 rounded-lg bg-neutral-800/30" />
                  <div className="h-20 w-full rounded-lg bg-neutral-800/30" />
                </div>
              </div>
            ))}

            {state.entries.map((entry) => (
              <BrainrotCard 
                key={entry.id} 
                entry={entry} 
                onGenerate3D={generateModelSheet} 
                onDownload={(url, name) => {
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${name.toLowerCase()}.png`;
                  a.click();
                }} 
              />
            ))}
          </div>

          {!state.isLoading && state.entries.length === 0 && (
            <div className="flex flex-col items-center justify-center py-40 text-center text-neutral-700">
              <div className="mb-4 rounded-full border border-white/5 p-6">
                <Grid className="h-10 w-10 opacity-20" />
              </div>
              <p className="max-w-[200px] text-[10px] font-bold uppercase tracking-[0.4em] opacity-40 leading-loose">
                Esperando la próxima oleada de Brainrot
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default App;