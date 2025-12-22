import { GoogleGenAI } from "@google/genai";
import { Block } from "../types";

// Dichiarazione manuale per evitare errori TypeScript dato che mancano @types/node
declare const process: {
  env: {
    API_KEY: string;
  }
};

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBlockchain = async (chain: Block[]): Promise<string> => {
  try {
    const model = "gemini-3-flash-preview";
    
    // Prepare a simplified version of the chain for the AI to save tokens
    const chainSummary = chain.map(b => ({
      id: b.index,
      time: new Date(b.timestamp).toISOString(),
      action: b.data.action,
      type: b.data.examType,
      priority: b.data.priority,
      hash: b.hash.substring(0, 8) + "..."
    }));

    const prompt = `
      Agisci come un Auditor di Blockchain Sanitaria. Analizza il seguente registro delle transazioni (Ledger) di una lista d'attesa medica.
      
      Dati del Ledger:
      ${JSON.stringify(chainSummary, null, 2)}
      
      Per favore, fornisci un breve report (max 150 parole) in Italiano che evidenzi:
      1. Integrità della catena (basata sulla sequenza temporale).
      2. Efficienza del processo (tempo tra prenotazione ed erogazione).
      3. Eventuali anomalie o colli di bottiglia.
      
      Usa un tono professionale e tecnico.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });

    return response.text || "Impossibile generare l'analisi al momento.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Errore durante l'analisi AI. Verifica la chiave API.";
  }
};
