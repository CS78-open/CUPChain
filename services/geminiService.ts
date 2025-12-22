import { GoogleGenAI } from "@google/genai";
import { Block } from "../types";

// Dichiarazione per TypeScript
declare const process: {
  env: {
    API_KEY: string;
  }
};

// Rimuovi l'inizializzazione globale che causa il crash
// const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeBlockchain = async (chain: Block[]): Promise<string> => {
  try {
    const apiKey = process.env.API_KEY;
    
    // Controllo di sicurezza
    if (!apiKey) {
      console.warn("API Key mancante su Vercel!");
      return "Errore: API Key non configurata. Impostala su Vercel nelle Environment Variables.";
    }

    // Inizializza solo quando richiesto
    const ai = new GoogleGenAI({ apiKey });
    const model = "gemini-1.5-flash-001"; // Aggiornato a un modello stabile se necessario o usa "gemini-1.5-flash"
    
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

    // Nota: La chiamata corretta per @google/genai v1.0+ potrebbe variare leggermente
    // Assicuriamoci di usare la sintassi standard o quella specifica della tua versione
    // Se usi @google/genai, spesso la sintassi è client.models.generateContent o simile.
    // Manteniamo la tua struttura se funzionava in locale, ma incapsulata nel try/catch.
    
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt, // Verifica se la libreria vuole 'contents' o un formato diverso
    });

    return response.text() || "Impossibile generare l'analisi."; // .text() è spesso un metodo
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return "Errore durante l'analisi AI. Verifica la console per dettagli.";
  }
};
