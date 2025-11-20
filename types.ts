
export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface FileAttachment {
  url: string; // data URL for preview
  type: string; // Mime type e.g. 'image/jpeg'
}

export interface GroundingChunk {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}


export interface Message {
  role: Role;
  text: string;
  attachment?: FileAttachment;
  groundingMetadata?: GroundingMetadata;
}

export interface SolutionStep {
  step: number;
  description: string;
  imagePlaceholder?: string; // Descripción para una futura imagen o diagrama
}

export interface Fault {
  id: string;
  symptom: string;
  causes: string[];
  solutionSteps: SolutionStep[];
  preventionTips: string[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  section?: string;
}

export interface SavedRepair {
  id: string;
  name: string;
  machineModel: string | null;
  serialNumber: string | null;
  messages: Message[];
  timestamp: number;
}