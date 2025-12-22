import React, { useState, useEffect, useCallback } from 'react';
import { Block, MedicalData } from './types';
import { createGenesisBlock, createBlock, verifyChain } from './utils/blockchain';
import { analyzeBlockchain } from './services/geminiService';
import { BlockVisualizer } from './components/BlockVisualizer';
import { 
  PlusCircle, 
  Activity, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Search, 
  Bot, 
  Stethoscope, 
  LayoutDashboard,
  Trash2,
  Info
} from 'lucide-react';

// Mock Data for Exam Types
const EXAM_TYPES = [
  "Risonanza Magnetica Encefalo",
  "Ecografia Addome Completo",
  "Visita Cardiologica + ECG",
  "TAC Torace senza contrasto",
  "Esame Emocromocitometrico"
];

const App: React.FC = () => {
  const [chain, setChain] = useState<Block[]>([]);
  const [view, setView] = useState<'patient' | 'hospital' | 'ledger'>('patient');
  const [isChainValid, setIsChainValid] = useState<boolean>(true);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Form States
  const [nre, setNre] = useState('');
  const [fiscalCode, setFiscalCode] = useState('');
  const [examType, setExamType] = useState(EXAM_TYPES[0]);
  const [priority, setPriority] = useState<'U'|'B'|'D'|'P'>('D');
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success'>('idle');

  // Initialize Chain (Load from LocalStorage or Create Genesis)
  useEffect(() => {
    const initChain = async () => {
      const savedChain = localStorage.getItem('medichain_ledger');
      if (savedChain) {
        try {
          const parsedChain = JSON.parse(savedChain);
          if (Array.isArray(parsedChain) && parsedChain.length > 0) {
            setChain(parsedChain);
            return;
          }
        } catch (e) {
          console.error("Failed to parse chain from storage");
        }
      }
      
      // Fallback to Genesis if no storage or error
      const genesis = await createGenesisBlock();
      setChain([genesis]);
    };
    initChain();
  }, []);

  // Save to LocalStorage whenever chain changes
  useEffect(() => {
    if (chain.length > 0) {
      localStorage.setItem('medichain_ledger', JSON.stringify(chain));
    }
  }, [chain]);

  // Validate chain whenever it changes
  useEffect(() => {
    const checkChain = async () => {
      if (chain.length > 0) {
        const valid = await verifyChain(chain);
        setIsChainValid(valid);
      }
    };
    checkChain();
  }, [chain]);

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chain.length) return;

    const lastBlock = chain[chain.length - 1];
    const newData: MedicalData = {
      nre,
      fiscalCode: fiscalCode.toUpperCase(),
      priority,
      examType,
      action: 'CREATION'
    };

    const newBlock = await createBlock(lastBlock, newData, 'NODE_PATIENT_APP');
    setChain(prev => [...prev, newBlock]);
    setSubmissionStatus('success');
    
    // Reset form
    setTimeout(() => {
      setNre('');
      setFiscalCode('');
      setSubmissionStatus('idle');
    }, 2000);
  };

  const handleFulfill = async (pendingBlock: Block) => {
    if (!chain.length) return;
    const lastBlock = chain[chain.length - 1];
    
    const newData: MedicalData = {
      ...pendingBlock.data,
      action: 'FULFILLMENT',
      notes: 'Prestazione erogata con successo. Referto #REF-' + Math.floor(Math.random() * 10000)
    };

    const newBlock = await createBlock(lastBlock, newData, 'NODE_HOSPITAL_MAIN');
    setChain(prev => [...prev, newBlock]);
  };

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis("");
    const result = await analyzeBlockchain(chain);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  const handleResetChain = async () => {
    if (confirm("Sei sicuro di voler cancellare l'intero registro? Questa azione è irreversibile.")) {
      localStorage.removeItem('medichain_ledger');
      const genesis = await createGenesisBlock();
      setChain([genesis]);
      setAiAnalysis("");
    }
  };

  // Helper to find pending requests (blocks that are CREATION but don't have a matching FULFILLMENT)
  const getPendingRequests = useCallback(() => {
    const creations = chain.filter(b => b.data.action === 'CREATION' && b.index !== 0);
    const fulfillments = chain.filter(b => b.data.action === 'FULFILLMENT');
    
    // Simple logic: if NRE exists in fulfillment, it's done. 
    // (In real app, we'd check NRE uniqueness properly)
    const fulfilledNres = new Set(fulfillments.map(b => b.data.nre));
    
    return creations.filter(b => !fulfilledNres.has(b.data.nre));
  }, [chain]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-white p-6 flex flex-col shrink-0 h-screen sticky top-0">
  <div className="flex items-center gap-3 mb-10">
  {/* Logo personalizzato */}
  <img 
    src="/logo.png" 
    alt="CUPChain Logo" 
    className="w-12 h-12 object-contain bg-white rounded-lg p-1" 
  />
  <div>
    <h1 className="font-bold text-lg leading-tight">CUPChain</h1>
    <p className="text-xs text-slate-400">Ledger Sanitario</p>
  </div>
</div>

        <nav className="space-y-2 flex-1">
          <button 
            onClick={() => setView('patient')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'patient' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <PlusCircle size={20} />
            <span className="font-medium">Prenotazione</span>
          </button>
          <button 
            onClick={() => setView('hospital')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'hospital' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Stethoscope size={20} />
            <span className="font-medium">Ospedale</span>
            {getPendingRequests().length > 0 && (
              <span className="ml-auto bg-rose-500 text-white text-xs px-2 py-0.5 rounded-full">
                {getPendingRequests().length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setView('ledger')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${view === 'ledger' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Registro Pubblico</span>
          </button>
        </nav>

        <div className="pt-6 mt-6 border-t border-slate-800 space-y-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${isChainValid ? 'bg-emerald-900/30 text-emerald-400' : 'bg-red-900/30 text-red-400'}`}>
            {isChainValid ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{isChainValid ? 'Blockchain Sicura' : 'Integrità Compromessa'}</span>
          </div>

          <button 
            onClick={handleResetChain}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-rose-900/30 hover:text-rose-400 transition-colors"
          >
            <Trash2 size={16} />
            Reset Demo
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* Demo Disclaimer Banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8 flex items-start gap-3">
          <Info className="text-amber-600 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-bold text-amber-800">Ambiente Dimostrativo (Proof of Concept)</h4>
            <p className="text-sm text-amber-700 mt-1">
              Questa applicazione simula una blockchain locale nel tuo browser. I dati sono salvati nella cache locale e non sono realmente distribuiti.
              <br/>
              <strong>ATTENZIONE:</strong> Non inserire dati sanitari o personali reali (GDPR). Usa solo dati fittizi per testare il flusso.
            </p>
          </div>
        </div>

        {/* Patient View: Booking Form */}
        {view === 'patient' && (
          <div className="max-w-xl mx-auto">
             <div className="mb-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Nuova Prenotazione</h2>
              <p className="text-slate-500">Iserisci i dati della ricetta medica per registrarla nel ledger immutabile.</p>
            </div>

            <form onSubmit={handlePatientSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Codice Fiscale Paziente</label>
                <input 
                  required
                  type="text" 
                  maxLength={16}
                  value={fiscalCode}
                  onChange={(e) => setFiscalCode(e.target.value)}
                  placeholder="RSSMRA80A01H501U"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all uppercase"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">NRE (Numero Ricetta Elettronica)</label>
                <input 
                  required
                  type="text" 
                  maxLength={15}
                  value={nre}
                  onChange={(e) => setNre(e.target.value)}
                  placeholder="123456789012345"
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Tipo Esame</label>
                    <select 
                      value={examType}
                      onChange={(e) => setExamType(e.target.value)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      {EXAM_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                </div>
                <div>
                   <label className="block text-sm font-medium text-slate-700 mb-1">Priorità</label>
                    <select 
                      value={priority}
                      onChange={(e) => setPriority(e.target.value as any)}
                      className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    >
                      <option value="U">U (Urgente - 72h)</option>
                      <option value="B">B (Breve - 10gg)</option>
                      <option value="D">D (Differibile - 30/60gg)</option>
                      <option value="P">P (Programmabile)</option>
                    </select>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all transform active:scale-95 flex justify-center items-center gap-2"
              >
                {submissionStatus === 'success' ? <CheckCircle2 /> : <PlusCircle />}
                {submissionStatus === 'success' ? 'Registrata nel Blocco!' : 'Registra su Blockchain'}
              </button>
            </form>
          </div>
        )}

        {/* Hospital View: Pending List */}
        {view === 'hospital' && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Portale Ospedaliero</h2>
                <p className="text-slate-500">Gestione ed erogazione delle prestazioni in attesa.</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-bold text-indigo-600">{getPendingRequests().length}</span>
                <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">In Attesa</p>
              </div>
            </div>

            <div className="grid gap-4">
              {getPendingRequests().length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                  <CheckCircle2 size={48} className="mx-auto text-emerald-200 mb-4" />
                  <h3 className="text-lg font-medium text-slate-600">Nessuna prenotazione in attesa</h3>
                  <p className="text-slate-400">Ottimo lavoro! La lista d'attesa è vuota.</p>
                </div>
              ) : (
                getPendingRequests().map((block) => (
                  <div key={block.hash} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          block.data.priority === 'U' ? 'bg-red-100 text-red-700' : 
                          block.data.priority === 'B' ? 'bg-orange-100 text-orange-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>Priorità: {block.data.priority}</span>
                        <span className="text-slate-400 text-xs font-mono">#{block.index}</span>
                      </div>
                      <h3 className="font-bold text-lg text-slate-800">{block.data.examType}</h3>
                      <p className="text-slate-500 text-sm font-mono mt-1">CF: {block.data.fiscalCode} | NRE: {block.data.nre}</p>
                    </div>
                    <button 
                      onClick={() => handleFulfill(block)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm whitespace-nowrap flex items-center gap-2"
                    >
                      <Activity size={18} />
                      Eroga Prestazione
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Ledger View: Visual Blockchain */}
        {view === 'ledger' && (
          <div className="max-w-3xl mx-auto">
             <div className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 mb-2">Registro Distribuito</h2>
                <p className="text-slate-500">Visualizzazione trasparente di tutti i blocchi validati.</p>
              </div>
              <button 
                onClick={runAnalysis}
                disabled={isAnalyzing || chain.length <= 1}
                className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                {isAnalyzing ? (
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                ) : (
                  <Bot size={18} />
                )}
                AI Auditor
              </button>
            </div>

            {/* AI Analysis Result Box */}
            {aiAnalysis && (
              <div className="mb-10 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 p-6 rounded-xl animate-in fade-in slide-in-from-top-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Bot size={20} className="text-purple-600" />
                  </div>
                  <h3 className="font-bold text-purple-900">Analisi dell'Efficienza (Gemini AI)</h3>
                </div>
                <div className="text-slate-700 text-sm leading-relaxed prose prose-purple">
                  {aiAnalysis.split('\n').map((line, i) => <p key={i}>{line}</p>)}
                </div>
              </div>
            )}

            {/* The Chain */}
            <div className="space-y-0 relative pb-20">
              {chain.map((block, index) => (
                <BlockVisualizer 
                  key={block.hash} 
                  block={block} 
                  isLast={index === chain.length - 1} 
                />
              ))}
            </div>

            {/* Footer Stats */}
            <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-slate-200 p-4 flex justify-around text-center text-xs text-slate-500 uppercase tracking-widest z-10">
               <div>
                 <span className="block text-xl font-bold text-slate-800">{chain.length}</span>
                 Blocchi Totali
               </div>
               <div>
                 <span className="block text-xl font-bold text-slate-800">SHA-256</span>
                 Algoritmo
               </div>
               <div>
                 <span className="block text-xl font-bold text-emerald-600">{((chain.length * 0.42).toFixed(2))}s</span>
                 Avg. Block Time
               </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default App;
