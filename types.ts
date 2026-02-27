export type Role = 'OPERATOR' | 'KIEROWNIK' | 'GUEST';

export interface User {
  id: string;
  name: string;
  login?: string;
  role: Role;
  baseRole: Role;
  area: string;
  line: string | null;
  section: string | null;
}

export type MusterStatus = 
  | 'INICJACJA' 
  | 'OCZEKUJE_NA_ZWOLNIENIE' 
  | 'ZWOLNIONY_DO_PRODUKCJI' 
  | 'ZABLOKOWANY_NOK' 
  | 'DO_DECYZJI_KIEROWNIKA'
  | string; // For dynamic statuses like "DO_WERYFIKACJI: AOI"

export interface ChecklistItem {
  id: string;
  text: string;
  type: 'A' | 'W'; // Automatic (MES) vs Visual (Manual)
}

export interface ChecklistResult {
  [itemId: string]: 'OK' | 'NOK' | string;
}

export interface PcbResults {
  sn: string;
  [key: string]: string; // itemId -> status
}

export interface ChecklistResults {
  pcb1: PcbResults;
  pcb2: PcbResults;
  pcb3: PcbResults;
}

export interface Report5W2H {
  problem: string;
  who: string;
  what?: string;
  where?: string;
  when?: string;
  description: string;
  managerComments?: Record<string, string>;
}

export interface HistoryEntry {
  user: string;
  area: string;
  section: string;
  action: string;
  timestamp: string;
}

export interface Muster {
  id: string;
  orderId: string;
  product: string;
  sn: string; // Main SN (Leader)
  timestamp: string;
  dateObj?: Date;
  status: MusterStatus;
  
  area?: string;
  line: string;
  section: string; // Current location
  side: string; // TOP/BOT
  previousArea?: string;

  scenario: string; // ID of scenario
  reason: { id?: string; label: string; scenario?: string };
  
  checklistResults: ChecklistResults;
  report5w2h?: Report5W2H;
  
  createdBy: string;
  creationSection: string;
  verificationSteps: string[];
  
  // Track history of areas/users who worked on this
  processedBy?: HistoryEntry[];
}

export interface AreaStructure {
  lines: string[];
  sections: string[];
}

export interface SectionCapability {
  canCreate: boolean;
  canFinish: boolean;
}