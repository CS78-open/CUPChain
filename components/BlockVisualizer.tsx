import React from 'react';
import { Block } from '../types';
import { ShieldCheck, ArrowDown, Activity, User, FileText, Hash } from 'lucide-react';

interface BlockProps {
  block: Block;
  isLast: boolean;
}

export const BlockVisualizer: React.FC<BlockProps> = ({ block, isLast }) => {
  const date = new Date(block.timestamp).toLocaleString('it-IT');
  
  const getActionColor = (action: string) => {
    switch(action) {
      case 'CREATION': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'FULFILLMENT': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className={`w-full max-w-2xl bg-white rounded-xl border-2 shadow-sm transition-all hover:shadow-md ${block.index === 0 ? 'border-yellow-400' : 'border-slate-200'}`}>
        {/* Header */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 rounded-t-xl flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">
              BLOCCO #{block.index}
            </div>
            <span className="text-xs text-slate-500 font-mono">{date}</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-xs font-semibold text-slate-600">Validato da: {block.validator}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Dati Paziente (Crittografati)</h4>
            <div className="flex items-center gap-3">
              <User size={18} className="text-slate-400" />
              <span className="font-mono text-sm text-slate-700">{block.data.fiscalCode}</span>
            </div>
            <div className="flex items-center gap-3">
              <FileText size={18} className="text-slate-400" />
              <span className="font-mono text-sm text-slate-700">NRE: {block.data.nre}</span>
            </div>
             <div className="flex items-center gap-3">
              <Activity size={18} className="text-slate-400" />
              <span className="text-sm text-slate-700 font-medium">{block.data.examType}</span>
            </div>
          </div>

          <div className="space-y-3">
             <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Metadati BlockChain</h4>
             
             <div>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${getActionColor(block.data.action)}`}>
                  {block.data.action}
                </span>
             </div>

             <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                   <Hash size={14} className="text-slate-400" />
                   <span className="text-xs text-slate-500 font-bold">HASH CORRENTE</span>
                </div>
                <p className="text-[10px] font-mono break-all text-slate-600 leading-tight">
                  {block.hash}
                </p>
             </div>

             <div className="bg-slate-50 p-2 rounded border border-slate-100">
                <div className="flex items-center gap-2 mb-1">
                   <Hash size={14} className="text-slate-400" />
                   <span className="text-xs text-slate-500 font-bold">PREVIOUS HASH</span>
                </div>
                <p className="text-[10px] font-mono break-all text-slate-400 leading-tight">
                  {block.previousHash}
                </p>
             </div>
          </div>
        </div>
      </div>

      {!isLast && (
        <div className="h-8 border-l-2 border-dashed border-slate-300 my-1 relative">
           <ArrowDown size={16} className="absolute -bottom-2 -left-[9px] text-slate-400 bg-slate-50" />
        </div>
      )}
    </div>
  );
};