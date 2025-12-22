import type { VercelRequest, VercelResponse } from '@vercel/node';

interface BlockData {
  action: string;
  examType: string;
  priority: string;
}

interface Block {
  index: number;
  timestamp: number;
  data: BlockData;
  hash: string;
}

interface ChainSummaryItem {
  id: number;
  time: string;
  action: string;
  type: string;
  priority: string;
  hash: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY non configurata');
    return res.status(500).json({ error: 'API Key non configurata sul server' });
  }

  try {
    const { chain } = req.body as { chain: Block[] };

    if (!chain || !Array.isArray(chain)) {
      return res.status(400).json({ error: 'Chain data mancante o non valida' });
    }

    const chainSummary: ChainSummaryItem[] = chain.map((b: Block) => ({
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

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error('Gemini API Error:', errorData);
      return res.status(500).json({ 
        error: 'Errore nella chiamata a Gemini API',
        details: errorData.error?.message || 'Unknown error'
      });
    }

    const data = await geminiResponse.json();
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text || 
                         'Impossibile generare l\'analisi.';

    return res.status(200).json({ analysis: analysisText });

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Errore interno del server' });
  }
}
