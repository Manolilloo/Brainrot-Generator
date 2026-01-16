import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BrainrotState, BrainrotEntry, BrainrotConcept, Rarity } from './types';
import { Sparkles, RefreshCw, Grid, Trash2, Download, Box, Zap, Cuboid, ChevronRight, Loader2, Gamepad2, ScanLine } from 'lucide-react';

// Extended configuration with ambient colors for the background
const RARITY_CONFIG: Record<Rarity, { 
  color: string; 
  gradient: string; 
  complexity: string;
  ambientFrom: string; // Color for background blob 1
  ambientTo: string;   // Color for background blob 2
  accent: string;      // Solid accent color for flashes
  glow: string;        // Box shadow color
}> = {
  Common: {
    color: "text-slate-300",
    gradient: "from-slate-400 to-slate-600",
    complexity: "Simple absurd shapes, funny household objects with eyes, vibrant plastic textures.",
    ambientFrom: "bg-slate-500/10",
    ambientTo: "bg-gray-500/10",
    accent: "rgb(148, 163, 184)",
    glow: "rgba(148, 163, 184, 0.5)"
  },
  Rare: {
    color: "text-cyan-300",
    gradient: "from-cyan-400 to-blue-500",
    complexity: "Bizarre character hybrids, expressive meme-faces, shiny toy-like materials.",
    ambientFrom: "bg-cyan-500/20",
    ambientTo: "bg-blue-600/20",
    accent: "rgb(6, 182, 212)",
    glow: "rgba(6, 182, 212, 0.6)"
  },
  Epic: {
    color: "text-fuchsia-300",
    gradient: "from-fuchsia-500 to-purple-600",
    complexity: "Surreal 3D entities, glowing neon parts, liquid or jelly-like shaders, very funny silhouettes.",
    ambientFrom: "bg-fuchsia-600/20",
    ambientTo: "bg-purple-800/20",
    accent: "rgb(192, 38, 211)",
    glow: "rgba(192, 38, 211, 0.6)"
  },
  Legendary: {
    color: "text-amber-300",
    gradient: "from-amber-400 to-orange-500",
    complexity: "High-tier brainrot icons, legendary meme-aura, gold-plated absurd items, complex funny animations implied.",
    ambientFrom: "bg-amber-500/20",
    ambientTo: "bg-orange-600/20",
    accent: "rgb(245, 158, 11)",
    glow: "rgba(245, 158, 11, 0.7)"
  },
  Mythic: {
    color: "text-rose-300",
    gradient: "from-rose-500 to-red-600",
    complexity: "Reality-bending brainrot, glitch-core aesthetic, hyper-vibrant 3D nightmare-cute designs.",
    ambientFrom: "bg-rose-600/20",
    ambientTo: "bg-red-900/30",
    accent: "rgb(225, 29, 72)",
    glow: "rgba(225, 29, 72, 0.8)"
  }
};

const BrainrotCard: React.FC<{
  entry: BrainrotEntry;
  index: number;
  onGenerate3D: (entry: BrainrotEntry) => void;
  onDownload: (url: string, name: string) => void;
}> = ({ entry, index, onGenerate3D, onDownload }) => {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const rarityStyle = RARITY_CONFIG[entry.rarity];
  const is3DMode = viewMode === '3d';
  const has3DModel = !!entry.modelSheetUrl;
  const currentImageUrl = is3DMode && has3DModel ? entry.modelSheetUrl : entry.imageUrl;

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (is3DMode && !has3DModel) return;
    const suffix = is3DMode ? '-ref-sheet' : '-concept';
    onDownload(currentImageUrl!, entry.name + suffix);
  };

  // Render Visual Effects Layer based on Rarity
  const renderRarityEffects = () => {
    switch (entry.rarity) {
      case 'Common':
        return <div className="absolute inset-0 rounded-3xl border border-white/5 pointer-events-none" />;
      case 'Rare':
        return (
          <>
            <div className="absolute inset-0 rounded-3xl border border-cyan-500/30 shadow-[0_0_15px_-5px_rgba(6,182,212,0.3)] pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/10 to-transparent opacity-50 pointer-events-none" />
          </>
        );
      case 'Epic':
        return (
          <>
             {/* Pulsing Border */}
            <div className="absolute -inset-[1px] rounded-[25px] bg-gradient-to-b from-fuchsia-500 to-purple-600 opacity-50 blur-[2px] animate-pulse pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl border border-fuchsia-500/50 pointer-events-none" />
          </>
        );
      case 'Legendary':
        return (
          <>
            {/* Rotating Gold Border */}
            <div className="absolute -inset-[2px] rounded-[26px] bg-[conic-gradient(from_var(--shimmer-angle),theme(colors.amber.600)_0%,theme(colors.yellow.200)_10%,theme(colors.amber.600)_20%)] animate-border-rotate opacity-60 blur-[4px] pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl border border-amber-400/40 pointer-events-none" />
            {/* Diagonal Shine */}
            <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                <div className="absolute inset-0 translate-x-[-100%] animate-[shine_3s_infinite] bg-gradient-to-tr from-transparent via-white/10 to-transparent" />
            </div>
          </>
        );
      case 'Mythic':
        return (
          <>
             {/* Aggressive Red Aura */}
            <div className="absolute -inset-[2px] rounded-[26px] bg-gradient-to-r from-red-600 via-rose-600 to-red-600 blur-md opacity-40 animate-pulse pointer-events-none" />
            <div className="absolute inset-0 rounded-3xl border border-red-500/60 shadow-[inset_0_0_20px_rgba(220,38,38,0.2)] pointer-events-none" />
            {/* Floating Particles (Simulated with simple divs for performance) */}
            <div className="absolute bottom-0 left-1/4 h-32 w-32 bg-rose-600/20 blur-[40px] animate-[pulse_2s_ease-in-out_infinite] pointer-events-none" />
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div 
      style={{ 
        animationDelay: `${index * 150}ms`,
        '--rarity-glow': rarityStyle.glow
      } as React.CSSProperties}
      className="group relative flex flex-col rounded-3xl bg-[#0a0a0f] transition-all duration-500 hover:-translate-y-3 hover:scale-[1.02] hover:shadow-[0_20px_40px_-15px_var(--rarity-glow)] ring-1 ring-white/0 hover:ring-white/20 animate-in fade-in slide-in-from-bottom-8 fill-mode-forwards opacity-0"
    >
      {/* Background/Border Effects Layer */}
      {renderRarityEffects()}

      {/* Content Container (clipped) */}
      <div className="relative z-10 flex h-full flex-col overflow-hidden rounded-3xl">
        
        {/* Image Area */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-neutral-900 to-[#151520]">
          {is3DMode && !has3DModel ? (
            <div className="flex h-full w-full flex-col items-center justify-center p-8 text-center backdrop-blur-sm">
              {entry.isModelLoading ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 animate-pulse">Scanning Geometry...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 shadow-[0_0_30px_-10px_rgba(255,255,255,0.1)]">
                    <Cuboid className="h-8 w-8 text-indigo-400" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-white">Generar Vista Técnica</h4>
                    <p className="text-xs leading-relaxed text-slate-400">
                      Crea una hoja de referencia isométrica perfecta para modelado en Blender/UEFN.
                    </p>
                  </div>
                  <button 
                    onClick={() => onGenerate3D(entry)}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-black uppercase tracking-wide text-black transition-transform hover:scale-110 active:scale-95 shadow-[0_0_20px_-5px_rgba(255,255,255,0.5)]"
                  >
                    <Box className="h-3.5 w-3.5" />
                    Generar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <img 
              src={currentImageUrl || ''} 
              alt={entry.name}
              className="h-full w-full object-cover transition-transform duration-700 will-change-transform group-hover:scale-110"
            />
          )}

          {/* Floating Toolbar */}
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-black/80 p-2 opacity-0 backdrop-blur-xl transition-all duration-300 ring-1 ring-white/10 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 z-20">
              <div className="flex gap-1 rounded-xl bg-white/10 p-1">
                <button 
                  onClick={() => setViewMode('2d')}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${viewMode === '2d' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
                  title="Concept Art"
                >
                  <Sparkles className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => setViewMode('3d')}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${viewMode === '3d' ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg' : 'text-neutral-400 hover:text-white hover:bg-white/10'}`}
                  title="Model Sheet"
                >
                  <Cuboid className="h-4 w-4" />
                </button>
              </div>

              <button 
                onClick={handleDownload}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black transition-transform hover:scale-105 active:scale-95 shadow-[0_0_15px_-3px_rgba(255,255,255,0.4)]"
                title="Download Asset"
              >
                <Download className="h-4 w-4" />
              </button>
          </div>

          {/* Rarity Badge - Top Left */}
          <div className="absolute left-4 top-4 z-20">
             <div className={`flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 backdrop-blur-xl ring-1 border-white/10 shadow-lg`}>
                <div className={`h-2 w-2 rounded-full bg-gradient-to-r ${rarityStyle.gradient} ${entry.rarity === 'Mythic' || entry.rarity === 'Legendary' ? 'animate-ping' : ''}`} />
                <span className={`text-[10px] font-black uppercase tracking-wider bg-gradient-to-r ${rarityStyle.gradient} bg-clip-text text-transparent`}>{entry.rarity}</span>
             </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex flex-grow flex-col justify-between border-t border-white/5 bg-[#0e0e14] p-5 relative overflow-hidden">
          {/* Decorative glow inside card body */}
          <div className={`absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-r ${rarityStyle.gradient} opacity-5 blur-2xl transition-opacity group-hover:opacity-15`} />
          
          <div className="space-y-2 relative z-10">
            <div className="flex items-center justify-between">
              <h3 className="font-sans text-xl font-black tracking-tight text-white">{entry.name}</h3>
              <div className="flex items-center gap-1 rounded-md bg-white/5 px-1.5 py-0.5 border border-white/5">
                  <span className="text-[9px] font-mono text-neutral-500">UEFN READY</span>
              </div>
            </div>
            <p className="line-clamp-2 text-xs font-medium leading-relaxed text-neutral-400">
              {entry.lore}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [selectedRarity, setSelectedRarity] = useState<Rarity>('Common');
  const [isChangingRarity, setIsChangingRarity] = useState(false);
  const [state, setState] = useState<BrainrotState>({
    entries: [],
    isLoading: false,
    error: null,
  });

  // Handle Rarity Change Animation
  const handleRarityChange = (newRarity: Rarity) => {
    if (newRarity === selectedRarity) return;
    setIsChangingRarity(true);
    setSelectedRarity(newRarity);
    setTimeout(() => setIsChangingRarity(false), 800); // 800ms transition time to match animations
  };

  const currentRarityConfig = RARITY_CONFIG[selectedRarity];

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
        contents: `Generate 3 unique ${selectedRarity} "Steal a Brainrot" style character concepts. 
        Think of surreal, funny, vibrant 3D renders that children find hilarious. 
        Mashups of food, objects, and internet memes.`,
        config: {
          systemInstruction: `You are the ultimate Brainrot Creator for UEFN. 
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
              text: `HIGH-QUALITY 3D RENDER, "Steal a Brainrot" aesthetic. Vibrant neon colors, glossy plastic and jelly textures, funny distorted features, Octane Render style. ${concept.visualPrompt}. Professional lighting, clean solid studio background, ultra-vibrant and kid-appealing. Unreal Engine 5 Style.` 
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
      setState(prev => ({ ...prev, isLoading: false, error: "Error en la conexión con el servidor creativo." }));
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
    <div className="min-h-screen bg-[#030305] text-white selection:bg-fuchsia-500/30 selection:text-fuchsia-100 overflow-x-hidden transition-colors duration-1000">
      
      {/* 
        -----------------------------------------------------------------------
        DYNAMIC ATMOSPHERE & TRANSITION EFFECTS
        -----------------------------------------------------------------------
      */}
      
      {/* Fixed noise overlay */}
      <div className="fixed inset-0 z-0 opacity-[0.04] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] pointer-events-none" />
      
      {/* Ambient Blobs (Colors change based on rarity) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] h-[800px] w-[800px] rounded-full blur-[120px] transition-colors duration-1000 ease-in-out ${currentRarityConfig.ambientFrom} animate-[pulse_8s_ease-in-out_infinite]`} />
        <div className={`absolute bottom-[-10%] right-[-10%] h-[800px] w-[800px] rounded-full blur-[120px] transition-colors duration-1000 ease-in-out ${currentRarityConfig.ambientTo} animate-[pulse_10s_ease-in-out_infinite_reverse]`} />
      </div>

      {/* Rarity Change Flash Overlay & Cinematic Text */}
      {isChangingRarity && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex flex-col items-center justify-center overflow-hidden backdrop-blur-[2px]">
          {/* Main Flash */}
          <div className="absolute inset-0 animate-flash-fade bg-black" style={{ opacity: 0.4 }}></div>
          
          {/* Central Rarity Text Announcement */}
          <div className="relative z-10 flex flex-col items-center justify-center">
             <h2 
               className="text-[12vw] md:text-[150px] font-black uppercase tracking-tighter italic opacity-0 animate-slam"
               style={{ 
                 color: 'transparent',
                 WebkitTextStroke: `2px ${currentRarityConfig.accent}`,
                 textShadow: `0 0 100px ${currentRarityConfig.glow}`
               }}
             >
               {selectedRarity}
             </h2>
             <div 
               className="h-2 w-full max-w-[500px] scale-x-0 animate-expand-line"
               style={{ backgroundColor: currentRarityConfig.accent, boxShadow: `0 0 40px ${currentRarityConfig.glow}` }}
             />
          </div>

          {/* Existing Scanline Sweep */}
          <div className="absolute inset-x-0 top-0 h-[30vh] bg-gradient-to-b from-transparent via-white/10 to-transparent blur-md animate-scanline" />
        </div>
      )}

      {/* 
        -----------------------------------------------------------------------
        MAIN UI
        -----------------------------------------------------------------------
      */}
      <main className="relative z-10 mx-auto flex max-w-[1400px] flex-col gap-12 px-6 py-12 lg:px-12">
        
        {/* Header Layout */}
        <header className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-end">
          <div className="space-y-4">
            <div className={`inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md transition-all duration-300 ${isChangingRarity ? 'animate-shake' : ''}`}>
              <span className="relative flex h-2 w-2">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75`} style={{ backgroundColor: currentRarityConfig.accent }}></span>
                <span className={`relative inline-flex rounded-full h-2 w-2`} style={{ backgroundColor: currentRarityConfig.accent }}></span>
              </span>
              <span className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-300`} style={{ color: isChangingRarity ? currentRarityConfig.accent : '#9ca3af' }}>
                {isChangingRarity ? 'RECONFIGURING...' : 'SYSTEM ONLINE v4.20'}
              </span>
            </div>
            <div>
              <h1 className="text-5xl font-black tracking-tighter text-white md:text-7xl lg:text-8xl drop-shadow-2xl">
                Brainrot <span className={`bg-gradient-to-r ${currentRarityConfig.gradient} bg-clip-text text-transparent transition-all duration-700`}>for FN</span>
              </h1>
              <p className="mt-4 max-w-lg text-sm font-medium text-slate-400">
                Generador de activos <span className="text-white">UEFN/Creative 2.0</span> de alta fidelidad. 
                Crea personajes virales para tus mapas.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-6 w-full md:w-auto">
            {/* Rarity Selector (Tabs Style) */}
            <div className="flex w-full md:w-auto overflow-x-auto no-scrollbar rounded-2xl border border-white/5 bg-black/40 p-1.5 backdrop-blur-xl">
              {(Object.keys(RARITY_CONFIG) as Rarity[]).map((r) => {
                const isActive = selectedRarity === r;
                const config = RARITY_CONFIG[r];
                return (
                  <button
                    key={r}
                    onClick={() => handleRarityChange(r)}
                    style={isActive ? { backgroundColor: config.accent, boxShadow: `0 0 20px -5px ${config.glow}` } : {}}
                    className={`relative flex-1 md:flex-none rounded-xl px-5 py-2.5 transition-all duration-300 ${isActive ? 'scale-105 text-black font-extrabold' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                  >
                    <span className={`relative z-10 text-[11px] font-black uppercase tracking-wider`}>
                        {r}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Main Action Button */}
            <button
              onClick={state.isLoading ? undefined : generateBrainrotBatch}
              disabled={state.isLoading}
              className={`group relative w-full md:w-auto flex items-center justify-center gap-4 overflow-hidden rounded-2xl bg-gradient-to-r ${currentRarityConfig.gradient} p-[1px] shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70`}
            >
               <div className="relative flex h-full w-full items-center gap-4 rounded-2xl bg-black/80 px-8 py-4 backdrop-blur-sm transition-all group-hover:bg-black/60">
                {state.isLoading ? (
                    <>
                    <RefreshCw className="h-5 w-5 animate-spin text-white" />
                    <span className="text-sm font-black tracking-wide text-white">GENERANDO...</span>
                    </>
                ) : (
                    <>
                    <Gamepad2 className="h-6 w-6 text-white group-hover:animate-bounce" />
                    <div className="flex flex-col items-start text-left">
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 text-white">NEXT-GEN AI</span>
                        <span className="text-lg font-black tracking-tight text-white">CREAR PACK x3</span>
                    </div>
                    <ChevronRight className="h-5 w-5 text-white opacity-50 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
                    </>
                )}
               </div>
            </button>
          </div>
        </header>

        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        {/* Content Grid */}
        <section className="min-h-[600px]">
          {state.isLoading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="relative flex aspect-[4/5] flex-col justify-between overflow-hidden rounded-3xl border border-white/5 bg-[#0e0e14] p-6">
                   <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent animate-[shimmer_2s_infinite] -translate-y-full" />
                   <div className="flex gap-4 z-10">
                     <div className="h-16 w-16 rounded-2xl bg-white/5" />
                     <div className="flex-1 space-y-3 pt-2">
                        <div className="h-4 w-24 rounded bg-white/5" />
                        <div className="h-3 w-32 rounded bg-white/5" />
                     </div>
                   </div>
                   <div className="space-y-3 z-10">
                      <div className="h-3 w-full rounded bg-white/5" />
                      <div className="h-3 w-2/3 rounded bg-white/5" />
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {state.entries.map((entry, index) => (
                  <BrainrotCard 
                    key={entry.id}
                    index={index}
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

              {state.entries.length === 0 && (
                <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/5 backdrop-blur-sm transition-colors duration-500" style={{ borderColor: isChangingRarity ? currentRarityConfig.accent : 'rgba(255,255,255,0.1)' }}>
                  <div className="rounded-full bg-black/50 p-8 shadow-2xl ring-1 ring-white/10">
                    <ScanLine className="h-12 w-12 opacity-50 transition-colors duration-500" style={{ color: currentRarityConfig.accent }} />
                  </div>
                  <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                    Sistema en espera de input
                  </p>
                </div>
              )}
            </>
          )}
        </section>

        {/* Footer Controls */}
        {state.entries.length > 0 && !state.isLoading && (
           <div className="flex justify-end border-t border-white/5 pt-8 pb-20">
              <button 
                onClick={() => confirm("¿Desea purgar los datos actuales?") && setState(s => ({...s, entries: []}))}
                className="group flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest text-neutral-500 transition-all hover:bg-rose-500/10 hover:text-rose-500"
              >
                <Trash2 className="h-4 w-4 transition-transform group-hover:rotate-12" />
                Purgar Cache
              </button>
           </div>
        )}
      </main>
      
      <style>{`
        @property --shimmer-angle {
          syntax: '<angle>';
          initial-value: 0deg;
          inherits: false;
        }
        @keyframes border-rotate {
          from { --shimmer-angle: 0deg; }
          to { --shimmer-angle: 360deg; }
        }
        @keyframes shine {
          from { transform: translateX(-100%); }
          to { transform: translateX(100%); }
        }
        @keyframes shimmer {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        @keyframes flash-fade {
          0% { opacity: 0.8; transform: scale(1.05); }
          100% { opacity: 0; transform: scale(1); }
        }
        @keyframes scanline {
          0% { transform: translateY(-100vh); opacity: 0; }
          50% { opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes slam {
          0% { transform: scale(3); opacity: 0; letter-spacing: 2rem; filter: blur(20px); }
          40% { transform: scale(1); opacity: 1; letter-spacing: normal; filter: blur(0px); }
          80% { transform: scale(1); opacity: 1; filter: blur(0px); }
          100% { transform: scale(1.2); opacity: 0; filter: blur(10px); }
        }
        @keyframes expand-line {
          0% { transform: scaleX(0); opacity: 1; }
          50% { transform: scaleX(1); opacity: 1; }
          100% { transform: scaleX(1.5); opacity: 0; }
        }
        .animate-border-rotate {
          animation: border-rotate 4s linear infinite;
        }
        .animate-flash-fade {
          animation: flash-fade 0.6s ease-out forwards;
        }
        .animate-scanline {
          animation: scanline 0.8s linear forwards;
        }
        .animate-slam {
          animation: slam 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        .animate-expand-line {
          animation: expand-line 0.8s ease-out forwards;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;