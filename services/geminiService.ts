
import { GoogleGenAI, Type } from "@google/genai";
import { Composition, CompositionRequest } from "../types";

// Always use process.env.API_KEY directly for initialization
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMusicComposition = async (req: CompositionRequest): Promise<Composition> => {
  const prompt = `
    Act as a world-class AI music composer and production engineer. 
    Generate a complete original music composition with the following parameters:
    - Genre: ${req.genre}
    - Mood: ${req.mood}
    - Tempo: ${req.tempo} BPM
    - Target Duration: ${req.durationSeconds} seconds
    - Include Lyrics: ${req.includeLyrics ? 'Yes' : 'No'}

    The composition must be sophisticated. Provide structured note data for each section (melody, bass, and drums) 
    in a format compatible with Tone.js scheduling. 
    Notes should use "bar:beat:sixteenth" timing (e.g., "0:0:0", "0:1:2").
    Durations should use standard musical notation ("4n" for quarter, "8n" for eighth, etc.).
    Melody and Bass notes should be standard pitch names (e.g., "C4", "G3", "Eb4").
    Drums should be categorized as "kick", "snare", or "hihat".
  `;

  // Always use ai.models.generateContent to query GenAI
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          genre: { type: Type.STRING },
          mood: { type: Type.STRING },
          tempo: { type: Type.NUMBER },
          key: { type: Type.STRING },
          structure: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                section: { type: Type.STRING },
                bars: { type: Type.NUMBER },
                chords: { type: Type.ARRAY, items: { type: Type.STRING } },
                melody: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      note: { type: Type.STRING },
                      time: { type: Type.STRING },
                      duration: { type: Type.STRING }
                    },
                    required: ["note", "time", "duration"]
                  }
                },
                bass: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      note: { type: Type.STRING },
                      time: { type: Type.STRING },
                      duration: { type: Type.STRING }
                    },
                    required: ["note", "time", "duration"]
                  }
                },
                drums: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      type: { type: Type.STRING, enum: ["kick", "snare", "hihat"] },
                      time: { type: Type.STRING }
                    },
                    required: ["type", "time"]
                  }
                }
              },
              required: ["section", "bars", "chords", "melody", "drums", "bass"]
            }
          },
          fullChordProgression: { type: Type.STRING },
          melodyNotation: { type: Type.STRING },
          drumPatternBreakdown: { type: Type.STRING },
          instrumentSuggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
          lyrics: { type: Type.STRING },
          reasoning: { type: Type.STRING },
          productionTips: { type: Type.STRING }
        },
        required: [
          "genre", "mood", "tempo", "key", "structure", "fullChordProgression", 
          "melodyNotation", "drumPatternBreakdown", "instrumentSuggestions", 
          "reasoning", "productionTips"
        ]
      }
    }
  });

  // Extract the generated text content by accessing the .text property
  const jsonStr = response.text || "{}";
  return JSON.parse(jsonStr) as Composition;
};
