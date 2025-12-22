import { Block } from "../types";

export const analyzeBlockchain = async (chain: Block[]): Promise<string> => {
  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ chain })
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('API Error:', errorData);
      return `Errore: ${errorData.error || 'Impossibile contattare il server'}`;
    }

    const data = await response.json();
    return data.analysis || "Impossibile generare l'analisi.";

  } catch (error) {
    console.error("Analysis Error:", error);
    return "Errore durante l'analisi AI. Verifica la connessione e riprova.";
  }
};
```

**Clicca "Commit changes"**

---

## 3. MODIFICA: `index.html`

Su GitHub: **vai al file → clicca la matita (Edit)**

**Trova e CANCELLA questa riga:**
```
    "@google/genai": "https://esm.sh/@google/genai@^1.34.0",
