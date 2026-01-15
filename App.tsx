import React, { useState } from 'react';
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { BrainrotState, BrainrotEntry, BrainrotConcept } from './types';
import { Sparkles, Skull, RefreshCw, Grid, Trash2 } from 'lucide-react';

const App: React.FC = () => {
  const [state, setState] = useState<BrainrotState>({
    entries: [],
    isLoading: false,
    error: null,
  });

  const generateBrainrotBatch = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      // 1. Generate 3 Text Concepts at once
      const textModel = 'gemini-3-flash-preview';
      
      const schema: Schema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "The name of the brainrot character/meme. Catchy, absurd, original.",
            },
            lore: {
              type: Type.STRING,
              description: "Short, funny, nonsensical description. Use Gen Z slang (Spanish/Spanglish).",
            },
            visualPrompt: {
              type: Type.STRING,
              description: "Detailed visual description for image generation (English).",
            },
          },
          required: ["name", "lore", "visualPrompt"],
        },
      };

      const textResponse = await ai.models.generateContent({
        model: textModel,
        contents: "Invent 3 completely NEW, distinct, and viral 'brainrot' meme characters. They must be chaotic, weird, and fit for current internet culture (like Skibidi, Rizz, etc but NEW). Output names and lore in Spanish/Spanglish, visualPrompt in English.",
        config: {
          responseMimeType: "application/json",
          responseSchema: schema,
          temperature: 1.3,
        },
      });

      const concepts: BrainrotConcept[] = JSON.parse(textResponse.text || "[]");
      
      if (!concepts || concepts.length === 0) {
        throw new Error("Failed to generate concepts.");
      }

      // 2. Generate Images for all 3 concepts in parallel
      const newEntries: BrainrotEntry[] = await Promise.all(concepts.map(async (concept) => {
        try {
          const imageResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: [
              {
                text: `A high quality, 3d render, surreal meme art style, absurd masterpiece: ${concept.visualPrompt}`,
              }
            ],
            // No responseMimeType for image generation
          });

          let base64Image = "";
          if (imageResponse.candidates?.[0]?.content?.parts) {
            for (const part of imageResponse.candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                base64Image = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                break;
              }
            }
          }

          if (!base64Image) throw new Error("Image generation failed");

          return {
            ...concept,
            id: crypto.randomUUID(),
            imageUrl: base64Image,
            timestamp: Date.now(),
          };
        } catch (e) {
          console.error("Error generating image for one item", e);
          // Return a placeholder or failed state if needed, but for now we skip invalid ones or let it fail
          return {
            ...concept,
            id: crypto.randomUUID(),
            imageUrl: "", // Handle empty image in UI
            timestamp: Date.now(),
          };
        }
      }));

      // Filter out any that completely failed (no image) if strict, 
      // but we'll keep them to show the text at least.
      
      setState(prev => ({
        entries: [...newEntries, ...prev.entries], // Add new ones to the top
        isLoading: false,
        error: null,
      }));

    } catch (err: any) {
      console.error(err);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: "Algo explotó en la fábrica de memes. Intenta de nuevo.",
      }));
    }
  };

  const clearPokedex = () => {
    if (confirm("¿Estás seguro de borrar toda tu colección de brainrot?")) {
      setState(prev => ({ ...prev, entries: [] }));
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white p-4 md:p-8 font-sans overflow-x-hidden">
      {/* Background decoration */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/40 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/40 rounded-full blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center gap-10">
        
        {/* Header */}
        <header className="text-center space-y-4 pt-8">
          <div className="inline-flex items-center gap-2 bg-neutral-800/50 px-4 py-2 rounded-full border border-neutral-700 backdrop-blur-sm mb-2">
            <Grid className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono text-purple-200 tracking-widest uppercase">Pokedex v1.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-black italic font-comic uppercase leading-none drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            Brainrot <span className="rainbow-text">Pokedex</span>
          </h1>
          <p className="text-neutral-400 max-w-md mx-auto">
            Genera, colecciona y preserva los memes más curseados de la historia.
          </p>
        </header>

        {/* Action Area */}
        <div className="flex flex-col items-center gap-4 w-full max-w-md">
          <button
            onClick={state.isLoading ? undefined : generateBrainrotBatch}
            disabled={state.isLoading}
            className={`
              w-full py-6 px-8 rounded-2xl
              bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600
              font-black text-2xl uppercase tracking-wider font-comic
              shadow-[0_0_40px_rgba(124,58,237,0.4)]
              border-2 border-white/20 hover:border-white/60
              transform transition-all duration-200
              flex items-center justify-center gap-3
              ${state.isLoading ? 'opacity-80 cursor-wait' : 'hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_60px_rgba(124,58,237,0.6)]'}
            `}
          >
            {state.isLoading ? (
              <>
                <RefreshCw className="w-8 h-8 animate-spin" />
                <span>Cocinando x3...</span>
              </>
            ) : (
              <>
                <Skull className="w-8 h-8 animate-bounce" />
                <span>Generar Pack (x3)</span>
              </>
            )}
          </button>
          
          {state.error && (
            <div className="w-full bg-red-900/30 border border-red-500/50 text-red-200 p-3 rounded-lg text-center text-sm font-bold">
              {state.error}
            </div>
          )}
        </div>

        {/* Pokedex Stats/Controls */}
        {state.entries.length > 0 && (
          <div className="w-full flex justify-between items-end border-b border-neutral-800 pb-4">
            <div>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                Colección <span className="bg-neutral-800 px-2 py-0.5 rounded-md text-sm text-neutral-400">{state.entries.length}</span>
              </h3>
            </div>
            <button 
              onClick={clearPokedex}
              className="text-neutral-500 hover:text-red-400 text-sm flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Borrar Todo
            </button>
          </div>
        )}

        {/* Pokedex Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          
          {state.isLoading && (
             // Skeleton Loaders
             <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-neutral-800/40 rounded-3xl p-4 h-[500px] border border-neutral-700/50 animate-pulse flex flex-col gap-4">
                  <div className="w-full aspect-square bg-neutral-800 rounded-2xl"></div>
                  <div className="h-8 bg-neutral-800 rounded w-3/4 mx-auto"></div>
                  <div className="h-4 bg-neutral-800 rounded w-full"></div>
                  <div className="h-4 bg-neutral-800 rounded w-5/6"></div>
                </div>
              ))}
             </>
          )}

          {state.entries.map((entry) => (
            <div 
              key={entry.id} 
              className="group relative bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-3xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col"
            >
              {/* Image Container */}
              <div className="relative aspect-square overflow-hidden bg-neutral-950">
                {entry.imageUrl ? (
                  <img 
                    src={entry.imageUrl} 
                    alt={entry.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">
                    <Skull className="w-12 h-12 opacity-20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent opacity-60"></div>
                
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-xs font-mono font-bold text-white/80">
                  #{entry.id.slice(0, 4)}
                </div>
              </div>

              {/* Content */}
              <div className="p-6 flex flex-col flex-grow relative">
                <div className="absolute -top-10 left-6">
                  <h2 className="text-3xl font-black font-comic uppercase text-transparent bg-clip-text bg-gradient-to-br from-white to-neutral-400 drop-shadow-lg">
                    {entry.name}
                  </h2>
                </div>
                
                <div className="mt-2 space-y-4">
                  <div className="flex items-start gap-2 text-yellow-500/90">
                    <Sparkles className="w-4 h-4 mt-1 flex-shrink-0" />
                    <p className="text-neutral-300 text-sm leading-relaxed font-medium">
                      {entry.lore}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {!state.isLoading && state.entries.length === 0 && (
            <div className="col-span-full py-20 text-center text-neutral-600 flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-full bg-neutral-800 flex items-center justify-center mb-2">
                <Skull className="w-10 h-10 opacity-30" />
              </div>
              <p className="text-xl font-medium">Tu Pokedex está vacía.</p>
              <p className="text-sm">Dale al botón gigante para crear 3 abominaciones nuevas.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;