import Dexie, { Table } from 'dexie';
import { Message, SavedRepair } from '../types';

export interface LocalRepair extends Omit<SavedRepair, 'id'> {
  id?: string;
  isSynced: boolean;
  localId?: number;
}

export interface LocalMessage extends Message {
  id?: string;
  repairId?: string;
  isSynced: boolean;
  localId?: number;
}

export class NespressoDatabase extends Dexie {
  repairs!: Table<LocalRepair>;
  messages!: Table<LocalMessage>;

  constructor() {
    super('NespressoAssistantDB');
    this.version(1).stores({
      repairs: '++localId, id, isSynced, name',
      messages: '++localId, id, isSynced, repairId',
    });
  }
}

export const db = new NespressoDatabase();
