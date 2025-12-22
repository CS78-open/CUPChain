export enum Status {
  PENDING = 'IN_ATTESA',
  PROCESSING = 'IN_LAVORAZIONE',
  COMPLETED = 'EROGATA',
  CANCELLED = 'ANNULLATA'
}

export interface MedicalData {
  nre: string; // Numero Ricetta Elettronica
  fiscalCode: string; // Codice Fiscale
  priority: 'U' | 'B' | 'D' | 'P'; // Urgent, Breve, Differibile, Programmabile
  examType: string;
  notes?: string;
  action: 'CREATION' | 'UPDATE' | 'FULFILLMENT';
}

export interface Block {
  index: number;
  timestamp: number;
  data: MedicalData;
  previousHash: string;
  hash: string;
  validator: string; // ID of the node/actor who added the block
}

export interface ChainStats {
  totalBlocks: number;
  lastUpdate: number;
  pendingCount: number;
  completedCount: number;
}