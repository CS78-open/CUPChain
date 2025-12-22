import { Block, MedicalData, Status } from '../types';

export const calculateHash = async (
  index: number,
  previousHash: string,
  timestamp: number,
  data: MedicalData
): Promise<string> => {
  const message = `${index}${previousHash}${timestamp}${JSON.stringify(data)}`;
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const createGenesisBlock = async (): Promise<Block> => {
  const timestamp = Date.now();
  const data: MedicalData = {
    nre: '0000000000',
    fiscalCode: 'SYSTEM',
    priority: 'P',
    examType: 'GENESIS_BLOCK',
    action: 'CREATION',
    notes: 'Inizializzazione Sistema MediChain'
  };
  const hash = await calculateHash(0, '0', timestamp, data);
  return {
    index: 0,
    timestamp,
    data,
    previousHash: '0',
    hash,
    validator: 'SYSTEM_NODE'
  };
};

export const createBlock = async (
  lastBlock: Block,
  data: MedicalData,
  validator: string
): Promise<Block> => {
  const index = lastBlock.index + 1;
  const timestamp = Date.now();
  const hash = await calculateHash(index, lastBlock.hash, timestamp, data);
  
  return {
    index,
    timestamp,
    data,
    previousHash: lastBlock.hash,
    hash,
    validator
  };
};

export const verifyChain = async (chain: Block[]): Promise<boolean> => {
  for (let i = 1; i < chain.length; i++) {
    const currentBlock = chain[i];
    const previousBlock = chain[i - 1];

    if (currentBlock.previousHash !== previousBlock.hash) {
      return false;
    }

    const recalculatedHash = await calculateHash(
      currentBlock.index,
      currentBlock.previousHash,
      currentBlock.timestamp,
      currentBlock.data
    );

    if (currentBlock.hash !== recalculatedHash) {
      return false;
    }
  }
  return true;
};